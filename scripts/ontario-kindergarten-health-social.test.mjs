import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-kindergarten-health-social-design-2026-11-11.json');
const topics=new Map(load('../data/topics.json').topics.map(t=>[t.id,t]));
const contexts=load('../data/curriculum-alignments.json').alignments;
const catalogue=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===report.source.catalogue);
const codes=Array.from({length:5},(_,i)=>[14+i,[4,5,5,3,5][i]]).flatMap(([n,count])=>[`C${n}`,...Array.from({length:count},(_,i)=>`C${n}.${i+1}`)]);
function verify(r,alignments=contexts){
 assert.deepEqual(r.records.map(x=>x.code),codes);assert.equal(r.scope.newTopics,0);assert.equal(r.scope.authoredClaimChanges,0);assert.equal(r.scope.dependencyChanges,0);
 const expected=new Set(),actual=new Set();
 for(const row of r.records){
  assert.equal(row.key,`${r.source.catalogue}:ON-K-2026-K-${row.code}`);assert(catalogue.topics.some(t=>t.key===row.key));const excluded=['C17','C17.1','C18.1','C18.2','C18.3'].includes(row.code); const mixed=['C17.2','C18'].includes(row.code); assert.equal(row.disposition,excluded?'Out of scope':mixed?'Partial':'Full');assert.equal(row.remainingConditions.length,mixed?1:0); if(excluded){assert.deepEqual(row.topicContributions,[]);assert.deepEqual(row.protocolIds,[]);continue;}
  for(const id of row.protocolIds){const p=r.protocols[id];assert(p?.task.length>80);for(const resource of p.resourceIds??[])assert(Object.hasOwn(r.resources,resource));}
  for(const c of row.topicContributions){const t=topics.get(c.topicId);assert(t);assert.equal(c.role,'component');assert.equal(c.wholeClaimAssessmentRetained,true);assert.deepEqual(c.ageBand,[Math.max(4,t.ageRangeStart),6]);expected.add(JSON.stringify([c.topicId,...c.ageBand,row.key]));}
 }
 for(const c of alignments)for(const key of c.standards){const tuple=JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]);if(expected.has(tuple)){assert.deepEqual([c.scope,c.country,c.region],['jurisdiction','CA','Ontario']);actual.add(tuple);}}
 assert.equal(expected.size,50);assert.deepEqual(actual,expected,'all exact scoped health/social components');
 assert(r.records.find(x=>x.code==='C16').protocolIds.includes('safety-and-get-help'),'overall health includes in-person and online safety');
 const safety=r.protocols['safety-and-get-help'];assert.match(safety.task,/in-person\/online/);assert.match(safety.task,/another help route/);assert.match(safety.limits,/no actual injury demonstration/);
 assert.equal(r.resources['weekly-movement-plan'],undefined);
 for(const c of alignments)for(const key of c.standards)assert(!['C17','C17.1','C18.1','C18.2','C18.3'].some(code=>key===`${r.source.catalogue}:ON-K-2026-K-${code}`),'excluded PE association');
 for(const code of ['C17.2','C18']) assert.deepEqual(r.records.find(x=>x.code===code).topicContributions.map(x=>x.topicId).sort(),(code==='C17.2'?['mt_FtCLISvSGw','mt_UGf6jICEhs']:['mt_FtCLISvSGw']));
 const record=r.resources['seven-day-routine-record'];assert.deepEqual(record.days.map(x=>x.day),[1,2,3,4,5,6,7]);for(const row of record.days)assert.deepEqual([row.plannedOpportunity,row.actionOrSupportObserved,row.reflection],[null,null,null],'prepared blank is not invented learner success');
 assert.match(r.protocols['fine-motor-and-cooperative-play'].task,/actual tabletop construction/);assert.match(r.protocols['fine-motor-and-cooperative-play'].task,/actual non-physical cooperative/);
 assert.match(r.protocols['health-food-hygiene-and-feelings'].task,/Actually practise supported soap-and-water handwashing/);
 assert.match(r.protocols['responsibility-regulation-and-learning'].task,/not a binary personality score/);assert.match(r.conditions.contextualAims,/never infer enduring character/);
}
test('Kindergarten health/social tasks retain real practice, recurring opportunities and contextual aims',()=>verify(report));
test('excluded PE, fabricated routine successes or missing online safety cannot certify the programme',()=>{
 for(const mutate of [r=>r.records.find(x=>x.code==='C17').disposition='Full',r=>r.records.find(x=>x.code==='C18').disposition='Full',r=>r.resources['seven-day-routine-record'].days[0].actionOrSupportObserved='Completed successfully',r=>r.records.find(x=>x.code==='C16').protocolIds=['health-food-hygiene-and-feelings'],r=>r.protocols['health-food-hygiene-and-feelings'].task='Name soap without practising washing.',r=>r.protocols['fine-motor-and-cooperative-play'].task='Complete one hop.',r=>r.records.find(x=>x.code==='C18.4').topicContributions[1].ageBand=[4,6]]){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r));}
 const leaked=structuredClone(contexts);leaked[0].standards.push(`${report.source.catalogue}:ON-K-2026-K-C18.3`);assert.throws(()=>verify(report,leaked),/excluded PE/);
 const lost=structuredClone(contexts);for(const c of lost)if(c.topicId==='mt_R2_rZ4F6r4')c.standards=c.standards.filter(k=>!k.endsWith(':ON-K-2026-K-C16.4'));assert.throws(()=>verify(report,lost),/all exact scoped/);
});
