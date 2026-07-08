# Changelog

All notable changes to the Marble Skill Taxonomy dataset are documented here.
Dataset releases are versioned independently of the taxonomy `version` field
(the underlying taxonomy is `v1`).

## [Unreleased]

### Added
- 27 early-childhood precursor topics, including 26 English topics for ages 2-5 and one Learning to Learn shared-attention prerequisite.
- 66 prerequisite edges connecting toddler/preschool oral language, early grammar, narrative, print-awareness, and phonological-awareness precursors into the existing English graph.
- Codes-only Head Start ELOF source records for early-childhood alignment discussion.
- 5 age-2 English domain clusters.

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
