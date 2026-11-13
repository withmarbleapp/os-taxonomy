import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const stem='reports/ontario-language-historical394-source-authoring-2026-11-13';
const review=JSON.parse(fs.readFileSync(stem+'-review.json','utf8'));
const alignments=JSON.parse(fs.readFileSync('data/curriculum-alignments.json','utf8')).alignments;
const data=JSON.parse(fs.readFileSync('data/curriculum-standards.json','utf8')).curricula.find(c=>c.slug==='the-ontario-curriculum-language-2023');
const keySet=data.topics.filter(t=>/-G[1-6]-/.test(t.code)).map(t=>t.key).sort();
const md=s=>fs.readFileSync(stem+'-'+s+'.md','utf8');
function checkRef(ref){
 assert.ok(ref.resource.startsWith('reports/')&&!ref.resource.includes('..'),ref.resource);
 assert.ok(fs.existsSync(ref.resource),ref.resource);
 if(ref.protocolHeading)assert.ok(fs.readFileSync(ref.resource,'utf8').split('\n').includes('## '+ref.protocolHeading),ref.protocolHeading);
 if(ref.jsonPointer){let value=JSON.parse(fs.readFileSync(ref.resource,'utf8'));for(const part of ref.jsonPointer.split('/').slice(1))value=value?.[part.replace(/~1/g,'/').replace(/~0/g,'~')];assert.notEqual(value,undefined,ref.jsonPointer);}
}
test('Language394 exact source census is disjoint from cultural36 and keyboard4, with every real reference resolved',()=>{
 assert.equal(review.records.length,394);assert.equal(new Set(review.records.map(r=>r.sourceKey)).size,394);
 const cultural=JSON.parse(fs.readFileSync('reports/ontario-language-cultural-residual-tasks-2026-11-11.json','utf8')).records.map(r=>r.sourceKey).sort();
 const keyboards=JSON.parse(fs.readFileSync('reports/ontario-language-keyboarding-task-2026-11-11.json','utf8')).sourceKeys.sort();
 assert.deepEqual(review.separateCurrentCulturalKeys,cultural);assert.equal(cultural.length,36);assert.deepEqual(review.separateCurrentKeyboardKeys,keyboards);assert.equal(keyboards.length,4);
 const combined=[...review.records.map(r=>r.sourceKey),...cultural,...keyboards];assert.equal(new Set(combined).size,434);assert.deepEqual(combined.sort(),keySet);
 const byGrade={};let totalOffers=0;
 for(const r of review.records){
  byGrade[r.grade]=(byGrade[r.grade]??0)+1;assert.match(r.originalSourceClauseSHA256,/^[0-9a-f]{64}$/);
  assert.equal(r.code,r.sourceKey.split(`-G${r.grade}-`)[1]);assert.equal(r.independentOverallRequired,!r.code.includes('.'));
  for(const ref of Object.values(r.protocols))checkRef(ref);
  const offers=alignments.filter(a=>a.standards.includes(r.sourceKey));totalOffers+=offers.length;
  assert.equal(r.existingOfferCount,offers.length);assert.deepEqual(r.existingDirectContributorIds,[...new Set(offers.map(a=>a.topicId))].sort());
  for(const a of offers)assert.ok(a.ageRangeStart<=r.grade+6&&a.ageRangeEnd>=r.grade+5,`${r.sourceKey} ${a.topicId}`);
  assert.equal(r.wholeContributorAwardFromSourceResult,false);assert.equal(r.actualLearnerPerformanceClaimed,false);assert.equal(r.actualLocalDigitalDeliveryClaimed,false);
 }
 assert.deepEqual(byGrade,{1:69,2:67,3:67,4:65,5:63,6:63});assert.equal(totalOffers,1521);
 for(const resource of review.resources)assert.ok(fs.existsSync(resource),resource);
});
test('Language specific-source negative guards preserve editing, source counts, connections and actual operations',()=>{
 const row=(g,c)=>review.records.find(r=>r.grade===g&&r.code===c);
 assert.ok(row(1,'D2.5').operationalFocus.includes('SIMPLE EDITING'));assert.ok(row(1,'D2.5').protocols.editingInput.protocolHeading.startsWith('F3-G1'));
 assert.ok(row(4,'D2.2'));assert.ok(!review.separateCurrentKeyboardKeys.some(k=>k.includes('-G4-')));
 for(const g of [2,3])assert.ok(row(g,'D1.3').operationalFocus.includes('THREE OR MORE'));
 for(const g of [5,6])assert.ok(row(g,'D1.3').operationalFocus.includes('MULTIPLE TEXTUAL'));
 for(let g=1;g<=6;g++)assert.ok(row(g,'C2.5').operationalFocus.includes('ALL THREE'));
 for(const g of [4,5])assert.ok(row(g,'C3.3').operationalFocus.includes('TWO plot strands'));
 assert.ok(row(6,'C3.3').operationalFocus.includes('EVALUATE'));assert.ok(row(6,'C1.6').operationalFocus.includes('WITH EVIDENCE'));
 const protocol=md('protocols'),foundation=md('foundations'),stimuli=md('stimuli');
 for(const token of ['all seven transferable skills','THREE OR MORE','MULTIPLE TEXTUAL','ALL THREE','text-to-text connection alone does not replace it','SIMPLE EDITING']){
  if(token==='SIMPLE EDITING')assert.ok(row(1,'D2.5').operationalFocus.includes(token));else assert.ok(protocol.toLowerCase().includes(token.toLowerCase()),token);
 }
 for(const token of ['actual approved school-controlled channel','actual confirmed need','actual feedback','spell- and grammar-checkers']){
  if(token==='spell- and grammar-checkers')assert.ok(protocol.includes('spelling/grammar')||protocol.includes('spelling/grammar suggestions'));else assert.ok(protocol.toLowerCase().includes(token.toLowerCase()),token);
 }
 assert.ok(foundation.includes('with no added')||foundation.includes('no added “uh”'));assert.ok(foundation.includes('Fragment')||foundation.includes('Fragments/run-ons'));
 for(const token of ['## N1','## N6','## I1','## I3','## O1','## O2','## L1–L6','## F'])assert.ok(stimuli.includes(token),token);
 assert.equal(review.counts.newFullCount,0);assert.deepEqual(review.canonicalDelta,{topics:0,ages:0,contexts:0,pairs:0,guides:0,edges:0,catalogue:0});
});
test('Original model assets have real targets, no data form, and menu navigation selects the intended section',()=>{
 const dir='reports/assets/ontario-language394',html=fs.readFileSync(dir+'/language394-original-model-page.html','utf8'),svg=fs.readFileSync(dir+'/language394-original-model-visual.svg','utf8');
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const m of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(m[1]),m[1]);
 for(const m of html.matchAll(/<option value="([^"]+)"/g))assert.ok(ids.has(m[1]),m[1]);
 for(const m of html.matchAll(/src="([^"]+)"/g))assert.ok(fs.existsSync(path.join(dir,m[1])),m[1]);
 assert.ok(!/<(?:form|input|textarea)\b/i.test(html));assert.ok(!/<script[^>]*src=/i.test(html));
 assert.ok(svg.includes('18 model responses'));assert.ok(svg.includes('Axis starts at 0'));assert.ok(svg.includes('Axis starts at 7'));assert.ok(svg.includes('8</text>'));assert.ok(svg.includes('10</text>'));
 let callback;const targets={};for(const id of ids)targets[id]={addEventListener:(name,fn)=>{assert.equal(name,'change');callback=fn;},scrollIntoView:()=>{targets[id].scrolled=true;},setAttribute:(k,v)=>{targets[id][k]=v;},focus:()=>{targets[id].focused=true;}};
 vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{document:{getElementById:id=>targets[id]}});
 assert.equal(typeof callback,'function');callback.call({value:'activities'});assert.equal(targets.activities.scrolled,true);assert.equal(targets.activities.focused,true);assert.equal(targets.activities.tabindex,'-1');assert.ok(!targets.plan.scrolled);callback.call({value:'not-a-section'});
});
