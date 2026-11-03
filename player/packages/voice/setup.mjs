import { cp, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const directory = process.argv[2];
if (!directory) throw Error('Usage: npm run setup:voice -- /absolute/path/to/voice');
const root = resolve(directory);
await mkdir(root, { recursive: true });
await cp(fileURLToPath(new URL('./local-speech', import.meta.url)), join(root, 'local-speech'), {
  recursive: true,
});
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const c = spawn(cmd, args, {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, HF_HUB_DISABLE_TELEMETRY: '1' },
    });
    c.on('error', reject);
    c.on('exit', (code) => (code === 0 ? resolve() : reject(Error(`${cmd} exited ${code}`))));
  });
}
const python = join(
  root,
  process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python',
);
await run('uv', ['venv', '--python', '3.12', '--allow-existing', '.venv']);
await run('uv', ['pip', 'sync', '--python', python, 'local-speech/requirements.txt']);
await run(python, ['local-speech/download-ondevice.py']);
console.log('Local speech installed in ' + root);
