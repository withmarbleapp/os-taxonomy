# Validation and honest claims

This skill checks the things that can be checked without running the tutor: the
model is right, the scene can be seen and operated, and the teaching material
gives a tutor real choices. It does not evaluate how a live tutor teaches with
the lesson, how the voice loop behaves, or what children learn. No reliable
method for those is part of the skill yet, so the report says plainly that they
were not evaluated.

Passing tests tell you the wiring holds. Whether the feedback is sensible and
the authored speech suits the child's age, you find out by reading it.

## Commands

From the repository root:

```sh
npm run skill:validate        # the skill's own links and player resources
npm run player:test           # shared contracts and example lessons
npm run player:test:browser   # shared browser fixtures
npm --prefix player run marble -- validate /absolute/path/to/lesson
```

Set `CHROME_PATH` if the browser helper cannot find Chrome.

## 1. Model and scoring

Write tests for the lesson's model against the goal: several valid answers where
they exist, specific wrong answers, fresh and revised cases, and support
history.

- Original attempts stay unchanged when a new one is submitted, and the latest
  submission is the current one.
- Help given and answers exposed are recorded with the attempt they affected.
- A command based on an old revision or an old question is rejected.
- A spoken answer and a button press score the same way, and the attempt
  records which it was.
- Each demonstration or check returns its authored speech, and a question's
  speech, on-screen text and choices come from one object.
- Unfinished work can be left without an answer being invented for it.

## 2. In the browser

Look at the real browser at the target width and a narrow one, and inspect the
screenshots yourself. Exercise the central interaction; clear, blocked and
hidden states; unfinished work; fresh answers; correction and revision.

- The main actions operate on scene objects with visible feedback.
- A supported comparison isolates one meaningful decision.
- A close-up has a clear purpose and the wider scene is as it was on return.
- Each demonstration is actually visible from the view its action sets, and the
  controls for each activity are actually present when it starts.
- An instruction never asks for a condition that is already met.
- Help on unfinished work leaves that work and its history in place.

A scene that renders has passed nothing yet about teaching.

## 3. Read the teaching material as the tutor would

This is a desk check, done by reading `teaching.json`, the action descriptions
and the authored speech together. For each kind of learner below, find the move
the material makes available and confirm the tutor would know when to use it.

| Learner | The material should offer |
|---|---|
| Strong prior knowledge | A route to meaningful work that skips the demonstrations, with the evidence that justifies skipping |
| "I don't know" | A visible moment for the relationship in question |
| A novice who asks for nothing | An unscored activity the tutor can start unprompted |
| A specific slip | A way to work on that slip on the child's current setup |
| Corrects an answer | State that shows the latest answer as current and the old one as history |
| Asks for practice | Practice at the same demand, separate from a harder transfer task |
| Needs help mid-task | Help that pauses the task and returns to it |
| Has not explained | A written description of what an explanation would show, and small checks to use before asking for one |
| Confident, with more available | Deeper aspects or fresh problems, each with prerequisites |

Also read every authored sentence aloud. It should be short, use words the child
knows, contain one question at most, and be true of what the scene shows at
that moment.

If a row has no answer, the lesson has a gap in its map. Fill it in the lesson's
material. How the tutor converses, reflects and stops belongs to the shared
tutor and is not patched in a lesson.

## What to report

- What the model tests cover, and their result.
- Which widths and states were checked in the browser.
- Any gaps found in the desk check, and what was done about them.
- Whether the visuals are functional or polished.
- A plain statement that the tutor's live teaching, voice behaviour and
  children's learning were not evaluated.
