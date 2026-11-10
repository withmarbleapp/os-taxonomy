import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-core56-french-shared-design-2026-11-10.json'),contexts=load('../data/curriculum-alignments.json').alignments;
const priorNames=['oral','interaction','textforms','reading','writing'];
// Reviewed concrete Grade6 duties must remain actual instructions, not only true flags.
const requiredGrade6Actions=["For C1.4 revisit a recently learned French word in a changed connected reading context, determine/confirm its meaning and use a relevant strategy. Preserve the full prior new-word strategy and familiar-word-bank checks; a single old word recognition is insufficient.", "For D2.3 use the prior exact-spelling/accents, punctuation and intended-time checks plus a meaningful location-preposition check in an original instruction, such as the intended contrast between dans la boîte and sur la boîte. Make actual revisions appropriate to the intended message, retaining several conventions and real presentation decisions. Examples of every gender ending, verb/preposition or graphic device are not a mandatory universal inventory."];
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
  const portfolioId=`core${grade}-grade-portfolio`;assert.equal(p.requiredPortfolioBinding,portfolioId,'actual grade portfolio binding');
  const portfolio=r.resources[portfolioId];assert.ok(portfolio,'required actual portfolio');
  assert.deepEqual(portfolio.formCoverage,{fiction:'fiction',information:grade===5?'memo':'information',graphic:'graphic',media:'media'});
  for(const id of Object.values(portfolio.formCoverage))assert.ok(portfolio.texts[id],'required input form');
  assert.match(portfolio.texts.fiction.body,grade===5?/son carnet dans son sac/:/Hier, Inès et Malik/,'connected original grade input');
  assert.match(portfolio.texts.fiction.task,/retell|dramatise/,'meaning performance beyond starter recognition');
  assert.match(portfolio.texts.fiction.visualPreparation,/original/,'actual illustration preparation');
  assert.deepEqual(portfolio.texts.graphic.headings,grade===5?['Moment','Activité','Matériel']:['Plan','Lieu','Condition','Action']);
  assert.equal(portfolio.texts.graphic.rows.length,grade===5?3:2);assert.match(portfolio.texts.graphic.task,/actual/,'render actual graphic form');
  assert.match(portfolio.texts.media.layout,/actual|real/,'actual poster preparation');
  assert.match(portfolio.speaking.task,/peer/);assert.match(portfolio.speaking.task,/teacher/);assert.ok(portfolio.speaking.model.includes(grade===5?'Notre rencontre est jeudi':'Hier, nous avons préparé'),'actual original oral model');
  assert.deepEqual(Object.keys(portfolio.writing.models).sort(),grade===5?['memo','postcard']:['brochure','email','manual']);
  if(grade===5){assert.match(portfolio.writing.models.postcard,/Quel livre préfères-tu/);assert.match(portfolio.writing.models.memo,/Pour notre classe/);}
  else {assert.deepEqual(Object.keys(portfolio.writing.models.manual).sort(),['diagramPreparation','materials','steps','title']);assert.equal(portfolio.writing.models.manual.steps.length,5);assert.equal(portfolio.writing.models.brochure.sections.length,3);assert.match(portfolio.writing.models.email,/Objet :/);}
  assert.match(portfolio.writing.task,/modelled.*shared.*guided.*independent/,'all writing modes remain actual duties');assert.match(portfolio.writing.task,/revise|revision/);assert.match(portfolio.writing.task,/Copying|copying/);
  assert.ok(p.actions.some(x=>x.includes(portfolioId)&&x.includes('starter story')),'concrete grade portfolio instruction');
 }
 const actual=new Set();for(const c of alignments)for(const k of c.standards){if(!new Set(r.records.map(x=>x.key)).has(k))continue;const row=r.records.find(x=>x.key===k);assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',...row.ageBand]);actual.add(JSON.stringify([c.topicId,k]));}assert.deepEqual(actual,pairs,'exact source associations');assert.equal(pairs.size,182);assert.deepEqual([r.scope.records,r.scope.perGrade,r.scope.componentPairs,r.scope.reusedTopics,r.scope.newTopics,r.scope.remainingCultureRecords],[64,32,182,26,0,24]);
 const g6=r.protocols['core6-source-adaptations'];for(const action of requiredGrade6Actions)assert.ok(g6.actions.includes(action),'required concrete Grade6 task instruction');
 assert.deepEqual(g6.requiredTaskBindings,{'C1.4':'recently-learned-reading','D2.3':'location-preposition-revision'},'required reading/writing resource bindings');
 const reading=r.resources['recently-learned-reading'];assert.ok(reading?.initialPassage?.includes('abri')&&reading.revisitPassage?.includes('abri'),'actual recently learned word passages');assert.ok(reading.task?.includes('actually recently learned')&&reading.meaningCheck?.includes('shelter'),'actual reading meaning task');
 const writing=r.resources['location-preposition-revision'];assert.equal(writing?.intendedMeaning,'Le jeton doit être à l’intérieur de la boîte.');assert.equal(writing.draft,'Pose le jeton sur la boîte.');assert.equal(writing.revision,'Pose le jeton dans la boîte.');assert.ok(writing.task?.includes('explain or demonstrate'),'actual meaningful location revision');
 const n=r.resources['new-word-listening'];assert.ok(n?.body?.includes('plateau')&&n.body.includes('jeton'),'actual heard French new-word resource');assert.match(n.preparation,/genuinely new/,'actual novelty condition');assert.match(n.check,/purpose/);
 const open=r.resources['guided-peer-teacher-interaction'];assert.ok(open?.task?.includes('unrehearsed')&&open.task.includes('teacher'),'actual guided reply resource');
 assert.deepEqual(r.source.courses.map(x=>x.name),['FSL - Core - Grade 5','FSL - Core - Grade 6'],'actual course identity rather than delivery codename');
}
test('Core French Grades5–6 reuse whole existing operations with explicit changed source duties',()=>verify(report,contexts));
test('Core French rejects missing source/pair, wrong valid protocol, lost Grade6 conditions and culture overreach',()=>{
 const mutations=[r=>r.records.pop(),r=>r.records[0].priorDesign='ontario-core4-french-writing-design-2026-11-10.json',r=>r.records[0].wholePriorTaskRequired=false,r=>r.protocols['core6-source-adaptations'].performanceConditions.listeningNewWordContext=false,r=>r.protocols['core6-source-adaptations'].performanceConditions.guidedUnscriptedPartnerReplies=false,r=>r.protocols['core6-source-adaptations'].performanceConditions.listeningBarrierFactorsDiscussed=false,r=>delete r.resources['new-word-listening'],r=>r.resources['new-word-listening'].preparation='Treat every word as previously taught.',r=>r.records[0].key=r.records[0].key.replace('-A1','-A3')];
 for(const mutate of mutations){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r,contexts));}
 for(const action of requiredGrade6Actions){const lostInstruction=structuredClone(report);lostInstruction.protocols['core6-source-adaptations'].actions=lostInstruction.protocols['core6-source-adaptations'].actions.filter(x=>x!==action);assert.equal(lostInstruction.protocols['core6-source-adaptations'].performanceConditions.recentlyLearnedReadingWordCheck,true);assert.equal(lostInstruction.protocols['core6-source-adaptations'].performanceConditions.writtenConventionRange,true);assert.throws(()=>verify(lostInstruction,contexts),/required concrete Grade6 task instruction/);}
 for(const id of ['recently-learned-reading','location-preposition-revision']){const missing=structuredClone(report);delete missing.resources[id];assert.throws(()=>verify(missing,contexts));}
 for(const grade of [5,6]){
  const id=`core${grade}-grade-portfolio`,proto=`core${grade}-source-adaptations`;
  for(const mutate of [r=>delete r.resources[id],r=>r.protocols[proto].requiredPortfolioBinding=`core${grade===5?6:5}-grade-portfolio`,r=>r.resources[id].texts.fiction.body='Il voit un livre.',r=>delete r.resources[id].texts.graphic,r=>r.resources[id].writing.models={},r=>r.resources[id].writing.task='Copy the model.',r=>r.protocols[proto].actions=r.protocols[proto].actions.filter(x=>!x.includes(id))]){const changed=structuredClone(report);mutate(changed);assert.throws(()=>verify(changed,contexts));}
 }
 const lost=structuredClone(contexts);for(const c of lost)c.standards=c.standards.filter(k=>k!==report.records[0].key);assert.throws(()=>verify(report,lost),/exact source associations/);
});
