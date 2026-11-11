import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const sourceSlug = 'ncert-elementary-learning-outcomes-2017';
const catalogue = load('../data/curriculum-standards.json');
const source = catalogue.curricula.find(s => s.slug === sourceSlug);
const index = load('../reports/ncert-elementary-2017-primary-math-index-2026-11-11.json');
const counts = [9, 7, 12, 13, 8];
const pages = {
  1: [[73], [73], [73], [73], [73], [73], [73], [74], [74]],
  2: Array.from({ length: 7 }, () => [75]),
  3: [...Array.from({ length: 9 }, () => [77]), ...Array.from({ length: 3 }, () => [78])],
  4: [...Array.from({ length: 6 }, () => [79]), ...Array.from({ length: 7 }, () => [80])],
  5: [...Array.from({ length: 5 }, () => [82]), ...Array.from({ length: 3 }, () => [83])],
};
function checkReference(currentSource, currentIndex) {
  assert.equal(currentSource.slug, sourceSlug);
  assert.equal(currentSource.country, 'IN');
  assert.equal(currentSource.textIncluded, false, 'restricted wording stays private');
  assert.equal(currentSource.topicCount, 49);
  assert.equal(currentIndex.source, sourceSlug);
  assert.equal(currentIndex.current2026IndividualApplicability, 'Unverified', 'no automatic current-edition equivalence');
  assert.equal(currentIndex.sourceDocument.sha256, '18024190d8d8a7b0516bf6bcab14dc209f4751b91acb0b0c952e2c27b4ac3317');
  assert.deepEqual(currentIndex.scope.grades, [1, 2, 3, 4, 5], 'primary boundary');
  assert.equal(currentIndex.scope.sourceColumn, 'learning-outcomes', 'exclude suggested pedagogical processes');
  const expected = counts.flatMap((count, i) => Array.from({ length: count }, (_, n) => {
    const code = `IN-NCERT-LO-2017-MATH-G${i + 1}-LO${String(n + 1).padStart(2, '0')}`;
    return { key: `${sourceSlug}:${code}`, code };
  }));
  assert.deepEqual(currentSource.topics, expected, 'exact printed-position identities; no public outcome wording');
  assert.equal(currentIndex.records.length, 49);
  assert.equal(new Set(currentIndex.records.map(r => r.key)).size, 49);
  assert.deepEqual(currentIndex.records.map(r => ({ key: r.key, code: r.code })), expected);
  for (const row of currentIndex.records) {
    assert.deepEqual(Object.keys(row).sort(), ['key', 'code', 'generatedIdentifier', 'officialCode',
      'recordKind', 'area', 'grade', 'ordinal', 'sourceColumn', 'pdfPages', 'printedPages'].sort(),
    'public index contains factual metadata only');
    assert.equal(row.generatedIdentifier, true, 'generated codes must not impersonate official codes');
    assert.equal(row.officialCode, null);
    assert.equal(row.sourceColumn, 'learning-outcomes', 'exclude left pedagogical column');
    assert.equal(row.area, 'Mathematics');
    assert.equal(row.recordKind, 'classwiseLearningOutcomePosition');
    assert.ok(Number.isInteger(row.grade) && row.grade >= 1 && row.grade <= 5, 'primary-only record');
    assert.ok(row.ordinal >= 1 && row.ordinal <= counts[row.grade - 1], 'top-level parent positions only');
    assert.deepEqual(row.pdfPages, pages[row.grade][row.ordinal - 1], 'exact outcome-column page boundary');
    assert.deepEqual(row.printedPages, row.pdfPages.map(page => page - 18));
  }
  assert.deepEqual(currentIndex.baselineSeparation, {
    selectedExistingSourceFamilies: ['ncert-fs-2025', 'ncert-ncfse-2023-ed2024'],
    retainedExistingPositions: 570, eligibleExistingPositions: 521,
    existingLinkedPositions: 495, existingUnlinkedPositions: 26,
    new2017ReferencePositions: 49, newAssociations: 0,
    meaning: 'The 49 unmapped 2017 reference positions are not 49 proven taxonomy gaps and are not added to the 521 current selected-baseline coverage denominator. Edition/requirement reconciliation is separate.',
  }, '2017 reference scope is separate from current selected coverage');
}
test('NCERT 2017 primary Mathematics catalogue binds exact 49 right-column positions and qualified source status', () => {
  assert.ok(catalogue.codesOnlySources.includes(sourceSlug));
  checkReference(source, index);
});
test('2017 catalogue rejects pedagogical columns, VI+ scope, lost grouping, private wording and current-certification drift', () => {
  for (const mutate of [
    d => { d.records[0].sourceColumn = 'suggested-pedagogical-processes'; },
    d => { d.scope.sourceColumn = 'suggested-pedagogical-processes'; },
    d => { d.records[0].grade = 6; },
    d => { d.records[0].pdfPages = [76]; },
    d => { d.records.splice(0, 1); },
    d => { d.records[0].description = 'restricted source wording'; },
    d => { d.records[0].generatedIdentifier = false; },
    d => { d.current2026IndividualApplicability = 'Full'; },
    d => { d.baselineSeparation.eligibleExistingPositions += 49; },
  ]) {
    const broken = structuredClone(index); mutate(broken);
    assert.throws(() => checkReference(source, broken));
  }
  const leak = structuredClone(source); leak.topics[0].description = 'restricted source wording';
  assert.throws(() => checkReference(leak, index), /no public outcome wording/);
  const split = structuredClone(source); split.topics.push({ key: `${sourceSlug}:IN-NCERT-LO-2017-MATH-G1-LO10`, code: 'IN-NCERT-LO-2017-MATH-G1-LO10' });
  assert.throws(() => checkReference(split, index), /exact printed-position/);
});
