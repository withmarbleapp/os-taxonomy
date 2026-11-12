import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../reports/${p}`,import.meta.url),'utf8');
const report=JSON.parse(read('ontario-grade3-soils-current-overlay-2026-11-12.json'));
const codes=['E1','E2','E2.1','E2.2','E2.6'];
function check(r=report,get=read){
 const old=JSON.parse(get('ontario-grade3-science-mapping-2026-11-09.json'));
 assert.deepEqual(r.records.map(x=>x.code),codes);
 for(const row of r.records){
  const prior=old.expectations.find(x=>x.key===row.key);assert.equal(prior.semanticDisposition,'Partial');assert.equal(row.historicalDisposition,'Partial');assert.equal(row.disposition,'Full');assert.deepEqual(row.existingContributionsUnchanged,prior.contributions);assert.equal(row.newCanonicalAssociations,0);assert.equal(row.requiresIndependentPerformance,true);assert.equal(row.actualLearnerAttainmentClaimed,false);assert.equal(row.sourceOnlyResultAwardsWholeTopic,false);assert.equal(row.independentOverallNotChildRollup,!row.code.includes('.'));
  const md=get(row.resource);assert.ok(md.split(/\r?\n/).some(x=>x.replace(/^#{1,6} /,'')===row.protocolHeading),'actual independent protocol heading resolves');
 }
 assert.deepEqual(r.priorFullRowsOutsideFreshRecertification.map(x=>x.key).sort(),['E1.1','E1.2','E2.3','E2.4','E2.5'].map(x=>`the-ontario-curriculum-science-and-technology-20:ON-SCI-2022-G3-${x}`).sort());
 for(const row of r.priorFullRowsOutsideFreshRecertification){assert.equal(row.freshlyRecertifiedByThisBatch,false);assert.equal(old.expectations.find(x=>x.key===row.key).semanticDisposition,'Full');}
 for(const b of r.priorPublicBindings){const body=JSON.parse(get(b.report));for(const key of b.expectationKeys)assert.ok(body.expectations.some(x=>x.key===key),'prior source row resolves');for(const id of b.resourceIds)assert.ok(body.supportingResources.some(x=>x.id===id),'actual prior Ontario resource binding resolves');}
 for(const k of ['independentHealthFunctionsAndMultipleIndicatorsRequired','addedOrAbsorbedSubstanceAndConditionEffectsRequired','managedCompostingAirMoistureBiologyTimeRequired','changedConditionsAndIndependentReconstructionRequired','overallE1SocietyEnvironmentHumanImpactRequired','overallE2CompositionTypesProcessesRequired','wholeProceduralAwardsRequireActualEvidence'])assert.equal(r.contracts[k],true);
 for(const k of ['soilCompositionAloneCertifiesHealth','oneWormCertifiesAllSoilHealth','decomposerNamingCertifiesComposting','driedScrapsAreFinishedCompost','moreAdditionAlwaysHelps','suppliedModelIsActualObservation','sourceOnlySuccessAwardsWholeTopic','actualLearnerAttainmentClaimed','newTopicOrCanonicalDataChanged','priorFullRowsFreshlyRecertified'])assert.equal(r.contracts[k],false);
 const md=get(r.records[0].resource);for(const phrase of ['air and suitable moisture','tiny organisms acting over time','One worm was found','dried/grind-up scraps','bare control PLUS two protective solutions','designs/tests an additional own barrier','three matching drainage containers','society AND environment','No new topic, component association or younger context'])assert.ok(md.includes(phrase),'complete source/whole resource operation retained: '+phrase);
 assert.equal(r.progress.draftWholeSourcePartialAfter,38);assert.equal(r.progress.draftSciencePartialAfter,30);
}
test('five soil source closures bind independent health/input/compost duties and overalls without recertifying prior Full',()=>check());
test('composition/decomposer/model/rollup shortcuts and missing resources cannot certify soil coverage',()=>{
 for(const k of ['soilCompositionAloneCertifiesHealth','oneWormCertifiesAllSoilHealth','decomposerNamingCertifiesComposting','driedScrapsAreFinishedCompost','moreAdditionAlwaysHelps','suppliedModelIsActualObservation','priorFullRowsFreshlyRecertified']){const r=structuredClone(report);r.contracts[k]=true;assert.throws(()=>check(r));}
 for(const k of ['changedConditionsAndIndependentReconstructionRequired','overallE1SocietyEnvironmentHumanImpactRequired','overallE2CompositionTypesProcessesRequired']){const r=structuredClone(report);r.contracts[k]=false;assert.throws(()=>check(r));}
 const missing=structuredClone(report);missing.records[1].protocolHeading='Missing overall';assert.throws(()=>check(missing),/heading resolves/);
 const prior=structuredClone(report);prior.priorPublicBindings[0].resourceIds.push('missing-ontario-case');assert.throws(()=>check(prior),/prior Ontario resource/);
 const recertify=structuredClone(report);recertify.priorFullRowsOutsideFreshRecertification[0].freshlyRecertifiedByThisBatch=true;assert.throws(()=>check(recertify));
 assert.throws(()=>check(report,p=>p.endsWith('.md')?read(p).replace('tiny organisms acting over time','instant powder'):read(p)),/complete source/);
});
