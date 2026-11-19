import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const ledger = read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme = read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const bindings = {
  'G1-D3.2': ['habits-harms-alternatives'], 'G2-D1.3': ['medicines-authorisation-and-safe-use'],
  'G2-D3.2': ['nonmedicine-health-support'], 'G3-D1.3': ['substance-effects-and-dependence'],
  'G3-D2.3': ['pressure-choice-refusal-and-support', 'substance-effects-and-dependence'],
  'G4-D1.4': ['smoke-vape-constituents-and-effects'], 'G4-D2.3': ['pressure-choice-refusal-and-support'],
  'G4-D3.2': ['smoke-vape-constituents-and-effects'], 'G5-D1.2': ['alcohol-effects-and-variable-risk'],
  'G5-D2.3': ['pressure-choice-refusal-and-support'], 'G5-D3.3': ['personal-social-factors-and-support'],
  'G6-D1.2': ['cannabis-other-drugs-and-range-of-effects'],
  'G6-D2.4': ['pressure-choice-refusal-and-support', 'cannabis-other-drugs-and-range-of-effects']
};
const rows = ledger.records.filter(r => Object.hasOwn(bindings, r.sourceKey.split('2019-')[1]));
function qualify(row, p = programme) {
  assert.deepEqual(row.protocolIds, bindings[row.sourceKey.split('2019-')[1]]); assert.equal(row.disposition, 'Full');
  const byId = new Map(p.protocols.map(p => [p.id, p]));
  const conditions = Object.fromEntries(row.protocolIds.map(id => [id, byId.get(id).sourceConditions]));
  assert.deepEqual(row.sourceRequirements.protocolConditions, conditions);
  assert.deepEqual(row.requiredConditions, Object.values(conditions));
  assert.deepEqual(row.sourceRequirements.sourceModels, Object.fromEntries(row.protocolIds.map(id => [id, byId.get(id).sourceModel])));
  assert.equal(row.sourceRequirements.wholeOlderDrugClaimNotInferred, true);
}
test('all13 source positions retain actual effects, choice and care protocols at exact bands', () => {
  assert.equal(rows.length, 13); rows.forEach(r => qualify(r));
  assert.equal(rows.reduce((n, r) => n + r.topicContributions.length, 0), 27);
  const a = read('data/curriculum-alignments.json').alignments;
  for (const r of rows) for (const c of r.topicContributions) {
    assert.equal(c.role, 'component'); assert.notEqual(c.topicId, 'mt_2R3xRpYhMa');
    assert.ok(a.some(a => a.topicId === c.topicId && a.country === 'CA' && a.region === 'Ontario' && a.ageRangeStart === r.grade + 5 && a.ageRangeEnd === r.grade + 6 && a.standards.includes(r.sourceKey)));
  }
});
test('a valid refusal protocol cannot replace smoke/aerosol factual knowledge', () => {
  const r = structuredClone(rows.find(r => r.sourceKey.endsWith('G4-D1.4'))); r.protocolIds = ['pressure-choice-refusal-and-support']; assert.throws(() => qualify(r));
});
test('source models cannot drift independently from their exact record bindings', () => {
  const r = structuredClone(rows.find(r => r.sourceKey.endsWith('G6-D1.2'))); r.sourceRequirements.sourceModels[r.protocolIds[0]].cocaineOrMethamphetamineAreOpioids = true; assert.throws(() => qualify(r));
});
function accurateModels(p = programme) {
  const byId = new Map(p.protocols.map(p => [p.id, p]));
  const smoke = byId.get('smoke-vape-constituents-and-effects').sourceModel;
  for (const k of ['allVapesContainTarOrCO', 'nicotineIsOnlySmokingCarcinogen', 'aerosolHarmlessWater']) assert.equal(smoke[k], false);
  assert.equal(smoke.longTermVapingUncertaintyRetained, true);
  const range = byId.get('cannabis-other-drugs-and-range-of-effects').sourceModel;
  assert.equal(range.cocaineOrMethamphetamineAreOpioids, false); assert.equal(range.intoxicatingSolventEffectsRequired, true);
  const choice = byId.get('pressure-choice-refusal-and-support').sourceModel;
  for (const k of ['actualRefusalAndDecisionPerformance', 'nonSubstanceBehaviourChoiceIncluded', 'abstentionAvailable']) assert.equal(choice[k], true);
}
test('factual models distinguish combustion, aerosol, drug classes and actual choices', () => accurateModels());
test('wrong science or a knowledge-only substitute cannot pass task qualification', () => {
  for (const [id, key, value] of [['smoke-vape-constituents-and-effects', 'allVapesContainTarOrCO', true], ['cannabis-other-drugs-and-range-of-effects', 'intoxicatingSolventEffectsRequired', false], ['pressure-choice-refusal-and-support', 'actualRefusalAndDecisionPerformance', false]]) {
    const p = structuredClone(programme); p.protocols.find(p => p.id === id).sourceModel[key] = value; assert.throws(() => accurateModels(p));
  }
});
test('nonmedicine support keeps actual ordinary care and never delegates diagnosis/treatment changes', () => {
  const p = programme.protocols.find(p => p.id === 'nonmedicine-health-support');
  assert.deepEqual(p.originalCareCases.map(c => c.id), ['adult-assessed-cold', 'adult-assessed-mild-headache', 'reduce-transmission']);
  assert.equal(p.originalCareCases[0].guaranteedCure, false); assert.equal(p.originalCareCases[1].learnerDeterminesMinorStatus, false);
  assert.equal(p.originalCareCases[2].actualBenignHandwashing, true);
  assert.equal(p.sourceModel.replacePrescribedCareWithoutClinician, false);
  const older = read('data/topics.json').topics.find(t => t.id === 'mt_2R3xRpYhMa');
  assert.equal(older.ageRangeStart, 13); assert.equal(older.ageRangeEnd, 14);
});
