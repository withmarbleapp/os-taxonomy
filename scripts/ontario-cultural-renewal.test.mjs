import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const dossier=load('../reports/ontario-cultural-renewal-claim-2026-11-10.json');

test('renewal dossier case references resolve and the source protocol is linked to the reviewed expectation',()=>{
  const cases=new Map(dossier.cases.map(c=>[c.caseId,c]));
  assert.equal(cases.size,dossier.cases.length);
  for(const id of dossier.assessmentProtocol.caseIds){
    const row=cases.get(id);assert.ok(row);
    assert.ok(row.urls.length);
    for(const url of row.urls)assert.equal(new URL(url).protocol,'https:');
  }
  const mapping=load('../reports/ontario-grade1-social-studies-mapping-2026-11-10.json');
  for(const code of dossier.assessmentProtocol.sourceCodes){
    const row=mapping.records.find(r=>r.officialCode===code);assert.ok(row);
    assert.equal(row.assessmentProtocol,dossier.assessmentProtocol.id);
    assert.ok(row.contributions.some(c=>c.topicId===dossier.newTopic.id));
  }
});

test('published renewal contribution resolves at its source interval without asserting a fixed total of future links',()=>{
  const contexts=load('../data/curriculum-alignments.json').alignments;
  const source='the-ontario-curriculum-social-studies-history-an';
  for(const code of dossier.sourceContribution.publishedNow){
    assert.ok(contexts.some(c=>c.topicId===dossier.newTopic.id&&c.country==='CA'&&c.region==='Ontario'&&c.ageRangeStart===6&&c.ageRangeEnd===7&&c.standards.includes(`${source}:${code}`)));
  }
});
