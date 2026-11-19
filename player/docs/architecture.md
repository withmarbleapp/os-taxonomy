# Structure and boundaries

```
apps/desktop         Electron lifecycle, microphone permissions, local service
apps/player          Library, sandbox host, conversation, microphone and playback
apps/local-service   Loopback APIs, catalog, imports/exports, logs, provider calls
packages/lesson-contract   Versioned metadata and update validation
packages/lesson-sdk        MessagePort bridge between scene and player
packages/teaching-runtime  Adaptive decisions, latest context, cancellation
packages/providers        Local structured-output HTTP and official CLI adapters
packages/voice            Browser speech workers, capture/playback and verified model provisioning
packages/authoring-tools  Archive validation, CLI and minimal lesson starter
lessons/                  Bundled lessons: models, visuals and teaching packages
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
The tutor records understanding and confidence as optional fields on whatever
decision it makes next, so interpreting the learner never costs an inference of
its own. While authored narration or the introduction is being spoken, the
runtime already requests the handover that follows and holds it until the
speech ends; an interruption or scene change discards it.
The wrap-up screen is a view of the session's outcome (`teaching-runtime/outcome.mjs`):
one row per declared skill, marked on your own, with help, seen together or not
yet by fixed rules over the recorded readings. The runtime stamps each reading
with whether it rested on assisted work, taken from the lesson's event, so the
tutor supplies evidence but not the mark. The tutor opens the screen with
`review` when offering to continue or stop; `finish` and leaving mid-lesson show
it too. The outcome is written to the session log when the lesson is finished
(`completed`) and whenever a started lesson is left (`closed`), so the last
entry with an outcome is where the child got to. Work with no evidence event
behind it is never counted as independent. A lesson keeps
nothing about a child between sessions; a later layer can hand it a prior and
read these outcomes.
A change to the scene while the tutor is thinking or speaking discards that
reply, unless it is a learner gesture the lesson lists in `passiveEvents`
(turning a model, typing a draft). A field the tutor puts on the wrong tool is
dropped and logged (`arguments_trimmed`) instead of failing the turn.
Only authored observation events trigger conversation; raw edits and gestures
update state without grading. A response generated for an obsolete revision is
discarded. Any current navigation supersedes a departed source in the context.

The `.lesson` format is the unit of sharing. A future hosted catalog can distribute
exactly these files without owning the runtime or learner transcripts. A future
local inference engine replaces the provider port, without changing packages.
A future production authentication adapter must be qualified with its provider;
the development CLI adapters are not a commercial-auth promise.

Current limits: no signatures/trust catalog, automatic updates, account sync,
crash recovery of ongoing sessions, managed LLM weights, or signed/notarized
installers. Browser speech is implemented; hosted deployment is not yet shipped. Imported JS can
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
lives in .agents/skills/marble-voice-lesson and consumes this implementation.
Keep contract, SDK, runtime, representative packages and skill instructions in
the same change when a boundary evolves. Export a source starter with the skill
helper when portability is needed; do not commit duplicated runtime snapshots.

The former sibling marble-player directory is a local compatibility symlink,
not required by the repository. New checkouts use player/ directly. Device data
and existing speech installations remain outside versioned source.

Only app-bundled scene code is trusted to forward microphone shortcuts. The
service marks that capability outside lesson metadata, and imported releases
cannot replace bundled ID/version pairs. Imported frames cannot request recording;
learners use the player controls. A cross-frame SDK is not proof of user intent.
