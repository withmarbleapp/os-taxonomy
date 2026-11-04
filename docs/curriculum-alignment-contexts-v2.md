# Scoped alignment contexts — schema version 2

Schema version 2 separates **where a claim applies**, **which framework supplies an association**, and **the ages attached to that association**. It refines the [alignment contract](curriculum-alignment-contract.md) and is used by the [public baseline](../reports/scoped-alignment-baseline-2026-11-04.md). This does not activate downstream publication or convert live authoring state.

## Why the representation changes

A topic can have general age guidance and an international framework association at the same time. Encoding both as the country `International` would collapse those contexts. A framework is not a geographical region either. Likewise, two sets of standards in one jurisdiction can have different age intervals: replacing them with one union would lose which standards apply at which ages.

These are associations on one stable topic, not separate topics, difficulty levels or separate learner mastery states. The format must preserve them without deciding that an expectation is fully covered.

## Public shape

Use the existing optional filename `data/curriculum-alignments.json`, with `schemaVersion: 2`. The topic namespace remains `version: "v1"`; it is independent of the schema version and the Git content revision. Each record requires `topicId`, `scope`, `ageRangeStart`, `ageRangeEnd` and `standards`.

| Scope | Additional identity | Allowed associations |
| --- | --- | --- |
| `jurisdiction` | Required two-letter `country`, optional normalized `region` | Matching national sources or localized `International` sources; intentional empty lists require `ageOnly: true` |
| `framework` | Required `framework` equal to an exact catalogue slug whose country is `International` | Standards from that framework only; intentional empty lists require `ageOnly: true` |
| `global` | None | General age guidance only: `standards: []` and `ageOnly: true` are required |

Country and region fields are forbidden on framework/global records. The framework field is forbidden on jurisdiction/global records. Unknown fields fail. `International` is a source-country sentinel, not a jurisdiction in version 2. Two-letter country values still receive identifier-shape validation, not ISO-registry or geographical-truth certification.

Framework identity is a public curriculum slug, never a DB UUID or an arbitrary title. Exact key resolution and source-country rules still apply. A framework record cannot link a different international framework just because both have the same source country. Global guidance cannot smuggle in standard links. Region normalization remains NFC plus trim, with empty/null regions omitted, case/interior whitespace preserved, and remaining ASCII control characters rejected.

This synthetic example has general guidance and a framework association on the same topic:

```json
{
  "schemaVersion": 2,
  "version": "v1",
  "alignments": [
    {
      "topicId": "mt_example",
      "scope": "global",
      "ageRangeStart": 5,
      "ageRangeEnd": 10,
      "standards": [],
      "ageOnly": true
    },
    {
      "topicId": "mt_example",
      "scope": "framework",
      "framework": "synthetic-framework",
      "ageRangeStart": 7,
      "ageRangeEnd": 9,
      "standards": ["synthetic-framework:S1"]
    }
  ]
}
```

The named topic/source must resolve in supplied snapshots; the example is illustrative. Executable [synthetic fixtures](../fixtures/curriculum-alignments-v2/) include complete miniature catalogues/topics.

## Age intervals are part of identity

Version 2 record identity is `(topicId, scope, country, normalized region, framework, ageRangeStart, ageRangeEnd)`, using only fields allowed by that scope. A duplicate identity fails even when the standards agree, or when the duplicate supplies a different set of standards. Resolve that exact-band conflict explicitly in review.

Within one scope/context, different age intervals remain separate records. Each standard list applies only to its own interval. Intervals may overlap or be disjoint; the same standard can recur in different intervals. The normalizer never unions those records, fills gaps or broadens an interval. Age-only records likewise retain their individual intervals. Required bounds remain nonnegative safe integers, with start less than or equal to end.

For example, one jurisdiction can associate standard `S1` with ages 5–6 and `S2` with ages 7–9. Both associations remain intact. The compatibility projection still produces flat standards `[S1, S2]` and global bounds 5–9; that intentionally loses per-standard age detail. Consumers needing that detail must read the authored records. Flat-field agreement alone cannot prove lossless context capture.

Canonical order is topic ID, scope, country, normalized region, framework, numeric start age and numeric end age. Inapplicable string fields compare as empty strings. Strings and standard keys use UTF-16 code-unit order; no locale or clock is involved. Record fields are emitted in fixed order. Scope values sort lexically (`framework`, `global`, `jurisdiction`).

## Validation and compatibility

The [version 2 schema](../schema/curriculum-alignments-v2.schema.json) defines the three allowed shapes. As in version 1, full validation also requires the semantic checker for references, framework membership, age ordering, age-only intent and duplicate identities. The commands select the schema from the envelope and preserve that version in canonical output and validation reports:

```sh
npm run alignments:check -- --alignments fixtures/curriculum-alignments-v2/input.json --topics fixtures/curriculum-alignments-v2/topics.json --curricula fixtures/curriculum-alignments-v2/curriculum-standards.json
npm run alignments:normalize -- --alignments fixtures/curriculum-alignments-v2/input.json --topics fixtures/curriculum-alignments-v2/topics.json --curricula fixtures/curriculum-alignments-v2/curriculum-standards.json
npm run alignments:project -- --alignments fixtures/curriculum-alignments-v2/input.json --topics fixtures/curriculum-alignments-v2/topics.json --curricula fixtures/curriculum-alignments-v2/curriculum-standards.json
```

Version 1 remains supported under its original schema and semantics: one record per topic/country/region, including the old `International` sentinel. It is not upgraded implicitly, and adding a version 2 field to a version 1 record fails. The new interval identity rule applies only to version 2. Unsupported versions fail closed. A consumer pinned to the old codec must explicitly upgrade before using version 2.

Dataset validation accepts either supported version when the optional file is present, requires the same manifest checksum/bytes/context count, and checks the complete flat-field projection. Absent-file preparation mode remains explicit. All commands remain read-only.

## Baseline conversion remains separate

This schema provides representation choices, not a legacy conversion command. An audited global age-only context can be proposed as `global`; a verified international framework context can use its exact source slug; distinct jurisdiction intervals can be retained as separate records. Do not infer these decisions from names or global bounds, reclassify missing standard mappings as age-only, or silently drop unresolved legacy references.

Before publishing a real baseline, independently verify reference bindings, age-only intent, every original context's disposition and the full in-memory/saved/backup/DB comparison. Keep original intervals and topic identities. The private adapter and its pinned contract require a separate reviewed update after this public contract is accepted. No private access or second semantic approval is added to ordinary community PRs.
