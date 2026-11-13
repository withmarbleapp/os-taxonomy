import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL(`../reports/${f}`,import.meta.url),'utf8');
const report=JSON.parse(read('ontario-grade3-plants-uses-current-overlay-2026-11-13.json'));
function check(r,get=read){
 assert.deepEqual(r.records.map(x=>x.code),['B1','B1.1','B1.3','B2','B2.2','B2.5','B2.6','B2.7']);
 for(const row of r.records){
  assert.equal(row.disposition,'Full');assert.equal(row.wholeTopicAwardFromSourceResult,false);assert.equal(row.actualProgrammeOrLearnerEvidenceClaimed,false);
  const body=get(row.resource).split(`## ${row.protocolHeading}\n`)[1]?.split('\n## ')[0];
  assert.ok(body&&body.length>500,'actual independent protocol resolves');assert.match(body,/fresh|change/i);
  if(['B1','B2'].includes(row.code))assert.equal(row.independentOverallNotChildRollup,true);
 }
 for(const f of r.boundResources)assert.ok(get(f).length>500,'prior whole resource resolves');
 for(const v of Object.values(r.negativeBoundaries))assert.equal(v,false);
 assert.equal(r.localityContract.TorontoAssumedEveryLearnersLocality,false);assert.equal(r.localityContract.verifiedActualLocalSettingRequired,true);
 assert.deepEqual(r.cultivationBindings.map(a=>a.group),['First Nation','Metis','Inuit']);
 assert.equal(r.sourceDutyContract.actualCultivationExampleFirstNationMetisInuit,true);assert.equal(r.sourceDutyContract.gatheredBerriesAloneCalledCultivation,false);
 assert.equal(r.sourceDutyContract.allNinePartsWithFunctions,true);assert.equal(r.sourceDutyContract.allFourUsesVariousCultures,true);
 assert.equal(r.preservation.canonicalChanges,0);assert.deepEqual(r.historicalSpecificRowsOutsideFreshRecertification,['B1.2','B2.1','B2.3','B2.4','B2.8']);
 const md=get(r.records[0].resource);
 for(const phrase of ['Complete thirteen-card operational appendix','stamen','pistil','cone','carbon dioxide','oxygen','KalaDera','BettyKogvik','CreditRiver','year-round produce','dated actual observations','bagged/open-flower','two explicit guide absences'])assert.ok(md.includes(phrase),'full source/whole-path resource: '+phrase);
 assert.ok(!md.includes('seasonal field produce, stored produce'));
}
test('plant eight duties bind complete anatomy, process, uses, cultivation and independent overalls',()=>check(report));
test('plant qualification rejects missing protocols, false cultivation/locality and older whole awards',()=>{
 assert.throws(()=>check(report,f=>read(f).replace('## B2 independent integrated assessment','## deleted')),/protocol resolves/);
 for(const k of Object.keys(report.negativeBoundaries)){const m=structuredClone(report);m.negativeBoundaries[k]=true;assert.throws(()=>check(m));}
 const m=structuredClone(report);m.cultivationBindings.pop();assert.throws(()=>check(m));
 const l=structuredClone(report);l.localityContract.TorontoAssumedEveryLearnersLocality=true;assert.throws(()=>check(l));
 const o=structuredClone(report);o.records[3].independentOverallNotChildRollup=false;assert.throws(()=>check(o));
 assert.throws(()=>check(report,f=>f.includes('local-habitat-community-task')?'':read(f)),/prior whole resource/);
});
