# Curation principles

These principles guide human and agent contributions to the shared primary-school
taxonomy. They develop the [contribution guidance](../../README.md#adding-curricula)
and [authoring design](../taxonomy-authoring-and-publication.md); source publication
rules remain in [PROVENANCE.md](../../PROVENANCE.md).

## One assessable mastery claim per topic

A topic describes a teachable concept or skill with coherent observable evidence.
Description, evidence and assessment prompt must agree about what mastery means.
Topics do not have separately tracked difficulty levels. Country, school grade,
age, medium, vocabulary or a larger practice number alone does not establish a
new claim. Reuse across curricula when the same evidence demonstrates mastery.

Separate independently assessable operations or knowledge when success on one
does not establish the other. Number-system demands, representations, procedures
and fluent recall can justify distinctions, but the difference must appear in
evidence and assessment. Do not split mechanically at every numerical boundary
or turn a progression into a collection of near-duplicate topics.

Before an addition, search across existing domains, inspect candidate claims and
record the decisive mismatch. Prefer existing subjects/domains; national learning
area headings do not create parallel subject trees. Specific historical, civic
or geographical knowledge can require local topics; common reasoning and
procedures usually remain shared.

## Preserve meaning and identity deliberately

Keep stable IDs for continuing claims. Adding a curriculum association does not
silently broaden an existing claim. If widening, narrowing, splitting or merging
is justified, explain the before/after mastery evidence and affected relationships,
assessment guidance and research. Preserve genuine requirements before retiring a
duplicate; document old-to-current ID dispositions and review inbound/outbound
references. Do not infer mastery transfer from name similarity.

Consumers own private learner evidence and estimates. A public PR can describe
compatibility implications without private data or access. It does not authorize
resets, averaging priors or changing learner state. A consumer may need a separate
migration before deploying an accepted semantic change.

## Assessment and dependencies

Use evidence that distinguishes understanding from a lucky answer. Consider a
successful case, a near miss and a transfer to a different context. Parent-facing
assessment prompts use `{{name}}`, plain language and a concrete everyday scenario
where appropriate; the prompt must test the actual claim rather than a convenient
but weaker example. Public `assessmentPrompt` is the field to consult, not a
legacy agent's `parentQuestion` tool name.

A dependency says `topicId` depends on `prerequisiteId`. Explain the learning
reason and choose hard versus soft deliberately. Curriculum sequence, shared
grade or thematic similarity alone is insufficient. Review cycles, age/context
compatibility and affected paths; a passing DAG check is not pedagogical proof.

## Scope and evidence limits

Current authoring scope is primary/elementary, through age 12 unless the user
explicitly changes it. This is an authoring boundary, not a schema restriction
or a reason to delete older catalogue entries. Preserve distinct local age
intervals; neither global bounds nor another country's grade supplies missing
local ages automatically.

Use research to support specific pedagogical claims and distinguish proposals
from tested interventions. Inherited source-verification flags and confidence
ratings are historical metadata until independently checked. Report what was
actually reviewed, what was mechanically validated and what remains uncertain.

