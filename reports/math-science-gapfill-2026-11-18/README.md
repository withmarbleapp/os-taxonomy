# Mathematics and science: missing teaching research

Adds **111 canonical v2 records** on top of `2926da338fc9db583c2bd1d241957e8b0fe1d4ce`: 82 Mathematics and 29 Science. No existing research is revised. Reviewing the existing corpus is deferred until after this PR.

| Subject | Before | Added | After |
| --- | ---: | ---: | ---: |
| Mathematics | 501 / 583 | 82 | 583 / 583 |
| Science | 553 / 582 | 29 | 582 / 582 |

The full collection grows from 1,097 to 1,208 records. Topics, dependencies, curriculum alignments, ages and standards remain unchanged. `scope.json` freezes the exact topic/prerequisite context, input hashes and authored digests of all 1,097 original records. The validator checks preservation and rejects additions outside the 111-topic scope.

## Human review

Open [index.html](index.html) directly in a browser; it is self-contained and works offline. Filter by subject, domain, confidence or full-text search. Review teaching activities, exercise-design guidance, assessment, diagnostic responses and the claims supported by each source together. Expected assessment evidence is collapsed initially. Source links open only when selected.

Review notes stay in browser local storage alongside the authored-record digest captured when the note is first written. **Export review notes** preserves that saved digest and includes the current digest and whether they match. A rebuilt page flags notes for earlier wording; older string-only notes retain an unknown (`null`) digest. Editing these notes does not silently bind them to the current record: after reviewing them, use **Confirm notes apply to this version** to explicitly update the binding. Browser storage can be unavailable or cleared; export notes to retain/share them. The page does not send notes anywhere. Topic and source-anchor history restores the displayed topic and notes with browser Back/Forward, clearing filters only when they would exclude the restored topic. Rebuild it from the canonical collection with:

```sh
node reports/math-science-gapfill-2026-11-18/build-review-page.mjs
```

## Authoring and evidence boundary

The work follows the assessment-by-topic-type and source-checking approach recovered from the former `tutor-prototype` teaching-research agent, adapted to canonical authored v2 records. In particular:

- Teaching, practice and assessment use distinct stimuli. Repeated examples remain where they deliberately revisit a representation or explanation; they are not used as independent assessment evidence.
- Every addition gives guidance for generating further exercises: support to fade, demands to vary, boundary cases and limits. These are proposed task progressions, not empirically calibrated difficulty levels or age ladders.
- Procedural topics use observed performance; representational topics include interpreting and constructing; conceptual topics ask for an answer and reason; META topics use open discussion exemplars. Performance/developmental errors have no multiple-choice distractor. Recovery references are actual prerequisite edges.
- Diagnostics give an observable tell and a next teaching move. A lapse, access need or unfamiliar representation is not automatically a stable misconception. Records distinguish documented error families from authored performance probes and tentative diagnostic adaptations.
- Practical science uses actual observations without manufactured results. Fictional numerical examples are identified. Tool tasks require current local activity-specific guidance; general research records do not authorise equipment use. Investigation on Country requires actual local advice and applicable permissions.

**77 additions have medium confidence and 34 have low confidence. None has high confidence.** Some topics have direct teaching/error-family guidance; others have broader curricular, professional or procedural support and authored diagnostic proposals. Low confidence is not a claim that a source supports a child-misconception prevalence estimate. Read each record’s sources and review notes for the specific limits.

Sixteen tentative reasoning-error labels were explicitly classified as performance checks after the evidence pass, with no entry in `commonMisconceptions`. Their sources support the target requirements but do not establish those responses as documented learner misconceptions.

Sources were fetched and their stated claims checked. [source-checks.json](source-checks.json) records the shared source registry, checked sections and exclusions; the three pilot records also retain their own detailed citations in the canonical data. Sources that could not be fetched were not promoted to verified evidence. Some sources concern older learners; age adaptations are explicitly proposals. The `verified` flag applies to the individual citation claim, **not** every sentence on the page, the proposed task’s effectiveness or all diagnostic wording.

No physical apparatus trial, learner evaluation or independent content review was performed. The old agent’s later independent critic pipeline has not been reproduced; this PR does not claim those review gates were passed. These limits are carried into the canonical records and the HTML view.

## Validation

```sh
node scripts/validate.mjs
node scripts/generate-alignment-artifacts.mjs
node --test scripts/*.test.mjs
node reports/math-science-gapfill-2026-11-18/validate.mjs
node --test --test-isolation=none reports/math-science-gapfill-2026-11-18/validate.test.mjs
git diff --check
```

Results: repository validation and generated-artifact check pass; **576 repository tests and 5 scoped mutation tests pass**. [validation.json](validation.json) records the scope result: 111 additions, 1,097 preserved records, zero remaining maths/science gaps and no shared assessment/teaching passage of 12 or more tokens. Mutation tests check that the validator detects baseline edits, missing additions, copied stimuli, invented recovery edges and prohibited distractors. The lexical overlap check cannot establish semantic transfer or source entailment.

The historical Ontario Science84 test now checks its saved historical guide inventory consistently across report entries while requiring saved guides to remain available. Its historical absence list remains untouched; a later addition no longer makes the dated report fail merely because a former gap has been filled.

The HTML was rendered in headless Chrome at 1440 × 1200 and 390 × 844 and visually inspected. [browser-smoke.js](browser-smoke.js), appended to a temporary copy of the page, exercises all 111 topic renders, source rendering, subject/confidence/search/empty filters, previous/next navigation, local note persistence and export with record digests. Regression checks cover loading notes against changed digests, legacy notes, editing without silently changing the saved version, explicit re-review confirmation, and Back/Forward restoring topic/notes through conflicting filters and source anchors. No source links are fetched by these checks. Run the harness only in a fresh browser profile: it temporarily writes test notes and restores prior storage in a `finally` block.

The full tests need permission to launch subprocesses in restricted environments. Running them inside this session’s sandbox produced `EPERM` failures; the complete suite passed when that restriction was removed. This did not require changing application logic or weakening the repository’s checks.
