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
      'ON-SCI-2022-G4-B1': ['human-restoration', 'species-depletion-prevention'],
      'ON-SCI-2022-G4-E2': ['formation-properties', 'composition-properties', 'resource-uses', 'fossil-history', 'first-nations-selection', 'metis-selection', 'inuit-selection'],
      'ON-SCI-2022-G4-C1': ['societal-light-sound', 'societal-sound', 'environment-light', 'environment-sound'],
      'ON-SCI-2022-G4-C1.1': ['societal-light-sound', 'societal-sound'],
      'ON-SCI-2022-G4-C1.2': ['environment-light', 'environment-sound'],
      'ON-SCI-2022-G4-C2': ['light-paths', 'light-absorption', 'sound-wave', 'sound-interactions', 'sound-modification', 'light-heat', 'light-emission', 'material-interactions', 'sensory-devices'],
      'ON-SCI-2022-G4-C2.1': ['light-emission'],
      'ON-SCI-2022-G4-C2.2': ['light-emission'],
      'ON-SCI-2022-G4-C2.3': ['light-paths', 'light-absorption'],
      'ON-SCI-2022-G4-C2.4': ['sound-wave', 'sound-interactions', 'sound-modification'],
      'ON-SCI-2022-G4-C2.5': ['sound-wave'],
      'ON-SCI-2022-G4-C2.6': ['material-interactions', 'sound-interactions'],
      'ON-SCI-2022-G4-C2.7': ['light-heat'],
      'ON-SCI-2022-G4-C2.8': ['sensory-devices'],
      'ON-SCI-2022-G4-E1': ['geological-society-environment', 'full-material-lifecycle'],
      'ON-SCI-2022-G4-E1.1': ['geological-society-environment'],
      'ON-SCI-2022-G4-E1.2': ['full-material-lifecycle'],
      'ON-SCI-2022-G4-E2.3': ['composition-properties'],
      'ON-SCI-2022-G4-E2.6': ['first-nations-selection', 'metis-selection', 'inuit-selection'],
      'ON-SCI-2022-G4-D1': ['community-machine', 'same-purpose-environment'],
      'ON-SCI-2022-G4-D1.1': ['community-machine'],
      'ON-SCI-2022-G4-D1.2': ['same-purpose-environment'],
      'ON-SCI-2022-G4-D2': ['lever', 'fixed-pulley', 'movable-pulley', 'spur-gears', 'plane-change'],
      'ON-SCI-2022-G4-D2.1': ['lever', 'fixed-pulley', 'movable-pulley', 'spur-gears', 'plane-change'],
      'ON-SCI-2022-G4-D2.2': ['lever', 'fixed-pulley', 'movable-pulley', 'spur-gears', 'plane-change'],
      'ON-SCI-2022-G4-D2.3': ['lever', 'fixed-pulley', 'spur-gears'],
      'ON-SCI-2022-G4-D2.4': ['spur-gears', 'plane-change'],
      'ON-SCI-2022-G4-D2.5': ['lever', 'fixed-pulley', 'movable-pulley', 'spur-gears'],
    }[row.code];
    if (propertyRoles) {
      if (row.code !== 'ON-SCI-2022-G4-B1') assert.deepEqual(protocol.requiredCaseFields, ['question', 'expectedEvidence', 'nearMiss', 'changedCase'], 'Missing property-evidence contract');
      const roles = protocol.caseRefs.map(ref => report.preparedCases?.[ref]?.role);
      for (const role of propertyRoles) assert.ok(roles.includes(role), 'Missing required scientific task role');
      if (['ON-SCI-2022-G4-D1', 'ON-SCI-2022-G4-D1.1'].includes(row.code)) assert.ok(new Set(protocol.caseRefs.filter(ref => report.preparedCases?.[ref]?.role === 'community-machine')).size >= 2, 'Missing varied-community comparison');
    }

    if (['ON-SCI-2022-G4-E1', 'ON-SCI-2022-G4-E1.2'].includes(row.code)) {
      const stages = ['extraction', 'refining', 'manufacturing', 'recycling', 'disposal'];
      assert.deepEqual(protocol.requiredLifecycleStages, stages, 'Missing required source lifecycle stages');
      const materialCase = protocol.caseRefs.map(ref => report.preparedCases?.[ref]).find(value => value?.role === 'full-material-lifecycle');
      assert.deepEqual(materialCase?.lifecycleStages, stages, 'Missing actual material lifecycle stage');
    }
    for (const required of protocol.requiredProtocols ?? []) assert.ok(report.protocols?.[required]?.actions?.length >= 4 && report.protocols[required].caseRefs?.length, 'Missing required integrated child task');
    for (const ref of protocol.caseRefs) {
      const value = report.preparedCases?.[ref];
      assert.ok(value?.sourceSummary?.trim() && value.attributionLimits?.trim() && value.resourceRefs?.length, 'Missing source-bound case');
      for (const sourceRef of value.resourceRefs) {
        const resource = report.resources?.[sourceRef];
        if (resource?.type === 'original-hypothetical-case-bank') {
          assert.equal(resource.file, row.dossier, 'Wrong original case-bank file');
          assert.ok(resource.caseIds?.includes(ref) && resource.readScope?.trim(), 'Missing original case-bank binding');
          assert.equal(value.origin, 'original-hypothetical', 'Original case presented as observation');
          assert.ok(value.givenFacts?.length >= 3 && value.givenFacts.every(fact => typeof fact === 'string' && fact.trim()), 'Missing supplied transfer facts');
          for (const field of ['question', 'expectedEvidence', 'nearMiss', 'changedCase']) assert.ok(typeof value[field] === 'string' && value[field].trim(), 'Missing supplied transfer evidence');
        } else assert.ok(resource?.url?.startsWith('https://') && resource.readScope?.trim(), 'Missing actual case resource');
      }
      for (const field of protocol.requiredCaseFields ?? []) assert.ok(typeof value[field] === 'string' && value[field].trim(), 'Missing required property case evidence');
      if (value.role === 'plane-change') for (const field of ['geometryBefore', 'geometryAfter']) assert.ok(typeof value[field] === 'string' && value[field].trim(), 'Missing actual plane-change geometry');
    }
    const transferRefs = {
      'ON-SCI-2022-G4-B2.2': ['wetland-model'],
      'ON-SCI-2022-G4-B2.7': ['wetland-model', 'dry-grassland-model'],
    }[row.code] ?? [];
    for (const ref of transferRefs) assert.ok(protocol.caseRefs.includes(ref), 'Missing supplied contrasting transfer case');
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
    retainedHistoricalFull: ledger.expectations.filter(row => row.historicalDisposition === 'Full' && row.disposition === 'Full').length,
    remainingPartial: ledger.expectations.filter(row => row.disposition === 'Partial').length,
  }, 'Current content counts differ from dispositions');
});
test('Grade4 fresh closures cannot lose their evidence dossier or actual prepared case', () => {
  const row = ledger.expectations.find(value => value.dossier);
  const missing = structuredClone(ledger.expectations); delete missing.find(value => value.code === row.code).dossier;
  assert.throws(() => check(missing), /Missing fresh task binding/);
  const report = load(`reports/${row.dossier}`); delete report.preparedCases['high-park'];
  assert.throws(() => check(ledger.expectations, contexts, name => name === row.dossier ? report : load(`reports/${name}`)), /Missing source-bound case|Missing required scientific task role/);
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
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing source-bound case|Missing required scientific task role/);
});


test('Grade4 sound task cannot keep Full after dropping its wave binding or evidence contract', () => {
  const name = 'ontario-grade4-light-sound-properties-design-2026-11-11.json';
  const missing = structuredClone(load(`reports/${name}`));
  missing.protocols['C2.4'].caseRefs = missing.protocols['C2.4'].caseRefs.filter(ref => ref !== 'wave-handoff');
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? missing : load(`reports/${report}`)), /Missing required scientific task role/);
  const noContract = structuredClone(load(`reports/${name}`)); delete noContract.protocols['C2.4'].requiredCaseFields;
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? noContract : load(`reports/${report}`)), /Missing property-evidence contract/);
});


test('Grade4 integrated light/sound cannot substitute child links for a missing sensory/material/emission task', () => {
  const name = 'ontario-grade4-light-sound-properties-design-2026-11-11.json';
  for (const role of ['light-emission', 'material-interactions', 'sensory-devices']) {
    const damaged = structuredClone(load(`reports/${name}`));
    damaged.protocols.C2.caseRefs = damaged.protocols.C2.caseRefs.filter(ref => damaged.preparedCases[ref].role !== role);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required scientific task role/);
  }
});


test('Grade4 mechanism transformations retain actual plane geometry and varied motion cases', () => {
  const name = 'ontario-grade4-mechanism-functions-design-2026-11-11.json';
  for (const field of ['geometryBefore', 'geometryAfter']) {
    const damaged = structuredClone(load(`reports/${name}`)); delete damaged.preparedCases['plane-change'][field];
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing actual plane-change geometry/);
  }
  for (const [code, ref] of [['D2.3', 'fixed-pulley'], ['D2.4', 'plane-change'], ['D2', 'movable-pulley']]) {
    const damaged = structuredClone(load(`reports/${name}`)); damaged.protocols[code].caseRefs = damaged.protocols[code].caseRefs.filter(value => value !== ref);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required scientific task role/);
  }
});


test('Grade4 impact tasks cannot retain closure with only light or only societal cases', () => {
  const name = 'ontario-grade4-light-sound-impact-design-2026-11-11.json';
  for (const [code, ref] of [['C1', 'ship-sound'], ['C1.2', 'firefly-light'], ['C1.1', 'hearing-aid']]) {
    const damaged = structuredClone(load(`reports/${name}`));
    damaged.protocols[code].caseRefs = damaged.protocols[code].caseRefs.filter(value => value !== ref);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required scientific task role/);
  }
  const damaged = structuredClone(load(`reports/${name}`)); delete damaged.preparedCases['ship-sound'].changedCase;
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required property case evidence/);
});


test('Grade4 machine impact duties retain varied communities and the same-purpose environmental comparison', () => {
  const name = 'ontario-grade4-machines-community-environment-design-2026-11-11.json';
  for (const [code, ref] of [['D1.1', 'pump'], ['D1', 'mower-comparison']]) {
    const damaged = structuredClone(load(`reports/${name}`));
    damaged.protocols[code].caseRefs = damaged.protocols[code].caseRefs.filter(value => value !== ref);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing varied-community comparison|Missing required scientific task role/);
  }
  const damaged = structuredClone(load(`reports/${name}`)); delete damaged.preparedCases['mower-comparison'].expectedEvidence;
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required property case evidence/);
});


test('Grade4 mineral tasks retain composition and all three attributed knowledge-selection cases', () => {
  const name = 'ontario-grade4-mineral-classification-knowledge-design-2026-11-11.json';
  for (const ref of ['haida-selection', 'metis-selection', 'inuit-selection']) {
    const damaged = structuredClone(load(`reports/${name}`));
    damaged.protocols['E2.6'].caseRefs = damaged.protocols['E2.6'].caseRefs.filter(value => value !== ref);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required scientific task role/);
  }
  const damaged = structuredClone(load(`reports/${name}`)); delete damaged.preparedCases.classification.expectedEvidence;
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required property case evidence/);
});


test('Grade4 geological impacts cannot omit environmental or intermediate material stages', () => {
  const name = 'ontario-grade4-geological-material-impact-design-2026-11-11.json';
  for (const stage of ['extraction', 'refining', 'manufacturing', 'recycling', 'disposal']) {
    const damaged = structuredClone(load(`reports/${name}`));
    damaged.preparedCases['aluminium-life'].lifecycleStages = damaged.preparedCases['aluminium-life'].lifecycleStages.filter(value => value !== stage);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing actual material lifecycle stage/);
  }
  const damaged = structuredClone(load(`reports/${name}`)); delete damaged.preparedCases['geological-processes'].expectedEvidence;
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required property case evidence/);
});


test('Grade4 integrated habitat and geology tasks retain real duty bindings rather than just child links', () => {
  const earth = 'ontario-grade4-mineral-classification-knowledge-design-2026-11-11.json';
  for (const ref of ['formation', 'everyday-uses', 'fossils', 'metis-selection']) {
    const damaged = structuredClone(load(`reports/${earth}`));
    damaged.protocols.E2.caseRefs = damaged.protocols.E2.caseRefs.filter(value => value !== ref);
    assert.throws(() => check(ledger.expectations, contexts, name => name === earth ? damaged : load(`reports/${name}`)), /Missing required scientific task role/);
  }
  const habitat = 'ontario-grade4-habitat-community-task-design-2026-11-11.json';
  const damaged = structuredClone(load(`reports/${habitat}`)); delete damaged.protocols['human-effects'];
  assert.throws(() => check(ledger.expectations, contexts, name => name === habitat ? damaged : load(`reports/${name}`)), /Missing source-bound task protocol|Missing required integrated child task/);
  const promoted = structuredClone(ledger.expectations);
  const row = promoted.find(value => value.code === 'ON-SCI-2022-G4-B2'); row.disposition = 'Full'; row.remainingConditions = [];
  assert.throws(() => check(promoted), /Unresolved Full protocol condition/);
});


test('Grade4 local applicability cannot hide behind a retained historical Full label', () => {
  const row = ledger.expectations.find(value => value.code === 'ON-SCI-2022-G4-B2.1');
  assert.equal(row.historicalDisposition, 'Full');
  assert.ok(row.dossier && row.protocolReference, 'Missing reviewed local habitat duty');
  const report = load(`reports/${row.dossier}`);
  assert.ok(report.protocols[row.protocolReference.slice('/protocols/'.length)].remainingConditions.length, 'Missing unbound local applicability condition');
  const promoted = structuredClone(ledger.expectations);
  const altered = promoted.find(value => value.code === row.code); altered.disposition = 'Full'; altered.remainingConditions = [];
  assert.throws(() => check(promoted), /Unresolved Full protocol condition/);
  const missing = structuredClone(report); delete missing.protocols[row.protocolReference.slice('/protocols/'.length)];
  assert.throws(() => check(ledger.expectations, contexts, name => name === row.dossier ? missing : load(`reports/${name}`)), /Missing source-bound task protocol/);
});

test('Grade4 habitat transfer cannot ask for missing wetland or dry-grassland examples', () => {
  const name = 'ontario-grade4-habitat-community-task-design-2026-11-11.json';
  for (const [protocol, ref] of [['community-needs', 'wetland-model'], ['finite-support', 'wetland-model'], ['finite-support', 'dry-grassland-model']]) {
    const damaged = structuredClone(load(`reports/${name}`));
    damaged.protocols[protocol].caseRefs = damaged.protocols[protocol].caseRefs.filter(value => value !== ref);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing supplied contrasting transfer case/);
  }
  for (const field of ['givenFacts', 'changedCase']) {
    const damaged = structuredClone(load(`reports/${name}`)); delete damaged.preparedCases['dry-grassland-model'][field];
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing supplied transfer (?:facts|evidence)/);
  }
  const damaged = structuredClone(load(`reports/${name}`)); damaged.resources['original-transfer-models'].file = 'ontario-grade4-light-sound-properties-design-2026-11-11.json';
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Wrong original case-bank file/);
});
