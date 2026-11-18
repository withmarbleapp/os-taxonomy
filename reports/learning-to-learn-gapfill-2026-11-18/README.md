# Learning to Learn: missing teaching research

Adds **18 canonical v2 teaching-research records** on top of `483796b44b0d8d8508d571a67a9a9fb54bf30eb4`, the merged Geography contribution (#167). Learning to Learn coverage grows from **2 / 20 to 20 / 20**; the whole collection grows from 1,282 to 1,300 records. All 1,282 existing authored records, including the two existing Learning to Learn records (Remembering visual forms; Noticing present sensations and thoughts), retain their digests. Reviewing existing research remains a separate task.

All 18 additions are META topics in the single Learning to Learn domain, so every assessment uses `open_epistemic_probe`, and each `correctAnswer` is marked as an exemplar for discussion, not an answer key.

Topics, dependencies, curriculum alignments, ages and standards remain unchanged. [scope.json](scope.json) freezes the selected topic, evidence, prerequisite and dependent contexts, source-file hashes, baseline coverage and authored-record digests. Only the research collection and generated manifest change among pre-existing files.

[capture-scope.mjs](capture-scope.mjs) regenerates scope.json from a base ref (default `origin/main`) by reading the data files through `git show`. After a rebase, it refreshes the baseline honestly even though this subject's records are already in the working tree:

```sh
node reports/learning-to-learn-gapfill-2026-11-18/capture-scope.mjs origin/main
```

## Human review

Open [index.html](index.html) directly in a browser. The page is self-contained and works offline. You can search or filter the 18 additions by confidence and read teaching moves, activities, exercise-generation guidance, the open probe, diagnostics and source claims and limits together. Exemplar responses are collapsed at first.

Notes stay in local browser storage under a Learning to Learn key (`marble-teaching-research-learning-to-learn-2026-11-18`), separate from earlier subjects. Export them to keep or share them. The page keeps the merged two-tab and stale-note behaviour:

- Uniquely keyed revisions preserve concurrent edits.
- Storage events update other tabs.
- Conflicting versions stay visible and exportable until you resolve them.
- Superseded revisions are compacted.
- **Confirm notes apply to this version** rebinds notes explicitly after re-review.
- Export includes original and current digests.
- Back and Forward restore the topic that owns the notes or source anchor.

Nothing is sent anywhere.

```sh
node reports/learning-to-learn-gapfill-2026-11-18/build-review-page.mjs
```

## Authoring and evidence boundary

- Each topic has three activities with learner actions, intended insight, feedback, rationale and source links, plus an `Exercise design:` constraint (support to fade, demands to vary, transfer and boundary cases). These are proposed progressions, not calibrated difficulty scales or new age or mastery thresholds.
- The grounding is the EEF Metacognition and Self-regulated Learning guidance (plan–monitor–evaluate, modelling, challenge, metacognitive talk, judgements of learning). It also draws on Dunlosky's practitioner summary of Dunlosky et al. (2013), Learning Scientists posts on retrieval, spacing and elaboration, EEF literacy and feedback guidance, Rosenshine's principles, NRICH guidance on generalising, Perkins and Salomon on transfer, and a help-seeking editorial.
- Following EEF Misconception 4 (little evidence for discrete generic learning-to-learn lessons), every record embeds the habit in subject tasks. A strategy talk on its own is not counted as evidence.
- "Learning styles" appears only as a named myth. Choosing a Strategy lists the matching belief in `commonMisconceptions`, and it has a `myth` diagnostic sourced to the Association for Psychological Science (APS) summary of Pashler et al. No task labels learners by style. Persistence work does not rely on growth-mindset messages: the EEF Changing Mindsets trial found no attainment effect.
- Open probes use fresh scenarios (a frog-and-staircase puzzle, a contradictory note, picnic combinations, door numbers and others) that differ from the activities. Probes that include a calculation state the checked result: 5 jumps, 24 pencils, 12 boxes and door 10.
- Of the 37 diagnostics, 34 are labelled **authored observable performance/reasoning checks** with an evidence basis. Three adapt documented findings: young children's over-optimism about their understanding (EEF; `developmental`), the belief that massed rereading or cramming is best (Dunlosky; EEF; `misconception`) and learning-style matching (APS/Pashler; `myth`). All distractors are null. Every prerequisite recovery uses an actual edge.
- Safeguarding: reflection and goals concern school learning, not private family, health or personal matters. Help is never withheld from a distressed or unsafe child, and worries go to a trusted adult under existing school procedures. Home participation is optional, and no study plan depends on home resources. Physical making tasks follow normal supervision rules.

**15 additions have medium confidence; three have low confidence; none has high confidence.** The low-confidence records:

- **Asking for Help:** the fetched help-seeking evidence summarises mainly older learners, and the topic's evidence fields are research labels rather than observable behaviours.
- **Persisting When It's Hard:** persistence and mindset evidence is contested, and the fetched EEF trial found no attainment effect.
- **Transferring Skills:** Perkins and Salomon report that far transfer very often does not occur, and no tested primary routine was found.

Medium confidence means the sources support the teaching approach, not that these exact activities were tested. Setting Learning Goals is medium, but its reviewNotes record that no evidence was found for the specific week-long routine.

Seven topics (Asking for Help, Feeling of not understanding, Thinking Before Starting, Connecting New & Old Ideas, Learning from Mistakes, Transferring Skills and Finding Knowledge Gaps) list research labels such as "Hattie visible learning" or "Flavell" in their `evidence` field. These records infer observable evidence from the description and say so in reviewNotes. Hattie and Flavell were not fetched and are not cited. The topics themselves are unchanged. Some given dependencies look questionable, for example Thinking Before Starting hard-depending on Persisting. They are used as given and flagged in reviewNotes for later claim review.

### Sources

[source-checks.json](source-checks.json) records **27 checked source entries across 15 URLs**, with the sections used and exclusions. Several EEF web pages (the guidance and toolkit pages) and both PSPI articles returned HTTP 403. They were not promoted to verified sources, and the EEF guidance PDFs on the EEF CDN plus the APS release and the AFT summary were used instead. Source verification applies to the precise citation claim, not to every sentence of a page or to an activity's efficacy. Older-learner sources (Dunlosky, the help-seeking editorial, the Learning Scientists' university classroom account) are identified as adaptations.

No learner trial or independent content review has occurred. The old agent's independent critic pipeline has not been run. The author's source and content pass and the automated checks do not replace those review gates.

## Validation

```sh
npm run alignments:generate
npm run validate
npm run alignments:generated-check
npm test
node reports/learning-to-learn-gapfill-2026-11-18/validate.mjs --write
node --test --test-isolation=none reports/learning-to-learn-gapfill-2026-11-18/validate.test.mjs
node --test reports/learning-to-learn-gapfill-2026-11-18/two-tab.test.mjs
git diff --check
```

All of these pass:

- repository validation and generated-artifact checks
- **576 repository tests**
- the scoped suite: one positive test and six mutation tests
- the real two-tab browser regression

[validate.mjs](validate.mjs) takes its expected counts from scope.json rather than hardcoded literals, and requires zero uncovered Learning to Learn topics. [validation.json](validation.json) reports 18 additions, 1,282 preserved authored records, zero gaps and no assessment passage sharing 12 consecutive tokens with an activity.

The mutation tests cover:

- baseline edits
- missing records
- copied stimuli
- invented recovery edges with performance distractors
- a type/method mismatch
- a META probe presented as a scored answer key

The lexical check cannot prove semantic independence, source entailment or teaching effectiveness.

[browser-smoke.js](browser-smoke.js), appended only to a temporary copy, passes at 1440 × 1200 and 390 × 844. It covers:

- all 18 topic and source renders
- filters, search and the empty state
- previous and next
- versioned, legacy and stale notes, and export
- explicit re-review
- Back and Forward through conflicting filters and source anchors
- page width

Initial layouts were visually inspected at both sizes, and `index.html` matches a fresh rebuild. [two-tab.test.mjs](two-tab.test.mjs) uses two real Chrome tabs in a temporary profile; set `CHROME_BIN` if needed. Browser checks fetch no source links.
