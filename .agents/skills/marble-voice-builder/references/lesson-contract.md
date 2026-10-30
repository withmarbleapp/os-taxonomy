# Lesson authoring contract

Use the authoritative [contract](../../../../player/docs/package-contract.md) and
[starter](../../../../player/packages/authoring-tools/template). A `.lesson` is
content and executable scene assets, never a server or a copy of the tutor.

Author learning intentions, prerequisites, evidence, misconception responses,
optional teaching moves, transfer opportunities and self-assessment in teaching.json.
The tutor can explain, involve the child, offer practice, adjust help, invite an
explanation and reflect; these are adaptive decisions, not locked stages.

The domain model owns legal actions, exact scores and assistance/exposure history.
Keep current submitted work explicit, retain earlier attempts as history, and
reject stale commands. The renderer exposes what the learner can actually see.
A correct action is not automatically evidence of an independently understood skill.

Use learner observation events for meaningful interaction, not every drag or edit.
Instruction labels stay short and distinct from spoken narration. Route voice and
typed dialogue through the player. The SDK preserves scene input fields while
forwarding Space push-to-talk gestures for app-bundled scenes. Imported lessons
cannot request recording through the bridge and use the player controls.

Inspect [examples](examples.md) for concrete implementations. Keep research,
representation limitations and source provenance with the authored lesson.
