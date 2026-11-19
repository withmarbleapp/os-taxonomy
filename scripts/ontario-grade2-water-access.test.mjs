import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(`../${p}`,import.meta.url)));
const report=load('reports/ontario-grade2-water-access-task-design-2026-11-12.json');
const ledger=load('reports/ontario-grade2-water-access-current-ledger-2026-11-12.json');
const topics=load('data/topics.json').topics, contexts=load('data/curriculum-alignments.json').alignments;
const guides=load('data/teaching-research.json').records, edges=load('data/dependencies.json').dependencies;
const id='mt_WaA8ssQp2K';
function check(r=report){
 const card=topics.find(t=>t.id===id);assert.deepEqual(r.newWholeCard,card);assert.equal(card.evidence.length,4);
 assert.deepEqual([card.ageRangeStart,card.ageRangeEnd],[7,8]);
 const offers=contexts.filter(c=>c.topicId===id);assert.equal(offers.length,1);assert.deepEqual(offers[0],r.initialContext);
 assert.deepEqual(offers[0].standards,['the-ontario-curriculum-science-and-technology-20:ON-SCI-2022-G2-E1.3']);
 assert.equal(edges.filter(e=>e.topicId===id).length,0);assert.deepEqual(r.newHardPrerequisites,[]);
 const guide=guides.find(g=>g.topicId===id);assert.equal(guide.confidence,'low');assert.equal(guide.learn.schemaVersion,2);
 assert.equal(r.studyCases.length,3);assert.ok(new Set(r.studyCases.map(c=>c.region)).size>=2);
 assert.ok(r.studyCases.every(c=>c.accountDate==='2025-08-25'&&c.place&&c.facts&&c.unknown&&c.sourceUrl));
 assert.deepEqual(r.changedCases.map(c=>c.id),['P','Q','R']);assert.ok(r.changedCases.every(c=>c.isModel));
 assert.match(r.changedCases[1].key.quality,/Unknown.*safe OR unsafe/);
 assert.match(r.changedCases[2].key.access,/does not refill/);
 assert.deepEqual(r.independentProtocol.requiredEvidence,['physical-versus-safe-usable-access','two-world-region-cases-place-date-limits','two-supported-community-consequences','third-case-comparison-transfer','P-source-remains-route-stops','Q-quality-unknown-withhold-both-safety-verdicts','R-empty-store-no-created-supply','explicit-evidence-limits']);
 assert.equal(r.independentProtocol.completedRowsOrTeacherAnswersSufficient,false);
 assert.equal(r.independentProtocol.sameCountryCasesAloneSufficient,false);
 assert.deepEqual(r.protocols['E1.3'],r.independentProtocol);
 assert.equal(r.negativeBoundaries.unknownQualityMeansUnsafe,false);assert.equal(r.negativeBoundaries.parentRollup,false);
 assert.equal(r.existingWaterLocationRole,'prerequisite-only; no new direct source pair fabricated');
 assert.deepEqual(ledger.records.map(x=>x.code),['ON-SCI-2022-G2-E1.3']);
 const protocol=ledger.records[0].protocolReference.split('/').slice(1).reduce((v,k)=>v?.[k],r);assert.equal(protocol.requiresIndependentPerformance,true);
 assert.deepEqual(ledger.retainedPartials,['ON-SCI-2022-G2-E1','ON-SCI-2022-G2-E1.1','ON-SCI-2022-G2-E2','ON-SCI-2022-G2-E2.1']);
}
test('water-access source binds complete dated community comparison and changed-case protocol',()=>check());
test('unknown-quality verdict, missing cross-region case or missing transfer fails coverage guard',()=>{
 const wrong=structuredClone(report);wrong.negativeBoundaries.unknownQualityMeansUnsafe=true;assert.throws(()=>check(wrong));
 const cases=structuredClone(report);cases.studyCases=cases.studyCases.filter(c=>c.region!=='South America');assert.throws(()=>check(cases));
 const missing=structuredClone(report);missing.independentProtocol.requiredEvidence.splice(3,1);assert.throws(()=>check(missing));
 const parent=structuredClone(report);parent.negativeBoundaries.parentRollup=true;assert.throws(()=>check(parent));
});
