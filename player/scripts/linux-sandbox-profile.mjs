// Print a path-specific Ubuntu AppArmor profile; never change system policy.
import { realpath, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = await realpath(fileURLToPath(new URL('..', import.meta.url)));
const binaries = [
  ['marble-development', join(root, 'node_modules/electron/dist/electron')],
  ['marble-local', join(root, 'dist/linux-unpacked/marble-player')],
];
for (const [, path] of binaries) {
  await access(path);
  if (/["\\\n\r*?\[\]{}^]/.test(path)) throw Error('Unsupported character in executable path');
}
console.log('# Generated for this checkout. Regenerate after moving it.');
console.log('# Allows these executables to create their Chromium sandbox.');
console.log('abi <abi/4.0>,\ninclude <tunables/global>\n');
for (const [name, path] of binaries)
  console.log(`profile ${name} "${path}" flags=(unconfined) {\n  userns,\n}\n`);
