import { mkdir, stat, rename, rm, open } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
export const modelArtifact = {
  name: 'Qwen3.5 4B',
  file: 'Qwen3.5-4B-Q4_K_M.gguf',
  bytes: 2740937888,
  sha256: '00fe7986ff5f6b463e62455821146049db6f9313603938a70800d1fb69ef11a4',
  url: 'https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/resolve/e87f176479d0855a907a41277aca2f8ee7a09523/Qwen3.5-4B-Q4_K_M.gguf',
};
export function createInferenceStore({ directory, artifact = modelArtifact, fetcher = fetch }) {
  const path = join(directory, artifact.file);
  let task, inspection, controller;
  let state = { state: 'not_installed', name: artifact.name, loaded: 0, total: artifact.bytes };
  async function verified() {
    try {
      if ((await stat(path)).size !== artifact.bytes) return false;
      const hash = createHash('sha256');
      for await (const bytes of createReadStream(path)) hash.update(bytes);
      return hash.digest('hex') === artifact.sha256;
    } catch {
      return false;
    }
  }
  async function inspect() {
    if (task || state.state === 'ready') return { ...state };
    inspection ??= verified().then((ok) => {
      if (ok) state = { ...state, state: 'ready', loaded: artifact.bytes };
    });
    await inspection;
    return { ...state };
  }
  function prepare() {
    if (task || state.state === 'ready') return { ...state };
    state = { ...state, state: 'downloading', loaded: 0, error: undefined };
    controller = new AbortController();
    task = (async () => {
      await inspection;
      if (state.state === 'ready') return;
      await mkdir(directory, { recursive: true });
      const response = await fetcher(artifact.url, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(3600000)]),
      });
      if (!response.ok || !response.body)
        throw Error('Download failed. Check your internet connection and retry.');
      const file = await open(path + '.part', 'w', 0o600);
      const hash = createHash('sha256');
      try {
        for await (const bytes of response.body) {
          state.loaded += bytes.length;
          if (state.loaded > artifact.bytes) throw Error('Unexpected model size. Please retry.');
          hash.update(bytes);
          await file.writeFile(bytes);
        }
      } finally {
        await file.close();
      }
      if (state.loaded !== artifact.bytes || hash.digest('hex') !== artifact.sha256)
        throw Error('Model verification failed. Please retry.');
      await rename(path + '.part', path);
      state = { ...state, state: 'ready' };
    })()
      .catch((error) => {
        state = {
          ...state,
          state: 'failed',
          error: controller.signal.aborted ? 'Download cancelled.' : error.message,
        };
      })
      .finally(async () => {
        await rm(path + '.part', { force: true });
        task = null;
      });
    return { ...state };
  }
  return { path, inspect, prepare, settled: () => task, close: () => controller?.abort() };
}
