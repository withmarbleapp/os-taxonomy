import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import {
  localAvailability,
  requireLocalModel,
  subscriptionModels,
} from '../packages/providers/local.mjs';
import { infer, decisionSchema } from '../packages/providers/index.mjs';
import { checkSettings } from '../apps/local-service/server.mjs';
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
      if (url.endsWith('/api/show')) return json({ capabilities: ['completion'] });
      sent = JSON.parse(options.body);
      return json(
        provider === 'ollama'
          ? { message: { content: JSON.stringify(decision) } }
          : { choices: [{ message: { content: JSON.stringify(decision) } }] },
      );
    };
    assert.deepEqual(
      await infer({
        settings: { provider, model: 'chat-model', endpoint: 'https://not-used.example' },
        system: 'Tutor',
        tools: [],
        messages: [],
        context: {},
        fetcher,
      }),
      decision,
    );
    assert.equal(sent.model, 'chat-model');
    assert.deepEqual(
      provider === 'ollama' ? sent.format : sent.response_format.json_schema.schema,
      decisionSchema,
    );
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
      tools: [],
      messages: [],
      context: {},
      runner: async (command, argv) => {
        args = argv;
        if (provider === 'codex') {
          await writeFile(
            argv[argv.indexOf('--output-last-message') + 1],
            JSON.stringify(decision),
          );
          return '';
        }
        return JSON.stringify({ structured_output: decision });
      },
    });
    assert.deepEqual(result, decision);
    assert.equal(args[args.indexOf('--model') + 1], subscriptionModels[provider]);
  }
});
