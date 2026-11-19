import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = f => readFileSync(new URL(`../reports/${f}`,import.meta.url),'utf8');
const overlay=JSON.parse(read('ontario-grade2-air-water-properties-current-overlay-2026-11-12.json'));
function check(r,get=read){
 assert.deepEqual(r.records.map(x=>x.code),['E2.1','E2']);
 assert.deepEqual(r.historicalSpecificRowsOutsideFreshRecertification,['E2.3','E2.4','E2.5']);
 for(const row of r.records){
  assert.equal(row.disposition,'Full');assert.equal(row.wholeTopicAwardFromSourceResult,false);assert.equal(row.actualLearnerOrProgrammeEvidenceClaimed,false);
  const md=get(row.resource),body=md.split(`## ${row.protocolHeading}\n`)[1]?.split('\n## ')[0];
  assert.ok(body&&body.length>1000,'actual independently assessed protocol heading/body resolves');
  assert.match(body,/fresh|different|change/i,'changed independent case');
  if(row.code==='E2')assert.equal(row.independentOverallNotChildRollup,true);
 }
 for(const f of r.boundResources)assert.ok(get(f).length>500,'prior resource remains resolvable');
 for(const k of ['airAndWaterPropertiesExplicit','threeWaterStatesAndTemperatureChanges','cycleEvaporationCondensationPrecipitationCollection','plantAnimalHumanAirWaterDependence','freshChangedCaseAndIndependentOverall'])assert.equal(r.sourceRequirements[k],true);
 assert.equal(r.sourceRequirements.teacherFactsAloneCountAsIndependentEvidence,false);assert.equal(r.sourceRequirements.sourceModelsClaimedAsPerformedInvestigations,false);
 assert.equal(r.deliveryConditions.borrowedPhotoRelabelledLocalSky,false);assert.equal(r.wholePath.phaseTaxonomyGateAdded,false);
 for(const k of ['newTopics','newPairs','newContexts','ageChanges','guideOrFlagChanges','edgeChanges'])assert.equal(r.preservation[k],0);
 const md=get(r.records[0].resource);
 for(const s of ['12dots','constant-temperature melting','cirrus','100°C','actual result','not by itself measure air','some oxygen remains','all eleven whole hard-path cards'])assert.ok(md.includes(s),'source/whole operation retained: '+s);
}
test('two water source protocols resolve independent tasks, retained whole extras and prior resources',()=>check(overlay));
test('water authoring rejects missing protocols/resources, rollup and unperformed-evidence claims',()=>{
 assert.throws(()=>check(overlay,p=>read(p).replace('## E2 independent connected source assessment','## missing overall')),/heading\/body/);
 assert.throws(()=>check(overlay,p=>p.includes('household-water-sources-review')?'':read(p)),/prior resource/);
 const roll=structuredClone(overlay);roll.records[1].independentOverallNotChildRollup=false;assert.throws(()=>check(roll));
 const model=structuredClone(overlay);model.sourceRequirements.sourceModelsClaimedAsPerformedInvestigations=true;assert.throws(()=>check(model));
 const prior=structuredClone(overlay);prior.historicalSpecificRowsOutsideFreshRecertification.pop();assert.throws(()=>check(prior));
 assert.throws(()=>check(overlay,p=>read(p).replace('constant-temperature melting','unqualified change')),/whole operation/);
});
