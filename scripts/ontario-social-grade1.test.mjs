import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const mapping=load('../reports/ontario-grade1-social-studies-mapping-2026-11-10.json');
const topics=new Map(load('../data/topics.json').topics.map(t=>[t.id,t]));
const contexts=load('../data/curriculum-alignments.json').alignments;

test('Social Studies review accounts for selected catalogue codes and published contributions without freezing future links',()=>{
  const source=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===mapping.source);
  const expected=source.topics.filter(t=>t.code.includes('-G1-')).map(t=>t.key).sort();
  assert.deepEqual(mapping.records.map(r=>r.key).sort(),expected);
  const tally={};
  for(const row of mapping.records){
    tally[row.disposition]=(tally[row.disposition]??0)+1;
    for(const contribution of row.contributions){
      assert.ok(topics.has(contribution.topicId));
      assert.ok(contexts.some(c=>c.topicId===contribution.topicId&&c.country==='CA'&&c.region==='Ontario'&&c.ageRangeStart===6&&c.ageRangeEnd===7&&c.standards.includes(row.key)));
    }
    if(row.disposition==='Full')assert.deepEqual(row.remainingConditions,[]);
    else assert.ok(row.remainingConditions.length);
  }
  for(const [kind,count] of Object.entries(tally))assert.equal(mapping.summary[kind],count);
});

test('source-specific assessment protocols resolve bidirectionally to reviewed records',()=>{
  const protocols=new Map(mapping.assessmentProtocols.map(p=>[p.id,p]));
  assert.equal(protocols.size,mapping.assessmentProtocols.length);
  for(const row of mapping.records){
    if(row.assessmentProtocol){
      const protocol=protocols.get(row.assessmentProtocol);
      assert.ok(protocol);
      assert.ok(protocol.sourceCodes.includes(row.officialCode));
    }
  }
  for(const protocol of protocols.values()){
    for(const code of protocol.sourceCodes){
      const row=mapping.records.find(r=>r.officialCode===code);
      assert.ok(row);
      assert.equal(row.assessmentProtocol,protocol.id);
    }
  }
});
