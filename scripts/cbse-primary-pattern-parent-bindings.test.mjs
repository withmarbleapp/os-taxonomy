import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const report = JSON.parse(read('reports/cbse-primary-pattern-grade-parent-review-2026-11-12.json'));
const contexts = JSON.parse(read('data/curriculum-alignments.json')).alignments;
const prefix = 'cbse-ctai-2026:IN-CBSE-CTAI-2026-';
const keys = [3, 4, 5].map(g => `${prefix}G${g}-LO02`);
const taskSets = [['p3-one-change','p3-two-features','p3-letters'], ['p4-interleaved','p4-growth-turn','p4-mixed'], ['p5-progressive','p5-layered','p5-alternating']];
function check(r, cs, get = read) {
  assert.deepEqual(r.records.map(x => x.key), keys, 'exact three independently reviewed parents');
  assert.equal(r.newPairs, 6);
  assert.equal(r.newContexts, 6);
  assert.equal(r.ageChanges, 0);
  for (const [i, row] of r.records.entries()) {
    const g = i + 3;
    assert.equal(row.grade, g);
    assert.equal(row.recordKind, 'gradedLearningOutcomeArea');
    assert.equal(row.disposition, 'Full');
    assert.equal(row.wholeTopicAwardFromSourceResult, false);
    assert.deepEqual(row.taskIds, taskSets[i], 'all nine original task families');
    assert.equal(row.independentTransferAnchor, `p${g}-transfer`);
    const md = get(`reports/${row.protocol}`);
    for (const id of [...row.taskIds, row.independentTransferAnchor]) {
      const body = md.split(`<a id="${id}"></a>`)[1]?.split('<a id=')[0];
      assert.ok(body && body.length > 250, 'actual original task or transfer resolves');
      if (id === row.independentTransferAnchor) assert.match(body, /Independent integrated transfer/);
      assert.match(body, /chang|Change|fresh|new|different|Replace/i, 'independent changed task supplied');
    }
    assert.match(md, /smallest unit/);
    assert.match(md, /feature that the wording did not explicitly state/);
    assert.match(md, /parent task alone awards none automatically/);
    const actual = cs.filter(c => c.standards.includes(row.key));
    assert.deepEqual(actual.map(c => c.topicId).sort(), ['mt_A-FyLLLLzy','mt_WXW0hjNhph'].sort(), 'exact six existing components; no unrelated/rollup pair');
    for (const c of actual) {
      assert.equal(c.country, 'IN');
      assert.deepEqual([c.ageRangeStart, c.ageRangeEnd], [g + 5, g + 6]);
    }
  }
  assert.equal(r.progress.remainingIndependentGoals, 3);
  assert.equal(r.progress.remainingIndependentGradeParents, 6);
}
test('three pattern parents bind nine actual families, three independent transfers and six exact grade contexts', () => check(report, contexts));
test('pattern parent completion rejects missing tasks/protocols/pairs and unreviewed rollups', () => {
  const task = structuredClone(report); task.records[0].taskIds.pop();
  assert.throws(() => check(task, contexts), /all nine/);
  assert.throws(() => check(report, contexts, p => read(p).replace('id="p5-transfer"', 'id="missing"')), /actual original task/);
  const missing = structuredClone(report); missing.records[1].protocol = 'missing.md';
  assert.throws(() => check(missing, contexts), /ENOENT/);
  const pair = contexts.filter(c => !(c.topicId === 'mt_A-FyLLLLzy' && c.standards.includes(keys[0])));
  assert.throws(() => check(report, pair), /exact six/);
  const age = structuredClone(contexts); age.find(c => c.standards.includes(keys[0])).ageRangeStart = 9;
  assert.throws(() => check(report, age));
  const parent = structuredClone(report); parent.records.push({ ...parent.records[0], key: `${prefix}PREP-GOAL-CG-1` });
  assert.throws(() => check(parent, contexts), /exact three/);
});
