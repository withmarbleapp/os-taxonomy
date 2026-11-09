# NCERT Arts, Learning Habits and Cognitive catalogue — 9 November 2026

This extension adds **59 source positions**: 30 Arts (CG-12), 18 Learning Habits
(CG-13) and 11 Cognitive (CG-7). It follows the unmerged [CG-4–6 milestone](ncert-cg4-6-catalogue-2026-11-09.md)
at `f54955e` (201 positions), bringing this dependent branch to **260**. No topic,
alignment, assessment claim, prerequisite or research change is made.

Together, the CG-4–6 and current extensions add **93 rows above the unmerged
167-position dependency `09a949a`**, fitting the existing 128-row publication limit.
Downstream publication must first apply the accepted dependency; ordinary repository
review/acceptance does not wait for private deployment. These are local catalogue
proposals, not live database or whole-curriculum completion claims. The
[primary inventory](ncert-primary-catalogue-scope-2026-11-09.md) records remaining
language sections, syllabus distinctions and Preparatory Grades 3–5 gaps.

## Source scope and counts

All records come from the pinned [official 2025 foundational PDF](https://ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf),
SHA-256 `484d5c18d9beeb1d79c4bee8589f6cb2b2ef42bdeb255b8f51e1eae8ac953eb2`.
The selected cells intersect Grade 1 or Grade 2. Other Balvatika cells and the
later suggested-activity/syllabus tables are not part of this batch.

| Source area | PDF pages | Grade 1-only positions | Grade 2-only positions | Shared source positions | Total |
| --- | --- | ---: | ---: | ---: | ---: |
| Arts, CG-12 | 17–21 | 15 | 15 | 0 | 30 |
| Learning Habits, CG-13 | 21–23 | 9 | 9 | 0 | 18 |
| Cognitive, CG-7 | 24–25 | 2 | 2 | 7 | 11 |
| **Total** | **17–25** | **26** | **26** | **7** | **59** |

Of the seven shared positions, one belongs to a joint Grades 1–2 cell under C-7.1.
Six belong to C-7.2 cells spanning **Balvatika 3, Grade 1 and Grade 2**. Each of
those positions is counted once, with its complete source band preserved privately.
The selected-grade view consequently contains 33 Grade 1 and 33 Grade 2 memberships;
66 memberships are not 66 outcomes. Inclusion of a shared preschool/primary cell
does not complete the other Balvatika sections.

| Printed parent | Grade 1 only | Grade 2 only | Shared G1–2 | Shared B3/G1/G2 | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| C-12.1 | 5 | 5 | 0 | 0 | 10 |
| C-12.2 | 4 | 4 | 0 | 0 | 8 |
| C-12.3 | 3 | 3 | 0 | 0 | 6 |
| C-12.4 | 1 | 1 | 0 | 0 | 2 |
| C-12.5 | 2 | 2 | 0 | 0 | 4 |
| C-13.1 | 2 | 2 | 0 | 0 | 4 |
| C-13.2 | 4 | 4 | 0 | 0 | 8 |
| C-13.3 | 1 | 1 | 0 | 0 | 2 |
| C-13.4 | 2 | 2 | 0 | 0 | 4 |
| C-7.1 | 0 | 0 | 1 | 0 | 1 |
| C-7.2 | 0 | 0 | 0 | 6 | 6 |
| C-7.3 | 2 | 2 | 0 | 0 | 4 |
| **Total** | **26** | **26** | **1** | **6** | **59** |

## Identifiers and boundaries

Generated identifiers follow the existing document/area/source-band/parent/ordinal
convention, with `ART`, `LH` and `COG` source-area tokens. For example,
`IN-NCERT-FS-2025-COG-B3-G1-G2-C7.2-LO01` is one position spanning three source
stages, not a third-grade outcome. Printed competency labels remain official
parents; individual outcome-position IDs are generated, **not official NCERT
outcome codes**. Existing source identities and all prior identifiers are preserved.

Separately printed grade cells retain separate source positions even when their
wording is repeated. This preserves the source inventory; it does not create
separate country/age/difficulty mastery claims. The source's repeated trailing word
in Grade 1 C-13.3 remains within its single private description and creates no extra
outcome. No editorial correction of the official wording is made implicitly.

Two C-12.2 outcomes, one for each grade, continue from page 18 onto page 19 within
an illustration. Their continuations remain attached to the original outcomes;
they are not extra bullet records. New bullets in a continued parent retain their
own ordinals. Header rows on page 24 are excluded. On page 25, extraction stops at
CG-8, preventing the already-catalogued Maths C-8.1 positions from being duplicated.
Later arts syllabus activities on pages 63–69 are not treated as additional outcomes.

## Verification and artifact boundaries

The extractor checks the pinned PDF hash/page count and records actual cell/grade
bands. It handles stage-column widths and horizontal shifts per page, including
continuation tables without a competency column. Parent identity persists across
continuations, changes at explicit parent/goal boundaries, and never carries into
headers as if they were outcomes.

Independent Poppler reconstruction uses separately reviewed row/cell regions and
rebuilds all **59 positions across 29 cell fragments**. It checks generated ID,
parent/CG, ordinal, source pages, full band, selected grade list and tokenized
wording. All nine relevant pages were visually inspected. Eight altered candidates
failed: lost continuation page, truncated continuation wording, collapsed shared
band, confusing Balvatika 3 with Grade 3, wrong parent at the Maths boundary,
wrong ordinal, omitted record and duplicated record.

The private **59-row** artifact for the 201-to-260 milestone is SHA-256
`a137e3225050ec6f0c0c4f8e8e23b643368cd6e150aafa5d1aa5b790a6ba85b3`.
The combined **93-row** artifact for publication after the 167-position dependency
is SHA-256 `7deb26be7b367e651bac7049c73b6910aef43f2b57b2bfca1c3815937defcfd4`.
It contains the CG-4–6 additions plus this extension, binds the final public source,
and excludes the dependency's original 167 rows from the addition payload.
The intermediate 34-row CG-4–6 artifact remains tied to its 201-position milestone.

Public entries contain only code/key pairs under [PROVENANCE](../PROVENANCE.md).
Private wording, examples, PDFs, cells and operational notes remain outside the
repository. Public generation updates catalogue counts/checksums; all topic,
alignment, dependency, research and cluster bytes remain unchanged. Schema,
integrity, generated-artifact and regression checks validate the repository
proposal, independently of any later publication job.
