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

test('shared role claim and source-specific self-application protocol keep independent conditions explicit',()=>{
  const id=mapping.claimCuration.newTopicId;
  assert.ok(topics.has(id));
  const edges=load('../data/dependencies.json').dependencies;
  assert.ok(!edges.some(e=>e.topicId===id));
  const research=load('../data/teaching-research.json').records.find(r=>r.topicId===id);
  assert.equal(research.confidence,'low');
  assert.match(topics.get(id).description,/people and the environment/);
  assert.match(topics.get(id).assessmentPrompt,/same child/);
  assert.match(topics.get(id).assessmentPrompt,/plants need water when soil is dry/);
  for(const code of ['A1.2','A3.1']){
    const row=mapping.records.find(r=>r.officialCode===code);
    assert.ok(mapping.assessmentProtocols.some(p=>p.id===row.assessmentProtocol&&p.sourceCodes.includes(code)));
  }
  const protocol=mapping.assessmentProtocols.find(p=>p.id==='social-role-self-application');
  assert.match(protocol.coverageBoundary,/not a learner-performance study/);
  assert.match(protocol.rubric.nearMiss,/fictional example/);
  assert.ok(mapping.records.find(r=>r.officialCode==='B3.1').candidateOnly.some(c=>c.topicId==='mt_l-3JUgI80b'));
});
