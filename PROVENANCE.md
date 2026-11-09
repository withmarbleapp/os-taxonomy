# Provenance & third-party licensing

The micro-topics, the prerequisite graph, and all of Marble's authored text are original work, released under ODbL 1.0 + CC BY-SA 4.0 (see [README](README.md#license)).

**`data/curriculum-standards.json` is different.** Those standards are extracted from external curriculum frameworks that Marble does **not** own and **cannot** relicense. You can only receive from us the rights the upstream holders grant. Each source's terms — and exactly what we ship — are below.


## The "codes-only" distinction

For encumbered sources we ship only the **standard code** (e.g. `1-ESS1-1`) and its key — a short **factual identifier**, low copyright risk — and we **omit the verbatim standard text** (`description`, `clarificationStatement`, etc.). The topic→standard *links* in `topics.json` are unaffected, so "this topic maps to standard X" is preserved throughout. Sources marked `textIncluded: false` in `curriculum-standards.json` are codes-only.

## Per-source terms

### 🟢 `uk-nc-2013` — The National Curriculum in England (KS1–2) — **full text**
- **Publisher / rights:** UK Department for Education. © Crown copyright.
- **License:** [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). Permits commercial use, adaptation, and redistribution. **No share-alike.**
- **Required notice:** *"Contains public sector information licensed under the Open Government Licence v3.0."*
- **We ship:** full standard text.

### 🟢 `acara-v9` — Australian Curriculum, Version 9 (Foundation–Year 6) — **full text**
- **Publisher / rights:** © Australian Curriculum, Assessment and Reporting Authority (ACARA) 2009 to present, unless otherwise indicated.
- **License:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), under [ACARA's copyright and reuse terms](https://www.acara.edu.au/contact-us/copyright).
- **We ship:** 620 content descriptions across English, Mathematics, Science, HASS, Health and Physical Education, Digital Technologies, and Design and Technologies. This contribution excludes Arts, Languages, elaborations and achievement standards.
- **Source and verification:** based on 614 records contributed by [curiousape-ai in PR #7](https://github.com/withmarbleapp/os-taxonomy/pull/7), using the [reproducible ACARA DOCX parser](https://github.com/curiousape-ai/acara-v9-f6-json). On 20 October 2026, a check of every row in ACARA's seven official curriculum-content DOCX downloads corrected five Foundation Science inquiry strands and recovered six omitted standards (five Year 4 HASS skills and one Foundation Design and Technologies standard), giving 620 records. Codes, descriptions, subjects, learning areas, strands and year levels were verified before import into Marble and export here. The DOCX strand heading for `AC9TDEFP01` is blank; its classification as Processes and production skills is an explicit override confirmed against the [published Scootle curriculum record](https://www.scootle.edu.au/ec/search?accContentId=AC9TDEFP01). Marble retains the input JSON, source-document URLs and SHA-256 hashes alongside the import script. The export adds agent-compatible subject, title and taxonomy fields while retaining the source fields. No candidate topic alignments are included.

**ACARA attribution notice:** © Australian Curriculum, Assessment and Reporting Authority (ACARA) 2009 to present, unless otherwise indicated. This material was downloaded from the ACARA website (https://www.australiancurriculum.edu.au/) (accessed 20 October 2026) and was modified only to normalize whitespace and render equation fractions as text. The material is licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). ACARA does not endorse any product that uses ACARA material or make any representations as to the quality of such products. Any product that uses material published on this website should not be taken to be affiliated with ACARA or have the sponsorship or approval of ACARA. It is up to each person to make their own assessment of the product.

### Ontario elementary documents — codes and source links only

- **Publisher:** Ontario Ministry of Education / King’s Printer for Ontario. Official English-language elementary source documents, Kindergarten through Grade 8.
- **Source snapshot:** 22 October 2026; nine documents, 77 courses, 3,862 expectations (805 overall and 3,057 specific). Source API responses, hashes and the normalizer are retained with the private import tooling. The staging catalogue preserves official wording and source metadata.
- **What this export includes:** expectation identifiers, topic–expectation associations and links to the official documents. Verbatim expectation payloads are omitted under this export’s conservative publication policy. This omission is not a claim that all Ontario material is legally prohibited from redistribution, or that Marble grants rights to the official text; consult the applicable upstream terms.
- **Identifiers:** codes include document, edition, grade and program where needed. Native Languages has unnumbered expectations; its identifiers are generated source-position references, not invented official expectation codes.
- **Coverage:** catalogue ingestion does not establish taxonomy coverage. Focused authoring passes cover Grades 1–7 Mathematics; the rest of the Ontario catalogue is available for subsequent mapping.

| Export source | Official document | Edition | Expectations |
|---|---|---:|---:|
| `the-ontario-curriculum-french-as-a-second-langua` | [The Ontario Curriculum: French as a Second Language, 2013](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-fsl) | 2013 | 892 |
| `the-ontario-curriculum-health-and-physical-educa` | [The Ontario Curriculum: Health and Physical Education, 2019](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-health-and-physical-education) | 2019 | 355 |
| `the-ontario-curriculum-kindergarten-2026` | [The Ontario Curriculum: Kindergarten, 2026](https://www.dcp.edu.gov.on.ca/en/curriculum/kindergarten) | 2026 | 127 |
| `the-ontario-curriculum-language-2023` | [The Ontario Curriculum: Language, 2023](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language) | 2023 | 576 |
| `the-ontario-curriculum-mathematics-2020` | [The Ontario Curriculum: Mathematics, 2020](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics) | 2020 | 465 |
| `the-ontario-curriculum-native-languages-2001` | [The Ontario Curriculum: Native Languages, 2001](https://www.dcp.edu.gov.on.ca/en/curriculum/ele-indigenous-languages) | 2001 | 181 |
| `the-ontario-curriculum-science-and-technology-20` | [The Ontario Curriculum: Science and Technology, 2022](https://www.dcp.edu.gov.on.ca/en/curriculum/science-technology) | 2022 | 449 |
| `the-ontario-curriculum-social-studies-history-an` | [The Ontario Curriculum: Social Studies, History, and Geography, 2026](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-sshg) | 2026 | 417 |
| `the-ontario-curriculum-the-arts-2009` | [The Ontario Curriculum: The Arts, 2009](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-arts) | 2009 | 400 |

### 🟡 `ccss-ela`, `ccss-math` — Common Core State Standards — **full text**
- **Publisher / rights:** © 2010 National Governors Association Center for Best Practices (NGA Center) and Council of Chief State School Officers (CCSSO).
- **License:** the CCSS Public License grants *"a limited, non-exclusive, royalty-free license to copy, publish, distribute, and display the Common Core State Standards **for purposes that support the Common Core State Standards Initiative**."* This is **purpose-limited**, and it does **not** clearly grant derivative-work or sublicensing rights — so the CCSS-derived records remain under the CCSS Public License, **not** ODbL.
- **Required notice:** *"© Copyright 2010 National Governors Association Center for Best Practices and Council of Chief State School Officers."*
- **We ship:** full standard text, under the CCSS Public License.

### 🔴 `ngss-k5`, `ngss-ms` — Next Generation Science Standards — **codes only**
- **Publisher / rights:** copyright held by the National Academies Press. *"NGSS"* and *"Next Generation Science Standards"* are **registered trademarks of WestEd**.
- **License:** non-commercial entities may freely copy/adapt. **Commercial** entities may use the standards only with restrictions — including submitting samples for approval and a mandatory trademark disclaimer. Not relicensable under ODbL.
- **Required notice (if referencing NGSS):** *"NGSS is a registered trademark of WestEd. Neither WestEd nor the lead states and partners that developed the Next Generation Science Standards were involved in the production of this product, and do not endorse it."*
- **We ship:** codes/keys only (verbatim text omitted). To include full NGSS text, obtain WestEd clearance first.

### 🔴 `c3-social-studies` — C3 Framework for Social Studies — **codes only**
- **Publisher / rights:** © National Council for the Social Studies (NCSS).
- **License:** permission-based; redistribution of the framework text requires NCSS permission.
- **We ship:** codes/keys only. Obtain NCSS permission before shipping full text.

### 🔴 `ib-pyp-pspe` — IB PYP Personal, Social & Physical Education Scope & Sequence — **codes only**
- **Publisher / rights:** © International Baccalaureate Organization (IBO).
- **License:** IB content is copyrighted and IBO is protective of it; redistribution requires explicit IB permission. This is the most restrictive source.
- **We ship:** codes/keys only. Do not ship full text without IB permission.

## Teaching-research publication

`data/teaching-research.json` contains Marble's agent-authored teaching research
and activity proposals under the database/content licences described in README.
References to third-party studies, books and curricula do not transfer ownership
of those works or replace their upstream terms. The licences cover Marble's own
contributions, not third-party material.

The original research sometimes repeated the wording of codes-only curricula.
The publication export omits passages matching eight or more consecutive words
of those frameworks' stored text, ignoring case and punctuation. Each omission
is marked inline with curriculum codes and logged by JSON path in
`publicationNotes.omittedCurriculumText`. The same transformation is applied to
citation claims and activity sourceClaims to keep those links exact. Common Core
cross-references embedded in NGSS records are not included in the omission index;
they retain the independent Common Core terms described above.

This mechanical pass is conservative and is not comprehensive rights clearance.
Shorter excerpts or paraphrases may remain. Follow the upstream links and terms
when reusing source material; do not treat the research layer as a redistribution
of the full frameworks. The existing NGSS trademark notice above also applies
to NGSS references in teaching research.

Original source verification flags and confidence values were preserved in the
initial publication, without re-fetching sources. Later nutrition corrections
record specific healthy-eating-guide checks in the affected research records.
A curriculum citation is evidence of alignment rather than an evaluated teaching
intervention. Read the file-level notes and individual learning-guidance review
notes before using an activity.

## Changing what ships

The export tool takes a per-source switch. To (re)include a source's full text after clearing rights, regenerate with that slug removed from the codes-only set:

```bash
# ship everything verbatim
DATABASE_URL=… node exportTaxonomy.mjs --codes-only=
# default (encumbered sources codes-only)
DATABASE_URL=… node exportTaxonomy.mjs
```

### NCERT foundational learning outcomes — identifiers and source links only

- **Publisher:** National Council of Educational Research and Training (NCERT), India.
- **Document:** [Learning Outcomes at the Foundational Stage](https://ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf), 2025. Its release is referenced by [CBSE circular Acad-48/2025, 28 July 2025](https://cbseacademic.nic.in/web_material/Circulars/2025/48_Circular_2025.pdf).
- **Source status:** the introductory explanation on PDF page 5 (printed page 3) presents the learning outcomes as contextualisable suggestions and stage competencies as the attainment reference. These catalogue counts preserve printed source positions; they do not establish an exhaustive mandatory national grade-level checklist. Official publication, illustrative outcomes and formal stage standards are distinct classifications.
- **Accepted outcome-table scope:** 260 printed source positions: 67 Mathematics (CG-8), 34 English L2 (CG-9/11), 66 Physical/Motor (CG-1–3), 34 Socio-emotional/Ethical (CG-4–6), 30 Arts (CG-12), 18 Learning Habits (CG-13), and 11 Cognitive (CG-7). Selected cells intersect Grades 1–2; shared cells are counted once and repeated printed wording remains explicit. These are source positions, not distinct skills or grade memberships. PR #95 accepted the 93-row extension above the 167 positions accepted through PR #94. These 260 positions are preserved from main `6e29182`; neither whole-catalogue completeness nor downstream deployment is implied. Other Balvatika cells, Grades 3 onward, remaining language/syllabus sections and topic alignments are excluded. The document-level slug `ncert-fs-2025` is extended without replacing prior identifiers. See the [catalogue completion scope](reports/ncert-primary-catalogue-scope-2026-11-09.md).
- **Pinned document and original Maths selection:** official PDF retrieved 9 November 2026, SHA-256 `484d5c18d9beeb1d79c4bee8589f6cb2b2ef42bdeb255b8f51e1eae8ac953eb2`. The original Maths selection occupies PDF pages 25–34, printed pages 23–32; later batches use their separately documented ranges in the same pinned PDF. A school-hosted copy has different bytes and was not used as the source. The official download's incomplete certificate chain was supplemented from the CA's published, root-verified chain; TLS and hostname verification remained enabled.
- **Identifiers:** NCERT supplies competency codes such as C-8.1 but does not number these individual outcome bullets. IDs such as `IN-NCERT-FS-2025-MATH-G1-C8.1-LO01` are generated source-position references: document/edition, subject, grade, official parent competency and the one-based bullet ordinal within that competency and grade. They are not claimed to be official NCERT learning-outcome codes. Page continuations remain part of the original bullet, not additional records. Measurement subheadings and source wording are retained privately.
- **English L2 identifiers and dispositions:** `IN-NCERT-FS-2025-EN-L2-G1-C9.1-LO01` follows the same generated-position convention, with `EN-L2` identifying the explicit English second-language section. PDF pages 49–52 (printed 47–50) were checked. Four Grade 1/2 N/A cells under C-9.2 and C-11.2 create no outcomes. A separately bulleted example under Grade 2 C-9.4 is attached to its preceding outcome, not counted separately. Grade 1 C-11.1 positions `LO02` and `LO06` remain distinct source-position identifiers with their repetition documented; this does not create two mastery claims. Source wording and example text remain private. The [English catalogue report](reports/ncert-english-l2-catalogue-2026-11-09.md) records counts and verification.
- **Publication:** only these factual identifiers and source metadata are included; no verbatim outcome text is redistributed. NCERT retains rights in the original material. Original Maths private catalogue SHA-256 `9bba4851e8003ac9c1e7380a801e7745adffebb8f33d0d6b2ff5029349525096`. The parser checks the official PDF checksum, and independent Poppler extraction verified all 39 selected table-cell fragments, covering 24 competency/grade groups. The relevant source pages were visually inspected. Private wording, PDF bytes and database identities are not repository inputs for contributors.
- **English verification:** the additional private batch SHA-256 is `48cbc6225589a22df948e5ce6d17264196399fb84fadd2368fd07a156d256c0e`. Independent Poppler readback matched all 15 selected cell fragments and separately reconstructed all 34 outcome positions, checking IDs, grade, parent, ordinal, pages, wording and attached example. Six corrupted-record checks failed as expected. All four source pages were visually inspected. The private artifact contains exactly the 34 additions and binds the complete 101-position public source; it is not a public repository input or a publication receipt.
- **Physical/Motor identifiers:** `IN-NCERT-FS-2025-PM-G1-G2-C1-LO01` identifies one position in a shared Grades 1–2 cell, not two outcomes. The `PM` area, literal source-band tokens (`G1`, `G2`, `G1-G2`, or `B3-G1`), printed parent label and ordinal prevent collisions. Eleven printed labels across CG-1–3 are retained literally; a dotted framework alias is not guessed. Of 66 positions, 41 apply jointly to Grades 1–2, 11 to Grade 1 alone, 12 to Grade 2 alone, and two to a shared Balvatika 3/Grade 1 band. These produce 54 Grade 1 and 53 Grade 2 memberships; 107 memberships are not 107 outcomes. Other Balvatika cells are not ingested.
- **Physical/Motor verification and combined batch:** all 66 positions were independently reconstructed from Poppler across 18 cell fragments on PDF pages 6–12 (printed 4–10), including grade bands, parents, ordinals, pages and wording. Six corruptions were rejected and all seven pages visually inspected. The 66-row private addition artifact is SHA-256 `1d80181d305eb239b1d0b54f1f174a767cd8cec8904f527720d483ca96bb2d77`. For publication from the original 67-position baseline to this 167-position proposal, the combined **100-row** English/Physical artifact is SHA-256 `2bb0af464b4423130618592027ac0399892d08c0ce457fe3bc677dde9ab9fd95`; it binds the final public source and contains no pre-existing Maths rows as additions. See the [Physical/Motor report](reports/ncert-physical-motor-catalogue-2026-11-09.md). No deployment is performed by these repository changes.
- **CG-4–6 dependent batch:** 34 additional positions on PDF pages 13–16 (printed 11–14) preserve nine printed parent labels. `IN-NCERT-FS-2025-SE-G1-G2-C4.1-LO01` uses the same generated source-band convention; `SE` identifies the source domain without creating taxonomy topics. Sixteen joint-grade positions plus eight Grade 1-only and ten Grade 2-only positions produce 24 and 26 grade memberships. The unbulleted C-4.1 cell is one outcome, not omitted or split. Independent Poppler reconstruction checked all 34 records across 14 fragments, eight corruptions were rejected and all four pages visually inspected. The private artifact SHA-256 is `d6e585815ddcddcc759dfe2dce8300e31d96aab0ea027cc488424e2be79b3eaf`; its 34 rows bind the 201-position source against the **167-position dependency**, not the original Maths-only baseline. See the [batch report](reports/ncert-cg4-6-catalogue-2026-11-09.md).
- **Arts, Learning Habits and Cognitive extension:** 59 additional positions on PDF pages 17–25 (printed 15–23) use `ART`, `LH` and `COG` source-area tokens, literal source bands, printed parents and ordinals. Of these, 52 occupy separate Grade 1/2 cells, one occupies a joint Grades 1–2 cell, and six retain a shared Balvatika 3/Grades 1–2 band. The latter six are counted once. Examples continued across pages remain part of their original outcome, page-24 headers are excluded, and the CG-8 boundary on page 25 prevents re-ingestion of existing Maths. All 59 positions were independently reconstructed across 29 fragments; eight corruptions were rejected and all nine pages visually inspected. The 59-row private artifact SHA-256 is `a137e3225050ec6f0c0c4f8e8e23b643368cd6e150aafa5d1aa5b790a6ba85b3`. The combined **93-row** artifact for the 167-to-260 extension is SHA-256 `7deb26be7b367e651bac7049c73b6910aef43f2b57b2bfca1c3815937defcfd4`; it combines this extension with CG-4–6 and is within the existing batch limit. See the [extension report](reports/ncert-cg12-13-7-catalogue-2026-11-09.md).

- **Foundational Arts syllabus explicit outcome column:** 56 additional source positions on PDF 63–69 (printed 61–67) extend `ncert-fs-2025` from 260 to 316. The appendix's explicit learning-outcome column is distinct from suggested grade-column activities; only the former is included. Generated `ART-SYL-FS` identifiers preserve literal single/multi-parent blocks and ordinals. Shared Foundational table scope is retained without an invented required grade band; a selected Grades 1–2 view does not establish a per-grade obligation. Source-goal overlap references are not equivalence or topic-coverage claims. All 56 records independently reconstructed across 11 fragments, nine corruptions rejected, all seven pages visually inspected. Private 56-row artifact SHA-256 `22880444add7f75982cebebc78487fa01e42afa2d9c84354564711dd38563f61`. See the [batch report](reports/ncert-foundational-arts-syllabus-catalogue-2026-11-09.md) and [factual index](reports/ncert-foundational-arts-syllabus-index-2026-11-09.json).

### NCERT NCF-SE 2023 — October 2024 printed edition

- **Publisher:** National Council of Educational Research and Training (NCERT), India.
- **Source:** [National Curriculum Framework for School Education 2023](https://ncert.nic.in/pdf/NCFSE-2023-August_2023.pdf), printed First Edition October 2024 (PDF page 4), ISBN 978-93-5292-741-8. The URL filename is not the edition of the captured bytes. SHA-256 `0e2c5a1ddb48f758a5e9f867258da40d57f9f236b37fc7f8022261973425f099`; 580 pages, 47,030,865 bytes.
- **Identity and scope:** document-level `ncert-ncfse-2023-ed2024`, country `IN`; 91 selected formal Preparatory records (21 curricular goals and 70 stage competencies), language R1/R2, Mathematics and The World Around Us. Each applies to Grades 3–5 together once. Arts/PE and adjacent stages are excluded from this batch; illustrative outcomes are not mandatory grade records.
- **Identifiers:** qualified generated IDs include document/edition, stage, area and kind, while the factual [record index](reports/ncert-ncfse-preparatory-core-index-2026-11-09.json) retains literal CG/C codes and parent/page metadata. Generated IDs are not advertised as official NCERT codes. The strict public catalogue remains codes/keys only; NCERT source wording and PDF bytes remain private under the existing publication policy.
- **Verification:** independent Poppler reconstruction checks all 91 records across 18 fragments, including exact kinds, parent codes, shared grade bands and source pages; eight corruptions rejected. All nine selected pages and the edition page visually inspected. Private 91-row preparation artifact SHA-256 `c13b6a2cc2112ef3c36a1c1a1ece5720c2dd34312e47ba8dbad72efdd04f281f`. The [batch report](reports/ncert-ncfse-preparatory-core-catalogue-2026-11-09.md) distinguishes selected-table completeness from remaining primary scope. No downstream publication or topic alignment is performed.

- **Proposed Arts/PE extension:** 81 additional records (24 goals and 57 competencies) on PDF 354–357 and 416–417 bring the selected formal Preparatory inventory to 172. IDs/index metadata qualify literal codes by LS1/LS2 and Arts subgroup. Resource availability, initial implementation and contextual Arts-choice conditions remain explicit; sets are not universal simultaneous requirements or taxonomy difficulty levels. PE LS1 literal CG-3–6 are preserved without invented missing goals. All 81 records independently reconstructed across 20 fragments, nine corruptions rejected, six table pages visually inspected. Private 81-row artifact SHA-256 `2b1a18a2e435dcce9a5c99cb5cebe3cc32fc8662615bd460a101eca7a5b49088` binds the final source against its 91-record dependency. The [Arts/PE report](reports/ncert-ncfse-preparatory-arts-pe-catalogue-2026-11-09.md) and [factual index](reports/ncert-ncfse-preparatory-arts-pe-index-2026-11-09.json) retain the selected-source completion boundary.

- **Formal Foundational extension:** 82 records (13 goals and 69 stage competencies) on PDF 212–216 (printed 198–202), section 1.4 Tables 1.1i–vi, extend the same October 2024 framework source from 172 to 254. `FOUNDATION` qualified IDs retain literal codes and parents, full ages 3–8 / Balvatika plus Grades 1–2 stage scope once, selected primary view separately and no invented per-grade deadline. CG-9 and C-9.1–9.7 retain the printed footnote's conditional L2 emergence at Foundational end / consolidation in early Preparatory. Formal stage standards are distinct from the 2025 publication's suggestive contextualisable outcomes; neither source is silently substituted for the other. All 82 records independently reconstructed across 14 fragments using word-boundary-preserving token comparison; eleven general corruptions and a conditional mutation on each of eight affected records rejected; all five table pages visually inspected. Private 82-row artifact SHA-256 `b480e30be1c9f435f3ab8ce311d3671582676e4b0bf927292ce83aeae09c05c4`. See the [batch report](reports/ncert-ncfse-foundational-catalogue-2026-11-09.md) and [factual index](reports/ncert-ncfse-foundational-index-2026-11-09.json).
