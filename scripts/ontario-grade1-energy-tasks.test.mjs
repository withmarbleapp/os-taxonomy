import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url)));
const slug = 'the-ontario-curriculum-science-and-technology-20';
const dossier = 'ontario-grade1-energy-task-design-2026-11-12.json';
const resource = load(`reports/${dossier}`);
const ledger = load('reports/ontario-grade1-energy-current-ledger-2026-11-12.json');
const contexts = load('data/curriculum-alignments.json').alignments;
const cards = new Map(load('data/topics.json').topics.map(row => [row.id, row]));
const selected = load('data/curriculum-standards.json').curricula.find(row => row.slug === slug).topics.filter(row => /^ON-SCI-2022-G1-C\d/.test(row.code)).map(row => row.code).sort();
// Explicit registries prevent deleting a row, clause or dossier to escape review.
const bindings = {
  'C2.1': { protocol: 'common-energy', ids: ['mt_cxJRc15osy', 'mt_iGSfQg3g5c'], evidence: ['movement-example', 'warming-example', 'common-energy-generalisation', 'new-effect-transfer'] },
  'C2.2': { protocol: 'solar-earth', ids: ['mt_iGSfQg3g5c', 'mt_PiWZA8Z0ZJ', 'mt_3v0VNkwquK'], evidence: ['principal-not-only', 'air-warming', 'land-warming', 'water-warming', 'daylight', 'green-plant-growth', 'changed-electric-light-case'] },
  'C2.3': { protocol: 'food-energy', ids: ['mt_cxJRc15osy', 'mt_EygMHKs8Ed'], evidence: ['human-food-energy', 'animal-food-energy', 'green-plant-food-energy', 'independent-three-organism-chain', 'food-source-transfer'] },
  'C2.4': { protocol: 'various-sources', ids: ['mt_cxJRc15osy', 'mt_iGSfQg3g5c'], evidence: ['food-source-effect-use', 'sun-source-effect-use', 'various-distinct-sources', 'changed-use-transfer'] },
};
const fullCodes = Object.keys(bindings).map(code => `ON-SCI-2022-G1-${code}`).sort();
const partialCodes = ['C1', 'C1.1', 'C1.2', 'C2', 'C2.5', 'C2.6'].map(code => `ON-SCI-2022-G1-${code}`).sort();
function check(report = resource, current = ledger, associations = contexts) {
  assert.deepEqual(current.expectations.map(row => row.code).sort(), selected, 'Missing energy inventory');
  assert.deepEqual(current.expectations.filter(row => row.disposition === 'Full').map(row => row.code).sort(), fullCodes, 'Only four proposed source closures are reviewed');
  assert.deepEqual(current.expectations.filter(row => row.disposition === 'Partial').map(row => row.code).sort(), partialCodes, 'Six residuals must remain Partial');
  assert.equal(report.scope.sourceTaskCoverageNotLearnerCertification, true, 'Source task cannot award learner mastery');
  assert.equal(report.scope.applianceYoungerContextApproved, false, 'No younger whole appliance offer');
  assert.equal(report.scope.topicAgeContextChanges, false, 'No topic/age/context changes');
  assert.ok(report.delivery.format.trim() && report.delivery.studyAndAssessmentSeparation.trim() && report.delivery.recording.trim(), 'Missing accessible delivery or assessment boundary');
  for (const row of current.expectations) {
    assert.equal(row.key, `${slug}:${row.code}`);
    assert.equal(row.historicalDisposition, 'Partial', 'History cannot become a Full recertification');
    assert.equal(row.acceptedDisposition, 'Partial', 'Proposed Full is not accepted coverage');
    if (row.disposition === 'Partial') { assert.ok(row.remainingConditions.length, 'Missing honest residual'); continue; }
    const binding = bindings[row.code.split('G1-')[1]];
    assert.equal(row.qualification, 'proposed-source-task');
    assert.equal(row.dossier, dossier, 'Missing actual public dossier');
    assert.equal(row.protocolReference, `/protocols/${binding.protocol}`, 'Missing actual protocol binding');
    const protocol = report.protocols?.[binding.protocol];
    assert.ok(protocol?.codes?.includes(row.code), 'Missing complete protocol');
    assert.deepEqual(protocol.contributorIds, binding.ids, 'Whole topic substitution not reviewed');
    assert.deepEqual(row.contributingTopicIds, binding.ids, 'Ledger contributor mismatch');
    assert.deepEqual(protocol.requiredEvidence, binding.evidence, 'Required source clause omitted');
    assert.deepEqual(protocol.remainingConditions, []);
    assert.deepEqual(row.remainingConditions, []);
    assert.equal(protocol.assessmentTaskReference, `/preparedCases/${binding.protocol}/assessment`, 'Missing bound independent assessment');
    assert.deepEqual(protocol.caseRefs, [binding.protocol], 'Missing prepared case');
    const value = report.preparedCases?.[binding.protocol];
    assert.ok(value?.learnerStudyCards?.length >= 3 && value.learnerStudyCards.every(s => s.trim()), 'Missing actually authored learner resources');
    assert.ok(value.teachingSequence.length >= 3 && value.teachingSequence.every(s => s.trim()), 'Missing teaching and independent assessment sequence');
    for (const key of ['question', 'expectedEvidence', 'nearMiss', 'changedCase', 'independence', 'wholeClaimBoundary']) assert.ok(value[key]?.trim(), 'Missing independent question, transfer or complete-claim boundary');
    assert.ok(value.resourceRefs.length, 'Missing source references');
    for (const ref of value.resourceRefs) assert.ok(report.resources?.[ref]?.url.startsWith('https://') && report.resources[ref].readScope?.trim(), 'Missing bounded actual source');
    const assessment = value.assessment;
    assert.equal(assessment?.requiresIndependentPerformance, true, 'Independent learner performance required');
    assert.equal(assessment.teacherMaySupplyPremisesNotAnswers, true, 'Teacher answers cannot replace learner evidence');
    assert.equal(assessment.studyCardCopyingSufficient, false, 'Copied study answers are insufficient');
    assert.equal(assessment.wholeTopicAwardFromThisTaskAlone, false, 'Component cannot award whole mastery');
    assert.deepEqual(assessment.learnerActions.map(action => action.operation), binding.evidence, 'Independent required operation omitted');
    assert.ok(assessment.learnerActions.every(action => action.instruction?.trim()), 'Missing concrete learner instruction');
    assert.deepEqual(assessment.requiredEvidence, binding.evidence, 'Required performance evidence omitted');
    assert.ok(assessment.recordingRequirement.trim(), 'Actual learner evidence cannot be fabricated');
    for (const id of binding.ids) {
      assert.ok(associations.some(c => c.topicId === id && c.country === 'CA' && c.region === 'Ontario' && c.ageRangeStart === 6 && c.ageRangeEnd === 7 && c.standards.includes(row.key)), 'Missing existing Ontario6–7 component pair');
      const snapshot = report.wholeCards.find(card => card.id === id);
      assert.ok(snapshot && cards.has(id), 'Missing complete current card');
      for (const field of ['name', 'description', 'evidence', 'assessmentPrompt']) assert.deepEqual(snapshot[field], cards.get(id)[field], 'Whole claim weakened or substituted');
    }
  }
  assert.deepEqual(current.counts, { proposedFreshFull: 4, remainingPartial: 6, acceptedFullInThisSlice: 0, acceptedPartialInThisSlice: 10 });
}
test('four proposed energy protocols bind accessible resources and exact existing components', () => check());
test('missing rows, dossiers or source bindings cannot evade the review registry', () => {
  const missing = structuredClone(ledger); missing.expectations.pop(); assert.throws(() => check(resource, missing), /inventory/);
  const dossierMissing = structuredClone(ledger); delete dossierMissing.expectations.find(row => row.disposition === 'Full').dossier; assert.throws(() => check(resource, dossierMissing), /dossier/);
  const citation = structuredClone(resource); delete citation.resources['nasa-warming']; assert.throws(() => check(citation), /source/);
});
test('air, plant food, common generalisation and various-source uses remain independent operations', () => {
  for (const [key, operation] of [['solar-earth', 'air-warming'], ['food-energy', 'green-plant-food-energy'], ['common-energy', 'common-energy-generalisation'], ['various-sources', 'various-distinct-sources']]) {
    const report = structuredClone(resource); report.preparedCases[key].assessment.learnerActions = report.preparedCases[key].assessment.learnerActions.filter(action => action.operation !== operation);
    assert.throws(() => check(report), /operation omitted/);
  }
});
test('receiving facts, copying a chain or teacher-supplied answers cannot satisfy performance', () => {
  for (const mutation of ['copy', 'teacher', 'independent', 'whole-award', 'construction']) {
    const report = structuredClone(resource); const assessment = report.preparedCases['food-energy'].assessment;
    if (mutation === 'copy') assessment.studyCardCopyingSufficient = true;
    if (mutation === 'teacher') assessment.teacherMaySupplyPremisesNotAnswers = false;
    if (mutation === 'independent') assessment.requiresIndependentPerformance = false;
    if (mutation === 'whole-award') assessment.wholeTopicAwardFromThisTaskAlone = true;
    if (mutation === 'construction') assessment.learnerActions = assessment.learnerActions.filter(action => action.operation !== 'independent-three-organism-chain');
    assert.throws(() => check(report), /Copied|Teacher|Independent|whole mastery|operation omitted/);
  }
});
test('absent study resources, transfer, task binding or whole-claim limits fail closed', () => {
  for (const field of ['learnerStudyCards', 'changedCase', 'wholeClaimBoundary', 'assessment']) {
    const report = structuredClone(resource); delete report.preparedCases['common-energy'][field];
    assert.throws(() => check(report), /authored|question|performance/);
  }
  const report = structuredClone(resource); delete report.protocols['solar-earth'].assessmentTaskReference; assert.throws(() => check(report), /assessment/);
});
test('six residuals, the unresolved overall and appliance ages cannot be promoted implicitly', () => {
  const row = structuredClone(ledger); row.expectations.find(value => value.code.endsWith('-C2')).disposition = 'Full'; assert.throws(() => check(resource, row), /Only four/);
  const report = structuredClone(resource); report.scope.applianceYoungerContextApproved = true; assert.throws(() => check(report), /younger/);
  const substitution = structuredClone(resource); substitution.protocols['various-sources'].contributorIds.push('mt_9nxyFoYD_b'); assert.throws(() => check(substitution), /substitution/);
  const whole = structuredClone(resource); whole.wholeCards.find(card => card.id === 'mt_cxJRc15osy').evidence.pop(); assert.throws(() => check(whole), /weakened/);
});
