// Opens this lesson in the shared player (headless Chrome), drives the model and saves screenshots.
// Usage, from the player folder: OUT=/dir node scripts/rainbow-browser-check.mjs
// The tutor here is a fixture that only says one line: this checks the scene, not teaching.
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const PLAYER = resolve(new URL('..', import.meta.url).pathname);
const OUT = resolve(process.env.OUT ?? './artifacts/rainbow');
const LESSON = join(PLAYER, 'lessons/how-rainbows-form');
process.chdir(PLAYER);
const { createService, defaults } = await import(join(PLAYER, 'apps/local-service/server.mjs'));
const { fixtureSpeech } = await import(join(PLAYER, 'scripts/fixture-speech.mjs'));
const { pack, install } = await import(join(PLAYER, 'packages/authoring-tools/archive.mjs'));
const { chrome, wait } = await import(join(PLAYER, 'scripts/cdp.mjs'));
process.env.CHROME_PATH ??= '/usr/bin/google-chrome';
const dir = await mkdtemp(join(tmpdir(), 'rainbow-lesson-'));
await writeFile(join(dir, 'settings.json'), JSON.stringify({ ...defaults, provider: 'local', model: 'fixture', speech: true }));
void pack, install, LESSON; // the lesson is bundled with the player
const service = await createService({
  dataDir: dir,
  speech: fixtureSpeech,
  inference: async () => ({ tool: 'say', arguments: JSON.stringify({ text: 'Let’s look at the rainbow together.' }) }),
});
await mkdir(OUT, { recursive: true });
let b;
const sizes = { tablet: [1024, 768], phone: [390, 844], laptop: [1440, 900] };
try {
  b = await chrome();
  const size = async (name) => {
    const [width, height] = sizes[name];
    await b.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: name === 'phone' });
    await wait(350);
  };
  await size('tablet');
  await b.send('Page.navigate', { url: service.origin });
  await b.until("Array.from(document.querySelectorAll('.lesson-card')).some(c=>c.textContent.includes('rainbow'))");
  await b.evaluate("Array.from(document.querySelectorAll('.lesson-card')).find(c=>c.textContent.includes('rainbow')).querySelector('.lesson-open').click()");
  await b.until("document.querySelector('#status').textContent==='Ready'", 20000);
  const { targetInfos } = await b.send('Target.getTargets');
  const target = targetInfos.find((t) => t.type === 'iframe' && t.url.includes('how-rainbows-form'));
  assert.ok(target, 'lesson frame');
  const { sessionId } = await b.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  const frame = async (expression) => {
    const r = await b.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const state = () => frame('rainbowLesson.snapshot().state');
  const run = async (name, args = {}) => {
    const r = await frame(`(()=>{const s=rainbowLesson.snapshot();return rainbowLesson.model().execute({protocolVersion:1,sessionId:s.sessionId,releaseId:s.releaseId,commandId:crypto.randomUUID(),expectedRevision:s.revision,name:${JSON.stringify(name)},args:${JSON.stringify(args)}})})()`);
    assert.ok(r.accepted, `${name} ${JSON.stringify(args)}: ${r.error?.message}`);
    await wait(120);
    return r;
  };
  const shot = async (name, settle = 500) => {
    await wait(settle);
    const r = await b.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
  };
  const visible = (id) => frame(`(()=>{const e=document.getElementById('${id}');if(!e||e.hidden)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height,in:r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}})()`);
  const mustShow = async (...ids) => {
    for (const id of ids) {
      const r = await visible(id);
      assert.ok(r, `#${id} should be present`);
      assert.ok(r.in, `#${id} should be inside the viewport: ${JSON.stringify(r)}`);
      assert.ok(r.w >= 44 && r.h >= 44, `#${id} should be at least 44px`);
    }
  };
  const drag = async (id, dx, dy) => {
    const r = await visible(id);
    const ev = (type, x, y, buttons) => b.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons, clickCount: 1 });
    await ev('mousePressed', r.x, r.y, 1);
    for (let i = 1; i <= 8; i++) await ev('mouseMoved', r.x + (dx * i) / 8, r.y + (dy * i) / 8, 1);
    await ev('mouseReleased', r.x + dx, r.y + dy, 0);
    await wait(150);
  };
  const click = async (id) => {
    const r = await visible(id);
    assert.ok(r, `#${id} to click`);
    for (const type of ['mousePressed', 'mouseReleased']) await b.send('Input.dispatchMouseEvent', { type, x: r.x, y: r.y, button: 'left', buttons: 1, clickCount: 1 });
    await wait(200);
  };

  assert.equal(await frame('rainbowLesson.view().coverOpen'), true);
  await shot('01-cover-tablet', 900);
  await size('phone');
  await shot('01-cover-phone');
  await size('tablet');
  await b.evaluate("document.querySelector('#start').click()");
  await b.until("document.querySelector('#start-cover').hidden");
  await wait(600);
  assert.equal(await frame('rainbowLesson.view().coverOpen'), false);

  const both = async (name, check = async () => {}) => {
    for (const s of ['tablet', 'phone']) {
      await size(s);
      await check();
      await shot(`${name}-${s}`);
    }
    await size('tablet');
  };
  await both('02-opening');

  // Moments
  for (const m of ['sunlight_path', 'why_a_bow', 'red_on_top', 'high_sun']) {
    await run('show_moment', { moment: m });
    await both('03-moment-' + m);
  }
  await run('show_moment', { moment: 'inside_drop' });
  await shot('03-moment-inside_drop-mid-tablet', 2600);
  await wait(3500);
  await both('03-moment-inside_drop');
  await run('show_moment', { moment: 'colours_spread' });
  await wait(5500);
  await both('03-moment-colours_spread');

  // Sun and rain: tap the real objects
  await run('start_activity', { activity: 'sun_and_rain' });
  await both('04-sun_and_rain-start', () => mustShow('sun-cloud', 'water'));
  await click('water');
  assert.equal((await state()).rainbowStatus, 'rainbow');
  await shot('04-sun_and_rain-rainbow-tablet');
  await click('sun-cloud');
  assert.equal((await state()).rainbowStatus, 'no_sunlight');
  await both('04-sun_and_rain-covered', () => mustShow('sun-cloud', 'water'));

  // Turn: drag the gaze handle to the far side of Mia
  await run('start_activity', { activity: 'turn_to_find' });
  await both('05-turn-start', () => mustShow('gaze'));
  const before = (await state()).heading;
  await drag('gaze', 150, 10);
  const turned = await state();
  assert.notEqual(turned.heading, before, 'dragging the arrow turns Mia');
  await frame("document.getElementById('gaze').focus()");
  for (let i = 0; i < 30 && (await state()).rainbowStatus !== 'rainbow'; i++)
    await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 }).then(() => wait(40));
  assert.equal((await state()).rainbowStatus, 'rainbow', 'arrow keys can finish the turn');
  await both('05-turn-found');

  // Walk
  await run('start_activity', { activity: 'walk_around' });
  await both('06-walk-start', () => mustShow('mia'));
  const spot0 = (await state()).spot;
  await drag('mia', -120, 90);
  assert.notEqual((await state()).spot, spot0, 'dragging Mia walks her round');
  await shot('06-walk-partway-tablet');
  await frame('rainbowLesson.model().gesture("walk", Math.PI)');
  await both('06-walk-found');
  // Help on current work, then return
  await run('show_moment', { moment: 'inside_drop' });
  await run('resume_activity');
  assert.equal((await state()).view, 'outdoor');
  assert.ok(Math.abs((await state()).spot - Math.PI) < 1e-6);

  // Checks
  await run('start_check', { question: 'see_rainbow', situation: 'far_side' });
  await both('07-check-far_side', async () => {
    await mustShow('choice0', 'choice1', 'window-cover');
    assert.equal(await frame("document.getElementById('instruction').textContent"), 'Can Mia see a rainbow from here?');
  });
  await click('choice0');
  let s = await state();
  assert.deepEqual([s.attempts.at(-1).answer, s.attempts.at(-1).correct, s.windowCovered], ['Yes', false, false]);
  await both('07-check-far_side-answered', () => mustShow('resume'));
  await click('resume');
  await click('choice1');
  s = await state();
  assert.deepEqual([s.attempts.length, s.attempts.at(-1).correct, s.attempts.at(-1).assisted], [2, true, true]);
  for (const situation of ['cloud_over_sun', 'facing_sun', 'high_sun']) {
    await run('start_check', { question: 'see_rainbow', situation });
    await shot('07-check-' + situation + '-tablet');
    await click('choice1');
  }
  await run('start_check', { question: 'sun_where' });
  await both('07-check-sun_where', () => mustShow('choice0', 'choice1'));
  await click('choice0');
  await shot('07-check-sun_where-answered-tablet');
  await run('start_check', { question: 'drop_exit' });
  await both('07-check-drop_exit', () => mustShow('choice0', 'choice1'));
  await click('choice1');
  await shot('07-check-drop_exit-answered-tablet');
  await run('start_check', { question: 'drop_colours' });
  await both('07-check-drop_colours', () => mustShow('choice0', 'choice1'));
  await click('choice0');
  await run('start_check', { question: 'reach_rainbow' });
  await both('07-check-reach_rainbow', () => mustShow('choice0', 'choice1'));
  await run('leave_activity');

  // Drop: drag the sunbeam
  await run('start_activity', { activity: 'aim_sunbeam' });
  await both('08-aim-start', () => mustShow('beam'));
  const beam0 = (await state()).beam;
  await drag('beam', 0, -60);
  assert.ok((await state()).beam > beam0, 'dragging up raises the beam');
  await both('08-aim-high');
  await frame('rainbowLesson.model().gesture("aim", 0.15)');
  await shot('08-aim-low-tablet');

  // Sun height
  await run('start_activity', { activity: 'sun_height' });
  await both('09-sun_height-low', () => mustShow('sun'));
  await click('sun');
  await shot('09-sun_height-mid-tablet');
  await click('sun');
  assert.equal((await state()).rainbowStatus, 'sun_too_high');
  await both('09-sun_height-high', () => mustShow('sun'));

  // Transfer
  await run('start_activity', { activity: 'make_rainbow' });
  await both('10-make-start', () => mustShow('water', 'sun-cloud', 'mia', 'gaze', 'hint'));
  await click('water');
  await frame('rainbowLesson.model().gesture("walk", 0.9)');
  await both('10-make-partway', () => mustShow('water', 'mia', 'gaze'));
  await frame('rainbowLesson.model().gesture("walk", 0)');
  await frame('rainbowLesson.model().gesture("turn", Math.PI)');
  assert.equal((await state()).rainbowStatus, 'rainbow');
  await both('10-make-found');
  for (let i = 0; i < 4; i++) {
    await run('start_check', { question: 'see_rainbow', situation: 'fresh' });
    await both('11-predict-' + i, () => mustShow('choice0', 'choice1', 'hint', 'window-cover'));
    if (i === 0) {
      await click('hint');
      await shot('11-predict-0-hint-tablet');
    }
    await click('choice0');
    await shot(`11-predict-${i}-answered-tablet`);
  }
  await size('laptop');
  await run('show_moment', { moment: 'rainbow_scene' });
  await shot('12-opening-laptop');
  assert.deepEqual(b.errors, []);
  console.log('PASS: scene opens in the player; objects, drags, keys, checks, help and return work at tablet and phone widths. Fixture tutor only.');
} finally {
  await b?.close();
  await service.close();
  await rm(dir, { recursive: true, force: true });
}
