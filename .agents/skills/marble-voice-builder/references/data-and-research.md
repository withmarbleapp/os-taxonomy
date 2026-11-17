# Taxonomy data and teaching research

The taxonomy tells you what a topic is, what it depends on and what has been
proposed for teaching it. It gives a lesson stable IDs to cite and a head start
on misconceptions. It does not tell you that any approach works: the guidance in
it was written by agents and has not been tested with children.

## Find one consistent revision

Everything you read must come from the same revision, because the research file
is bound by checksum to the exact bytes of the topic file. Look in this order:

1. `OS_TAXONOMY_DIR`, when set. It should contain `data/topics.json`,
   `data/manifest.json` and `schema/`. If it does not, report that path's
   failure before looking elsewhere, so a misconfiguration is not hidden.
2. The repository that encloses this skill, then the current working directory.
   Check for the same files; an unrelated repository is not a taxonomy checkout.
3. Otherwise ask for a checkout location, or use the public data from
   `withmarbleapp/os-taxonomy` at an explicit release or commit SHA, taking every
   file from that one revision.

Record the revision in the teaching brief. If `data/manifest.json` and the files
disagree on version or checksum, reconcile the checkout before relying on joins.

When no data can be reached, say that taxonomy grounding could not be checked
and continue with a brief clearly marked provisional. Data you could not read is
unknown, not absent. Ask for the data only when the design cannot be sound
without it.

## Read a small candidate set

The research file is large, so search it with a script and read only the topics
that bear on the goal. Start with `README.md` for coverage and licensing, and
`PROVENANCE.md` when using upstream curriculum material.

| File | How to use it |
|---|---|
| `data/topics.json` | `topics[]`: `id`, `name`, `description`, `subject`, `domain`, age range, `type`, `evidence`, `assessmentPrompt`, `standards`. Search name and description, then read the actual candidates. |
| `data/dependencies.json` | `dependencies[]`: `topicId` **depends on** `prerequisiteId`; `strength` is `hard` or `soft`. Read immediate prerequisites first and widen only as needed. |
| `data/teaching-research.json` | `records[]` join through `topicId`. `coverage.missingTopicIds` lists known gaps. |
| `data/manifest.json` | Version, per-file checksums and counts. Research `topicFileSha256` binds it to the exact topic-file bytes. |
| `schema/teaching-research.schema.json` | The canonical public shape. Read it when preparing a research contribution. |

Cite stable topic IDs in the design note. A lesson usually covers a narrower
slice than a topic; say so. When no topic fits the confirmed goal, design
around the goal and state that it is not taxonomy-aligned. The taxonomy is
shared data, so it is not edited to make one lesson fit.

## What each part of a research record is worth

The public file has `schemaVersion: 1` and its records contain
`learn.schemaVersion: 2`; these are different version levels.

| Part | What it contains | How far to trust it |
|---|---|---|
| `pedagogy` | Summary, best practices, representations, misconceptions | A useful starting list. Often older and less carefully qualified than `learn`. |
| `learn` | Proposed activities with learner actions, intended insight, feedback, rationale and `sourceClaims` (which match `sources[].claim` exactly); constraints and review notes | Proposals. Read constraints and review notes together with the activities. |
| `assess` | Nullable. Diagnostic task, response levels, error patterns, next teaching moves | Use alongside the topic's `evidence`, as input to your evidence criteria and not as a scoring algorithm. |
| `sources`, `confidence`, `provenance` | Historical authoring metadata | `verified: true` records a past check, and high confidence is the author's own rating. Read the source yourself for any claim the design depends on. |
| `publicationNotes` | Paths of restricted curriculum wording that was omitted | Use the reference and your own explanation, or consult the upstream source under its terms. The omitted wording is not to be reconstructed. |

`assessmentPrompt` may contain `{{name}}`. Remove it or substitute a neutral
phrase before display; a lesson never needs the child's name.

Where the record has a material gap or contradicts itself, read primary research
or authoritative guidance and write down what you found. A contradiction in the
dataset is something to resolve in the brief, not to carry into the lesson.

## Offering research back

When you developed research that would help other lessons on an existing topic,
offer once to contribute it. Adapting existing guidance is not a reason to, and
the lesson is never held up for it. If the user agrees:

1. Read the repository's current contribution instructions and the canonical
   schema; follow any newer process over these notes.
2. Write topic-level research, not this lesson's brief. It carries no names,
   interests, responses, performance or conversation details, and no age tied
   to an identifiable child. General topic age bands are fine.
3. Ground it in sources you read. Keep exact claim links, separate source-backed
   principles from proposed activities, and record authorship, date and
   verification status as they really are. If the schema cannot express that
   honestly, propose the schema change.
4. Keep `learn` portable: no Marble artifact types, catalogue rankings, hosting
   dependencies or lesson-specific implementation. Match the assessment method
   to the topic type as `scripts/check-teaching-research.mjs` requires, and
   check that referenced prerequisite IDs exist.
5. Make the smallest change on a branch. For direct data changes, update record
   counts, coverage and manifest byte lengths and checksums together, leaving
   `topicFileSha256` tied to the unchanged topic bytes. Validate with
   `node scripts/validate.mjs` and `node --test scripts/teaching-research.test.mjs`.
6. Put the topic IDs, evidence, limitations and validation in the PR
   description. Push or open the PR only with the user's authorisation;
   otherwise hand over a reviewable patch. Merging is the maintainers' step.

A record that passes the schema is well-formed, which is a different thing from
being good teaching.
