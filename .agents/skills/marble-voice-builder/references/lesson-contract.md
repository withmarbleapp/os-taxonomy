# Lesson authoring contract

Use the authoritative [contract](../../../../player/docs/package-contract.md) and
[starter](../../../../player/packages/authoring-tools/template). A `.lesson` is
content and executable scene assets, never a server or a copy of the tutor.

Author learning intentions, prerequisites, evidence criteria for work and own-words
explanations, misconception responses, optional teaching moves, transfer problems,
further exploration, practice and neutral confidence prompts in teaching.json.
The shared tutor system prompt owns conversation flow and stopping. Keep
tutorGuidance specific to the topic, model and resources; do not duplicate general
conversation policy or prescribe finishing after a successful task or reflection.

The domain model owns legal actions, exact scores and assistance/exposure history.
Keep current submitted work explicit, retain earlier attempts as history, and
reject stale commands. The renderer exposes what the learner can actually see.
A correct action is not automatically evidence of an independently understood skill.

Use learner observation events for meaningful interaction, not every drag or edit.
For authored checks, speech, written question and choices express the same task;
use one question definition and the contract's action-speech support. Let spoken
answers resolve that check with voice provenance. Avoid exposing duplicate
narration tools for the same moment. Ordinary instruction labels can stay shorter
than narration. Describe screen contents separately from a character's viewpoint. Route voice and
typed dialogue through the player. The SDK preserves scene input fields while
forwarding Space push-to-talk gestures for app-bundled scenes. Imported lessons
cannot request recording through the bridge and use the player controls.

Inspect [examples](examples.md) for concrete implementations. Keep research,
representation limitations and source provenance with the authored lesson.
