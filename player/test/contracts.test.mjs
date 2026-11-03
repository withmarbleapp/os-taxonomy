import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { zipSync, strToU8 } from 'fflate';
import { pack, unpack, install } from '../packages/authoring-tools/archive.mjs';
import { safePath } from '../packages/lesson-contract/package.mjs';
import { createService } from '../apps/local-service/server.mjs';
test('both lessons roundtrip and install idempotently', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'marble-test-'));
  try {
    for (const id of ['cube-volume', 'croatoan-clues']) {
      const bytes = await pack('lessons/' + id);
      assert.equal(unpack(bytes).manifest.id, id);
      const a = await install(bytes, temp),
        b = await install(bytes, temp);
      assert.equal(a.directory, b.directory);
      assert.equal(unpack(await pack(a.directory)).manifest.id, id);
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
test('archives reject traversal and tampering', async () => {
  for (const p of ['../x', '/x', 'x\\y', 'x/../y', 'x%2fy']) assert.equal(safePath(p), false);
  assert.throws(() => unpack(zipSync({ '../x': strToU8('oops') })), /Unsafe/);
  const p = unpack(await pack('lessons/cube-volume'));
  p.files['index.html'] = strToU8('tampered');
  assert.throws(() => unpack(zipSync(p.files)), /integrity/i);
});
test('service isolates opaque lesson frames from privileged APIs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'marble-http-')),
    s = await createService({ dataDir: dir });
  try {
    assert.equal(
      (await fetch(s.origin + '/api/config', { headers: { origin: 'null' } })).status,
      403,
    );
    assert.equal((await fetch(s.origin + '/api/library')).status, 403);
    const headers = { 'x-marble-token': s.token },
      list = await (await fetch(s.origin + '/api/library', { headers })).json();
    assert.equal(list.length, 2);
    const frame = await fetch(s.origin + list[0].url);
    assert.match(frame.headers.get('content-security-policy'), /sandbox allow-scripts/);
    assert.match(frame.headers.get('content-security-policy'), /connect-src 'none'/);
    assert.equal(
      (
        await fetch(s.origin + '/api/settings', {
          method: 'POST',
          headers: { ...headers, origin: 'null' },
          body: '{}',
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await fetch(s.origin + '/api/settings', {
          method: 'POST',
          headers: { ...headers, origin: s.origin },
          body: JSON.stringify({
            provider: 'local',
            model: 'test',
            endpoint: 'https://evil.example/v1',
          }),
        })
      ).status,
      400,
    );
  } finally {
    await s.close();
    await rm(dir, { recursive: true, force: true });
  }
});
test('imports cannot replace a bundled release or grant shortcut trust', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'marble-import-'));
  let service;
  try {
    const { cp, writeFile } = await import('node:fs/promises');
    const modified = join(dir, 'modified');
    await cp('lessons/cube-volume', modified, { recursive: true });
    await writeFile(join(modified, 'index.html'), '<p>replacement</p>');
    const conflict = await pack(modified);
    // Also verify an existing library collision cannot shadow the bundled copy.
    await install(conflict, join(dir, 'library'));
    service = await createService({ dataDir: dir });
    const headers = { 'x-marble-token': service.token, origin: service.origin };
    const post = (bytes) =>
      fetch(service.origin + '/api/import', { method: 'POST', headers, body: bytes });
    assert.equal((await post(conflict)).status, 400);
    assert.equal((await post(await pack('lessons/cube-volume'))).status, 200);
    assert.equal((await post(await pack('packages/authoring-tools/template'))).status, 200);
    const catalog = await (await fetch(service.origin + '/api/library', { headers })).json();
    const cube = catalog.find((p) => p.manifest.id === 'cube-volume');
    assert.equal(cube.trustedShortcuts, true);
    assert.match(await (await fetch(service.origin + cube.url)).text(), /canvas/);
    assert.equal(catalog.find((p) => p.manifest.id === 'equal-parts').trustedShortcuts, false);
  } finally {
    await service?.close();
    await rm(dir, { recursive: true, force: true });
  }
});
