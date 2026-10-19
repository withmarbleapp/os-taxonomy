# Changelog

All notable changes to the Marble Skill Taxonomy dataset are documented here.
Dataset releases are versioned independently of the taxonomy `version` field
(the underlying taxonomy is `v1`).

## Unreleased — Explorer

- Turn Play into a child-friendly path through the taxonomy's existing Quick
  Assessments. Age- and subject-filtered challenges follow hard prerequisites.
- Offer English and Romanian prompts with optional browser read-aloud and
  transient responses that are not persisted.
- Let a grown-up confirm the existing evidence criteria; known concepts unlock
  their linked challenges in the learning path.
- Keep Graph and Logbook available and preserve existing browser profiles.
- Add a Woodpecker validation pipeline; no GitHub Actions workflow is required.

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
