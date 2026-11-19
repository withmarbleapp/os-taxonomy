import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-core4-french-pilot-2026-11-10.json');
test('French pilot references actual retained Core4 codes and matching scoped contributions',()=>{
 const source=load('../data/curriculum-standards.json').curricula.find(c=>c.slug==='the-ontario-curriculum-french-as-a-second-langua');
 const keys=new Set(source.topics.map(t=>t.key));
 const contexts=load('../data/curriculum-alignments.json').alignments;
 const protocols=new Map(report.assessmentProtocols.map(p=>[p.id,p]));
 for(const row of report.records){assert.ok(keys.has(row.key));
  for(const contribution of row.contributions){
   assert.ok(contexts.some(c=>c.topicId===contribution.topicId&&c.country==='CA'&&c.region==='Ontario'&&c.ageRangeStart===9&&c.ageRangeEnd===10&&c.standards.includes(row.key)));
   assert.equal(protocols.get(contribution.assessmentProtocol)?.topicId,contribution.topicId);
  }
  if(row.disposition==='Partial')assert.ok(row.remainingConditions.length);
 }
});
test('adopted community cards retain resolvable IDs with the reviewed protocol and attribution',()=>{
 const topics=new Map(load('../data/topics.json').topics.map(t=>[t.id,t]));
 for(const card of report.cards){assert.ok(topics.has(card.id));assert.ok(report.assessmentProtocols.some(p=>p.topicId===card.id));}
 assert.equal(new URL(report.relatedWork.pullRequest).pathname,'/withmarbleapp/os-taxonomy/pull/23');
 for(const url of report.phoneticReferences)assert.equal(new URL(url).protocol,'https:');
});

const current=load('../reports/ontario-core4-french-oral-design-2026-11-10.json');
const alignments=load('../data/curriculum-alignments.json').alignments;
const expectedProtocols={
 A1:['fr-corpus','fr-listening-cycle','fr-directions'],
 'A1.1':['fr-listening-cycle','fr-directions'],
 'A1.2':['fr-corpus','fr-listening-cycle','fr-directions'],
 B1:['fr-corpus','fr-connected-message','fr-purpose-and-listener'],
 'B1.1':['fr-connected-message','fr-purpose-and-listener'],
 'B1.2':['fr-corpus','fr-connected-message','fr-directions'],
 'B1.3':['fr-corpus','fr-connected-message','fr-purpose-and-listener'],
};
function checkCurrent(r,contexts){
 const source=load('../data/curriculum-standards.json').curricula.find(c=>c.slug==='the-ontario-curriculum-french-as-a-second-langua');
 const keys=new Set(source.topics.map(t=>t.key));
 const topics=new Set(load('../data/topics.json').topics.map(t=>t.id));
 assert.deepEqual(r.records.map(row=>row.officialCode).sort(),Object.keys(expectedProtocols).sort(),'selected source codes');
 const protocols=new Map(r.protocols.map(p=>[p.id,p]));
 assert.equal(protocols.size,r.protocols.length,'duplicate protocol');
 const pairs=new Set(), selected=new Set();
 for(const row of r.records){
  assert.equal(row.key,`the-ontario-curriculum-french-as-a-second-langua:ON-FSL-2013-G4-CORE-${row.officialCode}`);
  assert.ok(keys.has(row.key)); selected.add(row.key);
  assert.deepEqual(row.assessmentProtocols,expectedProtocols[row.officialCode],'source protocol binding');
  for(const id of row.assessmentProtocols){
   const p=protocols.get(id); assert.ok(p,'unknown protocol');
   assert.ok(p.materials.length&&p.checks.length,'missing task design');
  }
  assert.equal(row.disposition,'Full'); assert.deepEqual(row.remainingConditions,[]);
  assert.ok(row.contributions.length);
  for(const c of row.contributions){
   assert.ok(topics.has(c.topicId),'unknown contributing topic'); assert.equal(c.role,'component');
   const key=JSON.stringify([c.topicId,row.key]); assert.ok(!pairs.has(key),'duplicate contribution'); pairs.add(key);
  }
 }
 const actual=new Set(), holders=new Set(); let scopeCount=0;
 for(const c of contexts){
  const codes=c.standards.filter(k=>selected.has(k)); if(!codes.length)continue;
  assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',9,10],'selected source context');
  scopeCount++; holders.add(c.topicId);
  for(const k of codes)actual.add(JSON.stringify([c.topicId,k]));
 }
 assert.deepEqual(actual,pairs,'current report contributions differ from scoped data');
 assert.equal(pairs.size,30); assert.equal(holders.size,9); assert.equal(scopeCount,9);
 assert.equal(r.summary.selectedRecords,r.records.length); assert.equal(r.summary.FullAuthoringDesign,r.records.length);
 assert.equal(r.summary.totalPairs,pairs.size); assert.equal(r.summary.totalScopedContexts,scopeCount);
}
test('current French oral report binds all seven source positions, protocols, thirty pairs and exact scopes',()=>{
 checkCurrent(current,alignments);
});
test('current French report guard rejects missing pairs and wrong valid protocols, while allowing unrelated growth',()=>{
 const missing=structuredClone(alignments), key=current.records.find(r=>r.officialCode==='A1.1').key;
 const context=missing.find(c=>c.topicId==='mt_mLPEMpYb_R'&&c.standards.includes(key));
 context.standards=context.standards.filter(k=>k!==key);
 assert.throws(()=>checkCurrent(current,missing),/current report contributions/);
 const broken=structuredClone(current); broken.protocols=broken.protocols.filter(p=>p.id!=='fr-listening-cycle');
 assert.throws(()=>checkCurrent(broken,alignments),/unknown protocol/);
 const wrong=structuredClone(current); wrong.records.find(r=>r.officialCode==='B1.3').assessmentProtocols=['fr-directions'];
 assert.throws(()=>checkCurrent(wrong,alignments),/source protocol binding/);
 const totals=structuredClone(current); totals.summary.totalPairs=10;
 assert.throws(()=>checkCurrent(totals,alignments));
 checkCurrent(current,[...alignments,{topicId:'unrelated-future-topic',scope:'jurisdiction',country:'CA',region:'Ontario',ageRangeStart:8,ageRangeEnd:9,standards:['unrelated:future-code']}]);
});
