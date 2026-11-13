import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const stem='reports/ontario-science-historical84-source-audit-2026-11-13';
const review=JSON.parse(fs.readFileSync(stem+'-review.json','utf8'));
const codeSets={1:'B1.2 B2.1 B2.4 B2.6 D2.1 D2.3 D2.4 D2.5 D2.6 E2.2 E2.4 E2.6',2:'B1.2 B2.2 B2.5 C2.1 C2.2 C2.3 C2.6 D2.1 D2.2 E2.3 E2.4 E2.5',3:'B1.2 B2.1 B2.3 B2.4 B2.8 C2.1 C2.2 C2.3 C2.4 D2.2 D2.5 E1.1 E1.2 E2.3 E2.4 E2.5',4:'B1.2 B2.3 B2.4 B2.5 B2.6 C2.1 C2.2 C2.6 C2.8 D2.1 D2.5 E2.1 E2.2 E2.4 E2.5',5:'B2.1 B2.2 B2.3 B2.4 C2.2 C2.3 C2.4 C2.5 D2.3 E2.1 E2.3 E2.5 E2.6',6:'B1.1 B2.1 B2.3 B2.6 B2.7 C2.1 C2.2 C2.3 C2.5 C2.6 E2.1 E2.2 E2.3 E2.4 E2.5 E2.6'};
const guideIds=new Set(JSON.parse(fs.readFileSync('data/teaching-research.json','utf8')).records.map(r=>r.topicId));
const offers=JSON.parse(fs.readFileSync('data/curriculum-alignments.json','utf8')).alignments;
test('Science84 is the finite historical cohort with real source/protocol/current-claim references',()=>{
 const expected=Object.entries(codeSets).flatMap(([g,s])=>s.split(' ').map(c=>`the-ontario-curriculum-science-and-technology-20:ON-SCI-2022-G${g}-${c}`)).sort();
 assert.equal(expected.length,84);assert.deepEqual(review.records.map(r=>r.sourceKey).sort(),expected);
 for(const r of review.records){
  assert.match(r.sourcePdfSHA256,/^[a-f0-9]{64}$/);assert.ok(Number.isInteger(r.sourcePdfPage));
  assert.ok(fs.existsSync(r.originalReport));assert.ok(fs.existsSync(r.currentReport));
  const md=fs.readFileSync(r.sourceProtocol.resource,'utf8');assert.ok(md.split('\n').includes('## '+r.sourceProtocol.protocolHeading));
  const ids=[...new Set(offers.filter(a=>a.standards.includes(r.sourceKey)).map(a=>a.topicId))].sort();assert.deepEqual(r.directContributorIds,ids);
  assert.deepEqual(r.savedOperativeResource.topicIds,ids.filter(i=>guideIds.has(i)));assert.deepEqual(r.directGuideAbsences,ids.filter(i=>!guideIds.has(i)));
  assert.equal(r.wholeContributorAwardFromSourceResult,false);assert.equal(r.actualLearnerPerformanceClaimed,false);
 }
 const support=fs.readFileSync(stem+'-whole-support.md','utf8');for(const id of new Set(review.records.flatMap(r=>r.directGuideAbsences)))assert.ok(support.includes(id));
 for(const path of [...support.matchAll(/`(reports\/[^`]+)`/g)].map(m=>m[1]))assert.ok(fs.existsSync(path),path);
});
test('Science source protocols retain actual locality, two-way material tests and scientific countercases',()=>{
 const md=fs.readFileSync(stem+'-tasks.md','utf8');
 for(const text of ['all four seasons','buoyancy','absorption/repulsion','closed-air','compression model','reversibility as the only definition','CFIA','without relabelling native Ontario grey squirrels','Sun/Earth/Moon','Meteor is a light phenomenon','Actual scientific results are never fabricated']){
  if(text==='Actual scientific results are never fabricated')assert.ok(review.deliveryLimits.some(s=>s.includes(text)));else assert.ok(md.includes(text),text);
 }
 assert.equal(review.newFullCount,0);assert.equal(review.reportedFullLabelsChanged,0);assert.deepEqual(review.canonicalDelta,{topics:0,ages:0,contexts:0,pairs:0,guides:0,edges:0});
 assert.ok(review.reviewBoundary.includes('not a new complete operative read'));
});
