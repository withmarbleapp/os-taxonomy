import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const report = JSON.parse(read('reports/cbse-primary-spatial-decomposition-six-parent-review-2026-11-12.json'));
const contexts = JSON.parse(read('data/curriculum-alignments.json')).alignments;
const keys = [3,4,5].flatMap(g => [1,3].map(n => `cbse-ctai-2026:IN-CBSE-CTAI-2026-G${g}-LO0${n}`));
const families = [
 ['a3-views','a3-change','a3-missing'], ['a4-views','a4-fold-cut','a4-missing','a4-symmetry'], ['a5-views','a5-ordered-changes','a5-hidden-folds','a5-water-mirror'],
 ['d3-number','d3-solids','d3-exchange','d3-table'], ['d4-number','d4-solids','d4-transfers','d4-table','d4-groups'], ['d5-number','d5-solids','d5-transfers','d5-table','d5-groups','d5-pictures']
];
function check(r, cs, get = read) {
 assert.deepEqual(r.records.map(x => x.key).sort(), [...keys].sort(), 'exact six independent parents');
 assert.deepEqual(r.records.map(x => x.taskIds), families, 'complete 26-family registry');
 assert.equal(r.pairsAdded,27); assert.equal(r.contextDeltas,26); assert.equal(r.newContexts,25); assert.equal(r.existingContextsAppended,1);
 for (const row of r.records) {
  assert.equal(row.disposition,'Full'); assert.equal(row.recordKind,'gradedLearningOutcomeArea'); assert.equal(row.wholeTopicAwardFromSourceResult,false); assert.equal(row.parentChildRollup,false);
  const prefix = row.strand === 'spatial' ? 'a' : 'd';
  assert.equal(row.independentTransferAnchor,`${prefix}${row.grade}-transfer`);
  const md = get(`reports/${row.protocol}`);
  for(const id of [...row.taskIds,row.independentTransferAnchor]) {
   const body=md.split(`<a id="${id}"></a>`)[1]?.split('<a id=')[0];
   assert.ok(body && body.length>180,'actual task/transfer body resolves');
   if(id===row.independentTransferAnchor) assert.match(body,/change|fresh|replace|new/i,'fresh independent transfer');
  }
  const actual=cs.filter(c => c.standards.includes(row.key));
  assert.deepEqual(actual.map(c=>c.topicId).sort(), row.contributions.map(c=>c.topicId).sort(),'exact reviewed component pairs, no rollup');
  for(const c of actual){assert.equal(c.country,'IN');assert.deepEqual([c.ageRangeStart,c.ageRangeEnd],[row.grade+5,row.grade+6]);}
  for(const c of row.contributions) assert.equal(c.role,'component');
 }
 assert.equal(r.exactContextDeltas.length,26);
 for(const d of r.exactContextDeltas)assert.ok(cs.some(c=>JSON.stringify(c)===JSON.stringify(d.after)),'exact context delta is authored');
 const rx=cs.filter(c=>c.topicId==='mt_RXnyhCRYXA' && c.standards.some(k=>keys.includes(k)));
 assert.equal(rx.length,1);assert.deepEqual([rx[0].ageRangeStart,rx[0].ageRangeEnd],[10,11],'RX retained whole path offers only Grade V');
 assert.deepEqual(r.compatibilityUnionEffects.map(x=>x.topicId).sort(),['mt_QNxFnxikCN','mt_MqqR7VUoz1','mt_Y9XKzLrUAZ'].sort());
 assert.equal(r.progress.supplementIndependentGradeParentsAfter,12);assert.equal(r.progress.supplementIndependentGoalsReviewed,3);assert.equal(r.progress.selectedNCERTFullUnchanged,451);
 const md=get(`reports/${r.records[0].protocol}`);
 for(const phrase of ['The learner builds modelA','The learner builds both cube models','then builds and alters both models','matching halves','rectangular prisms,cones andcylinders','two halves/four quarters','The source portfolios alone award no entire broader topic']) assert.ok(md.includes(phrase),'whole/source operation retained: '+phrase);
 for(const f of ['reports/cbse-primary-reasoning-review-packet-2026-11-12.md','reports/cbse-constrained-listing-alignment-2026-11-12.md','reports/ncert-preparatory-mathematics-assessment-protocols-2026-11-10.json'])assert.ok(get(f).length>500,'complete bound resource exists');
}
test('six spatial/decomposition parents bind26families,six transfers and27 exact grade pairs with actual construction',()=>check(report,contexts));
test('parent completion rejects deleted tasks/resources/pairs, rollups and early RX offers',()=>{
 const family=structuredClone(report);family.records[5].taskIds.pop();assert.throws(()=>check(family,contexts),/26-family/);
 assert.throws(()=>check(report,contexts,p=>read(p).replace('id="d5-transfer"','id="missing-transfer"')),/body resolves/);
 const missing=structuredClone(report);missing.records[0].protocol='missing.md';assert.throws(()=>check(missing,contexts),/ENOENT/);
 const pair=contexts.filter(c=>!(c.topicId==='mt_B1lPmwJz0h'&&c.standards.includes(keys[0])));assert.throws(()=>check(report,pair),/component pairs/);
 const roll=structuredClone(report);roll.records[0].parentChildRollup=true;assert.throws(()=>check(roll,contexts));
 const extra=structuredClone(report);extra.records.push({...extra.records[0],key:'cbse-ctai-2026:IN-CBSE-CTAI-2026-PREP-GOAL-CG-1'});assert.throws(()=>check(extra,contexts),/six independent/);
 const early=structuredClone(contexts);early.find(c=>c.topicId==='mt_RXnyhCRYXA'&&c.standards.includes(keys[5])).ageRangeStart=8;assert.throws(()=>check(report,early));
 assert.throws(()=>check(report,contexts,p=>p.endsWith('six-grade-portfolios-2026-11-12.md')?read(p).replace('The learner builds both cube models','Adult shows a model'):read(p)),/operation retained/);
});
