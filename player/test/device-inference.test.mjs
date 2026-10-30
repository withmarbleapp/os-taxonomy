import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { createInferenceStore } from '../packages/inference/model-store.mjs';
import { createService } from '../apps/local-service/server.mjs';
test('managed LLM download verifies bytes, retries corruption, and works offline after restart', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'marble-llm-'));
  const bytes = Buffer.from('fixture model');
  const artifact = {
    name: 'fixture',
    file: 'model.gguf',
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    url: 'https://model.example/file',
  };
  let bad = true,
    calls = 0;
  const fetcher = async () => {
    calls++;
    return new Response(bad ? Buffer.alloc(bytes.length) : bytes);
  };
  try {
    const store = createInferenceStore({ directory, artifact, fetcher });
    assert.equal((await store.inspect()).state, 'not_installed');
    store.prepare();
    store.prepare();
    await store.settled();
    assert.equal(calls, 1);
    assert.equal((await store.inspect()).state, 'failed');
    bad = false;
    store.prepare();
    await store.settled();
    assert.equal((await store.inspect()).state, 'ready');
    const reloaded = createInferenceStore({
      directory,
      artifact,
      fetcher: () => {
        throw Error('offline');
      },
    });
    assert.equal((await reloaded.inspect()).state, 'ready');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test('old local settings migrate to managed inference, with no external server calls', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'marble-device-'));
  await writeFile(
    join(dataDir, 'settings.json'),
    JSON.stringify({ provider: 'ollama', model: 'old' }),
  );
  let downloaded = false,
    called = false,
    closed = false;
  const service = await createService({
    dataDir,
    availability: async (provider) => ({ provider, state: 'missing' }),
    localDiscovery: () => {
      throw Error('Must not contact Ollama');
    },
    inference: () => {
      throw Error('Must not contact a provider');
    },
    inferenceStore: {
      inspect: async () => ({ state: downloaded ? 'ready' : 'not_installed' }),
      prepare: () => {
        downloaded = true;
        return { state: 'ready' };
      },
      close() {},
    },
    deviceEngine: {
      infer: async () => {
        called = true;
        return { tool: 'say', arguments: '{"text":"ready"}' };
      },
      close() {
        closed = true;
      },
    },
  });
  const request = async (path, body) =>
    (
      await fetch(service.origin + '/api/' + path, {
        method: body ? 'POST' : 'GET',
        headers: { origin: service.origin, 'x-marble-token': service.token },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
    ).json();
  try {
    assert.equal((await request('config')).settings.provider, 'device');
    assert.deepEqual(
      (await request('connections')).map((p) => p.provider),
      ['claude', 'codex', 'device'],
    );
    assert.equal((await request('provider-check', { provider: 'device' })).state, 'not_installed');
    assert.equal(called, false);
    await request('device-prepare', {});
    assert.equal((await request('provider-check', { provider: 'device' })).state, 'ready');
    assert.equal(called, true);
  } finally {
    await service.close();
    await rm(dataDir, { recursive: true, force: true });
  }
  assert.equal(closed, true);
});
