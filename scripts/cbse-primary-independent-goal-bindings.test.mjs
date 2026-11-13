import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const report = JSON.parse(read('reports/cbse-primary-three-goal-independent-review-2026-11-12.json'));
const contexts = JSON.parse(read('data/curriculum-alignments.json')).alignments;
const keys = [1,2,3].map(g => `cbse-ctai-2026:IN-CBSE-CTAI-2026-PREP-GOAL-CG-${g}`);
const targetIds = [['mt_RXnyhCRYXA','mt_fLOkq-HfPB','mt_A-FyLLLLzy','mt_WXW0hjNhph'], ['mt_gu0NPDvlhY','mt_mQcWGh02no','mt_EBYGhd8X3x'], ['mt_SZrMv3YAky']];
const anchors = [['cg1-practical','cg1-visual-pattern','cg1-transfer'], ['cg2-analysis','cg2-method-representation','cg2-transfer'], ['cg3-device-app','cg3-transfer']];
function check(r, cs, get = read) {
  assert.deepEqual(r.records.map(x => x.key), keys, 'only three independently reviewed source goals');
  assert.equal(r.newPairs, 8); assert.equal(r.newContexts, 1);
  assert.equal(r.ageProjectionChanges, 0); assert.equal(r.hardEdgeChanges, 0);
  assert.equal(r.liveGUIPreflightPerformed, false); assert.equal(r.actualLearnerAttainmentClaimed, false);
  for (const [i,row] of r.records.entries()) {
    assert.equal(row.recordKind, 'curricularGoal'); assert.equal(row.disposition, 'Full');
    assert.equal(row.wholeTopicAwardFromSourceResult, false);
    assert.deepEqual(row.independentTaskAnchors, anchors[i]);
    const md = get(`reports/${row.protocol}`);
    for (const anchor of row.independentTaskAnchors) {
      const body = md.split(`<a id="${anchor}"></a>`)[1]?.split('<a id=')[0];
      assert.ok(body && body.length > 400, 'actual independent goal task or changed transfer resolves');
    }
    const csForGoal = cs.filter(c => c.standards.includes(row.key));
    assert.deepEqual(csForGoal.map(c => c.topicId).sort(), [...targetIds[i]].sort(), 'eight exact component pairs only');
    for (const c of csForGoal) {
      assert.equal(c.country, 'IN');
      assert.deepEqual([c.ageRangeStart,c.ageRangeEnd], c.topicId === 'mt_RXnyhCRYXA' ? [10,11] : [8,11], 'whole-path compatible new goal offers');
    }
    assert.ok(md.includes('source cohort is Preparatory ages8–11'));
    assert.ok(md.includes('RX whole-topic goal offer is narrower at10–11'));
    if (i === 2) {
      assert.equal(row.actualAppUseRequired, true);
      assert.match(md, /pupil operates the relevant controls/);
      assert.match(md, /actually uses an appropriate app operation/);
      assert.match(md, /paper imitation does not satisfy/);
      assert.match(md, /must not perform the pupil's action/);
    }
    for (const path of r.operationalBindings) {
      assert.ok(get(path).length > 1000, 'complete retained operational resource exists');
      assert.ok(md.includes(`](${path.split('/').at(-1)})`), 'actual complete operational resource linked');
    }
  }
  assert.equal(r.exactContextDeltas.filter(d => d.before === null).length, 1);
  for (const d of r.exactContextDeltas.filter(d => d.before !== null)) {
    assert.deepEqual({...d.after, standards:d.before.standards}, d.before, 'seven old contexts append only');
    assert.ok(d.before.standards.every(k => d.after.standards.includes(k)));
  }
  const oldRX = cs.find(c => c.topicId === 'mt_RXnyhCRYXA' && c.country === 'IN' && c.ageRangeStart === 8 && c.ageRangeEnd === 11);
  assert.ok(oldRX && !oldRX.standards.includes(keys[0]), 'new goal does not leak into old early RX context');
  assert.equal(r.progress.remainingIndependentGradeParents, 6);
}
test('three independent goals bind actual tasks, changed cases, app use and eight path-compatible component pairs', () => check(report, contexts));
test('goal guard rejects missing material, broadened RX offer, paper substitution and unreviewed rollup', () => {
  assert.throws(() => check(report, contexts, p => read(p).replace('id="cg2-transfer"','id="missing"')), /actual independent goal/);
  const missing = contexts.filter(c => !(c.topicId === 'mt_SZrMv3YAky' && c.standards.includes(keys[2])));
  assert.throws(() => check(report, missing), /eight exact/);
  const early = structuredClone(contexts); early.find(c => c.topicId === 'mt_RXnyhCRYXA' && c.standards.includes(keys[0])).ageRangeStart = 8;
  assert.throws(() => check(report, early), /whole-path compatible/);
  const paper = structuredClone(report); paper.records[2].actualAppUseRequired = false;
  assert.throws(() => check(paper, contexts));
  assert.throws(() => check(report, contexts, p => p.endsWith('independent-portfolio-2026-11-12.md') ? read(p).replace('actually uses an appropriate app operation','only describes an app') : read(p)), /actually uses/);
  const rollup = structuredClone(report); rollup.records.push({...rollup.records[0], key:'cbse-ctai-2026:IN-CBSE-CTAI-2026-G3-LO01'});
  assert.throws(() => check(rollup, contexts), /only three/);
});
