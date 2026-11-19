import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL(`../${f}`,import.meta.url),'utf8');
const report=JSON.parse(read('reports/ontario-grade3-structures-strength-stability-current-overlay-2026-11-13.json'));
const topics=JSON.parse(read('data/topics.json')).topics;
const guides=JSON.parse(read('data/teaching-research.json')).records;
const contexts=JSON.parse(read('data/curriculum-alignments.json')).alignments;
const edges=JSON.parse(read('data/dependencies.json')).dependencies;
function check(r,get=read){
 assert.deepEqual(r.records.map(x=>x.code),['D1','D1.1','D1.2','D2','D2.1','D2.3','D2.4','D2.6','D2.7']);
 for(const row of r.records){
  assert.equal(row.disposition,'Full');assert.equal(row.actualProgrammeOrLearnerEvidenceClaimed,false);assert.equal(row.wholeTopicAwardFromSourceResult,false);
  const md=get('reports/'+row.resource);assert.ok(md.includes(`## ${row.protocolHeading}\n`),'actual independent protocol resolves');
  if(['D1','D2'].includes(row.code))assert.equal(row.independentOverallNotChildRollup,true);
 }
 for(const f of r.boundResources)assert.ok(get('reports/'+f).length>1000,'prior complete resource resolves');
 for(const v of Object.values(r.negativeBoundaries))assert.equal(v,false);
 assert.deepEqual(r.historicalSpecificRowsOutsideFreshRecertification,['D2.2','D2.5']);
 const t=topics.find(t=>t.id===r.newTopicId);assert.equal(t.name,'Supporting loads and stabilising structures');assert.equal(t.type,'CONCEPTUAL');assert.deepEqual([t.ageRangeStart,t.ageRangeEnd],[8,9]);assert.equal(t.evidence.length,4);
 assert.deepEqual(contexts.filter(x=>x.topicId===t.id),[{topicId:t.id,scope:'jurisdiction',country:'CA',region:'Ontario',ageRangeStart:8,ageRangeEnd:9,standards:r.newComponentCodes.map(c=>'the-ontario-curriculum-science-and-technology-20:ON-SCI-2022-G3-'+c)}]);
 assert.equal(edges.filter(x=>x.topicId===t.id||x.prerequisiteId===t.id).length,0);
 const g=guides.find(x=>x.topicId===t.id);assert.equal(g.confidence,'low');assert.ok(g.learn.activities.length>=3);
 for(const a of g.learn.activities){const ref=a.learnerActions[0].match(/Use (reports\/[^#]+)#([^.]*)\./);assert.ok(ref,'guide resource anchor supplied');const body=get(ref[1]);const headings=[...body.matchAll(/^## (.+)$/gm)].map(m=>m[1].toLowerCase().replace(/ /g,'-'));assert.ok(headings.includes(ref[2]),'guide anchor resolves');}
 const md=get('reports/'+r.records[0].resource);for(const phrase of ['top edge to the right','AC tends to lengthen','DB tends to shorten','leftward','same','floating','whole-path operational support','woodpecker','root'])assert.match(md.toLowerCase(),new RegExp(phrase.toLowerCase()),'whole relation/protocol retained: '+phrase);
}
test('structure nine duties bind independent performances, one whole conceptual claim and six scoped components',()=>check(report));
test('source/guide refs and false whole/local/strength transfer fail while square shear mechanics remain coherent',()=>{
 assert.throws(()=>check(report,f=>read(f).replace('## D2 independent overall','## deleted')),/protocol resolves/);
 assert.throws(()=>check(report,f=>read(f).replace('## Reproducible original model resources and first teaching','## deleted')),/anchor resolves/);
 for(const k of Object.keys(report.negativeBoundaries)){const m=structuredClone(report);m.negativeBoundaries[k]=true;assert.throws(()=>check(m));}
 const m=structuredClone(report);m.records.find(x=>x.code==='D2').independentOverallNotChildRollup=false;assert.throws(()=>check(m));
 const baseline=Math.hypot(10,10);for(const shift of [1,2,3]){assert.ok(Math.hypot(10+shift,10)>baseline);assert.ok(Math.hypot(10-shift,10)<baseline);/* Reversing shear swaps which named diagonal lengthens. */assert.ok(Math.hypot(-10-shift,10)>baseline);}
});
