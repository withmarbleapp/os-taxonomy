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
      ['claude', 'codex', 'anthropic', 'device'],
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

test('on-device requests take turns instead of colliding', async () => {
  const { EventEmitter } = await import('node:events');
  const { createInferenceEngine } = await import('../packages/inference/engine.mjs');
  // A stand-in for the model process: it answers when told to, one job at a time.
  const jobs = [];
  let launches = 0,
    overlapped = false;
  const launch = () => {
    launches++;
    const child = new EventEmitter();
    child.send = (job) => {
      if (jobs.some((j) => !j.answered)) overlapped = true;
      jobs.push({ ...job, child, answered: false });
    };
    child.kill = () => child.emit('exit');
    return child;
  };
  const answer = (index) => {
    const job = jobs[index];
    job.answered = true;
    job.child.emit('message', { result: { tool: 'say', arguments: JSON.stringify({ text: job.system }) } });
  };
  const tick = () => new Promise((resolve) => setTimeout(resolve, 5));
  const engine = createInferenceEngine({ modelPath: 'model', launch });
  try {
    // A lesson prepares its opening, Settings checks the connection, and the
    // lesson asks for its next move before the opening has finished.
    const opening = engine.infer({ system: 'opening' });
    const check = engine.infer({ system: 'check' });
    const cancelled = new AbortController();
    const dropped = engine.infer({ system: 'dropped', signal: cancelled.signal });
    const next = engine.infer({ system: 'next' });
    await tick();
    assert.deepEqual(jobs.map((j) => j.system), ['opening']);
    // Cancelling a request that is still waiting does not disturb the one running.
    cancelled.abort();
    await assert.rejects(dropped, /Cancelled/);
    answer(0);
    assert.equal(JSON.parse((await opening).arguments).text, 'opening');
    await tick();
    assert.deepEqual(jobs.map((j) => j.system), ['opening', 'check']);
    answer(1);
    await check;
    await tick();
    answer(2);
    assert.equal(JSON.parse((await next).arguments).text, 'next');
    assert.deepEqual(jobs.map((j) => j.system), ['opening', 'check', 'next']);
    assert.equal(overlapped, false);
    assert.equal(launches, 1);
  } finally {
    engine.close();
  }
});
