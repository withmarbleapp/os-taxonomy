import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const report=load('../reports/ontario-kindergarten-literacy-design-2026-11-11.json');
const topics=new Map(load('../data/topics.json').topics.map(t=>[t.id,t]));
const contexts=load('../data/curriculum-alignments.json').alignments;
const catalogue=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===report.source.catalogue);
const codes=['A1','A1.1','A1.2','A1.3','A2',...Array.from({length:6},(_,i)=>`A2.${i+1}`),'A3',...Array.from({length:6},(_,i)=>`A3.${i+1}`),'A4','A4.1','A4.2'];
function verify(r,alignments=contexts){
 assert.deepEqual(r.records.map(x=>x.code),codes);assert.equal(r.scope.newTopics,0);assert.equal(r.scope.authoredClaimChanges,0);
 const expected=new Set(),actual=new Set();
 for(const row of r.records){
  assert.equal(row.key,`${r.source.catalogue}:ON-K-2026-K-${row.code}`);assert(catalogue.topics.some(t=>t.key===row.key));assert.equal(row.disposition,'Full');assert.deepEqual(row.remainingConditions,[]);
  for(const id of row.protocolIds){const p=r.protocols[id];assert(p?.task.length>50);for(const resource of p.resourceIds??[])assert(Object.hasOwn(r.resources,resource),'actual resource resolves');}
  for(const c of row.topicContributions){const t=topics.get(c.topicId);assert(t);assert.equal(c.role,'component');assert.equal(c.wholeClaimAssessmentRetained,true);assert.deepEqual(c.ageBand,[Math.max(4,t.ageRangeStart),6]);expected.add(JSON.stringify([c.topicId,...c.ageBand,row.key]));}
 }
 for(const c of alignments)for(const key of c.standards){const tuple=JSON.stringify([c.topicId,c.ageRangeStart,c.ageRangeEnd,key]);if(expected.has(tuple)){assert.deepEqual([c.scope,c.country,c.region],['jurisdiction','CA','Ontario']);actual.add(tuple);}}
 assert.equal(expected.size,56);assert.deepEqual(actual,expected,'all exact scoped literacy components');
 const packet=r.resources['declared-phonics-packet'];assert.equal(packet.inventoryBeforeTask.length,32);assert.equal(packet.readAndSpell.finalColdReadWords.length,8);assert.equal(packet.readAndSpell.coldSpellWords.length,8);
 assert(packet.readAndSpell.finalColdReadWords.includes('thick'));assert(!packet.readAndSpell.finalColdReadWords.includes('then'),'undeclared voiced th is not a cold-word prerequisite');
 assert.equal(packet.matchedTexts.coldTransfer.concealUntilAttempt,true);assert.match(packet.readAndSpell.delivery,/without displayed answer/);
 const texts=r.resources['original-practice-texts'];assert(texts.bagStory.body.length>=3);assert(texts.classInvitation.body.length>=2);assert(texts.classMessage.body.length>=2);
 const portfolio=r.resources['creator-portfolio'];assert.deepEqual(portfolio.works.map(w=>w.id),['van-camp-opening','flett-interview','ashevak-owl']);
 for(const work of portfolio.works){assert(work.identitySource.startsWith('https://'));assert(work.url.startsWith('https://'));assert(work.portion.length>40);assert(work.task.length>80);}
 assert.match(portfolio.works[0].portion,/not the complete book/);assert.match(portfolio.works[1].portion,/no Birdsong plot/);assert.match(portfolio.works[2].portion,/Complete museum-displayed/);
 const diverse=r.protocols['diverse-text-experience'];assert.match(diverse.task,/independently read simple written passage/);assert.match(diverse.task,/beyond this learner’s independent reading/);assert.match(diverse.resourceBoundary,/not the Birdsong story/);
 const picture=r.resources['original-story-picture'];assert.equal(picture.asset,'assets/ontario-kindergarten-2026/red-bag.svg');const svg=readFileSync(new URL(`../reports/${picture.asset}`,import.meta.url),'utf8');assert.match(svg,/yellow star/i);
 assert.match(r.protocols['simple-multimodal-writing'].task,/Actually consult/);assert.match(r.protocols['letters-and-formation'].task,/all26English uppercase\/lowercase/);
}
test('Kindergarten literacy binds actual taught packets, creator portions and conservative component scopes',()=>verify(report));
test('biographies, missing Inuit work, absent cold text or viewing-only cannot replace the required literacy tasks',()=>{
 for(const mutate of [r=>r.resources['creator-portfolio'].works.pop(),r=>r.resources['declared-phonics-packet'].matchedTexts.coldTransfer.concealUntilAttempt=false,r=>delete r.resources['original-practice-texts'],r=>r.resources['creator-portfolio'].works[0].portion='Publisher synopsis.',r=>r.protocols['diverse-text-experience'].task='View a painting instead of reading.',r=>r.records.find(x=>x.code==='A4.1').topicContributions[0].ageBand=[4,6]]){const r=structuredClone(report);mutate(r);assert.throws(()=>verify(r));}
 const lost=structuredClone(contexts);for(const c of lost)if(c.topicId==='mt_H7DquwQi_F')c.standards=c.standards.filter(k=>!k.endsWith(':ON-K-2026-K-A2.2'));assert.throws(()=>verify(report,lost),/all exact scoped/);
});
