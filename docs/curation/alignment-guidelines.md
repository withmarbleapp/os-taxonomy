# Curriculum ingestion and alignment

Use alongside the [curation principles](principles.md),
[source policy](../../PROVENANCE.md) and
[version 2 alignment contract](../curriculum-alignment-contexts-v2.md).
Catalogue ingestion, topic associations and verified expectation coverage are
different outcomes. Report each separately.

## Establish an official source

Identify the publisher, exact document/edition, official URL, selected subjects,
grades and exclusions. For a downloaded source, record retrieval date, byte hash
and page/section locations. A later edition or differently hashed file needs
explicit reconciliation; do not silently overwrite the pinned source.

Establish the source's prescriptive status as well as its publisher: formal
goals/competencies, suggestive outcomes, assessment examples and syllabus content
are different kinds of evidence. An official host or an outcome label alone does
not make each item a mandatory grade-level requirement. Preserve stage-end and
resource/language applicability conditions rather than inventing per-grade
deadlines or treating examples as extra obligations.

Preserve official codes and hierarchy. When individual expectations have no
official code, document a deterministic source-position identifier and label it
as generated. Keep continuation text attached to the original item; distinguish
headings, examples, competencies and assessable outcome bullets. Check extracted
records against the source, including boundaries and wording, rather than relying
on a plausible total. Table/PDF extraction warrants an independent readback or
visual inspection of the relevant layout; record the checks actually performed.

Use the existing catalogue identity when extending the same document and edition.
Reconcile repeat identifiers explicitly. Document the batch's scope and counts
without claiming the whole source or country is complete. For example, the
NCERT foundational source covers selected Grades 1–2 Maths outcomes, not every
Indian board or primary-school subject.

Determine publication treatment from PROVENANCE and the source's terms. Public
availability alone does not establish redistribution rights. For codes-only
sources, commit factual identifiers, official links and permitted metadata;
keep restricted wording and extraction artifacts in authorized private storage.
Do not repeat restricted passages in reports, examples, research or PR bodies.
New sources need an explicit provenance entry and publication treatment.

## Evaluate coverage clause by clause

Read the expectation, including mandatory qualifiers and performance conditions.
Identify its required concepts, operations, representations and knowledge. Treat
illustrative examples as examples unless the source requires them. Distinguish
an optional tool/medium from a required independently assessable procedure.

Search the existing taxonomy before proposing additions. Compare the complete
claim and evidence, not just shared words. For each requirement, explain whether
a topic contributes directly, covers only a component, or is a prerequisite.
Several topics may jointly address one expectation. Their links still need a
coverage rationale; prerequisite knowledge is not proof of the required task.

Use these report dispositions (not extra fields in the strict alignment JSON):

| Disposition | Evidence required |
| --- | --- |
| Full | Every mandatory requirement is accounted for, including applicable resource/performance conditions; name contributing topic IDs and explain their roles. |
| Partial | Some requirements are covered; name the remaining clauses or conditions. |
| Gap | A required assessable claim lacks a suitable existing topic after a documented search. |
| Unverified | Source meaning or mapping evidence is insufficient to judge. |
| Out of scope | Explicitly outside the agreed task; give the reason. |

These are authoring judgments about expectation coverage, not learner mastery
certifications. Do not upgrade inherited Full labels without rechecking them.
A missing association can be an alignment gap rather than a missing skill.
Resource access, text complexity, independent performance, fluency or sustained
production may keep an expectation Partial even when related topics exist.

## Preserve scoped context

Author associations in `data/curriculum-alignments.json` with exact namespaced
catalogue keys. Follow the contract for jurisdiction, framework and global scopes.
Preserve unaffected contexts and distinct intervals, including two intervals in
the same jurisdiction. Do not union them merely to simplify an edit. Global
age-only guidance cannot carry standard links; age-only intent does not repair
an unresolved source reference. Flat topic ages/standards are compatibility output.

Use explicit grade/age evidence and the agreed primary-school boundary. A catalogue
can legitimately contain higher grades without authorizing alignment of them.
Coverage reports can record conditions the schema cannot express; do not add
unsupported properties or weaken conditions to force Full status.

## Make the result reviewable

For an alignment slice, record source keys, disposition, topic IDs, contribution
roles, reuse/addition rationale, remaining conditions and exclusions. A compact
table or a report consistent with existing mapping files is sufficient; no
mandatory private change-set format is required. Verify selected-code totals
reconcile across dispositions and count links separately from covered codes.

Report catalogue completion, association counts, independently reviewed coverage
and deferred scope separately. Keep a task checkpoint so another worker can
resume. Public reports carry reusable reasoning; private source text and runtime
details stay outside the repository. Ordinary PR review accepts the proposed
semantics. Downstream deployment and private-state preservation remain consumer
maintenance responsibilities.

