import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),prefix='india-ncert-2017-english-source-authoring-2026-11-13';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const report=JSON.parse(read(`reports/${prefix}-review.json`));
const contexts=JSON.parse(read('data/curriculum-alignments.json')).alignments;
function check(r,cs,get=read){
 assert.equal(r.records.length,79);assert.deepEqual([1,2,3,4,5].map(g=>r.records.filter(x=>x.grade===g).length),[15,12,14,19,19]);
 assert.equal(r.sourceParentRollup,false);assert.equal(r.actualLearnerPerformanceClaimed,false);assert.equal(r.actualPublisherMediaCopied,false);
 assert.equal(r.records.filter(x=>x.authoringDisposition==='Conditional').length,1);
 const md=get(`reports/${prefix}-task-design.md`),all=[];
 for(let i=1;i<=18;i++){const anchor='e'+String(i).padStart(2,'0');assert.ok(md.includes(`<a id="${anchor}"></a>`),'actual task family anchor');}
 for(const row of r.records){
  assert.match(row.key,/^ncert-elementary-learning-outcomes-2017:IN-NCERT-LO-2017-EN-G[1-5]-LO\d\d$/);
  assert.equal(row.sourcePerformanceAwardsWholeTopic,false);
  for(const ref of row.originalTaskResources){const [file,anchor]=ref.split('#');assert.ok(get('reports/'+file).includes(`<a id="${anchor}"></a>`),'source task reference resolves');}
  for(const c of row.contributions){assert.equal(c.role,'component');assert.ok(c.ageRangeStart>=c.wholePathMinimum);assert.ok(c.ageRangeStart>=row.grade+5&&c.ageRangeEnd<=row.grade+6);assert.ok(cs.some(x=>x.topicId===c.topicId&&x.country==='IN'&&x.scope==='jurisdiction'&&!x.region&&x.ageRangeStart===c.ageRangeStart&&x.ageRangeEnd===c.ageRangeEnd&&x.standards.includes(row.key)),'exact source component context');all.push([c.topicId,row.key,c.ageRangeStart,c.ageRangeEnd]);}
 }
 assert.equal(all.length,112);assert.equal(crypto.createHash('sha256').update(JSON.stringify(all.sort())).digest('hex'),'f2f389b1e93d7d630ebfd2965a8f9be9ab093bc5aa8e8056e77dee027f00fcf2');
 assert.deepEqual(r.records.filter(x=>x.sourceOnlyRoute).map(x=>x.key.split(':')[1]),['IN-NCERT-LO-2017-EN-G1-LO06','IN-NCERT-LO-2017-EN-G1-LO14','IN-NCERT-LO-2017-EN-G2-LO05']);
 assert.equal(r.records.flatMap(x=>x.contributions).filter(x=>x.laterOfferReviewed).length,3);
 const appreciative=r.records.at(-1);assert.equal(appreciative.authoringDisposition,'Conditional');assert.match(appreciative.typedCondition,/no compulsory positive opinion/);
 for(const text of ['Fresh independently sung lyrics','discernible melody','fresh independently heard list','Fresh independent exchange','fresh independent paragraph','actually reads aloud','actual own experience','0.640–27.880','27.880–39.480'])assert.ok(md.toLowerCase().includes(text.toLowerCase()),'complete actual original task '+text);
 const media=JSON.parse(get('reports/assets/ncert-2017-english/actual-publisher-input-bindings.json'));
 assert.equal(media.newspaper.source.issue,916);assert.equal(media.newspaper.source.selectedPrintedPage,9);assert.match(media.newspaper.source.url,/FIRSTNEWS_916.pdf$/);assert.equal(media.newspaper.freshQuestionsAndKey.length,2);
 assert.match(media.television.source.url,/abc.net.au\/btn\/classroom\/book-week\/105669310$/);assert.deepEqual(media.television.teachingSectionSeconds,[0.64,27.88]);assert.deepEqual(media.television.freshSectionSeconds,[27.88,39.48]);assert.equal(media.television.freshQuestionsAndKeys.length,2);assert.equal(media.actualPupilPerformanceClaimed,false);
 assert.ok(!md.includes('No actual TV selection has been supplied')&&!md.includes('no real press item'),'stale input-gap claims removed');
 const key=JSON.parse(get('reports/assets/ncert-2017-english/original-seven-note-song-key.json'));assert.equal(key.notes.length,28);assert.equal(key.durationSeconds,14);assert.equal(key.frames,224000);
 for(const file of r.originalAssets){assert.ok(fs.existsSync(path.join(root,'reports',file)),'actual original asset');}
 assert.ok(get('reports/assets/ncert-2017-english/crossword-teaching.svg').includes('<svg'));assert.ok(get('reports/assets/ncert-2017-english/crossword-fresh.svg').includes('<svg'));
}
test('English79 binds actual independent tasks, authentic media,112 components and three justified source-only routes',()=>check(report,contexts));
test('English79 rejects missing material/component, false media substitution, forced affect Full and rollup',()=>{
 assert.throws(()=>check(report,contexts,p=>read(p).replace('id="e08"','id="missing-dictation"')),/task family/);
 const row=report.records[0],c=row.contributions[0];assert.throws(()=>check(report,contexts.map(x=>x.topicId===c.topicId?{...x,standards:x.standards.filter(k=>k!==row.key)}:x)),/component context/);
 assert.throws(()=>check(report,contexts,p=>p.endsWith('actual-publisher-input-bindings.json')?JSON.stringify({newspaper:{source:{issue:0}}}):read(p)));
 const forced=structuredClone(report);forced.records.at(-1).authoringDisposition='Full';assert.throws(()=>check(forced,contexts));
 assert.throws(()=>check({...report,sourceParentRollup:true},contexts));
 assert.throws(()=>check(report,contexts,p=>p.endsWith('original-seven-note-song-key.json')?JSON.stringify({notes:[],durationSeconds:0}):read(p)));
});
