import test from 'node:test';
import assert from 'node:assert/strict';
import {
  partialSayText,
  createSentenceEmitter,
  createSpeechQueue,
} from '../packages/teaching-runtime/speech-stream.mjs';
import { readInferenceResponse } from '../packages/teaching-runtime/inference-stream.mjs';
import { TeachingSession } from '../packages/teaching-runtime/session.mjs';
import { loadDirectory } from '../packages/authoring-tools/archive.mjs';
import { createCubes } from '../lessons/cube-volume/model/cubes.mjs';
const say = (text) => ({ tool: 'say', arguments: JSON.stringify({ text }) });
test('partial JSON escapes decode safely, with no early speech for scene actions', () => {
  const text = 'Count the "blue" cubes. Then look here!';
  const json = JSON.stringify({ tool: 'say', arguments: { text } });
  const out = [],
    stream = createSentenceEmitter((t) => out.push(t));
  for (let i = 0; i <= json.length; i++) stream.push(partialSayText(json.slice(0, i)));
  assert.deepEqual(out, ['Count the "blue" cubes. ']);
  assert.equal(partialSayText('{"tool":"explain_model","arguments":{"text":"Say this. '), '');
  assert.equal(partialSayText('{"tool":"say","arguments":{"text":"Hi \\u00'), 'Hi ');
  assert.equal(partialSayText('{"tool":"say","arguments":{"text":"Hi \\u0041'), 'Hi A');
});
test('speech queue avoids replay, splits fallback replies, and cancels pending sentences', async () => {
  const c = new AbortController(),
    out = [];
  const q = createSpeechQueue({ signal: c.signal, speak: async (t) => out.push(t) });
  q.push('Count this layer. ');
  await q.finish('Count this layer. Now count the layers.');
  assert.deepEqual(out, ['Count this layer.', 'Now count the layers.']);
  const fallback = createSpeechQueue({ signal: c.signal, speak: async (t) => out.push(t) });
  await fallback.finish('First sentence here. Second sentence here.');
  assert.equal(out.length, 4);
  const cancel = createSpeechQueue({
    signal: c.signal,
    speak: async (t) => {
      out.push(t);
      c.abort();
    },
  });
  cancel.push('One sentence. ');
  cancel.push('Do not say this. ');
  await cancel.settled();
  assert.equal(out.at(-1), 'One sentence.');
});
test('transport handles arbitrary UTF-8 splits and rejects incomplete or failed streams', async () => {
  const bytes = new TextEncoder().encode(
    JSON.stringify({ type: 'speech', text: 'Café cubes. ' }) +
      '\n' +
      JSON.stringify({ type: 'decision', decision: say('Café cubes. Yes.') }) +
      '\n',
  );
  const response = new Response(
    new ReadableStream({
      start(c) {
        for (const b of bytes) c.enqueue(new Uint8Array([b]));
        c.close();
      },
    }),
    { headers: { 'content-type': 'application/x-ndjson' } },
  );
  const events = [];
  assert.deepEqual(
    await readInferenceResponse(response, (e) => events.push(e)),
    say('Café cubes. Yes.'),
  );
  assert.equal(events[0].text, 'Café cubes. ');
  await assert.rejects(
    readInferenceResponse(
      new Response('{"type":"error","message":"failed"}\n', {
        headers: { 'content-type': 'application/x-ndjson' },
      }),
    ),
    /failed/,
  );
  await assert.rejects(
    readInferenceResponse(
      new Response('', { headers: { 'content-type': 'application/x-ndjson' } }),
    ),
    /without a decision/,
  );
});
test('teaching runtime starts speech before inference completes, without replay', async () => {
  const pkg = await loadDirectory('lessons/cube-volume'),
    model = createCubes();
  const spoken = [];
  let release, firstSpoken;
  const first = new Promise((r) => (firstSpoken = r));
  const session = new TeachingSession({
    pkg,
    port: { ...model, presentation: () => ({}), close() {} },
    infer: async (input, signal, onEvent) => {
      onEvent({ type: 'speech', text: 'Count this layer. ' });
      await new Promise((r) => (release = r));
      return say('Count this layer. Now count the layers.');
    },
    speak: async (t) => {
      spoken.push(t);
      firstSpoken();
    },
  });
  const turn = session.turn('Explain');
  await first;
  assert.deepEqual(spoken, ['Count this layer.']);
  release();
  await turn;
  assert.deepEqual(spoken, ['Count this layer.', 'Now count the layers.']);
  session.close();
});
test('interruption drops the rest of a streamed reply', async () => {
  const pkg = await loadDirectory('lessons/cube-volume'),
    model = createCubes();
  const spoken = [];
  let release, firstSpoken;
  const first = new Promise((r) => (firstSpoken = r));
  const session = new TeachingSession({
    pkg,
    port: { ...model, presentation: () => ({}), close() {} },
    infer: async (input, signal, onEvent) => {
      onEvent({ type: 'speech', text: 'Count this layer. ' });
      await new Promise((r) => (release = r));
      onEvent({ type: 'speech', text: 'Never speak this. ' });
      return say('Count this layer. Never speak this.');
    },
    speak: async (t) => {
      spoken.push(t);
      firstSpoken();
    },
  });
  const turn = session.turn('Explain');
  await first;
  session.cancel();
  release();
  await turn;
  assert.deepEqual(spoken, ['Count this layer.']);
  session.close();
});

test('scene change is applied before its sentence queue starts', async () => {
  const pkg = await loadDirectory('lessons/cube-volume'),
    model = createCubes();
  const before = model.snapshot().revision;
  const spoken = [];
  const session = new TeachingSession({
    pkg,
    port: { ...model, presentation: () => ({}), close() {} },
    infer: async () => ({
      tool: 'explain_model',
      arguments: JSON.stringify({
        moment: 'layer-example',
        text: 'Look at this new block. Count its layers.',
      }),
    }),
    speak: async (text) => {
      assert.ok(model.snapshot().revision > before);
      spoken.push(text);
    },
  });
  await session.turn('Explain');
  assert.deepEqual(spoken, ['Look at this new block.', 'Count its layers.']);
  session.close();
});

test('teaching session forwards synthesis preparation through its logging wrapper', async () => {
  const pkg = await loadDirectory('lessons/cube-volume');
  const model = createCubes();
  const prepared = [];
  const speak = async (text, signal, options) => assert.equal(options.prepared.text, text);
  speak.prepare = (text) => {
    prepared.push(text);
    return { text, cancel() {} };
  };
  const session = new TeachingSession({
    pkg,
    port: { ...model, presentation: () => ({}), close() {} },
    infer: async () => say('First sentence here. Second sentence here.'),
    speak,
  });
  await session.turn('Explain');
  assert.deepEqual(prepared, ['First sentence here.', 'Second sentence here.']);
  session.close();
});
