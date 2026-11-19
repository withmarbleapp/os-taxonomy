import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const sourceSlug = 'ncert-elementary-learning-outcomes-2017';
const catalogue = load('../data/curriculum-standards.json');
const source = catalogue.curricula.find(s => s.slug === sourceSlug);
const index = load('../reports/ncert-elementary-2017-primary-index-2026-11-11.json');
const counts = [9, 7, 12, 13, 8];
const evsCounts = [15, 15, 13];
const englishCounts = [15, 12, 14, 19, 19];
const hindiCounts = [14, 17, 14, 18, 17];
const urduCounts = [7, 7, 10, 16, 13];
const urduPages = { 1: Array.from({ length: 7 }, () => [59]),
  2: Array.from({ length: 7 }, () => [60]), 3: Array.from({ length: 10 }, () => [61]),
  4: Array.from({ length: 16 }, () => [63]), 5: Array.from({ length: 13 }, () => [64]) };
const hindiPages = {
  1: [...Array.from({ length: 10 }, () => [23]), ...Array.from({ length: 4 }, () => [24])],
  2: [...Array.from({ length: 11 }, () => [25]), ...Array.from({ length: 6 }, () => [26])],
  3: [...Array.from({ length: 10 }, () => [27]), ...Array.from({ length: 4 }, () => [28])],
  4: [...Array.from({ length: 13 }, () => [29]), ...Array.from({ length: 5 }, () => [30])],
  5: [...Array.from({ length: 10 }, () => [31]), ...Array.from({ length: 7 }, () => [32])],
};
const englishPages = {
  1: Array.from({ length: 15 }, () => [43]),
  2: Array.from({ length: 12 }, () => [44]),
  3: Array.from({ length: 14 }, () => [45]),
  4: [...Array.from({ length: 17 }, () => [46]), ...Array.from({ length: 2 }, () => [47])],
  5: [...Array.from({ length: 16 }, () => [48]), ...Array.from({ length: 3 }, () => [49])],
};
const evsPages = {
  3: [...Array.from({ length: 7 }, () => [95]), ...Array.from({ length: 8 }, () => [96])],
  4: [...Array.from({ length: 9 }, () => [98]), ...Array.from({ length: 6 }, () => [99])],
  5: [...Array.from({ length: 8 }, () => [101]), ...Array.from({ length: 5 }, () => [102])],
};
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
  assert.equal(currentSource.version, 'First Edition April 2017; ISBN 978-93-5007-785-6');
  assert.equal(currentIndex.sourceDocument.edition, 'First Edition April 2017');
  assert.equal(currentSource.sourceUrl, 'https://ncert.nic.in/pdf/publication/otherpublications/tilops101.pdf');
  assert.equal(currentIndex.sourceKind, '2017-classwise-learning-outcome-reference');
  assert.equal(currentIndex.scope.records, 304);
  assert.deepEqual(currentIndex.scope.subsets.map(s => s.recordsByGrade),
    [{ 1: 9, 2: 7, 3: 12, 4: 13, 5: 8 }, { 3: 15, 4: 15, 5: 13 }, { 1: 15, 2: 12, 3: 14, 4: 19, 5: 19 }, { 1: 14, 2: 17, 3: 14, 4: 18, 5: 17 }, { 1: 7, 2: 7, 3: 10, 4: 16, 5: 13 }]);
  assert.equal(currentSource.textIncluded, false, 'restricted wording stays private');
  assert.equal(currentSource.topicCount, 304);
  assert.equal(currentIndex.source, sourceSlug);
  assert.equal(currentIndex.current2026IndividualApplicability, 'Unverified', 'no automatic current-edition equivalence');
  assert.equal(currentIndex.sourceDocument.sha256, '18024190d8d8a7b0516bf6bcab14dc209f4751b91acb0b0c952e2c27b4ac3317');
  assert.deepEqual(currentIndex.scope.subsets.map(s => [s.area, s.grades, s.records]),
    [['Mathematics', [1, 2, 3, 4, 5], 49], ['Environmental Studies', [3, 4, 5], 43], ['English', [1, 2, 3, 4, 5], 79], ['Hindi', [1, 2, 3, 4, 5], 80], ['Urdu', [1, 2, 3, 4, 5], 53]], 'primary subject/grade boundaries');
  assert.equal(currentIndex.scope.sourceColumn, 'learning-outcomes', 'exclude suggested pedagogical processes');
  const mathExpected = counts.flatMap((count, i) => Array.from({ length: count }, (_, n) => {
    const code = `IN-NCERT-LO-2017-MATH-G${i + 1}-LO${String(n + 1).padStart(2, '0')}`;
    return { key: `${sourceSlug}:${code}`, code };
  }));
  const evsExpected = evsCounts.flatMap((count, i) => Array.from({ length: count }, (_, n) => {
    const code = `IN-NCERT-LO-2017-EVS-G${i + 3}-LO${String(n + 1).padStart(2, '0')}`;
    return { key: `${sourceSlug}:${code}`, code };
  }));
  const englishExpected = englishCounts.flatMap((count, i) => Array.from({ length: count }, (_, n) => {
    const code = `IN-NCERT-LO-2017-EN-G${i + 1}-LO${String(n + 1).padStart(2, '0')}`;
    return { key: `${sourceSlug}:${code}`, code };
  }));
  const hindiExpected = hindiCounts.flatMap((count, i) => Array.from({ length: count }, (_, n) => {
    const code = `IN-NCERT-LO-2017-HI-G${i + 1}-LO${String(n + 1).padStart(2, '0')}`;
    return { key: `${sourceSlug}:${code}`, code };
  }));
  const urduExpected = urduCounts.flatMap((count, i) => Array.from({ length: count }, (_, n) => {
    const code = `IN-NCERT-LO-2017-UR-G${i + 1}-LO${String(n + 1).padStart(2, '0')}`;
    return { key: `${sourceSlug}:${code}`, code };
  }));
  const expected = [...mathExpected, ...evsExpected, ...englishExpected, ...hindiExpected, ...urduExpected];
  assert.deepEqual(currentSource.topics, expected, 'exact printed-position identities; no public outcome wording');
  assert.equal(currentIndex.records.length, 304);
  assert.equal(new Set(currentIndex.records.map(r => r.key)).size, 304);
  assert.deepEqual(currentIndex.records.map(r => ({ key: r.key, code: r.code })), expected);
  for (const row of currentIndex.records) {
    assert.deepEqual(Object.keys(row).sort(), ['key', 'code', 'generatedIdentifier', 'officialCode',
      'recordKind', 'area', 'grade', 'ordinal', 'sourceColumn', 'pdfPages', 'printedPages'].sort(),
    'public index contains factual metadata only');
    assert.equal(row.generatedIdentifier, true, 'generated codes must not impersonate official codes');
    assert.equal(row.officialCode, null);
    assert.equal(row.sourceColumn, 'learning-outcomes', 'exclude the source pedagogical-process column');
    assert.ok(['Mathematics', 'Environmental Studies', 'English', 'Hindi', 'Urdu'].includes(row.area));
    const isMath = row.area === 'Mathematics';
    const isEnglish = row.area === 'English';
    const isHindi = row.area === 'Hindi';
    const isUrdu = row.area === 'Urdu';
    const areaCounts = isMath ? counts : isEnglish ? englishCounts : isHindi ? hindiCounts : isUrdu ? urduCounts : [0, 0, ...evsCounts];
    assert.ok(isMath || isEnglish || isHindi || isUrdu || row.grade >= 3, 'no invented standalone EVS I/II');
    assert.equal(row.recordKind, 'classwiseLearningOutcomePosition');
    assert.ok(Number.isInteger(row.grade) && row.grade >= 1 && row.grade <= 5, 'primary-only record');
    assert.ok(row.ordinal >= 1 && row.ordinal <= areaCounts[row.grade - 1], 'top-level parent positions only');
    assert.deepEqual(row.pdfPages, (isMath ? pages : isEnglish ? englishPages : isHindi ? hindiPages : isUrdu ? urduPages : evsPages)[row.grade][row.ordinal - 1], 'exact outcome-column page boundary');
    assert.deepEqual(row.printedPages, row.pdfPages.map(page => page - 18));
  }
  assert.equal(currentIndex.namedEnglishProgramme.language, 'English');
  assert.equal(currentIndex.namedEnglishProgramme.fixedNationalR2, false, 'named English is not a national role prescription');
  assert.equal(currentIndex.namedEnglishProgramme.individualSourceConditionsRetained, true, 'response-language and accessibility conditions retained');
  assert.equal(currentIndex.namedHindiProgramme.language, 'Hindi');
  assert.equal(currentIndex.namedHindiProgramme.fixedNationalR1orR2, false);
  assert.equal(currentIndex.namedHindiProgramme.individualSourceConditionsRetained, true);
  assert.equal(currentIndex.namedHindiProgramme.canonicalMachineWording, 'Unverified', 'do not certify garbled Hindi decoding');
  assert.equal(currentIndex.scope.subsets.find(s => s.area === 'Hindi').canonicalMachineWording, 'Unverified');
  assert.deepEqual(currentIndex.scope.subsets.map(s => [s.area, s.outcomeColumnPlacement]),
    [['Mathematics', 'right'], ['Environmental Studies', 'right'], ['English', 'right'], ['Hindi', 'right'], ['Urdu', 'left']],
    'use actual source outcome column, not a universal right-column assumption');
  assert.equal(currentIndex.namedUrduProgramme.language, 'Urdu');
  assert.equal(currentIndex.namedUrduProgramme.fixedNationalR1orR2, false);
  assert.equal(currentIndex.namedUrduProgramme.individualSourceConditionsRetainedInImages, true);
  assert.equal(currentIndex.namedUrduProgramme.canonicalMachineWording, 'Unverified', 'no canonical Urdu transcription claimed');
  const urduSubset = currentIndex.scope.subsets.find(s => s.area === 'Urdu');
  assert.deepEqual(urduSubset.actualPublisherProgrammeGroups, [[1, 2, 3], [4, 5]], 'original programme groups retained');
  assert.deepEqual(urduSubset.pdfPages, [59, 60, 61, 63, 64]);
  assert.deepEqual(urduSubset.programmeIntroductionPdfPages, [58, 62]);
  assert.equal(urduSubset.VItoVIIIBoundaryPdfPage, 65);
  assert.equal(urduSubset.canonicalMachineWording, 'Unverified');
  assert.deepEqual(currentIndex.baselineSeparation, {
    selectedExistingSourceFamilies: ['ncert-fs-2025', 'ncert-ncfse-2023-ed2024'],
    retainedExistingPositions: 570, eligibleExistingPositions: 521,
    existingLinkedPositions: 495, existingUnlinkedPositions: 26,
    new2017ReferencePositions: 304, newAssociations: 0,
    meaning: 'The 304 unmapped 2017 reference positions are not 304 proven taxonomy gaps and are not added to the 521 current selected-baseline coverage denominator. Edition/requirement reconciliation is separate.',
  }, '2017 reference scope is separate from current selected coverage');
}
test('NCERT 2017 selected primary catalogue binds exact 304 outcome-column positions and qualified source status', () => {
  assert.ok(catalogue.codesOnlySources.includes(sourceSlug));
  checkReference(source, index);
});
test('2017 catalogue rejects pedagogical columns, VI+ scope, lost grouping, private wording and current-certification drift', () => {
  for (const mutate of [
    d => { d.records[0].sourceColumn = 'suggested-pedagogical-processes'; },
    d => { d.scope.sourceColumn = 'suggested-pedagogical-processes'; },
    d => { d.scope.records = 49; },
    d => { d.scope.subsets[1].recordsByGrade['3'] = 14; },
    d => { d.records[0].grade = 6; },
    d => { d.records[49].grade = 1; },
    d => { d.records[49].sourceColumn = 'suggested-pedagogical-processes'; },
    d => { d.records[49].pdfPages = [97]; },
    d => { d.records[92].pdfPages = [50]; },
    d => { d.namedEnglishProgramme.fixedNationalR2 = true; },
    d => { d.namedEnglishProgramme.individualSourceConditionsRetained = false; },
    d => { d.namedHindiProgramme.canonicalMachineWording = 'Verified'; },
    d => { d.namedHindiProgramme.fixedNationalR1orR2 = true; },
    d => { d.records[171].pdfPages = [33]; },
    d => { d.records[171].description = 'guessed decoded Hindi'; },
    d => { d.scope.subsets.find(s => s.area === 'Urdu').outcomeColumnPlacement = 'right'; },
    d => { d.scope.subsets.find(s => s.area === 'Urdu').actualPublisherProgrammeGroups = [[1, 2, 3], [4, 5, 6, 7, 8]]; },
    d => { d.records[251].pdfPages = [58]; },
    d => { d.records[251].grade = 6; },
    d => { d.namedUrduProgramme.canonicalMachineWording = 'Verified'; },
    d => { d.records[251].description = 'guessed Urdu transcription'; },
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
