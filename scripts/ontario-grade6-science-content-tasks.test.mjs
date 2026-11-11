import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url)));
const ledger = load('reports/ontario-grade6-science-content-current-ledger-2026-11-11.json');
const programmeName = 'ontario-grade6-electrical-generation-circuit-use-design-2026-11-11.json';
const programme = load(`reports/${programmeName}`);
const flightName = 'ontario-grade6-flight-mechanics-task-design-2026-11-11.json';
const impactName = 'ontario-grade6-flight-impact-task-design-2026-11-11.json';
const programmes = { [programmeName]: programme, [flightName]: load(`reports/${flightName}`), [impactName]: load(`reports/${impactName}`) };
Object.assign(programmes, {
  'ontario-grade6-biodiversity-task-design-2026-11-11.json': load('reports/ontario-grade6-biodiversity-task-design-2026-11-11.json'),
  'ontario-grade6-electricity-impacts-principles-design-2026-11-11.json': load('reports/ontario-grade6-electricity-impacts-principles-design-2026-11-11.json'),
  'ontario-grade6-space-source-task-design-2026-11-11.json': load('reports/ontario-grade6-space-source-task-design-2026-11-11.json'),
});
const flightClaim = load('reports/ontario-grade6-flight-model-claim-review-2026-11-11.json');
const flightTopic = load('data/topics.json').topics.find(row => row.id === flightClaim.topicId);
const flightGuide = load('data/teaching-research.json').records.find(row => row.topicId === flightClaim.topicId);
const contexts = load('data/curriculum-alignments.json').alignments;
const slug = 'the-ontario-curriculum-science-and-technology-20';
const source = load('data/curriculum-standards.json').curricula.find(row => row.slug === slug);
const selected = source.topics.filter(row => /^ON-SCI-2022-G6-[BCDE]\d/.test(row.code)).map(row => row.code).sort();
const roles = {
  'ON-SCI-2022-G6-B2.2': ["within-among-habitat-diversity"],
  'ON-SCI-2022-G6-B2.4': ["within-community-resilience", "among-community-resilience"],
  'ON-SCI-2022-G6-B2.5': ["within-between-environment-relationships"],
  'ON-SCI-2022-G6-B2.8': ["agriculture-indigenous-world"],
  'ON-SCI-2022-G6-B1': ["importance-protection-judgment"],
  'ON-SCI-2022-G6-B2': ["within-among-habitat-diversity", "within-community-resilience", "among-community-resilience", "agriculture-indigenous-world"],
  'ON-SCI-2022-G6-C1.1': ["canadian-short-long-generation-impacts", "first-nations-generation-impact", "metis-generation-impact", "inuit-generation-impact"],
  'ON-SCI-2022-G6-C1.2': ["personal-optional-electricity-choice", "school-use-and-communicated-advocacy"],
  'ON-SCI-2022-G6-C1': ["canadian-short-long-generation-impacts", "first-nations-generation-impact", "metis-generation-impact", "inuit-generation-impact", "school-use-and-communicated-advocacy"],
  'ON-SCI-2022-G6-C2': ["integrated-principles-transformations"],
  'ON-SCI-2022-G6-E1.2': ["environmental-change-climate-role"],
  'ON-SCI-2022-G6-E1.3': ["social-environmental-perspectives"],
  'ON-SCI-2022-G6-E1': ["human-society-environment-evaluation", "physiological-conditions-accommodations", "social-emotional-space-needs", "social-environmental-perspectives"],
  'ON-SCI-2022-G6-E2': ["solar-system-motion-phenomena", "exploration-technology-role"],

  'ON-SCI-2022-G6-C2.4': ['mechanical-to-electrical', 'light-to-electrical', 'thermal-route-electrical'],
  'ON-SCI-2022-G6-C2.7': ['series-parallel-uses'],
  'ON-SCI-2022-G6-D1': ['environmental-impact-and-mitigation'],
  'ON-SCI-2022-G6-D1.1': ['canadian-societal-access', 'international-societal-access', 'environmental-impact-and-mitigation'],
  'ON-SCI-2022-G6-D2': ['air-properties-application', 'four-force-relationships', 'machine-organism-control', 'four-force-changes', 'varied-organism-flight-functions', 'unpowered-glider-transfer', 'aerodynamic-buoyancy-contrast'],
  'ON-SCI-2022-G6-D2.1': ['air-properties-application'],
  'ON-SCI-2022-G6-D2.2': ['four-force-relationships'],
  'ON-SCI-2022-G6-D2.3': ['machine-organism-control'],
  'ON-SCI-2022-G6-D2.4': ['four-force-changes'],
  'ON-SCI-2022-G6-D2.5': ['varied-organism-flight-functions'],
};
// Explicit review registry. Never infer reviewed membership from whether the
// current ledger still has a dossier field: deleting that field must fail closed.
const reviewedFreshCodes = Object.keys(roles).sort();
const reviewedHistoricalCodes = []; // B2.6's definition reminder is not a fresh closure.
function check(rows = ledger.expectations, electricalReport = programme, associations = contexts, reports = programmes) {
  assert.deepEqual(rows.map(row => row.code).sort(), selected, 'Missing Grade6 content record');
  assert.deepEqual(rows.filter(row => row.disposition === 'Full' && row.historicalDisposition === 'Partial').map(row => row.code).sort(), reviewedFreshCodes, 'Reviewed Grade6 closure registry mismatch');
  for (const row of rows) {
    assert.equal(row.key, `${slug}:${row.code}`, 'Grade6 source identity mismatch');
    if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, [], 'Unresolved Full ledger condition');
    if (!reviewedFreshCodes.includes(row.code) && !reviewedHistoricalCodes.includes(row.code)) continue;
    const report = row.dossier === programmeName ? electricalReport : reports[row.dossier];
    assert.ok(report, 'Missing actual Grade6 programme binding');
    assert.ok(row.protocolReference?.startsWith('/protocols/'), 'Missing actual Grade6 protocol binding');
    const protocol = report.protocols?.[row.protocolReference.slice('/protocols/'.length)];
    assert.ok(protocol?.codes?.includes(row.code), 'Missing source-bound Grade6 protocol');
    assert.deepEqual([...protocol.contributorIds].sort(), [...row.contributingTopicIds].sort(), 'Grade6 contributor mismatch');
    for (const id of row.contributingTopicIds) assert.ok(associations.some(context => context.topicId === id && context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart === 11 && context.ageRangeEnd === 12 && context.standards.includes(row.key)), 'Missing actual Grade6 source association');
    assert.deepEqual(protocol.remainingConditions, [], 'Unresolved Full protocol condition');
    if (Object.hasOwn(report, 'remainingConditions')) assert.deepEqual(report.remainingConditions, [], 'Unresolved Full report condition');
    assert.ok(protocol.actions?.length >= 4 && protocol.actions.every(value => typeof value === 'string' && value.trim()), 'Missing Grade6 task actions');
    assert.deepEqual(protocol.requiredCaseFields, ['question', 'expectedEvidence', 'nearMiss', 'changedCase'], 'Missing Grade6 evidence contract');
    assert.ok(roles[row.code], 'Fresh Grade6 closure has no reviewed task role');
    const boundRoles = protocol.caseRefs?.map(ref => report.preparedCases?.[ref]?.role) ?? [];
    for (const role of roles[row.code]) assert.ok(boundRoles.includes(role), 'Missing actual Grade6 task role');
    for (const ref of protocol.caseRefs) {
      const value = report.preparedCases?.[ref];
      assert.ok(value?.sourceSummary?.trim() && value.attributionLimits?.trim() && value.resourceRefs?.length, 'Missing source-bound Grade6 case');
      for (const field of protocol.requiredCaseFields) assert.ok(typeof value[field] === 'string' && value[field].trim(), 'Missing actual Grade6 case evidence');
      for (const resource of value.resourceRefs) assert.ok(report.resources?.[resource]?.url?.startsWith('https://') && report.resources[resource].readScope?.trim(), 'Missing actual Grade6 resource');
    }
  }
}
test('Grade6 content ledger retains complete inventory and source-bound task portfolios', () => {
  check();
  assert.deepEqual(ledger.counts, {
    freshFull: ledger.expectations.filter(row => row.historicalDisposition === 'Partial' && row.disposition === 'Full').length,
    retainedHistoricalFull: ledger.expectations.filter(row => row.historicalDisposition === 'Full' && row.disposition === 'Full').length,
    remainingPartial: ledger.expectations.filter(row => row.disposition === 'Partial').length,
  });
});

function checkPortableFlight(guide = flightGuide) {
  assert.ok(flightTopic && guide, 'Missing actual canonical flight claim or guide');
  assert.equal(flightTopic.name, 'How flight forces work');
  assert.equal(flightTopic.evidence.length, 4);
  assert.equal(guide.confidence, 'low');
  const notes = guide.learn.reviewNotes.join('\n');
  for (const [ref, value] of Object.entries(programmes[flightName].preparedCases)) {
    for (const field of ['question', 'expectedEvidence', 'nearMiss', 'changedCase']) assert.ok(notes.includes(value[field]), `Missing self-contained canonical flight case ${ref}/${field}`);
  }
  for (const field of ['diagnosticPrompt', 'correctAnswer']) {
    assert.match(guide.assess[field], /turn/i, 'Missing mandatory turn assessment');
    assert.match(guide.assess[field], /surface|wing.shape/i, 'Missing mandatory surface assessment');
    assert.match(guide.assess[field], /cargo|mass/i, 'Missing mandatory mass assessment');
    assert.match(guide.assess[field], /angle/i, 'Missing mandatory bounded-angle assessment');
  }
  assert.match(guide.assess.responseLevels.full, /all four mandatory canonical criteria/i, 'Incomplete canonical Full threshold');
  assert.match(guide.assess.responseLevels.full, /turn.*surface.*mass.*angle.*transfer/i, 'Incomplete canonical Full threshold');
  const declared = new Set(guide.sources.map(row => row.claim));
  for (const activity of guide.learn.activities) for (const claim of activity.sourceClaims) assert.ok(declared.has(claim), 'Undeclared flight activity source contribution');
  for (const code of flightClaim.sourceDuties) assert.ok(ledger.expectations.find(row => row.code === code)?.contributingTopicIds.includes(flightClaim.topicId), 'Missing independently reviewed aerodynamic claim');
}
test('portable flight guide carries complete cases and assesses every canonical criterion', () => checkPortableFlight());
test('portable flight content cannot disappear when reports are excluded from publication', () => {
  const guide = structuredClone(flightGuide);
  guide.learn.reviewNotes = guide.learn.reviewNotes.filter(row => !row.includes('Self-contained original case glider-transfer:'));
  assert.throws(() => checkPortableFlight(guide), /Missing self-contained canonical flight case glider-transfer/);
});
test('flight assessment cannot award Full from only the level/thrust/glider subset', () => {
  for (const field of ['diagnosticPrompt', 'correctAnswer']) {
    const guide = structuredClone(flightGuide); guide.assess[field] = 'Explain the straight-level force balance, thrust change and descending glider.';
    assert.throws(() => checkPortableFlight(guide), /Missing mandatory turn assessment/);
  }
  const guide = structuredClone(flightGuide); guide.assess.responseLevels.full = 'Explains the level case and glider.';
  assert.throws(() => checkPortableFlight(guide), /Incomplete canonical Full threshold/);
});
test('Grade6 electrical closures cannot lose an actual programme, protocol or contributor', () => {
  const original = ledger.expectations.find(row => row.code === 'ON-SCI-2022-G6-C2.4');
  for (const field of ['dossier', 'protocolReference']) {
    const rows = structuredClone(ledger.expectations); delete rows.find(row => row.code === original.code)[field];
    assert.throws(() => check(rows), /Missing actual Grade6 (?:programme|protocol) binding/);
  }
  const report = structuredClone(programme); delete report.protocols['C2.4'];
  assert.throws(() => check(ledger.expectations, report), /Missing source-bound Grade6 protocol/);
  const associations = structuredClone(contexts);
  associations.find(row => row.topicId === original.contributingTopicIds[0] && row.ageRangeStart === 11 && row.standards.includes(original.key)).standards = [];
  assert.throws(() => check(ledger.expectations, programme, associations), /Missing actual Grade6 source association/);
});
test('review membership cannot be removed by relabelling a reviewed closure historical', () => {
  const rows = structuredClone(ledger.expectations);
  const row = rows.find(row => row.code === 'ON-SCI-2022-G6-D2.2');
  row.historicalDisposition = 'Full'; delete row.dossier; delete row.protocolReference;
  assert.throws(() => check(rows), /Reviewed Grade6 closure registry mismatch/);
});
test('Grade6 generation needs varied conversions and circuit uses need an actual application case', () => {
  for (const [protocol, ref] of [['C2.4', 'mechanical-generator'], ['C2.4', 'light-cell'], ['C2.4', 'heat-route'], ['C2.7', 'circuit-applications']]) {
    const report = structuredClone(programme); report.protocols[protocol].caseRefs = report.protocols[protocol].caseRefs.filter(value => value !== ref);
    assert.throws(() => check(ledger.expectations, report), /Missing actual Grade6 task role/);
  }
});
test('Grade6 portfolios cannot silently drop actual resources or transfer/near-miss evidence', () => {
  for (const field of ['question', 'expectedEvidence', 'nearMiss', 'changedCase']) {
    const report = structuredClone(programme); delete report.preparedCases['circuit-applications'][field];
    assert.throws(() => check(ledger.expectations, report), /Missing actual Grade6 case evidence/);
  }
  const report = structuredClone(programme); delete report.resources['eia-pv'];
  assert.throws(() => check(ledger.expectations, report), /Missing actual Grade6 resource/);
});
test('Grade6 Full tasks cannot ignore unresolved source conditions in either owner', () => {
  for (const owner of ['report', 'protocol']) {
    const report = structuredClone(programme);
    (owner === 'report' ? report : report.protocols['C2.4']).remainingConditions = ['An actual resource remains unbound.'];
    assert.throws(() => check(ledger.expectations, report), /Unresolved Full (?:report|protocol) condition/);
  }
});

// Explicitly protect the newly reviewed source conjunctions, rather than infer
// review membership from surviving dossier fields or child-code totals.
test('remaining Grade6 portfolios cannot lose a reviewed source conjunction', () => {
  for (const [name, protocol, ref] of [
    ['ontario-grade6-biodiversity-task-design-2026-11-11.json', 'B2.4', 'among-community-resilience'],
    ['ontario-grade6-electricity-impacts-principles-design-2026-11-11.json', 'C1.2', 'personal-optional-use'],
    ['ontario-grade6-electricity-impacts-principles-design-2026-11-11.json', 'C1.1', 'metis-case'],
    ['ontario-grade6-electricity-impacts-principles-design-2026-11-11.json', 'C1.1', 'inuit-case'],
    ['ontario-grade6-space-source-task-design-2026-11-11.json', 'E2', 'solar-structure-and-motion'],
  ]) {
    const reports = structuredClone(programmes);
    reports[name].protocols[protocol].caseRefs = reports[name].protocols[protocol].caseRefs.filter(value => value !== ref);
    assert.throws(() => check(ledger.expectations, programme, contexts, reports), /Missing actual Grade6 task role/);
  }
});
test('remaining Grade6 closures cannot discard binding, transfer or historical identity', () => {
  for (const code of ['B2.2', 'C1.2', 'E1.2']) {
    const rows = structuredClone(ledger.expectations);
    const row = rows.find(value => value.code === `ON-SCI-2022-G6-${code}`);
    delete row.dossier;
    assert.throws(() => check(rows), /Missing actual Grade6 programme binding/);
    row.historicalDisposition = 'Full';
    assert.throws(() => check(rows), /Reviewed Grade6 closure registry mismatch/);
  }
  for (const [name, ref] of [
    ['ontario-grade6-biodiversity-task-design-2026-11-11.json', 'diversity-levels'],
    ['ontario-grade6-electricity-impacts-principles-design-2026-11-11.json', 'responsible-use-school'],
    ['ontario-grade6-space-source-task-design-2026-11-11.json', 'environmental-observation'],
  ]) {
    const reports = structuredClone(programmes); delete reports[name].preparedCases[ref].changedCase;
    assert.throws(() => check(ledger.expectations, programme, contexts, reports), /Missing actual Grade6 case evidence/);
  }
});
test('local action and unresolved compound curation remain explicit Grade6 Partials', () => {
  for (const code of ['ON-SCI-2022-G6-B1.2', 'ON-SCI-2022-G6-E1.1']) {
    const row = ledger.expectations.find(value => value.code === code);
    assert.equal(row.disposition, 'Partial');
    assert.ok(row.remainingConditions.length, 'Missing actual residual source condition');
    const rows = structuredClone(ledger.expectations);
    rows.find(value => value.code === code).disposition = 'Full';
    assert.throws(() => check(rows), /Reviewed Grade6 closure registry mismatch/);
  }
});
