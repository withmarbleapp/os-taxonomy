import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const text = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const load = path => JSON.parse(text(path));
const resource = load('reports/ontario-grade2-machine-recognition-function-task-design-2026-11-12.json');
const ledger = load('reports/ontario-grade2-machine-recognition-function-current-ledger-2026-11-12.json');
const topics = load('data/topics.json').topics;
const contexts = load('data/curriculum-alignments.json').alignments;
const research = load('data/teaching-research.json').records;
const edges = load('data/dependencies.json').dependencies;
const id = 'mt_vjMAN6sb7z';
const categories = ['lever', 'inclined plane', 'wedge', 'pulley', 'wheel and axle', 'screw'];
function check(tasks = resource, rows = ledger) {
  const card = topics.find(r => r.id === id);
  assert.deepEqual(tasks.newWholeCard, card, 'Complete new claim must match the authored card');
  assert.equal(card.type, 'CONCEPTUAL'); assert.equal(card.evidence.length, 4);
  assert.deepEqual(tasks.categorySet, categories, 'All six arrangements remain one coherent repertoire');
  assert.deepEqual(tasks.claimEvidenceRegistry, ['six-names-and-working-features', 'all-six-everyday-functions', 'fresh-feature-based-compound-limited-view-transfer', 'fixed-pulley-and-changed-lever-boundaries']);
  assert.deepEqual([card.ageRangeStart, card.ageRangeEnd], [7, 8]);
  const offers = contexts.filter(r => r.topicId === id);
  assert.equal(offers.length, 1, 'Only the reviewed initial context is offered');
  assert.deepEqual([offers[0].country, offers[0].region, offers[0].ageRangeStart, offers[0].ageRangeEnd], ['CA', 'Ontario', 7, 8]);
  assert.deepEqual(tasks.newHardPrerequisites, []);
  assert.equal(edges.filter(r => r.topicId === id).length, 0, 'No invented whole-force or older gear gate');
  const guide = research.find(r => r.topicId === id);
  assert.equal(guide.confidence, 'low'); assert.equal(guide.learn.schemaVersion, 2); assert.equal(guide.assess.method, 'two_tier');
  assert.equal(guide.learn.activities.length, 3);
  assert.ok(guide.assess.responseLevels.full.includes('all six'));
  const svg = text('reports/assets/ontario-grade2-machines/independent-six-arrangements.svg');
  for (const letter of 'ABCDEF') assert.ok(svg.includes(`>${letter}</text>`), 'Fresh neutral assessment card missing');
  assert.deepEqual(Object.values(tasks.freshAssessmentTeacherKey), categories);
  for (const path of tasks.studyAssets) assert.ok(text(path).length > 100, 'Actual teaching/assessment asset must exist');
  for (const row of rows.records) {
    assert.equal(row.disposition, 'Full'); assert.equal(row.historicalDisposition, 'Partial');
    const p = row.protocolReference.split('/').slice(1).reduce((v, k) => v?.[k], tasks);
    assert.equal(p?.requiresIndependentPerformance, true, 'Independent protocol must resolve');
    assert.equal(p.wholeTopicAwardFromSourceTaskAlone, false);
  }
  assert.equal(tasks.sourceProtocol.D2.independentOverallNotChildCount, true);
  assert.deepEqual(tasks.sourceProtocol.D2.requiredEvidence, ['movement-and-position', 'two-machine-contributions', 'with-without-comparison', 'fixed-pulley-changed-lever', 'new-use-and-changed-case']);
  for (const c of ['D2.3', 'D2.4']) assert.equal(tasks.sourceProtocol[c].allSixRequired, true);
  assert.equal(rows.historicalD2_1D2_2NotRecertified, true);
  for (const pair of tasks.newComponentPairs) {
    assert.equal(pair.role, 'component');
    assert.ok(contexts.some(c => c.topicId === pair.topicId && c.country === 'CA' && c.region === 'Ontario' && c.ageRangeStart === 7 && c.ageRangeEnd === 8 && c.standards.includes(`the-ontario-curriculum-science-and-technology-20:ON-SCI-2022-G2-${pair.code}`)), 'Exact component context missing');
  }
}
test('one complete six-arrangement claim binds fresh resources and independent source tasks', () => check());
test('missing categories, child-count overalls and source-only whole awards cannot pass', () => {
  const missing = structuredClone(resource); missing.categorySet.pop(); assert.throws(() => check(missing), /six arrangements/);
  const parent = structuredClone(resource); parent.sourceProtocol.D2.independentOverallNotChildCount = false; assert.throws(() => check(parent));
  const award = structuredClone(resource); award.sourceProtocol['D2.3'].wholeTopicAwardFromSourceTaskAlone = true; assert.throws(() => check(award));
});
