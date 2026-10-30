import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { createHash, randomUUID } from 'node:crypto';
import { readFile, writeFile, readdir, mkdir, lstat, rename, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { safePath, validatePackage } from '../lesson-contract/package.mjs';
export const MAX_ARCHIVE = 40 * 1024 * 1024,
  MAX_EXPANDED = 100 * 1024 * 1024;
const hash = (b) => createHash('sha256').update(b).digest('hex');
const forbidden = (p) =>
  p
    .split('/')
    .some(
      (x) =>
        x.startsWith('.') ||
        ['node_modules', 'session-logs', 'recordings', 'models', 'credentials'].includes(x),
    ) || /\.(env|pem|key|jsonl|sqlite|db)$/i.test(p);
async function walk(root, rel = '') {
  const out = {};
  for (const name of await readdir(join(root, rel))) {
    const p = rel ? rel + '/' + name : name;
    if (p === 'receipt.json') continue;
    if (!safePath(p) || forbidden(p)) throw Error('Non-deliverable file: ' + p);
    const st = await lstat(join(root, p));
    if (st.isSymbolicLink()) throw Error('Symlinks are not allowed in a lesson');
    if (st.isDirectory()) Object.assign(out, await walk(root, p));
    else if (st.isFile()) out[p] = new Uint8Array(await readFile(join(root, p)));
    else throw Error('Unsupported file: ' + p);
  }
  return out;
}
function inspect(files) {
  const read = (p) => {
    if (!files[p]) throw Error('Missing ' + p);
    return JSON.parse(strFromU8(files[p]));
  };
  const manifest = read('manifest.json');
  const result = validatePackage(manifest, read(manifest.teaching), read(manifest.experience));
  if (!files[manifest.entry]) throw Error('Missing scene entry point');
  for (const p of Object.keys(files))
    if (!safePath(p) || forbidden(p)) throw Error('Unsafe package path: ' + p);
  return result;
}
export async function pack(directory) {
  const files = await walk(resolve(directory));
  inspect(files);
  let total = 0;
  for (const b of Object.values(files)) total += b.length;
  if (total > MAX_EXPANDED) throw Error('Lesson is too large');
  files['integrity.json'] = strToU8(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(files)
          .filter(([p]) => p !== 'integrity.json')
          .map(([p, b]) => [p, hash(b)]),
      ),
    ),
  );
  const bytes = zipSync(files, { level: 6 });
  if (bytes.length > MAX_ARCHIVE) throw Error('Archive is too large');
  return bytes;
}
export function unpack(bytes) {
  if (bytes.length > MAX_ARCHIVE) throw Error('Archive is too large');
  let total = 0,
    count = 0;
  const seen = new Set();
  const files = unzipSync(new Uint8Array(bytes), {
    filter: (file) => {
      if (
        ++count > 2000 ||
        seen.has(file.name.toLowerCase()) ||
        file.name === 'receipt.json' ||
        !safePath(file.name) ||
        forbidden(file.name)
      )
        throw Error('Unsafe or duplicate archive entry');
      seen.add(file.name.toLowerCase());
      total += file.originalSize;
      if (!Number.isSafeInteger(total) || total > MAX_EXPANDED)
        throw Error('Expanded archive is too large');
      return true;
    },
  });
  const result = inspect(files);
  if (!files['integrity.json']) throw Error('Package has no integrity manifest');
  const sums = JSON.parse(strFromU8(files['integrity.json']));
  if (Object.keys(sums).length !== Object.keys(files).length - 1)
    throw Error('Integrity manifest does not cover all files');
  for (const [p, b] of Object.entries(files))
    if (p !== 'integrity.json' && sums[p] !== hash(b))
      throw Error('Package integrity check failed: ' + p);
  return {
    ...result,
    files,
    hash: hash(
      JSON.stringify(
        Object.keys(files)
          .filter((p) => p !== 'integrity.json')
          .sort()
          .map((p) => [p, hash(files[p])]),
      ),
    ),
  };
}
export async function install(bytes, library) {
  const pkg = unpack(bytes),
    dest = join(library, pkg.manifest.id, pkg.manifest.version),
    temp = join(library, '.import-' + randomUUID());
  await mkdir(temp, { recursive: true });
  try {
    try {
      const prior = JSON.parse(await readFile(join(dest, 'receipt.json'), 'utf8'));
      if (prior.hash === pkg.hash) return { ...pkg, directory: dest };
      throw Error('This version already exists with different content; increment the version');
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
    for (const [p, b] of Object.entries(pkg.files)) {
      await mkdir(join(temp, p, '..'), { recursive: true });
      await writeFile(join(temp, p), b, { flag: 'wx' });
    }
    await writeFile(
      join(temp, 'receipt.json'),
      JSON.stringify({ hash: pkg.hash, installedAt: new Date().toISOString() }),
    );
    await mkdir(join(dest, '..'), { recursive: true });
    await rename(temp, dest);
    return { ...pkg, directory: dest };
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}
export async function loadDirectory(directory) {
  const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
  if (!safePath(manifest.teaching) || !safePath(manifest.experience))
    throw Error('Unsafe metadata path');
  return {
    ...validatePackage(
      manifest,
      JSON.parse(await readFile(join(directory, manifest.teaching), 'utf8')),
      JSON.parse(await readFile(join(directory, manifest.experience), 'utf8')),
    ),
    directory,
  };
}
