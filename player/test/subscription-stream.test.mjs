import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough, Writable } from 'node:stream';
import {
  claudeStream,
  codexStream,
  decisionStream,
} from '../packages/providers/subscription-stream.mjs';
import { runProcess } from '../packages/providers/index.mjs';
const tools = [
  {
    name: 'say',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
      additionalProperties: false,
    },
  },
];
const text = 'A layer has six cubes. How many layers do you see?';
const decision = { tool: 'say', arguments: { text } };

test('Claude partial StructuredOutput emits a sentence before result; ignores thinking and subagents', () => {
  const heard = [];
  const events = claudeStream(decisionStream(tools, (e) => heard.push(e.text)));
  const send = (m) => {
    const line = JSON.stringify(m) + '\n';
    for (const c of line) events.push(c);
  };
  send({
    type: 'stream_event',
    parent_tool_use_id: 'subagent',
    event: {
      type: 'content_block_start',
      index: 9,
      content_block: { type: 'tool_use', name: 'StructuredOutput' },
    },
  });
  send({
    type: 'stream_event',
    event: {
      type: 'content_block_start',
      index: 1,
      content_block: { type: 'tool_use', name: 'StructuredOutput' },
    },
  });
  send({
    type: 'stream_event',
    event: {
      type: 'content_block_delta',
      index: 0,
      delta: { type: 'thinking_delta', thinking: 'private' },
    },
  });
  send({
    type: 'stream_event',
    event: {
      type: 'content_block_delta',
      index: 1,
      delta: {
        type: 'input_json_delta',
        partial_json: '{"tool":"say","arguments":{"text":"A layer has six cubes. How',
      },
    },
  });
  assert.deepEqual(heard, ['A layer has six cubes. ']);
  send({ type: 'result', structured_output: decision });
  assert.deepEqual(events.finish(), { tool: 'say', arguments: JSON.stringify({ text }) });
  assert.deepEqual(heard, ['A layer has six cubes. ']);
});
test('encoded Codex arguments stream safely across escapes, reject changed final answer', () => {
  const heard = [];
  const stream = decisionStream(tools, (e) => heard.push(e.text));
  const encoded = JSON.stringify({ tool: 'say', arguments: JSON.stringify({ text }) });
  for (const c of encoded) stream.push(c);
  assert.deepEqual(heard, ['A layer has six cubes. ']);
  assert.throws(
    () => stream.finish({ tool: 'say', arguments: { text: 'Something else.' } }),
    /did not match/,
  );
});
test('semantic actions never speak early; abort prevents further chunks', () => {
  const heard = [];
  const controller = new AbortController();
  const stream = decisionStream(tools, (e) => heard.push(e), controller.signal);
  stream.push('{"tool":"explain_model","arguments":{"text":"A layer has six cubes. More');
  assert.deepEqual(heard, []);
  controller.abort();
  assert.throws(() => stream.push('x'), /Cancelled/);
});
function fakeCodex(onWrite) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.stdin = new Writable({
    write(chunk, enc, cb) {
      onWrite(JSON.parse(String(chunk)), child);
      cb();
    },
  });
  child.kill = () => {
    child.killed = true;
    return true;
  };
  return child;
}
test('Codex app-server negotiates ephemeral restricted thread and streams only its answer', async () => {
  const heard = [];
  let child, done, request;
  const promise = codexStream({
    cwd: '/tmp',
    env: {},
    model: 'gpt-6-luna',
    prompt: 'test',
    schema: {},
    stream: decisionStream(tools, (e) => heard.push(e.text)),
    spawnProcess: (cmd, args) => {
      assert.equal(cmd, 'codex');
      assert.ok(args.includes('mcp_servers={}'));
      assert.ok(args.includes('features.hooks=false'));
      child = fakeCodex((m, c) => {
        const send = (v) => queueMicrotask(() => c.stdout.write(JSON.stringify(v) + '\n'));
        if (m.id === 1) send({ id: 1, result: {} });
        if (m.id === 4) send({ id: 4, result: { config: { mcp_servers: { ambient: {} } } } });
        if (m.id === 2) {
          assert.deepEqual(m.params.config.mcp_servers, { ambient: { enabled: false } });
          assert.equal(m.params.ephemeral, true);
          assert.equal(m.params.sandbox, 'read-only');
          send({ id: 2, result: { thread: { id: 't' } } });
        }
        if (m.id === 3) {
          request = m;
          send({ id: 3, result: { turn: { id: 'u' } } });
          send({
            method: 'item/started',
            params: {
              threadId: 't',
              turnId: 'u',
              item: { type: 'agentMessage', id: 'a', phase: 'final_answer' },
            },
          });
          send({
            method: 'item/agentMessage/delta',
            params: { threadId: 'other', turnId: 'u', itemId: 'a', delta: 'ignore' },
          });
          send({
            method: 'item/agentMessage/delta',
            params: { threadId: 't', turnId: 'u', itemId: 'a', delta: JSON.stringify(decision) },
          });
          done = () => {
            send({
              method: 'item/completed',
              params: {
                threadId: 't',
                turnId: 'u',
                item: { id: 'a', text: JSON.stringify(decision) },
              },
            });
            send({
              method: 'turn/completed',
              params: { threadId: 't', turn: { id: 'u', status: 'completed' } },
            });
          };
        }
      });
      return child;
    },
  });
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(heard, ['A layer has six cubes. ']);
  assert.equal(request.params.threadId, 't');
  done();
  assert.equal((await promise).tool, 'say');
  assert.equal(child.killed, true);
});
test('Codex cancellation terminates its app-server', async () => {
  const c = new AbortController();
  let child;
  const pending = codexStream({
    signal: c.signal,
    spawnProcess: () => (child = fakeCodex(() => {})),
    stream: decisionStream(tools),
  });
  c.abort();
  await assert.rejects(pending, /Cancelled/);
  assert.equal(child.killed, true);
});
test('process stdout streams UTF-8 before process completes', async () => {
  const chunks = [];
  let completed = false;
  const promise = runProcess(
    process.execPath,
    [
      '-e',
      `const b=Buffer.from('é');process.stdout.write(b.subarray(0,1));setTimeout(()=>process.stdout.write(b.subarray(1)),20);setTimeout(()=>{},100);`,
    ],
    {
      onStdout: (text) => {
        assert.equal(completed, false);
        chunks.push(text);
      },
    },
  );
  const result = await promise;
  completed = true;
  assert.equal(result, 'é');
  assert.equal(chunks.join(''), 'é');
});
