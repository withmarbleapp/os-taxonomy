import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { providerAvailability } from '../packages/providers/availability.mjs';
import { createModelStore } from '../packages/voice/model-store.mjs';
import { createService } from '../apps/local-service/server.mjs';
test('availability distinguishes missing tools, subscription login, and API key auth without returning account details', async () => {
  assert.equal(
    (await providerAvailability('codex', async () => ({ code: -1, missing: true }))).state,
    'missing',
  );
  const probe =
    (output, code = 0) =>
    async (_cmd, args) =>
      args[0] === '--version' ? { code: 0, output: 'version' } : { code, output };
  assert.deepEqual(await providerAvailability('codex', probe('Logged in using ChatGPT')), {
    provider: 'codex',
    state: 'signed_in',
  });
  assert.equal(
    (await providerAvailability('codex', probe('Logged in using API key secret'))).state,
    'sign_in',
  );
  assert.equal(
    (
      await providerAvailability(
        'claude',
        probe(
          JSON.stringify({ loggedIn: true, authMethod: 'claude.ai', email: 'private@example.com' }),
        ),
      )
    ).state,
    'signed_in',
  );
  assert.equal((await providerAvailability('claude', probe('not json'))).state, 'sign_in');
});
test('connection probe validates inference, sanitizes failure, and preserves voice settings', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'marble-settings-'));
  let fail = false,
    calls = 0;
  const s = await createService({
    dataDir: dir,
    availability: async (provider) => ({
      provider,
      state: provider === 'codex' ? 'signed_in' : 'missing',
    }),
    inference: async () => {
      calls++;
      if (fail) throw Error('secret provider error');
      return { tool: 'say', arguments: '{"text":"ready"}' };
    },
  });
  const post = async (path, body) =>
    (
      await fetch(s.origin + '/api/' + path, {
        method: 'POST',
        headers: { origin: s.origin, 'x-marble-token': s.token },
        body: JSON.stringify(body),
      })
    ).json();
  try {
    assert.equal((await post('provider-check', { provider: 'claude' })).state, 'missing');
    assert.equal(calls, 0);
    assert.equal((await post('provider-check', { provider: 'codex' })).state, 'ready');
    fail = true;
    assert.deepEqual(await post('provider-check', { provider: 'codex' }), {
      provider: 'codex',
      state: 'failed',
    });
    await post('settings', { provider: 'codex', speech: true, speechDirectory: '/existing/voice' });
    const changed = await post('settings', { provider: 'claude', model: '' });
    assert.equal(changed.speech, true);
    assert.equal(changed.speechDirectory, '/existing/voice');
    const main = await fetch(s.origin);
    assert.doesNotMatch(main.headers.get('content-security-policy'), /'unsafe-eval'/);
    assert.equal(main.headers.get('cross-origin-embedder-policy'), 'require-corp');
    const worker = await fetch(s.origin + '/voice/browser-stt-worker.mjs');
    assert.match(worker.headers.get('content-security-policy'), /'unsafe-eval'/);
  } finally {
    await s.close();
    await rm(dir, { recursive: true, force: true });
  }
});
test('managed voice download is single-flight, verifies bytes, retries corruption and survives restarts', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'marble-models-'));
  const bytes = Buffer.from('model fixture');
  const manifest = {
    files: [
      {
        path: 'model.bin',
        bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        url: 'https://model.example/model',
      },
    ],
  };
  let corrupt = true,
    calls = 0;
  const fetcher = async () => {
    calls++;
    return new Response(corrupt ? Buffer.alloc(bytes.length) : bytes);
  };
  try {
    const store = createModelStore({ directory, manifest, fetcher });
    store.prepare();
    store.prepare();
    await store.settled();
    assert.equal(calls, 1);
    assert.equal((await store.inspect()).state, 'failed');
    corrupt = false;
    store.prepare();
    await store.settled();
    assert.equal((await store.inspect()).state, 'ready');
    const reload = createModelStore({
      directory,
      manifest,
      fetcher: () => {
        throw Error('Must work offline');
      },
    });
    assert.equal((await reload.inspect()).state, 'ready');
    assert.throws(() => reload.path('../secret'));
    await writeFile(join(directory, 'model.bin'), 'broken');
    const repair = createModelStore({ directory, manifest, fetcher });
    assert.equal((await repair.inspect()).state, 'not_installed');
    repair.prepare();
    await repair.settled();
    assert.equal((await repair.inspect()).state, 'ready');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
