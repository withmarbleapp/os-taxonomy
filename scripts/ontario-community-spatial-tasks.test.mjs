import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
test('community/spatial task codes and claim references resolve to the reviewed mapping',()=>{
 const d=load('../reports/ontario-grade1-community-spatial-tasks-2026-11-10.json');
 const m=load('../reports/ontario-grade1-social-studies-mapping-2026-11-10.json');
 const topics=new Set(load('../data/topics.json').topics.map(t=>t.id));
 for(const p of d.protocols){
  for(const id of p.existingTopics)assert.ok(topics.has(id));
  for(const code of p.sourceCodes){const row=m.records.find(r=>r.officialCode===code);assert.ok(row);assert.equal(row.assessmentProtocol,p.id);assert.ok(m.assessmentProtocols.some(x=>x.id===p.id));}
  for(const source of p.sources??[])assert.equal(new URL(source.url).protocol,'https:');
 }
});
