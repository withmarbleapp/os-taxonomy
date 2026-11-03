import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createService, defaults } from '../apps/local-service/server.mjs';
import { chrome, wait } from './cdp.mjs';
const directory = process.argv[2];
if (!directory) throw Error('Supply the existing local speech installation');
const dir = await mkdtemp(join(tmpdir(), 'marble-audio-'));
await writeFile(
  join(dir, 'settings.json'),
  JSON.stringify({
    ...defaults,
    provider: 'local',
    model: 'fixture',
    speech: true,
    speechDirectory: directory,
  }),
);
const service = await createService({
  dataDir: dir,
  inference: async () => ({
    tool: 'say',
    arguments: JSON.stringify({ text: 'Let us count each layer together.' }),
  }),
});
let b;
try {
  const response = await fetch(service.origin + '/api/speak', {
    method: 'POST',
    headers: {
      origin: service.origin,
      'x-marble-token': service.token,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ text: 'We can count each layer together.' }),
  });
  assert.equal(response.status, 200);
  const audioFile = join(dir, 'fixture.wav');
  await writeFile(audioFile, Buffer.from(await response.arrayBuffer()));
  b = await chrome({ audioFile });
  await b.send('Page.navigate', { url: service.origin });
  await b.until('document.querySelectorAll(".lesson-card").length===2');
  await b.evaluate(
    "document.querySelector('#settings-open').click();document.querySelector('#test-voice').click()",
  );
  await b.until(
    "document.querySelector('#settings-status').textContent.includes('Playing a test message')",
    30000,
  );
  await b.evaluate(
    "document.querySelector('[data-close=settings]').click();Array.from(document.querySelectorAll('.lesson-card')).find(c=>c.textContent.includes('Volume in layers')).querySelector('button').click()",
  );
  await b.until("document.querySelector('#status').textContent==='Ready'");
  await b.evaluate("document.querySelector('#start').click()");
  await b.until("document.querySelector('#messages').textContent.length>0");
  await b.until("document.querySelector('#status').textContent===''", 30000);
  await b.evaluate("document.querySelector('#ptt').focus()");
  await b.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: ' ',
    code: 'Space',
    windowsVirtualKeyCode: 32,
  });
  await wait(3800);
  await b.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: ' ',
    code: 'Space',
    windowsVirtualKeyCode: 32,
  });
  await b.until("document.querySelector('#messages .learner')?.textContent.length>0", 30000);
  const transcript = await b.evaluate("document.querySelector('#messages .learner').textContent");
  assert.match(transcript, /count|layer/i);
  assert.deepEqual(b.errors, []);
  console.log(
    'PASS: local test playback, browser microphone capture, recognition and conversation delivery:',
    transcript,
  );
} finally {
  if (b) await b.close();
  await service.close();
  await rm(dir, { recursive: true, force: true });
}
