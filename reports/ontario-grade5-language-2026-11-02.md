# Ontario Grade 5 Language alignment — 2 November 2026

This release adds 306 links from 71 Ontario Grade 5 Language expectations to 161 existing topics. No topics or difficulty levels are added. The existing descriptions, evidence criteria and assessment prompts remain unchanged. See the [code-by-code mapping](ontario-grade5-language-mapping-2026-11-02.json) and [official Grade 5 curriculum](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language/grades/grade-5).

| Expectations | Full semantic / selectable coverage | Partial semantic / selectable coverage |
| --- | ---: | ---: |
| 59 specific | 55 / 55 | 4 / 4 |
| 12 overall | 8 / 8 | 4 / 4 |

Topic–expectation links record contributions to an expectation, sometimes through several topics. They do not certify that teaching has occurred, that a learner holds every linked whole topic, or that resource/performance requirements have been met.

## Reuse and prerequisite review

Seventeen topics gain their first Ontario context and 144 existing Ontario contexts receive Grade 5 links. No existing Ontario start age is lowered. Earlier Mathematics, Kindergarten and Language Grades 1–4 links remain unchanged.

Two grammar topics become selectable after reviewing their complete mastery claims:

- **Types of Sentences (`mt_T9IXrlxfx2`)** contributes to B3.1. The whole topic still requires constructing all four sentence forms, combining clauses, deliberate variety and explanation of effects. Full modifier correction and relative-clause production are helpful support rather than necessary whole prerequisites: the sentence forms can use adverbial subordination. `mt_IdFxLz-UW9` and `mt_YQ64pzcLDl` therefore become soft support. Basic coordination and subordination (`mt_wq-1OJ_8s5`) is a genuine hard prerequisite and is added first.
- **Grammar Terms: Voice and Punctuation (`mt_hzkNpp2PdV`)** contributes to B3.2 through subject/object understanding. It retains the entire eleven-term claim and accurate provided-text active/passive understanding. Whole mastery of the earlier terminology list (`mt_-tcJeAhK5k`) or independent passive-voice production (`mt_gbTyzvnWzr`) is not necessary for that claim; both become soft support. One correct object item cannot certify the whole topic.

These are four hard-to-soft changes plus one new hard dependency. All 3,990 unrelated edges and every existing topic claim are preserved. Soft support still affects future evidence propagation; the changes are not merely display metadata. No historical learner estimates are reset or reweighted.

## Remaining conditions

- **A3.3, C1.7 and C3.7:** authentic First Nations, Métis and Inuit resource requirements remain Partial. A generic interpretation skill or generated resource does not discharge those conditions.
- **D2.2:** keyboarding automaticity remains an observed performance condition. No difficulty clone or words-per-minute threshold is invented.

The four affected overall expectations remain Partial as well. The mapping exposes holder IDs and roles without reproducing official expectation text.

## Verification and dataset impact

The complete hard-and-soft graph remains acyclic. All 161 selected holders are ready under their hard prerequisites: closure 207 topics, 190 hard edges, zero eligibility issues. Global country eligibility flags change from MIN 391 / strict 398 to MIN 390 / strict 397, resolving only the earlier US sentence-types/modifier flag; no new context or category issue appears.

The saved builder graph and staging DB were independently reconciled, including all real source bindings, both stored source metadata and join rows, and every final dependency. The single manual sync response timed out and was not retried; subsequent independent reads confirmed full persistence. The historical checks establish preservation of pre-existing assessment results and v1-topic-linked learner/research rows. Interest observations with null, unmatched or non-v1 topic IDs were outside the captured scope; their preservation is unverified. This is not evidence of learner mastery.

The dataset remains 1,858 topics and becomes 3,995 dependencies with 6,735 published topic–standard links (306 more than the Grade 4 baseline). All 1,049 teaching-research records, 809 explicit research gaps, two archived research records, 176 clusters and the 17-source / 7,743-expectation catalogue are unchanged. All-strength reachability and actual centrality scores remain unchanged. Derived age bounds and alignment lists change only as required by the approved Ontario contexts. Types of Sentences has a global start of 10 rather than 11 because it gains a new Ontario 10–11 context; no existing country start is lowered. Global end ages change on 92 topics as derived from their updated contexts.

Ontario publication remains codes and official source links only. Private audit files, database identifiers for learners, learner observations, embeddings and protected aggregate fingerprints are not published.
