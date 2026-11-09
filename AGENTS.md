# Working on os-taxonomy

This repository contains a shared primary/elementary taxonomy. Reviewed Git
content defines public taxonomy changes; downstream application publication is
a separate maintenance operation. Do not use a DB export or an agent's private
graph to overwrite accepted content.

For curriculum ingestion, alignment, topic curation or coverage review, use
[taxonomy-curation](.agents/skills/taxonomy-curation/SKILL.md). Other agents can
read that file directly. Its shared [curation principles](docs/curation/principles.md)
also apply to manual contributions. Using an agent or skill is optional for contributors.

- Keep current work within primary-school scope, through age 12. Broader historical
  catalogue entries are not instructions to extend the current authoring scope.
- Preserve stable topic IDs and unaffected scoped alignments. One topic represents
  one mastery claim; country, grade and medium alone do not justify duplicates.
- Follow [PROVENANCE.md](PROVENANCE.md). Keep restricted wording, private audits,
  learner data and credentials out of files, commits and PRs.
- Author scoped associations in `data/curriculum-alignments.json`; flat topic
  standards and ages are generated compatibility fields.
- After data changes, run `npm run alignments:generate`, `npm run validate`,
  `npm run alignments:generated-check` and `npm test`. Inspect the generated diff.
  For documentation-only changes, check links and any skill metadata; do not
  regenerate unchanged data.
- Submit the actual change in an ordinary PR. Repository review accepts the
  semantics; consumers handle deployment and private-state compatibility.
- Prefer a PR targeting the repository's default branch. For a dependent stack,
  retarget and reconcile the next PR against the default branch after its base
  reaches that branch. An intentional feature-integration stack needs an explicit
  final PR to the default branch. Verify accepted contents before reporting completion;
  a PR merged into a feature branch has not reached the default branch, and
  squash merges can change commit identities.

