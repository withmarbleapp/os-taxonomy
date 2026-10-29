import test from 'node:test';
import assert from 'node:assert/strict';
import { TeachingSession } from '../packages/teaching-runtime/session.mjs';
import { loadDirectory } from '../packages/authoring-tools/archive.mjs';
import { createCubes } from '../lessons/cube-volume/model/cubes.mjs';
import { infer, runProcess } from '../packages/providers/index.mjs';
const say = (text) => ({ tool: 'say', arguments: JSON.stringify({ text }) });
test('latest corrected plan supersedes old wrong work', async () => {
  const pkg = await loadDirectory('lessons/cube-volume'),
    model = createCubes({ sessionId: crypto.randomUUID() });
  const exec = (name, args) => {
    const s = model.snapshot();
    return model.execute({
      protocolVersion: 1,
      sessionId: s.sessionId,
      releaseId: s.releaseId,
      commandId: crypto.randomUUID(),
      expectedRevision: s.revision,
      name,
      args,
    });
  };
  exec('prepare_fresh_box', { difficulty: 'small' });
  for (const [k, v] of Object.entries({ perLayer: '1', layers: '1', total: '1' }))
    model.learnerEdit(k, v);
  model.learnerCommit();
  exec('reopen_plan', {});
  const s = model.snapshot().state;
  for (const [k, v] of Object.entries({
    perLayer: s.cubesPerLayer,
    layers: s.layerCount,
    total: s.totalCubes,
  }))
    model.learnerEdit(k, String(v));
  model.learnerCommit();
  let request;
  const session = new TeachingSession({
    port: { ...model, presentation: () => ({}), start: () => {}, close: () => {} },
    pkg,
    infer: async (r) => ((request = r), say('That plan is right.')),
  });
  await session.turn('I fixed my plan.');
  assert.equal(request.context.snapshot.state.attempts.at(-1).correct, true);
  assert.equal(request.context.snapshot.state.attempts.at(-1).assisted, true);
  session.close();
});
test('stale decisions are discarded after a model change', async () => {
  const pkg = await loadDirectory('lessons/cube-volume'),
    model = createCubes({ sessionId: crypto.randomUUID() });
  let count = 0;
  const spoken = [];
  const session = new TeachingSession({
    port: { ...model, presentation: () => ({}), start: () => {}, close: () => {} },
    pkg,
    infer: async () => {
      if (!count++) {
        model.learnerRotate(0.2);
        return say('Stale');
      }
      return say('Current');
    },
    speak: async (t) => spoken.push(t),
  });
  await session.turn('Look');
  assert.deepEqual(spoken, ['Current']);
  session.close();
});
test('Claude disables tools, hooks, ambient MCP without disabling subscription login', async () => {
  let invocation;
  await infer({
    settings: { provider: 'claude' },
    system: 'test',
    messages: [],
    tools: [],
    context: {},
    runner: async (...args) => (
      (invocation = args),
      JSON.stringify({ structured_output: say('Hello') })
    ),
  });
  assert.ok(invocation[1].includes('--strict-mcp-config'));
  assert.equal(invocation[1][invocation[1].indexOf('--tools') + 1], '');
  assert.equal(invocation[1].includes('--bare'), false);
});
test('cancellation kills hanging subprocess', async () => {
  const c = new AbortController();
  setTimeout(() => c.abort(), 60);
  await assert.rejects(
    runProcess(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { signal: c.signal }),
    /Cancelled/,
  );
});
test('cancel aborts authored narration before delayed playback', async () => {
  const pkg = await loadDirectory('lessons/cube-volume');
  const model = createCubes({ sessionId: crypto.randomUUID() });
  let release, signal;
  const spoken = [];
  const session = new TeachingSession({
    port: { ...model, presentation: () => ({}), start() {}, close() {} },
    pkg,
    infer: async () => say('unused'),
    speak: async (text, abortSignal) => {
      signal = abortSignal;
      await new Promise((resolve) => {
        release = resolve;
      });
      if (!signal.aborted) spoken.push(text);
    },
  });
  const pending = session.narrate('Old scene');
  session.cancel();
  assert.equal(signal.aborted, true);
  release();
  await pending;
  assert.deepEqual(spoken, []);
  session.close();
});
test('cancel prevents a queued observation turn from restarting the tutor', async () => {
  const pkg = await loadDirectory('lessons/cube-volume');
  let notify,
    calls = 0;
  const session = new TeachingSession({
    port: {
      subscribe(fn) {
        notify = fn;
        return () => {};
      },
      close() {},
    },
    pkg,
    infer: async () => {
      calls++;
      return say('Unexpected');
    },
  });
  session.started = true;
  notify({ events: [{ source: 'learner', name: pkg.teaching.observationEvents[0] }] });
  session.cancel();
  await new Promise((resolve) => setTimeout(resolve, 550));
  assert.equal(calls, 0);
  session.close();
});
