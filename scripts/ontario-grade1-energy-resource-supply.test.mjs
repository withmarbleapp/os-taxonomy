import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url)));
const report = load('reports/ontario-grade1-energy-resource-supply-task-design-2026-11-12.json');
const ledger = load('reports/ontario-grade1-energy-resource-supply-current-ledger-2026-11-12.json');
const topics = load('data/topics.json').topics;
const contexts = load('data/curriculum-alignments.json').alignments;
const research = load('data/teaching-research.json').records;
const edges = load('data/dependencies.json').dependencies;
const id = 'mt_v8gu9eSaEg';
function check(r = report) {
  const card = topics.find(t => t.id === id);
  assert.deepEqual(r.newWholeCard, card);
  assert.equal(card.evidence.length, 4);
  assert.deepEqual([card.ageRangeStart, card.ageRangeEnd], [6, 7]);
  const offers = contexts.filter(c => c.topicId === id);
  assert.equal(offers.length, 1);
  assert.deepEqual([offers[0].country, offers[0].region, offers[0].ageRangeStart, offers[0].ageRangeEnd], ['CA', 'Ontario', 6, 7]);
  assert.equal(edges.filter(e => e.topicId === id).length, 0);
  assert.deepEqual(r.newHardPrerequisites, []);
  assert.equal(research.find(g => g.topicId === id).confidence, 'low');
  assert.equal(research.find(g => g.topicId === id).learn.schemaVersion, 2);
  assert.deepEqual(r.readAloudStudyCards.map(c => c.id), ['underground-fuels', 'moving-air-and-sunlight', 'finite-stock-model', 'new-delivery']);
  assert.ok(r.readAloudStudyCards.every(c => c.text.length >= 1));
  assert.deepEqual(ledger.records.map(c => c.code), ['ON-SCI-2022-G1-C2', 'ON-SCI-2022-G1-C2.5']);
  for (const row of ledger.records) {
    assert.equal(row.disposition, 'Full'); assert.equal(row.historicalDisposition, 'Partial');
    const protocol = row.protocolReference.split('/').slice(1).reduce((v, k) => v?.[k], r);
    assert.equal(protocol?.requiresIndependentPerformance, true);
  }
  assert.equal(r.protocols.C2.independentOverallNotChildCount, true);
  assert.equal(r.protocols.C2.assessment.childCountOrCopiedCardsSufficient, false);
  assert.equal(r.protocols.C2.assessment.oldApplianceAgeLowered, false);
  assert.deepEqual(r.protocols.C2.assessment.requiredEvidence, ['energy-movement-change-and-life', 'sun-principal-not-only', 'solar-air-land-water-light-green-plant', 'animal-and-person-food-energy', 'source-useful-stock-use-relation', 'changed-day-season-use-transfer']);
  assert.deepEqual(r.protocols['C2.5'].requiredEvidence, ['natural-origins-versus-handling', 'finite-useful-stock-not-energy-disappearance', 'donor-recipient-transfer', 'changed-essential-need', 'source-specific-availability']);
  assert.equal(r.originalStockResource.isObservedReserveOrLearnerResult, false);
  assert.equal(r.fullIndependentAssessment.exactSequenceReference, '/originalStockResource/independentSequence');
  assert.match(r.fullIndependentAssessment.materials.at(-1), /TWO counters.*available B.*independentSequence/);
  assert.match(r.fullIndependentAssessment.materials.at(-1), /four-counter.*separate teaching model/);
  assert.match(r.originalStockResource.purposeCards.changed, /occupied.*needs suitable warmth/);
  for (const pair of r.newComponentPairs) {
    assert.equal(pair.role, 'component');
    assert.ok(contexts.some(c => c.topicId === pair.topicId && c.country === 'CA' && c.region === 'Ontario' && c.ageRangeStart === 6 && c.ageRangeEnd === 7 && c.standards.includes(`the-ontario-curriculum-science-and-technology-20:ON-SCI-2022-G1-${pair.code}`)));
  }
}
test('complete useful-resource claim and independent C2 synthesis retain exact source bindings', () => check());
test('declared stock deliveries move useful fuel and use is separately represented', () => {
  const model = report.originalStockResource;
  const state = structuredClone(model.independentInitial);
  const total = Object.values(state).reduce((a, b) => a + b, 0);
  for (const action of model.independentSequence) {
    assert.ok(state[action.from] >= action.amount);
    state[action.from] -= action.amount; state[action.to] += action.amount;
    assert.equal(Object.values(state).reduce((a, b) => a + b, 0), total, 'Markers change location, not a claim that physical energy vanishes');
    if (action.operation === 'use') assert.equal(action.to, 'alreadyUsed');
  }
  assert.deepEqual(state, model.independentKeyFinal);
  assert.equal(state.availableA + state.availableB + state.shop, total - state.alreadyUsed);
});
test('missing finite, solar/plant or independent-overall requirements cannot pass', () => {
  const finite = structuredClone(report); finite.protocols['C2.5'].requiredEvidence.splice(2, 1); assert.throws(() => check(finite));
  const solar = structuredClone(report); solar.protocols.C2.assessment.requiredEvidence.splice(2, 1); assert.throws(() => check(solar));
  const parent = structuredClone(report); parent.protocols.C2.independentOverallNotChildCount = false; assert.throws(() => check(parent));
});
