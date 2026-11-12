import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const report = JSON.parse(read('reports/cbse-primary-algorithmic-grade-parent-review-2026-11-12.json'));
const contexts = JSON.parse(read('data/curriculum-alignments.json')).alignments;
const prefix = 'cbse-ctai-2026:IN-CBSE-CTAI-2026-';
const keys = [3, 4, 5].map(g => `${prefix}G${g}-LO04`);
const assetNames = ['original-paths-and-counting.svg', 'original-left-tower-count.svg', 'original-number-flowcharts.svg'];
function check(r, cs, get = read) {
  assert.deepEqual(r.records.map(x => x.key), keys, 'three independently reviewed parent keys only');
  assert.equal(r.newPairs, 8);
  assert.equal(r.newContexts, 8);
  for (const [i, row] of r.records.entries()) {
    const grade = i + 3;
    assert.equal(row.grade, grade);
    assert.equal(row.recordKind, 'gradedLearningOutcomeArea');
    assert.equal(row.disposition, 'Full');
    assert.equal(row.wholeTopicAwardFromSourcePerformance, false);
    assert.equal(row.requiredFamilyCount, i === 0 ? 5 : 6);
    assert.equal(row.taskIds.length, row.requiredFamilyCount);
    assert.equal(new Set(row.taskIds).size, row.requiredFamilyCount);
    assert.ok(row.taskIds.every(id => id.startsWith(`g${grade}-`)));
    const md = get(`reports/${row.protocol}`);
    const heading = ['III: five', 'IV: six', 'V: six'][i];
    const section = md.split(`## Class ${heading} complete cases\n`)[1]?.split('\n## ')[0];
    assert.ok(section, 'actual grade protocol heading resolves');
    for (const id of row.taskIds) {
      const task = section.split(`<a id="${id}"></a>\n\n`)[1]?.split('<a id=')[0];
      assert.ok(task && /^\d\. \*\*/.test(task), 'taskId resolves to actual original task material');
      assert.ok(task.length > 120, 'task anchor contains instructions and key');
    }
    assert.equal([...section.matchAll(/^\d\. \*\*/gm)].length, row.requiredFamilyCount, 'all family tasks supplied');
    assert.match(section, /Independent integrated transfer:/, 'independent transfer supplied for each grade');
    assert.match(section, /chang|fresh|Reverse/i, 'transfer includes a changed case');
    assert.match(md, /Do not certify a parent by counting associations/);
    const actual = cs.filter(c => c.standards.includes(row.key));
    const ids = ['mt_iqmt8wL26h', 'mt_zQfWqImxva', ...(grade > 3 ? ['mt_ejht12jhm2'] : [])];
    assert.deepEqual(actual.map(c => c.topicId).sort(), ids.sort(), 'exact retained pairs, no rejected Time/RX or parent rollup');
    for (const c of actual) {
      assert.equal(c.country, 'IN');
      assert.deepEqual([c.ageRangeStart, c.ageRangeEnd], [grade + 5, grade + 6]);
    }
    for (const name of assetNames) {
      const path = `assets/cbse-primary-algorithms/${name}`;
      assert.ok(md.includes(`](${path})`), 'actual printable resource is linked');
      assert.match(get(`reports/${path}`), /<svg[\s>]/, 'actual SVG resource exists');
    }
  }
  assert.deepEqual(r.originalResources, assetNames.map(n => `assets/cbse-primary-algorithms/${n}`));
  assert.equal(r.progress.remainingIndependentlyUnreviewedGoals, 3);
  assert.equal(r.progress.remainingIndependentlyUnreviewedGradeParents, 9);
}
test('three algorithmic parents bind all family protocols, transfers, printables and grade-fitting components', () => check(report, contexts));
test('algorithm completion guard rejects missing resources, protocols, family coverage and pairs', () => {
  assert.throws(() => check(report, contexts, p => { if (p.endsWith(assetNames[2])) throw Error('missing resource'); return read(p); }), /missing resource/);
  const protocol = structuredClone(report); protocol.records[0].protocol = 'missing-protocol.md';
  assert.throws(() => check(protocol, contexts), /ENOENT/);
  assert.throws(() => check(report, contexts, p => p.endsWith('.md') ? read(p).replace('<a id="g3-number-chain"></a>', '') : read(p)), /taskId resolves/);
  assert.throws(() => check(report, contexts, p => p.endsWith('.md') ? read(p).replaceAll('Independent integrated transfer:', 'Removed:') : read(p)), /independent transfer/);
  const family = structuredClone(report); family.records[1].taskIds.pop();
  assert.throws(() => check(family, contexts));
  const absent = contexts.filter(c => !(c.topicId === 'mt_iqmt8wL26h' && c.standards.includes(keys[0])));
  assert.throws(() => check(report, absent), /exact retained pairs/);
  const rollup = structuredClone(report); rollup.records.push({ ...rollup.records[0], key: `${prefix}CG1` });
  assert.throws(() => check(rollup, contexts), /three independently reviewed/);
  const leaked = [...contexts, { topicId: 'mt_-vvVxpOHG2', country: 'IN', ageRangeStart: 8, ageRangeEnd: 9, standards: [keys[0]] }];
  assert.throws(() => check(report, leaked), /exact retained pairs/);
});
