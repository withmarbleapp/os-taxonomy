# Focused situations, direct interaction

Design the representation and the tutor's capabilities together. Before coding,
write a small situation table in the teaching brief: idea being developed; what
stays fixed; what the child can change; visible consequence; a useful prompt;
evidence of understanding; possible support and fresh transfer. This is an
inventory of teaching opportunities, not a sequence every child must complete.

## Design around teachable moments, not a control inventory

For each idea distinguish the information the tutor should supply from work the
child is ready to do. A new mechanism may need to be shown before it can be
investigated; asking the child to guess it from an unexplained scene is not
scaffolding. Conversely, a child who already explains the mechanism need not
watch a compulsory demonstration. These are available teaching choices, not stages.

| Design question | Example: daytime Moon |
|---|---|
| What needs to become visible? | Light reaches the Moon from the Sun, then reflected light can reach the observer. |
| What does the tutor provide? | A staged space view with a sequential animated light journey and a brief explanation. |
| What can the child contribute now? | Notice the starting point or direction; relate the animation to the Moon in the sky. Do not demand immediate repetition of the supplied explanation. |
| What can the child try with this now? | Turn Earth with Moon fixed and light rays retained; compare the explorer’s skies. A prediction without rays is a harder later option. |
| What might call for another demonstration? | The child notices the Moon disappear; show how Earth blocks the reflected light on that arrangement, then return control to investigate it. |
| What does success establish? | A committed prediction or constructed route, with support history. Own-words explanation is separate evidence. |
| How does help preserve work? | Pause the current activity, demonstrate the relevant relationship on that setup, then return control without resetting its history. |

Expose high-level actions such as showing a teaching moment or starting a child
activity. A teaching action should atomically set the needed view, geometry,
supports and animation; acknowledge the actual resulting scene before speech.
An animation hidden behind the wrong camera is not a demonstration. Keep a small
number of task-relevant child controls visible, with meaningful direct manipulation.
Do not give the child a generic control panel while the tutor talks over it.

For authored `teaching` resources, include `whenToUse` and `learnerContribution`
alongside the action and text. The shared `explain_model` tool exposes these
moments directly. Report current mode, visible supports, available child actions,
current attempt and what the scene actually shows. Authored examples and
animations are provided information, never invented learner actions or mastery.

## Interweave demonstration and exploration

Demonstration and learner activity belong throughout teaching. For each supplied
explanation, identify what the child can meaningfully do with it now; for each
investigation, identify observations, questions or difficulties that could call
for another demonstration. Expose those connections in the teaching resources
and tool guidance so the tutor can choose them from the current learner evidence.
Do not prescribe a fixed alternation, a time ratio or an activity quota.

Demonstrate just enough to enable an action. Let the child manipulate, construct,
compare or revise, with time to see the consequences. A surprise can motivate
new teaching; a specific difficulty can justify showing one relationship on the
child's current arrangement. After help, return control so they can retry or vary
it, preserving work and support history. Successful investigation may justify
less support or a new application without another demonstration.

Unscored exploration is a teaching opportunity, not only an extension after
mastery. Give it a relationship to investigate, visible consequences and possible
next moves. Answering oral questions between explanations is not a substitute for
meaningful action. Neither opening an activity nor dragging an object establishes
understanding: use the actual outcome and the child's response to choose what
happens next. Keep general timing and reflection policy in the shared tutor;
lesson resources supply the concrete opportunities and their connections.

## Install one relationship at a time

Start with an intelligible example and a short teaching intention. Demonstrate
just enough to make the child's next action meaningful. Let them try, describe
what changes, ask questions and receive help. Do not begin with a puzzle requiring
all the knowledge the lesson is supposed to teach.

Give the agent tools to prepare focused situations, restore a comparison, show
or hide explanatory support and offer fresh challenges. A focused situation
constrains irrelevant degrees of freedom so the child can notice a relationship.
Keep scientifically coupled quantities consistent: "one variable" means one
meaningful learner decision, not an impossible physical configuration.
Tools return the actual setup, adjustable objects, fixed conditions, visible
supports and assistance provenance. Tell the child naturally when the setup
changes. Never silently reset their work or ask them to achieve an already-met
condition. Acknowledge current success and choose a different comparison instead.

Use distinct views for different scales or purposes. A water-drop close-up is
an explanation of light interacting with a drop; an outdoor scene explores
where an observer can see a rainbow. The agent can introduce the close-up when
useful and return to the preserved outdoor setup. Do not expose all learning
moments as permanent competing tabs or buttons.

For a rainbow lesson, candidate situations might keep observer and spray in a
helpful arrangement while comparing sunlight with cloud cover; then hold the
light and spray fixed while exploring viewing direction. Later combine position,
orientation and light/water conditions in a fresh problem. Research the optical
geometry before implementing these examples: do not draw a rainbow as a fixed
object in the world or make any wet, sunlit arrangement produce one.

The agent chooses based on current evidence. It may skip familiar ideas, return
to a focused comparison after a mistake or reduce support. Multi-variable
transfer checks whether the child can combine ideas. Introduce it naturally
and interpret the response before choosing further teaching, explanation or
reflection; do not attach a mandatory closing sequence to it. Record assisted practice separately from independent work.

## Put actions on the things they affect

For each child action specify the object, gesture, discoverability cue and
immediate feedback. Prefer tapping a fountain to start/stop its spray, touching
the Sun/cloud to reveal or cover sunlight, and dragging the observer or swiping
the view to explore position and orientation. Use visible handles, generous hit
areas, forgiving movement and a brief contextual hint. Make the changed state
obvious in the world, not solely in a status label. Tapping a Sun should visibly
move a cloud rather than imply the Sun literally switches off.

Avoid a row of rotation buttons, switches and sliders as the primary experience.
Reserve buttons for navigation, committing an answer and actions with no natural
scene object. Keep keyboard and accessible alternatives available; direct
manipulation must not require precise dragging, hover or guessing. Distinguish
moving an object from rotating the camera. Do not change every interaction mode
at once or turn a gesture into an unsolicited assessment.

## Check the design before expanding it

Build one focused situation with its intended visuals and real manipulation
first. Inspect it at the target screen size: can the child find the object,
understand the gesture and see its consequence without a control-panel tour?
Then exercise the agent's choice between two different situations and a transfer
challenge. If these require a fixed script, revise the tools and teaching
package before adding more scenes.
