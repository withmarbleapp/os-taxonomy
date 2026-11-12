import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url)));
const report=load('reports/ontario-grade1-earth-sun-task-design-2026-11-12.json');
const ledger=load('reports/ontario-grade1-earth-sun-current-ledger-2026-11-12.json');
const topics=load('data/topics.json').topics,contexts=load('data/curriculum-alignments.json').alignments;
const research=load('data/teaching-research.json').records,edges=load('data/dependencies.json').dependencies;
const spin='mt_w2xiMNkyyX',sun='mt_u3Y3Tb-G_n',sky='mt_PiWZA8Z0ZJ',system='mt_XlyF294bPR';
const key='the-ontario-curriculum-science-and-technology-20:ON-SCI-2022-G1-E2.1';
function ref(r,p){return p.split('/').slice(1).reduce((x,k)=>x?.[k],r);}
function check(r=report){
 const offers=r.exactNewContexts;assert.equal(offers.length,2);assert.ok(offers.every(c=>c.scope==='jurisdiction'&&c.country==='CA'&&c.region==='Ontario'&&c.ageRangeStart===6&&c.ageRangeEnd===7));
 for(const offer of offers)assert.ok(contexts.some(c=>JSON.stringify(c)===JSON.stringify(offer)));
 assert.deepEqual(offers.find(c=>c.topicId===spin).standards,[key]);assert.deepEqual(offers.find(c=>c.topicId===sun).standards,[]);assert.equal(offers.find(c=>c.topicId===sun).ageOnly,true);
 for(const id of [spin,sun]){assert.deepEqual([topics.find(t=>t.id===id).ageRangeStart,topics.find(t=>t.id===id).ageRangeEnd],[6,12]);assert.ok(contexts.some(c=>c.topicId===id&&c.scope==='global'&&c.ageRangeStart===7&&c.ageRangeEnd===9));assert.ok(contexts.some(c=>c.topicId===id&&c.region==='Ontario'&&c.ageRangeStart===11&&c.ageRangeEnd===12));}
 assert.equal(contexts.some(c=>c.topicId===sun&&c.standards.includes(key)),false);
 const ids=new Set([spin]);let changed=true;while(changed){changed=false;for(const e of edges)if(e.strength==='hard'&&ids.has(e.topicId)&&!ids.has(e.prerequisiteId)){ids.add(e.prerequisiteId);changed=true;}}
 assert.deepEqual([...ids].sort(),[spin,sun,sky,system].sort());assert.deepEqual(edges.filter(e=>e.strength==='hard'&&ids.has(e.topicId)),r.fullHardEdges);
 for(const id of ids){assert.ok(research.some(g=>g.topicId===id&&g.learn&&g.assess));const support=r.completeWholeSupport[id];assert.ok(support);if(support.materialReference)assert.ok(ref(r,support.materialReference));}
 assert.ok(r.originalKit.drawingInstructions.every(c=>c.fullyReproducible&&c.instructions.length>100));
 assert.equal(r.originalKit.skyDiary.isCompletedLearnerObservation,false);assert.equal(r.originalKit.skyDiary.photoBackup.sourcePhotoIsLearnerObservation,false);
 const p=r.protocols['E2.1'];assert.equal(p.requiresIndependentPerformance,true);assert.deepEqual(p.contributorIds,[spin]);assert.equal(p.ancestorAgeOnlyTopicId,sun);
 assert.deepEqual(p.requiredEvidence,['daily-spin-causes-light-shadow','daily-spin-versus-yearly-orbit','seasonal-fixed-tilt-plus-orbital-position','directness-and-daylight-duration','opposite-hemispheres-not-global-distance-only','fresh-mark-position-independent-explanation','honest-model-observation-photo-limits']);
 assert.equal(p.wholeExistingClaimsAwardedFromSourceTaskAlone,false);assert.equal(p.olderSeasonsMasteryAwarded,false);assert.equal(p.teacherSuppliedCausalAnswersSufficient,false);
 assert.equal(r.negativeBoundaries.prerequisiteOnlyFalseDirectLinks,false);assert.equal(r.negativeBoundaries.globalAgeOfferAdded,false);
 assert.equal(ledger.records.length,1);assert.equal(ledger.records[0].code,'ON-SCI-2022-G1-E2.1');assert.equal(ref(r,ledger.records[0].protocolReference).requiresIndependentPerformance,true);
}
test('Earth–Sun closure binds complete four-card path, exact component and age-only offers',()=>check());
test('missing seasonal cause, fake ancestor link or fabricated diary fails coverage guard',()=>{
 const missing=structuredClone(report);missing.protocols['E2.1'].requiredEvidence.splice(3,1);assert.throws(()=>check(missing));
 const direct=structuredClone(report);direct.exactNewContexts.find(c=>c.topicId===sun).standards=[key];assert.throws(()=>check(direct));
 const diary=structuredClone(report);diary.originalKit.skyDiary.isCompletedLearnerObservation=true;assert.throws(()=>check(diary));
 const asset=structuredClone(report);asset.originalKit.drawingInstructions[0].fullyReproducible=false;assert.throws(()=>check(asset));
});
