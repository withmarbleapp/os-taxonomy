import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL(`../reports/${f}`,import.meta.url),'utf8');
const report=JSON.parse(read('ontario-grade6-local-action-human-needs-current-overlay-2026-11-13.json'));
function check(r,get=read){
 assert.deepEqual(r.records.map(x=>x.code),['B1.2','E1.1']);
 for(const row of r.records){assert.equal(row.disposition,'Full');assert.equal(row.wholeTopicAwardFromSourceResult,false);assert.equal(row.actualProgrammeOrLearnerEvidenceClaimed,false);assert.equal(row.independentSourcePerformanceRequired,true);const md=get(row.resource);const section=md.split(`## ${row.protocolHeading}\n`)[1]?.split('\n## ')[0];assert.ok(section?.length>1000,'complete independent source protocol resolves');assert.match(section,/Fresh|fresh/);}
 for(const file of r.boundResources){const body=get(file);assert.ok(body.length>1000,'prior complete resource resolves');if(file.endsWith('.json'))assert.ok(JSON.parse(body));}
 assert.equal(r.canonicalChanges,0);assert.equal(r.historicalOtherGrade6RowsOutsideFreshRecertification,true);
 assert.equal(r.localityContract.TorontoAssumedEveryLearnersCommunity,false);assert.equal(r.localityContract.actualLocalIssueSourcesPerspectivesAudienceAndPermissionRequired,true);assert.equal(r.localityContract.actualLearnerActionRequiredAtDelivery,true);for(const k of ['authorClaimsActualActionOccurred','actionEvidenceMayBeInventedOrAnotherGroupsAction','ecologicalImprovementGuaranteedByCommunication'])assert.equal(r.localityContract[k],false);
 for(const k of ['completeSocialEmotionalPhysiologicalNeeds','conditionImpactResponseLimitExplanationRequired','freshHtoJReassessmentRequired'])assert.equal(r.spaceSourceContract[k],true);for(const k of ['olderMarsWholeAwardFromPrimarySubset','oldMarsSplitOrAgeLoweringRequired','privateAffectOrClinicalDisclosureRequired','noGravityInOrbitClaimed','physicalSuppliesReplaceAllSocialNeeds'])assert.equal(r.spaceSourceContract[k],false);
 for(const v of Object.values(r.negativeBoundaries))assert.equal(v,false);
 assert.deepEqual([r.wholePath.sourceContributorsAndHardAncestors,r.wholePath.presentSavedGuides,r.wholePath.explicitGuideAbsences,r.wholePath.hardEdges],[18,12,6,14]);
 const md=get(r.records[0].resource);for(const phrase of ['actual audience','actually carries out','separately','Orbiting habitat H','Fresh transfer **J**','three contrasting real community cases','SAME pumpable ball','buoyancy','night','older JourneyToMars compound'])assert.ok(md.toLowerCase().includes(phrase.toLowerCase()),'complete authored/delivery boundary: '+phrase);
}
test('G6 two source duties bind actual-action and all-three-needs independent portfolios with complete existing paths',()=>check(report));
test('G6 qualification rejects missing protocols/resources, false enactment/locality and older whole-topic awards',()=>{
 assert.throws(()=>check(report,f=>read(f).replace('## E1.1 independent complete assessment and changed conditions','## deleted')),/protocol resolves/);
 assert.throws(()=>check(report,f=>f.includes('air-water-quality')?'':read(f)),/prior complete resource/);
 for(const k of Object.keys(report.negativeBoundaries)){const m=structuredClone(report);m.negativeBoundaries[k]=true;assert.throws(()=>check(m));}
 const m=structuredClone(report);m.localityContract.actualLearnerActionRequiredAtDelivery=false;assert.throws(()=>check(m));const n=structuredClone(report);n.spaceSourceContract.olderMarsWholeAwardFromPrimarySubset=true;assert.throws(()=>check(n));
});
