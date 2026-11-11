import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const ledger=read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme=read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const alignments=read('data/curriculum-alignments.json').alignments;
const catalogue=read('data/curriculum-standards.json').curricula.find(s=>s.slug===ledger.source);
const clone=x=>structuredClone(x);
function expectedProtocol(g,c){
 if(c==='C1.1')return 'balance-transfer';
 if(c==='C1.2'||(c==='C1.3'&&g<6))return 'travel-jump-land';
 if((c==='C1.4'&&g<6)||(c==='C1.3'&&g===6)||(c==='C1.5'&&g<=2))return 'send-receive-variety';
 if(c==='C1.5'||c==='C1.4')return 'retain-while-travelling';
 if(c==='C2.1')return 'components-fair-play';
 if(c==='C2.2'&&g>=4)return 'functional-categories';
 return 'choose-and-apply-tactic';
}
function qualify(l=ledger,p=programme,a=alignments){
 const expected=catalogue.topics.map(t=>t.key).filter(k=>/-G[1-6]-/.test(k));assert.equal(expected.length,267);assert.deepEqual(l.records.map(r=>r.sourceKey).sort(),expected.sort());assert.equal(new Set(l.records.map(r=>r.sourceKey)).size,267);
 const rows=l.records.filter(r=>/^C[12](\.|$)/.test(r.officialCode));assert.equal(rows.length,56);assert(rows.every(r=>r.disposition==='Full'));
 const ps=new Set(p.protocols.map(r=>r.id));const scope=new Map(rows.map(r=>[r.sourceKey,r]));const pairs=new Set();
 for(const r of rows){
  assert.equal(r.ageRangeStart,r.grade+5);assert.equal(r.ageRangeEnd,r.grade+6);assert(r.protocolIds.every(k=>ps.has(k)));
  if(r.recordKind==='specific')assert.deepEqual(r.protocolIds,[expectedProtocol(r.grade,r.officialCode)]);
  else{
   const children=rows.filter(c=>c.grade===r.grade&&c.officialCode.startsWith(r.officialCode+'.'));assert.deepEqual([...r.includesSourceKeys].sort(),children.map(c=>c.sourceKey).sort());
   assert.deepEqual([...r.protocolIds].sort(),[...new Set(children.flatMap(c=>c.protocolIds))].sort());assert.deepEqual(r.topicContributions.map(c=>c.topicId).sort(),[...new Set(children.flatMap(c=>c.topicContributions.map(t=>t.topicId)))].sort());assert(r.sourceRequirements.completeChildPortfolio);assert(r.sourceRequirements.integratedSelContext);
  }
  assert.equal(new Set(r.topicContributions.map(c=>c.topicId)).size,r.topicContributions.length);assert(r.topicContributions.length>0);
  for(const c of r.topicContributions){assert.equal(c.role,'component');assert(c.wholeClaimAssessmentRetained);const match=a.find(x=>x.topicId===c.topicId&&x.scope==='jurisdiction'&&x.country==='CA'&&x.region==='Ontario'&&x.ageRangeStart===r.ageRangeStart&&x.ageRangeEnd===r.ageRangeEnd&&x.standards.includes(r.sourceKey));assert(match,'Missing exact code-age-topic association');pairs.add(c.topicId+'|'+r.sourceKey);}
  const q=r.sourceRequirements;
  if(r.officialCode==='C1.2'&&[2,3].includes(r.grade))assert.deepEqual(q.takeoffModes,['one-foot','two-feet']);
  if(r.grade===4&&r.officialCode==='C1.2')assert(q.landingFromLowHeight);
  if(r.grade===6&&r.officialCode==='C1.1'){assert(q.smoothTransfer);assert(q.partnerOrOtherRelation);}
  if(r.protocolIds.length===1&&r.protocolIds[0]==='retain-while-travelling'){assert(q.actualPossessionDuringTravel);assert.equal(q.dribblingUniversalRequirement,false);if(r.grade===6){assert(q.speedVariation);assert(q.relationToOthersEquipment);}}
  if(r.protocolIds.length===1&&r.protocolIds[0]==='functional-categories'){assert(q.commonFunctionalFeatures);assert(q.effectiveStrategiesFromActualParticipation);assert(q.declaredCategoryModelNotUniversal);}
 }
 const graphPairs=new Set();for(const x of a)for(const key of x.standards.filter(k=>scope.has(k))){const r=scope.get(key);assert.equal(x.country,'CA');assert.equal(x.region,'Ontario');assert.equal(x.scope,'jurisdiction');assert.equal(x.ageRangeStart,r.ageRangeStart);assert.equal(x.ageRangeEnd,r.ageRangeEnd);graphPairs.add(x.topicId+'|'+key);}assert.deepEqual([...graphPairs].sort(),[...pairs].sort());
 const sel=l.records.filter(r=>/^A1(\.|$)/.test(r.officialCode));
 if(sel.length===42&&sel.every(r=>r.disposition==='Full')){assert.equal(p.integratedSelPanel.status,'complete-source-task-design');assert.deepEqual(p.integratedSelPanel.requiredStrands,['ActiveLiving','Movement','HealthyLiving']);assert.equal(p.integratedSelPanel.familyProtocolIds.length,6);}else assert(p.integratedSelPanel.scope.includes('still-pending'));
 assert(p.wholeClaimChecks.movement.includes('not automatic evidence'));assert.equal(l.counts.sourceFitReviewed,l.records.filter(r=>r.disposition).length);assert.equal(l.counts.pendingQualification,l.records.filter(r=>!r.disposition).length);
}
test('all 267 source identities and the 56 complete movement task bindings reconcile',()=>qualify());
test('another valid movement protocol cannot replace the exact source operation',()=>{const l=clone(ledger);l.records.find(r=>r.grade===4&&r.officialCode==='C1.2').protocolIds=['balance-transfer'];assert.throws(()=>qualify(l));});
test('a missing low-height/take-off/retention condition is rejected independently',()=>{for(const [grade,code,field] of [[4,'C1.2','landingFromLowHeight'],[2,'C1.2','takeoffModes'],[6,'C1.4','actualPossessionDuringTravel']]){const l=clone(ledger);delete l.records.find(r=>r.grade===grade&&r.officialCode===code).sourceRequirements[field];assert.throws(()=>qualify(l));}});
test('a source example cannot silently become compulsory dribbling or universal category law',()=>{let l=clone(ledger);l.records.find(r=>r.grade===6&&r.officialCode==='C1.4').sourceRequirements.dribblingUniversalRequirement=true;assert.throws(()=>qualify(l));l=clone(ledger);l.records.find(r=>r.grade===4&&r.officialCode==='C2.2').sourceRequirements.declaredCategoryModelNotUniversal=false;assert.throws(()=>qualify(l));});
test('missing child closures, associations and duplicate contributions fail',()=>{let l=clone(ledger);l.records.find(r=>r.grade===1&&r.officialCode==='C1').includesSourceKeys.pop();assert.throws(()=>qualify(l));l=clone(ledger);const r=l.records.find(r=>r.grade===1&&r.officialCode==='C1.1');r.topicContributions.push(clone(r.topicContributions[0]));assert.throws(()=>qualify(l));const a=clone(alignments);const key=r.sourceKey;const c=a.find(x=>x.standards.includes(key));c.standards=c.standards.filter(k=>k!==key);assert.throws(()=>qualify(ledger,programme,a));});
test('a duplicate primary pair at the wrong band is not hidden by pair counting',()=>{const a=clone(alignments);const r=clone(a.find(x=>x.standards.some(k=>k.startsWith(ledger.source+':ON-HPE-2019-G1-C1.1'))));r.ageRangeStart=11;r.ageRangeEnd=12;a.push(r);assert.throws(()=>qualify(ledger,programme,a));});
