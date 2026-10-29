import http from 'node:http';
import { readFile, writeFile, mkdir, readdir, appendFile } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  loadDirectory,
  install,
  pack,
  MAX_ARCHIVE,
} from '../../packages/authoring-tools/archive.mjs';
import { safePath } from '../../packages/lesson-contract/package.mjs';
import { validate } from '../../packages/lesson-contract/contracts.mjs';
import { tutorSystem, teachingTools } from '../../packages/teaching-runtime/session.mjs';
import { infer, decisionSchema } from '../../packages/providers/index.mjs';
import { createLocalSpeech } from '../../packages/voice/local-speech.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
export const defaults = {
  provider: 'preview',
  model: '',
  endpoint: 'http://127.0.0.1:1234/v1',
  speechDirectory: '',
  speech: false,
};
export function checkSettings(input) {
  const s = { ...defaults };
  if (!input || typeof input !== 'object') throw Error('Invalid settings');
  if (!['preview', 'local', 'claude', 'codex'].includes(input.provider))
    throw Error('Unknown provider');
  for (const k of ['model', 'endpoint', 'speechDirectory'])
    if (input[k] !== undefined && (typeof input[k] !== 'string' || input[k].length > 1000))
      throw Error('Invalid ' + k);
  Object.assign(
    s,
    Object.fromEntries(
      Object.keys(s)
        .filter((k) => input[k] !== undefined)
        .map((k) => [k, input[k]]),
    ),
  );
  if (typeof s.speech !== 'boolean') throw Error('Invalid speech setting');
  if (s.provider === 'local') {
    const url = new URL(s.endpoint);
    if (
      url.protocol !== 'http:' ||
      !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
      url.username ||
      url.password
    )
      throw Error('Use a local HTTP model endpoint');
    if (!s.model.trim()) throw Error('Enter your local model name');
  }
  return s;
}
async function body(req, limit) {
  let n = 0;
  const chunks = [];
  for await (const b of req) {
    n += b.length;
    if (n > limit) throw Error('Request is too large');
    chunks.push(b);
  }
  return Buffer.concat(chunks);
}
export async function createService({
  dataDir,
  port = 0,
  inference = infer,
  speech: suppliedSpeech,
} = {}) {
  if (!dataDir) throw Error('dataDir is required');
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  await mkdir(join(dataDir, 'library'), { recursive: true });
  await mkdir(join(dataDir, 'logs'), { recursive: true });
  let settings = { ...defaults };
  try {
    settings = checkSettings(JSON.parse(await readFile(join(dataDir, 'settings.json'), 'utf8')));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  const token = randomUUID(),
    catalog = new Map();
  let speech = suppliedSpeech,
    active = 0;
  async function refresh() {
    catalog.clear();
    for (const base of [join(root, 'lessons'), join(dataDir, 'library')]) {
      for (const name of await readdir(base)) {
        if (name.startsWith('.')) continue;
        const first = join(base, name);
        let dirs = [first];
        if (base.endsWith('library')) dirs = (await readdir(first)).map((v) => join(first, v));
        for (const d of dirs) {
          try {
            const p = await loadDirectory(d);
            catalog.set(p.manifest.id + '@' + p.manifest.version, p);
          } catch (e) {
            console.error('Skipped invalid lesson:', d, e.message);
          }
        }
      }
    }
  }
  await refresh();
  const startSpeech = () => {
    if (!settings.speech || !settings.speechDirectory)
      throw Error('Set up local speech and enable it in Settings');
    if (!speech) speech = createLocalSpeech({ directory: settings.speechDirectory });
    return speech;
  };
  const server = http.createServer(async (req, res) => {
    const json = (status, value) => {
      res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify(value));
    };
    const origin = `http://127.0.0.1:${server.address().port}`;
    if (req.headers.host !== new URL(origin).host) {
      json(403, { error: 'Invalid host' });
      return;
    }
    const url = new URL(req.url, origin),
      path = url.pathname;
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    );
    try {
      if (path.startsWith('/api/')) {
        // An opaque lesson frame may not read config, or use the host token.
        if (req.headers.origin && req.headers.origin !== origin) {
          json(403, { error: 'Player origin required' });
          return;
        }
        if (req.headers['sec-fetch-site'] === 'cross-site') {
          json(403, { error: 'Player origin required' });
          return;
        }
        if (path === '/api/config' && req.method === 'GET') {
          json(200, { token, settings, dataDir });
          return;
        }
        if (req.headers['x-marble-token'] !== token) {
          json(403, { error: 'Player token required' });
          return;
        }
        if (req.method === 'POST' && req.headers.origin !== origin) {
          json(403, { error: 'Player origin required' });
          return;
        }
        if (req.method === 'GET' && path === '/api/library') {
          json(
            200,
            [...catalog.values()].map((p) => ({
              manifest: p.manifest,
              teaching: p.teaching,
              experience: p.experience,
              url: `/content/${p.manifest.id}/${p.manifest.version}/${p.manifest.entry}`,
            })),
          );
          return;
        }
        if (req.method === 'GET' && path === '/api/export') {
          const p = catalog.get(url.searchParams.get('id') + '@' + url.searchParams.get('version'));
          if (!p) throw Error('Unknown lesson');
          const bytes = await pack(p.directory);
          res.writeHead(200, {
            'content-type': 'application/zip',
            'content-disposition': `attachment; filename="${p.manifest.id}-${p.manifest.version}.lesson"`,
          });
          res.end(bytes);
          return;
        }
        if (req.method === 'GET' && path === '/api/logs') {
          const names = (await readdir(join(dataDir, 'logs')))
            .filter((n) => n.endsWith('.jsonl'))
            .sort()
            .reverse();
          json(200, names);
          return;
        }
        if (req.method === 'GET' && path === '/api/log') {
          const name = url.searchParams.get('name');
          if (!/^[0-9a-f-]+\.jsonl$/.test(name)) throw Error('Invalid log');
          res.writeHead(200, { 'content-type': 'application/x-ndjson' });
          res.end(await readFile(join(dataDir, 'logs', name)));
          return;
        }
        if (req.method !== 'POST') {
          json(404, { error: 'Unknown API' });
          return;
        }
        if (active >= 3) {
          json(429, { error: 'Too many active requests' });
          return;
        }
        active++;
        const controller = new AbortController();
        res.on('close', () => {
          if (!res.writableEnded) controller.abort();
        });
        try {
          if (path === '/api/import') {
            const p = await install(await body(req, MAX_ARCHIVE), join(dataDir, 'library'));
            await refresh();
            json(200, p.manifest);
          } else if (path === '/api/settings') {
            const next = checkSettings(JSON.parse(await body(req, 12000)));
            await writeFile(join(dataDir, 'settings.json'), JSON.stringify(next, null, 2), {
              mode: 0o600,
            });
            settings = next;
            speech?.close();
            speech = null;
            json(200, settings);
          } else if (path === '/api/log') {
            const { sessionId, entry } = JSON.parse(await body(req, 500000));
            if (!/^[0-9a-f-]{36}$/.test(sessionId)) throw Error('Invalid session ID');
            await appendFile(
              join(dataDir, 'logs', sessionId + '.jsonl'),
              JSON.stringify({ time: new Date().toISOString(), ...entry }) + '\n',
              { mode: 0o600 },
            );
            json(200, { saved: true });
          } else if (path === '/api/infer') {
            const input = JSON.parse(await body(req, 750000)),
              p = catalog.get(input.lessonId + '@' + input.version);
            if (!p) throw Error('Unknown lesson');
            validate(p.experience.stateSchema, input.context?.snapshot?.state);
            if (!Array.isArray(input.messages) || input.messages.length > 60)
              throw Error('Invalid conversation');
            const tools = [
              ...teachingTools,
              ...p.experience.actions.filter((a) =>
                input.context.snapshot.availableActions.includes(a.name),
              ),
            ];
            const decision = await inference({
              settings,
              system: tutorSystem(p),
              tools,
              messages: input.messages,
              context: input.context,
              signal: controller.signal,
            });
            validate(decisionSchema, decision);
            const t = tools.find((t) => t.name === decision.tool);
            if (!t) throw Error('Unavailable tutor tool');
            validate(t.inputSchema, JSON.parse(decision.arguments));
            json(200, decision);
          } else if (path === '/api/transcribe') {
            const audio = await body(req, 4000000);
            json(200, {
              text: await startSpeech().transcribe(
                audio,
                req.headers['content-type'],
                controller.signal,
              ),
            });
          } else if (path === '/api/speak') {
            const { text } = JSON.parse(await body(req, 12000));
            if (typeof text !== 'string' || text.length > 1500) throw Error('Invalid speech');
            const audio = await startSpeech().synthesize(text, controller.signal);
            res.writeHead(200, { 'content-type': audio.type });
            res.end(audio.bytes);
          } else json(404, { error: 'Unknown API' });
        } finally {
          active--;
        }
        return;
      }
      let file,
        lesson = false;
      if (path.startsWith('/content/')) {
        const [, , id, version, ...parts] = path.split('/'),
          p = catalog.get(id + '@' + version),
          rel = parts.join('/');
        if (!p || !safePath(rel) || parts.some((x) => x.startsWith('.')) || rel === 'receipt.json')
          throw Error('Unknown asset');
        file = join(p.directory, rel);
        lesson = true;
      } else {
        const routes = {
          '/player/': 'apps/player/',
          '/sdk/': 'packages/lesson-sdk/',
          '/contract/': 'packages/lesson-contract/',
          '/runtime/': 'packages/teaching-runtime/',
          '/lesson-contract/': 'packages/lesson-contract/',
          '/voice/': 'packages/voice/',
        };
        if (path === '/') file = join(root, 'apps/player/index.html');
        else {
          const prefix = Object.keys(routes).find((p) => path.startsWith(p));
          if (!prefix || !safePath(path.slice(prefix.length))) throw Error('Unknown asset');
          file = join(root, routes[prefix], path.slice(prefix.length));
        }
      }
      const mime = {
        '.html': 'text/html',
        '.mjs': 'text/javascript',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.ttf': 'font/ttf',
        '.woff2': 'font/woff2',
        '.json': 'application/json',
        '.md': 'text/plain',
        '.txt': 'text/plain',
      }[extname(file)];
      if (!mime) throw Error('Unknown asset type');
      if (lesson) {
        res.setHeader(
          'Content-Security-Policy',
          `default-src 'none'; script-src ${origin}/content/ ${origin}/sdk/; style-src ${origin}/content/ ${origin}/player/ 'unsafe-inline'; img-src ${origin}/content/ data:; font-src ${origin}/player/; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors ${origin}; sandbox allow-scripts allow-forms`,
        );
      }
      if (
        lesson ||
        path.startsWith('/sdk/') ||
        path === '/player/scene-base.css' ||
        path.startsWith('/player/assets/')
      )
        res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, { 'content-type': mime, 'cache-control': 'no-store' });
      res.end(await readFile(file));
    } catch (e) {
      if (!res.headersSent) json(path.startsWith('/api/') ? 400 : 404, { error: e.message });
      else res.end();
    }
  });
  await new Promise((r, j) => {
    server.once('error', j);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', j);
      r();
    });
  });
  return {
    server,
    origin: `http://127.0.0.1:${server.address().port}`,
    token,
    close: () => {
      speech?.close();
      server.closeAllConnections();
      return new Promise((r) => server.close(r));
    },
  };
}
