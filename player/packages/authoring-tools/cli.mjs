import { readFile, writeFile, cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { pack, unpack, install } from './archive.mjs';
const [command, input, output] = process.argv.slice(2);
try {
  if (command === 'create') {
    if (!input) throw Error('Supply a new lesson directory');
    await mkdir(resolve(input), { recursive: false });
    await cp(fileURLToPath(new URL('./template/', import.meta.url)), resolve(input), {
      recursive: true,
    });
    console.log(resolve(input));
  } else if (command === 'validate') {
    const bytes = await pack(input);
    const p = unpack(bytes);
    console.log(`Valid: ${p.manifest.id} ${p.manifest.version}, ${bytes.length} bytes`);
  } else if (command === 'pack') {
    const bytes = await pack(input),
      p = unpack(bytes),
      target = resolve(output ?? `${p.manifest.id}-${p.manifest.version}.lesson`);
    await writeFile(target, bytes);
    console.log(target);
  } else if (command === 'import') {
    if (!output) throw Error('Supply the library directory');
    console.log((await install(await readFile(input), resolve(output))).directory);
  } else if (command === 'inspect')
    console.log(JSON.stringify(unpack(await readFile(input)).manifest, null, 2));
  else
    throw Error(
      'Usage: npm run marble -- create NEW_DIR | validate DIR | pack DIR [FILE.lesson] | inspect FILE.lesson | import FILE.lesson LIBRARY',
    );
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
