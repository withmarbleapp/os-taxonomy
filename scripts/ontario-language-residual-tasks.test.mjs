import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const culture=load('../reports/ontario-language-cultural-residual-tasks-2026-11-11.json');
const keyboard=load('../reports/ontario-language-keyboarding-task-2026-11-11.json');
const topics=new Set(load('../data/topics.json').topics.map(t=>t.id));
const catalogue=new Set(load('../data/curriculum-standards.json').curricula.find(c=>c.slug===culture.source.catalogue).topics.map(t=>t.key));
function verify(c,k){
 const expected=Array.from({length:6},(_,i)=>['A3','A3.3','C1','C1.7','C3','C3.7'].map(code=>`${c.source.catalogue}:ON-LANG-2023-G${i+1}-${code}`)).flat();
 const actual=c.records.map(r=>r.sourceKey);assert.equal(actual.length,36);assert.deepEqual(new Set(actual),new Set(expected));
 const all=[...actual,...k.sourceKeys];assert.equal(all.length,40);assert.equal(new Set(all).size,40);for(const key of all)assert(catalogue.has(key),'retained source key');
 for(const r of c.records){for(const id of r.protocolIds)assert(c.protocols[id]?.task.length>100);assert(c.gradePanels[r.grade]);assert.equal(r.newLearnerAttainmentInferred,false);for(const h of r.historicalAcceptedContributions)assert(topics.has(h.topicId));}
 for(let g=1;g<=6;g++){const panel=c.gradePanels[g];assert.deepEqual(panel.ageBand,[g+5,g+6]);assert.equal(panel.storyworkPanelRequired,g>=4);assert.equal(panel.presentConnectionRef,'actualPresentConnection');}
 for(const id of ['van-camp-poetic-opening','ashevak-visual-work']){const r=c.resources[id];const bound=load(`../reports/${r.report}`).resources[r.resourceId];assert(bound.works.some(w=>w.id===r.workId),'actual selected work resolves');}
 assert.match(c.resources['audlaluk-memory-excerpt'].portion,/paragraphs1,2and4 only/);assert.match(c.resources['audlaluk-memory-excerpt'].contextBoundary,/No complete memoir or original government reports were read/);
 assert.equal(Object.keys(c.resources['storywork-framework'].principleTaskBindings).length,7);assert(c.resources['storywork-framework'].taskPanel.length>=5);
 for(const id of ['nipissing-community-account','flett-lived-experience','audlaluk-memory-excerpt']){const caseCheck=c.actualCaseChecks[id];for(const field of ['question','expectedEvidence','nearMiss','changedCase'])assert(caseCheck?.[field].length>60,'actual case duty resolves');}
 assert.match(c.actualPresentConnection.expectedEvidence,/family-told home memories/);assert.match(c.actualPresentConnection.expectedEvidence,/organised language learning/);assert.match(c.actualPresentConnection.limits,/does not equate the peoples/);
 const expectedKeyboard=[5,6].flatMap(g=>['D2','D2.2'].map(code=>`${c.source.catalogue}:ON-LANG-2023-G${g}-${code}`)).sort();
 assert.equal(k.source.catalogue,c.source.catalogue,'Keyboard catalogue mismatch');
 assert.deepEqual([...k.sourceKeys].sort(),expectedKeyboard,'Keyboard declared source keys differ');
 assert.deepEqual(k.records.map(r=>r.sourceKey).sort(),expectedKeyboard,'Keyboard record keys differ');
 for(const row of k.records){
  assert.equal(row.taskRef,'protocol','Keyboard record must bind its actual performance protocol');
  assert(Object.hasOwn(k,row.taskRef),'Missing own keyboard task target');
  const target=k[row.taskRef];assert(target&&typeof target==='object'&&!Array.isArray(target)&&Object.keys(target).length,'Missing keyboard task');
  for(const field of ['handwriting','keyboarding','wordProcessing'])assert(Array.isArray(target[field])&&target[field].length,'Missing keyboard task duty');
  assert.equal(row.newLearnerAttainmentInferred,false);assert.equal(row.otherHistoricalFullLabelsFreshlyRecertified,false);
 }
 assert.equal(k.records.length,4);assert.equal(k.recordTemplate.originalOutput,null);assert.equal(k.recordTemplate.freshTransferOutput,null);
 assert.match(k.protocol.closure,/beginner home-row demonstration alone cannot/);assert.match(k.protocol.keyboarding.join(' '),/fresh equivalent message/);assert.match(k.protocol.keyboarding.join(' '),/no compulsory words-per-minute mastery threshold/);assert(k.originalPracticeTexts.short.length>=2);assert(k.originalPracticeTexts.extended.length>=2);
}
test('Ontario Language residuals bind actual creator portions, enacted Storywork, present connections and real keyboard tasks',()=>verify(culture,keyboard));
test('missing present evidence, unresolved works, principle-name recital or fabricated typing results cannot pass',()=>{
 for(const mutate of [c=>delete c.actualPresentConnection,c=>delete c.actualCaseChecks['flett-lived-experience'],c=>c.resources['audlaluk-memory-excerpt'].portion='Complete unread book.',c=>c.resources['storywork-framework'].principleTaskBindings={},c=>c.resources['ashevak-visual-work'].workId='unread-work',c=>c.gradePanels[4].storyworkPanelRequired=false]){const c=structuredClone(culture);mutate(c);assert.throws(()=>verify(c,keyboard));}
 for(const mutate of [k=>k.recordTemplate.originalOutput='Typed perfectly',k=>k.protocol.keyboarding=['Look at a home-row diagram.']]){const k=structuredClone(keyboard);mutate(k);assert.throws(()=>verify(culture,k));}
});

test('all four keyboard records bind their exact source keys and actual task target',()=>{
 for(const mutate of [
  k=>k.records[0].sourceKey=k.records[1].sourceKey,
  k=>k.records[0].sourceKey=`${k.source.catalogue}:ON-LANG-2023-G5-D1`,
  k=>k.sourceKeys[0]=`${k.source.catalogue}:ON-LANG-2023-G5-D1`,
  k=>k.records[0].taskRef='missing-task',
  k=>k.records[0].taskRef='toString',
  k=>k.records[0].taskRef='originalPracticeTexts',
 ]){const k=structuredClone(keyboard);mutate(k);assert.throws(()=>verify(culture,k));}
});
