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

On this Ubuntu machine, Electron cannot start because unprivileged namespaces are
restricted and its SUID sandbox helper is not installed with system permissions.
The browser player is the working development route. A properly installed Linux
package needs an administrator-managed sandbox setup / distribution policy. Do
not ship or use `--no-sandbox` as the solution. See the [path-specific AppArmor
setup](docs/linux-desktop.md) for this Ubuntu host. No system permissions were changed.

## Tutor connections

- **Local model:** run an OpenAI-compatible HTTP server on loopback, select its
  model and `/v1` endpoint. It must support JSON-schema structured output. No
  cloud fallback is used. Model installation is separate; Marble does not yet
  manage LLM weights or qualify a recommended model for these lessons.
- **Claude Code:** install the official CLI, run `claude auth login`, and choose
  Claude in Settings. Marble invokes unmodified `claude -p` with structured
  output, no built-in tools, hooks, ambient MCP servers or persisted sessions.
  Account tokens are never read or copied by Marble. API-key environment
  variables are not forwarded, so an inherited key does not silently select API
  billing. Subscription limits and provider eligibility still apply.
- **Codex:** install the official CLI and run `codex login`. The experimental
  adapter invokes `codex exec` with structured output, ephemeral sessions,
  ignored ambient config, read-only sandbox, and disabled shell/browser/app
  capabilities. This is a local developer integration, **not a commercially
  approved subscription authentication path**. Before distributing Marble as a
  commercial product, qualify the supported Sign in with ChatGPT / partner path.

Both subscription modes send the final transcript, conversation, lesson guidance
and current model state to the provider. They are not offline. Subprocess startup
per decision currently adds latency; live account behavior has not been evaluated
in this implementation. Do not infer classroom readiness from fixture tests.

Official integration references:
[Claude subscription use](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan),
[Claude headless](https://code.claude.com/docs/en/headless),
[Claude integration terms](https://code.claude.com/docs/en/legal-and-compliance),
[Codex app-server eligibility](https://learn.chatgpt.com/docs/app-server),
[Sign in with ChatGPT](https://developers.openai.com/siwc).

## Local voice

The existing Moonshine / Phonon worker stack is reused. Install `uv` and `curl`,
then provision its pinned dependencies and checksummed models once:

```sh
npm run setup:voice -- /absolute/path/to/marble-voice
```

Set that directory in Settings. An existing prototype
installation containing `.venv` and `local-speech/models` can be used directly.
Microphone audio stays local and is not saved. The current player uses complete
hold/release recordings and WAV playback; native streaming worker methods are
preserved but streaming playback is not yet connected in this new UI. No cloud
speech or OS-voice fallback is used. An end-user installer for Python and model
provisioning remains to be built. English/Linux is the checked configuration;
Mac and Windows packaging and hardware behavior remain untested.

## Lesson controls

Lessons fill the window. The player overlays the shared walkie-talkie: hold its
red button or Space to talk, then release to send. Space also works after clicking
inside the lesson, but leaves text fields and open menus alone. Enter on the red
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
subscription inference was run. Linux unpacked build succeeds; native launch on
this host is blocked by the sandbox installation described above. Other operating
systems and actual child learning have not been validated.
