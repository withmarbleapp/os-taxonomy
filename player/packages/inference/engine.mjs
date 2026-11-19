import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// One process per player, no listening port and no renderer access to native code.
const worker = () =>
  fork(fileURLToPath(new URL('./worker.mjs', import.meta.url)), [], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    execArgv: [],
    stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
  });
// `launch` starts the model process; tests pass a stand-in.
export function createInferenceEngine({ modelPath, launch = worker }) {
  let child, pending, timer;
  const stop = () => {
    clearTimeout(timer);
    const process = child;
    child = null;
    process?.kill();
    if (pending) {
      const job = pending;
      pending = null;
      job.reject(Error('Local tutor stopped. Please try again.'));
    }
  };
  function start() {
    if (child) return child;
    child = launch();
    const current = child;
    // Do not forward model prompts or child stderr to the UI.
    current.stderr?.resume();
    current.on('message', (message) => {
      if (current !== child || !pending) return;
      if (message.event) {
        try {
          pending.onEvent?.(message.event);
        } catch {
          stop();
        }
        return;
      }
      const job = pending;
      pending = null;
      if (message.error) job.reject(Error(message.error));
      else job.resolve(message.result);
      timer = setTimeout(stop, 30 * 60 * 1000);
      timer.unref();
    });
    const failed = () => {
      if (current !== child) return;
      child = null;
      if (pending) {
        const job = pending;
        pending = null;
        job.reject(Error('The local tutor could not run. Close other GPU-heavy apps and retry.'));
      }
    };
    current.on('error', failed);
    current.on('exit', failed);
    return child;
  }
  // The model answers one request at a time. Requests wait their turn in the
  // order they arrive, so a connection check and a lesson never collide.
  let queue = Promise.resolve();
  return {
    async infer({ system, tools, standingTools, messages, context, records, signal, onEvent }) {
      if (signal?.aborted) throw Error('Cancelled');
      const previous = queue;
      let finished;
      queue = new Promise((resolve) => (finished = resolve));
      try {
        // A request cancelled while waiting gives up at once, without touching
        // the one that is running.
        await new Promise((resolve, reject) => {
          const cancel = () => reject(Error('Cancelled'));
          signal?.addEventListener('abort', cancel, { once: true });
          previous.then(() => {
            signal?.removeEventListener('abort', cancel);
            resolve();
          });
        });
        if (signal?.aborted) throw Error('Cancelled');
        clearTimeout(timer);
        const process = start();
        const abort = () => stop();
        const timeout = setTimeout(stop, 120000);
        signal?.addEventListener('abort', abort, { once: true });
        try {
          return await new Promise((resolve, reject) => {
            pending = { resolve, reject, onEvent };
            process.send({ modelPath, system, tools, standingTools, messages, context, records });
          });
        } finally {
          clearTimeout(timeout);
          signal?.removeEventListener('abort', abort);
        }
      } finally {
        // The next request starts only once every earlier one has finished.
        previous.then(finished);
      }
    },
    close: stop,
  };
}
