# Lesson contract 1

`manifest.json` declares `format: marble-lesson`, `contractVersion: 1`, lowercase
`id`, numeric `version`, title/description, relative paths `entry`, `teaching`,
`experience`, and optional declared capabilities (webgl, voice, tutor).

`teaching.json` contains learning goals, adaptive-general focuses linked to goals,
short tutor guidance, optional authored `teaching` resources (id, state conditions,
action, args, text, plus optional whenToUse and learnerContribution),
observation/evidence event names and selfEvaluation skills. `explain_model` exposes
the authored moment IDs and their instructional uses directly in its tool schema.
Separate tutor demonstrations (provided information) from child activities
(manipulation or committed work). Stage a moment completely in one action and
report the current mode, visible supports and available learner actions.
The resources are available teaching moves, not a mandatory itinerary. Put
research, curriculum provenance, limitations and misconception handling here or
in accompanying source notes. Avoid embedding learner records.

The shared tutor system prompt owns conversational flow, explanation and confidence
reflection, continuation offers and child-chosen stopping. Keep tutorGuidance
specific to the subject, evidence and model tools. Supply optional deeper aspects
and practice opportunities with prerequisites, so the tutor can offer relevant
uncovered material. Do not duplicate general teaching policy, prescribe a closing
sequence or treat confidence as permission to finish. Confidence prompts should
not assume the session is ending.

`experience.json` contains protocolVersion, releaseId, description, stateSchema,
actions with JSON input schemas and named event schemas. State must distinguish
current work, checked attempts, assistance and answer exposure where relevant.
`view()` supplies what is visible now, including the active clue or current
submitted attempt; use it to prevent stale-topic responses.

The entry loads the shared `/sdk/frame.mjs` and calls:

```js
mountLesson({
  create: ({sessionId}) => domainModel,
  render: (snapshot, cover, bridge) => updateScene(snapshot),
  view: () => currentPresentation,
  onStart: bridge => {},
});
```

The model implements describe(), snapshot(), subscribe(listener), execute(command).
Snapshot fields: protocolVersion, sessionId, releaseId, increasing revision,
state, availableActions. Updates contain snapshot and events; each event has id,
revision, source (learner/agent/system), name and data. An action command carries
protocolVersion, sessionId, releaseId, commandId, expectedRevision, name and args.
Return accepted, snapshot, and an error when rejected. Reject stale revisions and
illegal commands. Publish the matching update before returning the command result.

An accepted domain action may return `speech` (1–650 characters). The shared tutor
runtime speaks this authored text after acknowledgement. By default it ends the
turn, without another inference rewriting it. A demonstration can additionally
return `continueAfterSpeech: true`: once narration finishes, the runtime asks the
tutor for a meaningful learner handoff in the same turn. Questions and task
instructions should retain the default wait. Interruption cancels continuation.
The opening introduction also continues into the first teaching move after Start;
its silent prefetch must therefore contain only the introduction, not a question. This is useful for coherent quizzes and staged
explanations; actions without it retain the normal infer-again behaviour. Choose
one narration path for a moment: direct action speech or an `explain_model`
resource, rather than exposing duplicate routes.

For a quiz, derive screen text, action speech and button labels from one question
object. Expose its id, exact question, choices and awaiting/paused/answered status in view
context. Keep the submitted response explicit after completion, rather than
leaving the tutor to infer completion from an absent question. Spoken answers resolve that same question via a scene-bound action,
using the same scoring as buttons and retaining the actual words and modality.
Reject stale question ids. Agent-mediated voice commits use agent event source
so they do not cancel their own tutor turn; provenance in the attempt still says
voice. Provide an explicit way to leave unanswered work without inventing a
response. Preserve previous attempts and assistance on retries.

Describe screen contents separately from a represented character's perceptions.
For example, all bodies can appear in a space diagram while the Sun is below the
explorer's horizon. Geometry values alone are not a description of the screen.

The bridge supplies instruction(short scene label), narrate(authored text),
intent(learner request) and viewChanged(). Do not duplicate microphone capture,
provider code or the tutor loop in a package. The player owns speech and settings.
Narration should correspond to visible content, not reset the child's progress.

Use relative module and asset imports inside the package. Shared imports are
limited to the SDK and `/player/scene-base.css`; font assets are in
`/player/assets/`. There is no arbitrary fetch/network access. Imported metadata
is untrusted. Archive hashes detect damaged content, not trustworthy authorship.
For browser preview, install the package into the local library and open it from
the same player used by the desktop app; do not create a separate per-lesson host.

Run `npm run marble -- validate DIR` before `pack`. Keep versions immutable.
Exclude secrets, session journals, model weights, virtual environments and
symlinks. Preserve third-party licenses. An authored package that changes its
state or action schema must also update the model's descriptor consistently.

## Shared controls and layout

The player owns the walkie-talkie overlay, microphone, playback, cancellation
and optional captions. The keyboard reply composer also belongs to the player. Do not duplicate these
controls in a lesson. Scenes fill the viewport. Leave the bottom-right controls clear using
`--marble-controls-right` and `--marble-controls-bottom` from scene-base.css;
reserve `--marble-menu-right` for the top-right menu. These adapt on mobile.

For app-bundled lessons only, the frame SDK forwards Space hold/release gestures
to the player while the lesson is active. This permission comes from the server
catalog, never package metadata. Imported JavaScript can forge SDK messages, so
imported lessons cannot invoke recording through the bridge. Their learners use
the player-owned walkie or focus it before using Space. It ignores editable fields and open dialogs, suppresses
repeated keydown events, and cancels on focus loss. Lessons need no keyboard
or audio implementation for these controls.

An illustrated opening may expose `cover: {layout: "illustrated", title, startLabel}`
in its presentation. Render the authored background when the SDK passes
`cover: true`; the player overlays the title and start button and owns startup.

Use cover layout `scene` for a transparent opening with a dark, left-aligned
question over a live scene. The layout adapts to a top title on narrow screens.
