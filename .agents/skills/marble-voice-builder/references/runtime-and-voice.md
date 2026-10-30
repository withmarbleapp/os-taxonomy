# Runtime and local voice

Use the [shared player](shared-player.md), not a per-lesson runtime.
The [player README](../../../../player/README.md) documents voice provisioning,
provider connections, development commands and distribution limitations.

`player/packages/voice` contains capture/playback, worker source, dependency locks,
checksummed model manifests and setup tools. Large models are installed locally,
not committed or included in lesson packages. Settings offers Claude, Codex or On this device and manages browser speech setup automatically.
Moonshine and Phonon run in browser workers; Python is not required. Model files
live in the player data directory and are verified against the pinned manifest.
See the [browser speech notes](../../../../player/docs/browser-speech.md) for
hosting requirements and validation limits.

`player/packages/teaching-runtime` orchestrates adaptive conversation and fresh
state. `player/packages/providers` contains inference adapters. `player/apps/player`
owns the walkie and keyboard composer. `player/apps/desktop` owns native lifecycle
and permissions. `player/apps/local-service` owns local APIs and journals.

Microphone recordings stay local. Provider adapters receive the transcript and
lesson context; use synthetic data for authorised integration checks. There is no
automatic cloud fallback. See the README for experimental subscription integration
limits and native sandbox requirements. Do not promise tested child recognition,
all-platform packaging or fully offline teaching from fixture checks.

The managed local LLM lives in `player/packages/inference`, with pinned model
provisioning and persistent lesson-session context. The shared runtime streams
sentences to TTS, warms the voice engine, and prepares one sentence ahead.
Do not reproduce provider setup, audio queues or playback in a lesson package.
See [in-app inference](../../../../player/docs/device-inference.md) for the
current model, measured checks and platform limits.
