import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const culture=load('../reports/ontario-core4-french-culture-design-2026-11-10.json');
const contexts=load('../data/curriculum-alignments.json').alignments;
const catalogue=load('../data/curriculum-standards.json').curricula.find(c=>c.slug===culture.source.catalogue);
const reports=['oral','interaction','textforms','reading','writing','culture'].map(n=>load(`../reports/ontario-core4-french-${n}-design-2026-11-10.json`));
const community='mt_RIOhVDZZkG',oral='mt_Winq7Tu99m',roles='mt_2_fB4LuVwc',picture='mt_OlhMP7ShFT',written='mt_sPd4fWeY9x',audience='mt_v5DyOEpbbr';
const expected={A3:[community,oral,roles],'A3.1':[community,oral],'A3.2':[roles,oral],B3:[community,oral,roles],'B3.1':[community,oral],'B3.2':[roles,oral],C3:[community,picture,roles],'C3.1':[community,picture],'C3.2':[roles],D3:[community,written,audience],'D3.1':[community,written],'D3.2':[audience,written]};
function verifyCulture(r){
 assert.deepEqual(r.records.map(x=>x.code).sort(),Object.keys(expected).sort(),'all twelve cultural sources');
 assert.deepEqual([r.scope.records,r.scope.componentPairs,r.scope.reusedTopics,r.scope.newTopics],[12,27,5,1]);
 const channels={A:'listening',B:'speaking',C:'reading',D:'writing'};
 for(const row of r.records){assert.deepEqual(row.topicIds,expected[row.code],'exact source contributions');assert.equal(row.disposition,'Full');assert.deepEqual(row.remainingConditions,[]);const id=`${channels[row.code[0]]}-culture-and-conventions`;assert.deepEqual(row.protocolIds,[id]);assert.ok(r.protocols[id].codes.includes(row.code));}
 const resources=new Map(r.resources.map(x=>[x.id,x]));
 for(const [letter,channel]of Object.entries(channels)){
  const protocol=r.protocols[`${channel}-culture-and-conventions`],p=protocol.performanceConditions;
  assert.deepEqual(protocol.codes,[`${letter}3`,`${letter}3.1`,`${letter}3.2`]);assert.equal(p.channel,channel,'distinct actual channel');assert.equal(p.language,'French');
  assert.deepEqual(p.ontarioCases,['ottawa-festival','sudbury-theatre','ottawa-author']);assert.deepEqual(p.additionalWorldCases,['france-music','uk-reading'],'both world communities');
  for(const id of [...p.ontarioCases,...p.additionalWorldCases])assert.ok(resources.get(id)?.body?.trim(),'actual French resource');
  for(const name of ['ownOrClassConnectionRequired','otherCommunityComparisonRequired','cultureAndConventionsIntegrated','changedRelationshipPreference'])assert.equal(p[name],true,name);
  assert.equal(p.universalAdultVousRule,false);assert.equal(p.automaticEnglishOrDifferentCorpusTransfer,false);
  if(['speaking','writing'].includes(channel))assert.equal(p.ontarioOutwardContributionRequired,true,'Ontario outward contribution');
 }
 assert.match(resources.get('ottawa-festival').body,/internationaux/,'actual outward contribution input');assert.match(resources.get('ottawa-festival').body,/échange culturel/);assert.match(resources.get('ottawa-author').body,/Originaire d’Ottawa/);
 const expectedBindings={reading:[{report:'ontario-core4-french-reading-design-2026-11-10.json',protocolId:'meaning-and-strategies',resourceId:'originalStory',topicId:picture}],writing:[{report:'ontario-core4-french-writing-design-2026-11-10.json',protocolId:'purpose-forms-and-production',topicId:audience},{report:'ontario-core4-french-writing-design-2026-11-10.json',protocolId:'planning-through-publication',topicId:audience}]};
 for(const channel of ['reading','writing']){
  const bindings=r.protocols[`${channel}-culture-and-conventions`].wholeClaimResourceBindings;
  assert.ok(Array.isArray(bindings),'whole claim bindings required');assert.deepEqual(bindings.map(({report,protocolId,resourceId,topicId})=>({report,protocolId,...(resourceId?{resourceId}:{}),topicId})),expectedBindings[channel],'required whole claim bindings');
  for(const b of bindings){const prior=load(`../reports/${b.report}`);assert.ok(prior.protocols[b.protocolId],'whole claim protocol resolves');if(b.resourceId)assert.ok(prior.resources[b.resourceId],'whole claim resource resolves');}
 }
 assert.equal(r.newClaimReview.topicId,community);assert.deepEqual(r.newClaimReview.newDependencies,[]);assert.equal(r.newClaimReview.guideConfidence,'low');assert.equal(r.newClaimReview.guideEffectivenessVerified,false);
 const topic=load('../data/topics.json').topics.find(x=>x.id===community);assert.ok(topic);assert.equal(topic.type,'CONCEPTUAL');assert.equal(topic.subject,'Geography');assert.equal(load('../data/teaching-research.json').records.filter(x=>x.topicId===community).length,1);
}
function verifyComplete(designs,alignments){
 const prefix=`${culture.source.catalogue}:ON-FSL-2013-G4-CORE-`,expectedKeys=catalogue.topics.map(t=>t.key).filter(k=>k.startsWith(prefix)).sort();assert.equal(expectedKeys.length,44,'retained Core4 catalogue identity');
 const rows=designs.flatMap(d=>d.records);assert.deepEqual(rows.map(x=>x.key).sort(),expectedKeys,'exact complete Core4 source set with no duplicates');
 const pairs=new Set();for(const d of designs)for(const row of d.records){assert.equal(row.disposition,'Full');assert.deepEqual(row.remainingConditions,[]);const ids=row.topicIds??row.contributions.map(x=>x.topicId);for(const id of ids)pairs.add(JSON.stringify([id,row.key]));for(const id of row.protocolIds??row.assessmentProtocols)assert.ok(Array.isArray(d.protocols)?d.protocols.some(p=>p.id===id):d.protocols[id],'real source protocol');}
 const actual=new Set();for(const c of alignments)for(const k of c.standards.filter(k=>k.startsWith(prefix))){assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',9,10]);actual.add(JSON.stringify([c.topicId,k]));}assert.deepEqual(actual,pairs,'every Core4 association matches a reviewed contribution');
}
test('twelve French culture sources retain channel, own/other communities, outward contribution and whole-claim bindings',()=>verifyCulture(culture));
test('complete Core Grade4 review binds every retained source and scoped pair to a real design',()=>verifyComplete(reports,contexts));
test('French cultural coverage rejects missing source/pair, absent world case, channel substitution and lost outward contribution',()=>{
 const missing=structuredClone(reports);missing.at(-1).records.pop();assert.throws(()=>verifyComplete(missing,contexts),/exact complete Core4/);
 const lost=structuredClone(contexts),key=culture.records[0].key;for(const c of lost)c.standards=c.standards.filter(k=>k!==key);assert.throws(()=>verifyComplete(reports,lost),/every Core4 association/);
 const world=structuredClone(culture);world.protocols['listening-culture-and-conventions'].performanceConditions.additionalWorldCases=['france-music'];assert.throws(()=>verifyCulture(world),/both world communities/);
 const channel=structuredClone(culture);channel.protocols['reading-culture-and-conventions'].performanceConditions.channel='listening';assert.throws(()=>verifyCulture(channel),/distinct actual channel/);
 const outward=structuredClone(culture);outward.protocols['writing-culture-and-conventions'].performanceConditions.ontarioOutwardContributionRequired=false;assert.throws(()=>verifyCulture(outward),/Ontario outward contribution/);
 for(const channel of ['reading','writing']){
  const empty=structuredClone(culture);empty.protocols[`${channel}-culture-and-conventions`].wholeClaimResourceBindings=[];assert.throws(()=>verifyCulture(empty),/required whole claim bindings/);
  const removed=structuredClone(culture);removed.protocols[`${channel}-culture-and-conventions`].wholeClaimResourceBindings.pop();assert.throws(()=>verifyCulture(removed),/required whole claim bindings/);
 }
 const wrong=structuredClone(culture);wrong.protocols['writing-culture-and-conventions'].wholeClaimResourceBindings[0].protocolId='writing-strategy-review';assert.throws(()=>verifyCulture(wrong),/required whole claim bindings/);
 const ref=structuredClone(culture);ref.protocols['reading-culture-and-conventions'].wholeClaimResourceBindings[0].resourceId='missing';assert.throws(()=>verifyCulture(ref),/required whole claim bindings/);
});
