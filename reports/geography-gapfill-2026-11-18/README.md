# Geography: missing teaching research

Adds **22 canonical v2 teaching-research records** on top of `ed268da6ffccf79e719e1a5e69586a3ae2602642`, the merged Computing contribution and two-tab notes fix. Geography coverage grows from **12 / 34 to 34 / 34**; the whole collection grows from 1,260 to 1,282 records. All 1,260 existing authored records, including the 12 Geography records, retain their digests. Reviewing existing research remains a separate task.

| Domain | Added |
| --- | ---: |
| Maps & Spatial Skills | 5 |
| Places & Environments | 17 |

Topics, dependencies, curriculum alignments, ages and standards remain unchanged. [scope.json](scope.json) freezes the complete selected topic/evidence/prerequisite/dependent contexts, source-file hashes, baseline coverage and authored-record digests. Only the research collection and generated manifest change among pre-existing files.

## Human review

Open [index.html](index.html) directly in a browser. The page is self-contained and works offline. Search/filter the 22 additions by domain/confidence and inspect teaching moves, activities, exercise-generation guidance, assessment, diagnostics and the source claims/limits together. Expected assessment evidence is collapsed initially. The coverage header includes the 12 existing records, while the review itself shows only the additions.

Notes stay in local browser storage; export them to retain/share them. The Geography page uses a separate store from earlier subjects and retains the merged two-tab fix: uniquely keyed revisions preserve concurrent edits, storage events update other tabs, conflicting versions remain visible/exportable until explicitly resolved, and superseded revisions are compacted. Selecting/combining versions retains the reviewed record binding. Explicit **Confirm notes apply to this version** updates a stale/unknown binding after re-review. Export includes the original/current digests and conflict status. Back/Forward restores the owning topic/notes, including source anchors, clearing conflicting filters when needed. No notes are sent anywhere.

Rebuild from canonical data:

```sh
node reports/geography-gapfill-2026-11-18/build-review-page.mjs
```

## Authoring and evidence boundary

The research follows the accepted approach recovered from the former `tutor-prototype` agent, adapted to canonical v2:

- Three activities per topic, specific teacher moves and representations, feedback and rationale/source links.
- Guidance for creating further exercises: support to fade, conceptual demands to vary, transfer and boundary cases. These are proposed progressions, not calibrated difficulty scales or new age/mastery thresholds.
- Fresh assessment stimuli and explicit limits on reuse. Map operations may recur, but the maps/routes/locations or evidence questions change. The hazard record reserves the dated Black Summer case for assessment. Fixed local identity facts require accurate reuse; assessment adds a new context, explanation and an evidence/authority boundary rather than pretending a different local name is needed.
- Four procedural records require observed locating/routing, map drawing, cell-grid construction or distance-tool use. Four representational records require interpretation and construction. Fourteen conceptual records ask for an answer and reason, with additional drawing, source use or accessible participation where the topic evidence requires it. Access support is recorded separately.
- All 22 diagnostics are explicitly **authored observable performance/reasoning checks**, not claims that these exact sentences or their prevalence were documented in a child study. Each includes an observable tell and next teaching move; none supplies a misconception distractor or populates `commonMisconceptions` without that evidence. Any prerequisite recovery uses an actual edge.
- Comparisons use located, dated source evidence and distinguish observation, plausible cause and value/perspective. One photo does not represent a country; a regional map does not determine a nearest-boundary distance; a letter-number cell address is not a Cartesian intersection; a risk-reduction measure is not a safety guarantee.

**17 additions have medium confidence; five have low confidence; none has high confidence.** Low-confidence records are Our school's Country, First Nations and local Country, First Nations Countries of Australia, Caring for Country, and Managing natural hazards. Public guidance supports important distinctions, but local cultural authority and a disaster-education practitioner/learner review are not established by the author’s source checks. Medium confidence also does not mean the exact proposed activities were tested.

### Country/Place and local resources

First Nations content uses named sources and people/places, including AIATSIS guidance, Tiwi Traditional Owner/CSIRO collaboration, TSRA ranger/community accounts and Gunditjmara/Budj Bim. The contribution does **not** identify or verify any school’s local Traditional Owners, obtain local-language or calendar permissions, reproduce the AIATSIS map/calendars/artwork, or invent cultural stories and practices. The school must confirm local names, pronunciation, cultural authority and permitted materials through its existing relationships and appropriate local organisations. Restricted or unconfirmed details are not guessed; missing local performance evidence remains unassessed.

The records preserve continuing Country relationships and distinguish cultural fire from generic hazard reduction. Acknowledgement and Welcome follow different authority/protocols. An indicative national map supplies general areas rather than exact local, legal or fixed boundaries. Classroom tasks do not authorise cultural reenactment, burning or harvesting. A First Nations learner is not asked to speak for everyone or disclose private family knowledge.

### Sources and practical use

[source-checks.json](source-checks.json) records **39 checked source entries**, the sections used and exclusions. Primary geography guidance comes principally from RGS, Paula Owens/Ordnance Survey and NSW Field of Mars EEC, with separately attributed technical, community and institutional evidence. The Geographical Association’s distant-place guidance has a secondary-teacher context; primary adaptations are identified as proposals. Source verification applies to the precise citation claim, not every sentence on a page or an activity’s efficacy.

An inaccessible MODIS caption was replaced by a fetched NASA Earth Observatory account. The oversized Home Affairs PDF and blocked UN map were not promoted to verified sources; the readable official capital-city transcript and a fetched regional worksheet were used instead. The transcript’s shorthand about two mainland territories and dated largest-city statement are not adopted as exhaustive/current claims. Jervis Bay is not an external territory. Climate sources retain station/variable/unit/period cautions; a short station summary is not automatically a matched 30-year normal.

These are teaching-research records, not finished lesson packs. Teachers still supply current suitable maps, distinct image/data packs, approved local cultural material and source-specific answer keys. Fictional examples are identified; actual fieldwork, account of a place or measurement is not claimed if it did not occur. Existing school supervision/access arrangements apply. The hazard proposal is conceptual and non-emergency; no fire/floodwater activity or real evacuation/safety decision is delegated to a child.

No learner trial, field apparatus trial or independent content review has occurred. The old agent’s independent critic pipeline has not been run. The author’s source/content pass and automated checks do not replace those review gates.

## Validation

```sh
npm run alignments:generate
npm run validate
npm run alignments:generated-check
npm test
node reports/geography-gapfill-2026-11-18/validate.mjs --write
node --test --test-isolation=none reports/geography-gapfill-2026-11-18/validate.test.mjs
node --test reports/geography-gapfill-2026-11-18/two-tab.test.mjs
git diff --check
```

Repository validation, generated-artifact checks, **576 repository tests, six scoped mutation tests and the real two-tab browser regression pass**. [validation.json](validation.json) reports 22 additions, 1,260 preserved authored records, zero Geography gaps and no teaching/assessment passage sharing 12 consecutive tokens. Mutations test baseline edits, missing records, copied stimuli, invented recovery edges, prohibited distractors and a type/method mismatch. The lexical check cannot prove semantic independence, source entailment or teaching effectiveness.

[browser-smoke.js](browser-smoke.js), appended only to a temporary copy, passes at 1440 × 1200 and 390 × 844: all 22 topic/source renders, filters/search/empty state, previous/next, versioned/legacy/stale notes and export, explicit re-review, and Back/Forward through conflicting filters/source anchors. Initial layouts were visually inspected. [two-tab.test.mjs](two-tab.test.mjs) uses two real Chrome tabs in a temporary profile to test different-topic preservation, concurrent edits/clears, conflict display/export/resolution, digest retention, bounded storage and mobile controls. It uses Node’s built-in WebSocket/CDP with no additional packages; set `CHROME_BIN` if needed. Browser checks fetch no source links. Run smoke tests in a fresh profile; the harness temporarily writes notes and restores prior storage.

Full tests and headless Chrome were run with subprocess/browser execution enabled outside the restrictive sandbox; no application logic or check was weakened.
