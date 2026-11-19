import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL(`../reports/${f}`,import.meta.url),'utf8');
const report=JSON.parse(read('ontario-grade3-forces-motion-current-overlay-2026-11-13.json'));
function check(r,get=read){
 assert.deepEqual(r.records.map(x=>x.code),['C1','C1.1','C1.2','C2']);
 for(const row of r.records){
  assert.equal(row.disposition,'Full');assert.equal(row.wholeTopicAwardFromSourceResult,false);assert.equal(row.actualProgrammeOrLearnerEvidenceClaimed,false);
  const body=get(row.resource).split(`## ${row.protocolHeading}\n`)[1]?.split('\n## ')[0];
  assert.ok(body&&body.length>800,'complete independent protocol resolves');assert.match(body,/Fresh|fresh/);
  if(['C1','C2'].includes(row.code))assert.equal(row.independentOverallNotChildRollup,true);
 }
 for(const f of r.boundResources)assert.ok(get(f).length>500,'bound prior resource resolves');
 for(const v of Object.values(r.negativeBoundaries))assert.equal(v,false);
 assert.equal(r.preservation.canonicalChanges,0);
 assert.deepEqual(r.historicalSpecificRowsOutsideFreshRecertification,['C2.1','C2.2','C2.3','C2.4']);
 assert.equal(r.wholePath.wholeCards,11);assert.equal(r.wholePath.hardEdges,8);assert.equal(r.wholePath.savedGuides,10);
 assert.equal(r.sourceFactBindings.length,5);
 const md=get(r.records[0].resource);
 for(const phrase of ['Complete eleven-card operational support appendix','not Ontario compliance rules','before observation','no guaranteed stopping order','same sliding block','at least three surfaces','actual comparison','two solutions','weight','mass','air resistance','upthrust','pupil experiment','two distinct activities']){
  if(phrase==='before observation')assert.match(md,/prediction|predict/i);else assert.ok(md.includes(phrase),'source/whole-path boundary '+phrase);
 }
}
test('forces portfolio resolves all four protocols and full inherited operational boundaries',()=>check(report));
test('forces qualification rejects deleted protocols, imported rules, child rollup and fabricated evidence',()=>{
 assert.throws(()=>check(report,f=>read(f).replace('## C2 independent motion and change assessment','## deleted')),/protocol resolves/);
 for(const k of Object.keys(report.negativeBoundaries)){const m=structuredClone(report);m.negativeBoundaries[k]=true;assert.throws(()=>check(m));}
 const m=structuredClone(report);m.records[0].independentOverallNotChildRollup=false;assert.throws(()=>check(m));
 assert.throws(()=>check(report,f=>f.includes('soils-task-design')?'':read(f)),/prior resource/);
});
