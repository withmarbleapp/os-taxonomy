import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));
const sourceKey='ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C9-LO01';
const state=()=>({review:read('reports/ncert-scale-source-meaning-exception-2026-11-11.json'),readiness:read('reports/ncert-alignment-readiness-2026-11-10.json'),sensory:read('reports/ncert-sensory-alignment-2026-11-10.json'),alignments:read('data/curriculum-alignments.json').alignments,topics:read('data/topics.json').topics});
function qualify(s){
 const r=s.review;assert.equal(r.sourceKey,sourceKey);assert.equal(r.disposition,'Unverified');assert.equal(r.graphRepresentation,'source-meaning-unverified-no-graph-link');
 assert.equal(r.source.sha256,'484d5c18d9beeb1d79c4bee8589f6cb2b2ef42bdeb255b8f51e1eae8ac953eb2');assert.equal(r.source.pdfPage,9);assert.equal(r.source.printedPage,7);assert.equal(r.source.sourceStatus,'suggestive-contextualisable-source-position');
 const readiness=s.readiness.records.filter(x=>x.key===sourceKey),sensory=s.sensory.records.filter(x=>x.key===sourceKey);assert.equal(readiness.length,1);assert.equal(sensory.length,1);assert.equal(readiness[0].disposition,'Unverified');assert.equal(sensory[0].disposition,'Unverified');assert.deepEqual(sensory[0].contributions,[]);assert.equal(readiness[0].graphRepresentation,r.graphRepresentation);
 assert.equal(s.alignments.filter(a=>a.standards.includes(sourceKey)).length,0);
 assert.deepEqual(r.supportingSources.map(x=>x.printedPages),[[49,54,55],[350]]);
 const examples=r.originalInterpretationWitness.sequences;assert.deepEqual(examples.map(x=>[x.id,x.degrees]),[['adjacent-monotone',[1,2,3,4]],['skipping-monotone',[1,3,5,7]],['direction-reversal',[1,3,2,4]]]);
 const adjacent=notes=>{const ds=notes.slice(1).map((v,i)=>v-notes[i]);return ds.every(d=>d===1)||ds.every(d=>d===-1);};
 const directional=notes=>{const ds=notes.slice(1).map((v,i)=>v-notes[i]);return ds.every(d=>d>0)||ds.every(d=>d<0);};
 for(const e of examples){assert.equal(e.adjacentStepRule,adjacent(e.degrees));assert.equal(e.singleDirectionRule,directional(e.degrees));}
 assert.notEqual(examples[1].adjacentStepRule,examples[1].singleDirectionRule);
 assert.deepEqual(r.candidateReviews.map(x=>x.topicId),['mt_zwiJAMjtMU','mt_2mb17lUCPD','mt_Gy9nCgUjlD','mt_OTFABm2xdf','mt_KTSoXcO7OL']);for(const c of r.candidateReviews)assert.ok(s.topics.some(t=>t.id===c.topicId));
 for(const v of Object.values(r.reviewLimits))assert.equal(v,true);
 assert.equal(r.decision.retainUnverified,true);for(const k of ['newTopics','newAssociations','ageChanges','learnerOperations'])assert.equal(r.decision[k],0);
}
test('one exact source exception stays visible across the ledger, sensory report and graph',()=>qualify(state()));
test('the analytic ambiguity witness yields genuinely different classifications',()=>{for(const change of [s=>s.review.originalInterpretationWitness.sequences[1].degrees=[1,2,3,4],s=>s.review.originalInterpretationWitness.sequences[1].adjacentStepRule=true]){const s=state();change(s);assert.throws(()=>qualify(s));}});
test('staff or pitch mastery cannot silently become this unresolved source association',()=>{const s=state();s.alignments.find(a=>a.topicId==='mt_Gy9nCgUjlD').standards.push(sourceKey);assert.throws(()=>qualify(s));});
test('counted catalogue review cannot promote the unverified meaning or hide it in a component',()=>{for(const change of [s=>s.readiness.records.find(x=>x.key===sourceKey).disposition='Full',s=>s.sensory.records.find(x=>x.key===sourceKey).contributions=[{topicId:'mt_zwiJAMjtMU'}]]){const s=state();change(s);assert.throws(()=>qualify(s));}});
