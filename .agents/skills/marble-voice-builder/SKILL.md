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

The shared [tutor system prompt](../../../player/packages/teaching-runtime/session.mjs)
owns the conversational policy: introduction, progressive teaching and assessment,
own-words explanation, confidence reflection, continuation offers and child-chosen
stopping. Do not reproduce that policy as lesson stages, closing instructions or
per-lesson tutor prompts. In particular, confidence does not trigger completion.

Supply the topic-specific material the tutor needs to apply that policy:

- A clear learning intention and an approachable first visual relationship.
- Evidence criteria for correct work and a meaningful own-words explanation,
  including what assistance or repetition cannot establish.
- Teachable moments: what the tutor must make visible, what the child can
  meaningfully notice or do, and what evidence that contribution can provide.
  Distinguish their evidence while connecting demonstrations to child-led
  investigations: what can the child try next, and what might call for more help?
- A subject-specific difficulty map: prerequisite relationships, small checks of
  each relationship, visible support levels, and evidence that warrants skipping
  or fading support. Do not make a full oral explanation the first or only check.
- Likely misconceptions, smaller questions, demonstrations and repair options.
- Candidate fresh problems, further practice and supported deeper aspects,
  with their prerequisites and when they are useful. Make these discoverable
  options, not a coverage checklist or required sequence.
- Skills the child can reflect on, with optional neutral confidence questions
  that do not presume the session is ending.

The agent owns instructional choices. The experience owns physical/mathematical
facts, legal actions, scoring, current submissions and support provenance. The
runtime owns shared conversational policy, voice, turn-taking, acknowledged tools
and logging. Read [pedagogy-and-agent.md](references/pedagogy-and-agent.md) for
subject-specific evidence and teaching options that support these decisions.

Before implementation, read [interaction-and-scaffolding.md](references/interaction-and-scaffolding.md).
Map each learning relationship to a teachable moment before choosing tools:
the learning need, what is shown or animated, what is held fixed, the child's
contribution, visible outcome, help and transfer. Interweave showing and doing
throughout teaching: demonstrate enough to enable an action, let the child
investigate, and use what happens to decide whether to show more or return control.
Design these connections without imposing a fixed alternation or activity count.
Give the tutor pedagogical tools
that stage those moments completely; do not expect it to assemble a demonstration
from unrelated camera, highlight and animation switches. Make the available
moments and their uses discoverable in tool descriptions and current scene context.
Keep ordinary navigation separate from teaching and evidence. Plan a representative polished scene using
[visual-design.md](references/visual-design.md); do not defer art direction until
all activities are built. A collection of controls is not an interaction design.

Present a compact concept: the goal, illustrative opening, visual relationship,
example back-and-forth, supports, candidate fresh problems, what an explanation
would establish, and possible further exploration or practice. Keep the concept focused on
teaching and the interactive representation. Ask for refinement and confirm the concept before
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
configured provider. The player can also download and run its managed local teaching model in-app;
see the player README for hardware and packaging limits.

Tutor selection and speech setup belong to Marble Settings, not the lesson
proposal. Author a provider-independent `.lesson` package. Do not propose an
on-device or cloud tutor, ask the author to approve a speech/inference mode, or
add a privacy/approval preamble to ordinary lesson authoring. The person running
the package chooses their tutor in the player; the lesson does not change it.

For testing, inspect and reuse the existing player configuration. A request to
test with that configured tutor is sufficient; do not ask again because the
selected provider is cloud-based. If a live test actually requires a new account,
provider change, download or paid service outside the user's authorized scope,
raise that concrete dependency when needed. Continue model, package and browser
checks independently. Use synthetic learner inputs rather than private child
records. `npm start` launches the desktop shell; `npm run dev` launches its
browser player. See the player README for provider setup and distribution limits.

Keep the walkie-talkie, Space shortcut, cancellation, optional captions and the
adult conversation menu in the shared player. Scenes fill the viewport, with
safe areas for the bottom-right walkie and top-right menu; use scene-base.css
layout variables. Keep typed replies in the player’s keyboard composer; do not duplicate controls. The shared SDK
handles Space in app-bundled scenes while preserving lesson text and number inputs.
Imported lessons use player-owned controls for recording; never grant a package
microphone control just because it implements the SDK.
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
one route is not evidence of adaptation. A synthetic tutor that calls every tool
proves wiring, not that an actual tutor knows when to use the environment. Inspect
whether uncertainty triggers an appropriate visible explanation and whether prior
understanding can lead directly to meaningful child activity. Report live-model
validation separately and do not treat verbal fluency as visual teaching.

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
