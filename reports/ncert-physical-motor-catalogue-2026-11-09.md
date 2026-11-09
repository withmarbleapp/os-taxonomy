# NCERT Physical/Motor catalogue — 9 November 2026

This batch adds **66 printed source-position records** from the Physical/Motor
CG-1–3 tables whose cells include Grade 1 or Grade 2. Combined with the original
67 Maths and the [34 English L2 positions](ncert-english-l2-catalogue-2026-11-09.md),
the `ncert-fs-2025` source contains 167 positions. No topic, assessment claim,
alignment, prerequisite, teaching research or learner-state change is made.

The source is the same pinned [2025 foundational outcomes PDF](https://ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf),
SHA-256 `484d5c18d9beeb1d79c4bee8589f6cb2b2ef42bdeb255b8f51e1eae8ac953eb2`.
This selection occupies PDF pages 6–12, printed pages 4–10. It captures all printed
outcome cells intersecting the selected two grades in these tables. It does not
invent missing framework entries or establish that the source lists every
competency in the earlier framework. Remaining curricular areas and Preparatory
Grades 3–5 are visible in the [catalogue inventory](ncert-primary-catalogue-scope-2026-11-09.md).

## Shared grade bands are one source record

| Printed source band | Outcome positions | Grade 1 memberships | Grade 2 memberships |
| --- | ---: | ---: | ---: |
| Grade 1 and Grade 2, shared cell | 41 | 41 | 41 |
| Grade 1 only | 11 | 11 | 0 |
| Grade 2 only | 12 | 0 | 12 |
| Balvatika 3 and Grade 1, shared cell | 2 | 2 | 0 |
| **Total** | **66** | **54** | **53** |

The 107 selected grade memberships do not become 107 outcomes. A shared cell
produces one set of source positions and retains its complete original band
privately. The two Balvatika 3/Grade 1 positions are included because they also
apply to Grade 1; other Balvatika cells remain excluded. This does not claim a
complete Balvatika catalogue.

Generated IDs follow
`IN-NCERT-FS-2025-PM-<source-band>-C<printed-parent>-LO<ordinal>`. For example,
`IN-NCERT-FS-2025-PM-G1-G2-C1-LO01` belongs to a joint Grades 1–2 cell, while
`IN-NCERT-FS-2025-PM-B3-G1-C5-LO01` preserves a band crossing the preschool/Grade 1
boundary. `PM` names this source area; it creates no taxonomy subject or topic.
The source-band tokens are generated identifiers, not official NCERT codes.

The literal printed competency labels are retained, with CG identity recorded
separately. Do not silently turn `C-1` into a guessed `C-1.1`, or confuse the
printed parent `C-12` under CG-2 with curricular goal CG-12. These distinctions
are private source hierarchy, not new public mastery claims.

| Printed parent | G1 only | G2 only | Joint G1–2 | Joint B3–G1 | Total positions |
| --- | ---: | ---: | ---: | ---: | ---: |
| C-1 | 0 | 0 | 5 | 0 | 5 |
| C-2 | 0 | 0 | 5 | 0 | 5 |
| C-3 | 3 | 3 | 0 | 0 | 6 |
| C-4 | 1 | 1 | 0 | 0 | 2 |
| C-5 | 0 | 2 | 0 | 2 | 4 |
| C-6 | 0 | 0 | 5 | 0 | 5 |
| C-9 | 2 | 1 | 0 | 0 | 3 |
| C-12 | 2 | 2 | 0 | 0 | 4 |
| C-13 | 0 | 0 | 6 | 0 | 6 |
| C-14 | 3 | 3 | 0 | 0 | 6 |
| C-15 | 0 | 0 | 20 | 0 | 20 |
| **Total** | **11** | **12** | **41** | **2** | **66** |

## Verification and artifacts

The extractor checks the pinned PDF hash and selects actual cells by their
intersection with the source's Grade 1/2 columns. It records source bands before
restricting the selected-grade view, so horizontal merges are preserved. Blank
continuation cells are not emitted as outcomes and a continued parent is retained
across pages. Printed bullets retain their order within parent and source band.

A separate Poppler reconstruction uses independently reviewed source-row/cell
regions rather than the candidate's extracted coordinates. It reconstructed all
66 records across 18 fragments and compared the generated ID, parent, CG, ordinal,
source pages, full band, selected grades and tokenized wording. Six corrupted
candidates were rejected: changed selected grades, collapsed source band,
invented text, wrong page, guessed dotted parent and an omitted record. All seven
selected source pages were visually inspected.

The private 66-row batch SHA-256 is
`1d80181d305eb239b1d0b54f1f174a767cd8cec8904f527720d483ca96bb2d77`.
It binds the 167-position source following the English milestone. The combined
English/Physical addition artifact SHA-256 is
`2bb0af464b4423130618592027ac0399892d08c0ce457fe3bc677dde9ab9fd95`.
That artifact contains exactly **100 new rows** against the original 67-position
Maths baseline and binds the final public source. It fits the existing downstream
catalogue adapter's 128-row batch limit; no adapter or DB write is performed here.

Public records remain code/key-only under the existing
[publication policy](../PROVENANCE.md). Private source text, PDFs, extraction cells
and grade-band metadata remain outside the public repository. Original 67 Maths
IDs and all public topic/alignment/dependency/research/cluster bytes are preserved.
Source-position completeness in this selected area is separate from whole-source
completion, taxonomy coverage and downstream publication.
