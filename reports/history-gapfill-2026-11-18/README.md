# History: missing teaching research

Adds **110 canonical v2 teaching-research records** on top of `b79411ffbcc8fac48082a9c0b9c12377fdbc3f68` (main after the merged Learning to Learn #168 and Life Skills #171 gap fills; originally authored on `483796b`, the Geography merge, and rebased with the baseline recaptured by `capture-scope.mjs`). History coverage grows from **8 / 118 to 118 / 118**; the whole collection grows from 1,346 to 1,456 records. All 1,346 existing authored records, including the 8 History records, keep their digests. Reviewing existing research remains a separate task.

| Domain | Added |
| --- | ---: |
| Ancient Egypt | 29 |
| Ancient Greece & Rome | 29 |
| Medieval Times | 26 |
| Historical Thinking | 10 |
| Modern History | 9 |
| Family & Community History | 7 |

Topics, dependencies, curriculum alignments, ages and standards are unchanged. [scope.json](scope.json) freezes the selected topics with their evidence, prerequisite and dependent context, the source-file hashes, baseline coverage and authored-record digests. Only the research collection and the generated manifest change among pre-existing files.

[capture-scope.mjs](capture-scope.mjs) makes the baseline re-runnable: it reads `data/teaching-research.json` from a git ref (default `origin/main`, or `--ref <ref>`, or `--base <file>`), so after a rebase the baseline is recaptured from the new `main` rather than from this branch.

## Human review

Open [index.html](index.html) directly in a browser. The page is self-contained and works offline. Search or filter the 110 additions by domain and confidence. Each topic shows teaching moves, activities, exercise-generation guidance, assessment, diagnostics, and the source claims and limits together. Expected assessment evidence starts collapsed. The coverage header counts the 8 existing History records; the review itself shows only the additions.

Notes stay in local browser storage; export them to keep or share them. The History page uses its own store (`marble-teaching-research-history-2026-11-18`), separate from earlier subjects, and keeps the merged two-tab fix:

- Uniquely keyed revisions preserve concurrent edits.
- Storage events update other tabs.
- Conflicting versions stay visible and exportable until explicitly resolved.
- Superseded revisions are compacted.
- **Confirm notes apply to this version** updates a stale or unknown binding after re-review.
- Back and Forward restore the owning topic and notes.

No notes are sent anywhere.

Rebuild from canonical data:

```sh
node reports/history-gapfill-2026-11-18/build-review-page.mjs
```

## Authoring and evidence boundary

- Every record has at least three topic-specific activities, each with learner actions, intended insight, feedback, rationale and cited sources.
- Every record has an `Exercise design:` constraint covering which support to fade, which demands to vary, transfer and boundary cases. These are proposals, not calibrated difficulty scales or new age or mastery claims.
- Assessment methods follow topic type: 93 conceptual (answer plus reason), 4 procedural (observed performance task), 3 representational (interpret and construct), 8 META (open epistemic probe, exemplar marked as not an answer key) and 2 language (use in context).
- Assessment stimuli are fresh: a different object, source, case or scenario from the activities, with no 12-token overlap with any activity. No `poeTask` is used; history has no genuine predict–observe–explain phenomena.
- Diagnostics are labelled as **authored observable performance/reasoning checks** unless a fetched source documents the misconception or popular claim. Nine diagnostics are marked as documented by a fetched source:
  - Lee and Ashby's "scissors and paste" and "nobody was there, so we can't know" ideas (CHATA summaries; two diagnostics).
  - "A biased source is useless" (Ofsted history research review; three diagnostics).
  - "The 1967 referendum gave Aboriginal people the vote" (WA Museum).
  - Horned Viking helmets (National Museum of Denmark).
  - Alien pyramid builders (PBS NOVA).
  - Whipped slaves building the pyramids. This one rests on a Wikipedia summary that traces the claim to ancient Greek writers, and is flagged for a better source; AERA and Griffith Institute workforce evidence supplies the counter-evidence.

  All distractors are null, and every `reteachPrerequisiteId` is an actual prerequisite edge.

### History-specific care

- **Dates and conventions.** Authored prose uses BCE/CE; topic text that uses BC/AD is shown as equivalent. Approximate dates are marked with "c." or "about". Conventional markers are taught as conventions: 476 CE, 753 BCE, 776 BCE, Bologna 1088. Debated dates are flagged:
  - the August or October date of the Vesuvius eruption in 79 CE;
  - Boudica's revolt (60 or 61 CE);
  - the Bakhshali manuscript's date.
- **Evidence, interpretation and legend are kept apart.** Romulus and Remus, Robin Hood, King Arthur and the Trojan War are taught as legend with traceable evidence. The pyramid builders are taught from AERA and Griffith Institute workforce evidence, against both the alien and the mass-slavery claims. "Dark Ages" framing is avoided.
- **Topic wording that overstates is corrected in the record, not in the topic.** The record teaches the accurate version, flags it in constraints and reviewNotes, and its answer key accepts the accurate version. Examples:
  - Constantine legalised Christianity in 313 CE; it became the official religion under Theodosius I.
  - Herodotus has Pheidippides running from Athens to Sparta; the Marathon-to-Athens run is a later tradition.
  - The 300 Spartans fought alongside thousands of other Greeks.
  - Athens developed one of the earliest documented democracies, not "the first".
  - Buttons existed in later medieval dress.
  - The Nile is "one of the longest" rivers, since Nile versus Amazon is contested.
  - Literacy was not confined to professional scribes.
  - The Great Pyramid is aligned to within about four arcminutes, not 0.05°.
  - Shadufs watered gardens; they did not irrigate year-round.
  - Abu Simbel is a temple, not a tomb.
  - Learning reached Europe mainly through Spain and Sicily, not the crusading armies.
  - Movable metal type was used in Korea (Jikji, 1377) before Gutenberg.
  - The 1967 referendum did not grant citizenship or the vote.
  - The 1902 franchise excluded most Aboriginal women.
  - 26 January marks the raising of the flag at Sydney Cove after the fleet reached Botany Bay from 18 January.
- **Sensitive content.** Colonial, slavery, war, massacre, plague and religious content is non-graphic and age-appropriate. Religious beliefs are stated as beliefs. Multiple perspectives are used without false balance: invasion is presented as a documented First Nations perspective, and the Crusades show violence affecting Jerusalem's people in both 1099 and 1187. No activity role-plays enslavement, ritual, massacre or worship.
- **First Nations content.** It uses named First Nations organisations and authors where they could be fetched. The contribution does **not** identify or verify any school's local Traditional Owners or protocols. The school must confirm these through its existing relationships. First Nations and migrant children are never asked to speak for a group.
- **Family history never requires disclosure.**
  - Photos, family trees, birthplaces, grandparent interviews and migration stories are always optional.
  - Every task has an equally valid route for assessment: a chosen trusted adult, a staff member or visitor, the school's own history, or a published or fictional family.
  - This explicitly includes children in care, adopted, bereaved, refugee or separated, or with sensitive family histories.
  - Interviews follow consent and existing school visitor policy.

### Confidence

**91 additions have medium confidence and 19 have low confidence; none has high confidence.** Medium confidence means sources support the content and approach. It does not mean the exact activities were tested.

Low-confidence records and why:

| Topic | Reason |
| --- | --- |
| Celebrations we share | Family, religion and First Nations days; no safeguarding or practitioner review; local cultural authority not established. |
| My family and where we're from | High disclosure risk; adoption and kinship guidance is from practitioner and journalism sources rather than formal policy; no adoption or kinship-care practitioner review. |
| Important local people and places | Depends on local community knowledge; First Nations places need local Traditional Owner authority. |
| How our community changed | Needs local evidence and, for First Nations contributions, local authority and confirmed community organisations. |
| National days and commemorations | Contested meanings of 26 January and the Stolen Generations; no local community or practitioner review. |
| Contact and invasion | Centres First Nations perspectives without local Eora/Gadigal (or other local) authority; the origin of the 1789 epidemic is contested. |
| Impact of the colonies | Frontier conflict and massacre content; the main Myall Creek source is a teacher resource because the institutional pages failed to fetch. |
| Significant people in a colony | No community-endorsed Yagan source could be fetched, so First Nations profiles depend on teacher-supplied community sources. |
| Changing rights in the 1900s | Stolen Generations and White Australia content; a National Library page makes an inaccurate citizenship claim (excluded, and used as a source-checking warning). |
| Migration stories since 1901 | Refugee trauma and family histories; national archive and museum migration pages could not be fetched. |
| Ancient Egypt's Lasting Legacy | The comparison with other early civilisations and the extent of Egyptian influence on Greek science were not source-checked. |
| Modern Archaeology and Egyptian Ethics | Live ethical debate; Egyptian and diaspora views come through sector reports; no museum-ethics review. |
| Egypt and Its Neighbours | Isotope evidence challenges the "Hyksos invasion" account; goods sent south to Nubia and Punt are unsourced. |
| Greek theatre | The only fetchable content source is a theatre-company page with a known date error; museum and university pages were blocked. |
| Hidden Voices of Greece and Rome | Contested slave-population estimates (fetched range at least 15% to about 25%); slavery and gender handling not practitioner-reviewed. |
| Inclusion and Exclusion in Athens | The topic's fraction task depends on contested population figures, so a labelled model is used instead. |
| Understanding People in Their Own Time | Empathy research read only at framework and abstract level; the example rests on one local account; contextual versus moral judgement needs practitioner review. |
| Medieval Clothing | Fetched sources document elite dress; peasant fabrics rest on general knowledge a dress historian should confirm. |
| The Crusades | Religious-conflict content with present-day associations; no religious-education, specialist or community review. |

### Post-review audit

After Greptile's first review, every record was re-audited for four patterns, and fixes were made where found:

- **Assessments requiring untaught content.** Every god, person, date or term an answer key needs is now taught in an activity, is in the topic text, or belongs to a prerequisite. Assessments use unseen stimuli of taught content.
- **Keys requiring information the stimulus does not give.** Authored, fictional or reconstructed stimuli are labelled as such in the prompt. Keys no longer infer authorship or details the learner cannot see.
- **Cross-record contradictions.** The shaduf is consistent across the Egypt records: it lifted water into channels, gardens and small plots, while the grain fields depended on the inundation and basin irrigation. Year-zero arithmetic, the 1066 and Danelaw wording, the 1902 franchise and the First Fleet dates were also aligned across records.
- **Citations not supporting their activity.** These were removed, or replaced with a newly fetched source. Where nothing fetchable supports a claim, it is flagged in reviewNotes.

### Sources and practical use

[source-checks.json](source-checks.json) records **314 checked source entries** (293 distinct URLs), with the sections used, the exclusions and the topics that use each entry. Two entries were checked but are not cited by any record. Sources were fetched in this session and checked against the specific citation claim. Verification applies to that claim, not to every sentence on a page or to an activity's effectiveness.

Principal sources:

- **Curriculum and research guidance:** DfE national curriculum; Ofsted history research review (2021); Historical Association; Historical Thinking Project; Library of Congress; US National Archives.
- **Archaeology and museums:** Griffith Institute and AERA; Egypt's Ministry of Tourism and Antiquities; the Australian Museum; English Heritage; London Museum and the V&A; the National Museum of Denmark.
- **Primary texts and scholarly references:** LacusCurtius, Perseus, Fordham and the Avalon Project; the Stanford Encyclopedia of Philosophy; MacTutor.
- **Australian civics and culture:** the Parliamentary Education Office, AEC, AWM, NAIDOC, Reconciliation Australia and City of Sydney's Barani.

Many institutional sites refused automated fetching in this session: the British Museum, Britannica, UNESCO, the Met (rate-limited), Historic Royal Palaces, the National Museum of Australia, AIATSIS and the UK National Archives education pages. These are **not** cited. As a result, **15 entries are Wikipedia pages**, all in Ancient Egypt (14 in the first half of the domain, 1 for the Egyptian–Hittite treaty). Each is labelled in its exclusions as kept only because no fetchable institutional page supported the claim. A reviewer may want those replaced with museum or university sources.

Some conventional dates and details are standard chronology but were not confirmed against a fetched page. Each such record flags them in reviewNotes. Examples:

- the founding of the Republic in 509 BCE;
- the Yuan dynasty's dates;
- several etymologies.

These are teaching-research records, not finished lesson packs. Teachers still supply current images, maps, source packs, local and community-endorsed First Nations material, and source-specific answer keys. Fictional and reconstructed stimuli are labelled as such. Existing school safeguarding, visitor and supervision arrangements apply.

No learner trial or independent content review has occurred. The author's source and content pass and the automated checks do not replace those review gates.

## Validation

```sh
npm run alignments:generate
npm run validate
npm run alignments:generated-check
npm test
node reports/history-gapfill-2026-11-18/validate.mjs --write
node --test --test-isolation=none reports/history-gapfill-2026-11-18/validate.test.mjs
node --test reports/history-gapfill-2026-11-18/two-tab.test.mjs
git diff --check
```

All of these pass:

- repository validation and the generated-artifact checks;
- **576 repository tests**;
- **six scoped mutation tests**;
- the real two-tab browser regression.

[validation.json](validation.json) reports:

- 110 additions;
- 1,346 preserved authored records;
- zero History gaps;
- no assessment passage sharing 12 consecutive tokens with an activity.

[validate.mjs](validate.mjs) reads the expected counts and the subject from scope.json rather than hardcoding them. It also rejects high confidence and an unexpected attribution. The mutations test six faults: baseline edits, missing records, copied stimuli, invented recovery edges, prohibited distractors, and a type/method mismatch. The lexical check cannot prove semantic independence, source entailment or teaching effectiveness.

[browser-smoke.js](browser-smoke.js), appended only to a temporary copy, passes at 1440 × 1200 and 390 × 844. It covers:

- rendering of all 110 topics and their sources;
- filters, search and the empty state;
- previous/next navigation;
- versioned, legacy and stale notes, and export;
- explicit re-review;
- Back/Forward through conflicting filters and source anchors.

The initial layouts were visually inspected. [two-tab.test.mjs](two-tab.test.mjs) uses two real Chrome tabs in a temporary profile; set `CHROME_BIN` if needed. The browser checks fetch no source links.
