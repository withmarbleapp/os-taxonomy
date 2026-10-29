# Runtime and local voice

Use the [shared player](shared-player.md), not a per-lesson runtime.
The [player README](../../../../player/README.md) documents voice provisioning,
provider connections, development commands and distribution limitations.

`player/packages/voice` contains capture/playback, worker source, dependency locks,
checksummed model manifests and setup tools. Large models are installed locally,
not committed or included in lesson packages. Existing speech installations can
be selected in Settings; moving the repository does not require downloading them.

`player/packages/teaching-runtime` orchestrates adaptive conversation and fresh
state. `player/packages/providers` contains inference adapters. `player/apps/player`
owns the walkie and keyboard composer. `player/apps/desktop` owns native lifecycle
and permissions. `player/apps/local-service` owns local APIs and journals.

Microphone recordings stay local. Provider adapters receive the transcript and
lesson context; use synthetic data for authorised integration checks. There is no
automatic cloud fallback. See the README for experimental subscription integration
limits and native sandbox requirements. Do not promise tested child recognition,
all-platform packaging or fully offline teaching from fixture checks.
