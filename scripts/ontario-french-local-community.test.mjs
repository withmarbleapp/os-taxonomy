import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url)));
const report=load('reports/ontario-french-local-community-current-overlay-2026-11-12.json');
const historical=load('reports/ontario-french-programme-culture-design-2026-11-11.json');
const md=readFileSync(new URL('../reports/ontario-french-local-community-portfolio-2026-11-12.md',import.meta.url),'utf8');
function check(r=report){
 const old=historical.records.filter(x=>x.disposition==='Partial');assert.equal(old.length,24);
 assert.deepEqual(r.records.map(x=>x.key),old.map(x=>x.key));
 assert.deepEqual(r.records.reduce((a,x)=>(a[x.grade]=(a[x.grade]??0)+1,a),{}),{1:8,2:8,3:8});
 for(const row of r.records){
  const prior=old.find(x=>x.key===row.key);assert.equal(row.disposition,'Full');assert.equal(row.historicalDisposition,'Partial');assert.equal(row.actualLocalityOrLearnerCompletionCertified,false);
  assert.deepEqual(row.topicIds,prior.topicIds);assert.deepEqual(row.ageBand,prior.ageBand);assert.equal(row.role,'component');
  const p=row.protocolReference.split('/').slice(1).reduce((v,k)=>v?.[k],r);assert.equal(p.requiresIndependentPerformance,true);assert.equal(p.actualFrenchPerformanceRequired,true);assert.equal(p.copiedCompleteAnswerSufficient,false);
  assert.ok(p.requirements.includes('actual-local-configuration-or-truthful-substitution'));assert.ok(p.requirements.includes('actual-own-class-and-other-community-connection'));assert.ok(p.requirements.includes('grade3-local-and-complete-Ontario-repertoire'));
  if(!row.code.includes('.')){assert.equal(p.independentOverallNotChildRollup,true);assert.ok(p.requirements.includes('world-community-comparison'));assert.ok(p.requirements.includes('sociolinguistic-conventions-in-actual-channel'));}
  if(row.code.startsWith('B')||row.code.startsWith('D'))assert.equal(p.outwardContributionRequired,true);
 }
 assert.equal(r.contracts.locality.workedExampleIsLearnerLocality,false);assert.equal(r.contracts.locality.requiresActualCoarseLocalityBasisBeforeDelivery,true);assert.equal(r.contracts.locality.nonlocalExampleMayBeRelabelledLocal,false);
 assert.equal(r.contracts.sourceEvidence.missionAloneSufficient,false);
 for(const k of ['actualLocalConfigurationComplete','actualLearnerAttainmentClaimed','actualClassConnectionPerformed','neutralEnglishTranslationReplacesFrenchPerformance','adultReadAloudReplacesLearnerReading','futurePlanMayCountAsPerformedExperience'])assert.equal(r.contracts.delivery[k],false);
 assert.equal(r.contracts.delivery.actualClassConnectionRequiredBeforeCredit,true);assert.equal(r.contracts.wholeClaims.sourceOnlySuccessAwardsWholeTopic,false);assert.equal(r.contracts.wholeClaims.oldCanonicalDataChanged,false);
 assert.match(md,/2015/);assert.match(md,/Spadina/);assert.match(md,/Parameterised local substitution contract/);assert.match(md,/Full hard-path support and independent boundaries/);
}
test('French24 current overlay retains historical record and all independent channel/locality gates',()=>check());
test('nonlocal relabelling, supplied reading, missing world integration or copied answers cannot certify coverage',()=>{
 for(const key of ['workedExampleIsLearnerLocality','nonlocalExampleMayBeRelabelledLocal']){const r=structuredClone(report);r.contracts.locality[key]=true;assert.throws(()=>check(r));}
 const read=structuredClone(report);read.contracts.delivery.adultReadAloudReplacesLearnerReading=true;assert.throws(()=>check(read));
 const world=structuredClone(report);world.protocols.A3.requirements=world.protocols.A3.requirements.filter(x=>x!=='world-community-comparison');assert.throws(()=>check(world));
 const copied=structuredClone(report);copied.protocols['D3.1'].copiedCompleteAnswerSufficient=true;assert.throws(()=>check(copied));
});

function checkReferences(r=report,read=p=>readFileSync(new URL(`../reports/${p}`,import.meta.url),'utf8')){
 for(const protocol of Object.values(r.protocols)){
  const text=read(protocol.resource);const headings=text.split(/\r?\n/).filter(line=>/^#{1,6} /.test(line)).map(line=>line.replace(/^#{1,6} /,''));
  assert.ok(headings.includes(protocol.protocolHeading),`Missing protocol heading ${protocol.protocolHeading} in ${protocol.resource}`);
 }
 for(const binding of r.priorPublicBindings){
  const prior=JSON.parse(read(binding.report));
  const resourceIds=Array.isArray(prior.resources)?prior.resources.map(x=>x.id):Object.keys(prior.resources??{});
  for(const id of binding.resourceIds??[])assert.ok(resourceIds.includes(id),`Missing resource ${id} in ${binding.report}`);
  for(const id of binding.protocolIds??[])assert.ok(Object.hasOwn(prior.protocols??{},id),`Missing protocol ${id} in ${binding.report}`);
 }
 assert.ok(r.priorPublicBindings.some(b=>b.resourceIds?.includes('ottawa-author')&&b.resourceIds?.includes('sudbury-theatre')&&b.resourceIds?.includes('france-music')&&b.resourceIds?.includes('uk-reading')));
}
test('all current protocol headings and prior world/Ontario/whole resource references resolve',()=>{
 checkReferences();
 const renamed=structuredClone(report);renamed.protocols.A3.protocolHeading='Renamed missing overall';assert.throws(()=>checkReferences(renamed));
 const missing=structuredClone(report);missing.priorPublicBindings[0].resourceIds.push('deleted-world-case');assert.throws(()=>checkReferences(missing));
 const absent=structuredClone(report);absent.protocols['D3.1'].resource='missing-portfolio.md';assert.throws(()=>checkReferences(absent));
});
