import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createClaudeSessions, conversationDelta } from '../packages/providers/claude-session.mjs';

const say = { name: 'say', inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'], additionalProperties: false } };
const show = { name: 'show', inputSchema: { type: 'object', properties: { moment: { type: 'string' } }, required: ['moment'], additionalProperties: false } };
const records = {
  understanding: {
    type: 'array',
    maxItems: 3,
    items: { type: 'object', properties: { focus: { enum: ['light'] }, interpretation: { enum: ['understood'] }, evidence: { type: 'string' } }, required: ['focus', 'interpretation', 'evidence'], additionalProperties: false },
  },
};
const tick = () => new Promise((r) => setImmediate(r));

// A stand-in for the claude CLI in stream-json mode. `reply(message, child)`
// decides what the process prints for each line it receives.
function fakeClaude(reply) {
  const spawned = [];
  const spawnProcess = (command, args) => {
    const child = new EventEmitter();
    child.args = args;
    child.inputs = [];
    child.stdout = new EventEmitter();
    child.stdout.setEncoding = () => {};
    child.stderr = { resume() {} };
    child.stdin = Object.assign(new EventEmitter(), {
      write(line) {
        const message = JSON.parse(line);
        child.inputs.push(message);
        setImmediate(() => reply(message, child));
      },
      end() {},
    });
    child.kill = () => {
      if (!child.killed) setImmediate(() => child.emit('close', null));
      child.killed = true;
    };
    child.print = (...values) => child.stdout.emit('data', values.map((v) => JSON.stringify(v) + '\n').join(''));
    child.decide = (decision) =>
      child.print(
        { type: 'stream_event', event: { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', name: 'StructuredOutput' } } },
        { type: 'stream_event', event: { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: JSON.stringify(decision) } } },
        { type: 'result', subtype: 'success', is_error: false, structured_output: decision },
      );
    spawned.push(child);
    return child;
  };
  return { spawned, spawnProcess };
}
const userText = (m) => m.message.content[0].text;
const base = (extra = {}) => ({
  key: 'lesson@1:session-a',
  settings: { model: 'claude-haiku-5-5' },
  system: 'LESSON SYSTEM',
  tools: [say],
  standingTools: [say, show],
  records,
  context: { snapshot: { revision: 0 } },
  ...extra,
});

test('conversationDelta appends, follows a sliding window and falls back to replacement', () => {
  const j = (xs) => xs.map((m) => JSON.stringify(m));
  const a = { role: 'user', text: 'a' }, b = { role: 'assistant', text: 'b' }, c = { role: 'user', text: 'c' };
  assert.deepEqual(conversationDelta(j([a, b]), [a, b, c]), { replace: false, items: [c], next: j([a, b, c]) });
  assert.deepEqual(conversationDelta(j([a, b]), [a, b]).items, []);
  // The window moved forward by one entry and gained one.
  assert.deepEqual(conversationDelta(j([a, b]), [b, c]), { replace: false, items: [c], next: j([b, c]) });
  // An earlier entry changed: nothing lines up except an empty overlap.
  const changed = conversationDelta(j([a, b]), [{ role: 'user', text: 'A' }, b]);
  assert.equal(changed.replace, true);
  assert.equal(changed.items.length, 2);
  assert.deepEqual(conversationDelta([], [a]).items, [a]);
});

test('the lesson is sent once; later decisions send only what is new, in one process', async () => {
  const { spawned, spawnProcess } = fakeClaude((message, child) => {
    if (message.type !== 'user') return;
    child.decide(
      child.inputs.filter((m) => m.type === 'user').length === 1
        ? { tool: 'say', arguments: { text: 'Hello there.' }, understanding: [] }
        : { tool: 'say', arguments: { text: 'Yes, it does.' }, understanding: [{ focus: 'light', interpretation: 'understood', evidence: 'said so' }, { focus: 'nope' }] },
    );
  });
  const sessions = createClaudeSessions({ spawnProcess });
  const heard = [];
  const m1 = [{ role: 'user', text: 'Hi' }];
  const first = await sessions.infer(base({ messages: m1, onEvent: (e) => heard.push(e.text) }));
  assert.deepEqual(first, { tool: 'say', arguments: '{"text":"Hello there."}' });
  const m2 = [...m1, { role: 'assistant', text: 'Hello there.' }, { role: 'user', text: 'Light bounces.' }];
  const second = await sessions.infer(base({ messages: m2, context: { snapshot: { revision: 1 } } }));
  assert.deepEqual(second.understanding, [{ focus: 'light', interpretation: 'understood', evidence: 'said so' }]);
  assert.equal(spawned.length, 1);
  const [one, two] = spawned[0].inputs.map(userText);
  assert.match(one, /LESSON SYSTEM/);
  assert.match(one, /"tools":\[/);
  assert.doesNotMatch(two, /LESSON SYSTEM/);
  const sent = JSON.parse(two.split('\n')[0]);
  assert.deepEqual(sent.newMessages, m2.slice(1));
  assert.deepEqual(sent.availableTools, ['say']);
  assert.equal(sent.context.snapshot.revision, 1);
  const args = spawned[0].args;
  assert.equal(args[args.indexOf('--effort') + 1], 'low');
  assert.equal(args[args.indexOf('--input-format') + 1], 'stream-json');
  assert.deepEqual(JSON.parse(args[args.indexOf('--json-schema') + 1]).properties.tool.enum, ['say', 'show']);
  sessions.closeAll();
  await tick();
  assert.equal(sessions.size, 0);
});

test('an aborted decision interrupts the process, and the next one waits for it to settle', async () => {
  let pendingChild;
  const { spawned, spawnProcess } = fakeClaude((message, child) => {
    const users = child.inputs.filter((m) => m.type === 'user').length;
    if (message.type === 'control_request') {
      // The interrupted turn reports its end a little later.
      setTimeout(() => child.print({ type: 'result', subtype: 'error_during_execution', is_error: true }), 20);
      return;
    }
    if (users === 1) child.decide({ tool: 'say', arguments: { text: 'One.' }, understanding: [] });
    else if (users === 2) pendingChild = child; // never answers until interrupted
    else child.decide({ tool: 'say', arguments: { text: 'Three.' }, understanding: [] });
  });
  const sessions = createClaudeSessions({ spawnProcess });
  await sessions.infer(base({ messages: [] }));
  const controller = new AbortController();
  const abandoned = sessions.infer(base({ messages: [{ role: 'user', text: 'two' }], signal: controller.signal }));
  await tick();
  await tick();
  assert.ok(pendingChild);
  const next = sessions.infer(base({ messages: [{ role: 'user', text: 'two' }, { role: 'user', text: 'three' }] }));
  controller.abort();
  await assert.rejects(abandoned, /Cancelled/);
  assert.deepEqual((await next).arguments, '{"text":"Three."}');
  const inputs = spawned[0].inputs;
  assert.deepEqual(inputs.map((m) => m.type), ['user', 'user', 'control_request', 'user']);
  assert.equal(inputs[2].request.subtype, 'interrupt');
  // The third message was written only after the interrupted turn had ended.
  assert.deepEqual(JSON.parse(userText(inputs[3]).split('\n')[0]).newMessages, [{ role: 'user', text: 'three' }]);
  assert.equal(spawned.length, 1);
  sessions.closeAll();
});

test('a tool the scene does not offer is asked for again once', async () => {
  const { spawned, spawnProcess } = fakeClaude((message, child) => {
    if (message.type !== 'user') return;
    const users = child.inputs.filter((m) => m.type === 'user').length;
    child.decide(users === 1 ? { tool: 'show', arguments: { moment: 'x' }, understanding: [] } : { tool: 'say', arguments: { text: 'Look here.' }, understanding: [] });
  });
  const sessions = createClaudeSessions({ spawnProcess });
  const decision = await sessions.infer(base({ messages: [] }));
  assert.equal(decision.tool, 'say');
  assert.match(userText(spawned[0].inputs[1]), /not available in the current scene/);
  sessions.closeAll();
});

test('a process that exits is replaced, and the replacement is given the whole lesson again', async () => {
  const { spawned, spawnProcess } = fakeClaude((message, child) => {
    if (message.type === 'user') child.decide({ tool: 'say', arguments: { text: 'Hi.' }, understanding: [] });
  });
  const sessions = createClaudeSessions({ spawnProcess });
  await sessions.infer(base({ messages: [] }));
  spawned[0].emit('close', 1);
  await sessions.infer(base({ messages: [{ role: 'user', text: 'again' }] }));
  assert.equal(spawned.length, 2);
  assert.match(userText(spawned[1].inputs[0]), /LESSON SYSTEM/);
  sessions.closeAll();
});

test('a different lesson session gets its own process, and the oldest is closed beyond the limit', async () => {
  const { spawned, spawnProcess } = fakeClaude((message, child) => {
    if (message.type === 'user') child.decide({ tool: 'say', arguments: { text: 'Hi.' }, understanding: [] });
  });
  const sessions = createClaudeSessions({ spawnProcess, maxSessions: 2 });
  for (const key of ['a', 'b', 'c']) await sessions.infer(base({ key, messages: [] }));
  assert.equal(spawned.length, 3);
  assert.equal(sessions.size, 2);
  assert.equal(spawned[0].killed, true);
  sessions.closeAll();
});

test('the service routes Claude decisions to the lesson session and passes records through', async () => {
  const { mkdtemp, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { createService } = await import('../apps/local-service/server.mjs');
  const { createMoon } = await import('../lessons/moon-daytime/model/moon.mjs');
  const dir = await mkdtemp(join(tmpdir(), 'marble-claude-session-'));
  await writeFile(join(dir, 'settings.json'), JSON.stringify({ provider: 'claude' }));
  const seen = [];
  let closed = 0;
  const service = await createService({
    dataDir: dir,
    claudeSessions: {
      async infer(input) {
        seen.push(input);
        input.onEvent({ type: 'speech', text: 'Yes. ' });
        return {
          tool: 'say',
          arguments: JSON.stringify({ text: 'Yes. Where next?' }),
          understanding: [{ focus: 'light', interpretation: 'understood', evidence: 'said so' }],
        };
      },
      closeAll: () => closed++,
    },
  });
  try {
    const snapshot = createMoon().snapshot();
    const library = await fetch(service.origin + '/api/library', { headers: { 'x-marble-token': service.token } }).then((r) => r.json());
    const moon = (library.lessons ?? library).find((l) => (l.manifest ?? l).id === 'moon-daytime');
    const response = await fetch(service.origin + '/api/infer-stream', {
      method: 'POST',
      headers: { 'x-marble-token': service.token, origin: service.origin, 'content-type': 'application/json' },
      body: JSON.stringify({
        lessonId: 'moon-daytime',
        version: (moon.manifest ?? moon).version,
        context: { snapshot },
        messages: [{ role: 'user', text: 'It bounces.' }],
      }),
    });
    const events = (await response.text()).trim().split('\n').map((l) => JSON.parse(l));
    assert.deepEqual(events[0], { type: 'speech', text: 'Yes. ' });
    assert.equal(events.at(-1).type, 'decision');
    assert.equal(events.at(-1).decision.understanding[0].focus, 'light');
    assert.equal(seen.length, 1);
    assert.equal(seen[0].key, `moon-daytime@${(moon.manifest ?? moon).version}:${snapshot.sessionId}`);
    assert.equal(seen[0].settings.model, 'claude-haiku-5-5');
    assert.ok(seen[0].standingTools.length >= seen[0].tools.length);
    assert.deepEqual(Object.keys(seen[0].records), ['understanding', 'confidence']);
  } finally {
    await service.close();
    await rm(dir, { recursive: true, force: true });
  }
  assert.equal(closed, 1);
});
