import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-core56-french-culture-design-2026-11-10.json'),contexts=load('../data/curriculum-alignments.json').alignments;
const source=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===report.source.catalogue);
const earlier=['oral','interaction','textforms','reading','writing','culture'].map(n=>load(`../reports/ontario-core4-french-${n}-design-2026-11-10.json`));
const shared=load('../reports/ontario-core56-french-shared-design-2026-11-10.json');
const channels={A:'listening',B:'speaking',C:'reading',D:'writing'},oral='mt_Winq7Tu99m',roles='mt_2_fB4LuVwc',picture='mt_OlhMP7ShFT',written='mt_sPd4fWeY9x',audience='mt_v5DyOEpbbr';
const regions={5:{id:'mt_QDM6Rc6pph',name:'quebec',cases:['montreal-books','quebec-museum','quebec-circus'],outward:'quebec-circus',authentic:['montreal-books','quebec-museum']},6:{id:'mt_j6g97xxB-c',name:'east-west-north',cases:['moncton-cinema','saint-boniface-festival','whitehorse-francophonie'],outward:'moncton-cinema',authentic:['moncton-cinema','whitehorse-francophonie']}};
const bindings={reading:[{report:'ontario-core4-french-reading-design-2026-11-10.json',protocolId:'meaning-and-strategies',resourceId:'originalStory',topicId:picture}],writing:[{report:'ontario-core4-french-writing-design-2026-11-10.json',protocolId:'purpose-forms-and-production',topicId:audience},{report:'ontario-core4-french-writing-design-2026-11-10.json',protocolId:'planning-through-publication',topicId:audience}]};
function verify(r){
 assert.deepEqual([r.scope.records,r.scope.componentPairs,r.scope.reusedTopics,r.scope.newTopics,r.scope.completeCoreRecordsAfterThisProposal,r.scope.remainingExtendedAndImmersion],[24,54,5,2,132,462]);
 for(const grade of [5,6]){
  const region=regions[grade],community=region.id,prefix=`${r.source.catalogue}:ON-FSL-2013-G${grade}-CORE-`;
  const expected={A3:[community,oral,roles],'A3.1':[community,oral],'A3.2':[roles,oral],B3:[community,oral,roles],'B3.1':[community,oral],'B3.2':[roles,oral],C3:[community,picture,roles],'C3.1':[community,picture],'C3.2':[roles],D3:[community,written,audience],'D3.1':[community,written],'D3.2':[audience,written]};
  const selected=r.records.filter(x=>x.grade===grade);assert.deepEqual(selected.map(x=>x.key).sort(),Object.keys(expected).map(c=>prefix+c).sort(),'exact cultural source identities');
  for(const row of selected){assert.equal(row.key,prefix+row.code);assert.deepEqual(row.topicIds,expected[row.code],'whole contributing claims');assert.deepEqual(row.protocolIds,[`core${grade}-${channels[row.code[0]]}-culture-and-conventions`]);assert.equal(row.disposition,'Full');assert.deepEqual(row.remainingConditions,[]);assert.deepEqual(row.ageBand,[grade+5,grade+6]);}
  for(const [letter,channel]of Object.entries(channels)){
   const p=r.protocols[`core${grade}-${channel}-culture-and-conventions`],c=p.performanceConditions;
   assert.deepEqual(p.codes,[`${letter}3`,`${letter}3.1`,`${letter}3.2`]);assert.equal(c.channel,channel);assert.equal(c.language,'French');assert.deepEqual(c.ageBand,[grade+5,grade+6]);assert.equal(c.region,region.name);assert.deepEqual(c.regionalCases,region.cases);assert.deepEqual(c.additionalWorldCases,['france-music','uk-reading']);
   for(const key of ['ownOrClassConnectionRequired','otherCommunityComparisonRequired','cultureAndConventionsIntegrated','changedRelationshipPreference'])assert.equal(c[key],true,key);
   assert.equal(c.universalAdultVousRule,false);assert.equal(c.automaticEnglishOrDifferentCorpusTransfer,false);
   for(const id of [...region.cases,...c.additionalWorldCases])assert.ok(r.resources[id]?.body?.trim(),'actual regional and world French inputs');
   if(['speaking','writing'].includes(channel)){assert.equal(c.regionalOutwardContributionRequired,true);assert.equal(c.outwardContributionResourceId,region.outward);assert.ok(p.actions.some(a=>a.includes('Explain in actual French')&&a.includes(region.outward)&&a.includes(r.resources[region.outward].body)),'actual outward French output instruction');}
   if(bindings[channel]){
    assert.ok(Array.isArray(p.wholeClaimResourceBindings));assert.deepEqual(p.wholeClaimResourceBindings.map(({report,protocolId,resourceId,topicId})=>({report,protocolId,...(resourceId?{resourceId}:{}),topicId})),bindings[channel],'required whole task bindings');
    for(const b of p.wholeClaimResourceBindings){const prior=load(`../reports/${b.report}`);assert.ok(prior.protocols[b.protocolId]);if(b.resourceId)assert.ok(prior.resources[b.resourceId]);}
   }
   if(channel==='reading'){
    assert.deepEqual(p.authenticReadingBindings.map(x=>x.resourceId),region.authentic,'required actual institutional passages');
    for(const b of p.authenticReadingBindings){assert.equal(b.bodyActuallyRead,true);assert.equal(b.translationOrReadAloudSubstitutesForReading,false);assert.ok(b.section.trim());assert.ok(r.resources[b.resourceId].sources.some(s=>s.url===b.sourceURL),'authentic URL belongs to checked resource');}
   }
  }
  const card=load('../data/topics.json').topics.find(x=>x.id===region.id),guide=load('../data/teaching-research.json').records.find(x=>x.topicId===region.id);assert.ok(card&&guide);assert.equal(card.subject,'Geography');assert.equal(card.type,'CONCEPTUAL');assert.match(card.evidence[0],grade===5?/Quebec setting/:/eastern, western and northern Canadian settings/);assert.equal(guide.confidence,'low');assert.ok(guide.learn.activities[0].learnerActions.length>=7);
 }
 assert.match(r.resources['quebec-circus'].body,/Baie-Saint-Paul/);assert.match(r.resources['quebec-circus'].body,/Montréal/);assert.match(r.resources['quebec-circus'].body,/monde/);
 assert.match(r.resources['moncton-cinema'].body,/2025/);assert.match(r.resources['moncton-cinema'].body,/Canada et de la Belgique/,'documented international activity');
 assert.deepEqual(r.newClaimReview.topicIds,[regions[5].id,regions[6].id]);assert.deepEqual(r.newClaimReview.newDependencies,[]);assert.equal(r.newClaimReview.guideEffectivenessVerified,false);
}
function verifyComplete(designs,alignments){
 const selectedKeys=source.topics.map(x=>x.key).filter(k=>/ON-FSL-2013-G[456]-CORE-/.test(k)).sort();assert.equal(selectedKeys.length,132);
 const rows=designs.flatMap(x=>x.records);assert.deepEqual(rows.map(x=>x.key).sort(),selectedKeys,'exact complete Core source set');const keys=new Set(selectedKeys),pairs=new Set();
 for(const d of designs)for(const row of d.records){assert.equal(row.disposition,'Full');assert.deepEqual(row.remainingConditions,[]);for(const id of row.topicIds??row.contributions.map(c=>c.topicId))pairs.add(JSON.stringify([id,row.key]));for(const id of row.protocolIds??row.assessmentProtocols??row.performanceProtocolIds){assert.ok(Array.isArray(d.protocols)?d.protocols.some(x=>x.id===id):d.protocols[id],'actual source protocol');}}
 const actual=new Set();for(const c of alignments)for(const k of c.standards){if(!keys.has(k))continue;const grade=Number(k.match(/-G([456])-CORE-/)[1]);assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',grade+5,grade+6]);actual.add(JSON.stringify([c.topicId,k]));}assert.deepEqual(actual,pairs,'all scoped Core contributions');
}
test('Core5–6 culture binds24 sources,54 whole contributions and actual regional French channels',()=>verify(report));
test('complete132 Core source set and every scoped pair reconcile to actual designs',()=>verifyComplete([...earlier,shared,report],contexts));
test('culture rejects source/pair omissions, substituted channels, missing actual tasks and unsupported outward claims',()=>{
 const mutations=[r=>r.records.pop(),r=>r.records[0].topicIds.pop(),r=>delete r.resources['uk-reading'],r=>r.protocols['core5-reading-culture-and-conventions'].performanceConditions.channel='listening',r=>r.resources['moncton-cinema'].body='Le festival est international.'];
 for(const grade of [5,6]){
  for(const channel of ['reading','writing']){
   const id=`core${grade}-${channel}-culture-and-conventions`;mutations.push(r=>r.protocols[id].wholeClaimResourceBindings=[],r=>r.protocols[id].wholeClaimResourceBindings.pop(),r=>r.protocols[id].wholeClaimResourceBindings[0].protocolId='writing-strategy-review');
  }
  for(const channel of ['speaking','writing']){const id=`core${grade}-${channel}-culture-and-conventions`;mutations.push(r=>r.protocols[id].performanceConditions.regionalOutwardContributionRequired=false,r=>r.protocols[id].actions=r.protocols[id].actions.filter(x=>!x.includes('Explain in actual French')));}
  const id=`core${grade}-reading-culture-and-conventions`;mutations.push(r=>r.protocols[id].authenticReadingBindings=[],r=>r.protocols[id].authenticReadingBindings[0].translationOrReadAloudSubstitutesForReading=true);
 }
 for(const mutate of mutations){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r));}
 const lost=structuredClone(contexts);for(const c of lost)c.standards=c.standards.filter(k=>k!==report.records[0].key);assert.throws(()=>verifyComplete([...earlier,shared,report],lost),/all scoped Core contributions/);
 const absent=structuredClone(report);absent.records.pop();assert.throws(()=>verifyComplete([...earlier,shared,absent],contexts),/exact complete Core source set/);
});
