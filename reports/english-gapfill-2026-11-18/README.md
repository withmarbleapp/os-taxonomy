# English: missing teaching research

Adds **339 canonical v2 teaching-research records** on top of `e6e89715321d3b81a6448f7314c5b963cd4036ae` (main after the merged Personal & Social Development gap fill, #169; rebased from the original Geography base `483796b`). English coverage grows from **0 / 339 to 339 / 339**; the whole collection grows from 1,573 to 1,912 records, so every topic now has research (1,912 / 1,912; `coverage.withoutResearch` is 0). All 1,573 existing authored records retain their digests, and the 339 English records are byte-for-byte identical in canonical form to those reviewed before the rebase. Topics, dependencies, curriculum alignments, ages and standards are unchanged. Reviewing existing research remains a separate task.

| Domain | Added | Medium | Low |
| --- | ---: | ---: | ---: |
| Grammar & Punctuation | 84 | 77 | 7 |
| Handwriting & Transcription | 7 | 6 | 1 |
| Spelling & Word Study | 24 | 24 | 0 |
| Reading Comprehension | 93 | 89 | 4 |
| English Thinking | 7 | 7 | 0 |
| Vocabulary | 23 | 22 | 1 |
| Phonics & Word Reading | 29 | 28 | 1 |
| Speaking & Listening | 29 | 23 | 6 |
| Writing Composition | 43 | 43 | 0 |

[scope.json](scope.json) freezes every in-scope topic with its complete descriptor, evidence, assessment prompt, prerequisites and dependents, the input file hashes, baseline coverage and the authored digests of all 1,573 baseline records. It is produced by [capture-scope.mjs](capture-scope.mjs), which reads the baseline from git objects at a given ref (default: the merge base with `origin/main`), never from the working tree, so it can be re-run honestly after a rebase. Only `data/teaching-research.json`, the generated `data/manifest.json` and this folder change.

## Human review

Open [index.html](index.html) directly in a browser. It is self-contained and works offline. Search or filter the 339 additions by domain and confidence, and read the teaching moves, activities, exercise-generation guidance, assessment, diagnostics and source claims/limits together. Expected assessment evidence is collapsed initially.

Notes stay in browser local storage under an English-specific key, separate from earlier subjects. The page keeps the merged two-tab and stale-note behaviour: each save is a uniquely keyed revision with its parent, storage events update other tabs, divergent same-topic edits stay visible and exportable until explicitly resolved, superseded revisions are compacted, notes are bound to the record digest they were written against, and **Confirm notes apply to this version** is the only way to rebind a stale or unversioned note. Export includes original and current digests and conflict status. No notes are sent anywhere.

Rebuild from canonical data:

```sh
node reports/english-gapfill-2026-11-18/build-review-page.mjs
```

## How the records were produced

The 339 topics were split by domain between three authors working from one shared brief: grammar, punctuation, handwriting and spelling (115); reading comprehension, English thinking and vocabulary (123); and phonics, speaking and listening, and writing composition (101). Each part was checked with the same per-record checks as [validate.mjs](validate.mjs) before [integrate.mjs](integrate.mjs) appended all 339 records after the existing ones, in frozen-scope order, and rebuilt the collection with `buildCanonicalResearchCollection` so coverage is derived. Structured IDs are random UUID-derived `prefix_` + 32-hex values, unique across the fill. The per-part staging files are working inputs and are not committed; the integrated records in `data/teaching-research.json` are the source of truth, which is why `integrate.mjs --from <ref>` can rebuild from any committed branch head. A second reading pass over all 339 records then checked every answer key, terminology and citation fit before integration. It corrected, among others, a near-rhyme keyed as a rhyme, animal verbs mislabelled as personification, a real dictionary word (whiffle) presented as invented, an owl definition that did not distinguish owls, an IES TREE expansion, accent-dependent and exception-word phonics items, a historical-spelling example (gnome), ambiguous word-count and pronoun items, a tense key that contradicted its own diagnostic, assessment items reused from activities, and several citations that did not support the specific claim (replaced with fetched sources such as CCSS RI.3.6 and RF.K.1, ACARA AC9E1LY05 and AC9E3LA07, and the national-curriculum statements on evaluating writing, letter names and organisational devices). Thin Writing Composition diagnostics were rewritten with concrete tells and next moves.

For a rebase, take `main`'s `data/teaching-research.json`, run `node reports/english-gapfill-2026-11-18/capture-scope.mjs` on the new base, then `node reports/english-gapfill-2026-11-18/integrate.mjs --from <previous branch head>` to re-append these records, and re-run every check.

## Authoring and evidence boundary

- Every record has at least three topic-specific activities with learner actions, intended insight, feedback, rationale and source links, plus an **Exercise design** constraint naming support to fade, demands to vary, transfer and boundary cases. These are proposed progressions, not calibrated difficulty scales or new age or mastery thresholds.
- Assessment methods follow topic type (PROCEDURAL → observed performance task, CONCEPTUAL → answer + reason, LANGUAGE → use in context, REPRESENTATIONAL → interpret/translate, META → open probe whose exemplar is explicitly not an answer key). Assessment stimuli are fresh: no assessment prompt shares 12 consecutive tokens with any activity's learner actions.
- All 678 diagnostics are labelled as authored observable performance/reasoning checks unless a fetched source documents the error; each has an observable tell and a concrete next move, none supplies a multiple-choice distractor, and every prerequisite recovery uses an actual dependency edge.
- **English-specific care.** Grammar terminology follows the DfE English Appendix 2 and glossary, and records say where other curricula differ: the DfE glossary treats English tense as present/past with no future-tense verb form, calls the progressive a form (also "continuous"), analyses possessives such as *my* as determiners, does not list interjections or gerunds, and suggests "single-clause/multi-clause" for simple/compound/complex; CCSS and many grammars use other labels, and both are accepted. Spelling rules state the exceptions the DfE Appendix 1 lists (for example *being*, *skiing/taxiing*, x never doubled, *argument*, *publicly*, *anxious*, *protein/caffeine/seize*) and accent-dependent exceptions are kept out of answer keys. Phonics records follow the DfE Reading framework's slash-letter convention (/sh/) and say that the school's validated SSP programme sets GPC order, child-facing terms and exception-word lists, so programmes should not be mixed. Where usage genuinely varies (serial comma, comma before co-ordinating conjunctions, collective-noun agreement, singular *they*, title capitalisation, bullet-point style, -ise/-ize, British/American *practice/practise*), answer keys accept the variants or avoid the disputed item.
- Standard English and dialect records treat dialects as valid, rule-governed varieties and Standard English as a choice for audience and purpose, using invented examples rather than learners' or families' speech. Speaking and listening records never score accent, dysfluency, eye contact or gesture conventions and accept AAC, signed or partner-read responses. Handwriting records follow the school scheme, accept functional grips and route persistent difficulty or discomfort to the SENCo under school procedures. No task asks children to disclose private family, health or address information.

### Confidence

**319 additions have medium confidence and 20 have low confidence; none has high confidence.** Medium means fetched sources support the teaching approach and conventions; it does not mean the exact activities were tested.

Low-confidence records and why:

- *Capital letters in titles*, *Punctuating Titles of Works*, *Bullet Point Punctuation*, *Colons after labels*: curriculum statements require the convention but do not fix one; title-case, title-marking, bullet and salutation conventions differ between style guides and countries, so the school style needs confirming.
- *Capitals for proper adjectives*: aligned only to Ontario codes (not fetched); no fetched source states the convention, and the DfE glossary analyses at least one such word as a noun.
- *Quoted and reported speech*, *Apostrophes for shared ownership*: no fetched source sets out reported-speech backshift or joint/separate possession; the records rely on standard grammar knowledge.
- *Beginning touch typing*: the IES guide notes that typing-intervention studies were limited.
- *How characters and places connect*, *Stories from other places, times*, *How context shapes responses*: centred on First Nations Australian literature and Country; no First Nations educator or community review has informed them, and assessment stimuli deliberately avoid authoring First Nations content.
- *Themes Across Cultures and Traditions*: claims about cultural context in traditional stories need local cultural authority; versions of tales vary.
- *Dialects & Registers*: dialect examples need review by speakers of the varieties.
- *R-Controlled Vowel Sounds*: the topic wording reflects rhotic-accent instruction; programmes in non-rhotic regions teach these as vowel digraphs, and phoneme labels vary.
- *Listening and responding*, *Language for different roles*, *Asking, offering and requesting*, *Language that builds relationships*, *Gestures across cultures*, *Speaking Formally and Giving Presentations*: politeness, eye-contact, gesture and formality norms vary across cultures, families and individuals (including autistic and Deaf learners), and practitioner review of these adaptations is missing.

### Sources

[source-checks.json](source-checks.json) records **164 checked source entries across 53 URLs**, each with the claim checked, the sections read and exclusions. The main sources are the DfE national curriculum for English (programmes of study, Appendix 1 spelling, Appendix 2 grammar and the glossary), the DfE Reading framework (2023), the EEF Improving Literacy in Key Stage 1 and Key Stage 2 guidance reports, IES/WWC practice guides on writing, foundational reading, comprehension and adolescent literacy, the Common Core ELA standards, the ACARA v9 English content download, Reading Australia curriculum summaries and oracy, EAL and stammering guidance. Verification applies to each specific citation claim, not to every sentence on a page or to the effectiveness of the activities. Some pages (Reading Rockets; the ACARA website; in one author's environment the EEF site) refused automated fetches and are not cited from those fetches. Curriculum year placements are cited as context, not adopted as universal age thresholds.

These are teaching-research records, not finished lesson packs. Teachers still supply texts, scheme-specific handwriting models, programme-specific phonics materials and locally appropriate examples.

**No learner trial or independent content review has occurred.** The author source/content pass, a second reading pass and the automated checks do not replace practitioner review, First Nations and community review where noted, or learner trials.

## Validation

```sh
npm run alignments:generate
npm run validate
npm run alignments:generated-check
npm test
node reports/english-gapfill-2026-11-18/validate.mjs --write
node --test --test-isolation=none reports/english-gapfill-2026-11-18/validate.test.mjs
node --test reports/english-gapfill-2026-11-18/two-tab.test.mjs
git diff --check
```

[validation.json](validation.json) reports 339 additions, 1,573 preserved records, zero English gaps and no assessment/activity passage sharing 12 consecutive tokens. validate.mjs takes its expected sizes from scope.json rather than hardcoding them, and also rejects high confidence and non-standard attribution. The six mutation tests in [validate.test.mjs](validate.test.mjs) cover baseline edits, missing records, copied stimuli, invented recovery edges, prohibited distractors and a type/method mismatch. The lexical check cannot prove semantic independence, source entailment or teaching effectiveness.

[browser-smoke.js](browser-smoke.js), appended only to a temporary copy, checks all 339 topic renders, filters, search and empty state, previous/next, versioned/legacy/stale notes and export, explicit re-review, Back/Forward through conflicting filters and source anchors, and page width at 1440 × 1200 and 390 × 844. It renders the 339 records without changing `location.hash`, because Chrome throttles more than about 200 rapid same-document navigations. [two-tab.test.mjs](two-tab.test.mjs) runs two real Chrome tabs in a temporary profile to test concurrent edits, conflict display/export/resolution, digest retention and bounded storage. Browser checks fetch no source links.
