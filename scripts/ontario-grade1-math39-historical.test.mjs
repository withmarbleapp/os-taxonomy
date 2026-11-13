import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const stem='reports/ontario-grade1-mathematics-historical-requalification-2026-11-13';
const review=JSON.parse(fs.readFileSync(stem+'-review.json','utf8'));
const text=s=>fs.readFileSync(stem+s+'.md','utf8');
test('G1 finite39 exact source set, independent overall references and exclusions resolve',()=>{
 const expected=['A1','B1',...Array.from({length:8},(_,i)=>`B1.${i+1}`),'B2',...Array.from({length:5},(_,i)=>`B2.${i+1}`),'C1',...Array.from({length:4},(_,i)=>`C1.${i+1}`),'C2',...Array.from({length:3},(_,i)=>`C2.${i+1}`),'C3','C3.1','C3.2','C4','E1',...Array.from({length:5},(_,i)=>`E1.${i+1}`),'E2','E2.1','E2.2','E2.3'];
 assert.equal(expected.length,39);
 assert.deepEqual(review.records.map(r=>r.sourceKey.split('-G1-')[1]).sort(),expected.sort());
 for(const r of review.records){const md=fs.readFileSync(r.sourceProtocol.resource,'utf8');assert.ok(md.split('\n').includes('## '+r.sourceProtocol.protocolHeading));assert.equal(r.actualLearnerPerformanceClaimed,false);assert.equal(r.wholeClaimsAwardedBySourceResult,false);}
 for(const f of review.resources)assert.ok(fs.existsSync(f));
 assert.equal(review.records.find(r=>r.sourceKey.endsWith('-A1')).SELOverallAssessed,false);
 assert.equal(review.counts.newFullCount,0);assert.equal(review.guideAbsenceIds.length,28);assert.equal(new Set(review.guideAbsenceIds).size,28);
 for(const id of review.guideAbsenceIds)assert.ok(text('-whole-support').includes(id));
});
test('G1 retained whole operations and actual modelling cannot become paper-only/source rollups',()=>{
 const s=text('-whole-support'),m=text('-modelling'),t=text('-tasks');
 for(const phrase of ['actual virtual','52','3 tens 22 ones','120','16-minute','24-counter','change-x-by2','length(answer)>0','inner AND','actual accessible block-programming','first-of-December','own-work correction'])assert.ok(s.includes(phrase),phrase);
 for(const phrase of ['actual organiser','prediction','physical/organiser check','genuine changed supply requirement','Adult completion'])assert.ok(m.includes(phrase),phrase);
 assert.ok(t.includes('not to be assessed, evaluated or reported'));assert.ok(t.includes('Independent C3 overall'));assert.ok(t.includes('Independent E2 overall'));
 assert.deepEqual(review.canonicalDelta,{topics:0,ages:0,contexts:0,pairs:0,guides:0,edges:0});
});
