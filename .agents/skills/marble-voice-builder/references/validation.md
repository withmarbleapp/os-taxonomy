# Validation and honest claims

Use `scripts/validate_bundle.py` on the skill and `npm run player:test` from the repository root. The validator checks
local resources and the single runtime source, not pedagogy.
The Node suite protects shared contracts and examples. `npm run player:test:browser`
exercises the generic adapter through the actual browser with a synthetic tutor.
Chrome location can be set through `CHROME_PATH` for the bundled CDP helper.

## For each new lesson

1. Verify the core model and scoring against the intended goal: multiple valid
   answers where relevant, specific wrong answers, fresh/revised cases, support
   history, and immutable original attempts. Observation and action must match.
2. Inspect the actual browser at desktop and narrow widths. Exercise the central
   interaction, clear/blocked/hidden states where relevant, unfinished work,
   fresh answers, correction, revision, explanation and self-assessment. Inspect
   screenshots yourself. Source that renders is not a teaching-quality pass.
3. Check direct manipulation and focused situations: the main actions operate
   on scene objects with visible feedback; a supported comparison isolates a
   meaningful decision; a close-up has a clear purpose and preserves the wider
   scene on return. Verify the tutor can switch situations in response to a
   misconception and introduce a fresh combined challenge. Reject instructions
   to achieve a condition already satisfied. Inspect visual quality in each
   learning view, not just whether the scene renders.
4. Check contrasting synthetic/adult conversations. Prior knowledge can justify
   an earlier fresh attempt; uncertainty can justify more demonstration; a
   counting slip should not trigger an unrelated lecture. A corrected answer
   should be recognised rather than treated as the old error. A correct count
   should not be re-asked without a genuine reason. The model should not invent
   controls, completed actions, an inside cube or an unsupported visibility claim.
   For visual teaching, check a child who says “I don't know”: does the real tutor
   invoke the relevant visible moment, or merely recite the answer and quiz it?
   Also check prior knowledge, requested manipulation, and help during an unfinished
   task. Verify demonstrations are visible, activity controls are actually present,
   and returning control preserves the current work and assistance history.
   Check that a novice is offered unscored manipulation without explicitly asking for controls, and that a practice request activates useful practice rather than another oral recall question. Inspect several reflection opportunities for repeated stems, immediate re-checks and skill-by-skill questionnaires; synonym changes alone do not fix excessive assessment. Scripted tool calls alone do not validate these instructional decisions.
   Include traces where a child gives an explanation naturally, needs prompting
   to explain, feels unsure after correct work, feels confident with an uncovered
   extension available, chooses more practice, declines reflection, and explicitly
   stops before finishing the work. Check that confidence alone never causes
   completion, continued work retains context, and explicit stopping is respected
   without another question or offer. Evaluate these as shared tutor behavior;
   do not fix failures by adding a separate ending policy to each lesson.
   Also compare novice and strong-prior-knowledge traces against the authored
   difficulty map: small supported checks should be available before whole-topic
   synthesis, while established prerequisites can be skipped. Verify help stays
   visible in supported checks and is removed only for intended transfer.
   Follow the transitions between showing and doing: does a demonstration enable
   a meaningful learner action, does an exploration outcome influence the next
   teaching move, and does help return control on the same work? Include a trace
   where an observation or difficulty during exploration motivates a focused
   demonstration. Judge the reason for changing challenge or support, not just
   tool usage or the number of activities. A lecture interrupted by oral quizzes,
   or an activity launched without time to act, does not establish this interplay.
5. When authorised, exercise actual PTT through recognition, the selected tutor,
   scene acknowledgement and synthesis. Verify hold/release, toggle, cancel,
   interrupting playback, late transcripts, missing services and provider errors.
   Scene navigation should not casually interrupt speech or answer a question.
6. Read the final words, inference context, tool results and playback records in
   local journals. If a failure is reported, inspect them rather than blaming
   child understanding or guessing at transcription. Reproduce the narrow bug
   before changing a shared policy. Historical attempts stay historical; the
   newest checked values must be explicit in the next model request.

## What to report

Separate model/scoring tests, browser fixtures, scripted conversations, actual
LLM conversations, actual local speech and child evaluation. Mark all synthetic
inputs. A branching fake agent proves that tools support different routes; it
does not prove the live model will choose good teaching moves. A successful
microphone loop does not establish child recognition accuracy, low-end-device
performance or subjective voice quality.

Use the actual configured model for requested live testing, with synthetic learner
inputs. Follow the testing scope in [SKILL.md](../SKILL.md): provider selection
is a player setting, not an authoring approval question. Do not send private child
journals to a provider merely to test a new lesson. If live testing is not
configured, complete the independent checks and report what remains untested.
Publishing and account/billing changes remain separate from lesson authoring.
