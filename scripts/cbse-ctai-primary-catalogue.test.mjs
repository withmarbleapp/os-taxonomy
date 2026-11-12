import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const catalogue = load('../data/curriculum-standards.json');
const source = catalogue.curricula.find(s => s.slug === 'cbse-ctai-2026');
const index = load('../reports/cbse-ctai-primary-index-2026-11-12.json');

function checkPrimaryBoundary(s, i) {
  assert.equal(s.textIncluded, false);
  assert.equal(s.topicCount, 21);
  assert.equal(i.sourceDocument.sha256, '78bed53986faafb0d0b6cd171e8d84d2fda1d00b42cb7bd332aca4762c5839e0');
  assert.equal(i.records.length, 21);
  assert.equal(new Set(i.records.map(r => r.key)).size, 21);
  assert.deepEqual(s.topics, i.records.map(({ key, code }) => ({ key, code })), 'catalogue carries identifiers only');
  const goals = i.records.filter(r => r.recordKind === 'curricularGoal');
  const competencies = i.records.filter(r => r.recordKind === 'stageCompetency');
  const outcomes = i.records.filter(r => r.recordKind === 'gradedLearningOutcomeArea');
  assert.deepEqual(goals.map(r => r.officialCode), ['CG-1', 'CG-2', 'CG-3']);
  assert.deepEqual(competencies.map(r => [r.officialCode, r.parentOfficialCode]),
    [['C-1', 'CG-1'], ['C-2', 'CG-1'], ['C-3', 'CG-2'], ['C-4', 'CG-2'], ['C-5', 'CG-2'], ['C-6', 'CG-3']]);
  for (const r of [...goals, ...competencies]) {
    assert.deepEqual(r.gradeLevels, [3, 4, 5], 'stage records appear once, with no invented per-grade deadline');
    assert.deepEqual(r.pdfPages, [r.officialCode === 'CG-3' || r.officialCode === 'C-6' ? 17 : 16]);
  }
  assert.equal(outcomes.length, 12);
  for (const grade of [3, 4, 5]) {
    const rows = outcomes.filter(r => r.gradeLevels[0] === grade);
    assert.deepEqual(rows.map(r => r.ordinal), [1, 2, 3, 4], 'four parent boxes, not nested clauses');
    assert.deepEqual(rows.map(r => r.area), ['Abstract Thinking', 'Pattern Recognition', 'Decomposition', 'Algorithmic Thinking']);
    for (const r of rows) {
      assert.deepEqual(r.gradeLevels, [grade]);
      assert.equal(r.officialCode, null, 'unnumbered source boxes do not acquire official codes');
      assert.deepEqual(r.pdfPages, [grade + 18]);
    }
  }
  const fields = ['key', 'code', 'generatedQualifiedIdentifier', 'officialCode', 'parentOfficialCode',
    'recordKind', 'gradeLevels', 'area', 'ordinal', 'pdfPages', 'printedPages'];
  for (const r of i.records) {
    assert.ok(Object.keys(r).every(k => fields.includes(k)), 'index does not publish source wording');
    assert.equal(r.generatedQualifiedIdentifier, true);
    assert.equal(r.key, `${s.slug}:${r.code}`);
    assert.deepEqual(r.printedPages, r.pdfPages.map(p => p - 2));
  }
  assert.equal(i.verification.C6Retained, true);
  assert.equal(i.verification.C6ComputerPerformanceRequiredForCoverageReview, true);
  assert.equal(i.implementationEvidence.annualHoursFlexible, true);
  assert.equal(i.implementationEvidence.hoursAreMasteryCriterion, false);
  assert.equal(i.implementationEvidence.companionResourcesAreNewStandards, false);
  assert.equal(i.baselineSeparation.selectedNCERTEligiblePositions, 521);
  assert.equal(i.baselineSeparation.newAssociations, 0);
  assert.equal(i.baselineSeparation.newTopics, 0);
}

test('CBSE primary source preserves native hierarchy, actual computer competency and whole grade-parent boxes', () => {
  assert.ok(catalogue.codesOnlySources.includes('cbse-ctai-2026'));
  checkPrimaryBoundary(source, index);
});

test('CBSE reference rejects later-stage contamination, invented codes, source text and mastery/coverage drift', () => {
  for (const mutate of [
    i => { i.records[8].gradeLevels = [6, 7, 8]; },
    i => { i.records[8].parentOfficialCode = 'CG-5'; },
    i => { i.records[8].pdfPages = [18]; },
    i => { i.records.splice(8, 1); },
    i => { i.records[9].officialCode = 'LO-1'; },
    i => { i.records[9].description = 'restricted source wording'; },
    i => { i.records[9].generatedQualifiedIdentifier = false; },
    i => { i.records[9].gradeLevels = [3, 4, 5]; },
    i => { i.records.push({ ...i.records[9], ordinal: 5 }); },
    i => { i.verification.C6ComputerPerformanceRequiredForCoverageReview = false; },
    i => { i.implementationEvidence.hoursAreMasteryCriterion = true; },
    i => { i.implementationEvidence.companionResourcesAreNewStandards = true; },
    i => { i.baselineSeparation.selectedNCERTEligiblePositions += 21; },
  ]) {
    const broken = structuredClone(index); mutate(broken);
    assert.throws(() => checkPrimaryBoundary(source, broken));
  }
});
