# NCERT primary catalogue scope — 9 November 2026

This is a **catalogue-first source inventory and ingestion plan**, not a topic
alignment pass or a claim that the Indian curriculum is complete. The accepted
baseline is commit `45e2bc0` (PR #91). The repository contains 67 identifiers from
one selected part of the NCERT foundational outcomes document. No topic,
prerequisite, alignment or learner-state change is proposed here.

The subsequent [English L2](ncert-english-l2-catalogue-2026-11-09.md) and
[Physical/Motor](ncert-physical-motor-catalogue-2026-11-09.md) proposals add 34 and
66 verified source positions to the same document, bringing this branch to 167.
These are proposed catalogue extensions, not accepted/deployed completion of
the remaining areas. The baseline/status column below distinguishes the original
accepted 67 from these 100 proposed additions. Shared-grade records are counted
once, not once for every grade membership.

The next [CG-4–6 batch](ncert-cg4-6-catalogue-2026-11-09.md) is a **dependent,
unmerged proposal** based on `3d9d6b4` (167 source positions). It adds 34 positions
to reach 201 in this branch. Downstream publication applies the accepted
167-position dependency before this separate 34-row batch; repository acceptance
does not require that private deployment first. These counts do not describe an
already-applied database revision.

The [Arts/Learning Habits/Cognitive extension](ncert-cg12-13-7-catalogue-2026-11-09.md)
adds another 59 verified positions after that milestone. The current dependent
branch therefore has **260 positions**, or **93 additions above the 167-position
dependency**, within a 128-row publication batch. The source-position count still
does not certify distinct skills, full source coverage, or a published revision.

## Target and completion boundary

Build an edition-aware **NCERT national baseline for Grades 1–5**, covering every
curricular area in the selected official documents. Keep a separate, explicit
preschool/Balvatika scope if it is included; do not imply its completion from
Grades 1–2. State/UT curricula, other boards and local adaptations are separate
sources, not automatic consequences of cataloguing NCERT.

NCERT identifies Grades 1–2 with the later Foundational Stage, Grades 3–5 with
Preparatory, and Grades 6–8 with Middle. Its [stage overview](https://neec.ncert.gov.in/en/about/)
gives ages 6–8, 8–11 and 11–14 respectively. Grade 6 therefore remains outside
this primary catalogue plan even though some children there are under 12.

Completion requires a source/edition and grade/area disposition for every target
cell, a verified inventory of the source-defined standards and record kinds, explicit
exclusions and preserved source hierarchy. Formal stage goals and competencies
are valid catalogue records: where NCERT leaves grade-level outcomes to teachers,
completion must not invent an exhaustive national grade-outcome list. Illustrative
outcomes, activities and textbook contents remain separately classified. A stage
competency inventory does not assert that all later grade-level publications have
been captured.
Counts not yet independently reconciled remain unknown rather than guessed.

## Formal standards and contextualisable outcomes

The 2025 foundational publication's introduction (PDF page 5, printed page 3)
distinguishes stage competencies from contextualisable, suggestive outcomes.
The catalogue retains the published outcome positions faithfully; it does not
turn them into an exhaustive mandatory national grade checklist. A complete
selected formal primary baseline must separately account for the actual
Foundational and Preparatory stage goals/competencies, including their stated
conditions. Grade-specific examples are classified without inventing additional
requirements or treating every example as a new assessable skill.

## Verified source already in hand

The official [2025 foundational outcomes document](https://ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf)
is a 72-page PDF, SHA-256
`484d5c18d9beeb1d79c4bee8589f6cb2b2ef42bdeb255b8f51e1eae8ac953eb2`.
The [July 2025 CBSE release notice](https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf)
identifies the publication. Its local pinned bytes, introductory scope, table
boundaries and representative page layouts were inspected for this inventory.
PDF page numbers below count the cover; printed pages are two lower.

Extend the existing document-level slug `ncert-fs-2025`. Do not create separate
curriculum identities for each subject or repeat its 67 Maths records under a new
slug. The source introduction describes an integrated early-years approach;
its areas need not be turned into separate taxonomy subject trees.

| Source section | PDF pages | Grades/stage shown | Accepted catalogue status | Next ingestion work |
| --- | --- | --- | --- | --- |
| Physical/motor, CG-1–3 | 6–12 | Balvatika and Grades 1–2; some combined grade cells | 66 source positions intersecting Grades 1–2 proposed; not yet accepted/deployed | Verified shared-band IDs and literal parent labels are recorded in the Physical/Motor report; other Balvatika cells remain excluded. |
| Socio-emotional/ethical, work/service and environmental regard, CG-4–6 | 13–16 | Balvatika and Grades 1–2 | 34 source positions intersecting Grades 1–2 proposed in dependent batch; not accepted/deployed | Verified shared-band and unbulleted-cell dispositions are recorded in the CG-4–6 report; other Balvatika cells excluded. |
| Arts/cultural, CG-12 | 17–21 | Balvatika and Grades 1–2 | 30 Grade 1–2 positions proposed in dependent extension; not accepted/deployed | Source continuations are verified; later activity syllabus remains separate. |
| Learning habits, CG-13 | 21–23 | Balvatika and Grades 1–2 | 18 Grade 1–2 positions proposed in dependent extension; not accepted/deployed | Literal source wording and distinct printed grade cells preserved. |
| Observation/reasoning, CG-7 | 24–25 | Balvatika and Grades 1–2 | 11 positions intersecting Grades 1–2 proposed; not accepted/deployed | One joint G1–2 position and six shared B3/G1/G2 positions counted once; CG-8 boundary excluded. |
| Maths, CG-8 | 25–34 | Balvatika and Grades 1–2 | **67 Grade 1–2 outcomes present: 34 + 33** | Preserve accepted IDs; any Balvatika expansion is a separately labelled scope. |
| Language/literacy section in Hindi | 35–43 | Balvatika and Grades 1–2; includes R1/R2 roles | Not ingested | Verify target language and role per cell; the language of the document is not itself the target language. |
| Urdu outcomes section | 44–48 | Grades 1–2 | Not ingested | Verify right-to-left column order, script and relation to other language sections. |
| Explicit English L2 section, CG-9/11 | 49–52 | Balvatika and Grades 1–2, including N/A entries | 34 Grade 1–2 positions proposed; not yet accepted/deployed | Verified N/A/example/repetition dispositions are recorded in the English report; Balvatika remains excluded. |
| Environmental-studies syllabus | 53–62 | Balvatika and Grades 1–2 | Not ingested | Type content/syllabus and competency references separately; do not emit each content phrase as a learning outcome. |
| Arts syllabus and suggested activities | 63–69 | Shared Foundational outcome column; activities show Balvatika / Grades 1–2 | 56 explicit outcome positions proposed; source total 316 | Suggested activities excluded; shared stage scope retained without a required grade band. See the [appendix report](ncert-foundational-arts-syllabus-catalogue-2026-11-09.md). |
| Teaching-material references | 70 | Foundational | Reference material | Source links, not an extra standards catalogue. |

These page ranges overlap where a section changes mid-page. They are not additive
record counts. Apart from the accepted Maths slice, expectation totals are not
certified by this inventory. Language sections must be compared before deciding
which are distinct language targets, translated descriptions, or shared framework
references; neither blindly duplicating nor automatically collapsing them is safe.

## Preparatory Stage and edition reconciliation

Grades 3–5 remain entirely missing from the accepted NCERT catalogue, across
languages, Maths, the integrated natural/social environment area, arts and
physical education/well-being. These areas follow NCERT's description of the
Preparatory Stage; see the [current PARAKH explanation](https://parakh.ncert.gov.in/blog/curiosity-competency-parakh-preparatory-stage).
Do not silently substitute separate science and history curricula where the
selected source uses an integrated area.

| Target grade | Language R1 | Language R2 | Maths | Integrated environment area | Arts | Physical education/well-being |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | Missing | Missing | Missing | Missing | Missing | Missing |
| 4 | Missing | Missing | Missing | Missing | Missing | Missing |
| 5 | Missing | Missing | Missing | Missing | Missing | Missing |

Here **Missing** means no accepted catalogue records for the target cell. It does
not mean NCERT lacks the curriculum, that a taxonomy topic is missing, or that
source discovery is complete. The two language roles do not imply that every
school uses the same language pair. Formal framework standards use language roles,
not an invented national language pair. One verified stage record can apply to
Grades 3–5 together; the matrix does not require three cloned records.

| Candidate source | Edition/role | Current evidence | Disposition before ingestion |
| --- | --- | --- | --- |
| [NCF for Foundational Stage](https://www.ncert.nic.in/pdf/NCF_for_Foundational_Stage_20_October_2022.pdf) | 2022 framework | Official source identified; 2025 outcome source already pinned separately | Retain goals/competencies as hierarchy; distinguish illustrative outcomes from the later outcome publication. |
| [NCF for School Education](https://ncert.nic.in/pdf/NCFSE-2023-August_2023.pdf) | Framework title 2023; printed First Edition October 2024, ISBN 978-93-5292-741-8 | Official bytes captured: 580 pages, 47,030,865 bytes; SHA-256 `0e2c5a1ddb48f758a5e9f867258da40d57f9f236b37fc7f8022261973425f099` | New document identity `ncert-ncfse-2023-ed2024`; inventory formal Preparatory goals/competencies separately from illustrative examples. The old URL filename does not identify the downloaded printed edition. |
| [Learning Outcomes at the Elementary Stage](https://ncert.nic.in/pdf/publication/otherpublications/tilops101.pdf) | 2017 legacy outcome publication, Grades 1–8 | Official bytes captured: 128 pages, 16,481,419 bytes; printed First Edition April 2017, ISBN 978-93-5007-785-6; SHA-256 `18024190d8d8a7b0516bf6bcab14dc209f4751b91acb0b0c952e2c27b4ac3317` | Catalogue only with its legacy edition explicit; reconcile against current framework/syllabi before deciding whether Grades 3–5 entries are the intended baseline. Exclude Grades 6–8 from this plan. |
| Current Grades 3–5 syllabi and textbook-linked outcome documents | Publication/edition must be pinned individually | The [Ministry's August 2026 response](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2297094&lang=1&reg=48) confirms newer syllabi/textbooks and follow-up outcome documents; it is not itself the outcome catalogue | Locate the actual official standards-bearing documents for each area/grade, verify edition/status and capture bytes. A new textbook announcement is insufficient evidence of an exhaustive outcome list. |
| [Grade 3 UPAAN transition guidance](https://ncert.nic.in/pdf/programmes/upaan/UPAAN_Grade_3.pdf) | Transition/implementation guidance | Official candidate URL located; bytes not captured | Use for source discovery and implementation context; do not count a bridge activity as a new mandatory expectation. |

Initial NCERT downloads encountered certificate-chain and connection errors. A
complete chain validated against the trusted system roots enabled verified TLS
retrieval of the official framework and legacy publication above; hostname and
certificate checks remained enabled. Their source identities are now byte-pinned.
The 2017 publication remains legacy and does not silently fill current-source gaps.

The official CBSE [Preparatory HPC manual](https://cbseacademic.nic.in/web_material/Manuals/HPC_PreparatoryManual25.pdf)
(76 pages; printed First Edition December 2024; ISBN 978-81-983130-9-6; SHA-256
`f416ab6e9440e7c2fee3442c5f53a34fa486ee4212c564ae3308065986921d64`)
and [report template](https://cbseacademic.nic.in/web_material/Manuals/HPC_PreparatoryReport25.pdf)
(30 pages; SHA-256 `80b26cf1934a2f415b31bfcde563716fc916f618bcac61d5b43f75413e3362a9`)
are captured implementation references. The manual's sample and blank outcome
worksheets are not an exhaustive mandatory grade-level catalogue. A CBSE adaptation
is not presented as the original NCERT framework.

### Selected framework inventory in progress

The selected formal Preparatory sections are language R1 (PDF 236–237), language
R2 (239–240), Maths (267–268), Arts (354–357), The World Around Us (382–384)
and Physical Education (416–417). Adjacent Middle Stage material is excluded even
where a page is shared. The [core-area proposal](ncert-ncfse-preparatory-core-catalogue-2026-11-09.md)
and [Arts/PE extension](ncert-ncfse-preparatory-arts-pe-catalogue-2026-11-09.md)
now independently verify **172 formal source positions**: 45 goals and 127 stage
competencies. These are dependent Git proposals, not an applied DB revision.
This completes the selected framework tables while keeping the wider catalogue
completion conditions below explicit.

The proposed record model keeps one Grades 3–5 band per formal record, distinguishes
`curricularGoal` from `stageCompetency`, and retains each literal printed CG/C code.
Generated qualified identifiers include stage, area, kind, and the source's nested
standard set and artform where codes reset. Arts and Physical Education LS1/LS2
represent the framework's resource/applicability conditions, not taxonomy difficulty
levels. Physical Education LS1 begins with printed CG-3: absent CG-1/2 are not invented.
A factual public index records these distinctions and source pages without outcome
wording; private records preserve descriptions. The strict code-only catalogue
schema stays unchanged. The index is review evidence, not an alternate taxonomy graph.

Prepare coherent batches within the downstream adapter's 128-new-record bound: first
language R1/R2, Maths and The World Around Us; then Arts and Physical Education.
Only verified rows enter a proposal. This selected framework inventory does not
complete the outstanding foundational languages, mixed syllabus sections or
edition reconciliation with later grade-specific publications.

## Record model and extraction hazards

Maintain separate record kinds for curricular goals, stage competencies,
grade-level outcomes, syllabus content and suggested activities. The current
public catalogue can hold permitted identifiers/source metadata, while richer
hierarchy and restricted wording remain private. If a required distinction is
unsupported by an ingestion adapter, extend the adapter explicitly rather than
flattening every row into an expectation.

The source has several layouts, so the existing CG-8 Maths parser is not a
whole-document parser:

- Grade columns can be merged horizontally, including a single cell applying to
  both Grades 1 and 2. Preserve that source span; do not invent separate wording
  or claim that two emitted grade records are two distinct outcomes.
- Physical tables use printed sequential competency labels that differ from the
  later dotted reference form. Preserve literal source labels and record any
  reviewed correspondence; do not infer one solely from sequence.
- Hindi text extraction has split glyphs; Urdu is right-to-left and has a different
  column layout. Script-aware readback and layout inspection are required.
- The English L2 table has N/A cells, a competency label outside the detected
  table-cell boundary, page continuations, an example with its own bullet marker,
  and repeated blending wording within the same grade/competency. Record these
  source dispositions explicitly before allocating final IDs.
- Later environmental and arts tables mix content, activities, competencies and
  outcome references. They are not an invitation to multiply the outcome count.

Generated outcome IDs must be labelled as source-position references, retain the
source edition, grade band, language role where relevant, parent label and ordinal,
and avoid collisions across sections. Existing Maths IDs remain unchanged. An
item without a source code must not be advertised as having an official NCERT
outcome code. Compare extracted wording and boundaries independently against
Poppler/readback and representative rendered pages; a plausible total is not
verification.

## Phased completion plan

1. **Inventory and pin:** maintain this matrix, capture the published 2023 framework
   and current Preparatory outcome/syllabus sources, and resolve legacy/current
   source relationships. Keep unresolved grade/area cells visible.
2. **Complete the available foundational source:** prepare verified batches for
   the un-ingested Grades 1–2 areas above, extending `ncert-fs-2025`. Use a
   source-shape-specific parser and a separate readback. Keep Balvatika explicitly
   included or deferred and preserve N/A and shared-grade dispositions.
3. **Complete Preparatory Grades 3–5:** ingest the selected current sources area by
   area; keep language role/script, integrated subjects and stage competencies
   explicit. A legacy source can coexist under its own edition, with a documented
   relationship; it cannot silently fill a current-source gap.
4. **Reconcile the complete catalogue:** verify every source row has a disposition,
   check hierarchy/code uniqueness, record counts per grade/area and exclusions,
   and retain source hashes and extraction evidence privately. Only then describe
   the selected NCERT baseline as complete.
5. **Begin taxonomy alignment:** evaluate existing shared mastery claims against
   the verified catalogue. Catalogue completion does not pre-authorize new topics,
   and none are proposed by this inventory.

Public changes contain only permitted identifiers, official links, factual source
metadata and original review notes under the existing [publication policy](../PROVENANCE.md).
Private PDFs, wording, extraction cells and operational checkpoints are not PR
inputs. Catalogue batches follow ordinary repository review, with downstream
publication handled separately. This report itself performs no ingestion or
application write.
