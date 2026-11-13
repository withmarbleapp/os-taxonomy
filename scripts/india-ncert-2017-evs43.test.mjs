import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'), prefix='india-ncert-2017-evs-source-authoring-2026-11-13';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const report=JSON.parse(read(`reports/${prefix}-review.json`));
const contexts=JSON.parse(read('data/curriculum-alignments.json')).alignments;
function check(r,cs,get=read){
 assert.equal(r.records.length,43);assert.deepEqual([3,4,5].map(g=>r.records.filter(x=>x.grade===g).length),[15,15,13]);
 assert.equal(r.sourceParentRollup,false);assert.equal(r.actualLearnerOrFieldworkPerformanceClaimed,false);
 assert.equal(r.records.filter(x=>x.proposedAuthoringDisposition==='Conditional').length,4);
 const protocols=JSON.parse(get('reports/'+r.existingWholeProtocols)).protocols;
 const md=get(`reports/${prefix}-source-task-registry.md`), support=get('reports/'+r.wholeSupport), all=[];
 assert.ok(!md.includes('Actual factual resource gap:') && !md.includes('Concrete remaining resource task:'));
 for(const row of r.records){
  assert.match(row.key,/^ncert-elementary-learning-outcomes-2017:IN-NCERT-LO-2017-EVS-G[345]-LO\d\d$/);
  assert.equal(row.taskResource,`${prefix}-source-task-registry.md#${row.taskId}`);
  const body=md.split(`<a id="${row.taskId}"></a>`)[1]?.split('<a id=')[0];assert.ok(body,'actual independent source task resolves');
  assert.equal(row.sourceOnlyPerformanceAwardsWholeClaim,false);assert.equal(row.examplesAreNotAllCoRequired,true);
  if(row.proposedAuthoringDisposition==='Conditional')assert.ok(row.typedCondition.length>30);
  for(const id of row.protocols){const p=protocols.find(x=>x.id===id);assert.ok(p,'real protocol ID');assert.ok(body.includes(p.task)&&body.includes(p.transfer),'complete actual task and independent transfer retained');}
  for(const ref of row.additionalPanels){const [file,anchor]=ref.split('#');assert.ok(get('reports/'+file).includes(`<a id="${anchor}"></a>`),'bounded actual additional panel resolves');}
  for(const c of row.contributions){
   assert.equal(c.role,'component');assert.ok(c.positiveOperation.length>60);assert.ok(c.ageRangeStart>=c.wholePathMinimum);assert.ok(c.ageRangeStart>=row.grade+5&&c.ageRangeEnd<=row.grade+6);
   assert.ok(cs.some(x=>x.topicId===c.topicId&&x.country==='IN'&&x.scope==='jurisdiction'&&!x.region&&x.ageRangeStart===c.ageRangeStart&&x.ageRangeEnd===c.ageRangeEnd&&x.standards.includes(row.key)),'exact source component context');all.push([c.topicId,row.key,c.ageRangeStart,c.ageRangeEnd]);
  }
 }
 assert.equal(all.length,93);assert.equal(crypto.createHash('sha256').update(JSON.stringify(all.sort())).digest('hex'),'9f305c30a6bc22b1145cec5b02ef7b8a6982b60deeb6f3dacd6be76dddc5a37c');
 assert.equal(r.wholeCardsWithoutSavedGuideIds.length,50);for(const id of r.wholeCardsWithoutSavedGuideIds)assert.ok(support.includes(id),'explicit absent-guide whole support');
 for(const text of ['Actual AU environments','FrenchGuiana','seven syllables','Original MODEL grid','Prediction explicitly compared'])assert.ok(support.includes(text),'retained whole operation '+text);
 const panels=get(`reports/${prefix}-task-design.md`);
 for(const text of ['G — Food needs','H — Actual nonstandard','I — Concrete measurement','5mL','60seconds','brain','PLAYnotes','R6/B4/G2'])assert.ok(panels.includes(text),'actual original panel/key '+text);
 const key=JSON.parse(get('reports/assets/ncert-2017-evs/teacher-key.json')),svg=get('reports/assets/ncert-2017-evs/nonstandard-length.svg');
 assert.equal(key.Amm/key.unitLengthMm,7);assert.equal(key.Bmm/key.unitLengthMm,5);assert.equal(key.physicalPrintOrMeasurementPerformed,false);assert.ok(svg.includes('width="140"')&&svg.includes('width="100"'));
 const correction=JSON.parse(get(`reports/${prefix}-factual-clarification.json`));const guide=JSON.parse(get('data/teaching-research.json')).records.find(x=>x.topicId===correction.topicId);assert.equal(correction.changes.length,1);assert.equal(guide.assess.errorPatterns[2].nextMove,correction.changes[0].after);
}
test('EVS43 binds93 positive components, complete source tasks, concrete models and honest contextual conditions',()=>check(report,contexts));
test('EVS43 rejects absent actual task/panel/component, forced care Full and parent rollup',()=>{
 assert.throws(()=>check(report,contexts,p=>read(p).replace('id="evs2017-g5-01"','id="missing-source-task"')),/actual independent/);
 assert.throws(()=>check(report,contexts,p=>p.endsWith('-task-design.md')?read(p).replace('id="panel-h"','id="missing-panel"'):read(p)),/panel resolves/);
 const row=report.records[0],c=row.contributions[0];assert.throws(()=>check(report,contexts.map(x=>x.topicId===c.topicId?{...x,standards:x.standards.filter(k=>k!==row.key)}:x)),/component context/);
 const forced=structuredClone(report);forced.records.find(x=>x.proposedAuthoringDisposition==='Conditional').proposedAuthoringDisposition='Full';assert.throws(()=>check(forced,contexts));
 assert.throws(()=>check({...report,sourceParentRollup:true},contexts));
 assert.throws(()=>check(report,contexts,p=>p.endsWith('nonstandard-length.svg')?'':read(p)));
});
