import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const report = read('reports/ontario-hpe-fitness-component-claim-2026-11-11.json');
const topics = read('data/topics.json').topics;
const alignments = read('data/curriculum-alignments.json').alignments;
const guides = read('data/teaching-research.json').records;
const edges = read('data/dependencies.json').dependencies;
const prefix = 'the-ontario-curriculum-health-and-physical-educa:ON-HPE-2019-';
const expected = new Map([['G5-B2.2', [10,11]], ['G6-B2.3', [11,12]], ['G6-B2.4', [11,12]]]);
function checkSourceBindings(rows) {
  const pairs = rows.flatMap(r => r.standards.map(key => ({key, row:r})));
  assert.equal(pairs.length, 3);
  assert.equal(new Set(pairs.map(p => p.key)).size, 3);
  for (const {key,row} of pairs) {
    assert.ok(key.startsWith(prefix));
    const band = expected.get(key.slice(prefix.length));
    assert.ok(band, 'minimal component code must remain one of the reviewed three');
    assert.deepEqual([row.ageRangeStart,row.ageRangeEnd], band);
    assert.equal(row.scope,'jurisdiction');
    assert.equal(row.country,'CA');
    assert.equal(row.region,'Ontario');
  }
}
test('fitness component context identity and exact stage bands remain bounded', () => {
  checkSourceBindings(alignments.filter(r => r.topicId === report.topicId));
});
test('a valid but unreviewed overall code cannot replace a reviewed component', () => {
  const rows = structuredClone(alignments.filter(r => r.topicId === report.topicId));
  rows[0].standards[0] = `${prefix}G5-B2`;
  assert.throws(() => checkSourceBindings(rows), /reviewed three/);
});
test('an early-grade association cannot stand in for later fixed-model scope', () => {
  const rows = structuredClone(alignments.filter(r => r.topicId === report.topicId));
  rows[0].ageRangeStart = 6;
  assert.throws(() => checkSourceBindings(rows));
});
test('guide and graph retain a conceptual model without a new physical or anatomy gate', () => {
  const card = topics.find(t => t.id === report.topicId);
  const guide = guides.find(t => t.topicId === report.topicId);
  assert.equal(card.type,'CONCEPTUAL');
  assert.equal(card.subject,'Physical Education');
  assert.equal(guide.confidence,'low');
  assert.equal(guide.learn.activities.length,3);
  assert.ok(guide.learn.activities.every(a => a.learnerActions.length >= 3 && a.feedback.length >= 3));
  assert.equal(edges.filter(e => e.topicId === report.topicId).length,0);
  assert.equal(report.assessmentBoundaries.overlapAllowed,true);
  assert.equal(report.assessmentBoundaries.noPerformanceNorm,true);
});
test('component coverage does not erase actual longitudinal and implemented-plan duties', () => {
  assert.deepEqual(Object.keys(report.remainingCurriculumTasks).sort(),['ON-HPE-2019-G6-B2.3','ON-HPE-2019-G6-B2.4']);
  assert.deepEqual(report.hpeProgrammeCoverageUnchanged,{reviewed:56,pending:211,total:267});
  const programme = read('reports/ontario-hpe-primary-review-2026-11-11.json');
  const records = programme.records;
  for (const code of ['ON-HPE-2019-G6-B2.3','ON-HPE-2019-G6-B2.4']) {
    const row = records.find(r => r.sourceKey.endsWith(`:${code}`));
    assert.ok(row);
    assert.notEqual(row.disposition,'Full');
  }
});
