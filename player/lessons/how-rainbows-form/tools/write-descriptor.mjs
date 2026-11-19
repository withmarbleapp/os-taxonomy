// Regenerates experience.json from the model's descriptor. Run after changing actions, events or state.
import { writeFile } from 'node:fs/promises';
import { descriptor } from '../model/rainbow.mjs';
await writeFile(new URL('../experience.json', import.meta.url), JSON.stringify(descriptor, null, 2) + '\n');
