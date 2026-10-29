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
