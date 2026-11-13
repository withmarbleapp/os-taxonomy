# The Moon’s daytime visit — voice lesson

For children around 7–9 who can recognise the Sun, Moon and Earth. The narrow goal
is an own-words explanation connecting reflected sunlight with Sun and Moon being
above the observer’s horizon together. Naming phases or explaining the lunar
cycle is not required. Introduce horizon and reflection in the scene when needed.

## Reused experience

Adapted from `.agents/skills/marble-builder/examples/moon-visit/source` at taxonomy
commit `cb47bae169ea6bf02db7ed9f52829b21489504f0`. Reuses the original Earth atlas,
explorer, textured Moon, Sun effects, landscape and coupled sky projection. Original
geometry and task generator are retained in `model/geometry.mjs`. Removes the
four-question route, global all-correct threshold, completion screen and duplicate
feedback toast. Shared Marble owns dialogue, voice, reflection and stopping.

## Teaching and interaction responsibilities (1.3.1)

The shared tutor policy governs conversation, evidence, purposeful participation
and stopping. The lesson supplies a compact map: reflected sunlight at night,
the same route by day, a route blocked by Earth, then transfer without rays.
The agent chooses among these opportunities based on the learner's responses;
there is no compulsory sequence or quiz quota.

Moon demonstrations have one public route: show_moment stages a scene and returns
brief authored speech. start_activity starts a purposeful investigation, route
construction or transfer; start_check supplies a small supported question. The
runtime speaks accepted action speech. Demonstrations continue into a learner
question or activity without an acknowledgment; checks and activity instructions
end the turn, preserving the exact quiz wording. An answered check stays explicit
in the scene context with its response, assistance and input modality. Other lessons can continue
using the shared explain_model resource mechanism.

questionFor is the single source for the question, choices and on-screen label.
The runtime speaks that question. Day/night offers Day/Night; above-horizon
visibility offers Yes/No. answer_check resolves clear spoken answers against the
current scene id using the same scoring as button responses. Attempts retain
modality, actual spoken words and assistance. Ambiguous replies remain unresolved.
Voice commits emit an agent event so the active tutor turn can continue; their
attempt provenance remains voice, never a simulated click.

Pending work prevents replacement by another check or activity. Support operates
on the current setup; resume restores the question. leave_activity explicitly
leaves unfinished work without creating a response or removing prior attempts.
The scene context separates the screen's space diagram from the explorer's local
sky, and exposes the current question, supports, latest attempt and investigation
target. A Sun below the explorer's horizon still appears in the space diagram.

## Research and provenance

The topic, dependency and research bytes match the manifest at the commit above.
Anchors: `mt_PiWZA8Z0ZJ` (Sun, Moon & Stars) and `mt_15FduGRf5c` (The Moon’s Orbit).
This lesson covers a narrower intersection, not mastery of either whole topic.
The broader orbit topic depends on observed Moon phases and softly on Earth’s
spin/orbit; those are not imposed as prerequisites for this narrower explanation.
The naming topic’s daylight/seasons link is also broader than the present goal.

Joined teaching research recommends linking the space and observer views and
addressing night-only and self-luminous-Moon explanations. Its activity suggestions
are agent-authored proposals, not evidence of this digital lesson’s effectiveness;
some underlying pedagogical sources are marked unverified. We use the coupled
model as a design rationale, not an efficacy claim.

NASA’s [daytime Moon explanation](https://www.nasa.gov/solar-system/why-can-you-see-the-moon-during-the-day-we-asked-a-nasa-scientist-episode-19/)
was consulted on 2026-11-13 for the science: the Moon reflects sunlight and spends
time in both daytime and nighttime skies. Horizon geometry explains presence in
the sky; actual visibility also depends on illumination and contrast. See also
[NASA Moon phases](https://science.nasa.gov/moon/moon-phases/) for the distinction
between the sunlit hemisphere and the portion seen from Earth.

## Model limits

Sizes, distances and apparent diameters are illustrative. Equatorial, planar
geometry is not a real-date or latitude sky map. No clouds/contrast threshold,
eclipses, refraction or orbital tilt is computed. Decorative clouds do not block
bodies. Scored predictions use daylight, quarter-like positions well away from
the horizon and glare; they assess above/below horizon, not universal real-world
visibility. Free exploration is not graded for real visibility. The sky camera
changes viewing direction only. No Moon is drawn through the ground.

## Running and validation

Restart Marble and open the bundled lesson, or import moon-daytime.lesson 1.3.1.
The configured player supplies the tutor and speech. No private session content
is included in the package or used as live test input.

All 61 unit tests passed, including canonical question speech, voice/button
scoring parity, stale question rejection, leaving unanswered work without evidence,
and transition after a spoken answer. Shared browser checks passed for Cube,
Croatoan, imported lessons, startup cancellation, and Moon controls/geometry,
help, correction, dragging and desktop/mobile layouts. The revised visibility
question screenshot was inspected: its Yes/No choices match its written question.

Three longer synthetic conversations ran with the configured Codex tutor:
- An explicitly directed novice trace located the Sun in the space diagram,
  resolved a spoken check, moved to the blocked scene, performed model-driven
  rotation and stopped. The tutor recognised the rotation target as met.
- A knowledgeable learner used a fresh prediction, resolved it by voice, left an
  unanswered supported check for a demonstration and stopped without an error.
- A less-directed short-reply trace autonomously chose night/day demonstrations
  and a supported check, but then repeated requests for broad oral explanation
  instead of responding well to “What should I try?”. It respected stopping.

These traces validate the interaction simplification, not reliably good teaching.
The prior-knowledge trace also requested reasoning already effectively supplied.
Noisy speech recognition, ambiguous voice answers in real child speech, and child
learning were not validated. The pedagogical repetition remains an open issue;
it was not hidden by further prompt exceptions or by reporting only successful
traces. Browser tests use a fixture tutor and do not validate those decisions.

### Turn handoff checks (1.3.1)

The introduction now continues into the first teaching move. Demonstrations opt
into continueAfterSpeech; their narration finishes before another inference asks
for a learner contribution or launches an activity. Canonical questions and task
instructions retain their existing handoff. Cancellation prevents follow-through.
Answered checks retain an explicit status and submitted response in current view.

All 64 unit tests and the shared browser suite passed. The real-browser visual
learner received the introduction, night demonstration and a question without a
seeded acknowledgment. It then repeated clicks instead of answering, so that run
validates the opening transition only, not effective teaching or child behaviour.

A synthetic live-tutor check also recognized a completed button answer, recorded
its limited evidence and continued through a horizon demonstration to a question
without an acknowledgment prompt. This validates turn handoffs and answered-state
recognition in that run; it does not establish teaching quality with children.

### Horizon designation (1.3.2)

The horizon support uses a rose-colored outlined stroke and a Horizon label in
both views. The space line is tangent to Earth at the explorer; the sky line
projects zero altitude and moves with the camera. Existing support visibility
rules remain in place. The tutor receives the marker's visibility and meaning,
and the horizon demonstration explicitly names its color and label.
Moon model checks and the synthetic browser suite passed. Desktop and mobile
screenshots were inspected, including label clearance from the Earth control.
