import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../reports/${p}`,import.meta.url),'utf8');
const report=JSON.parse(read('ontario-social-local-community-current-overlay-2026-11-12.json'));
const expected=['G1-SS-B3','G1-SS-B3.1','G6-SS-A3','G6-SS-A3.1','G6-SS-A3.10'].map(x=>`the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-${x}`);
function pointer(v,p){return p.split('/').slice(1).reduce((o,k)=>o?.[k],v);}
function check(r=report,get=read){
 assert.deepEqual(r.records.map(x=>x.key),expected);
 for(const row of r.records){
  assert.equal(row.disposition,'Full');assert.equal(row.historicalDisposition,'Partial');
  assert.equal(row.actualLocalConfigurationComplete,false);assert.equal(row.actualLearnerAttainmentClaimed,false);assert.equal(row.requiresIndependentPerformance,true);
  const old=JSON.parse(get(row.priorReport));
  const prior=row.grade===1?old.records.find(x=>x.key===row.key):old.expectations.find(x=>x.code===row.code);
  assert.equal(prior.disposition,'Partial','historical snapshot retained');
  assert.deepEqual(row.topicIds,prior.contributions?.map(x=>x.topicId)??prior.contributingTopicIds);
  const md=get(row.resource);const headings=md.split(/\r?\n/).filter(x=>/^#{1,6} /.test(x)).map(x=>x.replace(/^#{1,6} /,''));
  assert.ok(headings.includes(row.protocolHeading),'current protocol heading resolves');
  assert.equal(row.independentOverallNotChildRollup,!row.code.includes('.'));
 }
 for(const b of r.priorPublicBindings){
  const old=JSON.parse(get(b.report));for(const p of b.pointers)assert.ok(pointer(old,p),'prior complete resource/protocol resolves');
  for(const id of b.protocolIds??[])assert.ok(old.assessmentProtocols.some(x=>x.id===id),'exact prior protocol ID remains');
 }
 for(const k of ['actualLocalityRequiredBeforeDelivery','g1IndependentServicesMapDistanceRequired','g6FullCaseBreadthAndIndependentSynthesisRequired','missingConflictingLocalEvidenceMustRemainUnverified'])assert.equal(r.contracts[k],true);
 for(const k of ['nonlocalExampleMayBeRelabelledLocal','actualLocalConfigurationComplete','actualLearnerAttainmentClaimed','sourceOnlySuccessAwardsWholeTopic','canonicalDataChanged','nearestReserveEstablishesTerritory','regionalMapAdjudicatesExclusiveParcelTitle','currentPhotoIsHistoricalBeforePhoto','singlePhotoEstablishesVisitorTrend','modelMeasurementIsRealSurvey'])assert.equal(r.contracts[k],false);
 assert.deepEqual(r.preservedOtherSocialPartials,['G4-A3','G4-A3.10','G5-A2','G5-A2.5','G5-A3','G5-A3.2']);
 const md=get(r.records[0].resource);
 for(const phrase of ['23June2023','two actual services','repeated non-standard units','independent integrated overall','actual FirstNation, Métis and Inuit case','Whole-path operation inventory','centimetre-ruler zero alignment','2023 photograph is not relabelled as a 2016 before photograph'])assert.ok(md.includes(phrase),'complete source/whole task material retained: '+phrase);
}
test('five local Social source closures bind current and historical whole tasks without claiming delivered locality',()=>check());
test('locality/territory/photo/model/parent shortcuts cannot certify the five authoring contracts',()=>{
 for(const k of ['nonlocalExampleMayBeRelabelledLocal','nearestReserveEstablishesTerritory','currentPhotoIsHistoricalBeforePhoto','singlePhotoEstablishesVisitorTrend','modelMeasurementIsRealSurvey','sourceOnlySuccessAwardsWholeTopic']){const r=structuredClone(report);r.contracts[k]=true;assert.throws(()=>check(r));}
 for(const k of ['g1IndependentServicesMapDistanceRequired','g6FullCaseBreadthAndIndependentSynthesisRequired']){const r=structuredClone(report);r.contracts[k]=false;assert.throws(()=>check(r));}
 const missing=structuredClone(report);missing.records[2].protocolHeading='Missing parent';assert.throws(()=>check(missing),/heading resolves/);
 const prior=structuredClone(report);prior.priorPublicBindings[3].pointers.push('/protocols/missing-overall');assert.throws(()=>check(prior),/prior complete/);
 assert.throws(()=>check(report,p=>p.endsWith('.md')?read(p).replace('two actual services','one copied label'):read(p)),/complete source/);
 const extra=structuredClone(report);extra.records.push({...extra.records[0],key:expected[0].replace('G1-SS-B3','G4-SS-A3')});assert.throws(()=>check(extra));
});
