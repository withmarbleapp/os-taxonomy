import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const d=load('../reports/ontario-grade2-world-reference-claims-2026-11-10.json');
test('world-reference protocol resolves its source row and all participating claims',()=>{
 const t=new Map(load('../data/topics.json').topics.map(t=>[t.id,t]));
 const q=load('../reports/ontario-grade2-social-studies-mapping-2026-11-10.json');
 for(const id of d.assessmentProtocol.existingAndNewTopics)assert.ok(t.has(id));
 for(const code of d.assessmentProtocol.sourceCodes){const r=q.records.find(r=>r.officialCode===code);assert.ok(r);assert.equal(r.assessmentProtocol,d.assessmentProtocol.id);}
 assert.equal(d.poleCorrection.before.id,d.poleCorrection.after.id);
 assert.ok(t.has(d.poleCorrection.after.id));
 for(const c of d.newCards)assert.ok(t.has(c.id));
 for(const url of Object.values(d.references))assert.equal(new URL(url).protocol,'https:');
});
