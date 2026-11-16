# Canonical teaching research v2: schema and normalization preview

Status: source migration, 16 November 2026. The active public dataset uses v2
records. This implements the source side of the accepted
[canonical research contract](canonical-teaching-research.md). It does not activate
a downstream publisher, replace private records or change deployed behaviour.

## Active collection and contribution workflow

`data/teaching-research.json` contains 1,097 canonical records. Its collection
header binds the exact topic-file bytes, authored schema checksum and digest
contract; coverage and record count are generated metadata. There is no export
timestamp in the canonical collection. The authored record schema remains the
same contract introduced in #163.

Edit a record in place, retaining existing activity, diagnostic and citation IDs.
New items need new unique IDs; never derive existing identities again from edited
text or positions. Run:

```sh
node scripts/generate-alignment-artifacts.mjs --write
node scripts/validate.mjs
node --test scripts/*.test.mjs
```

Generation refreshes derived collection and manifest metadata without rewriting
authored fields or list order. Unsupported contracts and unknown fields fail.
The validator checks the complete collection, references, coverage and bindings.

The migration changes 438 marked strings across 253 records: 235 guidance fields
and 203 citation fields. Both groups received independent peer review. Confidence
and citation verification flags are unchanged; this is not fresh verification of
the whole source library. The remaining 844 records retain every authored value.
No topic, dependency or curriculum alignment changes in this migration.

The [ID map](../reports/canonical-research-id-migration-map-2026-11-16.json) binds
the original public artifact to stable IDs. Original public timestamps and notes
are retained in the [legacy metadata inventory](../reports/canonical-research-legacy-metadata-2026-11-16.json).
Seven old index-based reference repairs are historical metadata only; active
canonical records require no runtime repairs. All five archived originals remain
unchanged. See the [migration report](../reports/canonical-research-content-migration-2026-11-16.json)
for public field hashes and aggregate preservation checks.

## Authored record

[The v2 schema](../schema/canonical-teaching-research-v2.schema.json) describes
one complete authored record, not an export envelope:

| Field | Contract |
| --- | --- |
| schemaVersion | 2; separate from the existing learn.schemaVersion |
| namespace, topicId | Existing taxonomy namespace and stable topic identity |
| pedagogy, learn, assess, confidence | Existing public guidance, preserving text and list order; assess remains nullable |
| sources | Public citations with stable citation IDs; existing claim, source, optional URL and historical verified value |
| authorship.attribution | Explicit authoring credit; migration retains originalResearchGeneratedBy here |

Activities require `id` and `sourceIds` instead of copied `sourceClaims` strings.
Assessment error patterns require `id`. Citation records require `id`. The
validator checks duplicates, citation resolution, active prerequisite references,
topic/method compatibility, namespace and unknown properties. It rejects source
omission placeholders, including URI-encoded placeholders, rather than rewriting
them. This is a known-marker check, not a source-licensing or pedagogical review.

The v1 schema remains the frozen legacy export shape. The v2 schema is the
authored-record authority, not a second editable
copy of the same v1 contract. Future downstream consumers must pin its exact
accepted revision/checksum; no runtime schema download is introduced.

DB timestamps, export timestamps, coverage and publication notes are not authored
fields. The preview retains the original public provenance and publication notes
in a separate `legacyMetadata` inventory. Original private records and source
attachments still require their own reconciliation and preservation.

## Read-only commands

From a checkout, without a DB, credentials, packages or model:

```sh
node scripts/research-canonical.mjs summary --research /tmp/legacy/data/teaching-research.json --topics /tmp/legacy/data/topics.json --manifest /tmp/legacy/data/manifest.json
node scripts/research-canonical.mjs preview --research /tmp/legacy/data/teaching-research.json --topics /tmp/legacy/data/topics.json --manifest /tmp/legacy/data/manifest.json > /tmp/research-preview.json
node scripts/research-canonical.mjs check --record /tmp/authored-record.json
```

`preview` and `summary` convert legacy v1 snapshots only. Obtain all three files
from the same accepted pre-migration revision; the active v2 dataset must not be
normalized again. These commands accept explicit `--research`, `--topics`, `--manifest` and
optional `--migration-map` files. `check` accepts one v2 record and an optional
`--topics` file. Invalid commands and unsupported combinations fail. The tool
reads only and writes stdout; it has no apply command or database connection.
Validate/checksum the complete existing public input before converting it. A
missing or inconsistent legacy record/manifest is not silently skipped.

The detailed preview includes every candidate, its validation problems, eligible
authored digest, proposed identity map and legacy metadata. The summary reports
aggregate counts and remaining gates. Both always say `readyToPublish: false`.
Structurally eligible means only that the proposed authored record passes these
mechanical checks. It does not approve the migration or private-field disposition.

## Identity migration

Candidate IDs are reproducibly bootstrapped once from the exact legacy artifact,
topic, item category and original position. This is an initial migration mapping,
not ongoing identity derivation. The full map is bound to the exact legacy file
SHA-256; a changed/reordered legacy file cannot reuse it unnoticed.

Review and persist the map before accepting canonical records. A supplied map
must cover every topic/item exactly, use valid unique IDs and match the baseline
checksum. Reviewed opaque IDs can replace the generated candidates. Legacy
activity claim strings resolve only when they name one citation unambiguously;
the converter does not guess among duplicate claims.

After cutover, authors edit canonical records and retain their IDs. Use `check`
when editing/reordering them; do not regenerate their identities from legacy
positions or updated prose. Existing topic IDs and prerequisite IDs do not change.
Historical archive repair mappings now retain stable diagnostic IDs separately
from the unchanged original records.

## Semantic digest

`authored-research-json-v1` hashes the complete validated v2 record with SHA-256.
Serialization recursively sorts object keys in ECMAScript UTF-16 code-unit order,
preserves array order and every string exactly, and uses ECMAScript JSON finite
number encoding. No Unicode, whitespace or prose normalization occurs. Invalid
JSON values are rejected. This is a named local contract, not a claim of RFC 8785
conformance. Unknown authored fields fail validation before digesting.

Schema checksum, digest-contract name and legacy-input checksum are separate
preview metadata. Operational timestamps are outside the record and cannot
change its content digest. Text, citation verification flags, item order,
authorship and references are authored values and do change it.

## Current public-input rehearsal

The checked-in [aggregate preview](../reports/canonical-research-normalization-preview-2026-11-16.json)
uses the public data at accepted commit `297f300af92d6ad7106702f8b542c45c716ab15e`.
Run `summary` against that snapshot to reproduce it. Its research-file SHA is
recorded independently from the schema and proposed ID-map digests.

All 1,097 guides produce candidates. Of these, 844 pass structural/reference
checks and 253 require reviewed replacement of source omission placeholders.
No ambiguous legacy citation mapping was found in this snapshot. The counts do
not approve the 844 guides' private dispositions or authorize publishing them.

An independent public-only rehearsal restored all five legacy authored fields
from every candidate (including blocked candidates), with exact original values
and list order, and verified the complete legacy provenance/publication notes.
It also recomputed each eligible authored digest. That demonstrates lossless
public normalization, not lossless migration of private DB records or pedagogical
equivalence of future wording replacements. This historical report describes the preview before the separately reviewed
content migration; it is not the current collection validation result.

## Remaining downstream publication gates

The public source migration is reviewable independently of deployment. Consumers
must pin the accepted schema, implement exact storage and runtime readback, retain
private supporting material and historical originals separately, and qualify the
complete publisher before activation. Neither a passing source check nor this
migration enables Marble #4268 or authorizes replacing private JSON. The source
migration alone does not establish deployed staging parity.
