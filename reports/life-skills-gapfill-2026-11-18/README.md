# Life Skills: missing teaching research

Adds **46 canonical v2 teaching-research records** on top of `b5f0d0531216afd4590c560864c9bb7786bb7b8c`, the merged Learning to Learn contribution (#168). The branch was first authored on `483796b` (#167) and rebased; scope.json was re-captured from the new main, and the 46 records' canonical digests are unchanged by the rebase. Life Skills coverage grows from **3 / 49 to 49 / 49**; the whole collection grows from 1,300 to 1,346 records. All 1,300 existing authored records retain their digests, including the three existing Life Skills records: Economic sectors and activities, Food allergies and sensitivities, and Prescription and non-prescription medicines. Reviewing existing research remains a separate task.

| Domain | Added | Medium | Low |
| --- | ---: | ---: | ---: |
| Money & Finance | 23 | 21 | 2 |
| Entrepreneurship | 18 | 15 | 3 |
| Food & Cooking | 5 | 3 | 2 |

Seven additions are PROCEDURAL (`performance_task`) and 39 are CONCEPTUAL (`two_tier`). Topics, dependencies, curriculum alignments, ages and standards remain unchanged. [scope.json](scope.json) freezes the selected topic, evidence, prerequisite and dependent contexts, source-file hashes, baseline coverage and authored-record digests. Only the research collection and generated manifest change among pre-existing files.

[capture-scope.mjs](capture-scope.mjs) regenerates scope.json from a base ref (default `origin/main`) through `git show`. It reads that ref's data files, not the working tree, so after a rebase it refreshes the baseline honestly even though the Life Skills records are already present:

```sh
node reports/life-skills-gapfill-2026-11-18/capture-scope.mjs origin/main
```

## Human review

Open [index.html](index.html) directly in a browser. The page is self-contained and works offline. You can search or filter the 46 additions by domain and confidence. Notes use a separate Life Skills store (`marble-teaching-research-life-skills-2026-11-18`) and keep the merged two-tab and stale-note behaviour:

- Uniquely keyed revisions.
- Cross-tab updates.
- Conflicts that stay visible until resolved.
- Explicit re-review confirmation.
- Digest-bound export.
- Back/Forward restoration of topic and source anchors.

Nothing is sent anywhere.

```sh
node reports/life-skills-gapfill-2026-11-18/build-review-page.mjs
```

## Authoring and evidence boundary

- Each topic has three activities with learner actions, intended insight, feedback, rationale and source links, plus an `Exercise design:` constraint (support to fade, demands to vary, transfer and boundary cases). These are proposals, not calibrated difficulty scales.
- Main sources:
  - **Money:** the OECD PISA 2022 financial literacy framework, Young Enterprise's 3–11 framework page, Bank of England explainers, the Council for Economic Education standards, Financial Consumer Agency of Canada card guidance, the UK NCSC scam guidance and the CAP children's advertising guidance.
  - **Entrepreneurship:** Fairtrade, NCVO and OSCR descriptions, plus a twice-checked Mikaila Ulmer story.
  - **Food:** Food Standards Agency cleaning, chilling and allergen guidance, Food – a fact of life cooking, hygiene and tasting guidance, a DfE Teach Food Technology cutting note, a Kitchen Garden Project knife handout, the NHS Eatwell Guide and one research abstract on cooking and vitamins.
- **Money arithmetic:** every amount is invented, in local currency units or the PISA-style fictional zed. No dated real price, rate or fee is presented as current. Cash amounts avoid rounding (multiples of five smallest units), and each answer key's arithmetic was checked by hand. Interest uses one stated period of simple interest on an unchanged balance, and compound interest is excluded. Several records note that some families avoid interest for religious reasons, as PISA itself notes.
- **Safeguarding (money):** no task asks about family income, pocket money, debts, jobs at home or what a household can afford. Fictional characters are used throughout, and learners' own examples are optional. Scam tasks route to a trusted adult, and children are not blamed or asked to investigate.
- **Entrepreneurship:** no real money is raised from or charged to children or families, and nothing is sold, except through the school's own approved enterprise process. Classroom trading uses play money. Promotion uses school-approved channels only.
- **Food:** every food record requires an allergy, intolerance and religious, cultural or medical dietary check through the school's process before any handling or tasting. No child is pressured to taste, and alternatives are offered without singling anyone out. Knives and heat need adult supervision at school-set ratios, and heating is adult-led. Learners do not handle raw meat, and adults pre-cut awkward items.
- **Diagnostics:** all 82 are labelled **authored observable performance/reasoning checks**, each with an evidence basis, an observable tell and a next move. None claims a documented misconception, every distractor is null, and every prerequisite recovery uses an actual edge.
- Topic wording that overstates is qualified rather than changed:
  - "harder or more skilled work often pays more" notes that pay depends on several factors and does not measure importance;
  - the barter-history evidence item is treated as an illustration;
  - the "famous failure-to-success stories" item avoids unverified anecdotes;
  - "one cooking method is healthier" is qualified by the vitamins abstract.

**39 additions have medium confidence; seven have low confidence; none has high confidence.** The low-confidence records and why:

- **What Money Is:** barter-first history is not settled by the fetched sources, so swapping is used only as an illustration.
- **Types of taxes and who collects them:** which government collects which tax is local, and the topic's Canadian examples were not checked against a Canadian official source. The UK worked example is checked.
- **Learning from Failure:** common "famous failure" stories were not verified, and no evidence on teaching resilience through such stories was fetched.
- **Real Entrepreneurs:** only Mikaila Ulmer was checked against two sources. Moziah Bridges and Cory Nieves, named in the topic, need teacher-checked sources, and the record warns about survivorship and dated figures.
- **Ethics in Business:** value-laden, and the sources are advocacy, framework and economics material rather than tested primary ethics teaching.
- **Cutting food with bridge and claw grips:** safety-critical and dependent on local supervision policy. The handouts differ on detail, and practitioner review is needed.
- **Food characteristics and preparation:** the nutrient evidence is one abstract, and the food-science resources target ages 11–14. The mechanism by which lemon juice slows browning was not sourced, so the probe is observational.

### Sources

[source-checks.json](source-checks.json) records **42 checked source entries across 32 URLs**, with the sections used and exclusions. MoneyHelper/MaPS, ASIC Moneysmart, the OECD web chapter, Get Safe Online and the CFPB returned HTTP 403, and several guessed URLs returned 404. None of these were promoted to verified sources. The PISA framework was read from Utrecht University's copy of the OECD PDF. Two FCAC pages were read through WebFetch after curl timed out. The vitamins abstract was read via NCBI E-utilities. The web-search budget ran out before a browning source was found, and the README and record say so.

Verification applies to the specific citation claim, not to every sentence of a page or to activity efficacy. US-authored (CEE), Canadian (FCAC), UK (FSA, GOV.UK, NCSC, CAP) and Australian (Royal Australian Mint) sources are worked examples; teachers substitute current local information.

No learner trial, food-practical trial or independent content review has occurred. The old agent's independent critic pipeline has not been run.

## Validation

```sh
npm run alignments:generate
npm run validate
npm run alignments:generated-check
npm test
node reports/life-skills-gapfill-2026-11-18/validate.mjs --write
node --test --test-isolation=none reports/life-skills-gapfill-2026-11-18/validate.test.mjs
node --test reports/life-skills-gapfill-2026-11-18/two-tab.test.mjs
git diff --check
```

All of these pass:

- repository validation and generated-artifact checks
- **576 repository tests**
- the scoped suite: one positive test and six mutation tests
- the real two-tab Chrome regression

[validate.mjs](validate.mjs) takes its expected counts from scope.json and requires zero uncovered Life Skills topics. [validation.json](validation.json) reports 46 additions, 1,300 preserved records, zero gaps and no assessment passage sharing 12 consecutive tokens with an activity.

The mutation tests cover:

- baseline edits
- missing records
- copied stimuli
- invented recovery edges with performance distractors
- a type/method mismatch
- a predict–observe–explain task on a procedural topic

[browser-smoke.js](browser-smoke.js) passes at 1440 × 1200 and 390 × 844. It covers:

- all 46 topic and source renders
- domain, confidence and search filters
- navigation
- notes and export
- re-review
- Back/Forward
- page width

The initial layout was inspected visually, and `index.html` matches a fresh rebuild.
