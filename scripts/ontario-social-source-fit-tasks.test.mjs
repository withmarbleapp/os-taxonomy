import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
test('Social source-fit task codes and existing-claim references resolve consistently',()=>{
 const dossier=load('../reports/ontario-grade1-social-source-fit-tasks-2026-11-10.json');
 const mapping=load('../reports/ontario-grade1-social-studies-mapping-2026-11-10.json');
 const ids=new Set(load('../data/topics.json').topics.map(t=>t.id));
 const protocols=new Set();
 for(const p of dossier.protocols){assert.ok(!protocols.has(p.id));protocols.add(p.id);
  for(const id of p.existingTopics)assert.ok(ids.has(id));
  for(const code of p.sourceCodes){const row=mapping.records.find(r=>r.officialCode===code);assert.ok(row);assert.equal(row.assessmentProtocol,p.id);assert.ok(mapping.assessmentProtocols.some(x=>x.id===p.id));}
  for(const c of p.sourceCases??[])for(const url of c.urls)assert.equal(new URL(url).protocol,'https:');
 }
});
