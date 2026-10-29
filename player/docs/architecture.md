# Structure and boundaries

```
apps/desktop         Electron lifecycle, microphone permissions, local service
apps/player          Library, sandbox host, conversation, microphone and playback
apps/local-service   Loopback APIs, catalog, imports/exports, logs, provider calls
packages/lesson-contract   Versioned metadata and update validation
packages/lesson-sdk        MessagePort bridge between scene and player
packages/teaching-runtime  Adaptive decisions, latest context, cancellation
packages/providers        Local structured-output HTTP and official CLI adapters
packages/voice            Persistent local speech workers and model provisioning
packages/authoring-tools  Archive validation, CLI and minimal lesson starter
lessons/                  Cubes and Croatoan models, visuals and teaching packages
```

The desktop process owns capabilities; lesson JavaScript executes only in a
sandboxed frame with scripts and local form events enabled, and no same-origin privilege. CSP forbids actual form submission/navigation. The frame
gets no microphone permission, host token, credentials or filesystem interface.
MessagePort commands use session, release and revision identifiers. Domain models
validate legal actions and score submitted work. The host validates schemas,
known actions and monotonic revisions. Node reads metadata, never executes a
lesson module. The HTTP service binds only 127.0.0.1, checks Host/Origin and requires
a random per-run token for privileged endpoints. Electron denies new windows,
external frame navigation and webviews. Package CSP blocks network connections.
The web development player is for trusted local development; it does not provide
the native shell's external frame-navigation enforcement.

The tutor chooses explanations, questions, supports, fresh problems and endings.
There are no fixed teaching phases. `explain_model` links a teaching resource to
its domain action; `say` lets the tutor introduce a task or ask naturally. Exact
submitted results remain separate from interpreted understanding and confidence.
Only authored observation events trigger conversation; raw edits and gestures
update state without grading. A response generated for an obsolete revision is
discarded. Any current navigation supersedes a departed source in the context.

The `.lesson` format is the unit of sharing. A future hosted catalog can distribute
exactly these files without owning the runtime or learner transcripts. A future
local inference engine replaces the provider port, without changing packages.
A future production authentication adapter must be qualified with its provider;
the development CLI adapters are not a commercial-auth promise.

Current limits: no signatures/trust catalog, automatic updates, account sync,
crash recovery of ongoing sessions, packaged Python interpreter, managed LLM
weights, streaming voice UI, or signed/notarized installers. Imported JS can
still consume resources; sandboxing is not a resource quota. Providers are
experimental integrations; their real tool exposure and latency need versioned
integration qualification before distributing to families.

The shared player renders a walkie-talkie over a full-window lesson, without
header/footer bars. Its keyboard button provides typed replies through the same
teaching session as speech. The frame SDK forwards Space gestures through
the existing MessagePort; microphone capture stays in the privileged player.
Lesson text/number inputs remain ordinary scene interactions.

## Repository ownership

All paths above are relative to os-taxonomy/player. Taxonomy data and research
remain in the repository root data/schema structure. The audio authoring skill
lives in .agents/skills/marble-voice-builder and consumes this implementation.
Keep contract, SDK, runtime, representative packages and skill instructions in
the same change when a boundary evolves. Export a source starter with the skill
helper when portability is needed; do not commit duplicated runtime snapshots.

The former sibling marble-player directory is a local compatibility symlink,
not required by the repository. New checkouts use player/ directly. Device data
and existing speech installations remain outside versioned source.
