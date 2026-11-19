import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const ledger = read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme = read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const bindings = {
  'G1-D1.5': ['body-mind-overall-health'], 'G1-D3.3': ['linked-thoughts-feelings-actions'],
  'G2-D1.6': ['body-brain-and-comfortable-support'], 'G2-D2.5': ['feeling-names-and-help'],
  'G3-D1.6': ['perceived-threat-brain-body-response'], 'G3-D3.4': ['external-causes-and-control'],
  'G4-D2.5': ['daily-choices-and-support'], 'G4-D3.3': ['external-causes-and-control'],
  'G5-D2.6': ['peer-help-and-limits'], 'G5-D3.4': ['attitudes-stigma-and-inclusion'],
  'G6-D1.4': ['actual-school-community-access'], 'G6-D1.5': ['linked-thoughts-feelings-actions']
};
const rows = ledger.records.filter(r => Object.hasOwn(bindings, r.sourceKey.split('2019-')[1]));
function qualify(r, p = programme) {
  assert.equal(r.disposition, 'Full'); assert.deepEqual(r.protocolIds, bindings[r.sourceKey.split('2019-')[1]]);
  const byId = new Map(p.protocols.map(p => [p.id, p]));
  const conditions = Object.fromEntries(r.protocolIds.map(id => [id, byId.get(id).sourceConditions]));
  assert.deepEqual(r.sourceRequirements.protocolConditions, conditions);
  assert.deepEqual(r.requiredConditions, Object.values(conditions));
  assert.deepEqual(r.sourceRequirements.sourceModels, Object.fromEntries(r.protocolIds.map(id => [id, byId.get(id).sourceModel])));
  assert.equal(r.sourceRequirements.noOlderStressPhysiologyMasteryInferred, true);
}
test('all twelve mental-health source duties retain actual causal, practical and access tasks', () => {
  assert.equal(rows.length, 12); rows.forEach(r => qualify(r));
  assert.equal(rows.reduce((n, r) => n + r.topicContributions.length, 0), 23);
  const a = read('data/curriculum-alignments.json').alignments;
  for (const r of rows) for (const c of r.topicContributions) {
    assert.equal(c.role, 'component');
    assert.ok(a.some(a => a.topicId === c.topicId && a.country === 'CA' && a.region === 'Ontario' && a.ageRangeStart === r.grade + 5 && a.ageRangeEnd === r.grade + 6 && a.standards.includes(r.sourceKey)));
  }
});
test('a valid general coping task cannot replace the perceived-threat mechanism', () => {
  const r = structuredClone(rows.find(r => r.sourceKey.endsWith('G3-D1.6'))); r.protocolIds = ['external-causes-and-control']; assert.throws(() => qualify(r));
});
test('wrong source conditions cannot survive an otherwise valid protocol reference', () => {
  const r = structuredClone(rows.find(r => r.sourceKey.endsWith('G6-D1.4'))); r.sourceRequirements.protocolConditions[r.protocolIds[0]] = programme.protocols[0].sourceConditions;
  assert.throws(() => qualify(r));
});
function limits(p = programme) {
  const byId = new Map(p.protocols.map(p => [p.id, p]));
  const threat = byId.get('perceived-threat-brain-body-response').sourceModel;
  for (const k of ['perceivedThreatNotAlwaysActualDanger', 'automaticProtectiveResponse', 'thoughtEmotionActionRelationRequired']) assert.equal(threat[k], true);
  for (const k of ['freezingMeansConsentOrDefiance', 'allResponsesVoluntary', 'actualThreatInduction']) assert.equal(threat[k], false);
  assert.equal(byId.get('linked-thoughts-feelings-actions').sourceModel.positiveThinkingCuresIllness, false);
  const peer = byId.get('peer-help-and-limits').sourceModel;
  assert.equal(peer.peerIsTherapist, false); assert.equal(peer.dangerAlwaysKeptSecret, false);
  const access = byId.get('actual-school-community-access').sourceModel;
  assert.equal(access.ageEligibleActualServiceRequired, true); assert.equal(access.schoolRouteAndFallbackBoundAtUse, true);
  assert.equal(access.realContactRequired, false); assert.equal(access.promiseAbsoluteSecrecyInDanger, false);
}
test('protective response and help models preserve agency, uncertainty and clinical limits', () => limits());
test('forced voluntary response, positive-thinking cure and peer secrecy cannot pass', () => {
  for (const [id, key] of [['perceived-threat-brain-body-response', 'allResponsesVoluntary'], ['linked-thoughts-feelings-actions', 'positiveThinkingCuresIllness'], ['peer-help-and-limits', 'dangerAlwaysKeptSecret'], ['actual-school-community-access', 'realContactRequired']]) {
    const p = structuredClone(programme); p.protocols.find(p => p.id === id).sourceModel[key] = true; assert.throws(() => limits(p));
  }
});
test('help never requires a perfect English label, diagnosis or manufactured distress', () => {
  const p = programme.protocols.find(p => p.id === 'feeling-names-and-help');
  assert.equal(p.sourceModel.perfectEnglishWordRequiredBeforeHelp, false); assert.equal(p.sourceModel.privateDisclosureRequired, false);
  const a = read('data/curriculum-alignments.json').alignments;
  assert.ok(a.some(a => a.topicId === 'mt_69hFD2NgGe' && a.country === 'CA' && a.region === 'Ontario' && a.ageRangeStart === 7 && a.ageRangeEnd === 8 && a.standards.includes('the-ontario-curriculum-health-and-physical-educa:ON-HPE-2019-G2-D2.5')));
  assert.equal(programme.conditions.mentalHealth.noManufacturedThreatDistressOrBodyResponse, true);
  for (const id of ['mt_0VOZSVjo6c', 'mt_gf4RUcACLg']) assert.ok(!rows.some(r => r.topicContributions.some(c => c.topicId === id)));
});
