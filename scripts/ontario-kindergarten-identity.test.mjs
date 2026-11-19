import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-kindergarten-identity-fairness-design-2026-11-11.json');
const topics=new Map(load('../data/topics.json').topics.map(t=>[t.id,t]));
const contexts=load('../data/curriculum-alignments.json').alignments;
function verify(r,alignments=contexts){
 const codes=Array.from({length:3},(_,i)=>[`D${19+i}`,...Array.from({length:3},(_,j)=>`D${19+i}.${j+1}`)]).flat();assert.deepEqual(r.records.map(x=>x.code),codes);
 const expected=new Set(),actual=new Set();
 for(const row of r.records){assert.equal(row.key,`${r.source.catalogue}:ON-K-2026-K-${row.code}`);assert.equal(row.disposition,'Full');for(const id of row.protocolIds)assert(r.protocols[id]?.task.length>100);for(const c of row.topicContributions){assert(topics.has(c.topicId));assert.equal(c.role,'component');assert.equal(c.wholeClaimAssessmentRetained,true);if(r.ageScopeDecision.topicIds.includes(c.topicId))assert.deepEqual(c.ageBand,[6,6],'explicit whole-fit endpoint, not blanket younger scope');expected.add(JSON.stringify([c.topicId,...c.ageBand,row.key]));}}
 for(const c of alignments)for(const key of c.standards){const tuple=JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]);if(expected.has(tuple)){assert.deepEqual([c.scope,c.country,c.region],['jurisdiction','CA','Ontario']);actual.add(tuple);}}
 assert.equal(expected.size,29);assert.deepEqual(actual,expected,'all exact scoped identity/fairness pairs');
 const binding=r.resources['creator-source-portfolio'];assert.equal(binding.report,'ontario-kindergarten-literacy-design-2026-11-11.json');const portfolio=load(`../reports/${binding.report}`).resources[binding.resourceId];assert.equal(portfolio.works.length,3);
 const identity=r.protocols['identity-belonging-and-perspectives'].task;assert.match(identity,/actual willing peer/);assert.match(identity,/classroom are part of Canadian life/);assert.match(identity,/fictional character alone cannot certify/i);
 const fairness=r.protocols['fairness-bias-and-appropriate-response'].task;assert.match(fairness,/TWO distinct helpful strategies/);assert.match(fairness,/actually distribute/i);assert.match(fairness,/child AND the group/);
 assert.match(r.readinessBoundary,/full social-awareness vocabulary/);assert.match(r.conditions.developmentalAims,/not stable character/);
 assert.equal(r.resources['fairness-case-packet'].cases.length,3);assert.match(r.resources['memberships-and-contributions'].access,/Real willing peer comparison/);
}
test('Kindergarten identity and fairness preserve whole-fit age-six tasks and prerequisite boundaries',()=>verify(report));
test('fictional-only memberships, a verbal allocation story or one kindness answer cannot replace whole duties',()=>{
 for(const mutate of [r=>r.protocols['identity-belonging-and-perspectives'].task='Compare two invented characters.',r=>r.protocols['fairness-bias-and-appropriate-response'].task='Say be kind to everyone.',r=>r.records.find(x=>x.code==='D20.1').topicContributions[0].ageBand=[4,6],r=>r.readinessBoundary='Short tasks certify every prerequisite.',r=>r.resources['creator-source-portfolio'].resourceId='missing']){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r));}
 const lost=structuredClone(contexts);for(const c of lost)if(c.topicId==='mt_HFN1pGASpZ'&&c.ageRangeStart===6)c.standards=c.standards.filter(k=>!k.endsWith(':ON-K-2026-K-D21.3'));assert.throws(()=>verify(report,lost),/all exact scoped/);
});
