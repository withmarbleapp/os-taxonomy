# Ontario and India primary integration progress

This is the working completion checklist for one integration PR. Reviewed `main`
is the accepted baseline; content on this branch is proposed until the PR reaches
`main`. Catalogue records, source authoring coverage and learner attainment are
separate. Counts include overlapping source hierarchies, not unique skills.

## Scope and completion criteria

- Ontario: the agreed primary curriculum through age 12, including the retained
  Kindergarten scope. Physical Education and the optional Indigenous-language
  programme are excluded; Indigenous content in other subjects remains in scope.
- India: the NCERT national-framework primary baseline and applicable CBSE primary
  additions, Classes I–V and relevant Foundational/Preparatory requirements.
  Physical Education, secondary expansion and additional state/board programmes
  are excluded. R1/R2 and programme alternatives require explicit applicability;
  all named languages are not simultaneous national obligations.
- Finish the current official source inventory and account for every applicable
  requirement by exact source identity and complete clauses. Preserve genuine
  source uncertainty rather than inventing requirements or reporting false Full.
- Resolve remaining assessable gaps with whole-topic reuse first, supported by
  accessible teaching resources and independent assessment. Contextual duties,
  programme choices and implementation conditions must remain explicitly typed.
- Audit historical Full labels against complete claims, prerequisites and source
  conditions. A zero-Partial headline alone does not establish completion.
- Preserve stable IDs and complete unaffected scoped contexts, ages and history.
  Run required generation, validation, generated checks and tests for each
  integration. Database publication and private learner compatibility are a
  separate downstream qualification; this PR is public authoring work.

## Accepted baseline

Baseline: `df2d6ae43c45d75e8018252b18ae009a803fc984` (after PR159).

Ontario has 2,466 eligible records: 2,374 reported Full and 92 Partial. Full labels
include historical judgments requiring the completion audit.

| Subject | Eligible | Reported Full | Partial |
| --- | ---: | ---: | ---: |
| French | 594 | 570 | 24 |
| Healthy Living | 98 | 98 | 0 |
| Kindergarten | 122 | 113 | 9 |
| Language | 434 | 434 | 0 |
| Mathematics | 345 | 345 | 0 |
| Science | 325 | 277 | 48 |
| Social Studies | 248 | 237 | 11 |
| Arts | 300 | 300 | 0 |
| Total | 2,466 | 2,374 | 92 |

The selected NCERT baseline has 521 eligible records: 444 Full, four Partial and
73 other conditional/contextual dispositions. A separate link axis has 495
linked and 26 unlinked records; these are not additional disjoint coverage gaps.
This historical selection is not a complete India denominator. The 304-record
2017 reference catalogue and 83-position Hindi-script rendition do not themselves
add current mastery coverage. The CBSE CT/AI supplement (Classes III–V) has two
covered competencies among 21 overlapping hierarchical positions; it is not the
whole CBSE primary curriculum. Overall India/CBSE coverage percentages remain
unestablished pending the current-source completeness audit.

## Proposed content integrated so far

- Ontario Grade 2 machines: four source closures, three component associations in
  existing contexts, original readable/visual resources and independent force
  comparison protocols. Proposed Ontario totals: 2,378 Full / 88 Partial,
  including 44 Science Partials. No new topic or age change.
- India reasoning: three source-competency closures in the CBSE CT/AI supplement,
  five component pairs and one India context within the unchanged global age
  interval. Original assessment tasks and printable pattern resources are
  included. Proposed supplement coverage is five covered competencies; the
  selected NCERT baseline remains 444/521 Full. Digital and graded-parent batches
  remain separate unfinished work, not inferred covered from these components.

## Remaining work

- Ontario Science residuals; French local-community culture bindings; Social
  Studies community, territory and chronology bindings; Kindergarten local
  resources and mixed-scope conditions; historical coverage audits across all
  subjects, including those currently showing zero Partials.
- India current source completeness and applicability; formal role-bound
  language tasks and configured resources; source rendition ambiguities; arts,
  wellbeing and implementation conditions; remaining CT/AI competencies and
  independent goal/grade-parent review; current applicability of older reference
  outcomes where used. Do not convert each example or alternative into a topic.
- Final code-set, resource/protocol, whole-claim and scoped-context audit against
  the final integration head. Report remaining genuine source limitations
  explicitly rather than declaring them covered by a link.

## Working process

Ontario and India use isolated batch branches. Each agent prepares its next
batch during review, with an independent peer check for substantive source and
whole-claim decisions. Qualified commits are integrated into this one PR;
generated artifacts are reconciled once at integration. Progress distinguishes
accepted baseline, proposed branch changes and unfinished work. No additional
public PR per small batch is required.
