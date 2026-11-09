# NCERT English L2 catalogue — 9 November 2026

This proposal extends the existing `ncert-fs-2025` source with **34 printed English
Language 2 outcome positions: 17 in Grade 1 and 17 in Grade 2**. The 67 accepted
Maths identifiers remain unchanged, giving 101 positions in this document-level
public catalogue. No topic, assessment claim, alignment, prerequisite or teaching
research record changes. This is catalogue preparation, not a staging publication
receipt or an alignment/coverage claim.

The [primary catalogue inventory](ncert-primary-catalogue-scope-2026-11-09.md)
records the complete target and remaining areas. This batch excludes Balvatika,
the other foundational areas and all Preparatory Grades 3–5. It does not claim
coverage of all NCERT standards or other Indian boards.

## Source and identifiers

The pinned official [2025 foundational outcomes PDF](https://ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf)
has SHA-256 `484d5c18d9beeb1d79c4bee8589f6cb2b2ef42bdeb255b8f51e1eae8ac953eb2`.
English L2 occupies PDF pages 49–52, printed pages 47–50. The explicit section
heading identifies English as the second-language target; this decision is not
inferred from the document being written in English.

IDs use `IN-NCERT-FS-2025-EN-L2-G<grade>-C<parent>-LO<ordinal>`. As with the accepted
Maths records, these are generated source-position identifiers, **not official
NCERT outcome codes**. `EN-L2` preserves the subject/language role. The official
competency code is retained as parent metadata privately; it is not a unique
outcome identifier. Ordinals count actual outcome positions within each parent
and grade, excluding explicit examples and N/A cells.

| Official parent | Grade 1 positions | Grade 2 positions | Source disposition |
| --- | ---: | ---: | --- |
| C-9.1 | 2 | 4 | Outcome positions retained. |
| C-9.2 | 0 | 0 | Both grade cells explicitly N/A; no invented outcome. |
| C-9.3 | 2 | 2 | Outcome positions retained. |
| C-9.4 | 2 | 1 | Grade 2 example bullet attached to its preceding outcome. |
| C-9.5 | 1 | 1 | Outcome positions retained. |
| C-9.6 | 1 | 2 | Outcome positions retained. |
| C-9.7 | 1 | 2 | Outcome positions retained. |
| C-11.1 | 8 | 5 | Includes one Grade 1 source repetition and a final Grade 1 position on page 52. |
| C-11.2 | 0 | 0 | Both grade cells explicitly N/A. |
| **Total** | **17** | **17** | **34 source positions; not 34 distinct mastery claims.** |

The Grade 1 C-11.1 positions `LO02` and `LO06` print the same substantive requirement
with minor formatting differences. Both positions are retained with a private
repetition cross-reference. Removing one would silently change the source's
position inventory, whereas treating them as two learning skills would inflate
the taxonomy. The catalogue preserves the source faithfully; a later alignment
can associate both with the same existing claim if justified. No new topics are
created here.

The separately bulleted illustration under Grade 2 C-9.4 is part of `LO01`'s
private source description/example metadata. It has no separate public ID.
The four Grade 1/2 N/A cells remain explicit private dispositions. The source's
parent grouping, including an outcome carried onto page 52, is preserved rather
than silently reorganized by subject knowledge.

## Verification and publication

- Verified the official source hash and 72-page length before extraction.
- Extracted with pdfplumber 0.11.8 and preserved page/parent/grade/ordinal evidence.
- Matched all **15 selected cell fragments** against independent Poppler text.
- Independently reconstructed all **34 records** from Poppler word coordinates
  using separately reviewed source-row boundaries. Compared IDs, grade, parent,
  ordinal, pages, tokenized wording and the attached example.
- Rejected six deliberately corrupted candidates: changed grade, invented wording,
  wrong page, wrong ordinal, omitted record and duplicate record.
- Visually inspected all four English source pages, including the example,
  repeated positions, continuation and N/A cells.

The prepared private addition artifact contains exactly 34 new records and binds
the complete 101-position public source. Its SHA-256 is
`48cbc6225589a22df948e5ce6d17264196399fb84fadd2368fd07a156d256c0e`.
The original 67 Maths records are not rewritten or supplied as new rows. Public
catalogue entries contain identifiers only. Wording, examples, PDFs and extraction
cells stay private under the existing [publication policy](../PROVENANCE.md).

The existing public generator refreshes catalogue counts and checksums without
changing topics, alignments or research. Its catalogue regression test uses an
invented addition instead of assuming that the NCERT source will always contain
67 records; this allows later batches without weakening checksum or unchanged-data
checks. Repository acceptance and downstream publication remain separate.
