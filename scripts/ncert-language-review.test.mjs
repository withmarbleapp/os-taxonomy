import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const catalogue = load('../data/curriculum-standards.json').curricula;
const topics = new Map(load('../data/topics.json').topics.map(topic => [topic.id, topic]));
const contexts = load('../data/curriculum-alignments.json').alignments;
const edges = load('../data/dependencies.json').dependencies;
const readiness = load('../reports/ncert-alignment-readiness-2026-11-10.json');
const summary = load('../reports/ncert-primary-language-review-summary-2026-11-10.json');
const corrections = load('../reports/language-intrinsic-prerequisite-corrections-2026-11-10.json');
const reusableCorrectionFile = 'language-reusable-prerequisite-corrections-2026-11-11.json';
const reusableCorrections = load(`../reports/${reusableCorrectionFile}`);
const expressionCorrectionFile = 'expressive-reading-prerequisite-review-2026-11-11.json';
const expressionCorrection = load(`../reports/${expressionCorrectionFile}`);
const correctionRegistry = new Map([[reusableCorrectionFile, reusableCorrections],
  [expressionCorrectionFile, expressionCorrection]]);
const expressionKeys = [
  'ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-LANG-COMP-C-10.4',
  'ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-R2-COMP-C-2.3',
];
const expressionHistoryKeys = [...expressionKeys,
  'ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-LANG-GOAL-CG-10',
  'ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-R2-GOAL-CG-2',
];
const expressionOldReportedPaths = [['mt_V-ldQp56bF', 'mt_ZhvwM6LMBL', 'mt_1KCwbGvm1F']];
const sorted = values => [...values].sort();
const histogram = rows => rows.reduce((counts, row) => {
  counts[row.disposition] = (counts[row.disposition] ?? 0) + 1;
  return counts;
}, {});
const pairKey = (topicId, key) => JSON.stringify([topicId, key]);
const contextKey = context => JSON.stringify([
  context.topicId, context.scope, context.country ?? null,
  context.region ?? null, context.framework ?? null,
  context.ageRangeStart, context.ageRangeEnd,
]);

// This is the reviewed printed-position boundary, not a cap on later catalogue
// ingestion. New source families/positions can remain pending outside this set.
const englishPositions = {
  'G1-C11.1': 8, 'G1-C9.1': 2, 'G1-C9.3': 2, 'G1-C9.4': 2,
  'G1-C9.5': 1, 'G1-C9.6': 1, 'G1-C9.7': 1,
  'G2-C11.1': 5, 'G2-C9.1': 4, 'G2-C9.3': 2, 'G2-C9.4': 1,
  'G2-C9.5': 1, 'G2-C9.6': 2, 'G2-C9.7': 2,
};
const expectedEnglishKeys = Object.entries(englishPositions).flatMap(([position, count]) =>
  Array.from({ length: count }, (_, index) =>
    `ncert-fs-2025:IN-NCERT-FS-2025-EN-L2-${position}-LO${String(index + 1).padStart(2, '0')}`));
const foundationalIndex = load('../reports/ncert-ncfse-foundational-index-2026-11-09.json')
  .records.filter(row => row.area === 'LANG');
const preparatoryIndex = load('../reports/ncert-ncfse-preparatory-core-index-2026-11-09.json')
  .records.filter(row => ['R1', 'R2'].includes(row.area));
const batches = [
  {
    file: 'ncert-foundational-language-framework-2026-11-10.json',
    report: load('../reports/ncert-foundational-language-framework-2026-11-10.json'),
    protocols: load('../reports/ncert-foundational-language-protocols-2026-11-10.json'),
    expectedKeys: foundationalIndex.map(row => row.key), index: foundationalIndex,
    count: 21, ages: [3, 8], source: 'ncert-ncfse-2023-ed2024',
  },
  {
    file: 'ncert-preparatory-language-framework-2026-11-10.json',
    report: load('../reports/ncert-preparatory-language-framework-2026-11-10.json'),
    protocols: load('../reports/ncert-preparatory-language-protocols-2026-11-10.json'),
    expectedKeys: preparatoryIndex.map(row => row.key), index: preparatoryIndex,
    count: 35, ages: [8, 11], source: 'ncert-ncfse-2023-ed2024',
  },
  {
    file: 'ncert-english-l2-suggestive-alignment-2026-11-10.json',
    report: load('../reports/ncert-english-l2-suggestive-alignment-2026-11-10.json'),
    protocols: load('../reports/ncert-english-l2-suggestive-protocols-2026-11-10.json'),
    expectedKeys: expectedEnglishKeys, index: [],
    count: 34, ages: [6, 8], source: 'ncert-fs-2025',
  },
];
const records = batches.flatMap(batch => batch.report.records);
const sourceKeys = new Set(records.map(row => row.key));

function checkSources(reviewBatches) {
  const publishedKeys = new Set(catalogue.flatMap(source => source.topics.map(row => row.key)));
  const readinessByKey = new Map(readiness.records.map(row => [row.key, row]));
  assert.equal(readinessByKey.size, readiness.records.length, 'duplicate readiness key');
  for (const batch of reviewBatches) {
    const rows = batch.report.records;
    assert.equal(rows.length, batch.count, `${batch.file}: reviewed position count`);
    assert.equal(new Set(rows.map(row => row.key)).size, batch.count, 'duplicate review key');
    assert.deepEqual(sorted(rows.map(row => row.key)), sorted(batch.expectedKeys),
      `${batch.file}: reviewed source keys`);
    const indexByKey = new Map(batch.index.map(row => [row.key, row]));
    for (const row of rows) {
      assert.ok(publishedKeys.has(row.key), `unknown catalogue key ${row.key}`);
      assert.ok(row.key.startsWith(`${batch.source}:`), 'source identity changed');
      assert.deepEqual(row.stageAgeBand ?? row.ageBand, batch.ages, 'source age window changed');
      const ledgerRow = readinessByKey.get(row.key);
      assert.ok(ledgerRow, `missing readiness record ${row.key}`);
      assert.equal(ledgerRow.reviewReport, batch.file, 'readiness report binding');
      assert.equal(ledgerRow.disposition, row.disposition, 'readiness disposition drift');
      assert.deepEqual(ledgerRow.remainingConditions, row.remainingConditions,
        'readiness unresolved conditions drift');
      if (indexByKey.has(row.key)) {
        const sourceRow = indexByKey.get(row.key);
        assert.equal(row.officialCode, sourceRow.officialCode, 'literal source code changed');
        assert.deepEqual(row.sourcePages, sourceRow.pdfPages, 'source page binding changed');
        assert.equal(row.sourceStatus, 'formal-stage-standard');
        assert.equal(ledgerRow.languageRole, row.languageRole, 'readiness language-role drift');
        assert.deepEqual(ledgerRow.sourcePdfPages, row.sourcePages, 'readiness source-page drift');
        if (['R1', 'R2'].includes(sourceRow.area)) assert.equal(row.languageRole, sourceRow.area);
        else assert.deepEqual(row.languageRole === 'R1-and-R2' ? ['R1', 'R2'] : [row.languageRole],
          sourceRow.applicability.languageRoles, 'Foundational source language roles drift');
      } else {
        const grade = row.key.match(/-EN-L2-G([12])-C/)[1];
        assert.equal(row.printedGrade, `Grade ${grade}`, 'printed English grade drift');
        assert.deepEqual(ledgerRow.sourceGradeBand, [`Grade ${grade}`], 'missing source grade metadata');
        assert.equal(row.targetLanguage, 'en');
        assert.equal(row.sourceLanguageRole, 'L2');
        assert.equal(ledgerRow.targetLanguage, row.targetLanguage);
        assert.equal(ledgerRow.sourceLanguageRole, row.sourceLanguageRole);
        assert.deepEqual(ledgerRow.sourcePdfPages, row.sourcePdfPages);
        assert.equal(row.sourceStatus, 'suggestive-contextualisable-source-position');
      }
      if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, []);
      if (row.disposition.startsWith('Conditional')) assert.ok(row.remainingConditions.length > 0);
      if (row.disposition === 'SkillWithContextualEngagement') {
        assert.ok(row.contributions.length > 0, 'mixed record lost actual skill');
        assert.ok(row.contextualRequirement?.length > 0, 'mixed record lost contextual channel');
      }
    }
    assert.deepEqual(batch.report.summary, histogram(rows), 'source disposition summary drift');
    const summaryRow = summary.sourceSets.find(row => row.report === batch.file);
    assert.ok(summaryRow, 'missing combined source binding');
    assert.equal(summaryRow.source, batch.source);
    assert.equal(summaryRow.records, rows.length);
    assert.deepEqual(summaryRow.summary, batch.report.summary);
  }
}

function checkProtocols(reviewBatches) {
  for (const batch of reviewBatches) {
    const ids = batch.protocols.protocols.map(protocol => protocol.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate protocol ID');
    for (const row of batch.report.records) {
      assert.ok(row.assessmentProtocols.length > 0, `missing task protocol ${row.key}`);
      for (const id of row.assessmentProtocols) {
        assert.ok(ids.includes(id), `unknown protocol ${id} in ${batch.file}`);
      }
    }
  }
}

function checkCompleteHardPaths(root, reportedPaths, currentEdges = edges) {
  const adjacency = new Map();
  for (const edge of currentEdges.filter(edge => edge.strength === 'hard')) {
    const children = adjacency.get(edge.topicId) ?? [];
    children.push(edge.prerequisiteId);
    adjacency.set(edge.topicId, children);
  }
  const actualPaths = [], pending = [[root]];
  while (pending.length) {
    assert.ok(actualPaths.length + pending.length <= 10000, 'hard-path inventory exceeded review bound');
    const path = pending.pop(), children = adjacency.get(path.at(-1)) ?? [];
    if (!children.length) actualPaths.push(path);
    for (const child of children) {
      assert.ok(!path.includes(child), 'cycle in current hard paths');
      pending.push([...path, child]);
    }
  }
  assert.deepEqual(sorted(reportedPaths.map(path => JSON.stringify(path))),
    sorted(actualPaths.map(path => JSON.stringify(path))), 'complete current hard paths drift');
}

function checkExpressionHistoryTable(report) {
  assert.deepEqual(report.historicalReportedPaths, Object.fromEntries(
    expressionHistoryKeys.map(key => [key, expressionOldReportedPaths])),
  'exact expressive history table required');
}

function checkGraph(reviewRecords, alignments) {
  checkExpressionHistoryTable(expressionCorrection);
  const expectedPairs = new Set();
  const byKey = new Map(reviewRecords.map(row => [row.key, row]));
  for (const row of reviewRecords) {
    if (expressionHistoryKeys.includes(row.key)) {
      if (expressionKeys.includes(row.key)) assert.equal(row.disposition, 'Partial');
      const selected = [...(row.conditionalContributions ?? []), ...(row.historicalConditionalContributions ?? [])]
        .filter(candidate => candidate.topicId === 'mt_V-ldQp56bF');
      assert.equal(selected.length, 1, 'reviewed expressive candidate cannot disappear');
      assert.deepEqual(selected[0].historicalHardGatePaths, expressionOldReportedPaths,
        'exact expressive prerequisite history required');
      assert.equal(selected[0].dependencyCorrectionReport, expressionCorrectionFile,
        'retired hard paths need a registered correction report');
    }
    for (const contribution of row.contributions) {
      assert.ok(topics.has(contribution.topicId), 'missing active contributed topic');
      assert.equal(contribution.topicName, topics.get(contribution.topicId).name, 'active topic label drift');
      assert.ok(['whole', 'component'].includes(contribution.role), 'prerequisite-only association');
      const key = pairKey(contribution.topicId, row.key);
      assert.ok(!expectedPairs.has(key), 'duplicate declared contribution');
      expectedPairs.add(key);
    }
    for (const candidate of [...(row.conditionalContributions ?? []), ...(row.historicalConditionalContributions ?? [])]) {
      assert.ok(topics.has(candidate.topicId), 'missing active conditional candidate');
      assert.equal(candidate.topicName, topics.get(candidate.topicId).name);
      if ((row.conditionalContributions ?? []).includes(candidate)) {
        assert.ok(!alignments.some(context => context.topicId === candidate.topicId &&
          context.standards.includes(row.key)), `withheld candidate leaked: ${row.key}`);
      }
      if (candidate.historicalHardGatePaths) {
        assert.ok(correctionRegistry.has(candidate.dependencyCorrectionReport),
          'retired hard paths need a registered correction report');
        const registeredCorrection = correctionRegistry.get(candidate.dependencyCorrectionReport);
        assert.ok(candidate.currentHardPathInterpretation?.length > 0);
        checkCompleteHardPaths(candidate.topicId, candidate.inheritedHardGatePaths);
        for (const path of candidate.historicalHardGatePaths) {
          assert.equal(path[0], candidate.topicId);
          let registeredSoftening = false;
          for (let index = 1; index < path.length; index++) {
            const topicId = path[index - 1], prerequisiteId = path[index];
            const change = registeredCorrection.changes.find(change =>
              change.before.topicId === topicId && change.before.prerequisiteId === prerequisiteId);
            if (change) {
              assert.equal(change.before.strength, 'hard');
              assert.equal(change.after.strength, 'soft');
              assert.deepEqual(edges.filter(edge => edge.topicId === topicId &&
                edge.prerequisiteId === prerequisiteId), [change.after], 'retired path correction drift');
              registeredSoftening = true;
            } else assert.ok(edges.some(edge => edge.topicId === topicId &&
              edge.prerequisiteId === prerequisiteId && edge.strength === 'hard'),
            'unregistered change to a retired hard path');
          }
          assert.ok(registeredSoftening, 'historical path has no registered softening');
        }
      }
      for (const path of candidate.inheritedHardGatePaths) {
        assert.equal(path[0], candidate.topicId);
        for (let index = 1; index < path.length; index++) {
          assert.ok(edges.some(edge => edge.topicId === path[index - 1] &&
            edge.prerequisiteId === path[index] && edge.strength === 'hard'),
          'current conditional hard path no longer exists');
        }
      }
    }
  }
  const selectedContexts = alignments.filter(context => context.standards.some(key => byKey.has(key)));
  const actualPairs = [];
  for (const context of selectedContexts) {
    assert.equal(context.scope, 'jurisdiction');
    assert.equal(context.country, 'IN');
    assert.equal(context.region ?? null, null);
    assert.equal(context.framework ?? null, null);
    for (const key of context.standards.filter(key => byKey.has(key))) {
      const row = byKey.get(key);
      const expectedAges = row.key.endsWith('PREP-R1-COMP-C-1.2') ? [10, 11]
        : row.key === expressionKeys[0] ? [6, 8] : row.key === expressionKeys[1] ? [8, 11]
          : row.stageAgeBand ?? row.ageBand;
      assert.deepEqual([context.ageRangeStart, context.ageRangeEnd], expectedAges);
      actualPairs.push(pairKey(context.topicId, key));
    }
  }
  assert.deepEqual(sorted(new Set(actualPairs)), sorted(expectedPairs), 'declared/published pair drift');
  assert.equal(actualPairs.length, new Set(actualPairs).size, 'duplicate published language pair');
  assert.equal(selectedContexts.length, 61, 'reviewed context total');
  assert.equal(new Set(selectedContexts.map(contextKey)).size, 61, 'duplicate language context identity');
  assert.equal(actualPairs.length, 146, 'reviewed association total');
  assert.equal(new Set(reviewRecords.flatMap(row => row.contributions.map(c => c.topicId))).size, 39);
  assert.equal(summary.graph.newContexts, selectedContexts.length);
  assert.equal(summary.graph.newAssociations, actualPairs.length);
  assert.equal(summary.graph.sharedTopics, 39);
}

const correctedPairs = [
  ['mt_ZhvwM6LMBL', 'mt__KHQttMde3'],
  ['mt_f8n4txtLej', 'mt_6lHBTwQPrS'],
  ['mt_AvJMWQbDsr', 'mt_o8ciHks8t2'],
  ['mt_AvJMWQbDsr', 'mt_nDAcXoPa0c'],
  ['mt_AvJMWQbDsr', 'mt_lIs10UMkPG'],
];
function checkCorrections(currentEdges) {
  assert.equal(corrections.changes.length, 5);
  assert.deepEqual(sorted(corrections.changes.map(change => pairKey(change.after.topicId, change.after.prerequisiteId))),
    sorted(correctedPairs.map(([topic, prerequisite]) => pairKey(topic, prerequisite))));
  for (const { before, after } of corrections.changes) {
    assert.equal(before.strength, 'hard');
    assert.equal(after.strength, 'soft');
    const { strength: oldStrength, reason: oldReason, ...oldIdentity } = before;
    const { strength: newStrength, reason: newReason, ...newIdentity } = after;
    assert.deepEqual(newIdentity, oldIdentity, 'correction changed more than strength/reason');
    assert.ok(newReason.length > 0 && oldReason.length > 0);
    const actual = currentEdges.filter(edge => edge.topicId === after.topicId &&
      edge.prerequisiteId === after.prerequisiteId);
    assert.deepEqual(actual, [after], 'registered prerequisite correction drift');
  }
  assert.ok(currentEdges.some(edge => edge.topicId === 'mt_ZhvwM6LMBL' &&
    edge.prerequisiteId === 'mt_1KCwbGvm1F' && edge.strength === 'hard'),
  'English print-direction gate must remain hard');
  assert.equal(summary.graph.registeredHardToSoftCorrections, 5);
}

test('NCERT language review binds all 90 source positions, roles, grades and ledger dispositions', () => {
  assert.equal(records.length, 90);
  assert.equal(sourceKeys.size, 90);
  assert.equal(summary.reviewedRecords, 90);
  assert.deepEqual(summary.combinedSummary, histogram(records));
  checkSources(batches);
});

test('every language disposition resolves its source-specific task protocols', () => checkProtocols(batches));

test('language reports and mappings agree on 61 contexts / 146 pairs with no withheld candidate leaks', () =>
  checkGraph(records, contexts));

test('the exact five intrinsic corrections match the graph while English print direction stays hard', () =>
  checkCorrections(edges));

test('cross-artifact guards reject source, protocol, withheld-link and prerequisite drift', () => {
  const wrongSource = structuredClone(batches);
  wrongSource[2].report.records[0].key = 'ncert-fs-2025:IN-NCERT-FS-2025-MATH-G1-C8.1-LO01';
  assert.throws(() => checkSources(wrongSource), /reviewed source keys/);
  const wrongRole = structuredClone(batches);
  wrongRole[0].report.records.find(row => row.officialCode === 'C-10.1').languageRole = 'R2';
  assert.throws(() => checkSources(wrongRole), /language-role drift/);
  const missingProtocol = structuredClone(batches);
  missingProtocol[0].report.records[0].assessmentProtocols.push('missing-protocol');
  assert.throws(() => checkProtocols(missingProtocol), /unknown protocol/);
  const withheld = records.flatMap(row => (row.conditionalContributions ?? []).map(candidate => ({ row, candidate })))[0];
  const leaked = structuredClone(contexts);
  leaked.push({ topicId: withheld.candidate.topicId, scope: 'jurisdiction', country: 'IN',
    ageRangeStart: 3, ageRangeEnd: 8, standards: [withheld.row.key] });
  assert.throws(() => checkGraph(records, leaked), /withheld candidate leaked/);
  const wrongEdge = structuredClone(edges);
  wrongEdge.find(edge => edge.topicId === correctedPairs[0][0] &&
    edge.prerequisiteId === correctedPairs[0][1]).strength = 'hard';
  assert.throws(() => checkCorrections(wrongEdge), /registered prerequisite correction drift/);
});

test('the language guard permits other curriculum codes and contexts to grow independently', () => {
  const extended = structuredClone(contexts);
  const otherCode = 'ncert-fs-2025:IN-NCERT-FS-2025-COG-G1-G2-C7.1-LO01';
  assert.ok(!sourceKeys.has(otherCode));
  const shared = extended.find(context => context.topicId === 'mt_4A7FYmvVhA' &&
    context.country === 'IN' && context.ageRangeStart === 6 && context.ageRangeEnd === 8);
  if (!shared.standards.includes(otherCode)) shared.standards.push(otherCode);
  if (!extended.some(context => context.topicId === 'mt_vJO5Bxk4z-' &&
    context.country === 'IN' && context.ageRangeStart === 6 && context.ageRangeEnd === 8)) extended.push({ topicId: 'mt_vJO5Bxk4z-', scope: 'jurisdiction', country: 'IN',
    ageRangeStart: 6, ageRangeEnd: 8, standards: [otherCode] });
  // Only the reviewed language-key projection is fixed here. Global schema and
  // generated-projection tests remain responsible for the rest of the graph.
  checkGraph(records, extended);
});


test('four reusable prerequisite corrections retain exact identities and all conditional source dispositions', () => {
  assert.equal(reusableCorrections.changes.length, 4);
  assert.equal(new Set(reusableCorrections.changes.map(({ after }) => pairKey(after.topicId, after.prerequisiteId))).size, 4);
  for (const { before, after, discriminatingCounterexample } of reusableCorrections.changes) {
    assert.equal(before.strength, 'hard');
    assert.equal(after.strength, 'soft');
    const { strength: oldStrength, reason: oldReason, ...oldIdentity } = before;
    const { strength: newStrength, reason: newReason, ...newIdentity } = after;
    assert.deepEqual(newIdentity, oldIdentity);
    assert.ok(oldReason.length && newReason.length && discriminatingCounterexample.length);
    assert.deepEqual(edges.filter(edge => edge.topicId === after.topicId &&
      edge.prerequisiteId === after.prerequisiteId), [after]);
  }
  assert.deepEqual(histogram(records), summary.combinedSummary);
  checkGraph(records, contexts);
});

test('language reports reject retired paths presented as current and missing correction bindings', () => {
  const stale = structuredClone(records);
  const candidate = stale.flatMap(row => row.conditionalContributions ?? [])
    .find(candidate => candidate.historicalHardGatePaths);
  assert.ok(candidate);
  candidate.inheritedHardGatePaths = candidate.historicalHardGatePaths;
  assert.throws(() => checkGraph(stale, contexts), /complete current hard paths drift/);
  const unregistered = structuredClone(records);
  delete unregistered.flatMap(row => row.conditionalContributions ?? [])
    .find(candidate => candidate.historicalHardGatePaths).dependencyCorrectionReport;
  assert.throws(() => checkGraph(unregistered, contexts), /retired hard paths need a registered correction report/);
});


test('complete hard-path reports reject empty inventories and omitted branches', () => {
  const empty = structuredClone(records);
  empty.flatMap(row => row.conditionalContributions ?? [])
    .find(candidate => candidate.historicalHardGatePaths).inheritedHardGatePaths = [];
  assert.throws(() => checkGraph(empty, contexts), /complete current hard paths drift/);
  const branchingEdges = [
    { topicId: 'invented-root', prerequisiteId: 'invented-left', strength: 'hard' },
    { topicId: 'invented-root', prerequisiteId: 'invented-right', strength: 'hard' },
  ];
  assert.throws(() => checkCompleteHardPaths('invented-root',
    [['invented-root', 'invented-left']], branchingEdges), /complete current hard paths drift/);
  checkCompleteHardPaths('invented-root',
    [['invented-root', 'invented-left'], ['invented-root', 'invented-right']], branchingEdges);
});

const heardKey = 'ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-R1-COMP-C-1.2';
const heardReview = load('../reports/ncert-r1-heard-summary-component-2026-11-11.json');
function checkHeardComponent(review, rows = records, alignments = contexts) {
  const row = rows.find(row => row.key === heardKey);
  assert.equal(row.disposition, 'Partial', 'actual R1 conditions cannot become Full');
  assert.deepEqual(row.stageAgeBand, [8, 11], 'source stage stays unchanged');
  assert.deepEqual(row.contributions.map(c => c.topicId), ['mt_A4YUbzUFan'], 'exact one direct component');
  assert.equal(row.contributions[0].role, 'component');
  assert.equal(row.historicalConditionalContributions?.length, 1, 'promoted candidate history required');
  assert.deepEqual(row.historicalConditionalContributions[0].historicalHardGatePaths, [[
    'mt_A4YUbzUFan', 'mt_-DuXzMVVXQ', 'mt_sMAcZW6vWM',
    'mt_ZhUuT__i2H', 'mt_XeMZdf2Y9W', 'mt_1KCwbGvm1F',
  ]], 'exact retired path history preserved');
  assert.deepEqual(review.historicalConditionalContributions, row.historicalConditionalContributions,
    'component review history must match source row');
  checkGraph(rows, alignments);
  assert.deepEqual(row.contributions[0].associationAgeBand, [10, 11]);
  assert.ok(row.remainingConditions.length >= 3, 'actual role / readiness / whole-claim conditions required');
  assert.equal(review.topicId, 'mt_A4YUbzUFan');
  assert.deepEqual(review.associationAgeBand, [10, 11]);
  assert.deepEqual(review.sourceAgeBand, [8, 11]);
  checkCompleteHardPaths(review.topicId, review.completeCurrentHardPaths);
  assert.deepEqual(review.canonicalChanges, { claims: 0, guides: 0, dependencies: 0 });
  assert.deepEqual(review.originalCasebank.map(c => c.id),
    ['heard-explanation', 'changed-narrative', 'audio-message', 'quantitative-display']);
  for (const c of review.originalCasebank) {
    assert.ok(c.delivery.length && c.essentialPropositions.length >= 2, 'actual material and success propositions');
  }
  assert.ok(review.bindingContract.beforeUse.length >= 4, 'actual R1 / competent assessor contract');
  assert.match(review.decisionRules.wholeCandidate, /quantitative/);
  assert.match(review.decisionRules.wholeCandidate, /paraphrase/);
  assert.match(review.decisionRules.wholeCandidate, /source-only success separately/);
  assert.match(review.bindingContract.failureCondition, /no actual learner success/);
  const linked = alignments.filter(c => c.standards.includes(heardKey));
  assert.equal(linked.length, 1);
  assert.equal(linked[0].topicId, 'mt_A4YUbzUFan');
  assert.deepEqual([linked[0].ageRangeStart, linked[0].ageRangeEnd], [10, 11]);
}
test('R1 heard-summary component preserves source stage, exact readiness interval and whole-claim duties', () =>
  checkHeardComponent(heardReview));
test('heard-summary review rejects source-only mastery, missing media cases and earlier readiness', () => {
  const sourceOnly = structuredClone(heardReview);
  sourceOnly.decisionRules.wholeCandidate = sourceOnly.decisionRules.sourceTask;
  assert.throws(() => checkHeardComponent(sourceOnly));
  const noQuantitative = structuredClone(heardReview);
  noQuantitative.originalCasebank.pop();
  assert.throws(() => checkHeardComponent(noQuantitative));
  const noBinding = structuredClone(heardReview);
  noBinding.bindingContract.beforeUse = [];
  assert.throws(() => checkHeardComponent(noBinding));
  const earlier = structuredClone(contexts);
  earlier.find(c => c.standards.includes(heardKey)).ageRangeStart = 8;
  assert.throws(() => checkHeardComponent(heardReview, records, earlier));
  const falseFull = structuredClone(records);
  falseFull.find(r => r.key === heardKey).disposition = 'Full';
  assert.throws(() => checkHeardComponent(heardReview, falseFull));
});

test('promoted heard-summary history rejects a changed correction, retired path or missing entry', () => {
  const wrongCorrection = structuredClone(records);
  wrongCorrection.find(row => row.key === heardKey).historicalConditionalContributions[0]
    .dependencyCorrectionReport = 'unregistered-correction.json';
  assert.throws(() => checkGraph(wrongCorrection, contexts), /registered correction report/);
  const wrongPath = structuredClone(records);
  wrongPath.find(row => row.key === heardKey).historicalConditionalContributions[0]
    .historicalHardGatePaths[0][2] = 'invented-prerequisite';
  assert.throws(() => checkGraph(wrongPath, contexts), /unregistered change to a retired hard path/);
  const missing = structuredClone(records);
  delete missing.find(row => row.key === heardKey).historicalConditionalContributions;
  assert.throws(() => checkHeardComponent(heardReview, missing), /promoted candidate history required/);
});

test('expressive reading corrects only its complete English prerequisite while retaining intrinsic reading demands', () => {
  assert.equal(expressionCorrection.changes.length, 1);
  const { before, after } = expressionCorrection.changes[0];
  assert.deepEqual([before.topicId, before.prerequisiteId, before.strength],
    ['mt_V-ldQp56bF', 'mt_ZhvwM6LMBL', 'hard']);
  assert.equal(after.strength, 'soft');
  assert.equal(after.topicId, before.topicId); assert.equal(after.prerequisiteId, before.prerequisiteId);
  assert.deepEqual(edges.filter(e => e.topicId === after.topicId && e.prerequisiteId === after.prerequisiteId), [after]);
  assert.deepEqual(expressionCorrection.completeHardPathsBefore, [
    ['mt_V-ldQp56bF', 'mt_ZhvwM6LMBL', 'mt_1KCwbGvm1F'],
    ['mt_V-ldQp56bF', 'mt_ZhvwM6LMBL', 'mt_YKkCM63fSC'],
  ]);
  checkCompleteHardPaths(after.topicId, expressionCorrection.completeHardPathsAfter);
  assert.deepEqual(expressionCorrection.semanticChanges,
    { dependencies: 1, newTopics: 0, claims: 0, guides: 0, ages: 0, associations: 2, sourceDispositions: 2 });
  assert.deepEqual(expressionCorrection.originalUntestedTask.tasks.map(t => t.id),
    ['new-grade-appropriate-passage', 'self-monitor-and-correct', 'familiar-reread', 'changed-structure-transfer']);
  assert.match(expressionCorrection.originalUntestedTask.successRule, /accurate recognition/);
  assert.match(expressionCorrection.originalUntestedTask.successRule, /self-correction/);
  for (const key of expressionKeys) {
    const row = records.find(row => row.key === key);
    assert.deepEqual(row.contributions.map(c => c.topicId), ['mt_V-ldQp56bF'], 'one exact shared component');
    assert.ok(row.remainingConditions.length, 'actual role/material conditions remain');
  }
  checkGraph(records, contexts);
});
test('expressive source and goal bindings reject deleted candidate/history, unregistered correction and missing current paths', () => {
  for (const key of expressionHistoryKeys) {
    for (const mutation of ['candidate', 'history', 'correction', 'current']) {
      const rows = structuredClone(records), row = rows.find(row => row.key === key);
      const field = row.conditionalContributions.some(c => c.topicId === 'mt_V-ldQp56bF')
        ? 'conditionalContributions' : 'historicalConditionalContributions';
      const candidate = row[field].find(c => c.topicId === 'mt_V-ldQp56bF');
      if (mutation === 'candidate') row[field] = row[field].filter(c => c !== candidate);
      if (mutation === 'history') delete candidate.historicalHardGatePaths;
      if (mutation === 'correction') candidate.dependencyCorrectionReport = 'unregistered.json';
      if (mutation === 'current') candidate.inheritedHardGatePaths = [];
      assert.throws(() => checkGraph(rows, contexts));
    }
    const historical = structuredClone(records), row = historical.find(row => row.key === key);
    const c = [...row.conditionalContributions, ...(row.historicalConditionalContributions ?? [])]
      .find(c => c.topicId === 'mt_V-ldQp56bF');
    row.historicalConditionalContributions = [c];
    row.conditionalContributions = row.conditionalContributions.filter(x => x !== c);
    checkGraph(historical, contexts);
    delete row.historicalConditionalContributions[0].historicalHardGatePaths;
    assert.throws(() => checkGraph(historical, contexts), /exact expressive prerequisite history required/);
  }
});

test('expressive review rejects a missing history table, entry or path', () => {
  for (const mutation of ['table', 'entry', 'path']) {
    const report = structuredClone(expressionCorrection);
    if (mutation === 'table') delete report.historicalReportedPaths;
    if (mutation === 'entry') delete report.historicalReportedPaths[expressionHistoryKeys[0]];
    if (mutation === 'path') report.historicalReportedPaths[expressionHistoryKeys[0]] = [];
    assert.throws(() => checkExpressionHistoryTable(report), /exact expressive history table required/);
  }
});

function checkExpressionAssociations(report, reviewRows = records, alignments = contexts) {
  assert.deepEqual(report.componentAssociations.map(r => r.key), expressionKeys, 'exact two source bindings');
  for (const [index, binding] of report.componentAssociations.entries()) {
    const ages = index === 0 ? [6, 8] : [8, 11];
    assert.equal(binding.languageRole, index === 0 ? 'R1' : 'R2', 'separate actual role evidence');
    assert.deepEqual(binding.sourceAgeBand, index === 0 ? [3, 8] : [8, 11]);
    assert.deepEqual(binding.associationAgeBand, ages, 'exact reviewed readiness interval');
    assert.equal(binding.remainingConditions.length, 4, 'actual material/assessor and whole-target conditions');
    const row = reviewRows.find(row => row.key === binding.key);
    assert.equal(row.disposition, 'Partial', 'no Full promotion');
    assert.deepEqual(row.remainingConditions, binding.remainingConditions);
    assert.deepEqual(row.contributions[0].associationAgeBand, ages);
    const linked = alignments.filter(c => c.standards.includes(binding.key));
    assert.equal(linked.length, 1);
    assert.deepEqual([linked[0].topicId, linked[0].country, linked[0].ageRangeStart, linked[0].ageRangeEnd],
      ['mt_V-ldQp56bF', 'IN', ...ages]);
  }
  for (const key of expressionHistoryKeys.filter(key => !expressionKeys.includes(key))) {
    const row = reviewRows.find(row => row.key === key);
    assert.ok(row.conditionalContributions.some(c => c.topicId === 'mt_V-ldQp56bF'), 'broader goals remain withheld');
    assert.ok(!alignments.some(c => c.topicId === 'mt_V-ldQp56bF' && c.standards.includes(key)));
  }
}
test('two expressive components retain exact source stages, separate readiness intervals and actual roles', () =>
  checkExpressionAssociations(expressionCorrection));
test('expressive components reject Full, collapsed intervals, cross-role evidence and missing binding', () => {
  const full = structuredClone(records);full.find(r => r.key === expressionKeys[0]).disposition = 'Full';
  assert.throws(() => checkExpressionAssociations(expressionCorrection, full), /no Full promotion/);
  const collapsed = structuredClone(contexts);
  collapsed.find(c => c.standards.includes(expressionKeys[0])).ageRangeEnd = 11;
  assert.throws(() => checkGraph(records, collapsed));
  const crossRole = structuredClone(expressionCorrection);crossRole.componentAssociations[1].languageRole = 'R1';
  assert.throws(() => checkExpressionAssociations(crossRole), /separate actual role evidence/);
  const noBinding = structuredClone(expressionCorrection);noBinding.componentAssociations[0].remainingConditions = [];
  assert.throws(() => checkExpressionAssociations(noBinding), /actual material\/assessor/);
});

test('current framework graph summaries count active and withheld contributions without implying unconditional mastery', () => {
  const ledger = load('../reports/ncert-alignment-readiness-2026-11-10.json').records;
  const keys = new Set(ledger.map(row => row.key));
  const pairs = new Set(contexts.flatMap(c => c.standards.filter(k => keys.has(k)).map(k => pairKey(c.topicId, k))));
  const unpacked = [...pairs].map(pair => JSON.parse(pair));
  assert.equal(expressionCorrection.currentCensus.retainedNCERT, keys.size);
  assert.equal(expressionCorrection.currentCensus.linkedEligibleKeys, new Set(unpacked.map(([, key]) => key)).size);
  assert.equal(expressionCorrection.currentCensus.distinctNCERTPairs, pairs.size);
  assert.equal(expressionCorrection.currentCensus.NCERTLinkedTopics, new Set(unpacked.map(([id]) => id)).size);
  const excluded = ledger.filter(r => (r.disposition ?? r.reviewedDisposition) === 'OutOfScope').length;
  assert.equal(expressionCorrection.currentCensus.unlinkedEligibleKeys, keys.size - excluded - expressionCorrection.currentCensus.linkedEligibleKeys);
  for (const disposition of ['Full', 'Partial']) assert.equal(expressionCorrection.currentCensus[disposition],
    ledger.filter(row => (row.disposition ?? row.reviewedDisposition) === disposition).length);
  for (const batch of batches.slice(0, 2)) {
    assert.equal(batch.report.graphCounts.activeAssociations,
      batch.report.records.reduce((n, row) => n + row.contributions.length, 0));
    assert.equal(batch.report.graphCounts.sharedTopics,
      new Set(batch.report.records.flatMap(row => row.contributions.map(c => c.topicId))).size);
    assert.equal(batch.report.graphCounts.conditionalCandidatesNotPublished,
      batch.report.records.reduce((n, row) => n + (row.conditionalContributions ?? []).length, 0));
  }
});

const functionalFile = 'ncert-r2-functional-writing-component-2026-11-11.json';
const functionalReview = load(`../reports/${functionalFile}`);
const functionalKey = 'ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-R2-COMP-C-3.2';
function checkFunctionalComponent(report, reviewRows = records, alignments = contexts) {
  assert.equal(report.sourceKey, functionalKey);
  assert.equal(report.disposition, 'Partial', 'functional component is not Full');
  const row = reviewRows.find(r => r.key === functionalKey);
  assert.equal(row.disposition, 'Partial', 'functional source is not Full');
  assert.equal(row.languageRole, 'R2', 'actual R2 source role');
  assert.deepEqual(row.stageAgeBand, [8, 11]);
  assert.equal(row.remainingConditions.length, 5, 'actual-role/full-task conditions required');
  assert.deepEqual(report.remainingConditions, row.remainingConditions);
  assert.equal(report.bindingContract.required.length, 5, 'actual-role material/assessor binding required');
  assert.deepEqual(row.contributions.map(c => [c.topicId, c.role, c.associationAgeBand]),
    [['mt__MDiDU9Vck', 'component', [8, 11]]]);
  assert.deepEqual(alignments.filter(c => c.standards.includes(functionalKey)), [{
    topicId: 'mt__MDiDU9Vck', scope: 'jurisdiction', country: 'IN',
    ageRangeStart: 8, ageRangeEnd: 11, standards: [functionalKey],
  }], 'exact narrower component association');
  assert.deepEqual(report.originalPortfolio.map(c => c.id),
    ['poster-information', 'invitation-information', 'instruction-information'], 'all three written formats');
  for (const item of report.originalPortfolio) {
    assert.deepEqual(item.requiredProduction,
      { languageRole: 'R2', mode: 'pupil-authored-written', adultFinishedWordingAccepted: false },
      'independent actual-R2 written production');
    for (const field of ['pupilAction', 'nearMiss', 'transfer', 'wholeInformativeExtension'])
      assert.ok(item[field]?.length > 0, `missing ${field}`);
  }
  assert.deepEqual(report.completeCurrentHardPath,
    ['mt__MDiDU9Vck', 'mt_PJyCGJz5Hv', 'mt_N8CpN1EJrP']);
  checkCompleteHardPaths('mt__MDiDU9Vck', [report.completeCurrentHardPath]);
  for (const id of ['sentenceBuilding', 'oralRehearsal'])
    assert.ok(report.completePrerequisiteAssessment[id]?.actualRoleTask?.length > 0,
      'complete unchanged prerequisite tasks required');
  const withheld = row.conditionalContributions.find(c => c.topicId === 'mt_AHXePdicRf');
  assert.ok(withheld, 'reviewed multimodal candidate cannot disappear');
  assert.equal(report.withheldCandidate?.topicId, 'mt_AHXePdicRf');
  assert.deepEqual(withheld.historicalHardGatePaths, [
    ['mt_AHXePdicRf', 'mt_hp2qJ-QRBn', 'mt__MDiDU9Vck', 'mt_o8ciHks8t2'],
    ['mt_AHXePdicRf', 'mt_hp2qJ-QRBn', 'mt__MDiDU9Vck', 'mt_PJyCGJz5Hv', 'mt_o8ciHks8t2'],
  ], 'exact multimodal historical paths retained');
  assert.equal(withheld.dependencyCorrectionReport, reusableCorrectionFile);
  assert.deepEqual(withheld, report.withheldCandidate, 'complete multimodal history stays withheld');
  const goal = reviewRows.find(r => r.key === report.broaderGoal);
  assert.ok(goal.conditionalContributions.some(c => c.topicId === 'mt_AHXePdicRf'), 'parent goal stays withheld');
  assert.ok(!alignments.some(c => c.topicId === 'mt_AHXePdicRf' &&
    [functionalKey, report.broaderGoal].some(k => c.standards.includes(k))));
  for (const field of ['source', 'wholeInformative', 'wholePrerequisites', 'wholeMultimodal'])
    assert.ok(report.scoringSeparation[field]?.length > 0, 'source and whole scoring stay separate');
}
test('functional R2 writing uses one narrower component while retaining all written formats and the full hard chain', () =>
  checkFunctionalComponent(functionalReview));
test('functional writing rejects missing formats, adult copying, spoken substitution, missing role and false Full', () => {
  for (let index = 0; index < 3; index++) {
    const missing = structuredClone(functionalReview); missing.originalPortfolio.splice(index, 1);
    assert.throws(() => checkFunctionalComponent(missing), /all three written formats/);
    const copied = structuredClone(functionalReview); copied.originalPortfolio[index].requiredProduction.adultFinishedWordingAccepted = true;
    assert.throws(() => checkFunctionalComponent(copied), /independent actual-R2/);
    const spoken = structuredClone(functionalReview); spoken.originalPortfolio[index].requiredProduction.mode = 'spoken-only';
    assert.throws(() => checkFunctionalComponent(spoken), /independent actual-R2/);
  }
  const noRole = structuredClone(functionalReview); noRole.bindingContract.required = [];
  assert.throws(() => checkFunctionalComponent(noRole), /material\/assessor/);
  const wrongRole = structuredClone(functionalReview); wrongRole.originalPortfolio[0].requiredProduction.languageRole = 'R1';
  assert.throws(() => checkFunctionalComponent(wrongRole), /independent actual-R2/);
  const full = structuredClone(functionalReview); full.disposition = 'Full';
  assert.throws(() => checkFunctionalComponent(full), /not Full/);
  const rowFull = structuredClone(records); rowFull.find(r => r.key === functionalKey).disposition = 'Full';
  assert.throws(() => checkFunctionalComponent(functionalReview, rowFull), /not Full/);
  const noHistory = structuredClone(records); noHistory.find(r => r.key === functionalKey).conditionalContributions = [];
  const reportNoHistory = structuredClone(functionalReview); delete reportNoHistory.withheldCandidate;
  assert.throws(() => checkFunctionalComponent(reportNoHistory, noHistory), /cannot disappear/);
  const missingOldPath = structuredClone(records);
  missingOldPath.find(r => r.key === functionalKey).conditionalContributions[0].historicalHardGatePaths.pop();
  assert.throws(() => checkFunctionalComponent(functionalReview, missingOldPath), /exact multimodal historical/);
  const noPath = structuredClone(functionalReview); noPath.completeCurrentHardPath = [];
  assert.throws(() => checkFunctionalComponent(noPath));
  for (const id of ['sentenceBuilding', 'oralRehearsal']) {
    const missing = structuredClone(functionalReview); delete missing.completePrerequisiteAssessment[id];
    assert.throws(() => checkFunctionalComponent(missing), /prerequisite tasks/);
  }
});
