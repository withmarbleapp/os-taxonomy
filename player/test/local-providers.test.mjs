import test from 'node:test';
import assert from 'node:assert/strict';
import {
  localAvailability,
  requireLocalModel,
  subscriptionModels,
  ollamaTutorOptions,
} from '../packages/providers/local.mjs';
import { infer, decisionSchema, ollamaDecisionSchema } from '../packages/providers/index.mjs';
import { checkSettings } from '../apps/local-service/server.mjs';
const toolList = [
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
const decision = { tool: 'say', arguments: '{"text":"Hello"}' };
const json = (data) => new Response(JSON.stringify(data));
test('local discovery distinguishes empty, stopped and authenticated servers; filters cloud entries', async () => {
  assert.equal(
    (
      await localAvailability('ollama', async () => {
        throw Error('offline');
      })
    ).state,
    'unavailable',
  );
  assert.equal(
    (await localAvailability('lmstudio', async () => new Response('', { status: 401 }))).state,
    'auth_required',
  );
  assert.equal(
    (await localAvailability('lmstudio', async () => json({ data: [] }))).state,
    'no_models',
  );
  const status = await localAvailability('ollama', async () =>
    json({
      models: [
        { name: 'local' },
        { name: 'model:cloud' },
        { name: 'relay', remote_host: 'https://remote' },
      ],
    }),
  );
  assert.deepEqual(status.models, ['local']);
  await assert.rejects(
    requireLocalModel('ollama', 'local', async (url) =>
      url.endsWith('/api/tags')
        ? json({ models: [{ name: 'local' }] })
        : json({ remote_model: 'cloud' }),
    ),
    /cloud/,
  );
});
for (const provider of ['ollama', 'lmstudio'])
  test(`${provider} sends bounded structured inference only to its loopback server`, async () => {
    let sent;
    const fetcher = async (url, options) => {
      assert.ok(
        url.startsWith(
          provider === 'ollama' ? 'http://127.0.0.1:11434/' : 'http://127.0.0.1:1234/',
        ),
      );
      assert.equal(options.redirect, 'error');
      if (url.endsWith('/api/tags')) return json({ models: [{ name: 'chat-model' }] });
      if (url.endsWith('/models')) return json({ data: [{ id: 'chat-model' }] });
      if (url.endsWith('/api/show'))
        return json({ capabilities: ['completion'], thinking: { values: [true, false] } });
      sent = JSON.parse(options.body);
      return json(
        provider === 'ollama'
          ? { message: { content: JSON.stringify({ tool: 'say', arguments: { text: 'Hello' } }) } }
          : { choices: [{ message: { content: JSON.stringify(decision) } }] },
      );
    };
    assert.deepEqual(
      await infer({
        settings: { provider, model: 'chat-model', endpoint: 'https://not-used.example' },
        system: 'Tutor',
        tools: toolList,
        messages: [],
        context: {},
        fetcher,
      }),
      decision,
    );
    assert.equal(sent.model, 'chat-model');
    if (provider === 'ollama') {
      assert.equal(sent.think, false);
      assert.equal(sent.keep_alive, '30m');
      assert.deepEqual(sent.options, { num_ctx: 16384, num_predict: 1200 });
    } else {
      assert.equal(sent.think, undefined);
      assert.equal(sent.keep_alive, undefined);
      assert.equal(sent.options, undefined);
    }
    assert.deepEqual(
      provider === 'ollama' ? sent.format : sent.response_format.json_schema.schema,
      provider === 'ollama' ? ollamaDecisionSchema(toolList) : decisionSchema,
    );
  });
test('Ollama thinking controls respect model metadata and older Qwen servers', () => {
  assert.equal(ollamaTutorOptions('qwen3.5:4b').think, false);
  assert.equal(ollamaTutorOptions('qwen3:8b').think, false);
  assert.equal(ollamaTutorOptions('other-model').think, undefined);
  assert.equal(ollamaTutorOptions('other-model', { values: [false, true] }).think, false);
  assert.equal(ollamaTutorOptions('qwen3.5:4b', { values: ['low', 'high'] }).think, undefined);
});
test('subscription models are pinned for saved settings and actual CLI requests', async () => {
  for (const provider of ['codex', 'claude']) {
    assert.equal(
      checkSettings({ provider, model: 'old-model' }).model,
      subscriptionModels[provider],
    );
    let args;
    const result = await infer({
      settings: { provider, model: 'old-model' },
      system: 'test',
      tools: toolList,
      messages: [],
      context: {},
      codexRunner: async (options) => {
        args = ['--model', options.model];
        return options.stream.finish(decision);
      },
      runner: async (command, argv) => {
        args = argv;
        return JSON.stringify({ type: 'result', structured_output: decision });
      },
    });
    assert.deepEqual(result, decision);
    assert.equal(args[args.indexOf('--model') + 1], subscriptionModels[provider]);
  }
});
