import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));
const report=read('reports/ontario-hpe-allergy-claim-2026-11-11.json');
function qualify(r=report){
 assert.deepEqual(r.originalCases.map(c=>c.id),['known-varied-triggers','same-milk-different-condition','unexplained-possible-reaction']);
 const [triggers,milk,unknown]=r.originalCases;
 assert.deepEqual(triggers.foods,['milk','egg','fish','peanuts','tree-nuts']);
 assert.equal(triggers.knownClinicalIdentitySupplied,true);assert.equal(triggers.exhaustiveInventory,false);
 assert.deepEqual(milk.cases,['known-milk-allergy','known-lactose-intolerance']);
 assert.equal(milk.allergy,'immune-system-reaction');assert.equal(milk.intolerance,'non-allergic-digestion-difficulty');assert.equal(milk.symptomsAloneDiagnose,false);
 assert.equal(unknown.causeKnown,false);assert.equal(unknown.response,'prompt-prepared-adult-help-and-supplied-care-or-emergency-procedure');
 for(const k of ['waitForTwoSymptoms','foodChallenge','independentDiagnosis','medicineDose'])assert.equal(unknown[k],false);
 for(const k of ['fictionalOrIllustratedOnly','noActualFoodExposure','noPrivateMedicalHistory','noMedicinesOrClinicalTriage','noExhaustiveAllergenInventory','noEfficacyClaim'])assert.equal(r.assessmentBoundaries[k],true);
}
test('allergy cases preserve varied triggers, distinct supplied explanations and unknown-case limits',()=>qualify());
test('the same milk cannot make allergy and intolerance interchangeable',()=>{const r=structuredClone(report);r.originalCases[1].allergy=r.originalCases[1].intolerance;assert.throws(()=>qualify(r));});
test('a valid known case cannot silently replace the unknown-case assessment',()=>{const r=structuredClone(report);r.originalCases[2]=structuredClone(r.originalCases[1]);assert.throws(()=>qualify(r));});
test('an allergen-list count does not accept a nuts-only repertoire or exhaustive mandate',()=>{for(const change of [r=>r.originalCases[0].foods=['peanuts','tree-nuts'],r=>r.originalCases[0].exhaustiveInventory=true]){const r=structuredClone(report);change(r);assert.throws(()=>qualify(r));}});
test('unsafe trial, diagnosis, dosing or symptom-count threshold cannot pass',()=>{for(const k of ['waitForTwoSymptoms','foodChallenge','independentDiagnosis','medicineDose']){const r=structuredClone(report);r.originalCases[2][k]=true;assert.throws(()=>qualify(r));}});
test('actual exposure and private history cannot replace fictional knowledge assessment',()=>{for(const k of ['noActualFoodExposure','noPrivateMedicalHistory','noMedicinesOrClinicalTriage']){const r=structuredClone(report);r.assessmentBoundaries[k]=false;assert.throws(()=>qualify(r));}});
test('one Grade2 component adds one fixed concept and no cell, digestion or treatment gate',()=>{
 const t=read('data/topics.json').topics.find(t=>t.id===report.topicId);
 assert.equal(t.type,'CONCEPTUAL');assert.equal(t.domain,'Health & Safety');
 const a=read('data/curriculum-alignments.json').alignments.filter(a=>a.topicId===report.topicId);
 assert.deepEqual(a,[{topicId:report.topicId,scope:'jurisdiction',country:'CA',region:'Ontario',ageRangeStart:7,ageRangeEnd:8,standards:['the-ontario-curriculum-health-and-physical-educa:ON-HPE-2019-G2-D1.2']}]);
 assert.equal(read('data/dependencies.json').dependencies.filter(e=>e.topicId===report.topicId).length,0);
 const g=read('data/teaching-research.json').records.find(g=>g.topicId===report.topicId);
 assert.equal(g.confidence,'low');assert.equal(g.learn.activities.length,3);
 assert.ok(g.learn.constraints.some(s=>s.includes('No actual food exposure')));
});
