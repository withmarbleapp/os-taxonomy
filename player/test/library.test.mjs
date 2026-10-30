import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, access, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createService } from '../apps/local-service/server.mjs';
import { pack } from '../packages/authoring-tools/archive.mjs';

test('library removal persists, protects app files and logs, and supports reimport', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'marble-library-'));
  let service = await createService({ dataDir: dir });
  const call = (path, body) =>
    fetch(service.origin + '/api/' + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { origin: service.origin, 'x-marble-token': service.token },
      body:
        body instanceof Uint8Array ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  const list = async () => (await call('library')).json();
  try {
    const builtIn = (await list())[0];
    const exported = Buffer.from(
      await (
        await call(`export?id=${builtIn.manifest.id}&version=${builtIn.manifest.version}`)
      ).arrayBuffer(),
    );
    const bytes = await pack('packages/authoring-tools/template');
    const imported = await (await call('import', bytes)).json();
    const installed = join(dir, 'library', imported.id, imported.version);
    await writeFile(join(dir, 'logs', 'keep.jsonl'), 'session');
    assert.equal(
      (await call('remove-lesson', { id: '../../logs', version: 'keep.jsonl' })).ok,
      false,
    );
    assert.equal((await call('remove-lesson', imported)).ok, true);
    await assert.rejects(access(installed));
    await access(join(dir, 'logs', 'keep.jsonl'));
    assert.equal((await call('remove-lesson', builtIn.manifest)).ok, true);
    assert.equal(
      (await list()).some((p) => p.manifest.id === builtIn.manifest.id),
      false,
    );
    // App-owned source remains exportable even while hidden.
    assert.equal(
      (await call(`export?id=${builtIn.manifest.id}&version=${builtIn.manifest.version}`)).ok,
      true,
    );
    await service.close();
    service = await createService({ dataDir: dir });
    assert.equal(
      (await list()).some((p) => [builtIn.manifest.id, imported.id].includes(p.manifest.id)),
      false,
    );
    assert.equal((await call('import', exported)).ok, true);
    assert.equal((await call('import', bytes)).ok, true);
    assert.equal(
      (await list()).filter((p) => [builtIn.manifest.id, imported.id].includes(p.manifest.id))
        .length,
      2,
    );
    await access(installed);
  } finally {
    await service.close();
    await rm(dir, { recursive: true, force: true });
  }
});
