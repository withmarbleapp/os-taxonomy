# Data, research and optional contribution

## Locate and read the relevant data

Locate os-taxonomy data in this order; never infer its location from a fixed
number of parent directories above an installed skill:

1. Use `OS_TAXONOMY_DIR` when set. Verify it contains `data/topics.json`,
   `data/manifest.json` and `schema/`. If invalid, report the configured path's
   failure before trying another source.
2. Check the enclosing repository of the skill and the current working directory
   for those files. An unrelated repository is not a taxonomy checkout.
3. If neither supplies the data, ask for a checkout location or use the public
   data from `withmarbleapp/os-taxonomy` at an explicit release or commit SHA.
   Record that revision and obtain all required files from it; never mix files
   from a moving branch or different releases.

If no checkout or pinned public data is available, state that taxonomy grounding
could not be checked. Continue with a clearly provisional teaching brief and
available research when that can support a sound design; do not invent topic IDs,
claim taxonomy alignment, or treat inaccessible files as missing teaching research.
Ask for the data only when its absence prevents a sound design.

Resolve all files from the same revision. Read `README.md` for coverage and
licensing, and `PROVENANCE.md` when using upstream curriculum material.

Load/search files programmatically instead of dumping the large research file
into context. Read the small candidate set needed for the goal:

| File | How to use it |
|---|---|
| `data/topics.json` | `topics[]`: `id`, `name`, `description`, `subject`, `domain`, age range, `type`, `evidence`, `assessmentPrompt`, `standards`. Search name/description, then inspect actual candidates. |
| `data/dependencies.json` | `dependencies[]`: `topicId` **depends on** `prerequisiteId`; `strength` is `hard` or `soft`. Inspect immediate prerequisites first; expand only as needed. |
| `data/teaching-research.json` | `records[]` join through `topicId`, not an internal DB row ID. `coverage.missingTopicIds` records known gaps. |
| `data/manifest.json` | Version, per-file checksums and counts. Research `topicFileSha256` binds it to the exact topic-file bytes. |
| `schema/teaching-research.schema.json` | Canonical public shape; inspect when preparing a research contribution. |

If files disagree on version/checksum, reconcile the checkout before relying on
joins. Preserve stable IDs in the design note. Do not edit the taxonomy to force
a user's goal to fit. If no topic fits, say so and design around the confirmed
goal without claiming taxonomy alignment.

## Interpret research carefully

A public file currently has `schemaVersion: 1`; its records contain
`learn.schemaVersion: 2`. These are different version levels.

- `pedagogy`: summary, best practices, representations and misconceptions.
- `learn`: summary, proposed activities, constraints and review notes. Each
  activity has learner actions, intended insight, feedback, rationale and
  `sourceClaims`. Those claims match `sources[].claim` exactly.
- `assess`: nullable; diagnostic/task, response levels, error patterns and next
  teaching moves. Use it alongside the topic's evidence, not as an unquestioned
  scoring algorithm. `assessmentPrompt` may include `{{name}}`; remove or
  substitute it before display without requiring the child's name.
- `sources`, `confidence`, `provenance`: historical authoring metadata.
  `verified: true` is not fresh verification; high confidence is not an independent
  quality rating. Read sources for new claims that materially affect the design.
- `publicationNotes`: paths of omitted restricted curriculum wording. Do not
  reconstruct that wording. Use the reference/alignment and an original
  explanation, or consult the upstream source under its terms.

Guidance is agent-authored and proposed, not empirically validated. Original
pedagogy/assessment can be less qualified than updated learning guidance. Read
constraints and review notes together; do not propagate a contradiction simply
because it occurs in the dataset.

## Suggesting a research PR

If newly developed research is useful beyond this child's experience and maps
to an existing topic, briefly offer to contribute it. Do not ask again if the
user declines, or delay the HTML to prepare a contribution. No contribution is
needed merely because existing guidance was adapted.

If the user agrees to pursue it:

1. Inspect current repository contribution instructions and the canonical schema.
   Produce topic-level reusable research, not the child's design brief. Remove
   names, ages tied to an identifiable child, interests, responses, performance
   records and conversation details. General topic age bands can remain.
2. Ground the guidance in inspected sources. Preserve exact claim links and
   distinguish source-backed principles from proposed activities. Record actual
   authorship/date and verification status truthfully; never invent original DB
   provenance. If the public schema cannot express new contribution provenance
   honestly, propose that contract change explicitly instead of fabricating data.
3. Keep `learn` portable: no Marble artifact types, catalog rankings, hosting
   dependencies or child-specific implementation. Match assessment method to
   topic type as required by `scripts/check-teaching-research.mjs`; check any
   referenced prerequisite IDs exist.
4. Prepare the smallest contribution on a branch. For direct data changes, update
   record counts, coverage and manifest byte lengths/SHA-256 checksums consistently;
   keep `topicFileSha256` tied to unchanged canonical topic bytes. Validate with
   `node scripts/validate.mjs` and `node --test scripts/teaching-research.test.mjs`.
   Follow any newer repository process rather than inventing a competing format.
5. Include the topic IDs, evidence, limitations and validation in the PR description.
   Open/push the PR only when authorized by the user and supported by available
   GitHub access; otherwise deliver a reviewable patch. Do not merge it yourself.

A schema-valid record is not proof of educational quality. Contribution review
and publication are separate from the local experience and its validation.
