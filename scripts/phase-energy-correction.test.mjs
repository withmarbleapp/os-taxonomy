import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const heating = 'mt_Pl-nsjYGZ3', particles = 'mt_htAYR-iCFF';
const at = (o, path) => path.reduce((v, key) => v[key], o);
const state = () => ({report: read('reports/phase-energy-and-prerequisite-correction-2026-11-11.json'), topics: read('data/topics.json').topics, guides: read('data/teaching-research.json').records, edges: read('data/dependencies.json').dependencies});
function qualify(s) {
 const r = s.report;
 assert.equal(r.cardCorrections.length, 1); assert.equal(r.guideCorrections.length, 12);
 assert.deepEqual(r.cardCorrections.map(c => [c.topicId, c.path]), [[heating, ['evidence', 2]]]);
 assert.deepEqual(r.guideCorrections.map(c => [c.topicId, c.path]), [
  [heating,['pedagogy','summary']], [heating,['pedagogy','bestPractices',0]], [heating,['learn','summary']],
  [heating,['learn','constraints',1]], [heating,['learn','reviewNotes',5]], [heating,['assess','correctAnswer']], [heating,['assess','responseLevels','full']],
  [particles,['learn','activities',0,'learnerActions',4]], [particles,['learn','activities',0,'intendedInsight']],
  [particles,['learn','activities',2,'feedback',4]], [particles,['learn','constraints',8]], [particles,['learn','reviewNotes',1]]
 ]);
 for (const [corrections, records, idField] of [[r.cardCorrections,s.topics,'id'],[r.guideCorrections,s.guides,'topicId']]) {
  for (const c of corrections) assert.equal(at(records.find(x => x[idField] === c.topicId), c.path), c.after);
 }
 const h = s.guides.find(x=>x.topicId===heating), p = s.guides.find(x=>x.topicId===particles);
 for(const g of [h,p]) {
  const protectedFields = r.protectedGuideMetadata[g.topicId];
  for(const [key,value] of Object.entries(protectedFields)) assert.deepEqual(g[key],value);
  assert.equal(g.learn.activities.length,r.counts.unchangedActivityCounts[g.topicId]);
 }
 assert.match(s.topics.find(x=>x.id===heating).evidence[2], /heating transfers energy.*warming within a state.*constant temperature.*without requiring faster motion/i);
 assert.match(h.assess.responseLevels.full,/required qualitative energy\/particle explanation/);
 assert.match(h.learn.constraints[1], /whole shared card still requires/);
 assert.match(h.pedagogy.bestPractices[0],/pure water at normal atmospheric pressure.*0°C.*100°C/);
 assert.match(h.pedagogy.bestPractices[0],/actual safe thermometer reading\/recording.*research examples, not child handling/);
 assert.match(p.learn.activities[0].intendedInsight,/same particles.*average motion need not increase.*constant-temperature plateau/);
 assert.deepEqual(s.edges.filter(e=>e.topicId===heating&&e.prerequisiteId===particles),[r.dependencyCorrection.after]);
 assert.equal(r.dependencyCorrection.after.strength,'soft');
 assert.match(r.dependencyCorrection.after.reason,/required qualitative energy explanation.*Independent three-state diagram construction and compressibility reasoning are not necessary prerequisites/);
 const cases=r.originalDiagnosticCases;
 assert.deepEqual(cases.map(c=>[c.id,c.temperatureChange,c.stateChange,c.averageMotionMustIncrease,c.energyChangesArrangementAtPlateau]),[
  ['warming-solid','rises-to-about0','none-before-melting',true,false],
  ['melting-plateau','about-constant0','solid-fraction-decreases',false,true],
  ['warming-liquid','rises-above0','none-within-selected-range',true,false]
 ]);
 assert.match(cases[0].given,/Pure water.*normal atmospheric pressure/);
 assert.match(cases[1].given,/Both ice and liquid water remain.*normal-pressure/);
 assert.match(cases[2].given,/All ice has melted.*within its liquid range.*normal pressure/);
 const w=r.wholeClaimWitness;
 assert.match(w.actualMeasurement,/Read a suitable Celsius thermometer.*both phases remain.*after all ice is gone/);
 assert.match(w.qualitativeExplanation,/within a state.*isothermal melting.*rather than requiring a temperature or speed rise/);
 assert.match(w.changedCase,/non-transition.*not assert every warmed object melts/);
 assert.match(w.independentMissingPrerequisite,/unable to independently generate all solid\/liquid\/gas dot diagrams.*compressibility/);
 assert.match(r.compatibility,/retain the prior.*No automatic equivalence, transfer, reset or publication/);
}
test('actual guides, whole evidence, soft prerequisite and three physical cases agree',()=>qualify(state()));
test('melting cannot require a speed increase, and warming after melting cannot remain a plateau',()=>{
 for(const mutate of [s=>s.report.originalDiagnosticCases[1].averageMotionMustIncrease=true,s=>s.report.originalDiagnosticCases[2].temperatureChange='about-constant0',s=>s.report.originalDiagnosticCases[1].given='Energy enters water, with no phase condition.']) {const s=state();mutate(s);assert.throws(()=>qualify(s));}
});
test('restoring an old manipulation or answer reintroduces the error and fails',()=>{
 for(const index of [5,7,8,9,10]) {const s=state(),c=s.report.guideCorrections[index],g=s.guides.find(x=>x.topicId===c.topicId);at(g,c.path.slice(0,-1))[c.path.at(-1)]=c.before;assert.throws(()=>qualify(s));}
});
test('dropping qualitative energy is not an alternative to correcting the plateau',()=>{
 for(const mutate of [s=>s.topics.find(x=>x.id===heating).evidence[2]='Observe melting safely.',s=>s.guides.find(x=>x.topicId===heating).assess.responseLevels.full='Observation only; energy is optional.']) {const s=state();mutate(s);assert.throws(()=>qualify(s));}
});
test('actual measurement and the safe researched boiling boundary remain required',()=>{
 const s=state();s.guides.find(x=>x.topicId===heating).pedagogy.bestPractices[0]='Recall 0°C and 100°C, then boil water yourself.';assert.throws(()=>qualify(s));
});
test('a softened gate still exists with an explicit whole-claim witness',()=>{
 for(const mutate of [s=>s.edges.find(e=>e.topicId===heating&&e.prerequisiteId===particles).strength='hard',s=>s.edges=s.edges.filter(e=>!(e.topicId===heating&&e.prerequisiteId===particles)),s=>s.report.wholeClaimWitness.independentMissingPrerequisite='Child already masters all three diagrams.']) {const s=state();mutate(s);assert.throws(()=>qualify(s));}
});
test('the correction cannot silently recertify historical guide sources or provenance',()=>{
 for(const field of ['confidence','provenance','sources']) {const s=state(),g=s.guides.find(x=>x.topicId===particles);g[field]=field==='confidence'?'low':{};assert.throws(()=>qualify(s));}
});
