# NCERT CG-4–6 catalogue — 9 November 2026

**Dependency:** this local proposal starts at **unmerged `09a949a`**, the
167-position English/Physical catalogue proposal. Its first 100 new rows stay
unchanged on their original branch. This separate batch adds **34 positions**,
bringing the dependent source to 201. Downstream publication must apply the
accepted dependency first; the 34-row artifact is not applicable to the original
67-position Maths baseline. Ordinary repository review/acceptance does not wait
for a private deployment. No push, PR or downstream write is performed here.

The selected official [2025 foundational PDF](https://ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf)
remains pinned to SHA-256
`484d5c18d9beeb1d79c4bee8589f6cb2b2ef42bdeb255b8f51e1eae8ac953eb2`.
CG-4–6 occupy PDF pages 13–16, printed pages 11–14, under the source's
Socio-emotional/Ethical domain. The batch covers every printed outcome cell in
these tables that intersects Grade 1 or Grade 2; other Balvatika cells remain
excluded. This is source ingestion, not taxonomy alignment or evidence of new
mastery claims. Remaining whole-catalogue scope is recorded in the
[primary inventory](ncert-primary-catalogue-scope-2026-11-09.md).

## Identity and source dispositions

Generated IDs use
`IN-NCERT-FS-2025-SE-<source-band>-C<printed-parent>-LO<ordinal>`, for example
`IN-NCERT-FS-2025-SE-G1-G2-C4.1-LO01`. `SE` identifies this source area. The printed
parent labels are official; the individual position identifiers are generated,
not official NCERT outcome codes. Existing Maths, English and Physical/Motor
identifiers remain unchanged under `ncert-fs-2025`.

C-4.1 contains one unbulleted statement in a joint Grades 1–2 cell. It is retained
as a single source position. Bullet presence is not a requirement for being an
outcome, and line wrapping does not create extra outcomes. Other selected cells
use bullets whose continuations remain attached to their originating position.
Illustrations inside an outcome stay within that outcome. No source requirement
is silently rewritten or relocated to another parent.

| Printed parent | Grade 1 only | Grade 2 only | Joint Grades 1–2 | Total positions |
| --- | ---: | ---: | ---: | ---: |
| C-4.1 | 0 | 0 | 1 | 1 |
| C-4.2 | 0 | 0 | 5 | 5 |
| C-4.3 | 0 | 0 | 5 | 5 |
| C-4.4 | 2 | 3 | 0 | 5 |
| C-4.5 | 2 | 2 | 0 | 4 |
| C-4.6 | 1 | 1 | 0 | 2 |
| C-4.7 | 0 | 0 | 5 | 5 |
| C-5.1 | 1 | 2 | 0 | 3 |
| C-6.1 | 2 | 2 | 0 | 4 |
| **Total** | **8** | **10** | **16** | **34** |

The 16 joint-grade positions are counted once, retaining their source band. The
selected grade view consequently has **24 Grade 1 and 26 Grade 2 memberships**;
those 50 memberships are not 50 distinct outcomes or skills. Private metadata
records both the complete band and selected grade list. Common requirements in
different source positions are preserved rather than automatically deduplicated
into topic-level decisions.

## Independent verification

The extractor checks the official PDF hash and page count, derives stage-column
positions from the actual page-13 headers, and requires the same geometry on the
following pages. This table is narrower than the earlier Physical/Motor tables;
reusing their hard-coded column widths would be unsafe. Nine dotted parent labels
and their CG identities are checked explicitly.

A separate verifier reconstructs records from Poppler word coordinates using
independently reviewed source-row regions. It checks all **34 positions across
14 cell fragments**, including generated ID, selected grades, complete band,
parent/CG, ordinal, page, source format and tokenized wording. XML-forbidden control
glyphs in goal headings are discarded only while parsing the readback; raw
Poppler output stays unchanged privately. All four pages were visually inspected.

Eight altered candidates failed verification: wrong selected grade, collapsed
band, invented wording, wrong ordinal, nonexistent parent, changed unbulleted
format, omitted unbulleted outcome and duplicated record. The unbulleted statement
is therefore checked explicitly rather than surviving only because the total
looks plausible.

The prepared private artifact SHA-256 is
`d6e585815ddcddcc759dfe2dce8300e31d96aab0ea027cc488424e2be79b3eaf`.
It contains exactly 34 added rows and binds the complete 201-position public
source against the 167-position dependency. Source wording, illustrations, PDF
bytes, cell evidence and operational notes remain private. Public entries contain
code/key pairs only under the existing [publication policy](../PROVENANCE.md).

The public generator refreshes source counts/checksums. Topic, alignment,
dependency, research and cluster bytes remain unchanged. Public schema/integrity,
generated-artifact and regression checks validate the repository proposal;
repository acceptance and downstream publication remain separate events.
