# Ontario Grade 6 Language alignment — 2 November 2026

This release adds **313 expectation links across 168 topics** for Ontario Grade 6 Language: 165 existing topics and three new whole claims. It also corrects evidence in one existing suffix topic and adds eight prerequisites. The Language authoring scope stops at primary Grade 6, ages 11–12. See the [code-by-code mapping](ontario-grade6-language-mapping-2026-11-02.json) and [official Grade 6 curriculum](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language/grades/grade-6).

| Expectations | Full semantic / selectable coverage | Partial semantic / selectable coverage |
| --- | ---: | ---: |
| 59 specific | 55 / 55 | 4 / 4 |
| 12 overall | 8 / 8 | 4 / 4 |

Links record contributions to expectations, sometimes through several topics. They do not certify classroom delivery, mastery of every linked whole topic, or satisfaction of resource/performance requirements. Overall coverage includes its child expectations; direct links alone are not its rollup.

## Reuse, focused additions and evidence correction

| New topic | ID | Whole-claim boundary |
| --- | --- | --- |
| Gerunds as nouns | `mt_nA5OXhzkrh` | Recognise and use noun-function `-ing` forms in subject, object and preposition-object positions, distinguishing progressive verbs and describing words. |
| Colons after labels | `mt_gvU3c_FLyu` | Apply context-dependent conventions in letter/memo salutations or labels and before script dialogue; do not impose a universal colon rule on every formal greeting. |
| Gestures across cultures | `mt_4coR4NiDTl` | Understand learned nonverbal conventions and individual, community and situational variation, without treating cultures as uniform rule sets. |

Each is one whole-topic claim and belief, with positive, near-miss and cross-context assessment criteria. There are no difficulty tiers, genre variants or country copies. Existing broader topics were reviewed as complete alternatives before adding these claims.

The existing suffix topic `mt_2X9Cd38eSJ` keeps its scope, description and assessment prompt. Evidence items 0 and 2 correct the overstated `-cious/-tious` explanation and qualify `-ant/-ent` word-family guidance; item 1 and every other claim field are retained. The full claim continues to cover its three suffix families, including exceptions. No learner estimate is reset or retrospectively reweighted.

The gerund claim has one hard prerequisite on the complete basic noun/verb distinction. Seven soft supports connect the new claims to existing knowledge. All 3,995 old dependency records in the public projection remain identical. Soft support can affect future evidence propagation; it is not just display metadata. Earlier Mathematics, Kindergarten and Language Grades 1–5 links are preserved. The legacy US `L.2.2b` alignment on `mt_QEr24lqzvH` remains a separately identified source-fit issue and is not used to close the new colon claim.

## Remaining conditions

- **A3.3, C1.7 and C3.7:** authentic First Nations, Métis and Inuit resources/context remain required. General interpretation skills or invented examples do not discharge those conditions.
- **D2.2:** fluent keyboarding remains an observed performance requirement. No artificial difficulty topic or words-per-minute threshold is introduced.

These four specific expectations and their four affected overall expectations remain Partial. The public mapping exposes codes, holder IDs, roles and coverage labels without reproducing official expectation text.

## Verification and dataset impact

The canonical builder graph, staging DB and public export were independently compared. The full graph is acyclic across hard and soft dependencies. All 168 selected holders are ready under the reviewed hard closure: 216 topics, 199 hard edges, zero issues or blockers. Global MIN/strict warning sets and categories remain exactly 390/397.

The refreshed dataset has **1,861 topics, 4,003 dependencies and 7,048 published topic–standard links**. All 6,735 previous published links are retained, and the 313 additions exactly match the code-by-code report. All source records, the 176 clusters and the two archived research records remain byte-identical to the preceding public release. All 1,049 portable research records are unchanged. The three new English topics have no research yet, increasing explicit research gaps from 809 to 812.

All 1,861 stored centralities match independent all-strength reachability calculations. The normalization denominator changes from 982 to 984, changing 1,856 old normalized values; these are derived changes rather than authored mastery edits. Published global end ages expand on 113 existing topics, with no global start-age change. Other existing public topic fields change only in curriculum links and the one corrected evidence field. All old topic IDs and creation dates are preserved in staging. Normal persistence refreshed the corrected suffix embedding and generated three new embeddings; embeddings are excluded from the public export.

During ingestion, an incomplete background sync and two missing receipts required recovery. One original response remains unavailable; its applied effect was reconciled without replay. The other actual response was recovered from the runtime trace and recorded byte-for-byte. Final full graph/DB agreement was verified independently; no manual sync or repeated mutation was needed for this release. All 412 earlier builder workspace files remain byte-exact.

Historical preservation was checked for the whole AssessmentResult table and v1-topic-linked rows in six other protected tables. Null, unmatched and non-v1 interest observations were outside that captured scope and remain unverified. The later publication capture queried no learner tables and confirmed all five taxonomy/source tables were unchanged by the read-only export. Neither these checks nor source mappings establish learner mastery.

Ontario remains codes and official source links only. Private audit inputs, protected aggregate values, learner observations and embeddings are not published.
