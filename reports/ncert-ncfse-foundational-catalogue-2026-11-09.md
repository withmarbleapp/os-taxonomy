# NCERT NCF-SE formal Foundational Stage standards

This dependent catalogue proposal adds **82 formal source records** (13 curricular
goals and 69 stage competencies) from the pinned National Curriculum Framework for
School Education 2023, printed October 2024 edition. It extends the same document
identity, `ncert-ncfse-2023-ed2024`, from 172 to **254** records. Exact unmerged
data-preparation base: `42f722c`; reviewed documentation dependency: `8b75fb3`,
whose tracked data are byte-identical to that preparation base. This branch merges
that dependency to carry the reviewed 2025 source-status guidance. The original
82-row private artifact and its recorded preparation base remain unchanged. No
source clone, topic, alignment, prerequisite, learner-state or DB change is included.

## Source and complete selected tables

The [official NCERT PDF](https://ncert.nic.in/pdf/NCFSE-2023-August_2023.pdf),
ISBN 978-93-5292-741-8, has SHA-256
`0e2c5a1ddb48f758a5e9f867258da40d57f9f236b37fc7f8022261973425f099`.
Section 1.4, Tables 1.1i–vi, publishes the formal Foundational goals/competencies
on PDF 212–216 (printed 198–202). These actual tables in the pinned edition are
used directly; a separate 2022 source is not invented or substituted.

| Source domain | Printed goal labels | PDF pages | Goals | Competencies | Total |
| --- | --- | --- | ---: | ---: | ---: |
| Physical Development | CG-1–3 | 212–213 | 3 | 16 | 19 |
| Socio-Emotional and Ethical Development | CG-4–6 | 213 | 3 | 9 | 12 |
| Cognitive Development | CG-7–8 | 214 | 2 | 17 | 19 |
| Language and Literacy Development | CG-9–11 | 215 | 3 | 18 | 21 |
| Aesthetic and Cultural Development | CG-12 | 216 | 1 | 5 | 6 |
| Positive Learning Habits | CG-13 | 216 | 1 | 4 | 5 |
| **This batch** | | | **13** | **69** | **82** |

Each record retains the **full Foundational ages 3–8 / Balvatika plus Grades 1–2
stage scope once**. `selectedGradeView: [1, 2]` identifies this primary selection,
not a per-grade obligation. The required grade band is unset. The attainment
reference is stage end, with the source's qualifications below. These are not
82 new per-age skills or 164 grade-specific outcomes.

## Language condition and source status

The footnote on PDF 215 qualifies CG-9 and its C-9.1–9.7 competencies: for a very
unfamiliar second language, stage-end development may remain emergent and
consolidation can occur in early Preparatory. The [factual index](ncert-ncfse-foundational-index-2026-11-09.json)
keeps this condition on the **exact eight affected goal/competency records**, with
source page and footnote marker. Other language-role metadata distinguishes the
R1/R2 goals without imposing a national target-language pair. The goal's printed
footnote marker is represented as metadata, not accidentally attached to a word;
the exact footnote wording is retained and independently verified privately.

These formal stage standards are distinct from the **suggestive, contextualisable
learning outcomes** in the 2025 foundational publication (its PDF 5 / printed 3).
Both are valid source catalogue positions, but the latter are not an exhaustive
mandatory national grade-level checklist. Source kind and status are retained;
formal end-stage references do not turn every printed example into a deadline.

## Identity, verification and remaining scope

`IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-1.1` is a generated
qualified identifier, while `C-1.1` is the literal official code. Stage, area and
kind prevent collisions with the existing Preparatory records. Literal CG parents
are retained. No correspondence is inferred from the 2025 Physical/Motor table's
sequential labels. The strict public catalogue remains codes/keys only; the index
contains factual source metadata and original applicability labels. It is review
evidence, not an alternate taxonomy graph or an extra acceptance gate.

All 82 records were independently reconstructed from **14 column fragments**
using Poppler bounding-box words after pdfplumber extraction. NFKC word/punctuation
tokens preserve word boundaries while tolerating layout whitespace. Checks cover
exact keysets, kinds, parents, source pages, full stage scope, source status and
conditional applicability. Eleven general corruptions were rejected, including
word splitting/joining; the L2 condition was additionally corrupted and rejected
for **each of the eight affected records**. All five table pages were visually
inspected. Private footnote text is independently compared against source words.

The private **82-row** artifact SHA-256 is
`b480e30be1c9f435f3ab8ce311d3671582676e4b0bf927292ce83aeae09c05c4`.
It binds the final 254-record framework source with only these 82 additions.
Previously proposed source records remain unchanged. Source wording and PDF bytes
are private; repository review and any later downstream publication remain separate.

The selected framework's formal Foundational and Preparatory tables are now
accounted for: **58 goals and 196 competencies**, without grade clones. This is
not a claim that the entire NCERT primary catalogue is complete. Foundational
language/script verification, EVS source-kind dispositions and reconciliation with
later grade-specific publications remain in the [scope inventory](ncert-primary-catalogue-scope-2026-11-09.md).
No taxonomy alignment has begun.

Artifact generation, repository validation and generated checks pass; **94 tests
pass**. The private artifact reader accepts the 82-row proposal. All 172 prior
framework positions, all 18 other source objects and all other tracked data files
remain unchanged. The catalogue now contains 19 sources / 8,313 records.
