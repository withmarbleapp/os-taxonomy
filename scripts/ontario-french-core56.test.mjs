import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-core56-french-shared-design-2026-11-10.json'),contexts=load('../data/curriculum-alignments.json').alignments;
const priorNames=['oral','interaction','textforms','reading','writing'];
const priorRows=priorNames.flatMap(name=>{const file=`ontario-core4-french-${name}-design-2026-11-10.json`,d=load(`../reports/${file}`);return d.records.map(row=>({code:row.code??row.officialCode,topicIds:row.topicIds??row.contributions.map(c=>c.topicId),priorDesign:file,priorProtocolIds:row.protocolIds??row.assessmentProtocols}));});
function verify(r,alignments){
 assert.equal(priorRows.length,32);assert.equal(r.records.length,64);assert.equal(new Set(r.records.map(x=>x.key)).size,64);
 const source=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===r.source.catalogue),pairs=new Set();
 for(const grade of [5,6]){
  const prefix=`${r.source.catalogue}:ON-FSL-2013-G${grade}-CORE-`,keys=source.topics.map(x=>x.key).filter(k=>k.startsWith(prefix)&&!/[ABCD]3(?:\.|$)/.test(k.slice(prefix.length))).sort();assert.equal(keys.length,32);
  const selected=r.records.filter(x=>x.grade===grade);assert.deepEqual(selected.map(x=>x.key).sort(),keys,'complete selected source identities');
  for(const row of selected){
   const prior=priorRows.find(x=>x.code===row.code);assert.ok(prior);assert.equal(row.key,prefix+row.code);assert.deepEqual(row.ageBand,[grade+5,grade+6]);assert.equal(row.disposition,'Full');assert.equal(row.role,'component');assert.deepEqual(row.remainingConditions,[]);assert.equal(row.wholePriorTaskRequired,true,'whole prior task required');
   for(const field of ['topicIds','priorDesign','priorProtocolIds'])assert.deepEqual(row[field],prior[field],'exact unchanged whole-claim/task binding');
   const d=load(`../reports/${row.priorDesign}`);for(const id of row.priorProtocolIds)assert.ok(Array.isArray(d.protocols)?d.protocols.some(x=>x.id===id):d.protocols[id]);
   assert.deepEqual(row.performanceProtocolIds,[`core${grade}-source-adaptations`]);for(const id of row.topicIds)pairs.add(JSON.stringify([id,row.key]));
  }
  const p=r.protocols[`core${grade}-source-adaptations`];assert.deepEqual(p.sourceCodes.slice().sort(),priorRows.map(x=>x.code).sort(),'complete adaptation source duties');assert.deepEqual(p.ageBand,[grade+5,grade+6]);assert.equal(p.grade,grade);
  const c=p.performanceConditions;assert.equal(c.language,'French');assert.deepEqual(c.channels,['listening','speaking','reading','writing']);
  for(const key of ['retainedPriorWholeProtocols','actualFreshPerformanceRequired','selfFamilyFriendsEnvironmentTopics','teacherAndPeerInteractions','teacherAndPeerChannelReflection','adaptedAndAuthenticFourTextCategories','fourWritingModesAndFullProcess','noGradeClone'])assert.equal(c[key],true,key);
  for(const key of ['listeningNewWordContext','listeningBarrierFactorsDiscussed','guidedUnscriptedPartnerReplies','recentlyLearnedReadingWordCheck','writtenConventionRange'])assert.equal(c[key],grade===6,`grade-specific ${key}`);
 }
 const actual=new Set();for(const c of alignments)for(const k of c.standards){if(!new Set(r.records.map(x=>x.key)).has(k))continue;const row=r.records.find(x=>x.key===k);assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',...row.ageBand]);actual.add(JSON.stringify([c.topicId,k]));}assert.deepEqual(actual,pairs,'exact source associations');assert.equal(pairs.size,182);assert.deepEqual([r.scope.records,r.scope.perGrade,r.scope.componentPairs,r.scope.reusedTopics,r.scope.newTopics,r.scope.remainingCultureRecords],[64,32,182,26,0,24]);
 const n=r.resources['new-word-listening'];assert.ok(n?.body?.includes('plateau')&&n.body.includes('jeton'),'actual heard French new-word resource');assert.match(n.preparation,/genuinely new/,'actual novelty condition');assert.match(n.check,/purpose/);
 const open=r.resources['guided-peer-teacher-interaction'];assert.ok(open?.task?.includes('unrehearsed')&&open.task.includes('teacher'),'actual guided reply resource');
 assert.deepEqual(r.source.courses.map(x=>x.name),['FSL - Core - Grade 5','FSL - Core - Grade 6'],'actual course identity rather than delivery codename');
}
test('Core French Grades5–6 reuse whole existing operations with explicit changed source duties',()=>verify(report,contexts));
test('Core French rejects missing source/pair, wrong valid protocol, lost Grade6 conditions and culture overreach',()=>{
 const mutations=[r=>r.records.pop(),r=>r.records[0].priorDesign='ontario-core4-french-writing-design-2026-11-10.json',r=>r.records[0].wholePriorTaskRequired=false,r=>r.protocols['core6-source-adaptations'].performanceConditions.listeningNewWordContext=false,r=>r.protocols['core6-source-adaptations'].performanceConditions.guidedUnscriptedPartnerReplies=false,r=>r.protocols['core6-source-adaptations'].performanceConditions.listeningBarrierFactorsDiscussed=false,r=>delete r.resources['new-word-listening'],r=>r.resources['new-word-listening'].preparation='Treat every word as previously taught.',r=>r.records[0].key=r.records[0].key.replace('-A1','-A3')];
 for(const mutate of mutations){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r,contexts));}
 const lost=structuredClone(contexts);for(const c of lost)c.standards=c.standards.filter(k=>k!==report.records[0].key);assert.throws(()=>verify(report,lost),/exact source associations/);
});
