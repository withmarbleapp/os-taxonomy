import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const load = p => JSON.parse(read(p));
const report = load('reports/india-eleven-art-form-configuration-current-review-2026-11-12.json');

function check(r = report, readResource = read) {
  const priorFiles = ['ncert-arts-syllabus-alignment-2026-11-10.json', 'ncert-arts-alignment-2026-11-10.json'];
  const prior = priorFiles.flatMap(file => load(`reports/${file}`).records
    .filter(row => row.disposition === 'ConditionalArtFormBinding')
    .map(row => ({...row, file})));
  assert.equal(prior.length, 11);
  assert.deepEqual(r.records.map(row => row.key), prior.map(row => row.key));
  assert.equal(r.scope.sourceFullNumeratorChange, 0);
  assert.equal(r.scope.canonicalChanges, 0);
  assert.equal(r.scope.historicalDispositionsUnchanged, true);
  const topics = new Set(load('data/topics.json').topics.map(row => row.id));
  for (const row of r.records) {
    const old = prior.find(x => x.key === row.key);
    assert.equal(row.disposition, old.disposition);
    assert.equal(row.historicalReport, old.file);
    assert.deepEqual(row.sourcePdfPages, old.sourcePdfPages);
    assert.deepEqual(row.conditionalCandidateTopicIds, old.conditionalContributions.map(x => x.topicId));
    assert.equal(row.actualSchoolConfigurationComplete, false);
    assert.equal(row.actualLearnerWorkComplete, false);
    assert.equal(row.wholeTopicAwardFromSourceSuccess, false);
    for (const id of row.conditionalCandidateTopicIds) assert.ok(topics.has(id), `Missing existing candidate ${id}`);
    const text = readResource(`reports/${row.resource}`);
    const headings = text.split(/\r?\n/).filter(line => /^#{1,6} /.test(line)).map(line => line.replace(/^#{1,6} /, ''));
    for (const heading of row.protocolHeadings) assert.ok(headings.includes(heading), `Missing task ${heading}`);
    assert.ok(row.protocolHeadings.length > 0);
    const protocols = load(`reports/${row.priorProtocolFile}`).protocols;
    const ids = Array.isArray(protocols) ? protocols.map(p => p.id) : Object.keys(protocols);
    assert.deepEqual(row.priorProtocolIds, old.assessmentProtocols);
    for (const id of row.priorProtocolIds) assert.ok(ids.includes(id), `Missing historical protocol ${id}`);
    if (row.key.includes('ART-LS2') && row.recordKind === 'curricularGoal') {
      assert.ok(row.protocolHeadings.includes('Preparatory: independent integrated goal'));
    }
    if (old.taskPanel === 'visit-observation-artwork') {
      assert.ok(row.protocolHeadings.includes('Foundation: actual visit and creative response'));
    }
  }
  for (const key of ['actualSelectedVisualAndPerformingFormsRequired', 'varietyRequiredForIntegratedBaseline',
    'actualOwnProductionAndPresentationRequired', 'actualProcessesNotNamesOnly', 'independentIntegratedGoalRequired',
    'actualVisitRequiredForVisitPanel', 'virtualResourceCheckedBeforeDelivery', 'actualSurroundingWorkRequiredForResponse',
    'actualPeerResponseRequired', 'unfulfilledDeliveryMustRemainExplicit']) assert.equal(r.contracts[key], true, key);
  for (const key of ['allAlternativeFormsUniversallyRequired', 'LS2IsTaxonomyDifficultyLevel', 'LS1AllFormsCertified',
    'competencyCountCertifiesGoal', 'fictionalVisitCountsAsObservation', 'museumWebsiteVisitClaimedByThisReport',
    'forcedPositiveFeelingRequired', 'languageMasteryInferredFromArt', 'sourceSuccessAwardsWholeTopic']) assert.equal(r.contracts[key], false, key);
}

test('eleven art conditions retain exact source identities, conditional scope and resolvable concrete tasks', () => check());
test('missing tasks, fabricated observation and parent rollup cannot qualify the art portfolio', () => {
  const missing = structuredClone(report);
  missing.records[0].protocolHeadings = ['Removed task'];
  assert.throws(() => check(missing));
  const omitted = structuredClone(report);
  omitted.records.pop();
  assert.throws(() => check(omitted));
  for (const key of ['fictionalVisitCountsAsObservation', 'competencyCountCertifiesGoal', 'LS1AllFormsCertified']) {
    const changed = structuredClone(report);
    changed.contracts[key] = true;
    assert.throws(() => check(changed));
  }
  const lostPerforming = structuredClone(report);
  lostPerforming.contracts.actualSelectedVisualAndPerformingFormsRequired = false;
  assert.throws(() => check(lostPerforming));
});
