import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const ledger = read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme = read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const alignments = read('data/curriculum-alignments.json').alignments;
const slug = 'the-ontario-curriculum-health-and-physical-educa:';
function qualify(l = ledger, p = programme, a = alignments) {
  assert.equal(l.records.length, 98);
  assert.equal(l.records.filter(r => r.recordKind === 'overall').length, 18);
  const selected = new Set(l.records.map(r => r.sourceKey));
  assert.equal(selected.size, 98);
  assert.ok(l.records.every(r => /^D[123](?:\.\d+)?$/.test(r.officialCode)));
  assert.equal(l.excludedScope.records.length, 169);
  assert.equal(new Set(l.excludedScope.records.map(r => r.sourceKey)).size, 169);
  assert.ok(l.excludedScope.records.every(r => !selected.has(r.sourceKey) && /^[ABC]/.test(r.officialCode)));
  const expected = new Set(l.records.flatMap(r => r.topicContributions.map(c => `${c.topicId}|${r.sourceKey}`)));
  assert.equal(expected.size, 299);
  const actual = new Set(a.flatMap(r => r.standards.filter(s => s.startsWith(slug) && /-G[1-6]-/.test(s)).map(s => `${r.topicId}|${s}`)));
  assert.deepEqual(actual, expected);
  const protocols = new Map(p.protocols.map(r => [r.id, r]));
  const combination = protocols.get('eating-and-active-living-combination');
  assert.equal(combination.conditions.selfContainedFictionalKnowledgeCase, true);
  assert.equal(combination.conditions.actualHealthPromotionCommunication, true);
  assert.equal(combination.conditions.requiresPEParticipationOrQualification, false);
  assert.doesNotMatch(combination.task, /with the qualified Active Living routine/);
  assert.match(combination.task, /Actually create and share/);
  assert.equal(protocols.size, 61);
  assert.deepEqual(new Set(l.records.flatMap(r => r.protocolIds)), new Set(protocols.keys()));
  for (const r of l.records) for (const id of r.protocolIds) assert.ok(protocols.has(id));
  assert.equal(p.conditions.personalSafety.harmHelpDoesNotWaitForRepetition, true);
  assert.match(protocols.get('bullying-abuse-and-help').sourceConditions, /reviewed context-aware/);
  assert.doesNotMatch(protocols.get('bullying-abuse-and-help').sourceConditions, /pending separate semantic review/);
  assert.match(protocols.get('concussion-knowledge-and-school-plan').task, /including age10/);
  assert.match(protocols.get('concussion-knowledge-and-school-plan').task, /ages11–14/);
}
test('Healthy Living98 and299 exact pairs exclude PE169 while retaining source identities', () => qualify());
test('one otherwise valid PE record cannot replace a selected health duty', () => {
  const l = structuredClone(ledger); l.records[0].officialCode = 'C1'; assert.throws(() => qualify(l));
});
test('an extra PE association cannot survive a health-only ledger', () => {
  const a = structuredClone(alignments); const r = structuredClone(a.find(r => r.standards.some(s => s.startsWith(slug))));
  r.standards = [`${slug}ON-HPE-2019-G1-C1`]; a.push(r); assert.throws(() => qualify(ledger, programme, a));
});
test('a lost health association cannot be hidden by unchanged counts', () => {
  const a = structuredClone(alignments); const r = a.find(r => r.standards.some(s => s.startsWith(slug))); r.standards = r.standards.filter(s => !s.startsWith(slug)); assert.throws(() => qualify(ledger, programme, a));
});
test('the revised bullying criterion and age10 resource binding cannot regress to stale checkpoint prose', () => {
  for (const change of [p => p.protocols.find(r => r.id === 'bullying-abuse-and-help').sourceConditions = 'Keep old card unchanged pending separate semantic review', p => p.protocols.find(r => r.id === 'concussion-knowledge-and-school-plan').task = 'under10 and11–14']) {
    const p = structuredClone(programme); change(p); assert.throws(() => qualify(ledger, p));
  }
});
test('PE-only new concepts are not imported into the health-only child', () => {
  const ids = new Set(read('data/topics.json').topics.map(r => r.id));
  const guides = new Set(read('data/teaching-research.json').records.map(r => r.topicId));
  for (const id of ['mt_m9FzTqPmmg', 'mt_2IFtJJBX_n']) { assert.equal(ids.has(id), false); assert.equal(guides.has(id), false); }
  for (const id of ['mt_rVjbdwUJHG', 'mt_epG52zWuiW']) { assert.equal(ids.has(id), true); assert.equal(guides.has(id), true); }
});

test('health explanation and promotion cannot acquire a dependency on excluded PE qualification', () => {
  for (const change of [p => p.protocols.find(r => r.id === 'eating-and-active-living-combination').conditions.requiresPEParticipationOrQualification = true, p => p.protocols.find(r => r.id === 'eating-and-active-living-combination').conditions.actualHealthPromotionCommunication = false, p => p.protocols.find(r => r.id === 'eating-and-active-living-combination').task = 'Combine eating with the qualified Active Living routine']) {
    const p = structuredClone(programme); change(p); assert.throws(() => qualify(ledger, p));
  }
});
