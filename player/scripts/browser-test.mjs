import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fixtureSpeech } from './fixture-speech.mjs';
import { createService, defaults } from '../apps/local-service/server.mjs';
import { pack, install } from '../packages/authoring-tools/archive.mjs';
import { chrome, wait } from './cdp.mjs';
const dir = await mkdtemp(join(tmpdir(), 'marble-browser-'));
await writeFile(
  join(dir, 'settings.json'),
  JSON.stringify({
    ...defaults,
    provider: 'local',
    model: 'fixture',
    speech: true,
    speechDirectory: 'fixture',
  }),
);
const imported = await install(
  await pack('packages/authoring-tools/template'),
  join(dir, 'library'),
);
const importedAdapter = join(imported.directory, 'adapter.mjs');
await writeFile(
  importedAdapter,
  `window.addEventListener('message', e => { if (e.ports[0]) window.forgedPort = e.ports[0]; });\n` +
    (await readFile(importedAdapter, 'utf8')),
);
let transcriptions = 0,
  deviceDownloaded = false;
const seen = [],
  say = (text) => ({ tool: 'say', arguments: JSON.stringify({ text }) });
const service = await createService({
    dataDir: dir,
    inferenceStore: {
      path: '/unused',
      inspect: async () => ({
        state: deviceDownloaded ? 'ready' : 'not_installed',
        total: 2740937888,
        loaded: 0,
      }),
      prepare: () => {
        deviceDownloaded = true;
        return { state: 'ready' };
      },
      close() {},
    },
    deviceEngine: { infer: async () => say('ready'), close() {} },
    availability: async (provider) => ({ provider, state: 'missing' }),
    speech: {
      ...fixtureSpeech,
      transcribe: async () => {
        transcriptions++;
        return 'A fixture voice answer.';
      },
    },
    inference: async ({ context, messages, onEvent }) => {
      if (!context.snapshot) return say('ready');
      seen.push(structuredClone(context));
      const last = messages.at(-1),
        s = context.snapshot.state;
      if (s.dims) {
        if (last?.role === 'user' && /new block/i.test(last.text))
          return { tool: 'prepare_fresh_box', arguments: '{"difficulty":"small"}' };
        if (context.origin === 'observation' && s.attempts.at(-1)?.correct === false && !s.assisted)
          return { tool: 'reopen_plan', arguments: '{}' };
        if (s.attempts.at(-1)?.correct)
          onEvent?.({ type: 'speech', text: 'Your corrected plan is right.' });
        return say(
          s.attempts.at(-1)?.correct
            ? 'Your corrected plan is right.'
            : 'Let’s explore the cubes together.',
        );
      }
      return say('Let’s explore what is visible now.');
    },
  }),
  b = await chrome();
const frameSessions = new Map();
const frameEval = async (expression) => {
  const { targetInfos } = await b.send('Target.getTargets');
  const target = targetInfos.find(
    (t) => t.type === 'iframe' && t.url.startsWith(service.origin + '/content/'),
  );
  if (!target) throw Error('No lesson frame target');
  const { sessionId } = await b.send('Target.attachToTarget', {
    targetId: target.targetId,
    flatten: true,
  });
  const r = await b.send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description);
  return r.result.value;
};
const launch = async (title) => {
  await b.evaluate(
    `Array.from(document.querySelectorAll('.lesson-card')).find(c=>c.querySelector('h2').textContent===${JSON.stringify(title)}).querySelector('button').click()`,
  );
  await b.until("document.querySelector('#status').textContent==='Ready'", 20000);
  if (title === 'Volume in layers') {
    assert.equal(
      await b.evaluate("document.querySelector('#start-title').textContent"),
      'How much space does a block fill?',
    );
    assert.equal(
      await b.evaluate("getComputedStyle(document.querySelector('#start-cover')).backgroundColor"),
      'rgba(0, 0, 0, 0)',
    );
    await shot('cube-title');
  }
  if (title === 'Croatoan clues') {
    assert.equal(
      await b.evaluate("document.querySelector('#start-title').textContent"),
      'Where did the Roanoke settlers go?',
    );
    assert.equal(await frameEval("document.querySelector('.cover-art').hidden"), false);
    await shot('roanoke-title');
  }
  await b.evaluate("document.querySelector('#start').click()");
  await b.until("document.querySelector('#messages').textContent.length>0");
};
const space = (type) =>
  b.send('Input.dispatchKeyEvent', { type, key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
const holdAndSend = async () => {
  const before = transcriptions;
  const messagesBefore = await b.evaluate("document.querySelectorAll('#messages .learner').length");
  await space('keyDown');
  await b.until("document.querySelector('#ptt').getAttribute('aria-pressed')==='true'");
  await wait(180);
  await space('keyUp');
  await b.until(`document.querySelectorAll('#messages .learner').length>=${messagesBefore + 1}`);
  assert.equal(transcriptions, before + 1);
};
const shot = async (name) => {
  await wait(300);
  const r = await b.send('Page.captureScreenshot', { format: 'png' });
  await writeFile('artifacts/' + name + '.png', Buffer.from(r.data, 'base64'));
};
try {
  await b.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await b.send('Page.navigate', { url: service.origin });
  await b.until('document.querySelectorAll(".lesson-card").length===3');
  await mkdir('artifacts', { recursive: true });
  await launch('Volume in layers');
  await b.until("document.querySelector('#walkie-chassis').dataset.phase==='idle'");
  await holdAndSend();
  await frameEval("document.querySelector('canvas').focus()");
  await holdAndSend();
  await b.evaluate("document.querySelector('#lesson-menu').click()");
  const beforeMenu = transcriptions;
  await space('keyDown');
  await space('keyUp');
  await wait(100);
  assert.equal(transcriptions, beforeMenu);
  assert.equal(
    await b.evaluate("document.querySelector('#ptt').getAttribute('aria-pressed')"),
    'false',
  );
  await b.evaluate("document.querySelector('[data-close=conversation]').click()");
  await b.evaluate("document.querySelector('#type-reply').click()");
  await b.until("document.querySelector('#compose').open");
  const beforeTyping = transcriptions;
  await space('keyDown');
  await space('keyUp');
  assert.equal(transcriptions, beforeTyping);
  await b.evaluate(
    "document.querySelector('#reply-text').value='Can we count together?';document.querySelector('#reply-form').requestSubmit()",
  );
  await b.until(
    "document.querySelector('#messages').textContent.includes('Can we count together?')",
  );
  assert.equal(await b.evaluate("document.querySelector('#compose').open"), false);
  await b.evaluate("document.querySelector('#walkie-settings').click()");
  assert.equal(await b.evaluate("document.querySelector('#settings').open"), true);
  await b.evaluate("document.querySelector('[data-close=settings]').click()");
  assert.equal(await b.evaluate("!!document.querySelector('#stop')"), false);
  assert.equal(
    await b.evaluate("getComputedStyle(document.querySelector('#status')).clipPath"),
    'inset(50%)',
  );
  await shot('cubes');
  assert.equal(
    await b.evaluate(
      "!!document.querySelector('#player header, #player footer, #text-form, #write')",
    ),
    false,
  );
  assert.equal(
    await b.evaluate(
      "document.querySelector('#scene').getBoundingClientRect().height===innerHeight",
    ),
    true,
  );
  await frameEval("document.querySelector('#fresh').click()");
  await wait(700);
  assert.equal(await frameEval("document.getElementById('plan-controls').hidden"), false);
  await frameEval("document.querySelector('#perLayer').focus()");
  const beforeInput = transcriptions;
  await space('keyDown');
  await space('keyUp');
  await wait(100);
  assert.equal(transcriptions, beforeInput);
  assert.equal(
    await b.evaluate("document.querySelector('#ptt').getAttribute('aria-pressed')"),
    'false',
  );

  await frameEval(
    "for(const id of ['perLayer','layers','total']){const e=document.getElementById(id);e.value='1';e.dispatchEvent(new Event('input'));}document.querySelector('#plan-form').requestSubmit()",
  );
  await wait(1200);
  assert.equal(await frameEval("document.getElementById('total').disabled"), false);
  const state = seen.at(-1).snapshot.state;
  await frameEval(
    `for(const [id,value] of Object.entries(${JSON.stringify({ perLayer: state.cubesPerLayer, layers: state.layerCount, total: state.totalCubes })})){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event('input'));}document.querySelector('#plan-form').requestSubmit()`,
  );
  await b.until(
    "document.querySelector('#messages').textContent.includes('corrected plan is right')",
  );
  assert.equal(seen.at(-1).snapshot.state.attempts.at(-1).assisted, true);
  await shot('cubes-corrected');
  await b.evaluate("document.querySelector('#home').click()");
  await launch('Croatoan clues');
  await b.until("document.querySelector('#instruction').textContent===''");
  assert.equal(await frameEval("document.querySelector('.intro-stage').hidden"), false);
  await shot('roanoke');
  await frameEval("document.querySelector('[data-leave-intro]').click()");
  await b.until(
    "document.querySelector('#instruction').textContent==='Choose a place to investigate.'",
  );
  await frameEval("document.querySelector('[data-place=fort]').click()");
  await wait(700);
  const source = await frameEval(
    "const b=document.querySelector('[data-source]');b.click();b.dataset.source",
  );
  await wait(850);
  assert.equal(seen.at(-1).snapshot.state.activeSource, source);
  await shot('roanoke-source');
  await b.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await shot('roanoke-source-mobile');
  assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'), true);
  await b.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await frameEval("document.querySelector('[data-close-source]').click()");
  await wait(850);
  assert.equal(seen.at(-1).snapshot.state.activeSource, '');
  assert.equal(seen.at(-1).snapshot.state.scene, 'fort');
  await b.evaluate("document.querySelector('#home').click()");
  await launch('Equal parts');
  const beforeForgery = transcriptions;
  await frameEval("window.forgedPort.postMessage({type:'shortcut',action:'talk_start'})");
  await wait(200);
  assert.equal(
    await b.evaluate("document.querySelector('#ptt').getAttribute('aria-pressed')"),
    'false',
  );
  await frameEval("window.forgedPort.postMessage({type:'shortcut',action:'talk_end'})");
  await wait(200);
  assert.equal(transcriptions, beforeForgery);
  // Player-owned Space remains available for imported lessons.
  await b.evaluate("document.querySelector('#ptt').focus()");
  await holdAndSend();
  await frameEval(
    "const e=document.querySelector('input');e.value='4';e.dispatchEvent(new Event('input'));document.querySelector('form').requestSubmit()",
  );
  await wait(800);
  assert.equal(seen.at(-1).snapshot.state.currentAttempt.correct, true);
  assert.equal(
    await b.evaluate("document.querySelector('#scene').getAttribute('sandbox')"),
    'allow-scripts allow-forms',
  );
  assert.deepEqual(b.errors, []);
  await b.evaluate("document.querySelector('#settings-open').click()");
  await b.until("document.querySelector('#device-status').textContent==='Download needed'");
  await b.evaluate("document.querySelector('[value=device]').click()");
  await b.until("!document.querySelector('#device-setup').hidden");
  await b.evaluate("document.querySelector('#prepare-device').click()");
  await b.until("document.querySelector('#device-status').textContent==='Connected'");
  const configAfter = await b.evaluate(
    "fetch('/api/config').then(r=>r.json()).then(c=>c.settings)",
  );
  assert.equal(configAfter.provider, 'device');
  assert.equal(
    await b.evaluate(
      "document.querySelectorAll('[value=ollama],[value=lmstudio],#local-model').length",
    ),
    0,
  );
  await b.evaluate("document.querySelector('[data-close=settings]').click()");
  await b.evaluate("document.querySelector('#settings-open').click()");
  await b.until("document.querySelector('[value=device]').checked");
  assert.deepEqual(b.errors, []);
  await shot('local-settings');
  console.log(
    'PASS: cube wrong→correct revision; Roanoke source→scene focus; imported third lesson; isolated frames; Space in player/scene, ignored in inputs and menus.',
  );
} catch (e) {
  console.error('Browser errors', b.errors);
  console.error(
    'Seen states',
    seen.map((c) => ({
      origin: c.origin,
      revision: c.snapshot.revision,
      plan: c.snapshot.state.plan,
      attempt: c.snapshot.state.attempts?.at(-1),
    })),
  );
  console.error('Frame', await frameEval('document.body.innerText').catch((e) => e.message));
  await shot('failure');
  console.error(await b.evaluate('document.body.innerText'));
  throw e;
} finally {
  await b.close();
  await service.close();
  await rm(dir, { recursive: true, force: true });
}
