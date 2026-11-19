import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL(`../reports/${f}`,import.meta.url),'utf8');
const report=JSON.parse(read('ontario-grade4-local-habitat-community-current-overlay-2026-11-13.json'));
function check(r,get=read){
 assert.deepEqual(r.records.map(x=>x.code),['B2','B2.1','B2.2']);
 for(const row of r.records){
  assert.equal(row.disposition,'Full');assert.equal(row.wholeTopicAwardFromSourceResult,false);assert.equal(row.actualProgrammeOrLearnerEvidenceClaimed,false);
  const body=get(row.resource).split(`## ${row.protocolHeading}\n`)[1]?.split('\n## ')[0];
  assert.ok(body&&body.length>800,'independent protocol resolves');assert.match(body,/change|fresh/i);
 }
 assert.equal(r.records[0].independentOverallNotChildRollup,true);
 for(const f of r.boundResources)assert.ok(JSON.parse(get(f)),'prior resource resolves');
 assert.equal(r.localityContract.TorontoAssumedEveryLearnersLocality,false);assert.equal(r.localityContract.verifiedApplicableLocalPacketBeforeDelivery,true);
 assert.equal(r.localityContract.currentCensusClaimed,false);
 assert.equal(r.wholePath.actualSameSpeciesOneFactorGrowthComparison,true);assert.equal(r.wholePath.seedBulbComparisonRequiredByGrowClaim,false);
 assert.equal(r.foodWebContract.nodeCount,7);
 for(const [k,v] of Object.entries(r.foodWebContract))if(k!=='nodeCount')assert.equal(v,true,k);
 assert.equal(r.preservation.canonicalChanges,0);
 assert.deepEqual(r.historicalSpecificRowsOutsideFreshRecertification,['B2.3','B2.4','B2.5','B2.6','B2.7']);
 const md=get(r.records[0].resource);
 for(const phrase of ['same-species, one-factor','prediction before observation','real dated growth','Mammals','mammals-in-high-park/','Grey Squirrels','Eastern Chipmunks','dead oak material→wood-decay fungi','food/energy→eater','two distinct chains','independent integrated','genuinely applicable'])assert.ok(md.includes(phrase),'actual resource boundary '+phrase);
 assert.ok(!md.includes('observed seed stages and seed/bulb comparison'));
}
test('local habitat three duties bind actual inputs, complete operations and independent overall',()=>check(report));
test('habitat qualification rejects deleted protocols, false locality and stronger invented plant duty',()=>{
 assert.throws(()=>check(report,f=>read(f).replace('## B2 independent integrated source assessment','## deleted')),/protocol resolves/);
 const loc=structuredClone(report);loc.localityContract.TorontoAssumedEveryLearnersLocality=true;assert.throws(()=>check(loc));
 const seed=structuredClone(report);seed.wholePath.seedBulbComparisonRequiredByGrowClaim=true;assert.throws(()=>check(seed));
 const roll=structuredClone(report);roll.records[0].independentOverallNotChildRollup=false;assert.throws(()=>check(roll));
 assert.throws(()=>check(report,f=>f.includes('task-design-2026-11-11.json')?'':read(f)));
});
