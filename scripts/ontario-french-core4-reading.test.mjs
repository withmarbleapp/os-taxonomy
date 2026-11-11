import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-core4-french-reading-design-2026-11-10.json');
const contexts=load('../data/curriculum-alignments.json').alignments;
const edges=load('../data/dependencies.json').dependencies;
const expressionFile='expressive-reading-prerequisite-review-2026-11-11.json';
const expression=load(`../reports/${expressionFile}`);
const expected={C1:['mt_RNYNrRMqKL','mt_OlhMP7ShFT','mt_6-MYToNZ39','mt_V-ldQp56bF','mt_YKkCM63fSC'],'C1.1':['mt_RNYNrRMqKL','mt_OlhMP7ShFT','mt_6-MYToNZ39'],'C1.2':['mt_OlhMP7ShFT'],'C1.3':['mt_V-ldQp56bF','mt_YKkCM63fSC'],'C1.4':['mt_6-MYToNZ39']};
function verify(r,alignments,dependencies){
 const catalogue=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===r.source.catalogue),keys=new Set(catalogue.topics.map(t=>t.key));
 assert.deepEqual(r.records.map(x=>x.code).sort(),Object.keys(expected).sort());
 const selected=new Set(),pairs=new Set();
 for(const row of r.records){
  assert.equal(row.key,`${r.source.catalogue}:ON-FSL-2013-G4-CORE-${row.code}`);assert.ok(keys.has(row.key));selected.add(row.key);
  assert.equal(row.disposition,'Full');assert.equal(row.role,'component');assert.deepEqual(row.remainingConditions,[]);assert.deepEqual(row.topicIds,expected[row.code]);
  const pid=row.code==='C1.3'?'fluent-familiar-reading':row.code==='C1.4'?'new-word-meaning':'meaning-and-strategies';
  assert.deepEqual(row.protocolIds,[pid],'source protocol binding');assert.ok(r.protocols[pid].codes.includes(row.code));
  for(const id of row.topicIds)pairs.add(JSON.stringify([id,row.key]));
 }
 const actual=new Set();for(const c of alignments){const matching=c.standards.filter(k=>selected.has(k));if(!matching.length)continue;
  assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',9,10]);for(const k of matching)actual.add(JSON.stringify([c.topicId,k]));
 }
 assert.deepEqual(actual,pairs,'exact scoped pairs');assert.equal(pairs.size,12);assert.deepEqual([r.scope.records,r.scope.componentPairs,r.scope.reusedTopics,r.scope.newTopics],[5,12,5,0]);
 const p=r.protocols;for(const id of ['meaning-and-strategies','new-word-meaning'])assert.deepEqual(p[id].performanceConditions.phases,['before','during','after'],'strategy phases');
 assert.equal(p['meaning-and-strategies'].performanceConditions.channel,'actual-French-print');assert.deepEqual(p['meaning-and-strategies'].performanceConditions.variety,['narrative','information','graphic-instructions']);
 const f=p['fluent-familiar-reading'].performanceConditions;
 assert.equal(f.language,'French');assert.equal(f.sightBankSize,26);assert.equal(f.wholeConnectedTextAccuracyMinimum,0.90);assert.equal(f.reread,true);assert.equal(f.understandingRequired,true,'meaning required');assert.equal(f.allEnglishPhonemesRequired,false);assert.equal(f.alphabetNamesNotInferred,true);
 assert.equal(r.resources.sightWordBank.length,26);assert.equal(new Set(r.resources.sightWordBank).size,26);
 const corpus=[...r.resources.originalStory.pages,...r.resources.additionalConnectedSentences].join(' ').toLocaleLowerCase('fr');
 for(const word of r.resources.sightWordBank)assert.ok(new RegExp(`(?:^|[^\\p{L}])${word}(?:$|[^\\p{L}])`,'u').test(corpus),'word bank in connected text');
 assert.deepEqual(p['new-word-meaning'].performanceConditions.unknownWords,['minuscule','récipient']);assert.equal(p['new-word-meaning'].performanceConditions.confirmationRequired,true);
 assert.deepEqual(r.dependencyReview.changes.map(c=>[c.before.topicId,c.before.prerequisiteId]),[['mt_ZhvwM6LMBL','mt__KHQttMde3'],['mt_YKkCM63fSC','mt_frDIaXzWbx']],'exact intrinsic gates');
 for(const c of r.dependencyReview.changes){assert.equal(c.before.strength,'hard');assert.equal(c.after.strength,'soft');assert.deepEqual(dependencies.find(e=>e.topicId===c.after.topicId&&e.prerequisiteId===c.after.prerequisiteId),c.after,'reviewed gate');}
 assert.equal(r.dependencyReview.currentWholePrerequisiteReview?.report,expressionFile,'registered expressive prerequisite report');
 assert.deepEqual(dependencies.find(e=>e.topicId==='mt_V-ldQp56bF'&&e.prerequisiteId==='mt_ZhvwM6LMBL'),expression.changes[0].after,'registered expressive prerequisite');
 for(const [id,prerequisiteId]of [['mt_ZhvwM6LMBL','mt_YKkCM63fSC'],['mt_ZhvwM6LMBL','mt_1KCwbGvm1F']])assert.equal(dependencies.find(e=>e.topicId===id&&e.prerequisiteId===prerequisiteId)?.strength,'hard','retained whole-target prerequisite');
}
test('French reading binds five sources, whole French performances, connected word corpus and exact gate corrections',()=>verify(report,contexts,edges));
test('French reading rejects lost source, meaning, corpus and prerequisite checks',()=>{
 const missing=structuredClone(contexts),key=report.records.find(r=>r.code==='C1.3').key;for(const c of missing)c.standards=c.standards.filter(k=>k!==key);assert.throws(()=>verify(report,missing,edges),/exact scoped pairs/);
 const meaning=structuredClone(report);meaning.protocols['fluent-familiar-reading'].performanceConditions.understandingRequired=false;assert.throws(()=>verify(meaning,contexts,edges),/meaning required/);
 const corpus=structuredClone(report);corpus.resources.sightWordBank[0]='absentword';assert.throws(()=>verify(corpus,contexts,edges),/word bank in connected text/);
 const gate=structuredClone(edges);gate.find(e=>e.topicId==='mt_YKkCM63fSC'&&e.prerequisiteId==='mt_frDIaXzWbx').strength='hard';assert.throws(()=>verify(report,contexts,gate),/reviewed gate/);
 const expressionGate=structuredClone(edges);expressionGate.find(e=>e.topicId==='mt_V-ldQp56bF'&&e.prerequisiteId==='mt_ZhvwM6LMBL').strength='hard';assert.throws(()=>verify(report,contexts,expressionGate),/registered expressive prerequisite/);
 const retained=structuredClone(edges);retained.find(e=>e.topicId==='mt_ZhvwM6LMBL'&&e.prerequisiteId==='mt_YKkCM63fSC').strength='soft';assert.throws(()=>verify(report,contexts,retained),/retained whole-target/);
});
