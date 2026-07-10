import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../..');

function run(command: string, args: string[], name: string) {
  const child = spawn(command, args, {
    cwd: APP_ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exit(code);
    }
  });
  return child;
}

const api = run('npx', ['tsx', 'watch', 'server/src/index.ts'], 'api');
const client = run('npx', ['vite', '--config', 'client/vite.config.ts'], 'client');

function shutdown() {
  api.kill();
  client.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
