# Teachable moments and direct interaction

Design the representation and the tutor's tools together. The unit of design is
the **teachable moment**: one relationship, made visible, with something the
child can do about it. A lesson is a set of these that the tutor can reach in
any sensible order.

## Write the situation table first

Before coding, write one row per relationship in the teaching brief. The table
is an inventory of opportunities, so a child need not meet every row.

| Design question | Example: daytime Moon |
|---|---|
| What needs to become visible? | Light reaches the Moon from the Sun, then reflected light can reach the observer. |
| What does the tutor provide? | A staged space view with a sequential animated light journey and a brief explanation. |
| What can the child contribute straight away? | Notice the starting point or direction; relate the animation to the Moon in the sky. Repeating the explanation back is not asked of them. |
| What can the child try with it? | Turn Earth with the Moon fixed and the light rays kept; compare the explorer's skies. Predicting without rays is a harder, later option. |
| What might call for another demonstration? | The child notices the Moon disappear: show how Earth blocks the reflected light in that arrangement, then return control to investigate it. |
| What does success establish? | A committed prediction or constructed route, with its support history. An own-words explanation is separate evidence. |
| How does help preserve work? | Pause the current activity, demonstrate on that same setup, then return control with its history intact. |

## Showing and doing feed each other

Some things have to be shown before they can be explored: asking a child to
guess an unexplained mechanism from a scene is not scaffolding. And a child who
can already explain the mechanism gains nothing from sitting through the
demonstration. So for every explanation the lesson supplies, name what the child
can do with it now; for every investigation, name the observations, questions
or difficulties that would call for another demonstration.

The rhythm that follows from this:

- **Start with an intelligible example** and a short statement of what you will
  learn together. The opening is something the child can take part in without
  already knowing what the lesson teaches.
- **Demonstrate just enough to make the next action meaningful**, then let the
  child manipulate, build, compare or revise, with time to see what happens.
- **Let the outcome choose the next move.** A surprise can motivate new
  teaching. A specific difficulty justifies showing one relationship on the
  child's current arrangement. Success may justify less support or a new
  application.
- **Give unscored exploration a purpose:** a relationship to investigate,
  visible consequences and possible next moves. It is a way of teaching, not a
  reward after mastery.

The lesson provides these connections; the tutor decides the order and the
count. Answering spoken questions between explanations is not the same as acting
on the model, and neither starting an activity nor dragging an object shows
understanding. What counts is the outcome and what the child makes of it.

## Give the tutor whole moments

A tutor choosing among camera, highlight and animation switches will sometimes
play an animation behind the wrong camera. So expose high-level actions, such as
showing a moment or starting a child activity, each of which sets the view,
geometry, supports and animation together and returns the scene that actually
resulted, before any speech.

- **Say when a moment is useful.** Put when to use it and what the child can
  contribute in the action's description and in the current scene context. For
  tutor-worded `explain_model` resources these are the `whenToUse` and
  `learnerContribution` fields.
- **Report the scene as it is:** current mode, visible supports, what the child
  can do now, the current attempt, adjustable objects, fixed conditions and
  where any assistance came from.
- **Keep the child's work.** When a setup changes, the tutor says so naturally,
  and the previous work is kept, not reset. If the child has already met a
  condition, acknowledge it and choose a different comparison.
- **Keep demonstrations in their own category.** Authored examples and
  animations are information given to the child. They are never recorded as
  learner actions or as evidence of mastery.
- **Keep navigation separate** from teaching and from answering. Moving around
  the scene answers nothing.

## Focus one decision at a time

A focused situation removes the degrees of freedom that are beside the point,
so the child can notice one relationship. "One variable" means one meaningful
decision for the learner; quantities that are physically coupled stay coupled,
and the scene never shows an impossible configuration.

Use different views for different scales or purposes, and let the tutor bring
them in when useful. A water-drop close-up explains light inside a drop; an
outdoor scene explores where an observer sees a rainbow. The tutor can open the
close-up and return to the outdoor setup exactly as it was. Views offered this
way keep the screen about one thing, where permanent tabs for every moment
would compete for attention.

For a rainbow lesson, candidate situations might hold observer and spray in a
helpful arrangement while comparing sunlight with cloud cover, then hold light
and spray fixed while exploring viewing direction. A later fresh problem
combines position, orientation and conditions. Research the optical geometry
first: a rainbow is not a fixed object in the world, and not every wet, sunlit
arrangement produces one.

Combined, multi-variable problems test whether the child can put the ideas
together. The tutor introduces one when the evidence suggests it, reads the
response, and then chooses what follows. Assisted practice is recorded
separately from independent work.

## Put actions on the things they affect

For each child action specify the object, the gesture, the cue that makes it
discoverable and the immediate feedback.

- **Act on the object itself.** Tap a fountain to start or stop its spray; touch
  the Sun or a cloud to reveal or cover sunlight; drag the observer or swipe the
  view to explore position and direction.
- **Show the change in the world.** Tapping the Sun visibly moves a cloud across
  it, which is truer than the Sun appearing to switch off, and clearer than a
  status label.
- **Make it forgiving.** Visible handles, generous hit areas, tolerant movement
  and a brief hint in context. Nothing essential depends on precise dragging,
  hover or guessing, and there is a keyboard or text alternative.
- **Reserve buttons** for navigation, committing an answer and actions with no
  natural scene object. A row of rotation buttons, switches and sliders as the
  main experience is a control panel with a tutor talking over it.
- **Keep gestures distinct.** Moving an object is different from rotating the
  camera, and a gesture is never silently treated as an answer.

## Prove one situation before building the rest

Build one focused situation with real manipulation and look at it at the target
screen size. Can the child find the object, understand the gesture and see the
consequence without being walked through the controls? Then check on paper that
a tutor could move between two different situations and a transfer challenge
using only the tools and descriptions you have written. If that only works in
one fixed order, the tools and teaching material need revising before more
scenes are added.
