import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-kindergarten-coding-inquiry-design-2026-11-11.json');
const topics=new Map(load('../data/topics.json').topics.map(x=>[x.id,x]));
const contexts=load('../data/curriculum-alignments.json').alignments;
const source=load('../data/curriculum-standards.json').curricula.find(x=>x.slug===report.source.catalogue);
const codes=['B11','B11.1','B11.2','B11.3','B12','B12.1','B12.2','B12.3','B12.4','B12.5','B12.6','B13','B13.1','B13.2','B13.3'];
function verify(r,alignments=contexts){
 assert.deepEqual(r.records.map(x=>x.code),codes);
 assert.deepEqual(r.source.sourceAgeWindow,[4,6]);
 assert.equal(r.scope.newTopics,0);assert.equal(r.scope.authoredClaimChanges,0);assert.equal(r.scope.dependencyChanges,0);
 const expected=new Set();
 for(const row of r.records){
  assert.equal(row.key,`${r.source.catalogue}:ON-K-2026-K-${row.code}`);
  assert(source.topics.some(x=>x.key===row.key),'exact retained source key');
  assert.equal(row.disposition,'Full');assert.deepEqual(row.remainingConditions,[]);
  assert(row.requiredTaskDuty.length>30);assert(row.protocolIds.length>0);
  for(const id of row.protocolIds){const p=r.protocols[id];assert(p,'actual task protocol resolves');for(const field of ['task','positive','nearMiss','transfer'])assert(typeof p[field]==='string'&&p[field].length>30,field);for(const resource of p.resourceIds??[])assert(r.resources[resource],'actual model resource resolves');}
  assert(row.topicContributions.length>0);
  for(const c of row.topicContributions){const topic=topics.get(c.topicId);assert(topic);assert.equal(c.role,'component');assert.equal(c.wholeClaimAssessmentRetained,true);assert.deepEqual(c.ageBand,[Math.max(4,topic.ageRangeStart),6],'conservative whole-claim implementation band');expected.add(JSON.stringify([c.topicId,...c.ageBand,row.key]));}
 }
 const keys=new Set(r.records.map(x=>x.key)),actual=new Set();
 for(const c of alignments)for(const key of c.standards)if(keys.has(key)){
  // Earlier reviewed associations may also contribute; this slice does not remove them.
  if(expected.has(JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]))){assert.deepEqual([c.scope,c.country,c.region],['jurisdiction','CA','Ontario']);actual.add(JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]));}
 }
 assert.equal(expected.size,35);assert.deepEqual(actual,expected,'all exact scoped component pairs');
 const design=r.protocols['inquiry-build-test'];assert.deepEqual(design.resourceIds,['foil-boat','paper-bridge']);
 for(const id of design.resourceIds){const model=r.resources[id];for(const field of ['materials','build','test','record'])assert(Array.isArray(model[field])&&model[field].length>=2,`actual ${id} ${field}`);}
 assert.match(design.task,/at least three genuine how\/why questions/);assert.match(design.task,/before any trial/);assert.match(design.task,/method improvement/);
 assert.match(r.protocols['route-instructions'].task,/gives then follows/);assert.match(r.protocols['route-instructions'].task,/Test an original mistaken route/);assert.match(r.protocols['route-instructions'].task,/record the working sequence/);
 assert.match(r.protocols['natural-built-investigation'].task,/fallen dead leaf/);assert.match(r.protocols['natural-built-investigation'].task,/battery toy/);assert.match(r.protocols['natural-built-investigation'].wholeClaimBoundary,/single-age-six/);
 assert.match(r.protocols['safety-and-get-help'].task,/no child diagnoses a concussion/);assert.match(r.protocols['safety-and-get-help'].limits,/Fictional scenarios only/);
}
test('Kindergarten coding and inquiry use actual source tasks and conservative scoped components',()=>verify(report));
test('the programme cannot substitute one model, omit actual tests or drop instruction refinement',()=>{
 for(const mutate of [r=>r.protocols['inquiry-build-test'].resourceIds=['foil-boat'],r=>r.protocols['inquiry-build-test'].resourceIds[1]='missing-model',r=>r.resources['paper-bridge'].test=[],r=>r.resources['foil-boat'].record=[],r=>r.protocols['route-instructions'].task='Copy the adult route without testing it.',r=>r.records.find(x=>x.code==='B13.2').topicContributions[0].ageBand=[4,6]]){
  const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r));
 }
 const lost=structuredClone(contexts);for(const c of lost)if(c.topicId==='mt_hi8cVycbwn')c.standards=c.standards.filter(k=>!k.endsWith(':ON-K-2026-K-B12.5'));assert.throws(()=>verify(report,lost),/all exact scoped/);
});
