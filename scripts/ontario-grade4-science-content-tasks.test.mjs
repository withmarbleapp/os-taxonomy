import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url)));
const ledger = load('reports/ontario-grade4-science-content-current-ledger-2026-11-11.json');
const contexts = load('data/curriculum-alignments.json').alignments;
const slug = 'the-ontario-curriculum-science-and-technology-20';
const source = load('data/curriculum-standards.json').curricula.find(row => row.slug === slug);
const selected = source.topics.filter(row => /^ON-SCI-2022-G4-[BCDE]\d/.test(row.code)).map(row => row.code).sort();
function check(rows, associations = contexts, read = name => load(`reports/${name}`)) {
  assert.deepEqual(rows.map(row => row.code).sort(), selected, 'Missing Grade4 content record');
  for (const row of rows) {
    assert.equal(row.key, `${slug}:${row.code}`, 'Grade4 source identity mismatch');
    if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, [], 'Unresolved Full ledger condition');
    if (row.disposition === 'Full' && row.historicalDisposition === 'Partial') assert.ok(row.dossier && row.protocolReference?.startsWith('/protocols/'), 'Missing fresh task binding');
    if (!row.dossier) continue;
    const report = read(row.dossier);
    assert.ok(row.protocolReference?.startsWith('/protocols/'), 'Missing task protocol reference');
    const protocol = report.protocols?.[row.protocolReference.slice('/protocols/'.length)];
    assert.ok(protocol && protocol.codes?.includes(row.code), 'Missing source-bound task protocol');
    assert.deepEqual([...protocol.contributorIds].sort(), [...row.contributingTopicIds].sort(), 'Task contributor mismatch');
    for (const id of row.contributingTopicIds) assert.ok(associations.some(context => context.topicId === id && context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart === 9 && context.ageRangeEnd === 10 && context.standards.includes(row.key)), 'Missing actual source association');
    assert.ok(protocol.caseRefs?.length && protocol.actions?.length >= 4 && protocol.actions.every(value => typeof value === 'string' && value.trim()), 'Missing concrete task actions');
    for (const ref of protocol.caseRefs) {
      const value = report.preparedCases?.[ref];
      assert.ok(value?.sourceSummary?.trim() && value.attributionLimits?.trim() && value.resourceRefs?.length, 'Missing source-bound case');
      for (const sourceRef of value.resourceRefs) assert.ok(report.resources?.[sourceRef]?.url?.startsWith('https://') && report.resources[sourceRef].readScope?.trim(), 'Missing actual case resource');
    }
    if (row.disposition === 'Full') {
      assert.deepEqual(protocol.remainingConditions, [], 'Unresolved Full protocol condition');
      if (Object.hasOwn(report, 'remainingConditions')) assert.deepEqual(report.remainingConditions, [], 'Unresolved Full report condition');
    }
  }
}
test('Grade4 reviewed content tasks retain exact source, contributor and actual resource bindings', () => check(ledger.expectations));
test('Grade4 fresh closures cannot lose their evidence dossier or actual prepared case', () => {
  const row = ledger.expectations.find(value => value.dossier);
  const missing = structuredClone(ledger.expectations); delete missing.find(value => value.code === row.code).dossier;
  assert.throws(() => check(missing), /Missing fresh task binding/);
  const report = load(`reports/${row.dossier}`); delete report.preparedCases['high-park'];
  assert.throws(() => check(ledger.expectations, contexts, name => name === row.dossier ? report : load(`reports/${name}`)), /Missing source-bound case/);
});
test('Grade4 Full tasks cannot ignore source resource loss or retained protocol conditions', () => {
  const row = ledger.expectations.find(value => value.dossier);
  const original = load(`reports/${row.dossier}`);
  const missing = structuredClone(original); delete missing.resources['toronto-savannah'];
  assert.throws(() => check(ledger.expectations, contexts, name => name === row.dossier ? missing : load(`reports/${name}`)), /Missing actual case resource/);
  for (const owner of ['report', 'protocol']) {
    const damaged = structuredClone(original);
    (owner === 'report' ? damaged : damaged.protocols['human-effects']).remainingConditions = ['A source condition is unresolved.'];
    assert.throws(() => check(ledger.expectations, contexts, name => name === row.dossier ? damaged : load(`reports/${name}`)), /Unresolved Full (?:protocol|report) condition/);
  }
});
