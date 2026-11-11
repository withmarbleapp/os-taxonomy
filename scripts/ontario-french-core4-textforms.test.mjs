import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-core4-french-textforms-design-2026-11-10.json');
const contexts=load('../data/curriculum-alignments.json').alignments;
const expected={C2:['mt_HF1t82HCJu','mt_aVZJhPbc_1'],'C2.1':['mt_HF1t82HCJu'],'C2.2':['mt_aVZJhPbc_1'],'C2.3':['mt_v5yDTWEiyQ','mt_cJjnPjuvCU']};
function verify(r,alignments){
 const catalogue=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===r.source.catalogue);
 const keys=new Set(catalogue.topics.map(t=>t.key)),topics=new Set(load('../data/topics.json').topics.map(t=>t.id));
 assert.deepEqual(r.records.map(row=>row.code).sort(),Object.keys(expected).sort());
 const selected=new Set(),pairs=new Set();
 for(const row of r.records){
  assert.equal(row.key,`${r.source.catalogue}:ON-FSL-2013-G4-CORE-${row.code}`);assert.ok(keys.has(row.key));selected.add(row.key);
  assert.equal(row.disposition,'Full');assert.equal(row.role,'component');assert.deepEqual(row.remainingConditions,[]);
  assert.deepEqual(row.topicIds,expected[row.code]);
  const protocol=row.code==='C2.3'?'reading-strategy-review':'purposes-and-features';
  assert.deepEqual(row.protocolIds,[protocol],'source protocol binding');assert.ok(r.protocols[protocol].codes.includes(row.code));
  for(const id of row.topicIds){assert.ok(topics.has(id));const pair=JSON.stringify([id,row.key]);assert.ok(!pairs.has(pair));pairs.add(pair);}
 }
 const actual=new Set(),holders=new Set();
 for(const c of alignments){const matches=c.standards.filter(k=>selected.has(k));if(!matches.length)continue;
  assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',9,10]);holders.add(c.topicId);
  for(const key of matches)actual.add(JSON.stringify([c.topicId,key]));
 }
 assert.deepEqual(actual,pairs,'scoped source pairs');assert.equal(pairs.size,6);assert.equal(holders.size,4);
 assert.deepEqual([r.scope.records,r.scope.componentPairs,r.scope.reusedTopics],[4,6,4]);
 const p=r.protocols['purposes-and-features'];assert.deepEqual(p.performanceConditions.families,['fictional','informational','graphic','media']);
 assert.deepEqual(p.performanceConditions.resourceKinds,['adapted','authentic'],'authentic and adapted resources');
 assert.deepEqual(p.performanceConditions.wholeFeatureChannels,['language-choice','structure','presentation']);
 const resources=new Map(r.resources.map(v=>[v.id,v]));assert.equal(resources.size,r.resources.length);
 assert.deepEqual(p.resourceIds,['original-adapted-packet','authentic-graphic-calendar','authentic-information-and-media']);
 for(const id of p.resourceIds)assert.ok(resources.has(id),'missing actual resource');
 assert.equal(new URL(resources.get('authentic-graphic-calendar').url).hostname,'www.ecolecatholique.ca');
 assert.equal(new URL(resources.get('authentic-information-and-media').url).hostname,'about.biblioottawalibrary.ca');
 const review=r.protocols['reading-strategy-review'];assert.deepEqual(review.performanceConditions.phases,['before','during','after']);
 assert.deepEqual(review.performanceConditions.discussionPartners,['teacher','peer']);assert.equal(review.performanceConditions.channel,'reading-distinct-from-listening-and-speaking');
}
test('French text-form source design binds four records, exact pairs, actual resources and reading reflection',()=>verify(report,contexts));
test('French form guard rejects missing data, lost authentic forms and missing resource bodies',()=>{
 const missing=structuredClone(contexts),key=report.records.find(r=>r.code==='C2.2').key;
 const c=missing.find(c=>c.topicId==='mt_aVZJhPbc_1'&&c.standards.includes(key));c.standards=c.standards.filter(k=>k!==key);
 assert.throws(()=>verify(report,missing),/scoped source pairs/);
 const lost=structuredClone(report);lost.protocols['purposes-and-features'].performanceConditions.resourceKinds=['adapted'];assert.throws(()=>verify(lost,contexts),/authentic and adapted/);
 const resource=structuredClone(report);resource.resources=resource.resources.filter(r=>r.id!=='authentic-graphic-calendar');assert.throws(()=>verify(resource,contexts),/missing actual resource/);
 const wrong=structuredClone(report);wrong.records.find(r=>r.code==='C2.3').protocolIds=['purposes-and-features'];assert.throws(()=>verify(wrong,contexts),/source protocol binding/);
});
