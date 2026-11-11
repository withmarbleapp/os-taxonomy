import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));
const file='ontario-science-grade2-matter-task-programme-2026-11-11.json';
const slug='the-ontario-curriculum-science-and-technology-20',key=c=>`${slug}:ON-SCI-2022-G2-${c}`;
const expected={
 C1:['society-environment-material-portfolio',['mt_deexfCHU9m','mt_EWiY8-opdd','mt_TTH2ouwyTW','mt_Pl-nsjYGZ3']],
 'C1.1':['home-material-decisions',['mt_EWiY8-opdd','mt_TTH2ouwyTW','mt_deexfCHU9m']],
 'C1.2':['phase-change-consequences',['mt_Pl-nsjYGZ3','mt_deexfCHU9m']],
 C2:['liquid-solid-own-investigation-portfolio',['mt_1JFUNQDwAJ','mt_auVZZEuXjs','mt_Pl-nsjYGZ3','mt_zHnOGwHIEz','mt_F62VTeHB4-','mt_ahSqW_kK1b','mt_DRNXFr0ds6']],
 'C2.4':['stable-and-changing-states',['mt_Pl-nsjYGZ3']],
 'C2.5':['useful-solid-liquid-combinations',['mt_F62VTeHB4-','mt_ahSqW_kK1b']],
 'C2.7':['substance-symbol-meanings',['mt_DRNXFr0ds6']]
};
const resourceBindings={
 'home-material-decisions':['hc-household'], 'phase-change-consequences':['mmc-walrus','acs-heating'],
 'society-environment-material-portfolio':['hc-household','mmc-walrus'],
 'stable-and-changing-states':['acs-heating','phase-correction'],
 'useful-solid-liquid-combinations':['hc-oats','discovery-adhesive'],
 'substance-symbol-meanings':['ccohs-pictograms','hc-household'],
 'liquid-solid-own-investigation-portfolio':['acs-liquids','acs-heating','ccohs-pictograms']
};
const state=()=>({report:read('reports/ontario-science-grade2-matter-residual-completion-2026-11-11.json'),programme:read(`reports/${file}`),alignments:read('data/curriculum-alignments.json').alignments,topics:read('data/topics.json').topics,catalogue:read('data/curriculum-standards.json')});
function qualify(s){
 const p=s.programme,r=s.report.records,ps=new Map(p.protocols.map(x=>[x.id,x])),bs=new Map(p.sourceBindings.map(x=>[x.sourceKey,x])),available=new Set(s.catalogue.curricula.find(x=>x.slug===slug).topics.map(x=>x.key));
 assert.deepEqual(r.map(x=>x.code),Object.keys(expected));assert.equal(ps.size,7);assert.equal(bs.size,7);assert.equal(p.protocols.length,7);assert.equal(p.sourceBindings.length,7);
 const pairs=new Set();
 for(const row of r){
  const [id,ids]=expected[row.code];assert.equal(row.sourceKey,key(row.code));assert.ok(available.has(row.sourceKey));assert.equal(row.disposition,'Full');assert.deepEqual(row.ageBand,[7,8]);assert.equal(row.protocolRef,file);assert.deepEqual(row.protocolIds,[id]);assert.deepEqual(row.contributions.map(x=>x.topicId),ids);
  const b=bs.get(row.sourceKey),proto=ps.get(id);assert.deepEqual(b.protocolIds,[id]);assert.deepEqual(b.requiredConditions,proto.conditions);assert.deepEqual(b.ageBand,[7,8]);assert.equal(b.grade,2);assert.deepEqual(proto.sourceCodes,[row.code]);
  for(const c of row.contributions){assert.equal(c.role,'component');assert.equal(c.wholeClaimAssessmentRetained,true);assert.equal(c.topicName,s.topics.find(t=>t.id===c.topicId)?.name);pairs.add(`${c.topicId}|${row.sourceKey}`);assert.ok(s.alignments.some(a=>a.topicId===c.topicId&&a.scope==='jurisdiction'&&a.country==='CA'&&a.region==='Ontario'&&a.ageRangeStart===7&&a.ageRangeEnd===8&&a.standards.includes(row.sourceKey)));}
 }
 assert.equal(pairs.size,20);
 const actual=new Set(s.alignments.flatMap(a=>a.standards.filter(k=>r.some(x=>x.sourceKey===k)).map(k=>`${a.topicId}|${k}`)));assert.deepEqual(actual,pairs);
 const resources=new Map(p.resources.map(x=>[x.id,x]));assert.equal(resources.size,8);assert.equal(p.resources.length,8);
 for(const proto of ps.values()){
  assert.deepEqual(proto.resources,resourceBindings[proto.id]);for(const id of proto.resources){const resource=resources.get(id);assert.ok(resource);assert.ok(resource.actualRead.length>30);assert.ok(resource.use.length>30);assert.ok(resource.url?.startsWith('https://')||resource.reportRef==='phase-energy-and-prerequisite-correction-2026-11-11.json');}
  for(const [k,v] of Object.entries(proto.conditions)) if(k!=='exactSymbols') assert.equal(v,true);
  for(const k of ['task','nearMiss','changedCase'])assert.ok(proto[k].length>80);
 }
 const home=ps.get('home-material-decisions');assert.equal(home.conditions.useStorageDisposalAllRequired,true);assert.match(home.task,/unlabelled cleaning liquid.*paint\/liquid.*drain/);assert.match(home.task,/personal-health or safety effect AND environmental consequence/);
 const impact=ps.get('phase-change-consequences');assert.match(impact.task,/pure-water ice pack melting.*normal-pressure.*Pacific walruses.*land/);assert.equal(impact.conditions.specifiedPureWaterPackNotGenericGel,true);assert.equal(impact.conditions.peopleAndEnvironment,true);assert.equal(impact.conditions.actualStateToConsequenceMechanism,true);
 const society=ps.get('society-environment-material-portfolio');assert.deepEqual(society.includesProtocols,['home-material-decisions','phase-change-consequences']);assert.equal(society.conditions.ownIntegratedJudgement,true);
 const stable=ps.get('stable-and-changing-states');assert.match(stable.task,/ice remaining solid.*liquid water remaining liquid.*ice and liquid coexist/);assert.match(stable.task,/Read and record an actual safe temperature/);assert.match(stable.changedCase,/non-transition warming example is mandatory/);assert.equal(stable.conditions.qualitativeEnergyNotDropped,true);
 const mix=ps.get('useful-solid-liquid-combinations');assert.match(mix.task,/oats.*liquid\/yogurt.*flour\/water.*paper adhesive/);assert.equal(mix.conditions.descriptionNotUniversalProductionMandate,true);assert.equal(mix.conditions.noTastingRawFlourOrHotPasteHandling,true);
 const signs=ps.get('substance-symbol-meanings');assert.deepEqual(signs.conditions.exactSymbols,['ghs-flame','ghs-corrosion','ghs-skull-crossbones']);assert.match(signs.successfulEvidence[0],/flammability, corrosive damage and acute toxicity/);assert.match(signs.task,/flame with flame-over-circle.*skull with exclamation/);assert.equal(signs.conditions.meaningNotAdultResponseAlone,true);assert.equal(signs.conditions.absenceNotSafetyProof,true);
 const own=ps.get('liquid-solid-own-investigation-portfolio');assert.deepEqual(own.childDutyCodes,['C2.1','C2.2','C2.3','C2.4','C2.5','C2.6','C2.7']);assert.deepEqual(own.includesProtocols,['stable-and-changing-states','useful-solid-liquid-combinations','substance-symbol-meanings']);assert.match(own.task,/record before grouping.*BOTH buoyancy and absorbing\/repelling/);assert.match(own.task,/cork, sponge, a plastic spoon and a metal spoon/);assert.match(own.changedCase,/floats but absorbs.*sinks and repels/);assert.equal(own.conditions.allSevenC2ChildDuties,true);assert.equal(own.conditions.ownIntegratedExhibitRequired,true);
 for(const v of Object.values(p.conditions))assert.equal(v,true);
 assert.ok(p.inheritedGuideLimits.some(x=>x.includes('solution is not necessarily colourless')));assert.ok(p.inheritedGuideLimits.some(x=>x.includes('vapour itself is invisible')));assert.ok(p.inheritedGuideLimits.some(x=>x.includes('accept the tested specimen result')));
}
test('seven matter duties bind actual tasks, exact source contexts and twenty component pairs',()=>qualify(state()));
test('a different valid protocol or missing programme reference cannot stand for the source duty',()=>{for(const mutate of [s=>s.report.records[1].protocolIds=['substance-symbol-meanings'],s=>delete s.report.records[2].protocolRef,s=>s.report.records[0].protocolRef='ontario-science-grade5-health-task-programme-2026-11-11.json']){const s=state();mutate(s);assert.throws(()=>qualify(s));}});
test('source-specific resource sets cannot become empty, partial or an unrelated existing resource',()=>{for(const mutate of [x=>x.resources=[],x=>x.resources.pop(),x=>x.resources=['hc-oats']]){const s=state();mutate(s.programme.protocols.find(x=>x.id==='substance-symbol-meanings'));assert.throws(()=>qualify(s));}});
test('hazard meanings cannot collapse to generic adult-help or one interchangeable symbol',()=>{for(const mutate of [x=>x.conditions.exactSymbols=['ghs-flame','ghs-flame','ghs-flame'],x=>x.successfulEvidence[0]='Say tell an adult.',x=>x.conditions.meaningNotAdultResponseAlone=false]){const s=state();mutate(s.programme.protocols.find(x=>x.id==='substance-symbol-meanings'));assert.throws(()=>qualify(s));}});
test('integrated understanding requires every child duty and separate property observations',()=>{for(const mutate of [x=>x.childDutyCodes.pop(),x=>x.includesProtocols.pop(),x=>x.conditions.ownIntegratedExhibitRequired=false,x=>x.task=x.task.replace('BOTH buoyancy and absorbing/repelling','only floating')]){const s=state();mutate(s.programme.protocols.find(x=>x.id==='liquid-solid-own-investigation-portfolio'));assert.throws(()=>qualify(s));}});
test('remaining-state conditions, actual temperature and a non-transition cannot be skipped',()=>{const s=state();s.programme.protocols.find(x=>x.id==='stable-and-changing-states').task='Heat everything until it melts. Recall 0 and 100.';assert.throws(()=>qualify(s));});
test('society/environment effects and mixtures retain actual mechanisms and safe boundaries',()=>{for(const [id,k] of [['phase-change-consequences','peopleAndEnvironment'],['home-material-decisions','personalAndEnvironmentalEffects'],['useful-solid-liquid-combinations','noTastingRawFlourOrHotPasteHandling']]){const s=state();s.programme.protocols.find(x=>x.id===id).conditions[k]=false;assert.throws(()=>qualify(s));}});
test('component evidence cannot silently certify an unchanged whole claim or broaden the local band',()=>{for(const mutate of [s=>s.report.records[0].contributions[0].wholeClaimAssessmentRetained=false,s=>s.alignments.find(a=>a.topicId==='mt_deexfCHU9m'&&a.ageRangeStart===7&&a.standards.includes(key('C1'))).ageRangeStart=6]){const s=state();mutate(s);assert.throws(()=>qualify(s));}});

test('the melting consequence cannot assume an unspecified commercial gel changes state',()=>{const s=state();s.programme.protocols.find(x=>x.id==='phase-change-consequences').task=s.programme.protocols.find(x=>x.id==='phase-change-consequences').task.replace('pure-water ice pack melting in a normal-pressure case','commercial cold pack melting');assert.throws(()=>qualify(s));});
