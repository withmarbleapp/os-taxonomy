import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-french-programme-shared-design-2026-11-11.json'),contexts=load('../data/curriculum-alignments.json').alignments;
const prior=load('../reports/ontario-core56-french-shared-design-2026-11-10.json'),baseRows=prior.records.filter(x=>x.grade===5);
const catalogue=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===report.source.catalogue);
const core=['oral','interaction','textforms','reading','writing','culture'].map(n=>load(`../reports/ontario-core4-french-${n}-design-2026-11-10.json`));
const coreCulture=load('../reports/ontario-core56-french-culture-design-2026-11-10.json'),media=load('../reports/ontario-french-programme-media-design-2026-11-10.json');
const names=['extended4','extended5','extended6','immersion1','immersion2','immersion3','immersion4','immersion5','immersion6'];
function priorProtocolExists(d,id){return Array.isArray(d.protocols)?d.protocols.some(x=>x.id===id):!!d.protocols[id];}
function verifyBinding(binding){
 assert.ok(binding&&typeof binding==='object','nested binding required');
 assert.match(binding.report,/^[a-z0-9-]+\.json$/,'nested report filename');
 const target=load(`../reports/${binding.report}`);
 const has=(collection,id)=>typeof id==='string'&&id.length>0&&(Array.isArray(collection)?collection.some(x=>x.id===id):!!collection&&Object.hasOwn(collection,id));
 let targets=0;
 for(const [single,plural,collection] of [['protocolId','protocolIds','protocols'],['resourceId','resourceIds','resources']]){
  if(Object.hasOwn(binding,single)){assert.ok(has(target[collection],binding[single]),`nested ${single} resolves: ${binding.report}`);targets++;}
  if(Object.hasOwn(binding,plural)){
   assert.ok(Array.isArray(binding[plural])&&binding[plural].length>0,`nested ${plural} required`);
   for(const id of binding[plural]){assert.ok(has(target[collection],id),`nested ${plural} resolves: ${binding.report}`);targets++;}
  }
 }
 assert.ok(targets>0,'nested binding target required');
}
function verify(r,alignments=contexts){
 assert.deepEqual([r.scope.records,r.scope.perCourse,r.scope.courses,r.scope.componentPairs,r.scope.reusedTopics,r.scope.newTopics,r.scope.newGuides,r.scope.newDependencies,r.scope.completePrimaryFrenchDesignsAfterThisProposal,r.scope.remainingCultureRecords],[288,32,9,819,26,0,0,0,486,108]);assert.deepEqual(Object.keys(r.courseProfiles).sort(),names);const pairs=new Set();
 for(const name of names){
  const p=r.courseProfiles[name],programme=name.startsWith('extended')?'Extended':'Immersion',grade=Number(name.at(-1)),early=programme==='Immersion'&&grade<=3,advanced=programme==='Immersion'&&grade>=4||programme==='Extended'&&grade===6;
  assert.deepEqual([p.programme,p.grade,p.ageBand,p.officialCourseName],[programme,grade,[grade+5,grade+6],`FSL - ${programme} - Grade ${grade}`]);assert.match(p.officialCourseId,/^[a-f0-9-]{36}$/);assert.equal(p.academicContextRequired,!early);assert.equal(p.unfamiliarListeningWordsRequired,advanced);assert.equal(p.increasinglySpontaneousMessagesRequired,advanced);assert.equal(p.spontaneousInteractionRequired,true);assert.equal(p.interactionStructure,programme==='Immersion'&&grade>=4?'guided and increasingly spontaneous':'structured and guided');assert.equal(p.listeningBarriersRequired,programme==='Immersion'&&grade>=4);assert.equal(p.readingWordStrategies,early?'few supported methods':'several different methods');assert.equal(p.draftBasis,early?'model and simple supported revision':'established criteria and varied revision');for(const flag of ['teacherPeerReflectionAllFourChannels','authenticAndAdaptedAllFourTextCategories','allEarlierWholeProtocolsRequired','noEnglishOrDifferentCorpusTransfer'])assert.equal(p[flag],true,flag);
  const prefix=`${r.source.catalogue}:ON-FSL-2013-G${grade}-${programme.toUpperCase()}-`,expected=baseRows.map(x=>prefix+(x.code==='A1.2'?'A1.3':x.code)).sort(),selected=r.records.filter(x=>x.courseProfile===name);assert.deepEqual(selected.map(x=>x.key).sort(),expected,'complete32 semantic source positions per actual course');assert.ok(expected.every(k=>catalogue.topics.some(t=>t.key===k)));
  for(const row of selected){const old=baseRows.find(x=>x.code===row.priorCoreCode);assert.ok(old);assert.equal(row.code,old.code==='A1.2'?'A1.3':old.code);assert.equal(row.key,prefix+row.code);assert.deepEqual([row.programme,row.grade,row.ageBand],[programme,grade,p.ageBand]);for(const key of ['topicIds','priorDesign','priorProtocolIds'])assert.deepEqual(row[key],old[key],'exact whole-claim/task binding');assert.equal(row.wholePriorTaskRequired,true);const d=load(`../reports/${row.priorDesign}`);for(const id of row.priorProtocolIds)assert.ok(priorProtocolExists(d,id));assert.deepEqual(row.performanceProtocolIds,[`${name}-source-performance`]);assert.equal(row.disposition,'Full');assert.deepEqual(row.remainingConditions,[]);for(const id of row.topicIds)pairs.add(JSON.stringify([id,row.key]));}
  const protocol=r.protocols[`${name}-source-performance`];assert.equal(protocol.courseProfile,name);assert.deepEqual(protocol.requiredResourceBindings,['beyond-independent-readaloud','spontaneous-exchange','word-strategies','process-and-reflection']);for(const id of protocol.requiredResourceBindings)assert.ok(r.resources[id]);assert.deepEqual(protocol.primaryPortfolioBinding,p.primaryPortfolio,'required actual course portfolio');
  if(grade>=5){assert.deepEqual(p.primaryPortfolio,{report:'ontario-core56-french-shared-design-2026-11-10.json',resourceId:`core${grade}-grade-portfolio`});assert.ok(prior.resources[p.primaryPortfolio.resourceId]);assert.ok(protocol.actions.some(x=>x.includes(`core${grade}-grade-portfolio`)&&x.includes('actual visual layouts')));}
  else {assert.deepEqual(p.primaryPortfolio,{report:'ontario-french-programme-shared-design-2026-11-11.json',resourceId:early?'early-immersion-packet':'grade4-programme-packet'});assert.ok(r.resources[p.primaryPortfolio.resourceId]);}
  for(const pattern of [/actual French corpus\/resources/,/full oral\/nasal and consonant\/cluster contrast/,/one-minute report.*three facts/,/actual peer AND teacher replies/,/complete26-word sight bank/,/actual collection spanning fiction, information, graphic and media/,/retained orthographic knowledge/,/reflection.*teacher AND peer/])assert.ok(protocol.actions.some(x=>pattern.test(x)),`required concrete common task ${pattern}`);
  if(advanced){assert.ok(protocol.actions.some(x=>x.includes('actual Core6 new-word-listening resource')&&x.includes('Verify novelty')),'actual unfamiliar-word listening task');assert.ok(protocol.actions.some(x=>x.includes('planned, rehearsed AND genuinely spontaneous')&&x.includes('unannounced relevant')),'actual spontaneous message duty');}
  if(p.listeningBarriersRequired)assert.ok(protocol.actions.some(x=>x.includes('factors that obstruct listening')&&x.includes('plan/monitor')),'actual barrier reflection task');
  if(early)assert.ok(protocol.actions.some(x=>x.includes('Early Immersion retains')&&x.includes('simple revision')),'actual early source supports');else assert.ok(protocol.actions.some(x=>x.includes('actual academic project report/table/poster')),'actual academic task');
 }
 const actual=new Set(),keys=new Set(r.records.map(x=>x.key));for(const c of alignments)for(const k of c.standards){if(!keys.has(k))continue;const row=r.records.find(x=>x.key===k);assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',...row.ageBand]);actual.add(JSON.stringify([c.topicId,k]));}assert.equal(pairs.size,819);assert.deepEqual(actual,pairs,'exact819 scoped contributions');
 const packet=r.resources['grade4-programme-packet'];assert.match(packet.fiction.body,/Nora et Sami/);assert.match(packet.fiction.visualPreparation,/actual original panels/);assert.ok(packet.writingModels.information&&packet.writingModels.request&&packet.writingModels.instructions);
 const early=r.resources['early-immersion-packet'];assert.match(early.newReadingMessage,/Bonjour Zoé/);assert.ok(early.writingModels.invitation&&early.writingModels.information&&early.writingModels.narrative);assert.equal(early.oralAndReadingBindings.length,3);
 for(const binding of early.oralAndReadingBindings)verifyBinding(binding);
 verifyBinding(packet.oralAcademicResource);
 assert.equal(r.resources['word-strategies'].bindings.length,2);
 for(const binding of r.resources['word-strategies'].bindings)verifyBinding(binding);
 verifyBinding(r.resources['process-and-reflection'].editingExamplesBinding);
 const listening=r.resources['beyond-independent-readaloud'];assert.match(listening.text,/deux groupes/);assert.match(listening.selection,/verify which text is beyond this learner/);assert.match(listening.selection,/if already independently readable/);assert.match(listening.task,/ask\/answer questions/);
 assert.match(r.resources['spontaneous-exchange'].task,/actual unrehearsed/);assert.match(r.resources['spontaneous-exchange'].task,/teacher separately/);assert.equal(r.resources['spontaneous-exchange'].stems.length,4);
 assert.match(r.resources['word-strategies'].task,/several different strategies/);assert.match(r.resources['process-and-reflection'].writing,/actual modelled, shared, guided and independent/);assert.match(r.resources['process-and-reflection'].writing,/establish task success criteria before drafting/);assert.match(r.resources['process-and-reflection'].reflection,/both teacher and peers/);
 assert.deepEqual(r.source.deliveryDiscrepancies.map(x=>[x.grade,x.code,x.originalPDFPrintedPage]),[[5,'A1.1',140],[6,'A2.2',155],[6,'A3.2',156]],'known source discrepancies remain explicit');
}
function verifyComplete(designs,alignments){
 const primary=catalogue.topics.map(t=>t.key).filter(k=>/ON-FSL-2013-G[1-6]-(CORE|EXTENDED|IMMERSION)-/.test(k));assert.equal(primary.length,594);
 const expected=primary.filter(k=>k.includes('-CORE-')||!/-[ABCD]3(?:\.|$)/.test(k)).sort();assert.equal(expected.length,486);
 const rows=designs.flatMap(d=>d.records);assert.deepEqual(rows.map(x=>x.key).sort(),expected,'complete486 source set');const pairs=new Set();for(const d of designs)for(const row of d.records){assert.equal(row.disposition,'Full');assert.deepEqual(row.remainingConditions,[]);for(const id of row.topicIds??row.contributions.map(x=>x.topicId))pairs.add(JSON.stringify([id,row.key]));for(const id of row.protocolIds??row.assessmentProtocols??row.performanceProtocolIds)assert.ok(priorProtocolExists(d,id));}
 const keys=new Set(expected),actual=new Set();for(const c of alignments)for(const k of c.standards){if(!keys.has(k))continue;const grade=Number(k.match(/-G([1-6])-/)[1]);assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',grade+5,grade+6]);actual.add(JSON.stringify([c.topicId,k]));}assert.deepEqual(actual,pairs,'all486 reviewed scoped pairs');
}
test('288 programme records retain exact whole claims and actual course-specific French performance',()=>verify(report));
test('nested French task bindings reject missing reports, protocols and individual resources',()=>{
 const mutations=[
  r=>r.resources['early-immersion-packet'].oralAndReadingBindings[0].report='missing-report.json',
  r=>r.resources['early-immersion-packet'].oralAndReadingBindings[0].protocolId='missing-protocol',
  r=>r.resources['early-immersion-packet'].oralAndReadingBindings[1].resourceId='missing-resource',
  r=>r.resources['early-immersion-packet'].oralAndReadingBindings[2].resourceIds[1]='missing-resource',
  r=>r.resources['early-immersion-packet'].oralAndReadingBindings[2].resourceIds=[],
  r=>r.resources['word-strategies'].bindings[0].resourceId='missing-resource',
  r=>r.resources['word-strategies'].bindings[1].protocolId='missing-protocol',
  r=>r.resources['word-strategies'].bindings=[],
  r=>r.resources['process-and-reflection'].editingExamplesBinding.report='missing-report.json',
  r=>r.resources['process-and-reflection'].editingExamplesBinding.resourceId='missing-resource',
  r=>r.resources['process-and-reflection'].editingExamplesBinding.resourceId='constructor',
  r=>r.resources['grade4-programme-packet'].oralAcademicResource.resourceId='missing-resource',
 ];
 for(const mutate of mutations){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r));}
});
test('complete486 Core and nonculture programme positions reconcile with every scoped contribution',()=>verifyComplete([...core,prior,coreCulture,media,report],contexts));
test('programme shared guard rejects source omissions, wrong valid references, lost concrete adaptations and context drift',()=>{
 const mutations=[r=>r.records.pop(),r=>r.records[0].priorProtocolIds=['fr-original-resource-packet'],r=>r.records[0].wholePriorTaskRequired=false,r=>r.records.find(x=>x.code==='A1.3').code='A1.2',r=>r.courseProfiles.immersion1.academicContextRequired=true,r=>r.courseProfiles.immersion4.unfamiliarListeningWordsRequired=false,r=>r.protocols['extended5-source-performance'].primaryPortfolioBinding.resourceId='core6-grade-portfolio',r=>r.resources['beyond-independent-readaloud'].selection='Any read-aloud qualifies.',r=>r.resources['spontaneous-exchange'].task='Recite a complete teacher dialogue.',r=>r.resources['process-and-reflection'].writing='Copy the final model.',r=>r.source.deliveryDiscrepancies=[]];
 for(const name of names){mutations.push(r=>r.protocols[`${name}-source-performance`].actions=[]);const p=report.courseProfiles[name];if(p.increasinglySpontaneousMessagesRequired)mutations.push(r=>r.protocols[`${name}-source-performance`].actions=r.protocols[`${name}-source-performance`].actions.filter(x=>!x.includes('planned, rehearsed AND genuinely spontaneous')));if(p.listeningBarriersRequired)mutations.push(r=>r.protocols[`${name}-source-performance`].actions=r.protocols[`${name}-source-performance`].actions.filter(x=>!x.includes('factors that obstruct listening')));}
 for(const mutate of mutations){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r));}
 const lost=structuredClone(contexts);for(const c of lost)c.standards=c.standards.filter(k=>k!==report.records[0].key);assert.throws(()=>verify(report,lost),/exact819 scoped contributions/);assert.throws(()=>verifyComplete([...core,prior,coreCulture,media,report],lost),/all486 reviewed scoped pairs/);
 const absent=structuredClone(report);absent.records.pop();assert.throws(()=>verifyComplete([...core,prior,coreCulture,media,absent],contexts),/complete486 source set/);
});
