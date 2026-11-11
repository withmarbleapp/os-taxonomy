import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const report = read('reports/ontario-hpe-medicines-claim-2026-11-11.json');
function qualify(r = report) {
  assert.deepEqual(r.originalCases.map(c => c.id), ['known-prescription-and-otc', 'changed-recipient', 'unclear-or-natural']);
  const [known, changed, unclear] = r.originalCases;
  assert.deepEqual(known.prescription, { example: 'antibiotic', authorisedRecipient: 'Sam', requiresPrescription: true });
  assert.deepEqual(known.nonPrescription, { example: 'acetaminophen', localStatusSupplied: true, requiresPrescription: false });
  assert.equal(known.bothNeedInstructionsAndAdultGuidance, true);
  assert.equal(known.appearanceDeterminesStatus, false);
  assert.equal(changed.prescriptionRecipient, 'Sam');
  assert.equal(changed.offeredTo, 'friend');
  assert.equal(changed.similarSymptomsAuthoriseSharing, false);
  assert.equal(changed.response, 'responsible-adult-or-pharmacist-help');
  assert.deepEqual(unclear.cases, ['unreadable-instructions', 'natural-means-safe']);
  assert.equal(unclear.response, 'responsible-adult-or-pharmacist-help');
  for (const key of ['trialDose', 'doseCalculation', 'childDiagnosis']) assert.equal(unclear[key], false);
  for (const value of Object.values(r.assessmentBoundaries)) assert.equal(value, true);
}
test('medicine cases distinguish supplied authorisation from recipient and uncertainty', () => qualify());
test('availability cannot silently remove instructions or make appearance decisive', () => {
  for (const change of [r => r.originalCases[0].bothNeedInstructionsAndAdultGuidance = false, r => r.originalCases[0].appearanceDeterminesStatus = true, r => r.originalCases[0].nonPrescription.localStatusSupplied = false]) {
    const r = structuredClone(report); change(r); assert.throws(() => qualify(r));
  }
});
test('a valid known recipient case cannot replace changed-recipient reasoning', () => {
  const r = structuredClone(report); r.originalCases[1] = structuredClone(r.originalCases[0]); assert.throws(() => qualify(r));
});
test('similar symptoms cannot authorise sharing a named prescription', () => {
  const r = structuredClone(report); r.originalCases[1].similarSymptomsAuthoriseSharing = true; assert.throws(() => qualify(r));
});
test('uncertainty never becomes trial exposure, diagnosis or dose arithmetic', () => {
  for (const key of ['trialDose', 'doseCalculation', 'childDiagnosis']) {
    const r = structuredClone(report); r.originalCases[2][key] = true; assert.throws(() => qualify(r));
  }
});
test('real medicines and private treatment cannot replace fictional safe-use knowledge', () => {
  for (const key of ['noActualMedicine', 'noPrivateTreatmentHistory', 'noMissedDoseAdvice']) {
    const r = structuredClone(report); r.assessmentBoundaries[key] = false; assert.throws(() => qualify(r));
  }
});
test('one fixed medicine concept has its exact Grade2 component and no clinical hard gate', () => {
  const card = read('data/topics.json').topics.find(t => t.id === report.topicId);
  assert.equal(card.type, 'CONCEPTUAL'); assert.equal(card.domain, 'Health & Safety');
  assert.deepEqual(read('data/curriculum-alignments.json').alignments.filter(a => a.topicId === card.id), [{ topicId: card.id, scope: 'jurisdiction', country: 'CA', region: 'Ontario', ageRangeStart: 7, ageRangeEnd: 8, standards: ['the-ontario-curriculum-health-and-physical-educa:ON-HPE-2019-G2-D1.3'] }]);
  assert.equal(read('data/dependencies.json').dependencies.filter(e => e.topicId === card.id).length, 0);
  const guide = read('data/teaching-research.json').records.find(g => g.topicId === card.id);
  assert.equal(guide.confidence, 'low'); assert.equal(guide.learn.activities.length, 3);
  assert.ok(guide.assess.correctAnswer.includes('No dose, diagnosis or treatment choice'));
});
