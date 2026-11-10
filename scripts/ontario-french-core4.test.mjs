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
