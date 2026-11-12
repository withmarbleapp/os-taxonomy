import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../reports/${p}`,import.meta.url),'utf8');
const report=JSON.parse(read('ontario-kindergarten-local-community-current-overlay-2026-11-12.json'));
const prefix='the-ontario-curriculum-kindergarten-2026:ON-K-2026-K-';
const codes=['D22','D22.1','D22.2','D23','D23.1','D23.2','D23.3'];
function pointer(o,p){return p.split('/').slice(1).reduce((v,k)=>v?.[k],o);}
function heading(get,path,title){assert.ok(get(path).split(/\r?\n/).some(x=>x.replace(/^#{1,6} /,'')===title),'actual resource heading resolves');}
function check(r=report,get=read){
 assert.deepEqual(r.records.map(x=>x.key),codes.map(x=>prefix+x));
 for(const row of r.records){
  assert.equal(row.disposition,'Full');assert.equal(row.historicalDisposition,'Partial');assert.equal(row.actualLocalConfigurationComplete,false);assert.equal(row.actualLearnerObservationOrCarePerformed,false);assert.equal(row.requiresIndependentPerformance,true);assert.equal(row.independentOverallNotChildRollup,!row.code.includes('.'));
  const old=JSON.parse(get(row.priorReport)).records.find(x=>x.code===row.code);assert.equal(old.disposition,'Partial');assert.deepEqual(row.topicContributions,old.topicContributions);heading(get,row.resource,row.protocolHeading);
 }
 assert.deepEqual(r.mixedScopeRecords.map(x=>x.key),['C17.2','C18'].map(x=>prefix+x));
 for(const row of r.mixedScopeRecords){
  assert.equal(row.disposition,'Partial');assert.equal(row.wholeSourceComplete,false);assert.equal(row.excludedPhysicalEducationClaimed,false);assert.equal(row.actualLearnerObservationOrCarePerformed,false);assert.match(row.scopedAuthoringStatus,/Complete in-scope non-PE/);heading(get,row.resource,row.protocolHeading);
  const old=JSON.parse(get(row.priorReport)).records.find(x=>x.code===row.code);assert.equal(old.disposition,'Partial');assert.deepEqual(row.topicContributions,old.topicContributions);
 }
 assert.equal(r.mixedScopeRecords[0].observableSupportedPersistenceRequired,true);assert.equal(r.mixedScopeRecords[1].variedFineMotorTasksAndContextsRequired,true);
 for(const k of ['actualCoarseLocalityRequiredBeforeDelivery','actualOrganismKeyAndLocalObservationRequiredForWholeClaim','actualCareActionRequiredBeforeCredit','d22IndependentPeoplePlaceFunctionSynthesisRequired','d23IndependentEnvironmentChangeCareSynthesisRequired'])assert.equal(r.contracts[k],true);
 for(const k of ['sourceOnlySuccessAwardsWholeTopic','nonlocalExampleMayBeRelabelledLocal','predictedConsequenceIsObservedOutcome','suppliedImageIsPerformedFieldwork','actualLocalConfigurationComplete','actualLearnerAttainmentClaimed','canonicalDataChanged','wholeSourcePEComponentClaimed','denominatorChanged'])assert.equal(r.contracts[k],false);
 for(const b of r.priorPublicBindings){const o=JSON.parse(get(b.report));for(const p of b.pointers)assert.ok(pointer(o,p),'prior complete resource/protocol resolves');}
 for(const b of r.priorReadableBindings)heading(get,b.resource,b.protocolHeading);
 const md=get(r.records[0].resource);for(const p of ['High Park Nature Centre','Fort York library','two actual local environments','independent overall','blank record with date/place','Correct production alone is insufficient','varied controlled small-movement tasks'])assert.ok(md.includes(p),'complete resource or operation is retained');
 assert.equal(r.progress.accountedMixedScopeWithinPartial,2);assert.equal(r.progress.draftWholeSourcePartialAfter,43);assert.equal(r.progress.remainingUnqualifiedInScopeAfter,41);
}
test('seven local Kindergarten authoring contracts and two mixed-scope rows preserve actual evidence and whole duties',()=>check());
test('configuration, fieldwork, care, whole-parent and PE shortcuts fail closed',()=>{
 for(const k of ['nonlocalExampleMayBeRelabelledLocal','predictedConsequenceIsObservedOutcome','suppliedImageIsPerformedFieldwork','wholeSourcePEComponentClaimed','denominatorChanged']){const r=structuredClone(report);r.contracts[k]=true;assert.throws(()=>check(r));}
 for(const k of ['actualCareActionRequiredBeforeCredit','d22IndependentPeoplePlaceFunctionSynthesisRequired','d23IndependentEnvironmentChangeCareSynthesisRequired']){const r=structuredClone(report);r.contracts[k]=false;assert.throws(()=>check(r));}
 const pe=structuredClone(report);pe.mixedScopeRecords[0].disposition='Full';assert.throws(()=>check(pe));
 const persistence=structuredClone(report);persistence.mixedScopeRecords[0].observableSupportedPersistenceRequired=false;assert.throws(()=>check(persistence));
 const missing=structuredClone(report);missing.records[3].protocolHeading='Missing overall';assert.throws(()=>check(missing),/heading resolves/);
 const prior=structuredClone(report);prior.priorPublicBindings[0].pointers.push('/resources/missing');assert.throws(()=>check(prior),/prior complete/);
});
