// The 3D kit's pictures.
//
//   npm run kit -- fixtures [name ...]
//       Captures the kit's fixtures into the skill's reference pictures.
//   npm run kit -- look FILE.mjs [--export name] [--setting daylight] [--out sheet.png]
//       Draws one custom object from three sides beside kit objects of the same
//       setting, so its author can see whether it belongs. FILE's default (or
//       named) export is a function returning a THREE.Group, written as it would
//       be inside a lesson, importing from /sdk/stage.mjs.
import http from 'node:http';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { join, extname, resolve, sep, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const player = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sdk = join(player, 'packages/lesson-sdk');
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.txt': 'text/plain' };

async function serve(routes) {
  const server = http.createServer(async (req, res) => {
    try {
      const path = new URL(req.url, 'http://x').pathname;
      const prefix = Object.keys(routes).find((p) => path.startsWith(p));
      const file = resolve(join(routes[prefix], path.slice(prefix.length)));
      if (!file.startsWith(resolve(routes[prefix]) + sep)) throw Error('outside');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}
const shoot = (url, file, size = '1280,800') =>
  new Promise((done) =>
    spawn(
      process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
      [
        '--headless=new', '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars',
        `--window-size=${size}`, '--virtual-time-budget=6000', `--screenshot=${file}`, url,
      ],
      { stdio: 'ignore' },
    ).on('close', (status) => done(status === 0)),
  );

const [command, ...rest] = process.argv.slice(2);
const flag = (name, fallback) => (rest.includes('--' + name) ? rest[rest.indexOf('--' + name) + 1] : fallback);
if (command === 'fixtures') {
  const out = resolve(player, '../.agents/skills/marble-voice-lesson/references/visual/kit');
  const names = rest.length
    ? rest
    : (await readdir(join(sdk, 'fixtures'))).filter((f) => f.endsWith('.mjs') && f !== 'sheet.mjs').map((f) => f.slice(0, -4));
  await mkdir(out, { recursive: true });
  const server = await serve({ '/sdk/': sdk });
  for (const name of names) {
    const file = join(out, name + '.png');
    const ok = await shoot(`${server.origin}/sdk/gallery.html?still&fixture=${name}${process.env.KIT_TIME ? '&t=' + process.env.KIT_TIME : ''}`, process.env.KIT_OUT ?? file);
    console.log(ok ? 'captured' : 'FAILED', name, '->', file);
  }
  server.close();
} else if (command === 'look' && rest[0]) {
  const source = resolve(rest[0]),
    out = resolve(flag('out', basename(source).replace(/\.m?js$/, '') + '-sheet.png'));
  const server = await serve({ '/sdk/': sdk, '/object/': dirname(source) });
  const query = new URLSearchParams({
    fixture: 'sheet',
    object: '/object/' + basename(source),
    export: flag('export', 'default'),
    setting: flag('setting', 'daylight'),
  });
  const ok = await shoot(`${server.origin}/sdk/gallery.html?still&${query}`, out, '1500,640');
  console.log(ok ? out : 'FAILED');
  server.close();
} else {
  console.error('Usage: npm run kit -- fixtures [name ...] | look FILE.mjs [--export name] [--setting s] [--out file.png]');
  process.exitCode = 1;
}
