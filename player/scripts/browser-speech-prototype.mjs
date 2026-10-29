// Real-model integration/benchmark. No LLM calls or saved user audio.
// Usage: node scripts/browser-speech-prototype.mjs /path/to/browser-compatible/models
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { chrome } from './cdp.mjs';
import { createService } from '../apps/local-service/server.mjs';
import { createModelStore, modelManifest } from '../packages/voice/model-store.mjs';
const source = resolve(process.argv[2]);
const dir = await mkdtemp(join(tmpdir(), 'marble-speech-'));
const store = createModelStore({
  directory: join(dir, 'voice-models'),
  fetcher: async (url) => {
    const file = modelManifest.files.find((f) => f.url === url);
    assert.ok(file);
    return new Response(await readFile(join(source, file.path)));
  },
});
const service = await createService({
  dataDir: dir,
  modelStore: store,
  availability: async (provider) => ({ provider, state: 'missing' }),
  inference: () => {
    throw Error('No LLM calls in speech test');
  },
});
const b = await chrome();
try {
  await b.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await b.send('Page.navigate', { url: service.origin });
  await b.until("document.querySelectorAll('.lesson-card').length===2");
  await b.evaluate("document.querySelector('#settings-open').click()");
  await b.until("document.querySelector('#claude-status').textContent==='Not installed'");
  assert.equal(
    await b.evaluate(
      "document.querySelectorAll('#settings input:not([type=radio]), #settings select').length",
    ),
    0,
  );
  await b.evaluate("document.querySelector('#connection-help').click()");
  assert.equal(await b.evaluate("document.querySelector('#provider-help').hidden"), false);
  await b.evaluate("document.querySelector('#prepare-voice').click()");
  await b.until(
    "document.querySelector('#voice-status').textContent.startsWith('Ready') || document.querySelector('#prepare-voice').textContent.startsWith('Retry')",
    90000,
  );
  console.log(
    'Voice setup:',
    await b.evaluate("document.querySelector('#voice-status').textContent"),
  );
  assert.equal(await b.evaluate("document.querySelector('#test-voice').disabled"), false);
  await b.evaluate("document.querySelector('#test-voice').click()");
  await b.until(
    "document.querySelector('#settings-status').textContent.startsWith('Voice is working')",
    15000,
  );
  const shot = await b.send('Page.captureScreenshot', { format: 'png' });
  await writeFile('/tmp/marble-settings.png', Buffer.from(shot.data, 'base64'));
  await b.evaluate(`window.report={phase:'loading'}; (async()=>{
    const {BrowserSpeech}=await import('/voice/browser-speech.mjs');
    const speech=new BrowserSpeech(); let start=performance.now(); await speech.load(); report.loadMs=performance.now()-start;
    let ticks=0;const ticker=setInterval(()=>ticks++,10);
    report.phase='synthesizing'; start=performance.now(); const blob=await speech.tts.synthWav('There are six cubes in one layer. Two layers make twelve cubes.');
    report.ttsMs=performance.now()-start; report.audioBytes=blob.size;
    report.phase='transcribing'; start=performance.now(); report.text=(await speech.transcribe(blob)).text;report.sttMs=performance.now()-start;
    clearInterval(ticker);report.uiTicks=ticks;
    report.phase='interrupting';const abort=new AbortController();const speaking=speech.speak('This speech should stop when interrupted.',abort.signal);setTimeout(()=>abort.abort(),100);
    try{await speaking;}catch(e){if(e.name!=='AbortError')throw e;}
    speech.dispose();report.phase='done';
  })().catch(e=>{report.phase='failed';report.error=e.stack;});void 0;`);
  await b.until("['done','failed'].includes(report.phase)", 90000);
  const result = await b.evaluate('report');
  console.log(JSON.stringify(result, null, 2));
  await writeFile('/tmp/marble-browser-speech-report.json', JSON.stringify(result, null, 2));
  assert.equal(result.phase, 'done');
  assert.match(result.text, /twelve|12/i);
  assert.ok(result.uiTicks > 5);
  // Reload uses persisted, verified models, with all external networking disabled.
  await b.send('Network.enable');
  await b.send('Network.setBlockedURLs', { urls: ['https://*'] });
  await b.send('Page.reload');
  await b.until("document.querySelectorAll('.lesson-card').length===2");
  await b.evaluate("document.querySelector('#settings-open').click()");
  await b.until(
    "document.querySelector('#voice-status').textContent.startsWith('Voice downloaded')",
  );
  await b.evaluate("document.querySelector('#prepare-voice').click()");
  await b.until("document.querySelector('#voice-status').textContent.startsWith('Ready')", 30000);
  assert.deepEqual(b.errors, []);
  console.log(
    'PASS: real browser workers, automatic setup, synthesis, transcription, interruption, offline reload.',
  );
} finally {
  await b.close();
  await service.close();
  await rm(dir, { recursive: true, force: true });
}
