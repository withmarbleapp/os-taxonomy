import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url)));
const ledger = load('reports/ontario-grade1-life-systems-current-ledger-2026-11-11.json');
const programmeName = 'ontario-grade1-life-systems-task-design-2026-11-11.json';
const programme = load(`reports/${programmeName}`);
const contexts = load('data/curriculum-alignments.json').alignments;
const topics = new Map(load('data/topics.json').topics.map(row => [row.id, row]));
const slug = 'the-ontario-curriculum-science-and-technology-20';
const selected = load('data/curriculum-standards.json').curricula.find(row => row.slug === slug).topics.filter(row => /^ON-SCI-2022-G1-B\d/.test(row.code)).map(row => row.code).sort();
const roles = {
  "ON-SCI-2022-G1-B1.1": [
    "living-nonliving-loss-perspectives"
  ],
  "ON-SCI-2022-G1-B2.2": [
    "explicit-needs-temperature-shelter-space"
  ],
  "ON-SCI-2022-G1-B2.3": [
    "varied-plant-animal-human-function"
  ],
  "ON-SCI-2022-G1-B2.5": [
    "environment-quality-needs",
    "explicit-needs-temperature-shelter-space"
  ],
  "ON-SCI-2022-G1-B1": [
    "living-nonliving-loss-perspectives",
    "environment-quality-needs"
  ],
  "ON-SCI-2022-G1-B2": [
    "explicit-needs-temperature-shelter-space",
    "varied-plant-animal-human-function",
    "environment-quality-needs"
  ]
};
// Review membership is explicit; missing dossier fields cannot erase checks.
const reviewedFreshCodes = Object.keys(roles).sort();
const reviewedHistoricalCodes = []; // Four retained historical labels are separate.
function check(rows = ledger.expectations, report = programme, associations = contexts) {
  assert.deepEqual(rows.map(row => row.code).sort(), selected, 'Missing G1 Life record');
  assert.deepEqual(rows.filter(row => row.disposition === 'Full' && row.historicalDisposition === 'Partial').map(row => row.code).sort(), reviewedFreshCodes, 'G1 reviewed registry mismatch');
  for (const row of rows) {
    assert.equal(row.key, `${slug}:${row.code}`);
    if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, []);
    if (!reviewedFreshCodes.includes(row.code) && !reviewedHistoricalCodes.includes(row.code)) continue;
    assert.equal(row.dossier, programmeName, 'Missing actual G1 dossier');
    assert.ok(row.protocolReference?.startsWith('/protocols/'), 'Missing actual G1 binding');
    const protocol = report.protocols?.[row.protocolReference.slice('/protocols/'.length)];
    assert.ok(protocol?.codes?.includes(row.code), 'Missing actual G1 protocol');
    assert.deepEqual(protocol.remainingConditions, [], 'Unresolved G1 source condition');
    assert.deepEqual([...protocol.contributorIds].sort(), [...row.contributingTopicIds].sort(), 'G1 contributor mismatch');
    assert.ok(protocol.actions?.length >= 4 && protocol.actions.every(value => typeof value === 'string' && value.trim()));
    assert.ok(protocol.contributorIds.length, 'Missing actual G1 contributor');
    for (const id of row.contributingTopicIds) {
      const card = topics.get(id);
      assert.ok(card && card.ageRangeStart <= 6 && card.ageRangeEnd >= 7, 'Unreviewed later whole-claim age boundary');
      assert.ok(associations.some(context => context.topicId === id && context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart === 6 && context.ageRangeEnd === 7 && context.standards.includes(row.key)), 'Missing actual G1 source pair');
    }
    const boundRoles = protocol.caseRefs?.map(ref => report.preparedCases?.[ref]?.role) ?? [];
    for (const role of roles[row.code]) assert.ok(boundRoles.includes(role), 'Missing actual G1 task role');
    for (const ref of protocol.caseRefs) {
      const value = report.preparedCases?.[ref];
      assert.ok(value?.givenFacts?.length >= 3 && value.givenFacts.every(value => typeof value === 'string' && value.trim()) && value.attributionLimits?.trim(), 'Missing declared G1 model facts');
      assert.ok(value.resourceRefs?.length, 'Missing actual G1 factual resource');
      assert.deepEqual(protocol.requiredCaseFields, ['question', 'expectedEvidence', 'nearMiss', 'changedCase']);
      for (const key of protocol.requiredCaseFields) assert.ok(value[key]?.trim(), 'Missing actual G1 case evidence');
      for (const key of value.resourceRefs) assert.ok(report.resources?.[key]?.url?.startsWith('https://') && report.resources[key].readScope?.trim(), 'Missing actual G1 factual resource');
    }
  }
}
test('G1 life inventory and explicit source-bound portfolios remain complete', () => {
  check();
  assert.deepEqual(ledger.counts, { freshFull: ledger.expectations.filter(row => row.historicalDisposition === 'Partial' && row.disposition === 'Full').length, retainedHistoricalFull: ledger.expectations.filter(row => row.historicalDisposition === 'Full' && row.disposition === 'Full').length, remainingPartial: ledger.expectations.filter(row => row.disposition === 'Partial').length });
});
test('G1 review membership cannot disappear with a binding or historical relabel', () => {
  const rows = structuredClone(ledger.expectations); const row = rows.find(value => value.code === 'ON-SCI-2022-G1-B2.3');
  delete row.dossier; assert.throws(() => check(rows), /Missing actual G1 dossier/);
  row.historicalDisposition = 'Full'; assert.throws(() => check(rows), /G1 reviewed registry mismatch/);
});
test('G1 overall portfolios cannot omit quality or structure-function tasks', () => {
  for (const [protocol, ref] of [['B1', 'environment-quality'], ['B2', 'structure-function']]) {
    const report = structuredClone(programme); report.protocols[protocol].caseRefs = report.protocols[protocol].caseRefs.filter(value => value !== ref);
    assert.throws(() => check(ledger.expectations, report), /Missing actual G1 task role/);
  }
});
test('G1 model facts, factual resources and changed-case evidence cannot be omitted', () => {
  for (const field of ['givenFacts', 'changedCase']) {
    const report = structuredClone(programme); delete report.preparedCases['structure-function'][field];
    assert.throws(() => check(ledger.expectations, report), /Missing (?:declared G1 model facts|actual G1 case evidence)/);
  }
  const report = structuredClone(programme); delete report.resources['amnh-camouflage'];
  assert.throws(() => check(ledger.expectations, report), /Missing actual G1 factual resource/);
});
test('the rejected later structure argument cannot replace an early function component', () => {
  const rows = structuredClone(ledger.expectations); const report = structuredClone(programme);
  rows.find(value => value.code === 'ON-SCI-2022-G1-B2.3').contributingTopicIds.push('mt_8VA40Tumth'); report.protocols['B2.3'].contributorIds.push('mt_8VA40Tumth');
  assert.throws(() => check(rows, report), /Unreviewed later whole-claim age boundary/);
});

test('G1 loss case cannot omit the explicit human-perspective facts', () => {
  const report = structuredClone(programme); report.preparedCases['living-nonliving-loss'].givenFacts.pop();
  assert.throws(() => check(ledger.expectations, report), /Missing declared G1 model facts/);
  const emptyResources = structuredClone(programme); emptyResources.preparedCases['structure-function'].resourceRefs = [];
  assert.throws(() => check(ledger.expectations, emptyResources), /Missing actual G1 factual resource/);
});
