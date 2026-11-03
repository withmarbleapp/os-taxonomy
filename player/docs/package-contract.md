# Lesson contract 1

`manifest.json` declares `format: marble-lesson`, `contractVersion: 1`, lowercase
`id`, numeric `version`, title/description, relative paths `entry`, `teaching`,
`experience`, and optional declared capabilities (webgl, voice, tutor).

`teaching.json` contains learning goals, adaptive-general focuses linked to goals,
short tutor guidance, optional authored `teaching` resources (id, state conditions,
action, args, text), observation/evidence event names and selfEvaluation skills.
The resources are available teaching moves, not a mandatory itinerary. Put
research, curriculum provenance, limitations and misconception handling here or
in accompanying source notes. Avoid embedding learner records.

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
