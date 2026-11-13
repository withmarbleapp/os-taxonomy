import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createService, defaults } from '../apps/local-service/server.mjs';
import { fixtureSpeech } from './fixture-speech.mjs';
import { chrome, wait } from './cdp.mjs';
const dir = await mkdtemp(join(tmpdir(), 'moon-lesson-'));
await writeFile(
  join(dir, 'settings.json'),
  JSON.stringify({ ...defaults, provider: 'local', model: 'fixture', speech: true }),
);
const say = (text) => ({ tool: 'say', arguments: JSON.stringify({ text }) });
const requests = {
  night: ['show_moment', { moment: 'night_light' }],
  daycheck: ['start_check', { question: 'day_night', situation: 'night' }],
  mooncheck: ['start_check', { question: 'moon_visible', situation: 'below' }],
  below: ['show_moment', { moment: 'daytime_without_moon' }],
  daylight: ['show_moment', { moment: 'daytime_moon' }],
  light: ['show_moment', { moment: 'light_journey' }],
  prediction: ['start_activity', { activity: 'predict_sky' }],
  path: ['start_activity', { activity: 'build_light_path' }],
  revise: ['resume_activity', {}],
  explore: ['start_activity', { activity: 'turn_earth' }],
  space: ['set_view', { view: 'space' }],
};
const service = await createService({
  dataDir: dir,
  speech: fixtureSpeech,
  inference: async ({ messages }) => {
    const last = messages.at(-1);
    if (last?.role === 'user' && requests[last.text]) {
      const [tool, args] = requests[last.text];
      return { tool, arguments: JSON.stringify(args) };
    }
    return say('Let’s explore the Moon together.');
  },
});
let b;
try {
  b = await chrome();
  await mkdir('artifacts/moon', { recursive: true });
  await b.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await b.send('Page.navigate', { url: service.origin });
  await b.until('document.querySelectorAll(".lesson-card").length===3');
  await b.evaluate(
    "Array.from(document.querySelectorAll('.lesson-card')).find(c=>c.textContent.includes('Moon’s daytime')).querySelector('.lesson-open').click()",
  );
  await b.until("document.querySelector('#status').textContent==='Ready'", 20000);
  const { targetInfos } = await b.send('Target.getTargets');
  const target = targetInfos.find((t) => t.type === 'iframe' && t.url.includes('moon-daytime'));
  assert.ok(target);
  const { sessionId } = await b.send('Target.attachToTarget', {
    targetId: target.targetId,
    flatten: true,
  });
  const frame = async (expression) => {
    const r = await b.send(
      'Runtime.evaluate',
      { expression, returnByValue: true, awaitPromise: true },
      sessionId,
    );
    if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description);
    return r.result.value;
  };
  const until = async (expression) => {
    for (let i = 0; i < 150; i++) {
      if (await frame(expression)) return;
      await wait(50);
    }
    throw Error('Moon timeout: ' + expression);
  };
  const shot = async (name) => {
    await wait(250);
    const r = await b.send('Page.captureScreenshot', { format: 'png' });
    await writeFile('artifacts/moon/' + name + '.png', Buffer.from(r.data, 'base64'));
  };
  const send = async (text) => {
    await b.evaluate(
      `document.querySelector('#type-reply').click();document.querySelector('#reply-text').value=${JSON.stringify(text)};document.querySelector('#reply-form').requestSubmit()`,
    );
    await wait(250);
  };
  const checkEarthDrag = async () => {
    await wait(150); // Let responsive camera projection and object hit areas settle.
    const rect = await frame(
      `(()=>{const r=document.querySelector('#earth').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,r:r.width/2}})()`,
    );
    for (const side of [-1, 1]) {
      const before = await frame('moonLesson.snapshot().state.theta');
      await b.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: rect.x,
        y: rect.y + side * rect.r * 0.65,
        button: 'left',
        clickCount: 1,
      });
      await b.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: rect.x + rect.r * 0.2,
        y: rect.y + side * rect.r * 0.65,
        button: 'left',
        buttons: 1,
      });
      await b.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: rect.x + rect.r * 0.2,
        y: rect.y + side * rect.r * 0.65,
        button: 'left',
        clickCount: 1,
      });
      const after = await frame('moonLesson.snapshot().state.theta');
      const delta = Math.atan2(Math.sin(after - before), Math.cos(after - before));
      assert.ok(
        side * delta > 0,
        'Earth follows a rightward drag on its ' + (side < 0 ? 'top' : 'bottom'),
      );
    }
  };
  assert.equal(await frame('moonLesson.view().coverOpen'), true);
  await shot('cover-desktop');
  await b.evaluate("document.querySelector('#start').click()");
  await b.until("document.querySelector('#start-cover').hidden");
  await until('!moonLesson.view().coverOpen');
  await wait(400);
  await shot('sky-entry-desktop');
  await send('space');
  await until("moonLesson.snapshot().state.view==='space'");
  await shot('space-desktop');
  await frame("document.querySelector('#eye').click()");
  await until("moonLesson.snapshot().state.view==='sky'");
  assert.equal(await frame('moonLesson.view().sky.moonVisible'), true);
  await shot('sky-desktop');
  await send('night');
  await until("moonLesson.snapshot().state.moment==='night_light'");
  assert.equal(await frame('moonLesson.snapshot().state.day'), false);
  assert.equal(await frame('moonLesson.view().lightSegments'), 2);
  await shot('night-light-desktop');
  await send('daycheck');
  await until("moonLesson.snapshot().state.task==='daylight'");
  assert.equal(await frame("document.querySelector('#no').textContent"), 'Night');
  await shot('supported-day-night');
  await frame("document.querySelector('#no').click()");
  await until('moonLesson.snapshot().state.revealed');
  assert.equal(await frame('moonLesson.snapshot().state.attempts.at(-1).correct'), true);
  await send('mooncheck');
  await until("moonLesson.snapshot().state.task==='prediction' && !moonLesson.snapshot().state.revealed");
  assert.equal(await frame('moonLesson.view().lightSegments'), 1);
  assert.equal(await frame("document.querySelector('#no').textContent"), 'No');
  await shot('supported-visibility');
  await frame("document.querySelector('#no').click()");
  await until('moonLesson.snapshot().state.revealed');
  assert.equal(await frame('moonLesson.snapshot().state.attempts.at(-1).correct'), true);
  await send('below');
  await until('!moonLesson.snapshot().state.moonAboveHorizon');
  await send('light');
  await until('moonLesson.snapshot().state.rays');
  assert.equal(await frame('moonLesson.view().lightSegments'), 1);
  await frame("document.querySelector('#eye').click()");
  assert.equal(await frame('moonLesson.view().sky.moonVisible'), false);
  await shot('below-desktop');
  await send('daylight');
  await until('moonLesson.snapshot().state.moonAboveHorizon');
  await send('light');
  await until('moonLesson.snapshot().state.rays');
  await until("moonLesson.view().animationPhase==='sun_to_moon'");
  await shot('light-first-leg');
  await until("moonLesson.view().animationPhase==='moon_to_explorer'");
  assert.equal(await frame('moonLesson.snapshot().state.canTurn'), false);
  await shot('light-desktop');
  await send('prediction');
  await until("moonLesson.snapshot().state.task==='prediction'");
  assert.equal(await frame("document.querySelector('#earth').hidden"), true);
  await shot('prediction-desktop');
  await frame(
    "document.querySelector(moonLesson.snapshot().state.moonAboveHorizon?'#no':'#yes').click()",
  );
  await until('moonLesson.snapshot().state.attempts.length===3');
  assert.equal(await frame('moonLesson.snapshot().state.attempts.at(-1).correct'), false);
  await shot('prediction-reveal');
  await wait(500);
  await send('revise');
  await until('!moonLesson.snapshot().state.revealed');
  await frame(
    "document.querySelector(moonLesson.snapshot().state.moonAboveHorizon?'#yes':'#no').click()",
  );
  assert.equal(await frame('moonLesson.snapshot().state.attempts.at(-1).assisted'), true);
  await wait(500);
  await send('path');
  await until("moonLesson.snapshot().state.task==='path'");
  await frame(
    "document.querySelector('#sun').click();document.querySelector('#moon').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));document.querySelector('#observer').click()",
  );
  await until('moonLesson.snapshot().state.path.length===3');
  await shot('path-desktop');
  await frame("document.querySelector('#check-path').click()");
  assert.equal(await frame('moonLesson.snapshot().state.attempts.at(-1).correct'), true);
  await wait(500);
  await send('explore');
  await until('moonLesson.snapshot().state.canTurn');
  await checkEarthDrag();
  const theta = await frame('moonLesson.snapshot().state.theta');
  await frame(
    "document.querySelector('#earth').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}))",
  );
  assert.notEqual(await frame('moonLesson.snapshot().state.theta'), theta);
  await b.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await checkEarthDrag();
  await shot('space-mobile');
  await frame("document.querySelector('#eye').click()");
  await shot('sky-mobile');
  await send('path');
  await until("moonLesson.snapshot().state.task==='path'");
  await shot('path-mobile');
  const currentScene=await frame('moonLesson.snapshot().state.sceneId');
  await frame("document.querySelector('#sun').click()");
  await frame("document.querySelector('#hint').click()");
  await until("moonLesson.snapshot().state.mode==='demonstration'");
  assert.equal(await frame("document.querySelector('#pathTools').hidden"),true);
  await shot('light-help-mobile');
  await frame("document.querySelector('#resume').click()");
  await until("moonLesson.snapshot().state.mode==='activity'");
  assert.equal(await frame('moonLesson.snapshot().state.sceneId'),currentScene);
  assert.deepEqual(await frame('moonLesson.snapshot().state.path'),['sun']);
  assert.equal(await frame('moonLesson.snapshot().state.assisted'),true);

  for (const selector of ['#actions', '#explanation', '#pathTools'])
    assert.equal(
      await frame(
        `(()=>{const r=document.querySelector('${selector}').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()`,
      ),
      true,
      selector,
    );
  await b.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await shot('resize-back');
  await b.evaluate("document.querySelector('#home').click()");
  await b.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await b.evaluate(
    "Array.from(document.querySelectorAll('.lesson-card')).find(c=>c.textContent.includes('Moon’s daytime')).querySelector('.lesson-open').click()",
  );
  await b.until("document.querySelector('#status').textContent==='Ready'");
  await shot('cover-mobile');
  assert.deepEqual(b.errors, []);
  console.log(
    'PASS: Moon SDK, actual scene transitions, sky geometry, prediction correction, light path, direct controls and responsive layouts. Synthetic tutor only.',
  );
} finally {
  await b?.close();
  await service.close();
  await rm(dir, { recursive: true, force: true });
}
