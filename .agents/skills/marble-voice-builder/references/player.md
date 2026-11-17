# The shared player and the lesson package

The player is one application that runs every lesson. It lives in
[player/](../../../../player) in this repository, and that source is the only
runtime: fix shared behaviour there once. A lesson is a package the player
loads. This page says what each side is responsible for and points to the
player's own documents for detail:

- [package contract](../../../../player/docs/package-contract.md): the files in
  a package and the protocol between scene and player;
- [architecture](../../../../player/docs/architecture.md): process and trust
  boundaries;
- [README](../../../../player/README.md): setup, tutor connections, data
  locations and current limits.

## Commands

From the repository root:

```sh
npm run player:install        # once
npm run player:dev            # browser player at http://127.0.0.1:3235
npm run player:start          # desktop app
npm --prefix player run marble -- validate /absolute/path/to/lesson
npm --prefix player run marble -- pack /absolute/path/to/lesson /absolute/path/to/name.lesson
```

`scripts/create_experience.py DESTINATION` copies the starter from
`player/packages/authoring-tools/template`. A lesson is previewed by importing
it into the same player library; it needs no server of its own and no registry
entry. The desktop app needs a working Electron sandbox; when native launch
fails, follow [linux-desktop.md](../../../../player/docs/linux-desktop.md).

`scripts/create_player.py DESTINATION` exports a clean copy of the player source
for someone who needs it standalone. The export is a generated artefact: it is
not edited and synced back.

## Who owns what

| Owner | Owns |
|---|---|
| Shared tutor (`packages/teaching-runtime`) | Conversation: introducing, checking, reflecting, offering more, stopping; turn-taking; cancelling stale replies |
| Player (`apps/player`, `apps/desktop`, `apps/local-service`) | Microphone, speech, the walkie-talkie, the typed-reply composer, shortcuts, captions, settings, logs |
| Lesson model | Facts, legal actions, exact scoring, current work and its history, what was assisted or exposed |
| Lesson teaching material (`teaching.json`) | Goals, evidence criteria, misconceptions, optional teaching moves, transfer problems, deeper aspects, practice, reflection skills, subject-specific `tutorGuidance` |
| Lesson renderer | What the child sees, and an accurate description of it for the tutor |

`tutorGuidance` stays on the subject, the evidence and the model's tools. The
shared tutor prompt already carries the conversation and stopping policy, so a
lesson that restates it creates two versions that can disagree.

## What the model must keep straight

The tutor reasons from the state the lesson reports, so the state has to make
these distinctions itself:

- **Current work versus history.** The latest submission is explicit, earlier
  attempts are kept as history, and a command based on an old revision is
  rejected.
- **Assisted versus independent.** Help given and answers exposed are recorded
  with the attempt they affected. A correct action after help is evidence of
  assisted success.
- **Screen versus viewpoint.** What is drawn on screen is described separately
  from what a character in the scene can see. In a space diagram every body is
  visible on screen even when the Sun is below the explorer's horizon.
- **Meaningful events only.** An observation event marks something worth the
  tutor's attention, such as a committed answer. Individual drags and edits
  update state without triggering conversation.

## Checks and narration

A check has one question object. Its speech, on-screen text and choices all come
from it, and its status (awaiting, paused, answered) and the submitted response
stay visible in the scene context. A spoken answer resolves the same check
through a scene action, scored exactly as a button press would be, and the
attempt records that it came by voice together with the child's actual words.
An ambiguous reply leaves the check unresolved.

A demonstration or check returns authored `speech` from its action, and the
player speaks it as written. A demonstration can set `continueAfterSpeech` so
the tutor follows it with a question or activity in the same turn. Each moment
has one narration route. The short on-screen instruction can be briefer than the
speech.

## What stays in the player

Voice and typed replies both go through the player. The lesson contains no
microphone, provider or tutor-loop code, and leaves the walkie-talkie and menu
areas clear using the layout variables in `scene-base.css`.

- **Space to talk** works inside app-bundled lessons, where the SDK forwards the
  gesture and leaves the lesson's own text and number fields alone.
- **Imported lessons** are untrusted code, so they cannot start recording
  through the bridge at all. Their learners use the player's own walkie button.
- **The tutor is chosen in Settings** (Claude, Codex or On this device) by
  whoever runs the lesson. A package is the same whichever is selected and never
  selects one itself.

## Where data goes

Settings, credentials, model weights and learner journals stay on the device and
never go into a package. Microphone audio is processed locally and is not saved
or sent anywhere. With Claude or Codex selected, the final transcript,
conversation, lesson guidance and current model state are sent to that provider.
With On this device selected, a verified model is downloaded once and inference
runs inside the app. There is no automatic fallback from one to another.

Speech recognition (Moonshine) and synthesis (Phonon) run in browser workers
from pinned, checksummed model files downloaded once per machine. See
[browser speech](../../../../player/docs/browser-speech.md) and
[in-app inference](../../../../player/docs/device-inference.md).

## What you can and cannot promise

English is the only speech baseline that has been tested. Recognition of
children's speech, macOS, Windows and mobile browsers have not been qualified,
and the player is a developer preview. Say so when a request assumes another
language, device or fully offline teaching, and check the README for the current
state before promising any of them.
