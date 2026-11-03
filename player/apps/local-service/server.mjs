import {
  localEndpoints,
  localAvailability,
  subscriptionModels,
} from '../../packages/providers/local.mjs';
import http from 'node:http';
import { readFile, writeFile, mkdir, readdir, appendFile, rm, realpath } from 'node:fs/promises';
import { join, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  loadDirectory,
  install,
  unpack,
  pack,
  MAX_ARCHIVE,
} from '../../packages/authoring-tools/archive.mjs';
import { safePath } from '../../packages/lesson-contract/package.mjs';
import { validate } from '../../packages/lesson-contract/contracts.mjs';
import { tutorSystem, teachingTools } from '../../packages/teaching-runtime/session.mjs';
import { providerAvailability } from '../../packages/providers/availability.mjs';
import { infer, decisionSchema } from '../../packages/providers/index.mjs';
import { createModelStore } from '../../packages/voice/model-store.mjs';
import { createLocalSpeech } from '../../packages/voice/local-speech.mjs';
import { createInferenceStore } from '../../packages/inference/model-store.mjs';
import { createInferenceEngine } from '../../packages/inference/engine.mjs';
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
  if (
    !['preview', 'local', 'claude', 'codex', 'ollama', 'lmstudio', 'device'].includes(
      input.provider,
    )
  )
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
  if (subscriptionModels[s.provider]) s.model = subscriptionModels[s.provider];
  if (localEndpoints[s.provider]) s.endpoint = localEndpoints[s.provider];
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
  availability = providerAvailability,
  localDiscovery = localAvailability,
  modelStore: suppliedModelStore,
  inferenceStore: suppliedInferenceStore,
  deviceEngine: suppliedDeviceEngine,
} = {}) {
  if (!dataDir) throw Error('dataDir is required');
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  await mkdir(join(dataDir, 'library'), { recursive: true });
  await mkdir(join(dataDir, 'logs'), { recursive: true });
  const removedFile = join(dataDir, 'removed-lessons.json');
  let removed = new Set();
  try {
    removed = new Set(JSON.parse(await readFile(removedFile, 'utf8')));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  const saveRemoved = () => writeFile(removedFile, JSON.stringify([...removed]));
  let settings = { ...defaults };
  try {
    settings = checkSettings(JSON.parse(await readFile(join(dataDir, 'settings.json'), 'utf8')));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  if (['ollama', 'lmstudio'].includes(settings.provider))
    settings = { ...settings, provider: 'device', model: '' };
  const inferenceModels =
    suppliedInferenceStore ??
    createInferenceStore({ directory: join(dataDir, 'inference-models') });
  const deviceEngine =
    suppliedDeviceEngine ?? createInferenceEngine({ modelPath: inferenceModels.path });
  const runInference = async (input) => {
    if (input.settings.provider !== 'device') return inference(input);
    if ((await inferenceModels.inspect()).state !== 'ready')
      throw Error('Download the on-device tutor in Settings first.');
    return deviceEngine.infer(input);
  };
  const models =
    suppliedModelStore ??
    createModelStore({
      directory: join(dataDir, 'voice-models'),
      legacyDirectory: settings.speechDirectory,
    });
  const token = randomUUID(),
    catalog = new Map(),
    bundled = new Map();
  let speech = suppliedSpeech,
    active = 0;
  async function refresh() {
    catalog.clear();
    bundled.clear();
    for (const base of [join(root, 'lessons'), join(dataDir, 'library')]) {
      for (const name of await readdir(base)) {
        if (name.startsWith('.')) continue;
        const first = join(base, name);
        let dirs = [first];
        if (base.endsWith('library')) dirs = (await readdir(first)).map((v) => join(first, v));
        for (const d of dirs) {
          try {
            const p = await loadDirectory(d);
            const key = p.manifest.id + '@' + p.manifest.version;
            if (base === join(root, 'lessons')) bundled.set(key, p);
            // A device library can never override an app-owned release, even
            // if it was installed by an older version of the player.
            if (!catalog.has(key)) catalog.set(key, p);
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
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
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
          json(200, {
            token,
            settings,
            dataDir,
            speechBackend: suppliedSpeech ? 'fixture' : 'browser',
          });
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
        if (req.method === 'GET' && path === '/api/voice') {
          json(200, await models.inspect());
          return;
        }
        if (req.method === 'GET' && path === '/api/device-model') {
          json(200, await inferenceModels.inspect());
          return;
        }
        if (req.method === 'GET' && path === '/api/connections') {
          json(
            200,
            await Promise.all(
              ['claude', 'codex', 'device'].map(async (provider) => {
                if (provider !== 'device') return availability(provider);
                const state = await inferenceModels.inspect();
                return {
                  ...state,
                  provider,
                  state: state.state === 'ready' ? 'installed' : state.state,
                };
              }),
            ),
          );
          return;
        }
        if (req.method === 'GET' && path === '/api/library') {
          json(
            200,
            [...catalog.values()]
              .filter((p) => !removed.has(p.manifest.id + '@' + p.manifest.version))
              .map((p) => ({
                trustedShortcuts: bundled.get(p.manifest.id + '@' + p.manifest.version) === p,
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
          if (path === '/api/remove-lesson') {
            const { id, version } = JSON.parse(await body(req, 3000));
            const key = id + '@' + version;
            const p = catalog.get(key);
            if (!p) throw Error('Unknown lesson');
            if (bundled.get(key) !== p) {
              // Never follow an imported directory outside the managed library.
              const libraryRoot = await realpath(join(dataDir, 'library'));
              const directory = await realpath(p.directory);
              if (!directory.startsWith(libraryRoot + sep)) throw Error('Invalid lesson location');
              await rm(p.directory, { recursive: true, force: true });
            }
            removed.add(key);
            await saveRemoved();
            await refresh();
            json(200, { removed: true });
          } else if (path === '/api/import') {
            const bytes = await body(req, MAX_ARCHIVE);
            const incoming = unpack(bytes);
            const prior = bundled.get(incoming.manifest.id + '@' + incoming.manifest.version);
            if (prior) {
              if (unpack(await pack(prior.directory)).hash !== incoming.hash)
                throw Error(
                  'This bundled version already exists with different content; increment the version',
                );
              removed.delete(prior.manifest.id + '@' + prior.manifest.version);
              await saveRemoved();
              json(200, prior.manifest);
              return;
            }
            const p = await install(bytes, join(dataDir, 'library'));
            removed.delete(p.manifest.id + '@' + p.manifest.version);
            await saveRemoved();
            await refresh();
            json(200, p.manifest);
          } else if (path === '/api/device-prepare') {
            json(200, inferenceModels.prepare());
          } else if (path === '/api/voice-prepare') {
            json(200, models.prepare());
          } else if (path === '/api/provider-check') {
            const { provider, model } = JSON.parse(await body(req, 3000));
            const isLocal = !!localEndpoints[provider];
            const isDevice = provider === 'device';
            const status = isDevice
              ? { provider, ...(await inferenceModels.inspect()) }
              : await (isLocal ? localDiscovery(provider) : availability(provider));
            if (
              isDevice
                ? status.state !== 'ready'
                : isLocal
                  ? status.state !== 'available'
                  : status.state !== 'signed_in'
            ) {
              json(200, status);
              return;
            }
            if (isLocal && !status.models.includes(model)) {
              json(200, { provider, state: 'choose_model', models: status.models });
              return;
            }
            try {
              const result = await runInference({
                settings: {
                  ...settings,
                  provider,
                  model: isLocal ? model : subscriptionModels[provider],
                },
                system:
                  'Connection check. Return one JSON decision with tool say and arguments containing text ready. No explanation is needed.',
                messages: [],
                context: {},
                tools: [teachingTools.find((t) => t.name === 'say')],
                signal: AbortSignal.any([
                  controller.signal,
                  AbortSignal.timeout(isLocal || isDevice ? 120000 : 30000),
                ]),
              });
              validate(decisionSchema, result);
              if (result.tool !== 'say' || typeof JSON.parse(result.arguments).text !== 'string')
                throw Error('Unexpected reply');
              json(200, { provider, state: 'ready' });
            } catch {
              json(200, { provider, state: 'failed' });
            }
          } else if (path === '/api/settings') {
            const input = JSON.parse(await body(req, 12000));
            // The simple UI selects a provider; preserve internally managed voice settings.
            const next = checkSettings({ ...settings, ...input });
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
          } else if (path === '/api/infer' || path === '/api/infer-stream') {
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
            const streaming = path === '/api/infer-stream';
            const event = (data) => {
              if (streaming && !res.destroyed) res.write(JSON.stringify(data) + '\n');
            };
            if (streaming)
              res.writeHead(200, {
                'content-type': 'application/x-ndjson',
                'cache-control': 'no-store',
              });
            try {
              const decision = await runInference({
                settings,
                system: tutorSystem(p),
                tools,
                standingTools: [...teachingTools, ...p.experience.actions],
                messages: input.messages,
                context: input.context,
                signal: controller.signal,
                onEvent: (data) => {
                  if (data.type === 'speech' && typeof data.text === 'string') event(data);
                  else if (data.type === 'inference_metrics') event(data);
                },
              });
              validate(decisionSchema, decision);
              const t = tools.find((t) => t.name === decision.tool);
              if (!t) throw Error('Unavailable tutor tool');
              validate(t.inputSchema, JSON.parse(decision.arguments));
              if (streaming) {
                event({ type: 'decision', decision });
                res.end();
              } else json(200, decision);
            } catch (error) {
              if (!streaming) throw error;
              event({ type: 'error', message: error.message });
              res.end();
            }
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
      if (path.startsWith('/speech-models/')) {
        file = models.path(path.slice('/speech-models/'.length));
      } else if (path.startsWith('/content/')) {
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
          '/speech-vendor/moonshine/': 'node_modules/@moonshine-ai/moonshine-wasm/dist/',
          '/speech-vendor/phonon/': 'node_modules/phonon-tts/',
        };
        if (path === '/') file = join(root, 'apps/player/index.html');
        else {
          const prefix = Object.keys(routes).find((p) => path.startsWith(p));
          if (!prefix || !safePath(path.slice(prefix.length))) throw Error('Unknown asset');
          file = join(root, routes[prefix], path.slice(prefix.length));
        }
      }
      const mime = {
        '.wasm': 'application/wasm',
        '.ort': 'application/octet-stream',
        '.bin': 'application/octet-stream',
        '.gguf': 'application/octet-stream',
        '.safetensors': 'application/octet-stream',
        '.html': 'text/html',
        '.mjs': 'text/javascript',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf',
        '.woff2': 'font/woff2',
        '.json': 'application/json',
        '.md': 'text/plain',
        '.txt': 'text/plain',
      }[extname(file)];
      if (!mime) throw Error('Unknown asset type');
      // Emscripten's embind uses Function() for bindings. Permit it only inside
      // the trusted STT worker; never in the player page or imported lessons.
      if (path === '/voice/browser-stt-worker.mjs' || path.startsWith('/speech-vendor/moonshine/'))
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-eval'; worker-src 'self'; connect-src 'self';",
        );
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
      ) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      }
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
      inferenceModels.close();
      deviceEngine.close();
      speech?.close();
      server.closeAllConnections();
      return new Promise((r) => server.close(r));
    },
  };
}
