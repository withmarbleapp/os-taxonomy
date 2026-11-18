# Computing: missing teaching research

Adds **52 canonical v2 teaching-research records** on top of `59dc370e2a58d872e9a756311066a112bd8c1cb4` (the merged maths/science work). Computing coverage grows from **0 / 52 to 52 / 52**, and the full collection from 1,208 to 1,260 records. All 1,208 existing authored records retain their digests. Topics, dependencies, curriculum alignments, ages and standards remain unchanged. Reviewing the existing research corpus remains a separate task.

| Domain | Additions |
| --- | ---: |
| Algorithms & Programming | 9 |
| Artificial Intelligence | 18 |
| Data Representation | 3 |
| Designing Digital Solutions | 5 |
| Digital Systems | 6 |
| Digital Tools & Collaboration | 3 |
| Privacy & Security | 8 |

[scope.json](scope.json) freezes every selected topic’s complete descriptor, evidence and prerequisite/dependent context, input file hashes, baseline coverage and the authored digests of the original records. The only changed existing files are the canonical research collection and its generated manifest.

## Human review

Open [index.html](index.html) directly in a browser. It is self-contained and works offline. Search or filter by domain and confidence to inspect the teaching, exercise-generation guidance, assessment, diagnostics and precise source claims together. Expected answers are collapsed initially. External sources open only when selected.

Notes stay in browser local storage and are bound to the record digest present when first written. Export them to retain/share them. Rebuilt pages warn about earlier-version or unversioned notes; editing does not silently update the saved digest. **Confirm notes apply to this version** explicitly rebinds reviewed notes. Export includes original/current digests and whether they match. Back/Forward restores the topic and its notes, including source anchors, clearing filters if needed to reveal the restored topic. This page uses a separate notes store from the maths/science review. Every edit is stored under a unique revision key with its parent revision, so two tabs cannot overwrite one shared snapshot. Storage events update other tabs; export rereads saved revisions. Divergent edits to the same topic (including a clear versus an edit) remain visible and are all exported until the reviewer explicitly chooses a saved version or combines the text. Resolving a conflict preserves the chosen note’s original record binding; confirming the current research version remains a separate action. Existing versioned and unversioned notes are read from the previous format without rewriting them. Superseded saved revisions are compacted; concurrent versions are retained until explicitly resolved, avoiding a full saved copy for every keystroke. If storage fails, the page warns and keeps the unsaved version in memory for export while retaining the last persisted version for reload.

Rebuild after editing canonical research:

```sh
node reports/computing-gapfill-2026-11-18/build-review-page.mjs
```

## Authoring and evidence limits

This follows the source-checking and topic-type assessment approach recovered from the former `tutor-prototype` agent:

- Three activities per topic, with feedback and source links; topic-specific teacher moves and representations.
- Guidance for generating further exercises, varying support, reasoning demands and boundary cases. These are proposed progressions, not calibrated difficulty or age scales.
- Fresh assessment stimuli. Repeating a core operation is sometimes necessary, but worked cases are not treated as independent assessment evidence. The author’s content pass replaced near-duplicate instructions, concurrency, environment and footprint cases. Published real-case cards may be referenced again alongside a fresh transfer task; that source reading is not an independent news-recall test.
- Conceptual topics ask for an answer and reason; procedural topics require observed performance. A verbal explanation or paper simulation does not certify actual program construction, model training or account operations. Unavailable practical steps remain unassessed; access support is recorded separately.
- Every diagnostic identifies an observable tell and a next teaching move. Six diagnostics adapt documented error families; 46 are authored performance checks, with no invented documented-misconception claim or multiple-choice distractor. The robot-only AI diagnostic is explicitly a performance check: the Finnish study supports anthropomorphism, not that exact exclusive belief.
- Privacy tasks use fictional records and approved training contexts; actual account operations require the authorised adult and existing local procedures. No real secret or pupil record is copied into the assessment evidence. Managed single sign-on is distinguished from independently reusing a password.

**46 records have medium confidence; six have low confidence; none has high confidence.** The low-confidence topics are Smart Versus Not-Smart Devices, Patterns and Classification, Humans Versus Machines, AI and the Future of Work, The Future of AI, and Community impact of digital solutions. Their notes identify ambiguous descriptors, unsupported universal comparisons/predictions or broader professional guidance requiring a primary-school adaptation. All activities remain proposals even where confidence is medium.

The research qualifies existing claims rather than silently endorsing them: automatic response does not prove AI; some AI uses fixed rules/search; training is distinct from deployed use; more data need not improve performance; all humans do not universally learn every pattern from fewer examples; NIST’s historical demographic findings did not establish their causes; apparent empathy does not establish lived feeling; every AI model does not have the same environmental footprint; and a short case pack cannot prove a proposed use exists nowhere today. These qualifications do not change topic semantics or claim that every original evidence statement has been satisfied literally. Those descriptor issues are identified for later claim review.

[source-checks.json](source-checks.json) records 36 source entries, checked sections and exclusions. They include primary education/research, technical documentation and dated institutional evidence. Each citation’s `verified` flag applies only to its stated checked claim, not every sentence on the source page or the effectiveness of an authored exercise. Older-learner and professional sources are identified as adaptations. Unfetched lesson downloads or inaccessible source pages were not promoted to verified evidence. The FTC example is described as a dated complaint/allegation, without an assertion about present legal status.

No learner trial, apparatus trial or independent content review was performed. The old agent’s independent critic pipeline has not been run. The author’s source/content pass, schema checks and browser checks are not substitutes for those review gates.

## Validation

```sh
npm run alignments:generate
npm run validate
npm run alignments:generated-check
npm test
node reports/computing-gapfill-2026-11-18/validate.mjs --write
node --test --test-isolation=none reports/computing-gapfill-2026-11-18/validate.test.mjs
node --test reports/computing-gapfill-2026-11-18/two-tab.test.mjs
git diff --check
```

Repository validation, generated-artifact checks, **576 repository tests and six scoped mutation tests pass**. [validation.json](validation.json) records 52 additions, 1,208 preserved authored records, no remaining Computing gaps and no assessment/teaching passage sharing 12 consecutive tokens. Mutation tests verify detection of baseline edits, missing additions, copied stimuli, invented prerequisite recovery, prohibited distractors and a topic-type/method mismatch. Lexical overlap checks do not establish semantic independence, source entailment or effectiveness.

The offline page was rendered and visually inspected in headless Chrome at 1440 × 1200 and 390 × 844. [browser-smoke.js](browser-smoke.js), appended to a temporary copy, passes at both widths: all 52 topic renders, source rendering, subject/domain/confidence/search/empty filters, previous/next, versioned/legacy/stale note persistence and export, explicit re-review, and Back/Forward through conflicting filters and source anchors. It fetches no source links. Run it only in a fresh browser profile; it temporarily writes test notes and restores prior storage in `finally`.

[two-tab.test.mjs](two-tab.test.mjs) launches two real Chrome tabs against the same offline file using a temporary profile. It checks preservation of different-topic notes through edits/reload/export, storage-event updates, same-parent concurrent edits and clears, conflict visibility/export, explicit selection/combination, original digest preservation, bounded storage during ordinary typing and narrow-screen conflict controls. It uses Node’s built-in WebSocket/CDP connection, no external packages or source fetches. Set `CHROME_BIN` if Chrome is not at `/usr/bin/google-chrome`.

The full repository tests and headless Chrome were run with subprocess/browser execution enabled outside the restrictive sandbox. This did not change application logic or weaken checks.
