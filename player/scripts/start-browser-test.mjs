import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createService, defaults } from '../apps/local-service/server.mjs';
import { fixtureSpeech } from './fixture-speech.mjs';
import { chrome } from './cdp.mjs';

const dir = await mkdtemp(join(tmpdir(), 'marble-start-'));
await writeFile(
  join(dir, 'settings.json'),
  JSON.stringify({ ...defaults, provider: 'local', model: 'fixture', speech: true }),
);
let starts = 0;
const service = await createService({
  dataDir: dir,
  speech: fixtureSpeech,
  inference: async () => {
    starts++;
    return { tool: 'say', arguments: '{"text":"Let us explore this lesson."}' };
  },
});
let b;
try {
  b = await chrome();
  // Exercise the real player and Settings continuation with controllable voice
  // and microphone delays, without downloading speech models.
  await b.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (...args) => {
        if (args[0] === '/api/voice-prepare') return Response.json({state:'ready'});
        const response = await originalFetch(...args);
        if (args[0] !== '/api/config') return response;
        const config = await response.json();
        config.speechBackend = 'browser';
        return Response.json(config);
      };
    `,
  });
  for (const stage of ['voice', 'microphone', 'microphone-error']) {
    await b.send('Page.navigate', { url: service.origin });
    await b.until('document.querySelectorAll(".lesson-card").length===3');
    await b.evaluate(`(async () => {
      window.stoppedTracks = 0;
      window.microphoneRequests = 0;
      const {BrowserSpeech} = await import('/voice/browser-speech.mjs');
      BrowserSpeech.prototype.load = async function () {
        if (${JSON.stringify(stage)} === 'voice')
          await new Promise(resolve => window.releaseStart = resolve);
        this.ready = true;
      };
      BrowserSpeech.prototype.prepare = () => ({cancel(){}});
      BrowserSpeech.prototype.speak = async () => {};
      navigator.mediaDevices.getUserMedia = async () => {
        window.microphoneRequests++;
        if (${JSON.stringify(stage)} !== 'voice')
          await new Promise((resolve, reject) => {
            window.releaseStart = () => ${JSON.stringify(stage)} === 'microphone-error'
              ? reject(new DOMException('Denied', 'NotAllowedError')) : resolve();
          });
        return {getTracks: () => [{stop(){window.stoppedTracks++}}]};
      };
      document.querySelector('.lesson-open').click();
    })()`);
    await b.until("document.querySelector('#status').textContent==='Ready'");
    await b.evaluate("document.querySelector('#start').click()");
    await b.until("typeof window.releaseStart==='function'");
    await b.evaluate(`
      document.querySelector('#home').click();
      document.querySelectorAll('.lesson-open')[1].click();
    `);
    await b.until("document.querySelector('#status').textContent==='Ready'");
    // Both covers prepare an opening without speaking or starting a scene.
    await b.until("document.querySelector('#messages').textContent.length===0");
    for (let i = 0; i < 100 && starts < 2; i++)
      await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(starts, 2);
    const prepared = starts;
    const label = await b.evaluate("document.querySelector('#start').textContent");
    await b.evaluate('window.releaseStart()');
    // A subsequent browser task runs after the released continuation's microtasks.
    assert.equal(await b.evaluate("document.querySelector('#start-cover').hidden"), false);
    assert.equal(await b.evaluate("document.querySelector('#talk-controls').hidden"), true);
    assert.equal(await b.evaluate("document.querySelector('#settings').open"), false);
    assert.equal(await b.evaluate("document.querySelector('#start').disabled"), false);
    assert.equal(await b.evaluate("document.querySelector('#start').textContent"), label);
    assert.equal(await b.evaluate('window.stoppedTracks'), stage === 'microphone' ? 1 : 0);
    assert.equal(await b.evaluate('window.microphoneRequests'), stage === 'voice' ? 0 : 1);
    assert.equal(starts, prepared);
    // The replacement lesson still starts when the learner explicitly presses Start.
    await b.evaluate('navigator.mediaDevices.getUserMedia = async () => ({getTracks:()=>[]})');
    await b.evaluate("document.querySelector('#start').click()");
    await b.until("document.querySelector('#start-cover').hidden");
    await b.until("document.querySelector('#messages').textContent.length>0");
    // onStart can change scene state, requiring a fresh opening.
    assert.ok(starts === prepared || starts === prepared + 1);
    starts = 0;
  }
  assert.deepEqual(b.errors, []);
  console.log(
    'PASS: departed lesson startup stops after voice setup, microphone access and errors.',
  );
} finally {
  await b?.close();
  await service.close();
  await rm(dir, { recursive: true, force: true });
}
