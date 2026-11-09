# NCERT foundational source-kind reconciliation

This is an evidence/metadata audit against exact dependent base `7fa1961`.
It adds no standards, topics, alignments, source wording or DB changes. Its purpose
is to account for the selected publication's areas without converting every table
cell into another outcome.

## Authority and source status

The [2025 foundational publication](https://ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf),
SHA-256 `484d5c18d9beeb1d79c4bee8589f6cb2b2ef42bdeb255b8f51e1eae8ac953eb2`,
distinguishes curricular goals, stage competencies and granular outcomes in its
introduction (PDF 3–5, printed 1–3). It explicitly presents learning outcomes as
suggestive and contextualisable. Printed outcome positions are valid catalogue
records; their counts do not establish an exhaustive mandatory national grade-level
checklist. Stage competency attainment is a separate reference.

The selected formal Foundational standards are now separately catalogued from the
same pinned [NCF-SE October 2024 edition](ncert-ncfse-foundational-catalogue-2026-11-09.md).
The suggestive 2025 source is not silently promoted to that formal status, and
formal framework records do not replace its different source positions. No source
edition is treated as interchangeable merely because codes or wording resemble
one another.

## EVS syllabus: every page has a disposition

PDF 53–62 (printed 51–60) is labelled as the foundational environmental-studies
syllabus. Its initial header distinguishes curricular goals, Balvatika 1–3,
Grades 1–2, and competencies. There is **no separately labelled learning-outcome
column**. The middle grade columns contain syllabus content and integrated
literacy/numeracy labels; the outside columns relate that content to source goals
and competencies. Repeated references and continuation cells are not new outcomes.

| PDF page | Kind / source layout disposition | Catalogue treatment |
| --- | --- | --- |
| 53 | Header; grade content; goal and competency relationships | `syllabusContent` plus reference metadata; not outcome additions |
| 54 | Continued grade content and goal/competency relationships | Same typed inventory; not new standards for each repeated reference |
| 55 | Competency-column continuation; middle grade columns empty | Reference continuation only |
| 56 | Grade content with goal/competency relationships | `syllabusContent`; no outcome-column inference |
| 57 | Grade content; continuation and a new goal relationship block | Preserve source boundaries; no one-to-one goal/content mapping |
| 58 | Grade content with multiple goals/competencies | Integrated syllabus inventory, not a separate outcome per phrase |
| 59 | Grade content; multiple relationship references | Same typed inventory |
| 60 | Grade content including cells absent from younger bands | Preserve blank/source bands; do not fill downward or clone cells |
| 61 | Grade content; partial younger-band blanks and continued references | Same typed inventory, explicit blank cells |
| 62 | Goal-column continuation; middle grade and competency columns empty | Reference continuation only |

Source status is **published syllabus content**. The table does not establish each
content phrase as an independently assessable learning outcome, nor does this audit
establish a separate per-item mandatory attainment deadline. It is not relabelled
as suggested activities merely by association with the later Arts table. The
normative/suggestive force of any finer content obligation remains unasserted.
A future content index must keep that distinction rather than manufacturing LO IDs.

The public [typed inventory](ncert-foundational-source-kinds-index-2026-11-09.json)
accounts for all ten EVS pages and their source bands. Raw cells remain private.
This is source coverage evidence; it is not another editable taxonomy graph or a
second acceptance gate. No new standard identifiers are needed to record these
page/source-kind dispositions.

## Arts appendix and references

The Arts syllabus (PDF 63–69) explicitly separates suggested grade-column
activities from a shared outcome column. Its [56 outcome-position proposal](ncert-foundational-arts-syllabus-catalogue-2026-11-09.md)
records only the latter, once at its actual Foundational source scope without an
invented required grade band. The activities remain suggested implementation
material. Shared goal references do not establish semantic equivalence with earlier
outcome tables, or distinct mastery claims for each repeated source position.

PDF 70 is a teaching-material reference list. It remains a reference inventory,
not additional outcome records or an invitation to ingest linked activities.

## Verification and remaining scope

All EVS pages 53–62 and the source-status introduction on PDF 5 were visually
inspected and compared with the pinned document's layout text. The evidence audit
checks exact page coverage, kind and source-band metadata without claiming a
row-by-row outcome reconstruction for content that is not an outcome table.
The existing 316 foundational source positions and 254 formal framework records
remain unchanged. No new test suite is needed for this documentation-only audit;
JSON parsing and diff checks verify the factual inventory format.

Remaining language work is explicit: Hindi-text PDF 35–43 requires source-section,
language-role and script readback; language of exposition does not itself identify
the learning target. Urdu PDF 44–48 is explicitly an Urdu section but its damaged
text extraction remains unverified. Target/role, source columns and script must
be reconciled before new language positions are published. The broader current/
legacy grade-publication inventory also remains open. No alignment begins from
an unverified or undifferentiated catalogue.
