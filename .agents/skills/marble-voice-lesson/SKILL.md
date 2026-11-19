---
name: marble-voice-lesson
description: Research, design and build child-facing interactive lessons with an adaptive conversational tutor, shared visuals and the portable Marble player. Use for new lessons or pedagogical revisions, not general curriculum lookup or standalone silent HTML activities.
---

# Marble Voice Lesson

A Marble lesson is a conversation between a child and a tutor about something
they can both see and change. You author a **lesson package**: the subject
knowledge, an exact model of the phenomenon and its visuals. The shared
[player](../../../player) supplies everything else. Work from a full os-taxonomy
checkout; the player source there is the only runtime.

This skill is a draft. Its examples show mechanisms that work, not teaching that
has been proven with children.

## Principles

**1. Three owners, no overlap.**
The shared tutor owns the conversation: how to introduce, when to check, reflect,
offer more and stop ([its prompt](../../../player/packages/teaching-runtime/session.mjs)).
The lesson's model owns the facts: legal actions, exact scoring, current work
versus attempt history, and what was assisted. The lesson's teaching material
owns subject knowledge: what is worth showing, what the child can do with it and
what a response means. The player owns voice, controls, settings and logs.

So a lesson holds no conversational flow, ending logic, microphone, provider or
tutor-loop code, and a new lesson needs no player change. Which tutor or speech
engine runs is chosen in Settings by whoever runs the package; authoring neither
picks nor asks about it. If a lesson seems to need to steer the conversation, it
is either subject knowledge (author it as an option) or a shared-tutor bug
(reproduce it and fix it there once).

**2. Author a map, not a route.**
The tutor can only adapt if it has real choices. Every teaching moment, small
check, practice task and deeper aspect is an option with its prerequisites, when
it is useful, what the child contributes and what that shows. A lesson that only
works in one order is a script; a child who already knows the idea should reach
meaningful work directly, and a child who is lost should get something shown.

**3. Show enough to enable doing, then hand back.**
For each relationship decide what must become visible, what the child can then
do, and what consequence they see. Give the tutor one tool per moment that stages
it completely (view, geometry, supports, animation), because a tutor cannot
reliably assemble a demonstration from separate switches. The child acts on the
objects themselves. Help works on the child's current setup and returns control
with their work and its history intact.

**4. Three kinds of evidence, kept apart.**
Observed work (exact, with whether it was assisted), interpreted reasoning (the
child's own words) and self-reported confidence answer different questions. None
stands in for another and none alone ends a lesson. Provide small checks of
single relationships so a whole-topic explanation is never the only evidence
available.

**5. The representation is true and legible first; polish can follow.**
Correct geometry and causality, and a scene a child can read and act on, are
part of every lesson. Use 3D when depth, occlusion, light or viewpoint carries
the idea and 2D when the relationship is planar. A 3D scene is built on the
player's shared stage and props, which carry Marble's look. On screen, the scene fills the
viewport with one small title and one short instruction that feedback replaces;
everything else is the phenomenon. Visual polish (crafted terrain, materials,
lighting, atmosphere) is a separate pass that can come after the lesson teaches
well. Name the intended look in the concept so the scene is built in a way that
can be upgraded, and say plainly in the report whether that pass has happened.

**6. Claim only what you checked.**
Ground the lesson in taxonomy topics and research by ID; suggested activities
are proposals, not evidence. This skill checks the model, the scene in the
browser and the teaching material on paper. It does not evaluate how a live
tutor teaches with the lesson, how the voice loop behaves or what children
learn, and the report says so.

## Hard rules

These are boundaries, not judgment calls.

- Never request or store identifying details about a child. Keep logs,
  recordings, credentials and model weights out of deliverables.
- Never invent a topic ID, a citation or a learner action.
- Imported lessons never get microphone control, and the desktop sandbox is
  never disabled to make something run. If native launch fails, see
  [linux-desktop.md](../../../player/docs/linux-desktop.md).
- Never claim that the tutor's teaching, the voice loop or children's learning
  was validated. Model tests and browser checks show neither.
- Preserve third-party licence notices in anything you package.

## Phases

Each phase has an output and a check. Finish the check before moving on. For a
revision, enter at the phase the change touches; routine fixes to an agreed
lesson need no new approval.

### 1. Brief

Ask only what would change the design: age or readiness, language, intended
skill, device. Then read [data-and-research.md](references/data-and-research.md),
locate one consistent taxonomy revision, and read the relevant topics, their
immediate prerequisites and the teaching research joined by topic ID.

**Output:** a short teaching brief: a narrow observable goal, topic IDs and
revision (or a plain statement that grounding could not be checked), assumed
prerequisites, likely misconceptions, and the representation with its limits.

**Done when:** the goal is something a child could visibly demonstrate, and each
claim is traceable to a source or labelled as your proposal.

### 2. Concept

Read [pedagogy-and-agent.md](references/pedagogy-and-agent.md),
[interaction-and-scaffolding.md](references/interaction-and-scaffolding.md),
[visual-design.md](references/visual-design.md) and, for a 3D scene,
[kit-style.md](references/kit-style.md).

**Output:** a compact concept: the opening question and artwork; a situation
table with one row per relationship (what is shown, what stays fixed, what the
child does, the visible outcome, help, transfer); a difficulty map (which
relationships support which, and what evidence justifies skipping or fading
support); an example exchange; what an own-words explanation would establish;
candidate fresh problems; a few lines on the intended look.

**Done when:** every row names something the child does, not only something the
tutor says, and the user has confirmed the concept. Approval already given
counts, and the goal alone does not need its own round.

### 3. One working scene

Read [player.md](references/player.md) and the
[package contract](../../../player/docs/package-contract.md). From the repository
root:

```sh
npm run player:install
python3 .agents/skills/marble-voice-lesson/scripts/create_experience.py /absolute/path/to/lesson
npm run player:dev          # browser player at http://127.0.0.1:3235
npm --prefix player run marble -- validate /absolute/path/to/lesson
```

The new folder contains a `DESIGN.md` with a section for each phase. Record the
brief and concept in it now and keep it current; it is the design note you
deliver.

Build the central relationship end to end: the model, the renderer, one tutor
moment and one child activity. The visuals need to be accurate and readable
here, not finished. Use the example closest in mechanism
([examples.md](references/examples.md)) for how, not for what to teach; for
narration follow the Moon lesson (see phase 4). Style with the player's
`scene-base.css` and bundled fonts.

**Done when:** `validate` passes; model tests cover the exact outcomes; and in
the browser at the target and a narrow width you have seen that a child could
find the object, make the gesture and see the consequence. Look at the
screenshots yourself. If the moments only connect through a fixed script, change
the tools now.

### 4. Full lesson

Read [teaching-file.md](references/teaching-file.md). Fill in the rest of the
map: remaining moments, small checks, practice, transfer and deeper aspects,
reflection skills, evidence criteria, and `tutorGuidance` limited to the subject,
the evidence and the model's tools.

**The lesson words its demonstrations and checks.** Expose each one as a model
action that returns authored `speech`, as the Moon lesson does with
`show_moment`, `start_check` and `start_activity`. An explanation of a mechanism
has to be correct, and a question has to match its on-screen text and buttons,
so those words are written and checked by you, taken from one question object.
A demonstration sets `continueAfterSpeech` so the tutor can hand straight to a
question or activity. The tutor words everything in between. Tutor-worded
`explain_model` resources (the Cube lesson) remain available for a moment where
responding to the child's own words matters more than exact phrasing; give any
one moment a single path.

**Done when:** every row of the situation table has a resource or action behind
it; state separates the current submission, earlier attempts and assistance;
`teaching.json` contains no conversational flow or ending; and the child-facing
text is in the child's language, free of runtime vocabulary.

### 5. Validate and deliver

Read [validation.md](references/validation.md). Three checks, none of which
runs the tutor:

1. **Model:** tests cover scoring, attempt history, assistance, stale commands,
   and voice and button answers scoring alike.
2. **Browser:** at the target and a narrow width, every demonstration is visible
   from the view its action sets and every activity's controls are present.
3. **Desk check:** read `teaching.json`, the action descriptions and the
   authored speech as the tutor would. For each kind of learner in the
   validation table, the material offers a suitable move and says when to use
   it.

**Done when:** all three are complete, gaps found in the desk check are filled,
and the report states what was checked, whether the visuals are functional or
polished, and that the tutor's live teaching, voice and children's learning
were not evaluated.

**Deliver:** the `.lesson` file (`npm --prefix player run marble -- pack DIR FILE`),
the editable folder with its completed `DESIGN.md` (brief, concept,
responsibilities, model limits and the validation report), and launch and
import instructions. Publishing, installing skills and
contributing research to the taxonomy are separate tasks.

### Polish pass (when asked, or once the lesson teaches well)

Follow the polish section of [visual-design.md](references/visual-design.md):
make one representative scene match the intended look, then carry it across the
others. Polish must not change geometry, legal actions or what a check means, so
rerun the model tests and the browser checks from phase 3 afterwards.

**Done when:** you have compared screenshots of the opening, a focused activity
and a close-up with the intended look, with controls present, at the target and
a narrow width.

## References

- [data-and-research.md](references/data-and-research.md): locating and reading taxonomy data; interpreting research.
- [pedagogy-and-agent.md](references/pedagogy-and-agent.md): response-to-move examples, difficulty maps, the evidence channels.
- [interaction-and-scaffolding.md](references/interaction-and-scaffolding.md): teachable moments, focused situations, direct manipulation.
- [visual-design.md](references/visual-design.md): scene composition, shared styles, the polish pass, redistributable assets.
- [kit-style.md](references/kit-style.md): the 3D look, settings, ready-made props, building a custom object in style, and checking it beside the kit.
- [teaching-file.md](references/teaching-file.md): what reads each field of `teaching.json`, a valid skeleton, and how to write the tutor's map.
- [player.md](references/player.md): commands, who owns what, what the model must keep straight, where data goes, and what can be promised (English is the only tested speech baseline).
- [examples.md](references/examples.md): the shipped lessons and what each demonstrates.
- [validation.md](references/validation.md): the model, browser and desk checks for phase 5.
