import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL(`../reports/${f}`,import.meta.url),'utf8');
const report=JSON.parse(read('ontario-grade5-earlier-indigenous-interactions-current-overlay-2026-11-13.json'));
function check(r,get=read){
 assert.deepEqual(r.records.map(x=>x.code),['A3.2']);const row=r.records[0];assert.equal(row.key,'the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G5-SS-A3.2');assert.equal(row.disposition,'Full');assert.equal(row.wholeTopicAwardFromSourceResult,false);assert.equal(row.actualProgrammeOrLearnerEvidenceClaimed,false);assert.equal(row.independentSourcePerformanceRequired,true);assert.deepEqual(row.existingComponentTopicIdsUnchanged,['mt_BPJ8x-w7_i']);
 const md=get(row.resource);const body=md.split(`## ${row.protocolHeading}\n`)[1]?.split('\n## ')[0];assert.ok(body?.length>2000,'complete independent protocol resolves');for(const phrase of ['FN','2014','1715–1717','Fresh chronology sorting','period not established','date of recording'])assert.ok((body+' '+md).includes(phrase),'chronology/category boundary: '+phrase);
 for(const file of r.boundResources)assert.ok(JSON.parse(get(file)),'prior complete whole source resolves');
 assert.equal(r.sourceRoleContract.twoRelationshipCategoriesRequired,true);assert.equal(r.sourceRoleContract.attributionAndLimitsRequired,true);assert.equal(r.sourceRoleContract.preciseGregorianEpisodeYearRequired,false);assert.equal(r.sourceRoleContract.noUniversalWarOrInventedBattle,true);assert.equal(r.chronologyTransfer.freshChangedDateLabelRequired,true);assert.match(r.chronologyTransfer.interview2014,/not event/);assert.match(r.chronologyTransfer.GwichyaWelcomeEpisode,/not established/);assert.match(r.chronologyTransfer.Thanalthur1715to1717,/Later/);
 assert.equal(r.wholeClaimContract.fullHaudenosauneeAndClassicThuleKnowledgeRetained,true);assert.equal(r.wholeClaimContract.ownComparisonAndFreshAttributedAccountRetained,true);assert.equal(r.wholeClaimContract.wholeGuideAndAllContextsUnchanged,true);assert.equal(r.wholeClaimContract.hardEdges,0);assert.equal(r.canonicalChanges,0);for(const v of Object.values(r.negativeBoundaries))assert.equal(v,false);
}
test('A3.2 binds both earlier interaction categories with attributed positive knowledge and independent chronology transfer',()=>check(report));
test('A3.2 rejects deleted source/whole resources, backdated later stories and false universal or whole-claim awards',()=>{
 assert.throws(()=>check(report,f=>read(f).replace('## Independent complete A3.2 description and comparison','## deleted')),/protocol resolves/);
 assert.throws(()=>check(report,f=>f.includes('early-community-organisation')?'':read(f)));
 for(const k of Object.keys(report.negativeBoundaries)){const m=structuredClone(report);m.negativeBoundaries[k]=true;assert.throws(()=>check(m));}
 const m=structuredClone(report);m.chronologyTransfer.Thanalthur1715to1717='Earlier';assert.throws(()=>check(m));const n=structuredClone(report);n.sourceRoleContract.twoRelationshipCategoriesRequired=false;assert.throws(()=>check(n));
});
