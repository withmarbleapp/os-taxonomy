import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export async function chrome({ audioFile } = {}) {
  const profile = await mkdtemp(join(tmpdir(), 'learning-browser-'));
  const process = spawn(
    globalThis.process.env.CHROME_PATH ?? '/opt/google/chrome/chrome',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      ...(audioFile ? [`--use-file-for-fake-audio-capture=${audioFile}`] : []),
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  let stderr = '';
  const endpoint = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome startup timeout')), 10000);
    process.stderr.on('data', (c) => {
      stderr += c;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    process.on('error', reject);
  });
  const port = new URL(endpoint).port;
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map(),
    errors = [];
  ws.addEventListener('message', ({ data }) => {
    const result = JSON.parse(data);
    if (result.method === 'Runtime.exceptionThrown')
      errors.push(
        result.params.exceptionDetails.text +
          ': ' +
          (result.params.exceptionDetails.exception?.description ?? ''),
      );
    if (result.id) {
      const request = pending.get(result.id);
      if (!request) return;
      pending.delete(result.id);
      clearTimeout(request.timeout);
      result.error
        ? request.reject(new Error(JSON.stringify(result.error)))
        : request.resolve(result.result);
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const requestId = ++id;
      const timeout = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`CDP timeout: ${method}`));
      }, 60000);
      pending.set(requestId, { resolve, reject, timeout });
      ws.send(
        JSON.stringify({ id: requestId, method, params, ...(sessionId ? { sessionId } : {}) }),
      );
    });
  await send('Runtime.enable');
  await send('Page.enable');
  return {
    send,
    errors,
    async evaluate(expression) {
      const result = await send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails)
        throw new Error(
          result.exceptionDetails.exception?.description ?? result.exceptionDetails.text,
        );
      return result.result.value;
    },
    async until(expression, timeout = 15000) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        if (await this.evaluate(expression)) return;
        await wait(100);
      }
      throw new Error(`Browser condition timed out: ${expression}`);
    },
    async close() {
      ws.close();
      process.kill();
      await Promise.race([new Promise((r) => process.once('exit', r)), wait(1000)]);
      await rm(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 });
    },
  };
}
