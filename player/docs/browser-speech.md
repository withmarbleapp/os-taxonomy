# Browser speech prototype

The player runs Moonshine small-streaming English and Phonon Q8 / Freya in Web
Workers. No Node, Python or native binding is used for speech inference. The
Electron local service only downloads, verifies, persists and serves model files.
A stable disk cache avoids redownloading when Electron's loopback port changes.
The pinned runtime dependencies are bundled in the desktop app, never loaded
from a script CDN. `browser-models.json` pins file URLs, byte sizes and SHA-256.
Freya's small conditioning file is bundled to preserve the original voice.

The npm Moonshine 0.1.5 WASM binding recognizes `frontend.ort`, not the newer
native bundle's `frontend.model.ort`/`frontend.weights.ort` pair. We use the
26_07_30 model bundle advertised by the WASM runtime's own dependency manifest.
Phonon uses the same 31m English Q8 model revision and Freya conditioning as before.

## Validation

`npm test` checks provider detection, failed inference, settings preservation,
verified downloads, corrupt-download retry and persistent model reuse.
`npm run test:browser` covers lesson behavior and frame isolation using fixtures.

For real speech with already downloaded browser-compatible model files:

```sh
node scripts/browser-speech-prototype.mjs /absolute/path/to/browser-models
```

The directory has `moonshine/` and `phonon/` as listed in the manifest. This test
uses no LLM calls and saves no microphone audio. It tests the actual Settings
setup flow, real synthesis and transcription, interruption, page responsiveness,
and reload with external networking blocked. Synthetic self-transcription is a
pipeline smoke test, not evidence of child-speech accuracy. The benchmark on the
development Linux host synthesized 4.4 seconds of speech in ~0.7 seconds and
transcribed it in ~0.6 seconds. Hardware and startup costs vary.

## Hosted portability

The same `browser-speech.mjs` and workers can run on a secure hosted page. Serve
runtime files at `/speech-vendor/`, voice source at `/voice/`, and model assets at
`/speech-models/`. A hosted player still needs a download/cache controller (Cache
API or OPFS), storage quota/eviction handling and offline app-asset caching. The
current model-store controller is for desktop disk persistence, not a finished
hosted installation implementation.

Serve COOP `same-origin` and COEP `require-corp` for threaded WASM. Cross-origin
assets must opt into CORS/CORP. The lesson frame remains opaque and cannot use
privileged APIs or fetch models. The main player permits WASM compilation but
not JavaScript eval. Moonshine's Emscripten/embind build needs JavaScript Function
construction; that permission is restricted to the trusted STT worker and its
vendor worker responses. Lessons never receive it. A future Emscripten build
with dynamic execution disabled could remove that narrow exception.

A web page cannot launch the user's Claude/Codex CLI. Subscription inference
continues to need the local application/bridge. Fully local hosted lessons would
also need a browser-compatible language model; speech portability does not make
subscription inference browser-native.

Primary runtime references:
- https://github.com/moonshine-ai/moonshine/tree/main/language-bindings/wasm
- https://github.com/gradium-ai/xn-ptts/blob/main/ptts-wasm/js/README.md
- https://onnxruntime.ai/docs/tutorials/web/

Linux Chromium is tested. Other desktop platforms, browser storage eviction,
child speech, low-memory devices and mobile autoplay behavior remain unqualified.
