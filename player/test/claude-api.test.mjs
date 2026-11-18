import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  inferClaudeApi,
  turnSchema,
  conversationBlocks,
  claudeApiAvailability,
} from '../packages/providers/claude-api.mjs';
import { recentHistory } from '../packages/teaching-runtime/session.mjs';
import { createService } from '../apps/local-service/server.mjs';

const tool = (name, properties) => ({
  name,
  description: name + ' description',
  inputSchema: {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  },
});
const say = tool('say', { text: { type: 'string', minLength: 1, maxLength: 650 } });
const show = tool('show_moment', { moment: { enum: ['bow', 'drop'] } });
const answer = tool('answer_check', { choice: { type: 'integer', minimum: 0 } });
const records = {
  understanding: {
    type: 'array',
    maxItems: 3,
    items: {
      type: 'object',
      properties: { focus: { enum: ['light'] }, evidence: { type: 'string', maxLength: 650 } },
      required: ['focus', 'evidence'],
      additionalProperties: false,
    },
  },
};

// Stands in for the SDK client: replies with `text` in small pieces.
function fakeClient(text, { stop = 'end_turn', pieces = 7 } = {}) {
  const requests = [];
  return {
    requests,
    messages: {
      stream(params, options) {
        requests.push({ params, options });
        return {
          aborted: false,
          abort() {
            this.aborted = true;
          },
          async *[Symbol.asyncIterator]() {
            for (let i = 0; i < text.length; i += pieces)
              yield {
                type: 'content_block_delta',
                delta: { type: 'text_delta', text: text.slice(i, i + pieces) },
              };
          },
          async finalMessage() {
            return { stop_reason: stop, content: [{ type: 'text', text }] };
          },
        };
      },
    },
  };
}
const base = { system: 'Rules.', messages: [], context: { scene: 'meadow' }, records };

test('each request allows only the tools offered for that turn', async () => {
  const client = fakeClient(
    '{"tool":"say","arguments":{"text":"Look at the sky."},"understanding":[]}',
  );
  const decision = await inferClaudeApi({
    ...base,
    tools: [say, show],
    standingTools: [say, show, answer],
    client,
  });
  assert.deepEqual(decision, { tool: 'say', arguments: '{"text":"Look at the sky."}' });
  const { params } = client.requests[0];
  const schema = params.output_config.format.schema;
  assert.deepEqual(schema.properties.tool.enum, ['say', 'show_moment']);
  assert.equal(schema.properties.arguments.anyOf.length, 2);
  assert.doesNotMatch(JSON.stringify(schema), /answer_check|choice/);
  // The lesson's full tool list is described once, in the cached part.
  assert.match(params.system[0].text, /answer_check description/);
  assert.deepEqual(params.system[0].cache_control, { type: 'ephemeral' });
  const state = params.messages[0].content.at(-1).text;
  assert.deepEqual(JSON.parse(state.slice(state.indexOf('{'))).availableTools, [
    'say',
    'show_moment',
  ]);
  assert.deepEqual(params.thinking, { type: 'adaptive' });
  assert.equal(params.output_config.effort, 'low');

  // Next turn the scene offers a check: the schema follows.
  await inferClaudeApi({
    ...base,
    tools: [say, answer],
    standingTools: [say, show, answer],
    client,
  });
  assert.deepEqual(client.requests[1].params.output_config.format.schema.properties.tool.enum, [
    'say',
    'answer_check',
  ]);
  assert.equal(client.requests[1].params.system[0].text, params.system[0].text);
});

test('the schema sent keeps only what structured outputs accept', () => {
  const text = JSON.stringify(turnSchema([say, answer], records));
  assert.doesNotMatch(text, /minLength|maxLength|maxItems|minimum/);
  const schema = turnSchema([say, answer], records);
  assert.deepEqual(schema.required, ['tool', 'arguments', 'understanding']);
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.understanding.items.additionalProperties, false);
});

test('a reply naming an unavailable tool, or breaking a dropped limit, is rejected', async () => {
  await assert.rejects(
    inferClaudeApi({
      ...base,
      tools: [say],
      standingTools: [say, show],
      client: fakeClient('{"tool":"show_moment","arguments":{"moment":"bow"},"understanding":[]}'),
    }),
    /unknown tool/,
  );
  await assert.rejects(
    inferClaudeApi({
      ...base,
      tools: [say, answer],
      client: fakeClient('{"tool":"answer_check","arguments":{"choice":-1},"understanding":[]}'),
    }),
  );
});

test('speech is streamed by sentence and records are kept', async () => {
  const events = [];
  const decision = await inferClaudeApi({
    ...base,
    tools: [say],
    client: fakeClient(
      '{"tool":"say","arguments":{"text":"The Sun is behind you. Where is the rain?"},"understanding":[{"focus":"light","evidence":"said the Sun is behind"}]}',
    ),
    onEvent: (e) => events.push(e),
  });
  assert.equal(events[0].type, 'speech');
  assert.equal(events[0].text.trim(), 'The Sun is behind you.');
  assert.equal(decision.understanding[0].focus, 'light');
});

test('refusals, cut-off replies and cancellation fail cleanly', async () => {
  const reply = '{"tool":"say","arguments":{"text":"Hi."},"understanding":[]}';
  await assert.rejects(
    inferClaudeApi({ ...base, tools: [say], client: fakeClient(reply, { stop: 'refusal' }) }),
    /declined/,
  );
  await assert.rejects(
    inferClaudeApi({ ...base, tools: [say], client: fakeClient(reply, { stop: 'max_tokens' }) }),
    /cut off/,
  );
  const controller = new AbortController();
  const client = fakeClient(
    '{"tool":"say","arguments":{"text":"One thing first. Then another thing."},"understanding":[]}',
  );
  const pending = inferClaudeApi({
    ...base,
    tools: [say],
    client,
    signal: controller.signal,
    onEvent: () => controller.abort(),
  });
  await assert.rejects(pending, /Cancelled/);
});

test('availability reports only whether a key is present', () => {
  assert.deepEqual(claudeApiAvailability({}), { provider: 'anthropic', state: 'no_key' });
  assert.deepEqual(claudeApiAvailability({ ANTHROPIC_API_KEY: 'sk-secret' }), {
    provider: 'anthropic',
    state: 'signed_in',
  });
});

test('the service offers the API connection and checks it without storing a key', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'marble-api-'));
  let hasKey = false,
    seen,
    seenInput;
  const s = await createService({
    dataDir: dir,
    availability: async (provider) => ({ provider, state: 'missing' }),
    apiAvailability: () => ({ provider: 'anthropic', state: hasKey ? 'signed_in' : 'no_key' }),
    inference: async (input) => {
      seen = input.settings;
      seenInput = input;
      return { tool: 'say', arguments: '{"text":"ready"}' };
    },
  });
  const headers = { origin: s.origin, 'x-marble-token': s.token };
  const post = async (path, body) =>
    (
      await fetch(s.origin + '/api/' + path, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
    ).json();
  try {
    assert.equal((await post('provider-check', { provider: 'anthropic' })).state, 'no_key');
    assert.equal(seen, undefined);
    hasKey = true;
    assert.equal((await post('provider-check', { provider: 'anthropic' })).state, 'ready');
    assert.equal(seen.provider, 'anthropic');
    const saved = await post('settings', { provider: 'anthropic' });
    assert.equal(saved.provider, 'anthropic');
    assert.doesNotMatch(JSON.stringify(saved), /key|sk-/i);
    const connections = await (await fetch(s.origin + '/api/connections', { headers })).json();
    assert.equal(connections.find((c) => c.provider === 'anthropic').state, 'signed_in');

    // A key saved in Settings is used for inference and never comes back out.
    hasKey = false;
    seenInput = undefined;
    assert.equal((await post('api-key', { key: 'sk-ant-test-123' })).state, 'signed_in');
    assert.equal((await post('provider-check', { provider: 'anthropic' })).state, 'ready');
    assert.equal(seenInput.apiKey, 'sk-ant-test-123');
    assert.equal((await stat(join(dir, 'anthropic-key'))).mode & 0o777, 0o600);
    const config = await (await fetch(s.origin + '/api/config', { headers })).text();
    assert.doesNotMatch(config + (await readFile(join(dir, 'settings.json'), 'utf8')), /sk-ant/);
    const rejected = await fetch(s.origin + '/api/api-key', {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'two words' }),
    });
    assert.notEqual(rejected.status, 200);
    assert.equal((await post('api-key', { key: '' })).state, 'no_key');
    await assert.rejects(stat(join(dir, 'anthropic-key')));
  } finally {
    await s.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('each request starts with the previous one, so the conversation is read from cache', () => {
  const history = [
    { role: 'user', text: 'Why is the sky blue?' },
    { role: 'assistant', text: 'Let us look.' },
  ];
  const first = conversationBlocks(history, [say], { scene: 'meadow' });
  const later = conversationBlocks(
    [...history, { role: 'tool', name: 'show_moment', result: { ok: true } }],
    [say, show],
    { scene: 'drop' },
  );
  // Only the last conversation entry is marked; the changing state comes after it.
  assert.deepEqual(
    first.map((b) => !!b.cache_control),
    [false, true, false],
  );
  assert.deepEqual(
    later.map((b) => !!b.cache_control),
    [false, false, true, false],
  );
  assert.deepEqual(
    later.slice(0, 2).map((b) => b.text),
    first.slice(0, 2).map((b) => b.text),
  );
  assert.match(later.at(-1).text, /"scene":"drop"/);
  assert.equal(conversationBlocks([], [say], {}).length, 1);
});

test('the history window moves forward in steps, keeping its start stable between turns', () => {
  const history = Array.from({ length: 100 }, (_, i) => i);
  const starts = [];
  for (let length = 1; length <= 100; length++) {
    const window = recentHistory(history.slice(0, length));
    assert.ok(window.length <= 59 && window.at(-1) === length - 1);
    if (length >= 40) assert.ok(window.length >= 40);
    starts.push(window[0]);
  }
  assert.deepEqual([...new Set(starts)], [0, 20, 40, 60]);
});
