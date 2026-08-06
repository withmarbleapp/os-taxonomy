# Changelog

All notable changes to the Marble Skill Taxonomy dataset are documented here.
Dataset releases are versioned independently of the taxonomy `version` field
(the underlying taxonomy is `v1`).

## [Unreleased]

### Added
- **France — `fr-programmes-2026`** (community contribution): the French programmes d'enseignement for cycles 1–3 (école maternelle → CM2/6e) as a full-text curriculum source — 3,179 standards extracted from the texts in force for the 2026-2027 school year (BO 2020–2026), under Licence Ouverte / Open Licence Etalab 2.0. 2,446 topic↔standard links added from existing micro-topics to the French standards. See [PROVENANCE.md](PROVENANCE.md).
- **`Français` subject** (community contribution): a native French-as-first-language literacy track — 252 micro-topics across 9 domains (Langage oral, Décodage & lecture de mots, Compréhension de l'écrit, Culture littéraire, Écriture & graphisme, Rédaction, Grammaire & conjugaison, Orthographe, Vocabulaire & lexique), with 500+ new prerequisite edges, distilled from the French standards.
- **French history & civics topics** (community contribution): 54 History topics in two new domains (French History: Origins to Revolution / Revolution to Today) and 26 Personal & Social Development topics (Citizenship & la République), reusing existing shared-period topics (Rome, Greece, world wars) rather than duplicating them.
- **`data/crosswalks.json`** (new file + schema + validator support): 139 cross-language skill links (`same-skill-different-language`) pairing Français ↔ English literacy topics, each tagged `transfer: high|partial` — language-agnostic skills (comprehension strategies, composition, oral discourse) vs skills that accelerate but must be relearned (decoding, morphology).
- 41 new parent-friendly domain clusters for the new domains.

### Note
- `centrality` for newly-authored topics is approximated (normalized descendant count over the merged graph) pending canonical recomputation by Marble's pipeline.

## [1.0.0] — 2026-07-08

Initial public release.

### Included
- **1,590 micro-topics** across 8 subjects (`data/topics.json`).
- **3,221 prerequisite dependencies** with `hard`/`soft` strength + reasons (`data/dependencies.json`).
- **7 curricula / 3,261 standards** with 1,859 topic↔standard links (`data/curriculum-standards.json`).
- **183 domain clusters** (`data/clusters.json`).
- JSON Schemas + a dependency-free validator.

### Curriculum text shipped
- **Full text:** UK National Curriculum (OGL v3.0), Common Core ELA + Math (CCSS Public License).
- **Codes only** (verbatim text omitted pending rights clearance): NGSS K-5 + Middle School, C3 Framework, IB PYP PSPE. See [PROVENANCE.md](PROVENANCE.md).

### Excluded
- Semantic embeddings (derived / recomputable).
- All per-child and user data (never published).
