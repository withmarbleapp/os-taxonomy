import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL(`../reports/${f}`,import.meta.url),'utf8');
const report=JSON.parse(read('ontario-grade2-air-water-quality-local-plan-current-overlay-2026-11-12.json'));
function check(r,get=read){
 assert.deepEqual(r.records.map(x=>x.code),['E1.1','E1']);
 for(const row of r.records){
  assert.equal(row.disposition,'Full');assert.equal(row.wholeTopicAwardFromSourceResult,false);assert.equal(row.actualProgrammeOrLearnerEvidenceClaimed,false);
  const body=get(row.resource).split(`## ${row.protocolHeading}\n`)[1]?.split('\n## ')[0];
  assert.ok(body&&body.length>800,'actual independent protocol heading/body resolves');
  assert.match(body,/change|fresh/i,'independent changed case');
  if(row.code==='E1')assert.equal(row.independentOverallNotChildRollup,true);
 }
 for(const f of r.boundResources)assert.ok(get(f).length>500,'bound prior resource resolves');
 for(const key of ['assessAirAndWaterImpacts','separateFirstNationMetisInuitAttribution','otherRelevantPerspectives','localPlanProtectsAirAndOrWaterQuality','freshChangedConstraintsAndIndependentOverall'])assert.equal(r.sourceContract[key],true);
 for(const key of ['everyGroupRequiredForEveryResource','quantityOnlyPlanSuffices','planRequiresPerformedCampaignOrMeasuredReduction','namedOrganizationsEndorseClassroomPlan'])assert.equal(r.sourceContract[key],false);
 assert.equal(r.localityContract.TorontoAssumedEveryLearnersLocality,false);assert.equal(r.localityContract.actualApplicableLocalSourcesBeforeDelivery,true);
 assert.deepEqual(r.sourceFactBindings.map(x=>x.source),['Atlantic First Nations Water Authority','Metis Nation of Ontario','Inuit Tapiriit Kanatami Autumn2020 Issue2','City of Toronto','Health Canada'],'complete distinct source bindings');
 assert.equal(r.preservation.canonicalChanges,0);assert.equal(r.preservation.newTopicsPairsContextsAgesGuidesOrEdges,0);
 assert.deepEqual(r.historicalSpecificRowsOutsideFreshRecertification,['E1.2','E1.3']);
 const md=get(r.records[0].resource);
 for(const phrase of ['Autumn2020','MNO','Atlantic First Nations Water Authority','quantity and water-pollution prevention','actual applicable','Complete retained twelve-card','BC/BCE','actual independent','No home address']) {
  if(phrase==='actual applicable')assert.match(md,/genuinely local|actual chosen/);
  else if(phrase==='actual independent')assert.match(md,/independently|independent plan/);
  else assert.ok(md.includes(phrase),'source/whole boundary retained: '+phrase);
 }
}
test('local air-water source portfolio binds real perspectives, own plan and independent overall',()=>check(report));
test('quality authoring rejects missing inputs, false locality, quantity substitution and source rollup',()=>{
 assert.throws(()=>check(report,p=>read(p).replace('## E1: separately assessed overall and transfer','## missing overall')),/heading\/body/);
 assert.throws(()=>check(report,p=>p.includes('household-water-sources-task')?'':read(p)),/prior resource/);
 const local=structuredClone(report);local.localityContract.TorontoAssumedEveryLearnersLocality=true;assert.throws(()=>check(local));
 const quantity=structuredClone(report);quantity.sourceContract.quantityOnlyPlanSuffices=true;assert.throws(()=>check(quantity));
 const roll=structuredClone(report);roll.records[1].independentOverallNotChildRollup=false;assert.throws(()=>check(roll));
 const missing=structuredClone(report);missing.sourceFactBindings.splice(2,1);assert.throws(()=>check(missing),/source bindings/);
});
