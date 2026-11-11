import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));
const report=read('reports/ontario-hpe-minor-care-claim-2026-11-11.json');
const alignments=read('data/curriculum-alignments.json').alignments;
const topics=read('data/topics.json').topics;
const guides=read('data/teaching-research.json').records;
const edges=read('data/dependencies.json').dependencies;
function qualify(r=report){
 assert.equal(r.cases.length,3);
 const by=new Map(r.cases.map(c=>[c.id,c]));
 const scrape=by.get('adult-declared-small-scrape'), bruise=by.get('adult-declared-small-bruise'), warning=by.get('changed-warning-case');
 assert.equal(scrape.adultHasDeterminedMinor,true);assert.equal(bruise.adultHasDeterminedMinor,true);
 assert.deepEqual(scrape.careOrder,['obtain-adult-help','clean-hands','control-minor-bleeding-as-appropriate','rinse-after-bleeding-controlled','suitable-protective-dressing']);
 assert.deepEqual(bruise.careOrder,['obtain-adult-help','comfortable-support','wrapped-cold-compress','adult-controls-duration-and-comfort']);
 assert.deepEqual(warning.features,['embedded-object','uncontrolled-bleeding','deep-wound','possible-head-injury']);
 assert.equal(warning.response,'prompt-adult-professional-help-and-local-procedure');
 for(const k of ['removeObject','pressOnObject','independentDiagnosis'])assert.equal(warning[k],false);
 assert.ok(r.cases.every(c=>c.knowledgeOnly===true));
 for(const k of ['fictionalOrIllustratedOnly','noActualWoundsOrBloodContact','noMedicines','noDiagnosis','noIndependentTreatmentCertification','noIndefiniteCooling'])assert.equal(r.assessmentBoundaries[k],true);
}
test('minor-care cases retain different appropriate methods and the warning boundary',()=>qualify());
test('an otherwise valid bruise method cannot replace skin-wound care',()=>{const r=structuredClone(report);r.cases[0].careOrder=r.cases[1].careOrder;assert.throws(()=>qualify(r));});
test('cleaning before bleeding control is not accepted by a case-count check',()=>{const r=structuredClone(report);[r.cases[0].careOrder[2],r.cases[0].careOrder[3]]=[r.cases[0].careOrder[3],r.cases[0].careOrder[2]];assert.throws(()=>qualify(r));});
test('embedded-object removal, pressure or clinical inference cannot pass the warning case',()=>{for(const key of ['removeObject','pressOnObject','independentDiagnosis']){const r=structuredClone(report);r.cases[2][key]=true;assert.throws(()=>qualify(r));}});
test('indefinite cooling or actual-wound assessment cannot replace conceptual boundaries',()=>{for(const key of ['noIndefiniteCooling','noActualWoundsOrBloodContact']){const r=structuredClone(report);r.assessmentBoundaries[key]=false;assert.throws(()=>qualify(r));}});
test('one minimal Grade6 knowledge association adds no diagnostic or anatomy hard gate',()=>{
 const rows=alignments.filter(r=>r.topicId===report.topicId);
 assert.equal(rows.length,1);assert.deepEqual(rows[0],{topicId:report.topicId,scope:'jurisdiction',country:'CA',region:'Ontario',ageRangeStart:11,ageRangeEnd:12,standards:['the-ontario-curriculum-health-and-physical-educa:ON-HPE-2019-G6-B3.2']});
 assert.equal(topics.find(t=>t.id===report.topicId).type,'CONCEPTUAL');
 assert.equal(guides.find(g=>g.topicId===report.topicId).confidence,'low');
 assert.equal(edges.filter(e=>e.topicId===report.topicId).length,0);
});
