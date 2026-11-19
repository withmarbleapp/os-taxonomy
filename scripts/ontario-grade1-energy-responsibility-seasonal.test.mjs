import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url)));
const dossier = 'ontario-grade1-energy-responsibility-seasonal-task-design-2026-11-12.json';
const resource = load(`reports/${dossier}`);
const ledger = load('reports/ontario-grade1-energy-current-ledger-2026-11-12.json');
const contexts = load('data/curriculum-alignments.json').alignments;
const topics = new Map(load('data/topics.json').topics.map(row => [row.id, row]));
const required = {
  C1: { task: 'three-setting-overall', case: 'three-settings', ids: ['mt_deexfCHU9m'], evidence: ['home-assessed-use', 'school-assessed-use', 'community-assessed-use', 'responsibility-with-conditions', 'changed-setting-transfer'] },
  'C1.1': { task: 'home-school-responsibility', case: 'three-settings', ids: ['mt_deexfCHU9m'], evidence: ['home-use-purpose', 'school-use-purpose', 'home-responsible-choice-reason', 'school-responsible-choice-reason', 'source-specific-demand-fuel-pollution-chain', 'needed-service-boundary'] },
  'C1.2': { task: 'electricity-loss', case: 'electricity-loss', ids: ['mt_L1469gt34A', 'mt_3v0VNkwquK'], evidence: ['human-life-activity-consequence', 'other-living-dependent-plant-consequence', 'other-living-independent-plant-contrast', 'conditions-and-timescale', 'no-usable-electricity-not-only-mains', 'appropriate-alternative-reason'] },
  'C2.6': { task: 'seasonal-uses-forms', case: 'seasonal-uses-forms', ids: ['mt_iGSfQg3g5c', 'mt_cxJRc15osy'], evidence: ['all-four-selected-seasons', 'seasonal-use-comparison', 'forms-light-thermal-movement', 'source-device-effect-distinction', 'use-choice-conditioned-on-weather-and-need', 'food-movement-constant-use-comparison'] },
};
function check(report = resource, current = ledger, associations = contexts) {
  assert.equal(report.scope.C2OverallStillPartial, true);
  assert.equal(report.scope.C2Point5StillPartial, true);
  assert.equal(report.scope.applianceYoungerContextApproved, false, 'No whole appliance6–7offer');
  assert.equal(report.scope.sourceTaskCoverageNotLearnerCertification, true);
  assert.deepEqual([...current.currentBatchFreshCodes].sort(), Object.keys(required).map(code => `ON-SCI-2022-G1-${code}`).sort(), 'Four-code review registry cannot change');
  for (const [code, rule] of Object.entries(required)) {
    const row = current.expectations.find(r => r.code === `ON-SCI-2022-G1-${code}`);
    assert.equal(row?.disposition, 'Full'); assert.equal(row.historicalDisposition, 'Partial');
    assert.equal(row.dossier, dossier, 'Missing actual reviewed dossier');
    assert.equal(row.protocolReference, `/protocols/${code}`, 'Missing actual protocol');
    assert.deepEqual(row.contributingTopicIds, rule.ids, 'Whole contributor substitution');
    const protocol = report.protocols?.[code];
    assert.deepEqual(protocol?.contributorIds, rule.ids);
    assert.deepEqual(protocol.caseRefs, [rule.case], 'Missing complete case');
    assert.equal(protocol.assessmentTaskReference, `/assessments/${rule.task}`, 'Missing actual assessment');
    assert.deepEqual(protocol.requiredEvidence, rule.evidence, 'Required source clause omitted');
    const assessment = report.assessments?.[rule.task];
    assert.equal(assessment?.requiresIndependentPerformance, true);
    assert.equal(assessment.teacherMaySupplyPremisesNotAnswers, true);
    assert.equal(assessment.studyCardCopyingSufficient, false, 'Copying cannot replace reasoning');
    assert.equal(assessment.wholeTopicAwardFromThisTaskAlone, false);
    assert.deepEqual(assessment.requiredEvidence, rule.evidence);
    assert.deepEqual(assessment.learnerActions.map(a => a.operation), rule.evidence, 'Independent source performance omitted');
    assert.ok(assessment.learnerActions.every(a => a.instruction?.trim()));
    const value = report.preparedCases?.[rule.case];
    assert.ok(value?.learnerStudyCards?.length >= 4, 'Missing accessible study resource');
    assert.ok(value.teachingSequence.length >= 3);
    for (const field of ['question', 'changedCase', 'nearMiss', 'wholeClaimBoundary', 'attributionLimits', 'independence']) assert.ok(value[field]?.trim(), 'Missing independent source/transfer boundary');
    for (const ref of value.resources) assert.ok(report.resources[ref]?.url.startsWith('https://') && report.resources[ref].readScope?.trim(), 'Missing bounded factual source');
    for (const id of rule.ids) {
      assert.ok(associations.some(c => c.topicId === id && c.country === 'CA' && c.region === 'Ontario' && c.ageRangeStart === 6 && c.ageRangeEnd === 7 && c.standards.includes(row.key)), 'Missing approved existing-band source pair');
      const snapshot = report.wholeCards.find(c => c.id === id);
      for (const key of ['name', 'description', 'evidence', 'assessmentPrompt']) assert.deepEqual(snapshot?.[key], topics.get(id)?.[key], 'Whole claim changed');
    }
  }
  assert.equal(report.protocols.C1.independentOverallNotChildCount, true, 'Overall requires own three-setting task');
  assert.deepEqual(report.protocols['C2.6'].prerequisiteContributorIds, ['mt_go5i87u2b9', 'mt_Dj2xr8CoI0'], 'Weather/clothing prerequisite role must stay explicit');
  const language = report.preparedCases['seasonal-uses-forms'].teacherEnergyLanguage;
  assert.deepEqual(language?.introductoryForms, ['light energy', 'thermal/heat energy', 'movement energy'], 'Explicit introductory energy forms required');
  assert.equal(language.requiresFullOlderEnergyVocabulary, false, 'No older energy vocabulary gate');
  assert.equal(language.arbitraryEffectsAreSeparateFormalForms, false, 'Arbitrary effects are not formal forms');
  for (const code of ['C2', 'C2.5']) assert.equal(current.expectations.find(r => r.code === `ON-SCI-2022-G1-${code}`).disposition, 'Partial', 'Unreviewed overall/finite-resource closure');
  const season = load('reports/ontario-grade1-daily-seasonal-current-ledger-2026-11-11.json');
  assert.equal(season.expectations.find(r => r.code.endsWith('-E2.1')).disposition, 'Partial', 'Seasonal cause remains separate');
}
test('four reviewed energy residuals have complete independent source/resource bindings', () => check());
test('home/school/community, plant contrast and four-season forms cannot disappear', () => {
  for (const [code, op] of [['C1', 'community-assessed-use'], ['C1.1', 'school-use-purpose'], ['C1.2', 'other-living-independent-plant-contrast'], ['C1.2', 'no-usable-electricity-not-only-mains'], ['C2.6', 'all-four-selected-seasons'], ['C2.6', 'forms-light-thermal-movement']]) {
    const r = structuredClone(resource); const task = required[code].task;
    r.assessments[task].learnerActions = r.assessments[task].learnerActions.filter(a => a.operation !== op);
    assert.throws(() => check(r), /performance omitted/);
  }
});
test('explicit energy labels cannot become arbitrary effects or the older vocabulary gate', () => {
  for (const field of ['introductoryForms', 'requiresFullOlderEnergyVocabulary', 'arbitraryEffectsAreSeparateFormalForms']) {
    const r = structuredClone(resource); const words = r.preparedCases['seasonal-uses-forms'].teacherEnergyLanguage;
    if (field === 'introductoryForms') words[field].splice(1, 1); else words[field] = true;
    assert.throws(() => check(r), /forms|required|vocabulary/);
  }
});
test('copied choices, missing source/transfer and child-count overalls cannot pass', () => {
  const copying = structuredClone(resource); copying.assessments['electricity-loss'].studyCardCopyingSufficient = true; assert.throws(() => check(copying), /Copying/);
  const transfer = structuredClone(resource); delete transfer.preparedCases['three-settings'].changedCase; assert.throws(() => check(transfer), /boundary/);
  const source = structuredClone(resource); delete source.resources['eia-conservation']; assert.throws(() => check(source), /source/);
  const overall = structuredClone(resource); overall.protocols.C1.independentOverallNotChildCount = false; assert.throws(() => check(overall), /Overall/);
});
test('finite-resource/overall residuals and weather/clothing roles remain honest', () => {
  const rows = structuredClone(ledger); rows.expectations.find(r => r.code.endsWith('-C2.5')).disposition = 'Full'; assert.throws(() => check(resource, rows), /finite-resource/);
  const r = structuredClone(resource); r.protocols['C2.6'].contributorIds.push('mt_go5i87u2b9'); assert.throws(() => check(r));
  const missing = structuredClone(ledger); delete missing.expectations.find(r => r.code.endsWith('-C1.2')).dossier; assert.throws(() => check(resource, missing), /dossier/);
});
