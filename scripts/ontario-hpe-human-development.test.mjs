import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const ledger = read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme = read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const bindings = {
  'G1-D1.3': ['body-names-and-respect'], 'G1-D1.4': ['senses-and-brain-function'],
  'G1-D2.5': ['hygiene-and-oral-performance'], 'G2-D1.4': ['life-course-and-health-factors'],
  'G2-D1.5': ['body-capability-care-and-image'], 'G2-D2.4': ['hygiene-and-oral-performance'],
  'G3-D1.4': ['healthy-relationships-and-consent'],
  'G3-D1.5': ['life-course-and-health-factors', 'body-capability-care-and-image'],
  'G3-D3.3': ['visible-and-unseen-differences'], 'G4-D1.5': ['puberty-whole-overview-and-social-change'],
  'G4-D2.4': ['puberty-personal-care'],
  'G5-D1.3': ['puberty-whole-overview-and-social-change', 'g5-reproductive-knowledge-separate-binding', 'reproduction-complete-whole-fit'],
  'G5-D1.4': ['g5-reproductive-knowledge-separate-binding', 'reproduction-complete-whole-fit'],
  'G5-D2.4': ['identity-intersections-and-support'], 'G5-D2.5': ['puberty-stress-help-and-coping'],
  'G6-D1.3': ['nonexplicit-media-representation-limits'],
  'G6-D2.5': ['puberty-whole-overview-and-social-change', 'puberty-stress-help-and-coping'],
  'G6-D2.6': ['healthy-relationships-and-consent'], 'G6-D3.3': ['stereotypes-impact-and-change']
};
const rows = ledger.records.filter(r => Object.hasOwn(bindings, r.sourceKey.split('2019-')[1]));
function qualify(row, p = programme) {
  const suffix = row.sourceKey.split('2019-')[1];
  assert.deepEqual(row.protocolIds, bindings[suffix]); assert.equal(row.disposition, 'Full');
  const protocols = new Map(p.protocols.map(p => [p.id, p]));
  const conditions = Object.fromEntries(row.protocolIds.map(id => [id, protocols.get(id).sourceConditions]));
  assert.deepEqual(row.sourceRequirements.protocolConditions, conditions);
  assert.deepEqual(row.requiredConditions, Object.values(conditions));
  for (const key of ['actualWholeSourceTaskRequired', 'noBodyInspectionOrPrivateHistory', 'noClinicalTimingOrHormoneFeedbackGate']) assert.equal(row.sourceRequirements[key], true);
}
test('all19 human-development records retain exact source-specific tasks and conditions', () => {
  assert.equal(rows.length, 19); rows.forEach(r => qualify(r));
  const alignments = read('data/curriculum-alignments.json').alignments;
  for (const row of rows) for (const c of row.topicContributions) {
    assert.equal(c.role, 'component');
    assert.ok(alignments.some(a => a.topicId === c.topicId && a.country === 'CA' && a.region === 'Ontario' && a.ageRangeStart === row.grade + 5 && a.ageRangeEnd === row.grade + 6 && a.standards.includes(row.sourceKey)));
  }
});
test('a valid puberty task cannot replace the actual Grade5 processes and whole-fit task', () => {
  const row = structuredClone(rows.find(r => r.sourceKey.endsWith('G5-D1.4')));
  row.protocolIds = ['puberty-whole-overview-and-social-change']; assert.throws(() => qualify(row));
});
test('a different valid safety condition cannot substitute for anatomy/privacy conditions', () => {
  const row = structuredClone(rows[0]); row.sourceRequirements.protocolConditions[row.protocolIds[0]] = programme.protocols[0].sourceConditions;
  assert.throws(() => qualify(row));
});
function qualifyExchange(p = programme) {
  const model = p.protocols.find(p => p.id === 'reproduction-complete-whole-fit').originalAssessmentMaterials.exchangeModel;
  assert.deepEqual(model.movableArrows, [
    { label: 'oxygen', from: 'maternal side', to: 'foetal side' },
    { label: 'nutrients', from: 'maternal side', to: 'foetal side' },
    { label: 'carbon dioxide/waste', from: 'foetal side', to: 'maternal side' }
  ]);
  assert.ok(model.answer.includes('two blood supplies normally remain separate'));
  assert.ok(model.answer.includes('nutrients also cross, without requiring names of all transport mechanisms'));
}
test('the actual exchange model retains two-way movement and separate circulations', () => qualifyExchange());
test('a reversed waste arrow or one-way nourishment model cannot pass', () => {
  for (const change of [p => p.protocols.find(p => p.id === 'reproduction-complete-whole-fit').originalAssessmentMaterials.exchangeModel.movableArrows.pop(), p => p.protocols.find(p => p.id === 'reproduction-complete-whole-fit').originalAssessmentMaterials.exchangeModel.movableArrows[2].from = 'maternal side']) {
    const p = structuredClone(programme); change(p); assert.throws(() => qualifyExchange(p));
  }
});
test('whole reproductive claim keeps all evidence, older scope and the exact approved source context', () => {
  const card = read('data/topics.json').topics.find(t => t.id === 'mt_tQkCzRcWG7');
  assert.equal(card.evidence.length, 4); assert.ok(card.description.includes('gestation, and birth including the role of the placenta'));
  const a = read('data/curriculum-alignments.json').alignments.filter(a => a.topicId === card.id);
  assert.ok(a.some(a => a.ageRangeStart === 12 && a.ageRangeEnd === 13));
  assert.deepEqual(a.find(a => a.country === 'CA' && a.region === 'Ontario'), { topicId: card.id, scope: 'jurisdiction', country: 'CA', region: 'Ontario', ageRangeStart: 10, ageRangeEnd: 11, standards: ['the-ontario-curriculum-health-and-physical-educa:ON-HPE-2019-G5-D1.3', 'the-ontario-curriculum-health-and-physical-educa:ON-HPE-2019-G5-D1.4'] });
  const correction = read('reports/ontario-hpe-reproduction-whole-fit-2026-11-11.json');
  assert.equal(correction.changes.length, 12); assert.equal(new Set(correction.changes.map(c => c.path)).size, 12);
  const guide = read('data/teaching-research.json').records.find(g => g.topicId === card.id);
  for (const c of correction.changes) {
    assert.equal(c.path.split('/').filter(Boolean).reduce((v, k) => v[k], guide), c.after);
  }
  assert.ok(guide.assess.correctAnswer.includes('nutrients cross by different transport mechanisms'));
});
