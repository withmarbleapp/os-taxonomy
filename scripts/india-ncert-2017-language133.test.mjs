import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),prefix='india-ncert-2017-language-programme-accounting-2026-11-13';
const get=p=>fs.readFileSync(path.join(root,p),'utf8');
const ledger=JSON.parse(get(`reports/${prefix}-ledger.json`));
function check(d,read=get){
 assert.equal(d.records.length,133);assert.equal(new Set(d.records.map(x=>x.key)).size,133);assert.equal(d.sourceParentRollup,false);
 for(const [language,counts] of [['HI',[14,17,14,18,17]],['UR',[7,7,10,16,13]]])assert.deepEqual([1,2,3,4,5].map(g=>d.records.filter(x=>x.languageAlternative===language&&x.grade===g).length),counts);
 const md=read(`reports/${prefix}-task-contracts.md`);
 for(let i=1;i<=14;i++)assert.ok(md.includes(`<a id="l${String(i).padStart(2,'0')}"></a>`),'actual bounded module');
 for(const r of d.records){
  assert.match(r.key,new RegExp(`^ncert-elementary-learning-outcomes-2017:IN-NCERT-LO-2017-${r.languageAlternative}-G${r.grade}-LO${String(r.ordinal).padStart(2,'0')}$`));
  assert.equal(r.currentDisposition,'ConditionalProgrammeRoute');assert.equal(r.languageProgrammeCertified,false);assert.equal(r.formalRoleFrameworkAutomaticallyPromoted,false);assert.equal(r.actualLearnerAttainmentClaimed,false);assert.equal(r.actualNamedProgrammeInputStatus,'NotCertifiedByThisBatch');
  assert.ok(r.remainingGates.includes('ActualLanguageMaterialsAndAcceptedFreshKeys'));assert.ok(r.remainingGates.includes('ActualIndependentPupilPerformance'));
  if(r.languageAlternative==='UR')assert.ok(r.remainingGates.includes('IndependentCompetentUrduSourceMeaningReadback'));
  for(const ref of r.taskContractReferences){const [file,anchor]=ref.split('#');const body=read('reports/'+file).split(`<a id="${anchor}"></a>`)[1]?.split('<a id=')[0];assert.ok(body&&body.length>300,'actual source module resolves to task and evidence');}
  assert.ok(!('privateLiteral' in r)&&!('semanticDutyReadback' in r),'no restricted source payload');
 }
 assert.ok(md.includes('adult actually reads')&&md.includes('Independently dictate the fresh input')&&md.includes('without a displayed completed answer'),'actual heard dictation, not composition substitution');
 const row=(l,g,o)=>d.records.find(r=>r.languageAlternative===l&&r.grade===g&&r.ordinal===o);
 assert.match(row('HI',3,6).specificBoundary,/without imposing a universal BOTH/);assert.match(row('HI',3,7).specificBoundary,/oral\/signed/);
 for(const [g,o] of [[3,14],[5,10],[5,16]])assert.match(row('HI',g,o).specificBoundary,/not credited as Braille/);
 assert.match(row('UR',4,16).specificBoundary,/not an established universal source requirement/);
 assert.match(row('UR',4,1).specificBoundary,/does not discharge Urdu/);assert.match(row('UR',3,6).specificBoundary,/does not invent a singing rule/);
 assert.equal(d.finite304Accounting.mathematics.positions+d.finite304Accounting.evs.positions+d.finite304Accounting.english.positions+d.finite304Accounting.hindiUrdu.positions,304);
}
test('Retained Hindi80 and Urdu53 have exact conditional routes with actual bounded task contracts',()=>check(ledger));
test('Language133 rejects absent material, forced programme Full, lost response conjunction and premature rollup',()=>{
 assert.throws(()=>check(ledger,p=>get(p).replace('id="l04"','id="missing-script"')),/bounded module/);
 const forced=structuredClone(ledger);forced.records[0].languageProgrammeCertified=true;assert.throws(()=>check(forced));
 const mode=structuredClone(ledger);mode.records.find(x=>x.languageAlternative==='HI'&&x.grade===3&&x.ordinal===6).specificBoundary='both modes are universally compulsory';assert.throws(()=>check(mode));
 assert.throws(()=>check({...ledger,sourceParentRollup:true}));
});
