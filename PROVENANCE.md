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
- **Coverage:** catalogue ingestion does not establish taxonomy coverage. Focused authoring passes cover Grades 1–4 Mathematics; the rest of the Ontario catalogue is available for subsequent mapping.

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
