# Marble local player — developer preview

A local-first desktop shell and web player for portable interactive lessons. Cubes
and Croatoan clues share one tutor, speech connection, package loader and log store.
This directory is the authoritative implementation in the os-taxonomy repository.
The audio authoring skill references it directly; exported starters are generated
artifacts, not another maintained implementation. Original prototypes remain separate.

## Run

Requires Node 24+ for development.

```sh
npm ci
npm start                   # Electron desktop app
npm run dev                 # local browser player at http://127.0.0.1:3235
```

Before starting a lesson, choose a tutor connection and configure local voice in
Settings. Lessons use voice, with a keyboard button for typed replies.

On Ubuntu 24.04, native launch requires an app-specific user-namespace permission.
See the [path-specific AppArmor setup](docs/linux-desktop.md). Native startup has
been verified on this development host after that setup, with sandboxing enabled.
Do not ship or use `--no-sandbox` as a workaround. Production installer setup and
native microphone/lesson qualification remain separate work.

## Tutor connections

- **On this device:** Marble bundles a native llama.cpp engine. Download the
  verified Qwen3.5 4B model once in Settings (2.74 GB), then learn offline.
  No Ollama, LM Studio, terminal or account is needed. See
  [managed inference](docs/device-inference.md) for implementation and limits.
- **Claude Code:** install the official CLI, run `claude auth login`, and choose
  Claude in Settings. Marble invokes unmodified `claude -p` with structured
  output, no built-in tools, hooks, ambient MCP servers or persisted sessions.
  Account tokens are never read or copied by Marble. API-key environment
  variables are not forwarded, so an inherited key does not silently select API
  billing. Subscription limits and provider eligibility still apply.
- **Codex:** install the official CLI and run `codex login`. The experimental
  adapter invokes `codex app-server` over stdio with structured output and
  incremental text events, ephemeral sessions, read-only sandbox, disabled
  ambient MCP servers and hooks, and disabled shell/browser/app
  capabilities. This is a local developer integration, **not a commercially
  approved subscription authentication path**. Before distributing Marble as a
  commercial product, qualify the supported Sign in with ChatGPT / partner path.

Both subscription modes send the final transcript, conversation, lesson guidance
and current model state to the provider. They are not offline. Subprocess startup
per decision currently adds latency. Codex sentence streaming has been checked
with live inference; Claude streaming has protocol fixture coverage, with live
verification pending a refreshed local Claude login.

Official integration references:
[Claude subscription use](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan),
[Claude headless](https://code.claude.com/docs/en/headless),
[Claude integration terms](https://code.claude.com/docs/en/legal-and-compliance),
[Codex app-server eligibility](https://learn.chatgpt.com/docs/app-server),
[Sign in with ChatGPT](https://developers.openai.com/siwc).

## Local voice

Choose **Claude**, **Codex** or **On this device** in Settings. Marble checks installation and subscription
sign-in, then makes a small inference check for the selected provider. If it cannot
connect, Setup instructions links to the official installation and login guides.
No account tokens are collected by Marble. Claude explicitly requests `claude-haiku-5-5`;
Codex explicitly requests `gpt-6-luna` (the current Luna model verified 2026-10-29).
Connection checks use the same model as lessons, without a silent fallback.

Speech now runs in browser workers inside Electron: pinned Moonshine WASM 0.1.5
(small-streaming English, browser-compatible 26_07_30 bundle) and Phonon 0.5.0
(Q8 English / the original Freya voice). Selecting a tutor prepares voice automatically;
Set up voice / Retry is also available. About 230 MB is downloaded once into the
app's per-user data directory, with size and SHA-256 verification before use.
Existing configured native model files are reused when their checksums match.
There is no Python, uv, curl, speech-folder field, cloud speech, or OS-voice fallback
in this path. Native Python adapters remain as development reference, not the default.

Hold/release recordings are decoded and transcribed in a worker. Phonon streams
PCM to Web Audio for prompt playback and interruption. Audio is not saved or
sent to a provider. The browser prototype has passed real synthesis/transcription,
interruption, and offline-reload tests on Linux Chromium; child speech accuracy,
Mac/Windows and mobile browsers are not yet qualified. See
[browser speech](docs/browser-speech.md) for hosting requirements and test commands.

## Lesson controls

Lessons fill the window. The player overlays the shared walkie-talkie: hold its
red button or Space to talk, then release to send. Space also works after clicking
inside app-bundled lessons, but leaves text fields and open menus alone. Imported
lessons use the player walkie button, or Space after focusing that button; their
untrusted code cannot start microphone recording through the frame bridge. Enter on the red
button toggles recording. The keyboard button opens a typed reply; the cog opens
Settings. Opening either pauses recording and tutor speech. The lesson menu offers
optional captions, conversation history, settings and return to the library.

## Portable lesson packages

A `.lesson` is a ZIP of browser assets and declarative metadata. It contains no
backend, provider credentials, model weights, recordings or session logs.

```sh
npm run marble -- create /path/to/new-lesson
npm run marble -- validate /path/to/new-lesson
npm run marble -- pack /path/to/new-lesson /path/to/my-lesson.lesson
npm run marble -- inspect /path/to/my-lesson.lesson
```

Use Add a lesson in the library to import; Export lesson produces a shareable
file. Versions are immutable: different content requires an increased version.
Files carry SHA-256 integrity checks, not publisher authenticity signatures.
Anyone with the compatible player can import the package. There is no hosted
catalog, upload service or automatic update mechanism yet.

See [the package contract](docs/package-contract.md) and
[architecture](docs/architecture.md). The equal-parts starter is a mechanics
example, not a research-complete learning experience.

## Data and logs

Desktop: Electron's per-user Marble application data directory.
Browser development: `~/.local/share/marble`, overridable with `MARBLE_DATA_DIR`.
`settings.json` holds non-secret settings, `library/` installed packages, and
`logs/*.jsonl` conversations, model observations and tutor decisions. These are
local sensitive learner records, never included in exports. No audio is stored.
The lesson menu can download the current trace; filesystem logs are also
available without extracting anything from the tab. Automatic retention, log
rotation and a parent-facing delete/history UI are still needed for distribution.

## Verification

```sh
npm test
npm run test:browser
node scripts/voice-test.mjs /path/to/existing/voice
npm run dist:linux
```

Tests cover package import/export, traversal/tampering rejection, API isolation,
wrong→correct cube attempts, stale decisions, provider flags and cancellation.
Browser fixtures cover both scenes and import a third lesson without changing a
registry. Real local synthesis/recognition was smoke-tested; no paid or live
subscription inference was run. Linux unpacked build succeeds; native startup on
this host passes after the AppArmor setup described above. Other operating
systems and actual child learning have not been validated.

## Managed on-device inference

See [device-inference.md](docs/device-inference.md). Existing Ollama/LM Studio
preferences migrate to On this device when the service starts. External server
adapters remain internal compatibility code; the Settings UI uses the bundled
engine and managed model instead.
