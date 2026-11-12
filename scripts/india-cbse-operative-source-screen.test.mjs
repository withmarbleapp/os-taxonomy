import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../reports/${p}`,import.meta.url),'utf8');
const ledger=JSON.parse(read('india-cbse-current-implementation-applicability-2026-11-12.json'));
function check(d=ledger,get=read){
 assert.deepEqual(d.records.map(x=>x.indexNumber).sort((a,b)=>a-b),Array.from({length:77},(_,i)=>i+1),'exact finite77 IDs');
 assert.equal(d.counts.totalDistinctBodiesWithBoundedOperativeReview,77);assert.equal(d.counts.indexOnlyScreenedBodies,0);assert.equal(d.counts.newOperativeBodiesRead,71);assert.equal(d.counts.priorCoreBodiesReviewed,6);
 for(const r of d.records){assert.equal(r.bodyRead,true,'actual bounded body read');assert.ok(r.sha256?.match(/^[0-9a-f]{64}$/));assert.ok(r.url.startsWith('https://cbseacademic.nic.in/'));assert.ok(r.typedDisposition&&r.primaryDecision&&r.timeApplicability,'each actual applicability decision');assert.equal(r.masteryRecordsAdded,0);assert.equal(r.actualSchoolImplementationClaimed,false);assert.ok(r.readScope,'explicit read boundary'); assert.ok(!JSON.stringify(r).toLowerCase().replace(/[^a-z]/g,'').includes('conceptnoteimagenotyetverified'),'no compressed obsolete concept-read claim'); assert.equal(r.screeningDisposition,undefined,'no stale index-only field'); assert.doesNotMatch(JSON.stringify(r),/indexscreened only|actual body scope.*unverified|concept.?note image not.{0,10}verified/i,'no current source-read contradiction');}
 for(const n of [17,25,31,32,33,40,46,70])assert.match(d.records.find(x=>x.indexNumber===n).typedDisposition,/non-primary/,'specific source eligibility retained');
 assert.match(d.records.find(x=>x.indexNumber===31).primaryDecision,/VI–X andXI–XII/);
 assert.match(d.records.find(x=>x.indexNumber===70).primaryDecision,/does not repeal primary/);
 assert.match(d.records.find(x=>x.indexNumber===45).timeApplicability,/5 September/);
 assert.doesNotMatch(d.remainingFiniteGates.join(' '),/review.{0,10}37.*index.only/i,'completed screen has no stale body-read gate'); assert.equal(d.publicationBoundary.allAnnexesRead,false);assert.equal(d.curriculumBoundary.additionalMasteryRecordsAuthoredByThisAudit,0);assert.equal(d.curriculumBoundary.overallIndiaDenominator,null);
 for(const type of ['sourceMeaning','sourceEditionApplicability','programmeIdentity','implementationConditional','scopeBoundary'])assert.ok(d.remainingGateTypes[type]?.length);
 const md=get('india-cbse-current-implementation-accounting-2026-11-12.md');for(const text of ['All 37 previously index-only bodies','no index-only entry remains','secondary CT/AI amendment','Programme-specific annexes','school opportunity','500–600-word','Musical'])assert.ok(md.toLowerCase().includes(text.toLowerCase()),'concrete contract retained: '+text);
}
test('finite77 operative screen binds every body to exact applicability without inferring mastery or delivery',()=>check());
test('missing body decisions, eligibility and implementation/source boundaries cannot certify finite screen',()=>{
 const missing=structuredClone(ledger);missing.records.pop();assert.throws(()=>check(missing),/finite77/);
 const unread=structuredClone(ledger);unread.records[0].bodyRead=false;assert.throws(()=>check(unread),/body read/);
 const stale=structuredClone(ledger);stale.records[0].screeningDisposition='Indexscreened only';assert.throws(()=>check(stale),/stale index-only/);
 const gate=structuredClone(ledger);gate.remainingFiniteGates.push('Review the37 index-only bodies');assert.throws(()=>check(gate),/stale body-read gate/);
 const concept=structuredClone(ledger);concept.records.find(x=>x.indexNumber===2).timeApplicability='concept-note image not yet verified';assert.throws(()=>check(concept),/contradiction|obsolete/);
 const compressed=structuredClone(ledger);compressed.records.find(x=>x.indexNumber===2).timeApplicability='conceptnoteimage notyetverified';assert.throws(()=>check(compressed),/obsolete concept-read/);
 const unknown=structuredClone(ledger);unknown.records[0].primaryDecision='';assert.throws(()=>check(unknown),/applicability decision/);
 const repeal=structuredClone(ledger);repeal.records.find(x=>x.indexNumber===70).primaryDecision='Primary repealed';assert.throws(()=>check(repeal));
 const annex=structuredClone(ledger);annex.publicationBoundary.allAnnexesRead=true;assert.throws(()=>check(annex));
 const scope=structuredClone(ledger);scope.curriculumBoundary.overallIndiaDenominator=77;assert.throws(()=>check(scope));
 assert.throws(()=>check(ledger,p=>read(p).replace('All 37 previously index-only bodies','Some unread titles')),/contract retained/);
});
