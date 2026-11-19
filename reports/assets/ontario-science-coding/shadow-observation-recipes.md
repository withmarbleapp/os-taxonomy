# Original shadow-observation coding packet

These are original preparation and assessment recipes, not recorded learner work or a tested intervention. Use an actual visual programming editor such as Scratch. A spoken algorithm, paper ordering task, watching a supplied animation or naming hardware alone does not complete the coding performance. Save the learner’s actual program and its run/check record. The block recipes below describe teacher reference solutions; learners must plan and author the required changes themselves.

## Common science resource and access

An adult prepares a cool battery LED torch, a large opaque card and a fixed white screen in a normally navigable room. Observe the screen, never the source. No lasers, sun-gazing, hot lamps, mains wiring, total darkness or moving around blindfolded. With the torch and screen fixed, place the card between them; remove it and replace it. In a second comparison, move the same card nearer the small nearby torch and then nearer the screen. Keep its orientation and the torch/screen positions fixed. Record the actual observation and any unclear result. A cast shadow is a region receiving less light because the opaque card blocks the source; a black drawn shape on a screen is a representation of that observation, not blocked physical light inside the computer.

Use a large accessible switch/keyboard, magnified blocks, readable high-contrast labels, adult transcription of the learner’s dictated commands, or a willing partner operating under their precise directions when needed. Preserve the learner’s decisions and actual execution; do not score motor speed, sight/hearing acuity or independent text typing. If the safe setup or programming editor is unavailable, record the delivery condition; do not award a pass from the preparation sheet.

For the initial program, make a plain card-shaped sprite called `Shadow`, with two original costumes: a dark plain rectangle and an outline carrying the label `no card shadow`. These are diagram symbols, not photographs or a calibrated optical simulation. Make a separate `Observation` sprite for text. Avoid a coloured face or detailed reflection on the dark silhouette. A changed transparent-material case requires its own observation; do not assert that all transparent objects produce literally no optical effects.

## Example observations for checking code

The following small dataset is **invented practice data**, not measurements made by a child or an account of a particular classroom experiment. It is sufficient to check the code’s data handling. Replace it with actual observations for the investigation and retain their provenance. The adult keeps an unchanged reference copy so a coding error cannot silently alter the source data.

| Trial label | Card position | Observed shadow width (cm) |
|---|---|---:|
| near | nearer the torch | 18 |
| middle | between the two positions | 12 |
| far | nearer the screen | 9 |

These values are examples for a fixed setup, not universal predictions. A different torch, object, orientation or screen position can produce different results. The sprite’s `size` setting is an arbitrary display percentage, not centimetres or an inverse-distance formula. For the example diagram only, size settings 180%, 120% and 90% preserve the displayed order of these three observations. Never infer an unmeasured value by extending this table.

A blank actual-run record has these fields: program/project reference; learner’s plan; observation source/date/setup; predicted program result; actual run result; discrepancy; changed blocks; rerun result; explanation and transfer result. Leave fields blank until the work occurs. Do not fabricate a successful execution, measurement or child response.

## Grade 1: precise sequence representing the observation

Plan a sequence showing (1) card removed and no card shadow, (2) card placed between torch and screen with its cast shadow, (3) card removed again. In the real editor, author a start event and ordered costume/text commands, with waits so each stage can be seen. A reference recipe for `Shadow` is:

```text
when green flag clicked
switch costume to [no card shadow]
say [Card removed: screen illuminated] for (2) seconds
switch costume to [dark rectangle]
say [Card blocks the torch: shadow on screen] for (2) seconds
switch costume to [no card shadow]
say [Card removed again] for (2) seconds
```

The labels refer to the prepared physical arrangement; the computer does not test the physics. Predict the sequence, run it and compare it with the observation record. Swap the middle and final costume blocks, run again, identify the mismatch and restore a sequence matching the intended arrangement. The learner must make the science representation precise; unrelated counting steps do not substitute for it.

## Grade 2: decompose, implement and join the parts

Give the goal “make a program that introduces our setup, shows the card comparison, and reports what we observed.” Before supplying a recipe, ask the learner to break the goal into at least three named smaller jobs, identify needed materials/data and choose an order. They author and run the introduction, the three-state comparison above, and a concluding observation separately, then join and run them as one program. A reference plan is `describe source/card/screen → show removed/placed/removed → report the observation and one limit`.

Inspect their own decomposition and the joined execution, including a changed plan that repeats the card-placed comparison. Merely running three teacher-supplied scripts or reading the plan aloud does not establish decomposition and execution.

## Grade 3: test, locate and refine an actual bug

The learner first authors and runs a three-trial diagram using the example data or the actual observation record. Use named observations, a plain rectangle and text. A teacher reference for each trial is `set size to (width × 10)% → say (trial label + width + cm) for 2 seconds`; the ×10 is an explicitly arbitrary display mapping. For a learner who has not used multiplication in blocks, the three display sizes can be supplied as lookup values.

Then give an independently saved buggy version whose `near` display uses the `far` size, or whose sequence omits the middle observation. Before running it, write the expected outcomes for all three known cases. Compare actual output with that reference, isolate the first mismatching block and change one thing at a time. Rerun all three cases, including a changed observation table. For a blank/unrecorded trial, display `not measured` rather than zero or an invented result. The explanation must name how the bug was located and why the correction fits the data; clicking Run or receiving a corrected project is insufficient.

## Grade 4: deliberately different outputs for different purposes

Author and execute both (a) a labelled textual result, preserving trial name/value/unit and (b) a graphical display showing the three relative shadow widths. Use a new `Observation` sprite for the textual report and the rectangle for the diagram. Reference steps are `say [near: 18 cm]`, then `set size to 180%`, followed by equivalent middle/far reports and sizes. Keep a separate scale/key stating that display percentages are diagram choices, not physical units.

Choose and explain the purpose of each output: precise text preserves the measured quantity/unit; the graphic makes the comparison easier to inspect. Change a value and run both outputs again, checking that both reflect the change and retain labels. Two hardware names, two cosmetic colours or a chart drawn entirely outside the program do not replace the authored outputs. Text and graphics are two output types; audio is an optional further choice, never an access or hearing requirement.

## Grade 5: store, retain and process scientific observations

Author and run a latest-reading variable plus a list of all observed widths. Explain that the variable can be replaced by the next reading whereas the list retains the series. A reference initialization is `set latestWidth to 0; delete all of widths`. For each supplied example reading: `set latestWidth to value; add latestWidth to widths`. After the three entries, the expected variable is `9` and the list is `[18,12,9]`. Repeating the run must reset the series rather than silently append a second experiment.

Write a loop through the list with a counter to find its largest recorded value, and retain trial labels in a parallel list or paired records. The expected largest example value is 18 cm, associated with `near`. Also use an `if` comparison to label a supplied criterion such as “greater than 10 cm”; that teacher-selected screen-report criterion is not a biological/clinical threshold or physical law. For a changed dataset `[14,11,7]`, expected latest is 7 and largest is 14. Explain why the series, latest value and comparison each serve a different purpose. Storing a game score or copying the final number alone does not complete this investigation task. This is a bounded applied use of a list, not a claim to have assessed every data structure.

## Grade 6: program different input methods for scientific purposes

Author and execute two input methods with genuinely different purposes: a mouse/touch click changes **how the result is communicated** (precise text versus a labelled diagram), while a typed answer chooses **which recorded scientific trial is being requested**. Use a named mode button and a separate trial-question script. A reference mode handler is `when this sprite clicked → set displayMode to [diagram] or [text] → broadcast [show result]`. Its counterpart for the other mode sets the other named value. The typed handler asks for exactly `near`, `middle` or `far`, stores `answer` as `selectedTrial`, and uses explicit branches to find the matching recorded result. A blank, unknown label or missing measurement gives `not recorded`, never zero or a guessed observation.

Both paths call shared reporting code that first validates the selected record and then uses `displayMode`. Text mode gives the trial name, recorded value and unit; diagram mode changes the rectangle's illustrative size, retains the trial label and supplies the arbitrary-scale key. With no valid selected record, both modes show `not recorded` instead of rendering a fabricated zero-width measurement. A request button can initiate another typed question; it does not itself supply the typed answer. No concurrent prompt loop or rapid motor response is required.

Test each mode with all three typed trial requests, then a blank answer, an unrecognised label and a selected-but-unmeasured trial. Change the observation set and rerun both modes, demonstrating actual input processing rather than a fixed animation. Explain that the click selects a communication form for an audience/purpose, whereas the typed request selects the scientific record to inspect; convenience alone is not the different-purpose explanation. Key-event navigation is another possible method, but no physical sensor, microphone, private data capture or invented live measurement is required. The inputs select recorded observations and presentation; they do not control a real lamp or acquire real physical sensor readings.

## Whole-claim and source boundaries

All six tasks require learner-authored code and actual execution at delivery, with a saved test record. They are source-specific applied contributions. They do not alone certify the complete first-visual-program topic, which also includes its existing movement/speech/costume and mathematical-sequence evidence, or all input/variable/debugging evidence. Keep those whole assessments separate. The physical shadow comparison is a science context; it does not silently assess all of the shadow topic or grant a new science association. A different new opaque shape or changed observation set supplies transfer without creating another topic or difficulty level.

The impact-of-technology expectations and the overall coding expectations remain separate. This packet does not turn successful code execution into a completed social impact analysis or an overall judgment.
