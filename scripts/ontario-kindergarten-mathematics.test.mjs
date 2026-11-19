import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-kindergarten-mathematics-design-2026-11-11.json');
const review=load('../reports/quantity-estimation-review-2026-11-11.json');
const topics=new Map(load('../data/topics.json').topics.map(t=>[t.id,t]));
const guides=new Map(load('../data/teaching-research.json').records.map(r=>[r.topicId,r]));
const contexts=load('../data/curriculum-alignments.json').alignments;
const catalogue=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===report.source.catalogue);
const codes=['A5','A6',...Array.from({length:13},(_,i)=>`A6.${i+1}`),'A7',...Array.from({length:4},(_,i)=>`A7.${i+1}`),'A8',...Array.from({length:4},(_,i)=>`A8.${i+1}`),'A9',...Array.from({length:7},(_,i)=>`A9.${i+1}`),'A10','A10.1','A10.2'];
function verify(r,alignments=contexts){
 assert.deepEqual(r.records.map(x=>x.code),codes);
 const expected=new Set(),actual=new Set();
 for(const row of r.records){
  assert.equal(row.key,`${r.source.catalogue}:ON-K-2026-K-${row.code}`);
  assert(catalogue.topics.some(t=>t.key===row.key));assert.equal(row.disposition,'Full');assert.deepEqual(row.remainingConditions,[]);
  assert(!/pending|not yet|before canonical edit|Read complete/.test(row.requiredTaskDuty),'actual completed duty, not a draft review instruction');
  for(const id of row.protocolIds)assert(r.protocols[id]?.task.length>50,'actual protocol resolves');
  for(const c of row.topicContributions){
   const t=topics.get(c.topicId);assert(t);assert.equal(c.role,'component');assert.equal(c.wholeClaimAssessmentRetained,true);
   assert.deepEqual(c.ageBand,[Math.max(4,t.ageRangeStart),6],'retain older whole-claim starting ages');
   expected.add(JSON.stringify([c.topicId,...c.ageBand,row.key]));
  }
 }
 for(const c of alignments)for(const key of c.standards){const tuple=JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]);if(expected.has(tuple)){assert.deepEqual([c.scope,c.country,c.region],['jurisdiction','CA','Ontario']);actual.add(tuple);}}
 assert.equal(expected.size,76);assert.deepEqual(actual,expected,'every exact scoped component remains present');
 const p=r.protocols;
 assert.match(p['parts-comparison-estimation'].task,/first estimate[\s\S]*then count/);
 assert.match(p['parts-comparison-estimation'].wholeClaimBoundary,/fresh unknown-total/);
 assert.match(p['data-and-likelihood'].task,/one-object-per-response concrete graph and a one-picture-per-object graph/);
 assert.match(p['data-and-likelihood'].task,/collect|counts and records/);assert.match(p['data-and-likelihood'].task,/even chance/);
 const shape=p['shapes-space-and-measure'].task;
 for(const duty of [/2Dpattern-block picture and a3Dblock structure with matching halves/,/separate and rearrange/,/predicting a view before looking/,/Give ANDfollow/,/two lengths/,/two areas/,/mass using a balance/,/capacity through controlled filling/,/when direct comparison is unavailable/])assert.match(shape,duty);
 const row=code=>r.records.find(x=>x.code===code);
 assert(row('A6.7').topicContributions.some(c=>c.topicId===review.topicId),'counting alone cannot stand in for estimation');
 assert(row('A9.6').topicContributions.some(c=>c.topicId==='mt_vJUa62bxeR'),'position words alone cannot stand in for changed-view visualisation');
 assert(row('A9.5').topicContributions.some(c=>c.topicId==='mt_MqqR7VUoz1'),'composition alone cannot stand in for decomposition');
}
function verifyEstimation(t,g){
 assert.equal(t.id,review.topicId);assert.equal(g.confidence,'low');assert.equal(t.type,'PROCEDURAL');
 assert.match(t.evidence[0],/before exact item-by-item counting/);assert.match(t.evidence[1],/Count the actual collection/);assert.match(t.evidence[2],/fresh, not-yet-counted/);
 assert.match(t.assessmentPrompt,/fresh, not-yet-counted/);
 assert.match(g.assess.whatMakesItDiscriminate,/non-diagnostic[\s\S]*must not be scored as an estimation gap/);
 assert.match(g.assess.responseLevels.gap,/unknown total/);assert.match(g.assess.responseLevels.gap,/unassessed[\s\S]*not evidence of this gap/);
 assert.match(g.learn.activities[2].learnerActions[0],/fresh, not-yet-counted/);
 assert.match(g.learn.constraints.join(' '),/No compulsory timer, percentage error cut-off/);
 assert.match(review.overlapDisposition,/retained exactly/);assert.match(review.overlapDisposition,/No automatic equivalence\/transfer/);
}
test('Kindergarten maths retains actual source tasks, complete components and conservative age bands',()=>verify(report));
test('maths cannot pass by dropping estimation, a graph, solid matching, a measure or changed-view evidence',()=>{
 for(const mutate of [r=>r.records.find(x=>x.code==='A6.7').topicContributions=r.records.find(x=>x.code==='A6.7').topicContributions.filter(c=>c.topicId!==review.topicId),r=>r.protocols['data-and-likelihood'].task='Read a supplied picture graph.',r=>r.protocols['shapes-space-and-measure'].task=r.protocols['shapes-space-and-measure'].task.replace('and a3Dblock structure with matching halves','with matching halves'),r=>r.protocols['shapes-space-and-measure'].task=r.protocols['shapes-space-and-measure'].task.replace('capacity through controlled filling','guess capacity from height'),r=>r.records.find(x=>x.code==='A9.6').topicContributions=r.records.find(x=>x.code==='A9.6').topicContributions.filter(c=>c.topicId!=='mt_vJUa62bxeR'),r=>r.records.find(x=>x.code==='A9.6').topicContributions[1].ageBand=[4,6]]){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r));}
 const lost=structuredClone(contexts);for(const c of lost)if(c.topicId===review.topicId)c.standards=c.standards.filter(k=>!k.endsWith(':ON-K-2026-K-A6.7'));assert.throws(()=>verify(report,lost),/every exact scoped/);
});
test('shared estimation distinguishes an approximation from counting and known-set cardinality',()=>verifyEstimation(topics.get(review.topicId),guides.get(review.topicId)));
test('count-first or known-count rearrangement cannot be scored as an estimation gap',()=>{
 for(const mutate of [g=>g.assess.whatMakesItDiscriminate='A repeated correct count is a gap.',g=>g.assess.responseLevels.gap='Any exact counting is an estimation gap.',g=>g.learn.activities[2].learnerActions[0]='Rearrange the previously counted collection and penalise the unchanged answer.']){const g=structuredClone(guides.get(review.topicId));mutate(g);assert.throws(()=>verifyEstimation(topics.get(review.topicId),g));}
});
