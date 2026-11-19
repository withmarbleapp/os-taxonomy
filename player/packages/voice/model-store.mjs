// Desktop persistence for the browser models. No Python or native speech process.
import { readFile, mkdir, writeFile, rename, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('./', import.meta.url));
export const modelManifest = JSON.parse(await readFile(join(root, 'browser-models.json'), 'utf8'));
export function createModelStore({
  directory,
  legacyDirectory,
  fetcher = fetch,
  manifest = modelManifest,
}) {
  let task,
    state = {
      state: 'not_installed',
      loaded: 0,
      total: manifest.files.reduce((n, f) => n + f.bytes, 0),
    };
  const valid = (bytes, file) =>
    bytes.length === file.bytes && createHash('sha256').update(bytes).digest('hex') === file.sha256;
  const readValid = async (path, file) => {
    try {
      const bytes = await readFile(path);
      return valid(bytes, file) ? bytes : null;
    } catch {
      return null;
    }
  };
  async function inspect() {
    if (task || state.state === 'ready') return { ...state };
    let complete = true;
    for (const f of manifest.files)
      if (!(await readValid(join(directory, f.path), f))) {
        complete = false;
        break;
      }
    if (complete) state = { ...state, state: 'ready', loaded: state.total };
    return { ...state };
  }
  function prepare() {
    if (task || state.state === 'ready') return { ...state };
    state = { ...state, state: 'downloading', loaded: 0, error: undefined };
    task = (async () => {
      let completed = 0;
      for (const file of manifest.files) {
        state.file = file.path;
        const target = join(directory, file.path);
        let bytes = await readValid(target, file);
        if (!bytes && legacyDirectory)
          bytes = await readValid(join(legacyDirectory, 'local-speech/models', file.path), file);
        if (!bytes && file.url.startsWith('/voice/assets/'))
          bytes = await readFile(join(root, 'assets', file.url.split('/').at(-1)));
        if (!bytes) {
          const response = await fetcher(file.url, { signal: AbortSignal.timeout(180000) });
          if (!response.ok)
            throw Error('Voice download failed. Check your connection and try again.');
          const chunks = [];
          let received = 0;
          for await (const chunk of response.body) {
            received += chunk.length;
            if (received > file.bytes)
              throw Error('Voice download has an unexpected size. Please retry.');
            chunks.push(chunk);
            state.loaded = completed + received;
          }
          bytes = Buffer.concat(chunks);
        }
        if (!valid(bytes, file)) throw Error('Voice download could not be verified. Please retry.');
        await mkdir(dirname(target), { recursive: true });
        try {
          await writeFile(target + '.part', bytes);
          await rename(target + '.part', target);
        } finally {
          await rm(target + '.part', { force: true });
        }
        completed += bytes.length;
        state.loaded = completed;
      }
      state = { ...state, state: 'ready', file: undefined };
    })()
      .catch((error) => {
        state = { ...state, state: 'failed', error: error.message };
      })
      .finally(() => {
        task = null;
      });
    return { ...state };
  }
  return {
    inspect,
    prepare,
    settled: () => task,
    path(name) {
      if (!manifest.files.some((f) => f.path === name)) throw Error('Unknown voice asset');
      return join(directory, name);
    },
  };
}
