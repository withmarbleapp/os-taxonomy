import assert from 'node:assert/strict';
import { createLocalSpeech } from '../packages/voice/local-speech.mjs';
const directory = process.argv[2];
if (!directory) throw Error('Pass an existing local speech installation directory');
const voice = createLocalSpeech({ directory });
try {
  await voice.ready;
  const audio = await voice.synthesize('We can count the cubes in each layer.');
  assert.ok(audio.bytes.length > 1000);
  const text = await voice.transcribe(audio.bytes, 'audio/wav');
  assert.match(text, /cube|layer/i);
  console.log('Local synthesis and recognition passed:', text);
} finally {
  voice.close();
}
