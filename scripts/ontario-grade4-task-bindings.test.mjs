import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = name => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const ledger = read('reports/ontario-grade4-social-current-ledger-2026-11-10.json');
const contexts = read('data/curriculum-alignments.json').alignments;
const prefix = 'the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G4-SS-';
const catalogue = read('data/curriculum-standards.json').curricula.find(row => row.slug === 'the-ontario-curriculum-social-studies-history-an');
const codes = catalogue.topics.filter(row => row.key.startsWith(prefix)).map(row => row.key.slice(prefix.length));
const dossiers = Object.fromEntries(ledger.expectations.filter(row => row.dossier).map(row => [row.dossier, read(`reports/${row.dossier}`)]));
const sorted = values => [...values].sort();
function checkBindings(rows, associations) {
  assert.deepEqual(sorted(rows.map(row => row.code)), sorted(codes), 'Catalogue/ledger universe differs');
  for (const row of rows) {
    const linked = associations.filter(context => context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart <= 9 && context.ageRangeEnd >= 10 && context.standards.includes(prefix + row.code)).map(context => context.topicId);
    assert.deepEqual(sorted(row.contributingTopicIds), sorted(new Set(linked)), `Scoped contributors differ for ${row.code}`);
    if (!['Full', 'Partial'].includes(row.disposition)) continue;
    assert.ok(row.contributingTopicIds.length, `Missing contributors for ${row.code}`);
    let protocol = dossiers[row.dossier];
    assert.ok(protocol && row.protocolReference?.startsWith('/'), `Missing dossier/reference for ${row.code}`);
    for (const segment of row.protocolReference.split('/').slice(1)) protocol = protocol?.[segment.replaceAll('~1', '/').replaceAll('~0', '~')];
    assert.ok(protocol && typeof protocol === 'object' && Object.keys(protocol).length, `Missing protocol for ${row.code}`);
    if (Array.isArray(protocol.codes)) assert.ok(protocol.codes.includes(row.code), `Wrong protocol code for ${row.code}`);
    if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, [], `Unresolved Full condition for ${row.code}`);
    if (row.disposition === 'Full') for (const required of protocol.requiresSpecificDispositions ?? []) assert.equal(rows.find(candidate => candidate.code === required)?.disposition, 'Full', `Unresolved integrated specific ${required}`);
  }
}
test('Grade4 current dispositions bind complete scoped contributors and actual protocols', () => checkBindings(ledger.expectations, contexts));
test('Grade4 binding catches missing links and protocols without freezing future reviewed additions', () => {
  const code = ledger.expectations.find(row => row.disposition === 'Full').code;
  const missing = structuredClone(contexts);
  for (const row of missing) row.standards = row.standards.filter(key => key !== prefix + code);
  assert.throws(() => checkBindings(ledger.expectations, missing), /Scoped contributors differ/);
  const broken = structuredClone(ledger.expectations);
  broken.find(row => row.code === code).protocolReference = '/absent';
  assert.throws(() => checkBindings(broken, contexts), /Missing protocol/);
  const futureRows = structuredClone(ledger.expectations);
  futureRows.find(row => row.code === code).contributingTopicIds.push('future-reviewed-topic');
  checkBindings(futureRows, [...contexts, {topicId: 'future-reviewed-topic', country: 'CA', region: 'Ontario', ageRangeStart: 9, ageRangeEnd: 10, standards: [prefix + code]}]);
});
test('Grade4 peoples packet covers each named political division with attributed location examples', () => {
  const report = read('reports/ontario-grade4-peoples-location-review-2026-11-10.json');
  const political = read('reports/ontario-canadian-political-geography-claim-2026-11-10.json');
  const required = {...political.verifiedKnowledge.provinces, ...political.verifiedKnowledge.territories};
  assert.deepEqual(sorted(report.regionalResourceRows.map(row => row.region)), sorted(Object.keys(required)));
  for (const row of report.regionalResourceRows) {
    assert.equal(row.capital, required[row.region]);
    assert.ok(row.location && row.qualifiedDescription && row.peoplesExamples.length);
    assert.ok(report.resources.some(source => source.id === row.sourceId));
  }
});

test('Grade4 action assessment retains both industry and citizen evidence roles', () => {
  const report = read('reports/ontario-grade4-industry-environment-review-2026-11-10.json');
  const conditions = report.protocols['actions-and-effectiveness'].performanceConditions;
  for (const actor of ['industry', 'citizens']) assert.ok(conditions.actorsBothRequired.includes(actor));
  for (const level of ['intendedpurpose', 'actualimplementation/output', 'reportedoutcome', 'unknownlongterm/causalextent']) assert.ok(conditions.evidenceLevels.includes(level));
});

function resolveYoungPersonSource(ref) {
  const [document, pointer, extra] = ref.split('#');
  assert.equal(extra, undefined, 'Malformed evidence source reference');
  assert.ok(pointer?.startsWith('/'), 'Missing evidence resource pointer');
  const file = document || 'ontario-grade4-early-own-comparisons-review-2026-11-11.json';
  assert.ok(!file.includes('/') && file.endsWith('.json'), 'Invalid evidence report path');
  let target;
  try { target = read(`reports/${file}`); }
  catch { assert.fail('Missing evidence source document'); }
  for (const segment of pointer.split('/').slice(1)) target = target?.[segment.replaceAll('~1', '/').replaceAll('~0', '~')];
  assert.ok(target && typeof target === 'object' && Object.keys(target).length, 'Missing evidence source resource');
  return target;
}
function checkYoungPersonEvidenceBoundaries(protocol) {
  const cases = new Map(protocol.caseEvidence.map(row => [row.id, row]));
  for (const row of cases.values()) {
    assert.ok(row.sourceRef && row.period && row.supportedScope.length);
    resolveYoungPersonSource(row.sourceRef);
    const criterion = protocol.assessment.successCriteria.find(item => item.caseId === row.id);
    assert.ok(criterion?.requiresEvidenceBasisQualification && criterion.requiredOperation, `Missing evidence qualification for ${row.id}`);
    const probes = protocol.assessment.nearMissProbes.filter(item => item.caseId === row.id);
    assert.ok(probes.length, `Missing evidence near miss for ${row.id}`);
    for (const probe of probes) {
      assert.ok(row.unsupportedInferenceTypes.includes(probe.inferenceType), `Unbound near-miss inference for ${row.id}`);
      assert.equal(probe.expectedVerdict, 'unsupported', `Unsupported inference accepted for ${row.id}`);
    }
  }
  for (const probe of protocol.assessment.nearMissProbes) assert.ok(cases.has(probe.caseId), 'Near miss references absent evidence');
}
test('Grade4 young-person comparisons retain source-basis qualification and reject unsupported routine claims', () => {
  const protocol = read('reports/ontario-grade4-early-own-comparisons-review-2026-11-11.json').protocols['young-person-then-own'];
  checkYoungPersonEvidenceBoundaries(protocol);
  const missing = structuredClone(protocol);
  missing.assessment.successCriteria = [];
  assert.throws(() => checkYoungPersonEvidenceBoundaries(missing), /Missing evidence qualification/);
  const falsePositive = structuredClone(protocol);
  falsePositive.assessment.nearMissProbes[0].expectedVerdict = 'supported';
  assert.throws(() => checkYoungPersonEvidenceBoundaries(falsePositive), /Unsupported inference accepted/);
  const unbound = structuredClone(protocol);
  unbound.assessment.nearMissProbes[0].inferenceType = 'unreviewed-inference';
  assert.throws(() => checkYoungPersonEvidenceBoundaries(unbound), /Unbound near-miss inference/);
  const absentResource = structuredClone(protocol);
  absentResource.caseEvidence[0].sourceRef = 'ontario-grade4-early-inquiry-map-review-2026-11-10.json#/resources/not-a-resource';
  assert.throws(() => checkYoungPersonEvidenceBoundaries(absentResource), /Missing evidence source resource/);
  const absentReport = structuredClone(protocol);
  absentReport.caseEvidence[0].sourceRef = 'missing-evidence-report.json#/resources/droulers-registry';
  assert.throws(() => checkYoungPersonEvidenceBoundaries(absentReport), /Missing evidence source document/);
  const absentLocalResource = structuredClone(protocol);
  absentLocalResource.caseEvidence[1].sourceRef = '#/newSources/absent';
  assert.throws(() => checkYoungPersonEvidenceBoundaries(absentLocalResource), /Missing evidence source resource/);
});

function checkConflictPeriodReadiness(row, protocol) {
  if (row.disposition !== 'Full') return;
  if (protocol.requiresEarlyPeriodInuitConflictResolutionSupport) {
    assert.ok(protocol.sourceCases.some(source => source.culturalCase === 'Inuit' && source.supportsEarlyPeriodConflictResolution && source.source && source.basis), 'Unresolved early-period Inuit conflict-resolution support');
  }
}
test('Grade4 conflict-resolution source condition cannot be relabelled Full without period-fit support', () => {
  const row = ledger.expectations.find(item => item.code === 'A3.10');
  const protocol = read('reports/ontario-grade4-early-integrated-review-2026-11-11.json').protocols['conflict-and-cooperation-attempts'];
  checkConflictPeriodReadiness(row, protocol);
  if (!protocol.sourceCases.some(source => source.culturalCase === 'Inuit' && source.supportsEarlyPeriodConflictResolution)) {
    assert.notEqual(row.disposition, 'Full');
    assert.ok(row.remainingConditions.length);
    assert.throws(() => checkConflictPeriodReadiness({...row, disposition: 'Full', remainingConditions: []}, protocol), /Unresolved early-period/);
  }
});
