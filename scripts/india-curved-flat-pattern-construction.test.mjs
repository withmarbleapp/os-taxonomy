import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const load=p=>JSON.parse(read(p));
const review=load('reports/india-curved-flat-pattern-construction-review-2026-11-13.json');
const topics=load('data/topics.json').topics;
const guides=load('data/teaching-research.json').records;
const contexts=load('data/curriculum-alignments.json').alignments;
const edges=load('data/dependencies.json').dependencies;
const geometry=load('reports/assets/curved-flat-patterns/teacher-geometry-keys.json');
function check(r=review,get=read,rows=contexts,gs=guides){
 const card=topics.find(x=>x.id===r.newTopicId);assert.ok(card);assert.equal(card.name,'Constructing cylinders and cones from flat patterns');assert.equal(card.evidence.length,4);assert.deepEqual([card.ageRangeStart,card.ageRangeEnd],[10,11]);
 assert.deepEqual(rows.filter(x=>x.topicId===r.newTopicId),[{topicId:r.newTopicId,scope:'jurisdiction',country:'IN',ageRangeStart:10,ageRangeEnd:11,standards:[r.sourceKey]}],'exact one supported component offer');
 assert.equal(r.sourceKey,'ncert-elementary-learning-outcomes-2017:IN-NCERT-LO-2017-MATH-G5-LO03');assert.equal(r.associationRole,'component');assert.equal(r.sourceFullPromotion,false,'component cannot roll up whole source');assert.equal(r.actualPhysicalPrintingOrAssemblyPerformed,false);
 assert.ok(!edges.some(x=>x.topicId===r.newTopicId&&x.strength==='hard'),'no invented hard prerequisite');
 const md=get(`reports/${r.resource}`);for(const anchor of r.protocolAnchors)assert.ok(md.includes(`id="${anchor}"`),'actual complete protocol anchor');
 assert.match(md,/actually supplied D pattern/,'fresh supplied changed-case');assert.match(md,/No such additional asset|no such additional asset/,'unsupplied alternative not required');
 const guide=gs.find(x=>x.topicId===r.newTopicId);assert.ok(guide?.learn&&guide?.assess,'complete guide');assert.equal(guide.confidence,'low');assert.equal(guide.learn.activities.length,4);
 for(const anchor of r.protocolAnchors)assert.ok(guide.learn.activities.some(x=>x.learnerActions.some(a=>a.includes(`${r.resource}#${anchor}`))),'guide actual cross-file protocol');
 for(const asset of r.patternAssets)assert.ok(get(`reports/${asset}`).includes('<svg'),'actual pattern asset');assert.ok(get(`reports/${r.teacherGeometryKeys}`).includes('scaleCheckMm'));
 assert.match(topics.find(x=>x.id==='mt_vnJEztczji').description,/cubes, cuboids, triangular prisms, and square-based pyramids/,'old polyhedral scope retained');assert.match(topics.find(x=>x.id==='mt_QNxFnxikCN').description,/create composite shapes/,'old composition scope retained');
}
function physical(g=geometry,get=read){
 assert.deepEqual(g.rows.map(x=>x.code),['A','B','C','D']);assert.equal(g.scaleCheckMm,50);assert.equal(g.childFormulaRequired,false);
 for(const row of g.rows){
  const s=get(`reports/assets/curved-flat-patterns/pattern-${row.code}.svg`);assert.match(s,/width="210mm" height="297mm" viewBox="0 0 210 297"/);assert.match(s,/M20,267 H70/,'actual50mm scale line');
  const circles=[...s.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map(x=>Number(x[3]));assert.equal(circles.length,row.circleCount);assert.ok(circles.every(x=>x===row.radiusMm));
  if(row.shape==='cylinder'){
   const m=s.match(/<rect x="20" y="45" width="([\d.]+)" height="([\d.]+)"/);assert.ok(m);const length=Number(m[1]);assert.ok(Math.abs(length-2*Math.PI*row.radiusMm)<1e-5,'actual rectangle length matches base circumference');assert.equal(Number(m[2]),row.heightMm);
  }else{
   const m=s.match(/M90,95 L([\d.]+),95 A([\d.]+),([\d.]+) 0 ([01]) 1 ([\d.]+),([\d.]+)/);assert.ok(m);const radius=Number(m[2]);assert.equal(radius,Number(m[3]));assert.ok(Math.abs(Number(m[1])-90-radius)<1e-5);assert.equal(Number(m[4]),row.sectorAngleDegrees>180?1:0);
   let angle=Math.atan2(Number(m[6])-95,Number(m[5])-90);if(angle<0)angle+=2*Math.PI;assert.ok(Math.abs(angle-row.sectorAngleDegrees*Math.PI/180)<1e-5,'actual arc endpoint and teacher angle agree');assert.ok(Math.abs(radius*angle-2*Math.PI*row.radiusMm)<1e-4,'actual sector arc matches base circumference');assert.ok(Math.abs(radius**2-row.radiusMm**2-row.heightMm**2)<1e-6);
  }
 }
 assert.equal(g.rows[1].radiusMm,g.rows[3].radiusMm);assert.ok(g.rows[3].heightMm>g.rows[1].heightMm,'actualBtoDsamebase/tallertransfer');
}
test('curved flat-pattern claim retains exact complete source/resource/guide offer and no parent rollup',()=>check());
test('actual four printable geometries preserve joins, scale and fresh changed-pattern mechanics',()=>physical());
test('missing resource/protocol/guide/pair, parent promotion and wrong geometry cannot qualify',()=>{
 assert.throws(()=>check(review,p=>p.endsWith('pattern-C.svg')?'':read(p)),/actual pattern/);
 assert.throws(()=>check(review,p=>read(p).replace('id="independent-c-d"','id="lost"')),/protocol anchor/);
 assert.throws(()=>check(review,read,contexts.filter(x=>x.topicId!==review.newTopicId)),/component offer/);
 assert.throws(()=>check(review,read,contexts,guides.filter(x=>x.topicId!==review.newTopicId)),/complete guide/);
 const r=structuredClone(review);r.sourceFullPromotion=true;assert.throws(()=>check(r),/roll up/);
 assert.throws(()=>physical(geometry,p=>read(p).replace('125.663706','120.000000')),/circumference/);
});
