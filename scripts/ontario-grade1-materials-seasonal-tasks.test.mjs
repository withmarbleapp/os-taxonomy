import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url)));
const slug = 'the-ontario-curriculum-science-and-technology-20';
const contexts = load('data/curriculum-alignments.json').alignments;
const edges = load('data/dependencies.json').dependencies;
const catalogue = load('data/curriculum-standards.json').curricula.find(row => row.slug === slug).topics;
const packages = Object.fromEntries(['materials-structures', 'daily-seasonal'].map(name => [name, {
  name: `ontario-grade1-${name}-task-design-2026-11-11.json`,
  report: load(`reports/ontario-grade1-${name}-task-design-2026-11-11.json`),
  ledger: load(`reports/ontario-grade1-${name}-current-ledger-2026-11-11.json`),
}]));
// Explicit review registries cannot disappear when a dossier is deleted or relabelled.
const fresh = ['D1', 'D1.1', 'D1.2', 'D2', 'D2.2', 'D2.7', 'E1', 'E1.1', 'E1.2', 'E2', 'E2.3', 'E2.5'];
const historical = ['D2.8'];
const requiredRoles = {
  D1: ['same-purpose-material-lifecycle', 'actual-safe-waste-action'],
  'D1.1': ['actual-safe-waste-action'],
  'D1.2': ['same-purpose-material-lifecycle', 'raw-source-and-whole-fibre-distinction'],
  D2: ['same-purpose-material-lifecycle', 'load-framework-and-fastener-function'],
  'D2.2': ['load-framework-and-fastener-function'],
  'D2.7': ['load-framework-and-fastener-function'],
  'D2.8': ['raw-source-and-whole-fibre-distinction', 'same-purpose-material-lifecycle'],
  E1: ['daily-seasonal-human-plans-and-innovation', 'six-cell-impacts-and-response', 'appearance-season-function-transfer'],
  'E1.1': ['daily-seasonal-human-plans-and-innovation'],
  'E1.2': ['daily-seasonal-human-plans-and-innovation', 'six-cell-impacts-and-response'],
  E2: ['six-cell-impacts-and-response', 'day-four-season-light-and-warming', 'appearance-season-function-transfer'],
  'E2.3': ['day-four-season-light-and-warming'],
  'E2.5': ['appearance-season-function-transfer'],
};
function check(pkgs = packages, associations = contexts, dependencies = edges) {
  for (const [name, item] of Object.entries(pkgs)) {
    const { ledger, report } = item;
    const strand = name === 'materials-structures' ? 'D' : 'E';
    const selected = catalogue.filter(row => row.code.startsWith(`ON-SCI-2022-G1-${strand}`)).map(row => row.code).sort();
    assert.deepEqual(ledger.expectations.map(row => row.code).sort(), selected, 'Missing G1 strand inventory');
    const freshCodes = fresh.filter(code => code.startsWith(strand)).map(code => `ON-SCI-2022-G1-${code}`).sort();
    assert.deepEqual(ledger.expectations.filter(row => row.qualification === 'fresh-source-task').map(row => row.code).sort(), freshCodes, 'Fresh review registry changed');
    const historicalCodes = historical.filter(code => code.startsWith(strand)).map(code => `ON-SCI-2022-G1-${code}`).sort();
    assert.deepEqual(ledger.expectations.filter(row => row.qualification === 'fresh-historical-requalification').map(row => row.code).sort(), historicalCodes, 'Historical review registry changed');
    assert.equal(report.scope.sourceTaskCoverageNotLearnerCertification, true, 'Source task cannot certify whole learner mastery');
    for (const row of ledger.expectations) {
      const code = row.code.split('G1-')[1];
      assert.equal(row.key, `${slug}:${row.code}`);
      if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, []);
      if (!fresh.includes(code) && !historical.includes(code)) continue;
      assert.equal(row.historicalDisposition, historical.includes(code) ? 'Full' : 'Partial', 'Source history changed');
      assert.equal(row.disposition, 'Full');
      assert.equal(row.dossier, item.name, 'Missing reviewed dossier');
      assert.equal(row.protocolReference, `/protocols/${code}`, 'Missing actual protocol binding');
      const protocol = report.protocols?.[code];
      assert.ok(protocol?.codes.includes(row.code), 'Missing actual source protocol');
      assert.deepEqual(protocol.remainingConditions, []);
      assert.deepEqual(protocol.contributorIds, row.contributingTopicIds, 'Contributor binding changed');
      assert.ok(protocol.actions?.length >= 4 && protocol.actions.every(value => typeof value === 'string' && value.trim()));
      const boundRoles = protocol.caseRefs.map(ref => report.preparedCases?.[ref]?.role);
      for (const role of requiredRoles[code]) assert.ok(boundRoles.includes(role), 'Missing required task role');
      for (const id of row.contributingTopicIds) assert.ok(associations.some(context => context.topicId === id && context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart === 6 && context.ageRangeEnd === 7 && context.standards.includes(row.key)), 'Missing actual Ontario source pair');
      for (const ref of protocol.caseRefs) {
        const value = report.preparedCases[ref];
        assert.ok(value.givenFacts?.length >= 3 && value.givenFacts.every(fact => typeof fact === 'string' && fact.trim()), 'Missing explicit original case facts');
        for (const key of ['question', 'expectedEvidence', 'nearMiss', 'changedCase', 'attributionLimits']) assert.ok(value[key]?.trim(), 'Missing source evidence or whole/component limit');
        assert.ok(value.resourceRefs.length, 'Missing factual source binding');
        for (const id of value.resourceRefs) assert.ok(report.resources[id]?.url.startsWith('https://') && report.resources[id].readScope?.trim(), 'Missing bounded factual source');
      }
    }
    assert.deepEqual(ledger.counts, {
      freshFull: ledger.expectations.filter(row => row.qualification === 'fresh-source-task').length,
      freshHistoricalRequalification: ledger.expectations.filter(row => row.qualification === 'fresh-historical-requalification').length,
      retainedHistoricalFull: ledger.expectations.filter(row => row.qualification === 'retained-historical-label' && row.disposition === 'Full').length,
      remainingPartial: ledger.expectations.filter(row => row.disposition === 'Partial').length,
    });
  }
  const d = pkgs['materials-structures'].report;
  assert.deepEqual(d.protocols['D1.1'].requiredTaskComponents, ['identify-waste-kinds', 'plan', 'carry-out', 'explain-each'], 'Waste task must include actual action');
  assert.deepEqual(d.preparedCases['safe-paper-action'].requiredTaskComponents, d.protocols['D1.1'].requiredTaskComponents, 'Actual action case must be bound');
  assert.equal(d.preparedCases['safe-paper-action'].requiresActualEnactment, true, 'Plan alone cannot replace actual action');
  assert.ok(!dependencies.some(edge => edge.topicId === 'mt_i8AGTuk4fJ' && edge.prerequisiteId === 'mt_e3-_toGuWf'), 'Unjustified fair-test gate restored');
  const e = pkgs['daily-seasonal'].report;
  const outdoor = e.preparedCases['daily-seasonal-school-nature-plans'];
  assert.deepEqual(outdoor.requiredActivities, ['outdoor-nature-observation-drawing', 'outdoor-reading'], 'Both outdoor activities required');
  assert.deepEqual(outdoor.requiredSeasons, ['spring', 'summer', 'autumn', 'winter'], 'Four seasonal outdoor conditions required');
  assert.deepEqual(outdoor.requiredOutdoorProtection, ['rain', 'warm-layers', 'shade', 'wind'], 'Outdoor enabling protection required');
  assert.equal(outdoor.indoorOnlySatisfiesOutdoor, false, 'Indoor alternative cannot satisfy outdoor conjunct');
  assert.deepEqual(e.protocols['E1.1'].requiredTaskComponents, ['both-outdoor-activities', 'daily-and-four-season-comparison', 'outdoor-protection-functions-limits', 'reject-indoor-only-near-miss', 'severity-access-limits'], 'Outdoor assessment conjunct omitted');
  const cause = pkgs['daily-seasonal'].ledger.expectations.find(row => row.code.endsWith('-E2.1'));
  assert.equal(cause.disposition, 'Partial', 'Descriptive observations cannot certify seasonal cause');
  assert.ok(cause.remainingConditions.length);
}
test('G1 materials and seasonal reviewed inventories and actual task bindings are complete', () => check());
test('a historical reviewed row cannot escape checks by losing its dossier', () => {
  const pkgs = structuredClone(packages); delete pkgs['materials-structures'].ledger.expectations.find(row => row.code.endsWith('-D2.8')).dossier;
  assert.throws(() => check(pkgs), /Missing reviewed dossier/);
});
test('fresh closures cannot be relabelled historical or counted as extra requalifications', () => {
  const pkgs = structuredClone(packages); pkgs['materials-structures'].ledger.expectations.find(row => row.code.endsWith('-D1.1')).historicalDisposition = 'Full';
  assert.throws(() => check(pkgs), /Source history changed/);
});
test('waste minimisation requires enactment and its actual bound case', () => {
  for (const mutation of ['action', 'binding']) {
    const pkgs = structuredClone(packages); const report = pkgs['materials-structures'].report;
    if (mutation === 'action') report.preparedCases['safe-paper-action'].requiresActualEnactment = false;
    else report.protocols['D1.1'].caseRefs = [];
    assert.throws(() => check(pkgs), /Plan alone|Missing required task role/);
  }
});
test('an indoor-only alternative or missing outdoor conjunct cannot pass', () => {
  for (const mutation of ['indoor', 'activity', 'season', 'protocol']) {
    const pkgs = structuredClone(packages); const report = pkgs['daily-seasonal'].report; const value = report.preparedCases['daily-seasonal-school-nature-plans'];
    if (mutation === 'indoor') value.indoorOnlySatisfiesOutdoor = true;
    if (mutation === 'activity') value.requiredActivities.pop();
    if (mutation === 'season') value.requiredSeasons.pop();
    if (mutation === 'protocol') report.protocols['E1.1'].requiredTaskComponents.pop();
    assert.throws(() => check(pkgs), /outdoor|Outdoor/);
  }
});
test('case facts, source bounds, transfer and whole/component limits remain required', () => {
  for (const field of ['givenFacts', 'changedCase', 'attributionLimits']) {
    const pkgs = structuredClone(packages); delete pkgs['materials-structures'].report.preparedCases['material-fibre-origin'][field];
    assert.throws(() => check(pkgs), /Missing explicit|Missing source evidence/);
  }
  const pkgs = structuredClone(packages); pkgs['daily-seasonal'].report.scope.sourceTaskCoverageNotLearnerCertification = false;
  assert.throws(() => check(pkgs), /whole learner mastery/);
});
test('a daily/seasonal overall cannot omit a domain portfolio or promote the causal residual', () => {
  const pkgs = structuredClone(packages); pkgs['daily-seasonal'].report.protocols['E1.2'].caseRefs.pop();
  assert.throws(() => check(pkgs), /Missing required task role/);
  const cause = structuredClone(packages); cause['daily-seasonal'].ledger.expectations.find(row => row.code.endsWith('-E2.1')).disposition = 'Full';
  assert.throws(() => check(cause), /Assertion|seasonal cause/);
});
