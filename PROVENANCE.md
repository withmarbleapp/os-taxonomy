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

### 🟢 `fr-programmes-2026` — Programmes d'enseignement, France (cycles 1–3) — **full text**
- **Publisher / rights:** Ministère de l'Éducation nationale (France). The programmes are annexes to arrêtés published in the Bulletin officiel de l'éducation nationale (BOEN).
- **License:** the ministry publishes its content under the [Licence Ouverte / Open Licence (Etalab) 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/) unless stated otherwise (education.gouv.fr: *"Sauf mention contraire, tous les contenus de ce site sont sous licence etalab-2.0"*). Permits commercial use, adaptation, and redistribution with attribution. **No share-alike.**
- **Required notice:** *"Contient des informations publiques issues du ministère de l'Éducation nationale (Bulletin officiel de l'éducation nationale), sous Licence Ouverte 2.0."*
- **We ship:** full standard text (in French), from the texts in force for the 2026-2027 school year:
  - École maternelle (cycle 1), consolidated: BO n° 41 du 31 octobre 2024 (langage, premiers outils mathématiques) + BO n° 19 du 7 mai 2026 (other domains).
  - Français & mathématiques: cycle 2 BO n° 41 du 31 octobre 2024; cycle 3 BO n° 16 du 17 avril 2025.
  - Éducation physique et sportive & histoire-géographie (cycles 2–3): BO n° 22 du 28 mai 2026.
  - Sciences et technologie (cycles 2–3): BO n° 24 du 11 juin 2026.
  - Langues vivantes étrangères et régionales: cycle 2 BO n° 12 du 19 mars 2026; cours moyen (cycle 3) BO n° 22 du 29 mai 2025.
  - Enseignements artistiques (cycles 2–3): BO n° 31 du 30 juillet 2020.
  - Enseignement moral et civique (CP–6e extract): BO n° 24 du 13 juin 2024.
  - Éducation à la vie affective et relationnelle: BO n° 6 du 6 février 2025.
- **Notes:** (1) Like the UK National Curriculum, the French programmes define no official per-statement codes; the `C2.Fr.CP.Lect.3`-style codes are invented for this dataset. (2) France is mid-way through a rolling programme renewal: some 2026 texts apply first to CP/CM1 and reach the remaining classes by 2027-2028; this dataset ships the go-forward texts and omits superseded transitional programmes (e.g. *Questionner le monde*).

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

## Changing what ships

The export tool takes a per-source switch. To (re)include a source's full text after clearing rights, regenerate with that slug removed from the codes-only set:

```bash
# ship everything verbatim
DATABASE_URL=… node exportTaxonomy.mjs --codes-only=
# default (encumbered sources codes-only)
DATABASE_URL=… node exportTaxonomy.mjs
```
