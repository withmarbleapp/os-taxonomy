import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const dossier=load('../reports/ontario-territory-knowledge-claim-2026-11-10.json');
test('territory protocol case/source references resolve to the published contribution',()=>{
 const cases=new Map(dossier.cases.map(c=>[c.caseId,c]));
 assert.equal(cases.size,dossier.cases.length);
 for(const id of dossier.assessmentProtocol.caseIds){
  const row=cases.get(id);assert.ok(row);assert.ok(row.resources.length);
  for(const resource of row.resources){assert.equal(new URL(resource.url).protocol,'https:');assert.ok(resource.role);}
 }
 const mapping=load('../reports/ontario-grade1-social-studies-mapping-2026-11-10.json');
 for(const code of dossier.assessmentProtocol.sourceCodes){
  const row=mapping.records.find(r=>r.officialCode===code);assert.ok(row);
  assert.equal(row.assessmentProtocol,dossier.assessmentProtocol.id);
  assert.ok(row.contributions.some(c=>c.topicId===dossier.newTopic.id));
 }
});
test('territory source contributions resolve in their exact reviewed interval',()=>{
 const contexts=load('../data/curriculum-alignments.json').alignments;
 for(const code of dossier.sourceContribution.publishedNow){
  assert.ok(contexts.some(c=>c.topicId===dossier.newTopic.id&&c.country==='CA'&&c.region==='Ontario'&&c.ageRangeStart===6&&c.ageRangeEnd===7&&c.standards.includes(`the-ontario-curriculum-social-studies-history-an:${code}`)));
 }
});
