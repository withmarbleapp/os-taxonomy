import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url)));
const ledger = load('reports/ontario-grade5-cde-current-ledger-2026-11-11.json');
const contexts = load('data/curriculum-alignments.json').alignments;
const slug = 'the-ontario-curriculum-science-and-technology-20';
const source = load('data/curriculum-standards.json').curricula.find(row => row.slug === slug);
const selected = source.topics.filter(row => /^ON-SCI-2022-G5-[CDE]\d/.test(row.code)).map(row => row.code).sort();
function pointer(value, path) {
  assert.ok(path?.startsWith('/'), 'Missing protocol reference');
  for (const part of path.split('/').slice(1)) value = value?.[part];
  assert.ok(value && typeof value === 'object' && Object.keys(value).length, 'Missing protocol target');
  return value;
}
function check(rows, associations, readReport = name => load(`reports/${name}`)) {
  assert.deepEqual(rows.map(row => row.code).sort(), selected, 'CDE source universe differs');
  for (const row of rows.filter(row => row.dossier)) {
    const report = readReport(row.dossier);
    const protocol = pointer(report, row.protocolReference);
    assert.ok(protocol.codes.includes(row.code), 'Source protocol mismatch');
    assert.deepEqual([...protocol.contributorIds].sort(), [...row.contributingTopicIds].sort(), 'Task contributor mismatch');
    const actual = new Set(associations.filter(context => context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart === 10 && context.ageRangeEnd === 11 && context.standards.includes(`${slug}:${row.code}`)).map(context => context.topicId));
    assert.deepEqual([...actual].sort(), [...row.contributingTopicIds].sort(), 'Actual context contributor mismatch');
    for (const ref of protocol.caseRefs ?? []) {
      const target = report.preparedCases?.[ref];
      assert.ok(target && Object.keys(target).length, 'Missing actual case packet');
      for (const binding of target.dossierRefs ?? []) pointer(readReport(binding.report), binding.pointer);
      for (const field of protocol.requiredCaseFields ?? []) assert.ok(typeof target[field] === 'string' && target[field].trim(), 'Missing prepared task duty');
      for (const sourceRef of target.sourceRefs ?? []) assert.ok(report.resources?.[sourceRef]?.url, 'Missing case source');
    }
    assert.ok(protocol.caseRefs?.length > 0, 'Missing prepared cases');
    if (['ON-SCI-2022-G5-D1', 'ON-SCI-2022-G5-D1.1', 'ON-SCI-2022-G5-D1.2'].includes(row.code)) {
      const cases = protocol.caseRefs.map(ref => report.preparedCases[ref]);
      if (row.code !== 'ON-SCI-2022-G5-D1.2') {
        for (const kind of ['natural-effects', 'built-effects']) assert.ok(cases.some(value => value.caseKind === kind), 'Missing natural/built structural effects');
        for (const value of cases.filter(value => value.caseKind.endsWith('-effects'))) {
          for (const field of ['forceAndEffect', 'society', 'environment', 'method', 'limit']) assert.ok(value[field]?.trim(), 'Missing structural consequence or mitigation');
        }
      }
      if (row.code !== 'ON-SCI-2022-G5-D1.1') {
        for (const setting of ['urban', 'rural', 'remote']) assert.ok(cases.some(value => value.communitySetting === setting), 'Missing community setting');
        for (const value of cases.filter(value => value.caseKind === 'method-setting')) {
          for (const field of ['forceAndEffect', 'method', 'suitability', 'constraint']) assert.ok(value[field]?.trim(), 'Missing method-setting justification');
        }
      }
    }
    if (['ON-SCI-2022-G5-E2.2', 'ON-SCI-2022-G5-E2.4'].includes(row.code)) {
      for (const ref of ['bounded-total', 'actual-safe-observation', 'device-and-brakes', 'perpetual-useful-machine']) {
        assert.ok(protocol.caseRefs.includes(ref), 'Missing whole conservation/dissipation case');
      }
    }
    if (row.code === 'ON-SCI-2022-G5-D2.4') {
      for (const group of ['plant', 'animal']) {
        assert.ok(protocol.caseRefs.filter(ref => report.preparedCases[ref].organismGroup === group).length >= 2, 'Missing varied plant/animal protection');
      }
    }
    if (row.code === 'ON-SCI-2022-G5-E1.3') {
      const groups = protocol.caseRefs.map(ref => report.preparedCases[ref].caseGroup);
      assert.deepEqual([...new Set(groups)].sort(), ['first-nation', 'inuit', 'metis'], 'Missing required community case');
    }
    if (row.code === 'ON-SCI-2022-G5-D2.1') {
      const roles = protocol.caseRefs.map(ref => report.preparedCases[ref].modelRole);
      assert.deepEqual([...new Set(roles)].sort(), ['combined-bending', 'compression', 'tension'], 'Missing internal-force witness');
    }
    if (row.code === 'ON-SCI-2022-G5-D2.5') {
      const mechanisms = protocol.caseRefs.map(ref => report.preparedCases[ref].protectionMechanism);
      assert.deepEqual([...new Set(mechanisms)].sort(), ['deformation', 'restraint'], 'Missing protective mechanism case');
    }
    if (row.code === 'ON-SCI-2022-G5-C2') {
      const areas = protocol.caseRefs.map(ref => report.preparedCases[ref].area);
      assert.deepEqual([...new Set(areas)].sort(), ['chemical', 'physical', 'properties', 'state'], 'Missing integrated matter area');
    }
    if (row.code === 'ON-SCI-2022-G5-C2.7') {
      const actualPhases = new Set(protocol.caseRefs.map(ref => report.preparedCases[ref].phase));
      assert.deepEqual([...actualPhases].sort(), ['gas', 'liquid', 'solid'], 'Missing required state application');
    }
    if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, [], 'Unresolved Full condition');
  }
}
test('Grade 5 CDE fresh task evidence binds source universe, actual contributors and prepared cases', () => check(ledger.expectations, contexts));
test('Grade 5 CDE detects a lost source association and a broken protocol reference', () => {
  const reviewed = ledger.expectations.find(row => row.dossier);
  const missing = structuredClone(contexts);
  for (const context of missing) context.standards = context.standards.filter(key => key !== `${slug}:${reviewed.code}`);
  assert.throws(() => check(ledger.expectations, missing), /Actual context contributor mismatch/);
  const damaged = structuredClone(ledger.expectations);
  damaged.find(row => row.code === reviewed.code).protocolReference = '/absent';
  assert.throws(() => check(damaged, contexts), /Missing protocol target/);
});
test('Grade 5 CDE rejects a missing concrete gas or freezing case', () => {
  for (const [name, caseId] of [['ontario-grade5-matter-criterion-design-2026-11-11.json', 'gas'], ['ontario-grade5-thermal-state-change-design-2026-11-11.json', 'freezing']]) {
    const damaged = structuredClone(load(`reports/${name}`));
    delete damaged.preparedCases[caseId];
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing actual case packet/);
  }
});


test('Grade 5 C2.7 cannot omit all liquid or gas applications while retaining Full', () => {
  const name = 'ontario-grade5-material-property-applications-design-2026-11-11.json';
  for (const phase of ['liquid', 'gas']) {
    const damaged = structuredClone(load(`reports/${name}`));
    damaged.protocol.caseRefs = damaged.protocol.caseRefs.filter(ref => damaged.preparedCases[ref].phase !== phase);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required state application/);
  }
});

test('Grade 5 overall matter cannot lose a required area or a cross-dossier target', () => {
  const name = 'ontario-grade5-integrated-matter-design-2026-11-11.json';
  const original = load(`reports/${name}`);
  for (const area of ['chemical', 'physical', 'properties', 'state']) {
    const damaged = structuredClone(original);
    damaged.protocol.caseRefs = damaged.protocol.caseRefs.filter(ref => damaged.preparedCases[ref].area !== area);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing integrated matter area/);
  }
  const damaged = structuredClone(original);
  damaged.preparedCases.properties.dossierRefs[0].pointer = '/missing';
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing protocol target/);
});

test('Grade 5 manufacturing task preserves people, environment and both mitigation actors', () => {
  const name = 'ontario-grade5-manufacturing-impacts-design-2026-11-11.json';
  for (const field of ['society', 'environment', 'societyAction', 'individualAction']) {
    const damaged = structuredClone(load(`reports/${name}`));
    delete damaged.preparedCases.paper[field];
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing prepared task duty/);
  }
  const damaged = structuredClone(load(`reports/${name}`));
  delete damaged.resources['paper-process'];
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing case source/);
});

test('Grade 5 protective equipment needs both actual mechanisms and limits', () => {
  const name = 'ontario-grade5-protective-equipment-design-2026-11-11.json';
  for (const field of ['mechanism', 'limit']) {
    const damaged = structuredClone(load(`reports/${name}`));
    delete damaged.preparedCases.helmet[field];
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing prepared task duty/);
  }
  const missing = structuredClone(load(`reports/${name}`));
  missing.protocol.caseRefs = ['helmet'];
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? missing : load(`reports/${report}`)), /Missing protective mechanism case/);

});

test('Grade 5 internal-force design retains the combined bending witness', () => {
  const name = 'ontario-grade5-internal-structural-forces-review-2026-11-11.json';
  const damaged = structuredClone(load(`reports/${name}`));
  damaged.protocol.caseRefs = damaged.protocol.caseRefs.filter(ref => damaged.preparedCases[ref].modelRole !== 'combined-bending');
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing internal-force witness/);
});

test('Grade 5 conservation preserves every community case and the knowledge-to-action mechanism', () => {
  const name = 'ontario-grade5-community-conservation-design-2026-11-11.json';
  for (const group of ['first-nation', 'metis', 'inuit']) {
    const damaged = structuredClone(load(`reports/${name}`));
    damaged.protocol.caseRefs = damaged.protocol.caseRefs.filter(ref => damaged.preparedCases[ref].caseGroup !== group);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing required community case/);
  }
  for (const field of ['knowledge', 'action', 'conservationReasoning', 'evidenceLimit']) {
    const damaged = structuredClone(load(`reports/${name}`));
    delete damaged.preparedCases.metis[field];
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing prepared task duty/);
  }
});

test('Grade 5 biological protection preserves varied plants and animals with actual force mechanisms', () => {
  const name = 'ontario-grade5-biological-force-protection-design-2026-11-11.json';
  for (const group of ['plant', 'animal']) {
    const damaged = structuredClone(load(`reports/${name}`));
    const removed = damaged.protocol.caseRefs.find(ref => damaged.preparedCases[ref].organismGroup === group);
    damaged.protocol.caseRefs = damaged.protocol.caseRefs.filter(ref => ref !== removed);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing varied plant\/animal protection/);
  }
  for (const field of ['harmfulForce', 'mechanism', 'limit']) {
    const damaged = structuredClone(load(`reports/${name}`));
    delete damaged.preparedCases.turtle[field];
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing prepared task duty/);
  }
});

test('Grade 5 energy cannot lose the perpetual-useful-machine or external-boundary case', () => {
  const name = 'ontario-grade5-energy-conservation-design-2026-11-11.json';
  for (const ref of ['perpetual-useful-machine', 'bounded-total']) {
    const damaged = structuredClone(load(`reports/${name}`));
    for (const protocol of Object.values(damaged.protocols)) protocol.caseRefs = protocol.caseRefs.filter(id => id !== ref);
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing whole conservation\/dissipation case/);
  }
});

test('Grade 5 hazard analysis cannot lose natural effects or remote method justification', () => {
  const name = 'ontario-grade5-structural-hazard-methods-design-2026-11-11.json';
  const missingNatural = structuredClone(load(`reports/${name}`));
  for (const protocol of Object.values(missingNatural.protocols)) protocol.caseRefs = protocol.caseRefs.filter(ref => missingNatural.preparedCases[ref].caseKind !== 'natural-effects');
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? missingNatural : load(`reports/${report}`)), /Missing natural\/built structural effects/);
  for (const field of ['suitability', 'constraint']) {
    const damaged = structuredClone(load(`reports/${name}`));
    delete damaged.preparedCases['remote-method'][field];
    assert.throws(() => check(ledger.expectations, contexts, report => report === name ? damaged : load(`reports/${report}`)), /Missing prepared task duty|Missing method-setting justification/);
  }
  const missingRemote = structuredClone(load(`reports/${name}`));
  for (const protocol of Object.values(missingRemote.protocols)) protocol.caseRefs = protocol.caseRefs.filter(ref => missingRemote.preparedCases[ref].communitySetting !== 'remote');
  assert.throws(() => check(ledger.expectations, contexts, report => report === name ? missingRemote : load(`reports/${report}`)), /Missing community setting/);
});
