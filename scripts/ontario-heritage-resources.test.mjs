import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
test('heritage source-fit protocols resolve actual claims, cases and mapping contributions',()=>{
 const dossier=load('../reports/ontario-grade2-heritage-resource-review-2026-11-10.json');
 const topics=new Set(load('../data/topics.json').topics.map(t=>t.id));
 const mapping=load('../reports/ontario-grade2-social-studies-mapping-2026-11-10.json');
 const cases=new Set(dossier.cases.map(c=>c.caseId));
 for(const p of dossier.protocols){
  for(const id of p.existingTopics)assert.ok(topics.has(id));
  for(const id of p.caseIds)assert.ok(cases.has(id));
  for(const code of p.sourceCodes){
   const row=mapping.records.find(r=>r.officialCode===code);assert.ok(row);
   assert.equal(row.assessmentProtocol,p.id);
   for(const id of p.existingTopics)assert.ok(row.contributions.some(c=>c.topicId===id));
  }
 }
 for(const c of dossier.cases)assert.equal(new URL(c.source).protocol,'https:');
});
