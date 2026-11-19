import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-kindergarten-arts-local-design-2026-11-11.json');
const topics=new Map(load('../data/topics.json').topics.map(t=>[t.id,t]));
const contexts=load('../data/curriculum-alignments.json').alignments;
function verify(r,alignments=contexts){
 const codes=['D22','D22.1','D22.2','D23','D23.1','D23.2','D23.3','D24','D24.1','D24.2','D24.3','D25','D25.1','D25.2','D25.3','D25.4'];assert.deepEqual(r.records.map(x=>x.code),codes);
 const expected=new Set(),actual=new Set();
 for(const row of r.records){assert.equal(row.key,`${r.source.catalogue}:ON-K-2026-K-${row.code}`);const local=/^D2[23](\.|$)/.test(row.code);assert.equal(row.disposition,local?'Partial':'Full');assert.equal(row.remainingConditions.length,local?1:0);for(const id of row.protocolIds){const p=r.protocols[id];assert(p?.task.length>100);for(const resource of p.resourceIds)assert(Object.hasOwn(r.resources,resource));}for(const c of row.topicContributions){const t=topics.get(c.topicId);assert(t);assert.deepEqual(c.ageBand,[Math.max(4,t.ageRangeStart),6]);assert.equal(c.role,'component');assert.equal(c.wholeClaimAssessmentRetained,true);expected.add(JSON.stringify([c.topicId,...c.ageBand,row.key]));}}
 for(const c of alignments)for(const key of c.standards){const tuple=JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]);if(expected.has(tuple)){assert.deepEqual([c.scope,c.country,c.region],['jurisdiction','CA','Ontario']);actual.add(tuple);}}
 assert.equal(expected.size,49);assert.deepEqual(actual,expected,'all exact scoped arts/local components');
 const works=r.resources['four-form-portfolio'];assert.deepEqual(Object.keys(works),['dance','music','drama','visual']);assert.match(works.dance.portion,/page8 movement sequence/);assert.match(works.music.portion,/bars3–4/);assert.match(works.music.limits,/does not certify pupil staff notation/);
 const visual=works.visual;const bound=load(`../reports/${visual.report}`).resources[visual.resourceId];assert(bound.works.some(w=>w.id===visual.workId),'actual visual work resolves, not metadata-only replacement');
 const creative=r.resources['original-creative-task'];for(const form of ['dance','drama','music','visual'])assert(creative[form].length>=2,'actual creation and revision in every form');assert(readFileSync(new URL(`../reports/${creative.stimulus}`,import.meta.url),'utf8').includes('A small beginning'));
 assert.equal(r.resources['local-binding-template'].place.actualSource,null);assert.match(r.resources['local-binding-template'].limits,/not a verified local packet/);
}
test('Kindergarten arts uses actual four-form resources while local applicability stays explicit',()=>verify(report));
test('one arts form or an unbound local template cannot silently certify all source duties',()=>{
 for(const mutate of [r=>r.records.find(x=>x.code==='D22.1').disposition='Full',r=>delete r.resources['four-form-portfolio'].dance,r=>r.resources['original-creative-task'].music=[],r=>r.resources['four-form-portfolio'].visual.workId='unread-work',r=>r.resources['four-form-portfolio'].music.portion='Publisher biography.']){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r));}
 const lost=structuredClone(contexts);for(const c of lost)if(c.topicId==='mt_2Kn5ianVWN')c.standards=c.standards.filter(k=>!k.endsWith(':ON-K-2026-K-D25.4'));assert.throws(()=>verify(report,lost),/all exact scoped/);
});
test('the complete Kindergarten review accounts for all retained 127 source records exactly once',()=>{
 const files=['coding-inquiry','mathematics','literacy','health-social','identity-fairness','arts-local'];
 const rows=files.flatMap(f=>load(`../reports/ontario-kindergarten-${f}-design-2026-11-11.json`).records);
 const source=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===report.source.catalogue);
 assert.equal(rows.length,127);assert.equal(new Set(rows.map(r=>r.key)).size,127);assert.deepEqual(new Set(rows.map(r=>r.key)),new Set(source.topics.map(t=>t.key)));
 assert.equal(rows.filter(r=>r.disposition==='Full').length,113);assert.equal(rows.filter(r=>r.disposition==='Partial').length,9);assert.equal(rows.filter(r=>r.disposition==='Out of scope').length,5);
});
