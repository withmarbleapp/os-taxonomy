import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));
const ledger=read('reports/ontario-hpe-primary-review-2026-11-11.json');
const programme=read('reports/ontario-hpe-primary-task-programme-2026-11-11.json');
const alignments=read('data/curriculum-alignments.json').alignments;
const asset=read('reports/assets/ontario-hpe-programme/label-comparison.json');
const bindings={
 'G1-D1.1':['canadian-guide-and-nutrient-reasons'],'G1-D2.1':['canadian-guide-and-nutrient-reasons'],'G1-D2.2':['hunger-thirst-fullness-as-information'],
 'G2-D2.1':['canadian-guide-and-nutrient-reasons'],'G2-D2.2':['canadian-guide-and-nutrient-reasons','feasible-meals-safe-ingredients-and-guidelines'],
 'G3-D1.1':['food-origins-processing-and-environment'],'G3-D2.1':['oral-health-and-food-choices'],'G3-D3.1':['cultural-food-range-without-forced-tasting','canadian-guide-and-nutrient-reasons'],
 'G4-D1.1':['canadian-guide-and-nutrient-reasons'],'G4-D2.1':['eating-habit-goal-and-helping-others','canadian-guide-and-nutrient-reasons'],'G4-D3.1':['eating-habit-goal-and-helping-others'],
 'G5-D2.1':['canadian-label-and-separate-whole-transfer'],'G5-D3.1':['food-marketing-and-health-message-critique'],
 'G6-D2.1':['feasible-meals-safe-ingredients-and-guidelines','eating-habit-goal-and-helping-others'],'G6-D2.2':['hunger-thirst-fullness-as-information','eating-habit-goal-and-helping-others'],'G6-D3.1':['eating-and-active-living-combination']
};
function qualify(l=ledger,p=programme,a=alignments){
 const keys=Object.keys(bindings).map(k=>`${l.source}:ON-HPE-2019-${k}`);
 const rows=l.records.filter(r=>keys.includes(r.sourceKey));assert.equal(rows.length,16);assert.equal(new Set(rows.map(r=>r.sourceKey)).size,16);
 for(const row of rows){
  assert.equal(row.disposition,'Full');const suffix=row.sourceKey.split('2019-')[1];assert.deepEqual(row.protocolIds,bindings[suffix]);
  assert.equal(row.sourceRequirements.noDietOrBodyPolicing,true);assert.equal(row.sourceRequirements.actualSourceBoundResources,true);
  for(const c of row.topicContributions){const matches=a.filter(x=>x.topicId===c.topicId&&x.standards.includes(row.sourceKey));assert.equal(matches.length,1);assert.deepEqual([matches[0].country,matches[0].region,matches[0].ageRangeStart,matches[0].ageRangeEnd],['CA','Ontario',row.grade+5,row.grade+6]);assert.equal(c.role,'component');}
 }
 const ps=new Map(p.protocols.map(r=>[r.id,r]));
 const cues=ps.get('hunger-thirst-fullness-as-information').conditions;
 for(const k of ['allThreeCueTypes','oneInputNotUniversalRule','noDeprivationOrForcedEating','noWeightOrPrivateIntakeScore','noManufacturedAttentionShift'])assert.equal(cues[k],true);
 const labels=ps.get('canadian-label-and-separate-whole-transfer').conditions;
 for(const k of ['actualCanadianServingAndIngredients','highInIsWarningNotOverallRating','noFakeCanadianPer100gColumn','wholeClaimTransferSeparatelyBound','ratingsAreHypotheticalGivens','notCommerciallyCalculatedScores','compareLikeCategories','noDietPortionOrAllergyAssurance'])assert.equal(labels[k],true);
 assert.equal(ps.get('food-origins-processing-and-environment').conditions.notAllProcessingBad,true);
 assert.equal(ps.get('food-origins-processing-and-environment').conditions.consumptionAndDisposal,true);
 assert.equal(ps.get('food-marketing-and-health-message-critique').conditions.realAdvertForInheritedWholeCheck,true);
 assert.equal(ps.get('food-marketing-and-health-message-critique').conditions.noCommercialAction,true);
 for(const ref of ps.get('canadian-label-and-separate-whole-transfer').assetRefs)assert.ok(readFileSync(new URL(`../reports/${ref}`,import.meta.url)).length>0);
 return rows;
}
function checkPractice(d=asset){
 assert.equal(d.panels.length,4);assert.equal(d.countryContext,'Separate Australian-context whole-claim transfer; never presented as Canadian label features');
 assert.ok(d.ratingMeaning.includes('not algorithm-calculated'));
 for(const p of d.panels){assert.ok(p.ratingStatus.includes('not algorithm-calculated'));for(const [basis,v]of Object.entries(p)){if(basis.startsWith('per')&&basis!=='per100g'){const n=Number(basis.slice(3,-1));for(const [k,q]of Object.entries(v))assert.ok(Math.abs(q-p.per100g[k]*n/100)<1e-8);}}}
 const [a,b,c,e]=d.panels;assert.ok(a.per100g.sugarsG<b.per100g.sugarsG&&a.per100g.fibreG>b.per100g.fibreG);assert.ok(c.per100g.sodiumMg<e.per100g.sodiumMg&&c.per100g.saturatedFatG<e.per100g.saturatedFatG);assert.deepEqual(d.panels.map(p=>p.givenStarRating),[4.5,2.5,4,2]);
}
test('16 eating source records retain exact protocol, condition, resource and scoped-component bindings',()=>qualify());
test('another valid eating protocol cannot replace food-origin/environment duties',()=>{const l=structuredClone(ledger);l.records.find(r=>r.grade===3&&r.officialCode==='D1.1').protocolIds=['canadian-guide-and-nutrient-reasons'];assert.throws(()=>qualify(l));});
test('forced hunger or private-intake scoring cannot qualify a cue task',()=>{for(const k of ['noDeprivationOrForcedEating','noWeightOrPrivateIntakeScore']){const p=structuredClone(programme);p.protocols.find(r=>r.id==='hunger-thirst-fullness-as-information').conditions[k]=false;assert.throws(()=>qualify(ledger,p));}});
test('Canadian warnings cannot be silently treated as ratings or per100g labels',()=>{for(const k of ['highInIsWarningNotOverallRating','noFakeCanadianPer100gColumn','wholeClaimTransferSeparatelyBound']){const p=structuredClone(programme);p.protocols.find(r=>r.id==='canadian-label-and-separate-whole-transfer').conditions[k]=false;assert.throws(()=>qualify(ledger,p));}});
test('original paired panels preserve arithmetic, comparison criteria and hypothetical rating status',()=>checkPractice());
test('a stale serving cell or commercially verified rating assertion is rejected',()=>{const d=structuredClone(asset);d.panels[0].per30g.sugarsG=8;assert.throws(()=>checkPractice(d));const e=structuredClone(asset);e.ratingMeaning='Official calculated commercial scores';assert.throws(()=>checkPractice(e));});
test('reviewed age10 source context preserves the unchanged age11 Australian whole-claim context',()=>{
 const rows=alignments.filter(r=>r.topicId==='mt_CCJpSSS3l8');
 assert.ok(rows.some(r=>r.country==='CA'&&r.region==='Ontario'&&r.ageRangeStart===10&&r.ageRangeEnd===11&&r.standards.includes(`${ledger.source}:ON-HPE-2019-G5-D2.1`)));
 assert.ok(rows.some(r=>r.country==='AU'&&r.region==='ACARA v9'&&r.ageRangeStart===11&&r.ageRangeEnd===12&&r.standards.includes('acara-v9:AC9HP6P09')));
});
