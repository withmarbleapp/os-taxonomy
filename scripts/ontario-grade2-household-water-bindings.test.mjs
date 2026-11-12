import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const text = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const load = path => JSON.parse(text(path));
const dossier = 'ontario-grade2-household-water-sources-task-design-2026-11-12.json';
const resource = load(`reports/${dossier}`);
const ledger = load('reports/ontario-grade2-household-water-sources-current-ledger-2026-11-12.json');
const contexts = load('data/curriculum-alignments.json').alignments;
const topics = new Map(load('data/topics.json').topics.map(r => [r.id, r]));
const required = {
  'E1.2': ['actual-personal-use-assessment', 'actual-household-use-assessment', 'plan-fitted-to-record', 'ordered-steps-and-information', 'reason-and-needed-use-boundary', 'changed-household-transfer'],
  'E2.2': ['multiple-natural-water-sources', 'multiple-built-access-storage-supply-cases', 'natural-to-built-route-explanation', 'well-versus-groundwater-distinction', 'empty-tank-and-tap-countercases', 'fresh-learner-example'],
};
function check(tasks = resource, rows = ledger) {
  assert.deepEqual(rows.records.filter(r => r.disposition === 'Full').map(r => r.code), ['ON-SCI-2022-G2-E1.2', 'ON-SCI-2022-G2-E2.2']);
  for (const code of ['E1', 'E1.1', 'E1.3', 'E2', 'E2.1']) assert.equal(rows.records.find(r => r.code === `ON-SCI-2022-G2-${code}`)?.disposition, 'Partial');
  assert.equal(rows.historicalE2_3E2_4E2_5NotRecertified, true);
  const readable = text(`reports/${tasks.readableResource}`);
  for (const [code, evidence] of Object.entries(required)) {
    const row = rows.records.find(r => r.code === `ON-SCI-2022-G2-${code}`);
    assert.equal(row.resource, dossier);
    const protocol = row.protocolReference.split('/').slice(1).reduce((v, k) => v?.[k], tasks);
    assert.ok(protocol, 'Source ledger protocol must resolve');
    assert.equal(protocol.requiresIndependentPerformance, true);
    assert.equal(protocol.wholeTopicAwardFromThisTaskAlone, false);
    assert.deepEqual(protocol.requiredEvidence, evidence, 'Independent source requirement omitted');
    assert.ok(readable.includes(`## ${protocol.assessmentSection}`), 'Actual assessment section must exist');
    for (const section of protocol.studySections) assert.ok(readable.includes(`## ${section}`), 'Actual study/printable section must exist');
  }
  assert.equal(tasks.protocols['E1.2'].requiresActualPersonalAndHouseholdUseAssessment, true);
  assert.equal(tasks.protocols['E1.2'].inventedHouseholdObservationsSufficient, false, 'No invented household evidence');
  assert.equal(tasks.protocols['E1.2'].copiedConservationListSufficient, false, 'No copied plan as performance');
  assert.equal(tasks.protocols['E1.2'].preserveNecessaryUses, true);
  assert.equal(tasks.protocols['E2.2'].genericNaturalBuiltSortSufficient, false);
  assert.equal(tasks.protocols['E2.2'].tapCreatesWater, false);
  assert.equal(tasks.protocols['E2.2'].allNaturalWaterSafeToDrink, false);
  for (const pair of tasks.existingComponentPairs) assert.ok(contexts.some(c => c.topicId === pair.topicId && c.country === 'CA' && c.region === 'Ontario' && c.ageRangeStart === 7 && c.ageRangeEnd === 8 && c.standards.includes(`the-ontario-curriculum-science-and-technology-20:ON-SCI-2022-G2-${pair.code}`)), 'Existing component context must resolve');
  for (const card of tasks.wholeCards) assert.deepEqual(card, topics.get(card.id), 'Whole card must stay intact');
  assert.equal(rows.newPairs, 0); assert.equal(rows.newTopics, 0); assert.equal(rows.newContexts, 0);
}
test('two water closures bind accessible independent tasks and existing complete claims', () => check());
test('invented use records, missing source duties and dangling protocols cannot pass', () => {
  const invented = structuredClone(resource); invented.protocols['E1.2'].inventedHouseholdObservationsSufficient = true;
  assert.throws(() => check(invented), /invented household/);
  const missing = structuredClone(resource); missing.protocols['E2.2'].requiredEvidence.pop();
  assert.throws(() => check(missing), /requirement omitted/);
  const dangling = structuredClone(ledger); dangling.records.find(r => r.code.endsWith('-E1.2')).protocolReference = '/protocols/missing';
  assert.throws(() => check(resource, dangling), /must resolve/);
});
