import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));
const ledger=read('reports/ontario-hpe-primary-review-2026-11-11.json');
const tasks=read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const alignments=read('data/curriculum-alignments.json').alignments;
const expected={B1:['active-readiness-and-variety','personal-enjoyment-and-access','daily-options-motivation-and-barriers'],'B1.1':['active-readiness-and-variety'],'B1.2':['personal-enjoyment-and-access'],'B1.3':['daily-options-motivation-and-barriers'],B2:['daily-activity-preparation-and-recovery','notice-and-assess-exertion'],'B2.1':['daily-activity-preparation-and-recovery'],'B2.2':['physical-and-mental-benefits'],'B2.3':['notice-and-assess-exertion'],'B2.4':['implement-personal-and-group-goals']};
const clone=structuredClone;
function qualify(l=ledger,p=tasks,a=alignments){
 const rows=l.records.filter(r=>/^B[12](\.|$)/.test(r.officialCode));assert.equal(rows.length,53);
 const ps=new Map(p.protocols.map(r=>[r.id,r]));
 const actualKeys=rows.map(r=>r.sourceKey);assert.equal(new Set(actualKeys).size,53);
 for(let grade=1;grade<=6;grade++){
  const codes=['B1','B1.1','B1.2','B1.3','B2','B2.1','B2.2','B2.3',...(grade>=2?['B2.4']:[])];
  assert.deepEqual(rows.filter(r=>r.grade===grade).map(r=>r.officialCode).sort(),codes.sort());
 }
 for(const row of rows){
  assert.equal(row.disposition,'Full');
  const required=(row.officialCode==='B2.2'&&row.grade===5)?['capacity-model-and-purpose']:expected[row.officialCode];
  for(const id of required){assert.ok(row.protocolIds.includes(id),`missing record-bound ${id}`);assert.ok(ps.has(id));}
  if(row.officialCode==='B2.2'&&[4,6].includes(row.grade))assert.ok(row.protocolIds.includes('capacity-model-and-purpose'));
  if(row.officialCode==='B2.3'&&row.grade>=5)assert.ok(row.protocolIds.includes('longitudinal-capacity-review'));
  if(row.officialCode==='B2.4'&&row.grade>=5)assert.ok(row.protocolIds.includes('longitudinal-capacity-review'));
  if(row.grade===6&&['B2.3','B2.4'].includes(row.officialCode))assert.ok(row.protocolIds.includes('capacity-model-and-purpose'));
  assert.equal(row.sourceRequirements.noForcedMood,true);
  if(['B1','B2'].includes(row.officialCode)){
   const children=rows.filter(r=>r.grade===row.grade&&r.officialCode.startsWith(row.officialCode+'.'));
   assert.deepEqual(row.includesSourceKeys,children.map(r=>r.sourceKey));
   for(const child of children)for(const id of child.protocolIds)assert.ok(row.protocolIds.includes(id),'overall must retain complete actual child task closure');
  }
  for(const c of row.topicContributions){
   assert.equal(c.role,'component');assert.equal(c.wholeClaimAssessmentRetained,true);
   const matching=a.filter(r=>r.topicId===c.topicId&&r.standards.includes(row.sourceKey));
   assert.equal(matching.length,1,'one exact scoped contribution');
   assert.deepEqual([matching[0].country,matching[0].region,matching[0].ageRangeStart,matching[0].ageRangeEnd],['CA','Ontario',row.grade+5,row.grade+6]);
  }
 }
 const dpa=ps.get('daily-activity-preparation-and-recovery').conditions;
 assert.equal(dpa.sourceMinimumMinutes,20);assert.equal(dpa.frequency,'daily');
 for(const k of ['warmUp','coolDown','actualParticipation','bestOfAbility','noNormativeFitnessScore'])assert.equal(dpa[k],true);
 const longitudinal=ps.get('longitudinal-capacity-review').conditions;
 assert.equal(longitudinal.G5Components,'one selected component');assert.equal(longitudinal.G6Components,'all four declared components');
 assert.equal(longitudinal.actualRepeatedObservations,true);assert.equal(longitudinal.noInventedLearnerRecord,true);
 const goal=ps.get('implement-personal-and-group-goals').conditions;
 for(const k of ['actualImplementation','timeframe','monitorAndAdjust','interestAndAssessmentBased','G2GroupGoal'])assert.equal(goal[k],true);
 assert.equal(ps.get('personal-enjoyment-and-access').conditions.noPositiveFeelingQuota,true);
 assert.equal(ps.get('physical-and-mental-benefits').conditions.physicalAndMental,true);
 return rows;
}
test('53 Active Living source identities, child closures, task conditions and exact scoped components reconcile',()=>qualify());
test('another valid movement protocol cannot replace actual daily preparation/recovery',()=>{const l=clone(ledger);l.records.find(r=>r.grade===1&&r.officialCode==='B2.1').protocolIds=['travel-jump-land'];l.records.find(r=>r.grade===1&&r.officialCode==='B2').protocolIds.push('travel-jump-land');assert.throws(()=>qualify(l),/record-bound/);});
test('warm-up cannot conceal missing cool-down or a changed daily source minimum',()=>{for(const key of ['coolDown','sourceMinimumMinutes']){const p=clone(tasks);p.protocols.find(r=>r.id==='daily-activity-preparation-and-recovery').conditions[key]=key==='coolDown'?false:10;assert.throws(()=>qualify(ledger,p));}});
test('concept knowledge cannot substitute for the actual longitudinal record',()=>{const l=clone(ledger);l.records.find(r=>r.grade===6&&r.officialCode==='B2.3').protocolIds=['capacity-model-and-purpose','notice-and-assess-exertion'];assert.throws(()=>qualify(l));});
test('an unimplemented plan and a compulsory enjoyment criterion fail qualification',()=>{for(const [id,key]of [['implement-personal-and-group-goals','actualImplementation'],['personal-enjoyment-and-access','noPositiveFeelingQuota']]){const p=clone(tasks);p.protocols.find(r=>r.id===id).conditions[key]=false;assert.throws(()=>qualify(ledger,p));}});
test('a valid topic association at the wrong grade band is not accepted by pair count',()=>{const a=clone(alignments);const key=`${ledger.source}:ON-HPE-2019-G1-B1.1`;const r=a.find(r=>r.standards.includes(key));r.ageRangeStart=11;r.ageRangeEnd=12;assert.throws(()=>qualify(ledger,tasks,a));});
