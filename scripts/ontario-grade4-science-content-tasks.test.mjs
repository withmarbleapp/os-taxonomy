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
    const propertyRoles = {
      'ON-SCI-2022-G4-C2': ['light-paths', 'light-absorption', 'sound-wave', 'sound-interactions', 'sound-modification', 'light-heat', 'light-emission', 'material-interactions', 'sensory-devices'],
      'ON-SCI-2022-G4-C2.1': ['light-emission'],
      'ON-SCI-2022-G4-C2.2': ['light-emission'],
      'ON-SCI-2022-G4-C2.3': ['light-paths', 'light-absorption'],
      'ON-SCI-2022-G4-C2.4': ['sound-wave', 'sound-interactions', 'sound-modification'],
      'ON-SCI-2022-G4-C2.5': ['sound-wave'],
      'ON-SCI-2022-G4-C2.6': ['material-interactions', 'sound-interactions'],
      'ON-SCI-2022-G4-C2.7': ['light-heat'],
      'ON-SCI-2022-G4-C2.8': ['sensory-devices'],
    }[row.code];
    if (propertyRoles) {
      assert.deepEqual(protocol.requiredCaseFields, ['question', 'expectedEvidence', 'nearMiss', 'changedCase'], 'Missing property-evidence contract');
      const roles = protocol.caseRefs.map(ref => report.preparedCases?.[ref]?.role);
      for (const role of propertyRoles) assert.ok(roles.includes(role), 'Missing required light/sound property');
    }

    for (const ref of protocol.caseRefs) {
      const value = report.preparedCases?.[ref];
      assert.ok(value?.sourceSummary?.trim() && value.attributionLimits?.trim() && value.resourceRefs?.length, 'Missing source-bound case');
      for (const sourceRef of value.resourceRefs) assert.ok(report.resources?.[sourceRef]?.url?.startsWith('https://') && report.resources[sourceRef].readScope?.trim(), 'Missing actual case resource');
      for (const field of protocol.requiredCaseFields ?? []) assert.ok(typeof value[field] === 'string' && value[field].trim(), 'Missing required property case evidence');
    }
    if (row.disposition === 'Full') {
      assert.deepEqual(protocol.remainingConditions, [], 'Unresolved Full protocol condition');
      if (Object.hasOwn(report, 'remainingConditions')) assert.deepEqual(report.remainingConditions, [], 'Unresolved Full report condition');
    }
  }
}
test('Grade4 reviewed content tasks retain exact source, contributor and actual resource bindings', () => {
  check(ledger.expectations);
  assert.deepEqual(ledger.counts, {
    freshFull: ledger.expectations.filter(row => row.historicalDisposition === 'Partial' && row.disposition === 'Full').length,
    retainedHistoricalFull: ledger.expectations.filter(row => row.historicalDisposition === 'Full').length,
    remainingPartial: ledger.expectations.filter(row => row.disposition === 'Partial').length,
  }, 'Current content counts differ from dispositions');
});
test('Grade4 fresh closures cannot lose their evidence dossier or actual prepared case', () => {
  const row = ledger.expectations.find(value => value.dossier);
  const missing = structuredClone(ledger.expectations); delete missing.find(value => value.code === row.code).dossier;
  assert.throws(() => check(missing), /Missing fresh task binding/);
  const report = load(`reports/${row.dossier}`); delete report.preparedCases['high-park'];
  assert.throws(() => check(ledger.expectations, contexts, name => name === row.dossier ? report : load(`reports/${name}`)), /Missing source-bound case|Missing required light\/sound property/);
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


test('Grade4 light/sound duties retain their concrete explanatory cases and transfer evidence', () => {
  const name = 'ontario-grade4-light-sound-properties-design-2026-11-11.json';
  for (const [id, field] of [['wave-handoff', 'expectedEvidence'], ['light-paths', 'changedCase'], ['sound-interactions', 'nearMiss'], ['light-and-heat', 'expectedEvidence']]) {
    const damaged = structuredClone(load(`reports/${name}`)); delete damaged.preparedCases[id][field];
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required property case evidence/);
  }
  const damaged = structuredClone(load(`reports/${name}`)); delete damaged.preparedCases['wave-handoff'];
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing source-bound case|Missing required light\/sound property/);
});


test('Grade4 sound task cannot keep Full after dropping its wave binding or evidence contract', () => {
  const name = 'ontario-grade4-light-sound-properties-design-2026-11-11.json';
  const missing = structuredClone(load(`reports/${name}`));
  missing.protocols['C2.4'].caseRefs = missing.protocols['C2.4'].caseRefs.filter(ref => ref !== 'wave-handoff');
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? missing : load(`reports/${report}`)), /Missing required light\/sound property/);
  const noContract = structuredClone(load(`reports/${name}`)); delete noContract.protocols['C2.4'].requiredCaseFields;
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? noContract : load(`reports/${report}`)), /Missing property-evidence contract/);
});


test('Grade4 integrated light/sound cannot substitute child links for a missing sensory/material/emission task', () => {
  const name = 'ontario-grade4-light-sound-properties-design-2026-11-11.json';
  for (const role of ['light-emission', 'material-interactions', 'sensory-devices']) {
    const damaged = structuredClone(load(`reports/${name}`));
    damaged.protocols.C2.caseRefs = damaged.protocols.C2.caseRefs.filter(ref => damaged.preparedCases[ref].role !== role);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required light\/sound property/);
  }
});
