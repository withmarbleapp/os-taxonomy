import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const ledger = read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme = read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const families = ['sel-identify-manage-and-respond', 'sel-stress-challenge-help-application', 'sel-motivation-practice-and-hope', 'sel-relationships-empathy-and-communication', 'sel-self-awareness-identity-and-confidence', 'sel-critical-creative-connection-and-choice'];
const strands = ['ActiveLiving', 'Movement', 'HealthyLiving'];
const rows = ledger.records.filter(r => /^A1(\.|$)/.test(r.officialCode));
function qualify(r, p = programme) {
  const overall = r.officialCode === 'A1';
  const required = overall ? families : [families[Number(r.officialCode.split('.')[1]) - 1]];
  assert.equal(r.disposition, 'Full');
  assert.deepEqual(r.protocolIds, overall ? ['sel-overall-cross-strand-portfolio'] : required);
  const s = r.sourceRequirements;
  assert.deepEqual(s.requiredSkillFamilies, required); assert.deepEqual(s.strandNames, strands);
  assert.equal(s.actualThreeStrandApplicationsRequired, true); assert.equal(s.noSkillInferredFromPhysicalPerformance, true);
  assert.equal(s.noForcedPositiveFeelingOrIdentityDisclosure, true); assert.equal(s.noSingleGlobalSELScore, true);
  assert.equal(s.bestAccessibleAbilityNotNorm, true);
  assert.equal(p.conditions.integratedSel.ordinarySupportedChallengeAllowed, true);
  assert.equal(p.conditions.integratedSel.deliberateDistressInduction, false);
  assert.equal(p.conditions.integratedSel.absenceOfUpsetIsDeficit, false);
  assert.deepEqual(s.familySourceConditions, Object.fromEntries(required.map(id => [id, p.protocols.find(p => p.id === id).sourceConditions])));
  assert.deepEqual(s.gradePanel, p.selGradePanels[r.grade]);
  assert.deepEqual(Object.keys(s.gradePanel), strands);
  for (const strand of strands) {
    assert.ok(s.gradePanel[strand].case.length > 50);
    assert.ok(s.gradePanel[strand].protocolIds.length);
    for (const id of s.gradePanel[strand].protocolIds) assert.ok(p.protocols.some(p => p.id === id));
  }
  assert.deepEqual(s.overallChildSourceKeys, overall ? Array.from({ length: 6 }, (_, i) => `${ledger.source}:ON-HPE-2019-G${r.grade}-A1.${i + 1}`) : []);
}
test('all forty-two SEL source positions bind actual family and all-three-strand tasks', () => {
  assert.equal(rows.length, 42); rows.forEach(r => qualify(r));
  assert.equal(rows.reduce((n, r) => n + r.topicContributions.length, 0), 168);
  const a = read('data/curriculum-alignments.json').alignments;
  for (const r of rows) for (const c of r.topicContributions) assert.ok(a.some(a => a.topicId === c.topicId && a.country === 'CA' && a.region === 'Ontario' && a.ageRangeStart === r.grade + 5 && a.ageRangeEnd === r.grade + 6 && a.standards.includes(r.sourceKey)));
});
test('a different valid SEL family cannot replace the actual source skill', () => {
  const r = structuredClone(rows.find(r => r.officialCode === 'A1.1')); r.protocolIds = [families[1]]; assert.throws(() => qualify(r));
});
test('movement success cannot substitute for missing Active or Healthy Living application', () => {
  for (const strand of ['ActiveLiving', 'HealthyLiving']) {
    const r = structuredClone(rows[0]); delete r.sourceRequirements.gradePanel[strand]; assert.throws(() => qualify(r));
  }
});
test('an otherwise valid task from another grade cannot replace its declared source panel', () => {
  const r = structuredClone(rows.find(r => r.grade === 1)); r.sourceRequirements.gradePanel = structuredClone(programme.selGradePanels[6]); assert.throws(() => qualify(r));
});
test('overall range cannot omit a family or child source position', () => {
  for (const change of [r => r.sourceRequirements.requiredSkillFamilies.pop(), r => r.sourceRequirements.overallChildSourceKeys.pop()]) {
    const r = structuredClone(rows.find(r => r.officialCode === 'A1')); change(r); assert.throws(() => qualify(r));
  }
});
test('positive mood, motor inference or a global SEL score cannot replace applied source evidence', () => {
  for (const key of ['noForcedPositiveFeelingOrIdentityDisclosure', 'noSkillInferredFromPhysicalPerformance', 'noSingleGlobalSELScore']) {
    const r = structuredClone(rows[0]); r.sourceRequirements[key] = false; assert.throws(() => qualify(r));
  }
  for (const [key, value] of [['ordinarySupportedChallengeAllowed', false], ['deliberateDistressInduction', true], ['absenceOfUpsetIsDeficit', true]]) {
    const p = structuredClone(programme); p.conditions.integratedSel[key] = value; assert.throws(() => qualify(rows[0], p));
  }
});
test('complete source ledger and current navigation reconcile without deleting higher-grade catalogue entries', () => {
  const source = read('data/curriculum-standards.json').curricula.find(c => c.slug === ledger.source);
  const primary = source.topics.filter(t => /-G[1-6]-/.test(t.key));
  assert.equal(primary.length, 267); assert.equal(source.topics.length - primary.length, 88);
  assert.deepEqual(ledger.records.map(r => r.sourceKey).sort(), primary.map(t => t.key).sort());
  assert.equal(ledger.records.filter(r => r.disposition === 'Full').length, 267);
  assert.equal(ledger.counts.sourceFitReviewed, 267); assert.equal(ledger.counts.pendingQualification, 0);
  assert.equal(programme.integratedSelPanel.status, 'complete-source-task-design');
  assert.deepEqual(programme.integratedSelPanel.familyProtocolIds, families);
  assert.deepEqual(programme.integratedSelPanel.requiredStrands, strands);
  assert.ok(programme.integratedSelPanel.historicalMovementOnlyPanel.scope.includes('still-pending'));
  const pairs = new Set(ledger.records.flatMap(r => r.topicContributions.map(c => `${c.topicId}|${r.sourceKey}`)));
  assert.equal(pairs.size, ledger.counts.componentPairs);
  assert.equal(new Set(ledger.records.flatMap(r => r.topicContributions.map(c => c.topicId))).size, ledger.counts.topics);
});
