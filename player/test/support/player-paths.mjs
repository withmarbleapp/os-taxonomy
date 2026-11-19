// Lesson code imports the player's shared modules by the paths the player
// serves them at (/sdk/..., /contract/...). This lets Node resolve the same
// paths, so a lesson's model can be tested without a browser.
//   node --import ./test/support/player-paths.mjs --test ...
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const player = resolve(import.meta.dirname, '../..');
const served = { '/sdk/': 'packages/lesson-sdk/', '/contract/': 'packages/lesson-contract/' };
registerHooks({
  resolve(specifier, context, next) {
    for (const [prefix, folder] of Object.entries(served))
      if (specifier.startsWith(prefix))
        return { url: pathToFileURL(resolve(player, folder, specifier.slice(prefix.length))).href, shortCircuit: true };
    return next(specifier, context);
  },
});
