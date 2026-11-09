---
name: taxonomy-curation
description: Ingest official curriculum catalogues, align expectations with existing os-taxonomy topics, and review or refine primary-school mastery claims and coverage. Use for taxonomy maintenance, not child-facing lesson creation or downstream DB publication.
---

# Taxonomy curation

Produce a focused, evidence-backed public taxonomy change or coverage audit.
Read [curation principles](../../../docs/curation/principles.md) before making
semantic decisions. Read [alignment guidelines](../../../docs/curation/alignment-guidelines.md)
for curriculum work, and consult the relevant
[reviewed examples](../../../docs/curation/reviewed-examples.md) when deciding
whether to reuse, narrow, split or add a claim.

## Establish the task

Record the accepted base commit, branch/work ID, source edition, subject,
jurisdiction, selected grades/ages and requested deliverable. Distinguish:

- **Catalogue ingestion:** establish source identities and verified expectation
  records; this does not create topic coverage.
- **Alignment:** evaluate expectations against existing topics and propose scoped
  associations, preserving the meaning of those topics.
- **Claim curation:** justify changes to topic meaning, evidence, assessment,
  dependencies or identity separately from association changes.

Use the authorized scope; default new work to primary-school ages through 12.
Inspect existing reports and task notes before assuming a subject or grade is
finished. Historical Full labels and link counts are not fresh coverage evidence.

## Work from evidence

Read official source material for the selected edition, using public source links
or an available authorized read tool. A code-only catalogue cannot establish the
meaning of an expectation. If wording is unavailable, identify what remains
unverified and continue only work that does not depend on it; do not invent a gap.

For ingestion, follow the source checks in the alignment guidelines. For alignment,
break each expectation into assessable requirements, search existing topics by
meaning across domains, and inspect description, evidence, assessment guidance
and prerequisites. Evaluate the whole existing mastery claim, not just its title.

Keep whole-expectation, component and prerequisite contributions explicit in a
public-safe report. Explain remaining resource or performance conditions. Propose
a new or changed claim only after documenting why reuse fails. Do not convert
every expectation, grade or example into a new topic.

## Use the available authoring environment

In a normal checkout, edit a dedicated branch/worktree and follow the public
schemas and generation commands. Read the
[scoped-context contract](../../../docs/curriculum-alignment-contexts-v2.md)
before editing alignments; preserve complete unaffected records and age intervals.

In a hosted managed workspace, use its provided work tools and current capability
contract. Read the current head and full contexts before edits; supply the expected
head when required. On a stale head, reread and reconcile. Do not bypass managed
tools with shell writes. If a needed operation is unsupported, retain a concrete
proposal and identify the tooling gap rather than distorting the taxonomy or
falling back to a legacy writer.

This skill provides shared guidance. It does not install tools, grant private
access, enable new hosted edit types, or publish to a database.

## Validate and hand off

For data edits in a normal checkout, run from the repository root:

```sh
npm run alignments:generate
npm run validate
npm run alignments:generated-check
npm test
```

The generator handles bounded compatibility artifacts, not every possible claim,
research or dependency change. Read its
[contract](../../../docs/curriculum-alignment-contract.md#local-artifact-generation)
and inspect the complete diff. Resolve unsupported artifact work explicitly;
do not bypass checks or rewrite unrelated records to obtain a pass. In a managed
environment, record tool validation actually performed and leave public CI to
check the pushed branch; do not claim commands ran when they did not.

Prepare an ordinary PR with the semantic change, source references, reuse/addition
rationale, expectation dispositions, remaining uncertainty and validation results.
Include generated artifacts in the same PR. Private access and a second internal
semantic approval are not contributor requirements. A PR or local commit is not
a downstream publication receipt.

Keep a concise task checkpoint: base/current head, scope completed, next slice,
decisions, unresolved cases, validation and PR reference. Store private wording and
operational notes outside tracked public files. Put reusable public decisions in
the reviewed docs/report so future agents and humans can find them. Separate
parallel workstreams by branch and checkpoint; reconcile shared-topic changes
against the latest accepted content before handoff.

