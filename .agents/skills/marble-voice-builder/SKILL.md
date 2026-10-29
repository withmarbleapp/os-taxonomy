---
name: marble-voice-builder
description: Research, design and build child-facing interactive lessons with an adaptive conversational tutor, shared visuals and the portable Marble player. Use for new lessons or pedagogical revisions, not general curriculum lookup or standalone silent HTML activities.
---

# Marble Voice Builder

Build a learning conversation grounded in a coherent interactive model. Reuse the
shared player so the work concentrates on teaching research, the representation,
lesson-specific tools and the lesson package. This skill is a portable draft;
its examples establish working mechanisms, not proven learning efficacy. See
[the draft validation record](references/draft-validation.md) for the actual checks.

## Establish the lesson

Use existing context. Clarify only missing information that changes the design:
the child's age/readiness, language, intended skill and intended device. Do not
request identifying details. Propose a narrow observable goal when the request
already implies one; do not add a separate approval round for the goal alone.

Read [data-and-research.md](references/data-and-research.md). Locate a consistent
os-taxonomy revision, inspect relevant topics and immediate prerequisites, and
join the teaching research by topic ID. Distinguish suggested activities and
standards alignment from evidence that an approach works. For material gaps or
conflicting guidance, inspect appropriate primary research or authoritative
guidance and produce a short teaching brief. Do not invent citations or topic IDs.
A missing checkout does not establish that research is absent.

Record the goal, prerequisite assumptions, representation, likely misconceptions,
what the child will do, what different responses mean, useful next teaching moves,
and the limits of the model. Keep child information out of reusable research.

## Design the conversation

Apply these principles as flexible teaching intentions, not five locked phases:

- **State the intention.** In one or two child-friendly sentences, say what the
  child will learn and why this activity helps. Then begin doing it together.
- **Scaffold without lecturing.** Explain enough for a small next question. Bring
  the child in progressively: count, point, predict, compare, construct or explain.
  Listen and choose the next move from that answer. An acknowledgement is not
  evidence that the child can do the skill. Avoid repeated readiness questions.
- **Try, adapt and help.** Offer a new problem with less support when their work
  suggests readiness. Adjust difficulty for a purpose. A mistake identifies what
  needs attention: recognise what is right, correct the actual error, use a
  smaller question or demonstration, allow revision, and later check transfer.
  Teaching and checking can alternate throughout the conversation.
- **Validate through explanation.** Ask the child how or why when their reasoning
  is genuinely uncertain. Do not re-quiz a count they already entered correctly,
  give the explanation and then ask them to repeat it, or require a set number
  of questions. Correct performance and a reasoned explanation are different
  evidence; assisted repair is not a fresh independent success.
- **End with self-assessment.** Invite the child to say whether they feel capable
  of the skills worked on. Use their own words, accept uncertainty or declining,
  and save confidence separately from performance and interpreted understanding.
  Respect an explicit wish to stop without imposing a closing questionnaire.

The agent owns instructional choices. The experience owns physical/mathematical
facts, legal actions, scoring, current submissions and support provenance. The
runtime owns voice, turn-taking, interruption, acknowledged tools and logging.
Do not turn a lesson-specific flow or a previous failure into a universal gate.
Read [pedagogy-and-agent.md](references/pedagogy-and-agent.md) for examples of
branching decisions, evidence and concise child-facing language.

Present a compact concept: the goal, illustrative opening, visual relationship,
example back-and-forth, supports, candidate fresh problems, what an explanation
would establish, and closing confidence questions. Explain data flow and the
chosen inference/speech mode. Ask for refinement and confirm the concept before
full lesson implementation. Existing explicit approval counts; do not restart
an approval ceremony. A request to revise an agreed lesson permits routine fixes.

## Reuse the shared player

New lessons are **packages loaded by Marble**, not copies of a per-lesson server.
Read [shared-player.md](references/shared-player.md) first. The authoritative
implementation is [player/](../../../player) at the repository root: desktop and
browser player, local voice, contract, SDK, tutor, package tools and examples.
Use this skill from a full os-taxonomy checkout. There is no embedded runtime copy.

Create a lesson folder (no runtime, credentials, weights or session logs):

```sh
python3 scripts/create_experience.py /absolute/path/to/new-lesson
```

Use `npm --prefix player ci` and `npm run player:dev` from the repository root.
For a portable standalone starter, export the current source (not a second
maintained copy):

```sh
python3 scripts/create_player.py /absolute/path/to/marble-player
```

Author the new lesson's `manifest.json`, `teaching.json`, `experience.json`, domain
model and renderer. `teaching.json` holds goals, evidence interpretation,
resources, candidate transfer problems, concise decision guidance and confidence
questions. The model owns exact facts, legal actions, scoring and assistance.
The SDK connects it to the player. Do not put microphone, provider or tutor-loop
code in the lesson. Read `docs/package-contract.md` in the shared player.

Use the relevant example for mechanics and visuals. Cubes demonstrates exact
submitted counts, correction and assistance; Croatoan demonstrates visible-source
context, source provenance and navigation. Their topics and tools are examples,
not universal teaching stages. The equal-parts starter is deliberately minimal;
it needs teaching research and a coherent lesson design before delivery.

Validate and package with the shared CLI, then import into the same player:

```sh
npm run marble -- validate /absolute/path/to/new-lesson
npm run marble -- pack /absolute/path/to/new-lesson /path/to/new-lesson.lesson
```

For existing lessons, change only the appropriate package or fix a reproduced
shared-runtime bug. New phenomena may require new models and renderers; the shared
player supplies infrastructure, not a universal representation.

## Voice, providers and appearance

Local speech defaults to Moonshine Small Streaming recognition and
Phonon 31M/Freya synthesis. The bundle includes worker source, dependency locks,
model manifest/checksums and setup scripts; download large model files once on
the target machine. Read portability limits before promising language or device
support. English speech is the tested baseline. Local voice does not mean a
local teaching model: cloud inference sends final words and model context to the
configured provider. A local compatible inference service is a separate setup.

The player asks for a tutor connection and local voice before starting a lesson.
`npm start` launches the desktop shell; `npm run dev` launches its browser player. No silent provider fallback. Before enabling a paid or
external inference path, explain the provider, content sent and account usage,
and obtain explicit author approval unless that is already established. A
skill invocation alone does not authorise transmitting child recordings or
running paid live evaluations. Do not extract subscription/session credentials;
subscription adapters invoke official Claude/Codex CLIs as experimental local
developer integrations. Their commercial eligibility and live behavior are not
proven by the package tests; consult the player README before distribution.

Keep the walkie-talkie, Space shortcut, cancellation, optional captions and the
adult conversation menu in the shared player. Scenes fill the viewport, with
safe areas for the bottom-right walkie and top-right menu; use scene-base.css
layout variables. Keep typed replies in the player’s keyboard composer; do not duplicate controls. The shared SDK
handles Space in the scene while preserving lesson text and number inputs.
Brief scene instructions and spoken dialogue have separate slots. Avoid technical
agent/runtime language in the child's flow. Use the child's language and locale
throughout; do not present English speech support as multilingual validation.

Read [visual-design.md](references/visual-design.md) and
[component-styling.md](references/component-styling.md) when composing the scene.
Use the bundled Baloo 2 roles and tactile controls. Use a crafted cel-shaded 3D
model when viewpoint, depth, illumination or occlusion is essential; use 2D when
the relationship is genuinely planar. The opening should illustrate the central
question. In the lesson, keep one small title and one short instruction; feedback
replaces that instruction. Put definitions on demand, never inside buttons. The
Cube's number fields are a task-specific example, not a generic dashboard pattern.
Preserve licence notices in generated work.

## Validate the teaching, not just completion

Read [validation.md](references/validation.md). Start with the central relationship
and exact model outcomes, then inspect the actual browser and responsive states.
Use contrasting learner traces: confident prior knowledge, uncertainty, a specific
mistake, corrected work, an explanation, stopping and self-assessment. Different
understanding should permit different next moves. A trace that always completes
one route is not evidence of adaptation.

Verify latest submissions supersede old ones without erasing attempt history;
help and exposed answers remain labelled assisted; navigation does not answer
questions; actual learner actions are not invented. Listen to synthetic/adult
voice turns when authorised, check interruption and inspect local journals.
Read the text and tool outcomes yourself: passing tests do not establish sensible
feedback, age-appropriate speech or child learning.

Keep logs, recordings, credentials and downloaded models out of deliverables.
Report separately what was checked with fixtures, live models, local voice and
children. Never call scripted behavior an LLM evaluation or claim child validation
from synthetic conversations. Deliver the `.lesson` package, editable lesson folder, player launch/import instructions,
short teaching/research note, model limits and validation results. Publishing,
installing a global skill and contributing taxonomy changes are separate tasks.
