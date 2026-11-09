# NCERT foundational Arts syllabus outcome column

This dependent catalogue proposal adds **56 explicitly labelled source outcome
positions** from the Arts syllabus appendix (PDF 63–69, printed 61–67) of the
[pinned 2025 foundational document](https://ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf).
It extends `ncert-fs-2025` from 260 to **316** positions against exact unmerged
data base `19edaae`, now reconciled with documentation dependency `3d4cee0`.
Those parent snapshots have identical data bytes. The source document identity and SHA-256 remain unchanged:
`484d5c18d9beeb1d79c4bee8589f6cb2b2ef42bdeb255b8f51e1eae8ac953eb2`.
No topic, alignment, learner or downstream DB change is included.

## Scope and source-kind decision

The document-wide introduction classifies its outcomes as contextualisable
suggestions. These records preserve the appendix's printed positions, not an
exhaustive mandatory grade-level checklist; formal stage competencies are
accounted for separately in the framework source.

The table separately labels its grade-column material **Content and Suggested
Activities** and its shared rightmost column **Learning Outcomes**. Only the
latter's explicit outcome bullets are additions. Grade-specific activities,
headings, repeated goal descriptions and blank continuation cells do not create
outcomes. This is not an activity-to-standard conversion.

The outcome column itself is **not grade-divided**. Records retain source stage
Foundational and table scope Balvatika / Grade 1 / Grade 2. Their required grade
band is unset. `selectedGradeView: [1, 2]` describes this workstream's selection;
it does not say that every outcome is a mandatory Grade 1 or Grade 2 obligation,
or that all Balvatika outcomes elsewhere are complete. Each source position is
counted once. IDs therefore use a stage token, not invented per-grade copies.

| Printed parent block | PDF pages | Outcome positions |
| --- | --- | ---: |
| CG-1 | 63 | 2 |
| CG-2 | 63–64 | 5 |
| CG-3 | 64 | 4 |
| CG-4 | 65 | 5 |
| CG-6 | 65–66 | 8 |
| CG-7 | 66 | 4 |
| CG-8 | 67 | 3 |
| CG-9 and CG-10 together | 67–68 | 8 |
| CG-12 | 68 | 6 |
| CG-13 | 69 | 11 |
| **Total** | | **56** |

The CG-2 and language-block continuation pages contain no additional outcome
bullets. CG-6's ordinal sequence continues across two pages. The language block
prints CG-9 and CG-10 in one goal cell beside a shared outcome cell: both parents
are retained, without inventing a bullet-by-bullet split. CG-5/11 are not inserted
where absent from this appendix.

## Identity and relation to earlier tables

`IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO01` is a **generated source-position
reference**, not an official NCERT outcome code. `ART-SYL` distinguishes this
appendix from earlier Arts and other outcome tables; `FS` denotes the source
stage without asserting a required grade. Literal parent labels and source
ordinals are retained in the [factual index](ncert-foundational-arts-syllabus-index-2026-11-09.json).

These source positions may overlap earlier source statements. Their relationship
metadata identifies the earlier outcome-table section and shared curricular-goal
codes, explicitly **without semantic equivalence or topic-alignment claims**.
They are not assumed to be 56 additional distinct skills. Earlier identifiers and
their source dispositions remain unchanged. Source overlap is retained for later
coverage review, rather than silently deduplicating printed source positions.

## Verification and remaining work

All 56 records were reconstructed independently with Poppler bounding-box words
across **11 outcome-column fragments** after pdfplumber extraction. Wording is
compared privately using NFKC word/punctuation tokens that preserve word boundaries; code keysets, parent lists, ordinals, page references, record
kind, source scope and absence of an invented required grade are checked.
**Nine corruptions were rejected**, and all seven pages were visually inspected.
The public factual index is checked against the independent reconstruction and
code-only catalogue.

The private 56-row artifact SHA-256 is
`22880444add7f75982cebebc78487fa01e42afa2d9c84354564711dd38563f61`.
It binds the final 316-position source and contains only these 56 additions; the
existing artifact reader accepts it without schema changes. NCERT wording and
PDF bytes remain private. Ordinary Git review is separate from later publication.

The selected appendix outcome column is now accounted for. This does not complete
the whole primary catalogue: foundational language/script verification, typed EVS
syllabus dispositions and current/legacy grade-publication reconciliation remain
visible in the [scope inventory](ncert-primary-catalogue-scope-2026-11-09.md).

Artifact generation, repository validation and generated checks pass; **94 tests
pass**. All 260 prior foundational positions, all 18 other sources (including the
172 framework records), and all other tracked data files remain unchanged. The
catalogue contains 19 sources / 8,231 records.
