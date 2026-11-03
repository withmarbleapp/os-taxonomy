import { spawn } from 'node:child_process';
import { providerEnvironment } from './index.mjs';

export function inspectCommand(command, args, { timeout = 10000 } = {}) {
  return new Promise((resolve) => {
    let output = '',
      settled = false;
    const child = spawn(command, args, {
      env: providerEnvironment(),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      finish({ code: -1, timeout: true, output: '' });
    }, timeout);
    const collect = (bytes) => {
      output = (output + bytes).slice(-16000);
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('error', (error) =>
      finish({ code: -1, missing: error.code === 'ENOENT', output: '' }),
    );
    child.on('close', (code) => finish({ code, output }));
  });
}
export async function providerAvailability(provider, run = inspectCommand) {
  if (!['claude', 'codex'].includes(provider)) throw Error('Unknown tutor connection');
  const version = await run(provider, ['--version']);
  if (version.code !== 0) return { provider, state: version.missing ? 'missing' : 'unavailable' };
  const auth = await run(
    provider,
    provider === 'claude' ? ['auth', 'status', '--json'] : ['login', 'status'],
  );
  let authenticated = false;
  if (auth.code === 0) {
    if (provider === 'claude') {
      try {
        const status = JSON.parse(auth.output);
        authenticated = status.loggedIn === true && status.authMethod === 'claude.ai';
      } catch {}
    } else authenticated = /logged in using chatgpt/i.test(auth.output);
  }
  return { provider, state: authenticated ? 'signed_in' : 'sign_in' };
}
