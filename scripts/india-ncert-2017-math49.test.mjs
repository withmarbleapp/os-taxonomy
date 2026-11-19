import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const prefix='india-ncert-2017-mathematics-source-authoring-2026-11-13';
const report=JSON.parse(fs.readFileSync(path.join(root,'reports',prefix+'-review.json')));
const tasks=fs.readFileSync(path.join(root,'reports',prefix+'-task-design.md'),'utf8');
const support=fs.readFileSync(path.join(root,'reports',prefix+'-whole-support.md'),'utf8');
const alignments=JSON.parse(fs.readFileSync(path.join(root,'data/curriculum-alignments.json'))).alignments;
function verify(r,md,contexts,exists=f=>fs.existsSync(path.join(root,'reports',f))){
 assert.equal(r.records.length,49);assert.equal(r.sourceParentRollup,false);
 assert.deepEqual([1,2,3,4,5].map(g=>r.records.filter(x=>x.grade===g).length),[9,7,12,13,8]);
 const pairs=[];
 for(const row of r.records){
  assert.match(row.key,/^ncert-elementary-learning-outcomes-2017:IN-NCERT-LO-2017-MATH-G[1-5]-LO\d\d$/);
  assert.equal(row.sourceOnlyPerformanceAwardsWholeClaim,false);
  assert.equal(row.taskResource,prefix+'-task-design.md#'+row.taskId);
  const anchor='<a id="'+row.taskId+'"></a>';
  assert.equal(md.split(anchor).length,2,'exact actual task anchor');
  assert.ok(md.includes(row.originalTaskAndFreshAssessment),'complete original task and changed independent assessment');
  for(const c of row.contributions){
   assert.equal(c.role,'component');assert.ok(c.ageRangeStart>=row.grade+5 && c.ageRangeEnd<=row.grade+6);
   assert.ok(c.ageRangeStart>=c.wholePathMinimum);
   assert.ok(contexts.some(x=>x.topicId===c.topicId && x.scope==='jurisdiction' && x.country==='IN' && !x.region && x.ageRangeStart===c.ageRangeStart && x.ageRangeEnd===c.ageRangeEnd && x.standards.includes(row.key)),'exact component offer exists');
   pairs.push([c.topicId,row.key,c.ageRangeStart,c.ageRangeEnd]);
  }
 }
 assert.equal(pairs.length,93);
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(pairs.sort())).digest('hex'),'1cf7d8020378171c2ee1b7ebbb171b63207679e6baa9ff314af30d3b9e855b9f');
 for(const f of r.originalAssets)assert.ok(exists(f),'actual original support asset exists');
 assert.ok(exists(r.wholeSupport));
 for(const term of ['Teaching modelP','Fresh independent modelR','Reflect(object,line)','line-pie-vocabulary-displays.svg','actual app use'])assert.ok(support.includes(term),'whole-operation support '+term);
}
test('Math49 actual task anchors, independent assessments, exact93 components and original whole support resolve',()=>verify(report,tasks,alignments));
test('Math49 fails missing task, component, original material or inferred parent rollup',()=>{
 assert.throws(()=>verify(report,tasks.replace('<a id="math2017-g5-03"></a>',''),alignments));
 const first=report.records[0], c=first.contributions[0];
 assert.throws(()=>verify(report,tasks,alignments.map(x=>x.topicId===c.topicId?{...x,standards:x.standards.filter(k=>k!==first.key)}:x)));
 assert.throws(()=>verify(report,tasks,alignments,()=>false));
 assert.throws(()=>verify({...report,sourceParentRollup:true},tasks,alignments));
 const broken=structuredClone(report);broken.records[0].originalTaskAndFreshAssessment='Unprovided independent transfer';assert.throws(()=>verify(broken,tasks,alignments));
});
