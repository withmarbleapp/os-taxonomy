# NCERT NCF-SE Preparatory Arts and Physical Education

This dependent catalogue proposal adds **81 formal source records** to
`ncert-ncfse-2023-ed2024`, bringing the selected Preparatory framework inventory
from 91 to **172**. Its exact unmerged dependency is `0ef8422`, the
[core-area batch](ncert-ncfse-preparatory-core-catalogue-2026-11-09.md). The source
identity, printed October 2024 edition, ISBN and pinned PDF bytes are unchanged.
No topics, alignments, prerequisites, learner state or DB records are changed.

## Selected tables and counts

All entries apply to the Preparatory **Grades 3–5 band once**, with goals and
competencies kept separate. Counts are formal source positions, not distinct
mastery skills or per-grade outcomes.

| Area / source set | Source subgroup | PDF pages | Goals | Competencies | Total |
| --- | --- | --- | ---: | ---: | ---: |
| Arts LS1 | Visual Arts | 354–355 | 4 | 8 | 12 |
| Arts LS1 | Theatre | 355 | 4 | 8 | 12 |
| Arts LS1 | Music | 355–356 | 4 | 8 | 12 |
| Arts LS1 | Dance and Movement | 356 | 4 | 8 | 12 |
| Arts LS2 | Non-artform-specific table | 357 | 1 | 3 | 4 |
| Physical Education LS1 | Full set | 416 | 4 | 12 | 16 |
| Physical Education LS2 | Initial implementation set | 416–417 | 3 | 10 | 13 |
| **This batch** | | | **24** | **57** | **81** |

Printed page numbers are PDF numbers minus 14. Adjacent Middle Stage tables on
PDF 357 and 417 are excluded. The 91 core records remain unchanged; the combined
inventory has **45 goals and 127 competencies** across the six selected areas.

## Source conditions and identifiers

The [official framework](https://ncert.nic.in/pdf/NCFSE-2023-August_2023.pdf)
explains the nested design for Arts on PDF 354 and PE on PDF 415. LS1 describes
the full set as the required resources become available. LS2 provides the initial
implementation baseline. Arts application additionally depends on appropriate,
accessible artforms selected in the school's context. These conditions are retained
in the [factual record index](ncert-ncfse-preparatory-arts-pe-index-2026-11-09.json)
and private preparation metadata. Both sets remain catalogued as printed, with
those conditions; they are not flattened into universal simultaneous requirements,
and are not taxonomy difficulty levels.

Printed codes reset between artforms and standard sets. For example,
`IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-1.1` is a generated
qualified identifier; `C-1.1` remains the official printed competency code.
Identifiers include stage, area, source set, source subgroup and kind. `INTEGRATED`
is a generated grouping token for the Arts LS2 table, not an invented official
artform code. PE has no artform subgroup. Its LS1 starts with printed **CG-3–6**;
CG-1/2 are not inserted. PE LS2 separately retains CG-1–3. Similar or repeated
requirements are retained as separate source positions without claiming separate
skills or rewriting the source.

The public catalogue remains codes/keys only. The index includes literal codes,
parents, kinds, stage bands, pages and original factual applicability labels,
without source descriptions. It is review evidence, not an alternate graph or
an extra acceptance gate. Source descriptions and PDF bytes remain private.

## Verification and completion boundary

All 81 records were independently reconstructed from **20 column fragments**
using Poppler bounding-box words after pdfplumber extraction. Exact wording is
compared privately. Identity checks include standard set, subgroup, kind, parent,
grade band, page and resource/applicability metadata; **nine deliberate corruptions**
were rejected. All six selected table pages were visually inspected, including
shared-stage page boundaries and literal PE numbering. The public index keyset
and classification are checked against the private reconstruction and catalogue.

The private **81-row** preparation artifact SHA-256 is
`2b1a18a2e435dcce9a5c99cb5cebe3cc32fc8662615bd460a101eca7a5b49088`.
It binds the final 172-record public source while containing only these 81 additions,
and passes the existing artifact reader. The 91-record dependency is applied first
in any later downstream publication; this Git proposal performs none.

This completes the **selected formal Preparatory tables in the pinned framework**.
It does not complete the broader NCERT primary catalogue: foundational language
verification, mixed syllabus sections, and reconciliation with later grade-specific
publications remain outstanding. Illustrative outcomes and teacher-generated
examples remain distinct from mandatory formal standards. See the
[primary scope inventory](ncert-primary-catalogue-scope-2026-11-09.md).

Artifact generation, repository validation and generated checks pass; **94 tests
pass**. All 18 other source objects, the prior 91 framework records and all other
tracked data files remain unchanged. The catalogue now contains 19 sources /
8,175 records.
