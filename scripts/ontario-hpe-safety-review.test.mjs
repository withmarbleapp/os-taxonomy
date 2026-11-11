import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));
const ledger=read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme=read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const alignments=read('data/curriculum-alignments.json').alignments;
function qualify(l=ledger,p=programme,a=alignments){
 const rows=l.records.filter(r=>/^B3(\.|$)/.test(r.officialCode));assert.equal(rows.length,18);
 const ps=new Map(p.protocols.map(r=>[r.id,r]));
 for(let grade=1;grade<=6;grade++)assert.deepEqual(rows.filter(r=>r.grade===grade).map(r=>r.officialCode).sort(),['B3','B3.1','B3.2']);
 for(const r of rows){
  assert.equal(r.disposition,'Full');
  const expected=r.officialCode==='B3.1'?['safe-space-gear-and-shared-control','stop-report-and-follow-concussion-procedure']:r.officialCode==='B3.2'?(r.grade===3?['stop-report-and-follow-concussion-procedure']:r.grade===6?['minor-care-knowledge-cases']:['outdoor-environment-and-medical-support']):[];
  for(const id of expected){assert.ok(r.protocolIds.includes(id),`missing source-bound ${id}`);assert.ok(ps.has(id));}
  if(r.grade===4&&r.officialCode==='B3.2')assert.ok(r.protocolIds.includes('safe-space-gear-and-shared-control'));
  assert.equal(r.sourceRequirements.adultClinicalAuthorityRetained,true);assert.equal(r.sourceRequirements.noActualInjuryAssessment,true);
  if(r.officialCode==='B3'){
   const children=rows.filter(c=>c.grade===r.grade&&c.officialCode.startsWith('B3.'));
   assert.deepEqual(r.includesSourceKeys,children.map(c=>c.sourceKey));
   for(const c of children)for(const id of c.protocolIds)assert.ok(r.protocolIds.includes(id));
  }
  for(const c of r.topicContributions){const matches=a.filter(x=>x.topicId===c.topicId&&x.standards.includes(r.sourceKey));assert.equal(matches.length,1);assert.deepEqual([matches[0].country,matches[0].region,matches[0].ageRangeStart,matches[0].ageRangeEnd],['CA','Ontario',r.grade+5,r.grade+6]);assert.equal(c.role,'component');}
 }
 const concussion=ps.get('stop-report-and-follow-concussion-procedure').conditions;
 for(const k of ['actualAgeAppropriateBooklet','stopAndTellAdult','noChildDiagnosis','noSelfClearance','noImpactEnactment','notLeftAlone','schoolPolicyBindingAtUse','adultClinicalReturnAuthority'])assert.equal(concussion[k],true);
 const outside=ps.get('outdoor-environment-and-medical-support').conditions;
 for(const k of ['declaredPracticeNotForecast','currentLocalCheckAtUse','AQHIChildGuidance','medicalSupportAdultBound','noMedicationAdministration','noHazardExposureTrial'])assert.equal(outside[k],true);
 assert.equal(ps.get('safe-space-gear-and-shared-control').conditions.noConcussionProofHelmet,true);
 assert.deepEqual(p.conditions.schoolPolicyBinding.fieldsRequiredAtUse,['schoolOrBoard','procedureUrlOrDocument','versionOrReviewDate','responsibleAdults','learnerReportAndRemovalSteps','localEmergencyAndReturnAuthority']);
 const resources=new Set(p.sources.map(r=>r.url));
 for(const age of ['10-and-under','11-to-14'])assert.ok(resources.has(`https://www.ontario.ca/files/2025-09/sport-rowans-law-booklet-ages-${age}-en-2025-09-05.pdf`));
}
test('18 safety records retain source-specific tasks, actual resources and exact scoped component identities',()=>qualify());
test('another valid protocol cannot replace accident/concussion response',()=>{const l=structuredClone(ledger);l.records.find(r=>r.grade===3&&r.officialCode==='B3.2').protocolIds=['minor-care-knowledge-cases'];l.records.find(r=>r.grade===3&&r.officialCode==='B3').protocolIds.push('minor-care-knowledge-cases');assert.throws(()=>qualify(l),/source-bound/);});
test('clinical self-clearance or impact enactment cannot pass source qualification',()=>{for(const key of ['noSelfClearance','noImpactEnactment']){const p=structuredClone(programme);p.protocols.find(r=>r.id==='stop-report-and-follow-concussion-procedure').conditions[key]=false;assert.throws(()=>qualify(ledger,p));}});
test('provincial information cannot replace the actual local policy binding at use',()=>{const p=structuredClone(programme);p.conditions.schoolPolicyBinding.fieldsRequiredAtUse=['provincialBooklet'];assert.throws(()=>qualify(ledger,p));});
test('practice weather values cannot be claimed as current local conditions or child medication authority',()=>{for(const key of ['currentLocalCheckAtUse','declaredPracticeNotForecast','noMedicationAdministration']){const p=structuredClone(programme);p.protocols.find(r=>r.id==='outdoor-environment-and-medical-support').conditions[key]=false;assert.throws(()=>qualify(ledger,p));}});
test('a helmet guarantee or lost age-appropriate resource is rejected',()=>{const p=structuredClone(programme);p.protocols.find(r=>r.id==='safe-space-gear-and-shared-control').conditions.noConcussionProofHelmet=false;assert.throws(()=>qualify(ledger,p));const q=structuredClone(programme);q.sources=q.sources.filter(r=>!r.url.includes('ages-11-to-14'));assert.throws(()=>qualify(ledger,q));});
