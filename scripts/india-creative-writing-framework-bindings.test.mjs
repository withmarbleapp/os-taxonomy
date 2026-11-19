import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(name, import.meta.url)));
const report = load('../reports/india-three-creative-writing-framework-authoring-review-2026-11-12.json');
const ledger = load('../reports/india-formal-primary-completion-ledger-2026-11-12.json');
const contexts = load('../data/curriculum-alignments.json').alignments;
const oldFiles = ['ncert-foundational-language-framework', 'ncert-preparatory-language-framework',
  'ncert-english-l2-suggestive-alignment'];
const oldRows = oldFiles.flatMap(name => load(`../reports/${name}-2026-11-10.json`).records);
const pair = (id, key) => JSON.stringify([id, key]);
const prefix = 'ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-';
const expectedKeys = ['R1-COMP-C-3.3', 'R2-COMP-C-3.3', 'R2-GOAL-CG-3'].map(k => prefix + k);
function checkUnion(currentReport, currentContexts) {
  assert.deepEqual(currentReport.records.map(r => r.key).sort(), [...expectedKeys].sort());
  const added = currentReport.componentDeltas.flatMap(({ before, after }) => {
    assert.equal(after.country, 'IN');
    assert.deepEqual([after.ageRangeStart, after.ageRangeEnd], [8, 11]);
    return after.standards.filter(k => !(before?.standards ?? []).includes(k))
      .map(k => pair(after.topicId, k));
  });
  assert.deepEqual(added.sort(), [
    ...expectedKeys.map(k => pair('mt_nDAcXoPa0c', k)),
    pair('mt__MDiDU9Vck', expectedKeys[0]), pair('mt__MDiDU9Vck', expectedKeys[2]),
  ].sort(), 'only the five independently reviewed component additions');
  const keys = new Set(oldRows.map(r => r.key));
  const oldPairs = oldRows.flatMap(r => r.contributions.map(c => pair(c.topicId, r.key)));
  const actual = currentContexts.flatMap(c => c.country === 'IN'
    ? c.standards.filter(k => keys.has(k)).map(k => pair(c.topicId, k)) : []);
  assert.deepEqual([...actual].sort(), [...oldPairs, ...added].sort(), 'current language union');
  assert.equal(actual.length, new Set(actual).size, 'no duplicate source association');
  for (const key of expectedKeys) {
    assert.ok(!currentContexts.some(c => ['mt_AHXePdicRf', 'mt_vauULTecMH'].includes(c.topicId)
      && c.standards.includes(key)), 'broader rejected candidate is not silently activated');
  }
}
test('creative framework overlay binds the complete current union while preserving historical records', () => {
  checkUnion(report, contexts);
  for (const r of report.records) {
    assert.equal(r.disposition, 'Full');
    assert.equal(r.wholeMasteryFromSourceResult, false);
    assert.equal(r.deliveryConditions.length, 3);
    const current = ledger.records.find(x => x.key === r.key);
    assert.equal(current.historicalDisposition, 'ConditionalGraphRepresentation');
    assert.equal(current.currentAuthoringDisposition, 'Full');
    assert.equal(oldRows.find(x => x.key === r.key).disposition, 'ConditionalGraphRepresentation');
  }
  assert.deepEqual(ledger.currentAuthoringCounts,
    { eligible: 221, Full: 176, nonFull: 45, newSourceAuthoringFull: 7,
      acceptedMainFull: 169, acceptedMainNonFull: 52 });
});
test('creative union rejects wrong components and premature broader candidate promotion', () => {
  const wrong = structuredClone(report);
  wrong.componentDeltas[0].after.topicId = 'mt_vauULTecMH';
  assert.throws(() => checkUnion(wrong, contexts), /five independently reviewed/);
  const leaked = structuredClone(contexts);
  leaked.push({ topicId: 'mt_AHXePdicRf', country: 'IN', ageRangeStart: 8,
    ageRangeEnd: 11, standards: [expectedKeys[0]] });
  assert.throws(() => checkUnion(report, leaked), /current language union/);
});
