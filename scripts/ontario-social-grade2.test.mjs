import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const mapping=load('../reports/ontario-grade2-social-studies-mapping-2026-11-10.json');
test('Grade2 source rows exactly reconcile to retained catalogue and resolve protocol references',()=>{
 const catalogue=load('../data/curriculum-standards.json').curricula.find(c=>c.slug==='the-ontario-curriculum-social-studies-history-an');
 const expected=catalogue.topics.filter(t=>t.code.startsWith('ON-SSHG-2026-G2-SS-')).map(t=>t.key).sort();
 assert.deepEqual(mapping.records.map(r=>r.key).sort(),expected);
 const protocols=new Map(mapping.assessmentProtocols.map(p=>[p.id,p]));
 for(const row of mapping.records){
  if(row.assessmentProtocol){const p=protocols.get(row.assessmentProtocol);assert.ok(p);assert.ok(p.sourceCodes.includes(row.officialCode));}
  if(row.disposition==='Full')assert.equal(row.remainingConditions.length,0);
  if(row.disposition==='Partial')assert.ok(row.remainingConditions.length);
 }
});
test('every reviewed Grade2 contribution exists in its exact scoped interval',()=>{
 const contexts=load('../data/curriculum-alignments.json').alignments;
 for(const row of mapping.records)for(const c of row.contributions){
  assert.ok(contexts.some(a=>a.topicId===c.topicId&&a.country==='CA'&&a.region==='Ontario'&&a.ageRangeStart===7&&a.ageRangeEnd===8&&a.standards.includes(row.key)),`${row.officialCode}:${c.topicId}`);
 }
});

test('Grade2 composite protocols and source/task dossiers remain resolvable',()=>{
 const ids=new Set(mapping.assessmentProtocols.map(p=>p.id));
 const codes=new Set(mapping.records.map(r=>r.officialCode));
 const topics=new Set(load('../data/topics.json').topics.map(t=>t.id));
 for(const p of mapping.assessmentProtocols){
  for(const ref of p.componentProtocols??[])assert.ok(ids.has(ref),`${p.id}:${ref}`);
  for(const code of p.sourceCodes)assert.ok(codes.has(code));
  if(p.protocolDossier){
   const d=load(`../${p.protocolDossier}`);
   for(const task of d.protocols??[]){
    for(const id of task.existingTopics??[])assert.ok(topics.has(id));
    for(const code of task.sourceCodes??[])assert.ok(codes.has(code));
   }
  }
 }
});
