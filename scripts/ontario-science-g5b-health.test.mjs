import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const slug = 'the-ontario-curriculum-science-and-technology-20';
const key = code => `${slug}:ON-SCI-2022-G5-${code}`;
const programmeFile = 'ontario-science-grade5-health-task-programme-2026-11-11.json';
const requiredResources = {
 'health-factors-and-access':['phac-determinants','hc-mould'],
 'health-technologies-and-perspectives':['hc-xray','fda-hearing'],
 'food-literacy-body-and-connection':['hc-guide','hc-meals'],
 'integrated-body-systems-own-model':['nhlbi-heart','nhlbi-flow','niddk-digestion','nhlbi-asthma','nidcr-decay','nhlbi-respiratory'],
};
const bindings = { B1:['integrated-health-factor-portfolio'], 'B1.1':['health-factors-and-access'], 'B1.2':['health-technologies-and-perspectives'], 'B1.3':['food-literacy-body-and-connection'], B2:['integrated-body-systems-own-model'] };
const expected = {
 B1:['mt_4k3HGahK2k','mt_Jd2aWEUJ9G','mt_MXxVMCr7_4','mt_NbkUKcOlEX','mt_OTrQJVRRJ6','mt_QhLAeAlHI0'],
 'B1.1':['mt_4k3HGahK2k','mt_OTrQJVRRJ6','mt_Jd2aWEUJ9G'],
 'B1.2':['mt_MXxVMCr7_4'],
 'B1.3':['mt_QhLAeAlHI0','mt_NbkUKcOlEX','mt_OTrQJVRRJ6'],
 B2:['mt_K8DJzqbksM','mt_Ruk2-lyGPZ','mt_BX4D8cCFtQ','mt_tiPyEkm4cU','mt_pJ5zsocdNx','mt_QK-ZZb7UUN','mt_4k3HGahK2k']
};
const state = () => ({report:read('reports/ontario-science-grade5-health-residual-completion-2026-11-11.json'), programme:read('reports/ontario-science-grade5-health-task-programme-2026-11-11.json'), alignments:read('data/curriculum-alignments.json').alignments, topics:read('data/topics.json').topics, catalogue:read('data/curriculum-standards.json')});
function qualify(s) {
 const rs=s.report.records, p=s.programme;
 assert.deepEqual(rs.map(r=>r.code),Object.keys(bindings));
 assert.equal(new Set(rs.map(r=>r.sourceKey)).size,5);
 const available=new Set(s.catalogue.curricula.find(c=>c.slug===slug).topics.map(r=>r.key));
 const ps=new Map(p.protocols.map(r=>[r.id,r])); assert.equal(ps.size,5);
 const bs=new Map(p.sourceBindings.map(r=>[r.sourceKey,r])); assert.equal(bs.size,5);
 const expectedPairs=new Set();
 for(const r of rs){
  assert.equal(r.sourceKey,key(r.code));assert.ok(available.has(r.sourceKey));assert.equal(r.protocolRef,programmeFile,'Missing actual programme report binding');assert.equal(r.disposition,'Full');assert.deepEqual(r.ageBand,[10,11]);
  assert.deepEqual(r.protocolIds,bindings[r.code]);assert.deepEqual(r.contributions.map(c=>c.topicId),expected[r.code]);
  const b=bs.get(r.sourceKey);assert.deepEqual(b.protocolIds,r.protocolIds);assert.deepEqual(b.ageBand,[10,11]);assert.equal(b.grade,5);
  const proto=ps.get(r.protocolIds[0]);assert.deepEqual(proto.sourceCodes,[r.code]);assert.deepEqual(b.requiredConditions,proto.conditions);
  for(const c of r.contributions){assert.equal(c.role,'component');assert.equal(c.wholeClaimAssessmentRetained,true);assert.equal(c.topicName,s.topics.find(t=>t.id===c.topicId)?.name);expectedPairs.add(c.topicId+'|'+r.sourceKey);assert.ok(s.alignments.some(a=>a.topicId===c.topicId&&a.scope==='jurisdiction'&&a.country==='CA'&&a.region==='Ontario'&&a.ageRangeStart===10&&a.ageRangeEnd===11&&a.standards.includes(r.sourceKey)));}
 }
 assert.equal(expectedPairs.size,20);
 const actual=new Set(s.alignments.flatMap(a=>a.standards.filter(k=>rs.some(r=>r.sourceKey===k)).map(k=>a.topicId+'|'+k)));assert.deepEqual(actual,expectedPairs);
 const factors=ps.get('health-factors-and-access');assert.deepEqual(factors.cases.map(c=>c.id),['housing-and-breathing','food-access-and-time','social-support-and-care']);
 for(const k of ['variedSocialEnvironmentalFactors','benefitsAndHarms','feasibleActionsAndLimits','noIndividualBlameOrGuaranteedOutcome','noPrivateResourcesHistory','noHazardExposureOrRepair'])assert.equal(factors.conditions[k],true);
 const tech=ps.get('health-technologies-and-perspectives');assert.deepEqual(tech.cases.map(c=>c.id),['digital-radiograph','supported-hearing']);assert.ok(tech.cases.every(c=>c.perspectives.length>=2));
 for(const k of ['multipleTechnologies','bodySystemBenefitsAndHarms','differentPerspectives','actualReasonsNotPerspectiveLabels','healthHarmsNotOnlyCostOrInconvenience','noActualDeviceUseExposureOrClinicalDecision','digitalComponentDoesNotReplaceOtherTechnologyKnowledge'])assert.equal(tech.conditions[k],true);
 const food=ps.get('food-literacy-body-and-connection');for(const k of ['foodKnowledgeAndDecisionProcess','physicalAndMentalWellbeing','noMoodCureOrForcedEnjoyment','noIntakeAppearanceOrWeightScore','localAccessAndMedicalConditions','wholeFoodPreparationAssessmentSeparate'])assert.equal(food.conditions[k],true);
 const integration=ps.get('integrated-health-factor-portfolio');assert.deepEqual(integration.includesProtocols,['health-factors-and-access','health-technologies-and-perspectives','food-literacy-body-and-connection']);assert.equal(integration.conditions.ownIntegratedAccount,true);assert.equal(integration.conditions.noLinkCountOnlyRollup,true);
 assert.deepEqual(p.b1Integration.sourceKeys,['B1.1','B1.2','B1.3'].map(key));assert.equal(p.b1Integration.ownIntegratedAccountRequired,true);
 assert.deepEqual(p.b2ChildDuties.sourceKeys,['B2.1','B2.2','B2.3','B2.4'].map(key));assert.equal(p.b2ChildDuties.allMustBeAccountedInOwnModel,true);
 const body=ps.get('integrated-body-systems-own-model');
 assert.deepEqual(body.organFunctionSet.map(x=>x.system),['digestive','circulatory','respiratory','nervous','skeletal-and-muscular']);
 assert.deepEqual(body.organStructureFunctionPairs.map(x=>x.organ),['heart','lungs','stomach','small intestine']);
 for(const pair of body.organStructureFunctionPairs)for(const k of ['structure','function','changedFeature'])assert.ok(typeof pair[k]==='string'&&pair[k].length>30);
 assert.match(body.organStructureFunctionPairs[0].structure,/muscular.*chambers.*valves/);
 assert.match(body.organStructureFunctionPairs[1].structure,/branching.*air sacs.*blood vessels/);
 assert.match(body.organStructureFunctionPairs[2].structure,/muscular walls/);
 assert.match(body.organStructureFunctionPairs[3].structure,/absorbing lining/);
 assert.match(body.organStructureFunctionPairs[0].changedFeature,/valve.*both ways.*Repair/);
 assert.match(body.organStructureFunctionPairs[1].changedFeature,/sealed.*no neighbouring.*exchange/);
 assert.match(body.organStructureFunctionPairs[2].changedFeature,/rigid storage box.*mixing/);
 assert.match(body.organStructureFunctionPairs[3].changedFeature,/impermeable.*nutrient/);
 assert.match(body.task,/Complete the changed-feature repair/);
 for(const k of ['ownIntegratedModelRequired','allFourB2ChildDutyTypes','multipleSystemsAndVitalOrgans','withinAndBetweenSystems','namedDisorderToAffectedOrgans','actualBasicStructureFunctionReasoning','changedStructureRepairNotNameBoxes','noDiagnosisOrRealBodyInspection','noPEFitnessOrExertionRequirementForSourceTask','wholeCanonicalPulseOrPreparationChecksSeparate','notAllControlConscious','noBlueBloodOrWholeFoodInBlood'])assert.equal(body.conditions[k],true);
 assert.deepEqual(body.disorderCases.map(x=>x.name),['asthma','tooth decay','coronary heart disease']);
 assert.match(body.pathways[0],/oxygen enters blood.*carbon dioxide returns.*lungs/);assert.match(body.pathways[1],/absorbed nutrients.*undigested material.*different waste route/);
 const resources=new Map(p.resources.map(r=>[r.id,r]));assert.equal(resources.size,p.resources.length);
 for(const [id,refs]of Object.entries(requiredResources))assert.deepEqual(ps.get(id).resources,refs,'Missing required source resource bindings');
 for(const proto of ps.values())for(const id of proto.resources??[]) {const r=resources.get(id);assert.ok(r);assert.match(r.url,/^https:\/\/(www\.)?(canada\.ca|fda\.gov|nhlbi\.nih\.gov|niddk\.nih\.gov|nidcr\.nih\.gov)\//);assert.ok(r.actualRead.length>15);assert.ok(r.use.length>30);}
 assert.equal(resources.get('nhlbi-respiratory').url,'https://www.nhlbi.nih.gov/health/lungs/respiratory-system');
 for(const v of Object.values(p.conditions))assert.equal(v,true);
}
test('five G5 health residuals bind exact source tasks,20 components and both integrated duties',()=>qualify(state()));
test('a different valid task cannot replace source-specific factor or technology work',()=>{for(const code of ['B1.1','B1.2','B1.3']){const s=state();s.report.records.find(r=>r.code===code).protocolIds=['integrated-body-systems-own-model'];assert.throws(()=>qualify(s));}});
test('an unchanged link count cannot hide a missing association or wrong Ontario interval',()=>{for(const change of [s=>{const r=s.alignments.find(a=>a.standards.includes(key('B1')));r.standards=r.standards.filter(k=>k!==key('B1'));},s=>{s.alignments.find(a=>a.standards.includes(key('B2'))).ageRangeStart=9;}]){const s=state();change(s);assert.throws(()=>qualify(s));}});
test('access, actual health harms and mental well-being cannot disappear behind generic lifestyle advice',()=>{for(const [id,k]of [['health-factors-and-access','variedSocialEnvironmentalFactors'],['health-technologies-and-perspectives','healthHarmsNotOnlyCostOrInconvenience'],['food-literacy-body-and-connection','physicalAndMentalWellbeing']]){const s=state();s.programme.protocols.find(r=>r.id===id).conditions[k]=false;assert.throws(()=>qualify(s));}});
test('a parent cannot close from child labels while losing an actual required duty',()=>{for(const change of [s=>s.programme.protocols.find(r=>r.id==='integrated-health-factor-portfolio').includesProtocols.pop(),s=>s.programme.b2ChildDuties.sourceKeys.pop(),s=>s.programme.b1Integration.ownIntegratedAccountRequired=false]){const s=state();change(s);assert.throws(()=>qualify(s));}});
test('organ-name boxes cannot replace structure-function reasoning or changed-feature repair',()=>{for(const change of [s=>s.programme.protocols.find(r=>r.id==='integrated-body-systems-own-model').organStructureFunctionPairs=[],s=>s.programme.protocols.find(r=>r.id==='integrated-body-systems-own-model').organStructureFunctionPairs[1].structure='lungs',s=>s.programme.protocols.find(r=>r.id==='integrated-body-systems-own-model').conditions.changedStructureRepairNotNameBoxes=false,s=>{delete s.programme.protocols.find(r=>r.id==='integrated-body-systems-own-model').organStructureFunctionPairs[0].changedFeature;},s=>s.programme.protocols.find(r=>r.id==='integrated-body-systems-own-model').organStructureFunctionPairs[1].changedFeature='Name and spell the organ correctly using several different labels.',s=>s.programme.protocols.find(r=>r.id==='integrated-body-systems-own-model').task='Create an organ-name poster and draw arrows between the names.']){const s=state();change(s);assert.throws(()=>qualify(s));}});
test('incorrect oxygen/waste routes and omitted disorder cases cannot pass an otherwise labelled body map',()=>{for(const change of [s=>s.programme.protocols.find(r=>r.id==='integrated-body-systems-own-model').pathways[0]='oxygen leaves cells directly into air',s=>s.programme.protocols.find(r=>r.id==='integrated-body-systems-own-model').disorderCases.pop()]){const s=state();change(s);assert.throws(()=>qualify(s));}});
test('missing actual resource or clinical/PE dependency cannot retain source qualification',()=>{for(const change of [s=>s.programme.resources=s.programme.resources.filter(r=>r.id!=='nhlbi-respiratory'),s=>s.programme.conditions.noPEProgrammeDependency=false,s=>s.programme.conditions.noExposureDiagnosisTreatmentOrMedicalDeviceOperation=false]){const s=state();change(s);assert.throws(()=>qualify(s));}});

test('every Full G5 health row retains its actual programme file binding',()=>{
 for(const code of Object.keys(bindings))for(const ref of [undefined,'missing-programme.json','ontario-grade5-cde-current-ledger-2026-11-11.json']){
  const s=state(),row=s.report.records.find(r=>r.code===code);
  if(ref===undefined)delete row.protocolRef;else row.protocolRef=ref;
  assert.throws(()=>qualify(s),/Missing actual programme report binding/);
 }
});
test('required factual resource bindings cannot disappear while their catalogue entries remain',()=>{
 for(const id of Object.keys(requiredResources))for(const refs of [undefined,[]]){
  const s=state(),protocol=s.programme.protocols.find(r=>r.id===id);
  if(refs===undefined)delete protocol.resources;else protocol.resources=refs;
  assert.throws(()=>qualify(s),/Missing required source resource bindings/);
 }
});
