import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const ledger=read('reports/ontario-arts-primary-review-2026-11-11.json');
const programme=read('reports/ontario-arts-primary-task-programme-2026-11-11.json');
const alignments=read('data/curriculum-alignments.json').alignments;
const catalogue=read('data/curriculum-standards.json').curricula.find(s=>s.slug===ledger.source);
const clone=x=>structuredClone(x);
const expectedProtocols={A1:['dance-create'],A2:['dance-analyse','arts-reflection'],A3:['dance-context'],B1:['drama-create','drama-production'],B2:['drama-response','arts-reflection'],B3:['drama-context'],C1:['music-performance','music-create','music-notation'],C2:['music-response','arts-reflection'],C3:['music-context'],D1:['visual-create','visual-techniques'],D2:['visual-response','visual-symbol-context','arts-reflection'],D3:['visual-symbol-context']};
function protocolsFor(code){
 if(!code.includes('.'))return expectedProtocols[code];
 if(/^[ABC]2\.3$|^D2\.4$/.test(code))return ['arts-reflection'];
 if(/^A1\./.test(code))return ['dance-create'];
 if(/^A2\./.test(code))return ['dance-analyse'];
 if(/^A3\./.test(code))return ['dance-context'];
 if(/^B1\./.test(code))return [code==='B1.4'?'drama-production':'drama-create'];
 if(/^B2\./.test(code))return ['drama-response'];
 if(/^B3\./.test(code))return ['drama-context'];
 if(code==='C1.2')return ['music-performance','music-create'];
 if(/^C1\./.test(code))return [code==='C1.3'?'music-create':code==='C1.5'?'music-notation':'music-performance'];
 if(/^C2\./.test(code))return ['music-response'];
 if(/^C3\./.test(code))return ['music-context'];
 if(/^D1\./.test(code))return [code==='D1.4'?'visual-techniques':'visual-create'];
 if(/^D2\./.test(code))return [code==='D2.3'?'visual-symbol-context':'visual-response'];
 if(/^D3\./.test(code))return ['visual-symbol-context'];
 throw new Error('Unreviewed source code');
}
function qualify(l=ledger,p=programme,a=alignments){
 const expected=catalogue.topics.map(t=>t.key).filter(k=>/-G[1-6]-/.test(k));
 assert.equal(l.records.length,300);assert.equal(new Set(l.records.map(r=>r.sourceKey)).size,300);
 assert.deepEqual(l.records.map(r=>r.sourceKey).sort(),expected.sort());
 const byKey=new Map(l.records.map(r=>[r.sourceKey,r]));const ps=new Set(p.protocols.map(r=>r.id));const panels=new Set(p.gradePanels.map(r=>r.id));
 const national=p.sourceCaseBindings.find(r=>r.sourceKey===l.source+':ON-ARTS-2009-G6-D3.2');assert(national);assert.deepEqual(national.national.resourceIds,['canada-maple-leaf']);assert.deepEqual(national.occupation.resourceIds,['enchanted-owl']);assert.equal(national.local.kind,'actual local visual-arts exhibition');assert.equal(national.national.kind,'national visual-design function');assert(national.national.resourceIds.every(id=>p.resources.some(r=>r.id===id)));
 const actualPairs=new Set();
 for(const r of l.records){
  assert.match(r.sourceKey,new RegExp(`-G${r.grade}-${r.officialCode.replace('.','\\.')}$`));
  assert.equal(r.ageRangeStart,r.grade+5);assert.equal(r.ageRangeEnd,r.grade+6);
  assert.deepEqual(r.protocolIds,protocolsFor(r.officialCode));assert(r.protocolIds.every(x=>ps.has(x)));
  const panel=r.area.toLowerCase().replaceAll(' ','-')+'-g'+r.grade;assert.equal(r.gradePanelId,panel);assert(panels.has(panel));
  assert(r.sourceAuthority.gradeConceptPanelRequired);assert(r.sourceAuthority.examplesIllustrative);
  assert.equal(r.topicContributions.length,new Set(r.topicContributions.map(x=>x.topicId)).size);
  assert(r.topicContributions.length>0);
  for(const c of r.topicContributions){
   assert.equal(c.role,'component');assert(c.wholeClaimAssessmentRetained);
   assert(!(r.grade<4&&c.topicId==='mt_Gy9nCgUjlD'),'Early devised notation cannot certify fixed staff literacy');
   const context=a.find(x=>x.topicId===c.topicId&&x.scope==='jurisdiction'&&x.country==='CA'&&x.region==='Ontario'&&x.ageRangeStart===r.ageRangeStart&&x.ageRangeEnd===r.ageRangeEnd);
   assert(context?.standards.includes(r.sourceKey),'Missing exact source-age-topic association');actualPairs.add(c.topicId+'|'+r.sourceKey);
  }
  if(r.recordKind==='overall'){
   const children=l.records.filter(x=>x.grade===r.grade&&x.officialCode.startsWith(r.officialCode+'.'));
   assert.deepEqual([...r.includesSourceKeys].sort(),children.map(x=>x.sourceKey).sort());
   const childOnly=new Set(r.childOnlyComponentTopicIds??[]);const ids=[...new Set(children.flatMap(x=>x.topicContributions.map(c=>c.topicId)))].filter(t=>!childOnly.has(t)).sort();assert.deepEqual(r.topicContributions.map(c=>c.topicId).sort(),ids);if(childOnly.size){assert.equal(r.grade,6);assert.equal(r.officialCode,'D1');assert.deepEqual([...childOnly],['mt_JmErYQaKgp']);}
   assert(r.includesSourceKeys.every(k=>byKey.has(k)));
  }
  if(r.remainingRequirement)assert.equal(r.disposition,'Partial');else assert.equal(r.disposition,'Full');
 }
 const scopeKeys=new Set(expected);for(const x of a)for(const k of x.standards.filter(k=>scopeKeys.has(k))){const r=byKey.get(k);assert.equal(x.scope,'jurisdiction');assert.equal(x.country,'CA');assert.equal(x.region,'Ontario');assert.equal(x.ageRangeStart,r.ageRangeStart);assert.equal(x.ageRangeEnd,r.ageRangeEnd);}const graphPairs=new Set(a.flatMap(x=>x.standards.filter(k=>scopeKeys.has(k)).map(k=>x.topicId+'|'+k)));
 assert.deepEqual([...graphPairs].sort(),[...actualPairs].sort());
 assert.equal(l.counts.componentPairs,actualPairs.size);assert.equal(l.counts.Full,l.records.filter(r=>r.disposition==='Full').length);assert.equal(l.counts.Partial,l.records.filter(r=>r.disposition==='Partial').length);
 const roles=l.records.find(r=>r.grade===5&&r.officialCode==='B3.2');assert(roles.topicContributions.some(c=>c.topicId==='mt_PJE57bAvMG'));assert(!roles.topicContributions.some(c=>c.topicId==='mt_DkzsZdyaL2'));
}
test('all 300 exact Arts source duties bind to their own protocol, grade panel, child closure and scoped graph',()=>qualify());
test('another valid protocol cannot silently replace the record-specific task',()=>{const x=clone(ledger);x.records.find(r=>r.officialCode==='A1.1').protocolIds=['music-create'];assert.throws(()=>qualify(x));});
test('another valid grade panel cannot replace the actual grade duty',()=>{const x=clone(ledger);x.records[0].gradePanelId='dance-g6';assert.throws(()=>qualify(x));});
test('an omitted source child and a deleted graph pair are each detected',()=>{const x=clone(ledger);x.records.find(r=>r.recordKind==='overall').includesSourceKeys.pop();assert.throws(()=>qualify(x));const a=clone(alignments);const c=ledger.records[0].topicContributions[0];const row=a.find(r=>r.topicId===c.topicId&&r.standards.includes(ledger.records[0].sourceKey));row.standards=row.standards.filter(k=>k!==ledger.records[0].sourceKey);assert.throws(()=>qualify(ledger,programme,a));});
test('an extra repeated contribution and an unsupported early staff link are detected',()=>{let x=clone(ledger);x.records[0].topicContributions.push(clone(x.records[0].topicContributions[0]));assert.throws(()=>qualify(x));x=clone(ledger);x.records.find(r=>r.grade===1&&r.officialCode==='C1.5').topicContributions.push({topicId:'mt_Gy9nCgUjlD',role:'component',wholeClaimAssessmentRetained:true});assert.throws(()=>qualify(x));});
test('supplementary durations retain partial bars, compound grouping, alternative endings and correct half-rest anchor',()=>{
 const x=read('reports/assets/ontario-arts-programme/repertoire.json');const by=new Map(x.miniatures.map(s=>[s.id,s]));const sum=a=>a.reduce((n,e)=>n+e.quarterDuration,0);
 assert.deepEqual(by.get('F').bars.map(sum),[3,3]);assert.equal(by.get('F').bars[1].at(-1).kind,'rest');assert.equal(by.get('F').bars[1].at(-1).quarterDuration,.25);
 assert.equal(sum(by.get('G').pickup)+sum(by.get('G').bars[1]),4);assert.equal(sum(by.get('G').bars[0]),4);
 assert.deepEqual(by.get('H').bars.map(sum),[4,4]);assert.match(by.get('H').fermata.interpretation,/not acquire a fixed extra/);
 assert.deepEqual(by.get('J').playOrder,['sharedBar','firstEnding','sharedBar','secondEnding']);
 const svg=readFileSync(new URL('../reports/assets/ontario-arts-programme/supplementary-scores.svg',import.meta.url),'utf8');function restAnchor(s){const h=s.slice(s.indexOf('H: '),s.indexOf('J: '));const lines=[...h.matchAll(/<path d="M30 (\d+)H1215"/g)].map(m=>+m[1]);const r=h.match(/<rect x="[^"]+" y="(\d+)" width="16" height="(\d+)"/);assert.equal(lines.length,5);assert(r);assert.equal(+r[1]+ +r[2],lines[2]);}restAnchor(svg);assert.throws(()=>restAnchor(svg.replace('y="555" width="16"','y="561" width="16"')));
});

test('original resource hashes and the minimal one-point source association stay bound',()=>{
 for(const [name,expected] of Object.entries(programme.originalAssetIntegrity)){const bytes=readFileSync(new URL('../reports/assets/ontario-arts-programme/'+name,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),expected);}
 const row=ledger.records.find(r=>r.grade===6&&r.officialCode==='D1.3');assert(row.topicContributions.some(c=>c.topicId==='mt_JmErYQaKgp'));
 const keys=alignments.filter(r=>r.topicId==='mt_JmErYQaKgp').flatMap(r=>r.standards).filter(k=>k.startsWith(ledger.source+':'));assert.deepEqual(keys,[row.sourceKey]);
 assert(!row.topicContributions.some(c=>c.topicId==='mt_T3bTU2aet-'),'A parallel-projection claim is not a vanishing-point substitute');
});

test('an extra primary source context at an incorrect band is rejected even when its pair already exists',()=>{const a=clone(alignments);const r=a.find(x=>x.standards.includes(ledger.records[0].sourceKey));const wrong=clone(r);wrong.ageRangeStart=10;wrong.ageRangeEnd=12;a.push(wrong);assert.throws(()=>qualify(ledger,programme,a));});

test('a valid performing-arts resource cannot replace the required national visual-design case',()=>{const p=clone(programme);p.sourceCaseBindings[0].national.resourceIds=['nac-amalkay'];assert.throws(()=>qualify(ledger,p));});
