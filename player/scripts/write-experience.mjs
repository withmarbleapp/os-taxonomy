// Writes a lesson's experience.json from the descriptor its model exports.
// A lesson built on /sdk/moments.mjs never edits that file by hand.
//   node --import ./test/support/player-paths.mjs scripts/write-experience.mjs lessons/moon-daytime model/moon.mjs
import { writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { format, resolveConfig } from 'prettier';

const [lesson, model] = process.argv.slice(2);
if (!lesson || !model) throw Error('Usage: write-experience.mjs LESSON_FOLDER MODEL_FILE');
const { descriptor } = await import(pathToFileURL(resolve(lesson, model)).href);
const file = resolve(join(lesson, 'experience.json'));
const options = (await resolveConfig(file)) ?? {};
await writeFile(file, await format(JSON.stringify(descriptor), { ...options, filepath: file }));
console.log('Wrote', file);
