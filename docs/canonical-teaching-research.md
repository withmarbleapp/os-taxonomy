# Canonical teaching research

Status: accepted contract, 16 November 2026. Source implementation is described
separately below; downstream activation still requires qualification. This refines
the research boundary in
[authoring and publication](taxonomy-authoring-and-publication.md).

The [v2 source migration and normalization tools](canonical-teaching-research-v2.md)
implement canonical public records. Private supporting material and historical
originals remain separate; downstream publication has not been activated.

## Decision

There is one accepted teaching record per topic. Community contributors and
agents edit that record in this repository; downstream applications publish the
same authored content. Private originals remain supporting evidence or historical
archives, not a second editable version of active pedagogy.

| Content | Authority and lifecycle |
| --- | --- |
| Pedagogy, learning activities, assessment guidance, confidence and public citations | Reviewed repository record |
| Original source documents, restricted extracts, working notes | Separate consumer-owned supporting material |
| Accepted commit, publication receipt, DB IDs and import timestamps | Consumer operational metadata |
| Superseded private teaching records | Preserved migration archive; never silently merged into active guidance |

A private addition that materially changes teaching or assessment requires an
ordinary public authoring decision: incorporate publishable original guidance,
replace it with reviewed wording, or explicitly retire its active use. Moving
content to an archive preserves history but does not prove pedagogical equivalence.

## Shared authored schema

The repository owns the versioned authored-record JSON Schema. Backend tooling
pins the schema at an accepted revision and consumes that same contract. Generated
types or a checksum-verified schema copy are implementation options; independently
maintained divergent schemas are not. Consumers reject unsupported schema versions.

The authored record covers the existing pedagogy, learn, assess, sources and
confidence fields, plus topic identity and explicit authoring provenance. Separate
the record from generated coverage, export timestamps, DB timestamps and deployment
receipts. Authorship provenance is not reconstructed from an import timestamp.

Structured activities, diagnostic patterns and citations receive stable IDs when
migrated or created. IDs survive text edits and reordering; array indices and text
hashes are not identities. Migration assigns and reviews IDs once, retaining an
explicit old-reference mapping. Existing topic IDs remain unchanged. Pure ordered
lists such as probe questions need no new identity unless something references them.

The versioned source schema and complete reference validation govern authoring.
Consumers must implement and qualify that same contract before activating their
canonical runtime readers.

## Source material and original prose

Public teaching prose must stand on its own. Citations identify public sources,
locators and, where relevant, curriculum codes. Private source extracts attach to
the corresponding stable citation ID outside this repository. They must not be
required to edit, validate or understand the public teaching record.

Do not author a teaching paragraph as a restricted quotation with an omission
placeholder to be reconstructed downstream. Review publishable original wording
instead. Follow [PROVENANCE.md](../PROVENANCE.md); this proposal expands no source
permissions. A source check can block a proposed public change for review, but
must not silently rewrite accepted teaching content when the source catalogue grows.

Private notes and additional sources are candidate research, not hidden runtime
overrides. The runtime uses the accepted record for teaching decisions. Any future
product use of private source extracts needs an explicit contract of its own.

## Publication invariant

The semantic content of a published record equals its accepted Git record.
Compute its digest from the complete authored record under a versioned canonical
JSON rule: object-key order is immaterial; all text and array order are preserved;
only separately modelled operational/export envelopes are excluded. Unknown
authored fields must fail schema validation, not escape the digest.

Reading a published record back must reproduce that authored value and digest.
Different JSON whitespace or DB column layout is allowed. An importer cannot
redact, paraphrase, merge private prose, repair references or reorder activities.
Reference repairs and retirements are reviewed repository changes.

The ordinary contribution process stays the same: edit the actual record, run
public checks, review the PR, merge. Publication requires no private research
round-trip or second editorial approval. Consumers still own deployment checks.

## One-time reconciliation and rollout

1. Inventory each existing public/private difference against the matching revision;
   keep new authored curriculum changes separate from representational differences.
2. Give every private field and redacted segment an explicit disposition: canonical
   teaching content, source support, operational metadata, or historical archive.
   Automated classification is a proposal; teaching/content changes need review.
3. Review rewritten prose, citation IDs and reference migrations in ordinary PRs.
   Preserve original private records before replacing their active use.
4. Implement the shared schema and direct downstream publisher, compare a complete
   preview and runtime readback, and activate only when all active records resolve.
5. Remove legacy redaction/reconstruction from the ordinary publishing path after
   migration acceptance. Retain historical archives and immutable receipts.

The schema migration preserves the agreed mastery meaning. Any intentional change
to a topic's meaning follows the existing claim-compatibility process; research
normalization is not approval to reset or reinterpret learner state.

## Acceptance conditions

- A community contributor can author and validate a complete teaching record offline.
- Runtime readback matches the accepted authored record and semantic digest.
- A new activity or changed prose needs no private merge recipe.
- Stable references survive reordering; missing or retired targets fail validation.
- Expanding the standards catalogue cannot mutate accepted teaching prose.
- All active private teaching differences have reviewed dispositions; no silent loss.
- No private source bodies, notes, learner data or credentials enter this repository.
