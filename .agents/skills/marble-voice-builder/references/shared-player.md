# Shared Marble player

The authoritative [player source](../../../../player) lives in this same repository.
Read its [package contract](../../../../player/docs/package-contract.md),
[architecture](../../../../player/docs/architecture.md), and
[setup and limits](../../../../player/README.md). Fix shared behavior there once.

From the repository root, run `npm run player:install`, then `npm run player:dev`
or `npm run player:start`. The browser development entry is http://127.0.0.1:3235.
Native launch needs working Electron sandbox support; never disable it to ship.

Create only a lesson package with `scripts/create_experience.py DESTINATION`.
The template comes from player/packages/authoring-tools/template. Author teaching,
model and visuals, validate/pack using the player CLI, and import the .lesson.
No registry change or per-lesson server is needed.

For a portable source starter, `scripts/create_player.py DESTINATION` exports
only source, examples, dependency locks and docs. Run npm ci in the export.
It excludes settings, journals, installed dependencies, models and build output.
Do not maintain or sync an exported copy back into the skill.

The player owns microphone, speech, walkie, typed replies, shortcuts, tutor
scheduling and logs. Packages own teaching guidance, legal actions, exact scoring,
model state and visuals. Current facts override stale conversation context.
Confidence is distinct from demonstrated understanding.

Settings, credentials, weights and learner journals are device-local. Subscription
inference sends transcripts and context to the selected provider; it is not
fully local. Local model inference is a separate configurable provider.
