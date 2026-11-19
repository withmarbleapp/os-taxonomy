// Opens the cube lesson in the shared player (headless Chrome), drives the model and saves screenshots.
// Usage, from the player folder: OUT=/dir node scripts/cube-browser-check.mjs
// The tutor here is a fixture that only says one line: this checks the scene, not teaching.
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const PLAYER = resolve(new URL('..', import.meta.url).pathname);
const OUT = resolve(process.env.OUT ?? './artifacts/cube');
process.chdir(PLAYER);
const { createService, defaults } = await import(join(PLAYER, 'apps/local-service/server.mjs'));
const { fixtureSpeech } = await import(join(PLAYER, 'scripts/fixture-speech.mjs'));
const { chrome, wait } = await import(join(PLAYER, 'scripts/cdp.mjs'));
process.env.CHROME_PATH ??= '/usr/bin/google-chrome';
const dir = await mkdtemp(join(tmpdir(), 'cube-lesson-'));
await writeFile(join(dir, 'settings.json'), JSON.stringify({ ...defaults, provider: 'local', model: 'fixture', speech: true }));
const service = await createService({
  dataDir: dir,
  speech: fixtureSpeech,
  inference: async () => ({ tool: 'say', arguments: JSON.stringify({ text: 'Let’s count the cubes together.' }) }),
});
await mkdir(OUT, { recursive: true });
let b;
const sizes = { tablet: [1024, 768], phone: [390, 844], laptop: [1440, 900] };
try {
  b = await chrome();
  const size = async (name) => {
    const [width, height] = sizes[name];
    await b.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: name === 'phone' });
    await wait(450);
  };
  await size('tablet');
  await b.send('Page.navigate', { url: service.origin });
  const card = "Array.from(document.querySelectorAll('.lesson-card')).find(c=>c.querySelector('h2').textContent==='Volume in layers')";
  await b.until(`!!${card}`);
  await b.evaluate(`${card}.querySelector('.lesson-open').click()`);
  await b.until("document.querySelector('#status').textContent==='Ready'", 20000);
  const { targetInfos } = await b.send('Target.getTargets');
  const target = targetInfos.find((t) => t.type === 'iframe' && t.url.includes('cube-volume'));
  assert.ok(target, 'lesson frame');
  const { sessionId } = await b.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  const frame = async (expression) => {
    const r = await b.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const state = () => frame('cubeLesson.snapshot().state');
  const run = async (name, args = {}) => {
    const r = await frame(`(()=>{const s=cubeLesson.snapshot();return cubeLesson.model().execute({protocolVersion:1,sessionId:s.sessionId,releaseId:s.releaseId,commandId:crypto.randomUUID(),expectedRevision:s.revision,name:${JSON.stringify(name)},args:${JSON.stringify(args)}})})()`);
    assert.ok(r.accepted, `${name} ${JSON.stringify(args)}: ${r.error?.message}`);
    await wait(120);
    return r;
  };
  const shot = async (name, settle = 900) => {
    await wait(settle);
    const r = await b.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
  };
  const box = (id) => frame(`(()=>{const e=document.getElementById('${id}');if(!e||e.hidden||e.closest('[hidden]'))return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height,in:r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}})()`);
  const mustShow = async (...ids) => {
    for (const id of ids) {
      const r = await box(id);
      assert.ok(r, `#${id} should be present`);
      assert.ok(r.in, `#${id} should be inside the viewport: ${JSON.stringify(r)}`);
      assert.ok(r.w >= 44 && r.h >= 44, `#${id} should be at least 44px: ${JSON.stringify(r)}`);
    }
  };
  // The frame fills the player window, so frame coordinates are page coordinates.
  const mouse = (type, x, y, buttons) => b.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons, clickCount: 1 });
  const tap = async (x, y) => {
    await mouse('mousePressed', x, y, 1);
    await mouse('mouseReleased', x, y, 0);
    await wait(200);
  };
  const click = async (id) => {
    const r = await box(id);
    assert.ok(r, `#${id} to click`);
    await tap(r.x, r.y);
  };
  const dragBy = async (x, y, dx, dy) => {
    await mouse('mousePressed', x, y, 1);
    for (let i = 1; i <= 8; i++) await mouse('mouseMoved', x + (dx * i) / 8, y + (dy * i) / 8, 1);
    await mouse('mouseReleased', x + dx, y + dy, 0);
    await wait(250);
  };
  // The whole block, with its board, stays clear of the screen edges.
  const blockInView = async () => {
    const s = await state(),
      [w, d, h] = s.dims,
      [vw, vh] = await frame('[innerWidth, innerHeight]');
    for (const x of [-w / 2, w / 2])
      for (const z of [-d / 2, d / 2])
        for (const y of [0, h]) {
          const p = await frame(`cubeLesson.project(${x},${y},${z})`);
          assert.ok(p.x > 0 && p.x < vw && p.y > 0 && p.y < vh, `block corner on screen: ${JSON.stringify(p)} in ${vw}x${vh}`);
        }
  };
  const both = async (name, check = async () => {}) => {
    for (const s of ['tablet', 'phone']) {
      await size(s);
      await blockInView();
      await check();
      await shot(`${name}-${s}`);
    }
    await size('tablet');
  };

  await shot('01-cover-tablet', 1200);
  await size('phone');
  await shot('01-cover-phone');
  await size('tablet');
  await b.evaluate("document.querySelector('#start').click()");
  await b.until("document.querySelector('#start-cover').hidden");
  await wait(600);
  await both('02-opening', () => mustShow('peel', 'turn'));

  // Teaching views
  await run('show_moment', { moment: 'unit_help' });
  assert.equal(await frame('cubeLesson.view().highlightedUnit'), true);
  await both('03-unit');
  await run('show_moment', { moment: 'layers' });
  await both('03-layers');
  assert.equal(await frame('cubeLesson.view().layersVisible'), true);
  await run('show_moment', { moment: 'larger_example' });
  await both('03-inside');
  assert.equal(await frame('cubeLesson.view().highlightedInterior'), true);

  // Fill a layer by tapping the empty places, then stack and deepen.
  await run('start_activity', { activity: 'build_layer' });
  await both('04-fill-start', () => mustShow('place'));
  const first = await frame('cubeLesson.project(-1,0.5,-0.5)');
  await tap(first.x, first.y);
  assert.equal((await state()).filled.length, 1, 'tapping an empty place puts a cube there');
  while (!(await state()).layerComplete) await click('place');
  await both('04-fill-layer', () => mustShow('stack'));
  await click('stack');
  await click('stack');
  assert.deepEqual((await state()).dims, [3, 2, 3]);
  await both('04-fill-stacked', () => mustShow('deepen'));
  await click('deepen');
  assert.deepEqual((await state()).dims, [3, 3, 3]);
  await shot('04-fill-deepened-tablet');
  assert.match(await frame("document.getElementById('world').getAttribute('aria-label')"), /3 rows back and 3 layers high/, 'the description follows the block');

  // Turn by dragging and by keys; open by dragging up and by the button.
  const turn0 = (await state()).rotation;
  const mid = await frame('cubeLesson.project(0,1.5,0)');
  await dragBy(mid.x, mid.y, 140, 4);
  assert.notEqual((await state()).rotation, turn0, 'dragging sideways turns the block');
  await dragBy(mid.x, mid.y, 4, -120);
  assert.equal((await state()).layersOpen, true, 'dragging up opens the layers');
  await both('05-open');
  await click('peel');
  assert.equal((await state()).layersOpen, false);
  await frame("document.getElementById('world').focus()");
  await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 });
  await wait(150);
  assert.equal((await state()).layersOpen, true, 'the up arrow opens the layers');

  // A plan: wrong, reopened with help, then right.
  await run('start_check', { question: 'layer_plan', situation: 'small' });
  await both('06-plan', () => mustShow('perLayer', 'layers', 'total', 'commit'));
  const fill = (values) =>
    frame(`for(const [id,value] of Object.entries(${JSON.stringify(values)})){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event('input'));}document.querySelector('#plan-form').requestSubmit()`);
  let s = await state();
  await fill({ perLayer: s.cubesPerLayer, layers: s.layerCount, total: s.totalCubes + 1 });
  await wait(300);
  s = await state();
  assert.deepEqual([s.attempts.at(-1).correct, s.attempts.at(-1).assisted, s.layersOpen], [false, false, true]);
  await both('06-plan-checked');
  await run('resume_activity');
  assert.equal(await frame("document.getElementById('perLayer').disabled"), false, 'the same boxes reopen');
  await fill({ perLayer: s.cubesPerLayer, layers: s.layerCount, total: s.totalCubes });
  await wait(300);
  s = await state();
  assert.deepEqual([s.attempts.at(-1).correct, s.attempts.at(-1).assisted], [true, true]);
  for (const difficulty of ['large', 'long']) {
    // An unanswered plan has to be answered or left before another is asked.
    if ((await state()).canAnswer) await run('leave_activity');
    await run('start_check', { question: 'layer_plan', situation: difficulty });
    await both('07-plan-' + difficulty, () => mustShow('perLayer', 'layers', 'total', 'commit'));
  }
  await size('laptop');
  await shot('08-plan-laptop');
  assert.deepEqual(b.errors, []);
  console.log('PASS: scene opens in the player; teaching views, filling, stacking, turning, opening and plans work at tablet and phone widths. Fixture tutor only.');
} finally {
  await b?.close();
  await service.close();
  await rm(dir, { recursive: true, force: true });
}
