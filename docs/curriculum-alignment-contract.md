# Public curriculum alignment contract

This contract supplies schemas, semantic checks and read-only previews for the [authoring and publication design](taxonomy-authoring-and-publication.md). The dataset now includes a [version 2 scoped baseline](../reports/scoped-alignment-baseline-2026-11-04.md). Contexts are authored in `data/curriculum-alignments.json`; flat topic standards and ages are derived compatibility fields. Downstream authority and deployment behavior have not changed.

The tools accept schema versions 1 and 2. [Version 2 scoped contexts](curriculum-alignment-contexts-v2.md) add separate global guidance, international frameworks and jurisdiction associations, preserving different age intervals within a context. Use version 2 for new scoped proposals; version 1 is retained without implicit conversion.

## Version 1 representation

The retained version 1 format for `data/curriculum-alignments.json` uses [this schema](../schema/curriculum-alignments.schema.json); the actual baseline uses version 2:

```json
{
  "schemaVersion": 1,
  "version": "v1",
  "alignments": [
    {
      "topicId": "mt_example",
      "country": "CA",
      "region": "Ontario",
      "ageRangeStart": 11,
      "ageRangeEnd": 12,
      "standards": ["synthetic-language:S1"]
    }
  ]
}
```

This example is illustrative, not an official expectation. All executable examples in [the fixtures](../fixtures/curriculum-alignments/) are invented.

Each record describes one topic's country/region context. It contains all standard associations and the age interval for that context. More than one country or region can refer to the same topic. These records do not create topic difficulty levels or establish Full coverage of an expectation.

The complete contract requires both the JSON schema and the accompanying semantic checker:

- `schemaVersion` must be `1`; `version` must match the topic namespace, such as `v1`. A Git commit identifies the content revision separately.
- `topicId` must resolve in the supplied complete topic snapshot. Topic IDs, curriculum slugs and catalogue standard keys must be unique; declared catalogue/topic counts must match.
- `country` is an uppercase two-letter identifier or the existing `International` sentinel. This validates identifier shape, not membership in an ISO country registry. The normalizer never guesses or translates identifiers.
- `region` is optional. Missing, `null`, empty and whitespace-only values mean the national context. Strings are normalized to Unicode NFC and trimmed; an empty result is omitted. Case and interior whitespace are preserved. Remaining ASCII control characters are rejected. No geographical alias matching is attempted.
- Identity is `(topicId, country, normalized region)`. Duplicate contexts fail even when their contents agree. Conflicting ages or standards must be resolved deliberately; normalization never merges them.
- Both age bounds are required, nonnegative safe integers with start less than or equal to end. There is no arbitrary primary-school age ceiling in the storage contract. Null or missing ages must be reconciled before conversion; global bounds cannot supply missing local ages by inference.
- Every standard must be an exact namespaced catalogue key, `<curriculum-slug>:<code>`. Bare codes and unresolved references fail. A national source must match the context country; an `International` source can be localized to any context country. The same standard may appear in multiple contexts; duplicates within one context fail.
- An intentional age-only context has `"standards": []` and `"ageOnly": true`. A linked context must omit `ageOnly`. This distinguishes an intentional interval from an accidentally omitted mapping. A topic with no contexts is genuinely unaligned in the projection: no standards and null global ages.
- Unknown alignment/envelope fields fail. Alignment records hold public identifiers and ages, never private learner records, DB UUIDs or restricted source wording. Existing [source publication policy](../PROVENANCE.md) still applies to the catalogue and dataset.

Schema validation alone cannot check references, context uniqueness, age ordering or age-only intent. Use the public commands below, not just a generic JSON schema check.

## Deterministic previews

Run from the repository root, without credentials or dependencies beyond Node:

```bash
npm run alignments:normalize -- --alignments fixtures/curriculum-alignments/input.json --topics fixtures/curriculum-alignments/topics.json --curricula fixtures/curriculum-alignments/curriculum-standards.json
npm run alignments:project -- --alignments fixtures/curriculum-alignments/input.json --topics fixtures/curriculum-alignments/topics.json --curricula fixtures/curriculum-alignments/curriculum-standards.json
npm run alignments:check -- --alignments fixtures/curriculum-alignments/input.json --topics fixtures/curriculum-alignments/topics.json --curricula fixtures/curriculum-alignments/curriculum-standards.json
```

`--alignments` is always required. `--topics` and `--curricula` default to this checkout's published data files, independent of the caller's working directory. Explicit paths are relative to the caller. Missing/malformed inputs or invalid contracts exit nonzero.

`normalize` checks shape, references and context semantics and emits canonical alignment JSON to stdout. It does **not** certify completeness against existing flat fields. Version 1 orders records by topic ID, country and region; version 2 additionally orders by scope, framework and age interval as [documented separately](curriculum-alignment-contexts-v2.md#age-intervals-are-part-of-identity). Standard keys within a record use JavaScript UTF-16 code-unit ordering, independent of machine locale. Envelope and record fields have a fixed order. It preserves topic identity and the input schema version and does not modify any inputs. Normalization is idempotent.

`project` performs those same checks, then emits a preview containing every topic's `id`, `standards`, `ageRangeStart` and `ageRangeEnd`. Standard lists are sorted unions across contexts; global bounds are the minimum start and maximum end. Topics are sorted by ID. Cross-context reuse of a standard is deduplicated only in this compatibility projection. This output is **not a replacement `topics.json`**: all other topic fields are intentionally absent.

`check` additionally requires the supplied topic snapshot's flat standards and global bounds to equal the projection. Existing flat standard ordering is irrelevant; duplicates or missing/extra values fail. Successful JSON output names the schema, namespace, alignment context count and topic count checked. An empty alignment file cannot pass against topics that still have flat standards or ages. Agreement with the old flat fields is necessary, but cannot prove all country/region details were captured: that requires the separate baseline audit.

All commands are read-only and emit stdout; there is no write/apply command. Redirect a preview to a separate file when needed. They do not update topic files, counts, research provenance or manifest checksums. A complete artifact generator and consumer publisher are later implementation steps.

## Optional rollout and validation

`npm run validate` keeps the current dataset usable during preparation:

| Alignment file | Manifest | Result |
| --- | --- | --- |
| Absent | No alignment declarations | Existing validation; explicitly reports `not supplied (preparation mode)` |
| Present | Matching `files["curriculum-alignments.json"]` checksum/bytes and `counts.curriculumAlignments` | Runs full alignment and flat-field agreement checks as well as existing dataset checks |
| Present | Missing, stale or incorrect declaration | Fails |
| Absent | Any alignment file or count declaration, including zero | Fails |

The count is the number of alignment contexts, not topics or topic–standard pairs. The file may be empty only if its projection agrees with every topic. No existing dataset file or manifest is changed by introducing this tooling. The pure helpers are exported from [check-curriculum-alignments.mjs](../scripts/check-curriculum-alignments.mjs) for tests and future trusted tooling.

Before making this file mandatory, audit the complete authoring baseline, resolve unknown source identities and missing age/context information, and review the real data conversion. Preparation success is not a declaration of lossless migration or a switch of authority.
