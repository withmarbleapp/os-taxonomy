# The moment contract

Every bundled lesson's model is one call to `defineLesson` in
`packages/lesson-sdk/moments.mjs`. This note says what that contract is, what a
lesson supplies, and what the three ports showed does not yet fit.

## The idea

A lesson is one **representation** (a scene with its own state and its own
truth) and three lists of **moments** on it:

| Moment | What happens | Evidence |
|---|---|---|
| show | The lesson speaks an authored explanation while the representation shows it, then hands back to the tutor in the same turn | Never |
| do | The child works on the representation: exploring, or towards a goal the representation can recognise | Only a goal marked `counts`, reached without help |
| ask | A question about a situation the representation sets up, answered by voice or touch | Yes, unless help was shown first or it is a retry |

The representation can be custom (the meadow, the Sun and Moon, the block of
cubes) or, later, a standard block (a number line). The tutor and the standard
controls cannot tell which.

The rule that keeps lessons from becoming quizzes: a representation that can
only be asked about is not one. It must also show and be worked on.

## What the engine owns

The same in every lesson, and not open to a lesson to change:

- **The tutor's actions:** `show_moment`, `start_activity`, `start_check`,
  `answer_check`, `leave_activity`, `resume_activity`, plus any navigation the
  lesson declares as a control. Their descriptions are built from each item's
  `when` text.
- **Questions:** one object gives the spoken words, the words on screen and
  the answer controls. Three answer formats: choices, tapping things in order,
  and labelled boxes to fill. A spoken answer and a touched one are scored the
  same and recorded with how they were given.
- **Help:** a show that supports the work in hand keeps that work, marks it
  helped, and `resume_activity` gives it back. A show marked `aside` (a
  close-up) restores everything on return. A show that would replace the
  arrangement is refused while a question is unanswered.
- **Retries:** an answered question can be reopened; the first attempt is kept
  and the retry is recorded as helped.
- **Evidence:** every attempt (`response_committed`) and every goal reached
  (`goal_reached`) carries `assisted` and `sceneId`. A lesson's patches may only
  touch its own representation, so it cannot set these.
- **The tutor's view:** the current question and its status, the current
  activity and whether its goal is reached, the latest attempt, and what the
  child can do now, around the lesson's own description of the screen.
- **The standard controls** (`moments-ui.mjs`): answer buttons, hint, "try it",
  the order tools and the fill-in boxes. The lesson's page places the elements;
  the module wires them.

## What a lesson supplies

- `state`: the representation's own fields, their starting values, and what a
  fresh arrangement clears (supports, covers).
- `facts`: what is true of a state. Hooks get everything it returns; only the
  facts named in its schema are published.
- `describe`: the screen in words a child would recognise, for a tutor that
  cannot see it.
- `gestures`: what the child can do to the representation, each with its
  event. A gesture belongs to the activities that list it, or is `always`
  available (turning a model round).
- `controls`: navigation the child shares with the tutor (changing the view).
- `situations`: named arrangements a question can be asked about.
- `show`, `do`, `ask`: the moments, each with its words, when it is worth
  using, and how it arranges or supports the representation. An `ask` gives its
  right answer as a function of the facts, what to hide while it waits, what to
  reveal once answered, and the line shown afterwards.

The lesson's `experience.json` is generated from the descriptor
(`scripts/write-experience.mjs`); it is never edited by hand. Tests import the
model by the paths the player serves (`/sdk/…`), which
`test/support/player-paths.mjs` teaches Node to resolve.

## What the three ports showed

All three lessons run on the contract with their authored words, arrangements
and subject models unchanged.

| Lesson | Model before | Model after | show / do / ask |
|---|---|---|---|
| Moon | 497 lines | 228 | 7 / 1 / 3 |
| Rainbow | 742 | 457 | 7 / 6 / 5 |
| Cube | 57 minified lines (13 KB) | 294 (16 KB) | 12 / 2 / 1 |

The cube model is not smaller: twelve explanations moved into it from the
teaching file, and it is no longer minified. What left all three is command
handling, scoring flow, retries, event plumbing and snapshots.

The contract had to grow five times to fit the cube and rainbow lessons, each
time with something general: the fill-in answer format, spoken fill-in
answers, `always` gestures, shows that `stay` in the child's hands, and a
resume button offered after an answer.

Behaviour that changed:

- **Moon:** a hint now adds to the work and leaves it with the child; it used
  to switch to a demonstration that had to be resumed. The route-building task
  is now a question answered by tapping in order.
- **Rainbow:** a fresh prediction records its situation as `fresh`, so the
  arrangement's own name is no longer in the attempt. A close-up shown during
  an unanswered drop question hides the answer again on return.
- **Cube:** the lesson words its own explanations now; the tutor used to
  paraphrase them. Asking for a new block no longer silently replaces an
  unchecked plan. After a checked plan the right total is on screen at once.

What still fits badly:

- **Whether help pauses the work is a per-show flag** (`stay`). Moon and
  rainbow pause; the cube never did. The contract has no stated default
  reason for either.
- **The spoken question and the words on screen are the same sentence.** A
  full spoken instruction crowds a phone, so the cube lesson moved its
  instructions into the situation's lead. The split between lead and question
  is doing layout work it was not designed for.
- **A do with no natural goal** is reported to the tutor as open exploration.
  The cube's building activity invents a goal to avoid that.
- **Action descriptions are generated**, one sentence per item. Hand-written
  descriptions grouped items ("transfer", "deeper"); that grouping now lives
  only in each `when` string.
- **The tutor view is nested** under `screen`, so teaching text that named a
  field (`mia.why`) had to follow.
- **Nothing here has run with a real tutor.** The tests and browser checks use
  stand-ins. Whether the generated action descriptions teach as well as the
  hand-written ones is untested.
