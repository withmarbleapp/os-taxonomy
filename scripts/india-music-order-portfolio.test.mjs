import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL(`../reports/${p}`,import.meta.url));
const packet=JSON.parse(read('assets/india-music-order/teacher-keys.json'));
function check(d=packet,get=read){
 assert.deepEqual(d.records.map(x=>x.id),['T1','T2','T3','T4','T5','T6','N1','N2','N3','N4','N5','N6','R']);
 for(const flag of ['sourceMeaningVerified','sourceFull','actualAuditoryPlaybackOrLearnerPerformanceClaimed','allPlausibleInterpretationsProvedExhaustive'])assert.equal(d.claims[flag],false);
 assert.equal(d.claims.newTopics,0);assert.equal(d.claims.newAssociations,0);assert.equal(d.scaleExample.universalScaleOrTuningRequired,false);
 const frames=new Set();for(const r of d.records){
  const raw=get(`assets/india-music-order/${r.file}`);assert.equal(createHash('sha256').update(raw).digest('hex'),r.sha256,'actual original sound hash');assert.equal(raw.toString('ascii',0,4),'RIFF');assert.equal(raw.toString('ascii',8,12),'WAVE');assert.equal(raw.readUInt16LE(22),1);assert.equal(raw.readUInt32LE(24),16000);assert.equal(raw.readUInt16LE(34),16);assert.equal(raw.readUInt32LE(40)/2,r.frames);frames.add(r.frames);
  assert.equal(r.ranks.length,4);const dif=r.ranks.slice(1).map((x,i)=>x-r.ranks[i]);assert.equal(r.allTransitionsAdjacent,dif.every(x=>Math.abs(x)===1));assert.equal(r.hasSkip,dif.some(x=>Math.abs(x)>1));assert.equal(r.hasRepeatedNote,dif.includes(0));const nz=dif.filter(Boolean);assert.equal(r.direction,nz.every(x=>x>0)?'up':nz.every(x=>x<0)?'down':'changes');
  for(let n=0;n<4;n++){let rising=0;const start=n*9120;for(let i=1;i<7200;i++)if(raw.readInt16LE(44+(start+i-1)*2)<=0&&raw.readInt16LE(44+(start+i)*2)>0)rising++;assert.ok(Math.abs(rising/.45-d.scaleExample.frequenciesHz[r.ranks[n]-1])<3,'actual PCM pitch matches rank key');}
 }
 assert.equal(frames.size,1,'phrase length cannot supply category answer');assert.ok(!d.records.filter(x=>x.phase==='fresh').some(x=>d.records.filter(y=>y.phase==='teaching').some(y=>JSON.stringify(y.ranks)===JSON.stringify(x.ranks))),'fresh sequences differ from teaching');
 const md=get('india-musical-order-operational-portfolio-2026-11-12.md').toString();for(const anchor of ['music-teach-features','music-independent-hear-reproduce','music-boundary-transfer','music-optional-own-shaping'])assert.ok(md.includes(`id="${anchor}"`),'actual protocol resolves');for(const phrase of ['SourceMeaningUnverified','not establish that these alternatives are exhaustive','compare with the original and make an actual correction','not a substitute','No direct source link is proposed'])assert.ok(md.includes(phrase));
}
test('music portfolio binds actual balanced PCM references, fresh heard/produced cases and unresolved source semantics',()=>check());
test('missing sound/protocol, changed key and unsupported Full cannot qualify musical source',()=>{
 const full=structuredClone(packet);full.claims.sourceFull=true;assert.throws(()=>check(full));
 const key=structuredClone(packet);key.records[0].ranks[1]=5;assert.throws(()=>check(key));
 assert.throws(()=>check(packet,p=>p.endsWith('T1.wav')?Buffer.alloc(44):read(p)));
 assert.throws(()=>check(packet,p=>p.endsWith('.md')?Buffer.from(read(p).toString().replace('id="music-independent-hear-reproduce"','id="missing"')):read(p)),/protocol resolves/);
});
