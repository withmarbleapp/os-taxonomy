# NCERT NCF-SE Preparatory formal standards — core areas

This dependent catalogue proposal adds **91 formal source records** from the
National Curriculum Framework for School Education 2023, **printed First Edition
October 2024**, ISBN 978-93-5292-741-8. The exact base is `f09dae0`, following the
unmerged foundational proposals at `09a949a` and `3884519`. No topic, alignment,
prerequisite or learner-state change is included; repository acceptance is separate
from downstream publication.

## Source and selected scope

The [official NCERT PDF](https://ncert.nic.in/pdf/NCFSE-2023-August_2023.pdf)
has 580 pages and 47,030,865 bytes, SHA-256
`0e2c5a1ddb48f758a5e9f867258da40d57f9f236b37fc7f8022261973425f099`.
PDF page 4 identifies the October 2024 edition. The URL filename retains an older
date; it is not evidence that these are August 2023 bytes. The new document-level
identity is `ncert-ncfse-2023-ed2024`, country `IN`, separate from the 2025
foundational outcome publication and legacy 2017 elementary outcomes.

| Area | PDF pages | Printed pages | Curricular goals | Stage competencies | Total |
| --- | --- | --- | ---: | ---: | ---: |
| Language R1 | 236–237 | 222–223 | 5 | 13 | 18 |
| Language R2 | 239–240 | 225–226 | 4 | 13 | 17 |
| Mathematics | 267–268 | 253–254 | 5 | 19 | 24 |
| The World Around Us | 382–384 | 368–370 | 7 | 25 | 32 |
| **Selected batch** | | | **21** | **70** | **91** |

Every record applies to the **Preparatory Grades 3–5 band once**. These 91 records
are not 273 outcomes, a mandatory per-grade outcome list, or 91 distinct mastery
claims. Language R1/R2 are source-defined roles; no particular national language
pair is inferred. The World Around Us remains an integrated area. Adjacent Middle
Stage content on shared pages and subsequent content/pedagogy sections are excluded.

## Identifiers, kinds and source hierarchy

The [factual record index](ncert-ncfse-preparatory-core-index-2026-11-09.json)
records the exact keyset, kind, area, shared grade band, literal printed code,
parent code and PDF/printed pages without source descriptions. It is review
metadata, not an alternate editable taxonomy graph or a separate acceptance gate.
The public catalogue remains strictly code-only.

For example, `IN-NCERT-NCFSE-2023-ED2024-PREP-R1-COMP-C-1.1` is a **generated
qualified identifier**, while `C-1.1` is the literal official competency code.
`GOAL-CG-1` and `COMP-C-1.1` remain different record kinds and the latter retains
its printed parent `CG-1`. Repeated codes across areas do not collide. Source
spellings and closely related printed entries are preserved privately; similarity
is not permission to silently merge formal standards.

The remaining Arts and Physical Education inventory introduces the source's LS1/LS2
sets and Arts subareas where codes reset. Those resource-conditioned sets require
explicit identity and applicability metadata; they are not taxonomy difficulty
levels. They are excluded from this 91-row batch. The initial all-area inventory
of 172 positions remains provisional until those areas are independently verified.

## Verification and completion state

All 91 records were reconstructed from 18 table-column fragments with pdfplumber
and independently read back using Poppler bounding-box words. Verification checks
wording privately, exact code keysets, record kinds, parent codes, source pages,
area and shared stage band; eight deliberate corruptions were rejected. All nine
selected pages and the printed edition page were visually inspected. The public
index is checked against that independent reconstruction and the code-only source.

The 91-row private preparation artifact has SHA-256
`c13b6a2cc2112ef3c36a1c1a1ece5720c2dd34312e47ba8dbad72efdd04f281f`.
It passes the existing catalogue artifact reader without adapter/schema changes.
It contains only this new source's selected additions. Private wording, PDF bytes
and operational records are not public review inputs.

This completes the selected framework's **formal core-area Preparatory tables**,
not the whole NCERT primary catalogue. Arts/PE, foundational language/script
reconciliation, mixed syllabus/reference dispositions and later edition-specific
grade publications remain explicit work in the [scope inventory](ncert-primary-catalogue-scope-2026-11-09.md).
Illustrative examples and teacher-created grade outcomes are not promoted to
mandatory standards. No catalogue-to-topic alignment has begun.

Repository validation, artifact generation and generated checks pass; **94 tests
pass**. All 18 prior source objects and graph files remain unchanged against the
exact dependency. The new catalogue count is 19 sources / 8,094 records. No new
private source access is required from a community reviewer to review the public
metadata and dispositions.
