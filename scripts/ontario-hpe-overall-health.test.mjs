import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const ledger = read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme = read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const protocols = { D1: 'healthy-living-overall-knowledge-portfolio', D2: 'healthy-living-overall-action-portfolio', D3: 'healthy-living-overall-connections-portfolio' };
const parents = ledger.records.filter(r => Object.hasOwn(protocols, r.officialCode));
function qualify(r, l = ledger) {
  assert.equal(r.disposition, 'Full'); assert.deepEqual(r.protocolIds, [protocols[r.officialCode]]);
  const children = l.records.filter(c => c.grade === r.grade && c.recordKind === 'specific' && c.officialCode.startsWith(`${r.officialCode}.`));
  assert.ok(children.length); assert.ok(children.every(c => c.disposition === 'Full'));
  const c = r.sourceRequirements.composition;
  assert.deepEqual(c.childSourceKeys, children.map(c => c.sourceKey).sort());
  assert.deepEqual(c.childProtocolIds, [...new Set(children.flatMap(c => c.protocolIds))].sort());
  assert.deepEqual(r.topicContributions.map(c => c.topicId).sort(), [...new Set(children.flatMap(c => c.topicContributions.map(c => c.topicId)))].sort());
  assert.equal(c.integratedProtocolId, protocols[r.officialCode]); assert.equal(c.allChildConditionsRetained, true);
  assert.equal(c.independentWholeClaimCertification, false); assert.equal(r.sourceRequirements.noLinkCountAsCoverage, true);
  assert.equal(c.gradePanel, programme.overallHealthyLivingGradePanels[r.grade][{ D1: 'knowledge', D2: 'action', D3: 'connections' }[r.officialCode]]);
}
test('eighteen overall records compose all exact same-grade duties and actual tasks', () => {
  assert.equal(parents.length, 18); parents.forEach(r => qualify(r));
  assert.equal(parents.reduce((n, r) => n + r.topicContributions.length, 0), 141);
  const a = read('data/curriculum-alignments.json').alignments;
  for (const r of parents) for (const c of r.topicContributions) assert.ok(a.some(a => a.topicId === c.topicId && a.country === 'CA' && a.region === 'Ontario' && a.ageRangeStart === r.grade + 5 && a.ageRangeEnd === r.grade + 6 && a.standards.includes(r.sourceKey)));
});
test('dropping one child cannot preserve Full through an unchanged goal label', () => {
  const r = structuredClone(parents[0]); r.sourceRequirements.composition.childSourceKeys.pop(); assert.throws(() => qualify(r));
});
test('a different valid source child cannot substitute for the same-grade portfolio', () => {
  const r = structuredClone(parents[0]); r.sourceRequirements.composition.childSourceKeys[0] = ledger.records.find(c => c.grade === 2 && c.officialCode === 'D1.1').sourceKey; assert.throws(() => qualify(r));
});
test('child identifiers alone cannot omit actual protocols or replace knowledge with action', () => {
  for (const change of [r => r.sourceRequirements.composition.childProtocolIds.pop(), r => r.protocolIds = [protocols.D2], r => r.sourceRequirements.composition.allChildConditionsRetained = false]) {
    const r = structuredClone(parents[0]); change(r); assert.throws(() => qualify(r));
  }
});
test('an unqualified child or missing integrative panel prevents an overall Full judgment', () => {
  const l = structuredClone(ledger); const r = l.records.find(r => r.sourceKey === parents[0].sourceKey);
  l.records.find(c => c.sourceKey === r.sourceRequirements.composition.childSourceKeys[0]).disposition = 'Partial'; assert.throws(() => qualify(r, l));
  const p = structuredClone(parents[0]); p.sourceRequirements.composition.gradePanel = ''; assert.throws(() => qualify(p));
});
