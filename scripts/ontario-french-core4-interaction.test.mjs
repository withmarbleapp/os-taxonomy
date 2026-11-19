import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const report = load('../reports/ontario-core4-french-interaction-design-2026-11-10.json');
const contexts = load('../data/curriculum-alignments.json').alignments;
const expected = {
 A2:['mt_mB7DVai-Uf','mt_f8n4txtLej','mt_wwdRhPyz6s','mt_Winq7Tu99m','mt_sXRHr7tfS5'],
 'A2.1':['mt_mB7DVai-Uf','mt_f8n4txtLej','mt_sXRHr7tfS5'],
 'A2.2':['mt_wwdRhPyz6s','mt_Winq7Tu99m','mt_mB7DVai-Uf'],
 'A2.3':['mt_v5yDTWEiyQ','mt_cJjnPjuvCU'],
 B2:['mt_wwdRhPyz6s','mt_f8n4txtLej','mt_Winq7Tu99m','mt_sXRHr7tfS5'],
 'B2.1':['mt_sXRHr7tfS5','mt_mB7DVai-Uf','mt_f8n4txtLej'],
 'B2.2':['mt_wwdRhPyz6s','mt_f8n4txtLej','mt_Winq7Tu99m'],
 'B2.3':['mt_v5yDTWEiyQ','mt_cJjnPjuvCU'],
};
function verify(r, alignments) {
 const catalogue = load('../data/curriculum-standards.json').curricula.find(c=>c.slug===r.source.catalogue);
 const keys = new Set(catalogue.topics.map(t=>t.key));
 const topics = new Set(load('../data/topics.json').topics.map(t=>t.id));
 assert.deepEqual(r.records.map(row=>row.code).sort(), Object.keys(expected).sort());
 const selected = new Set(), pairs = new Set();
 for (const row of r.records) {
  assert.equal(row.key, `${r.source.catalogue}:ON-FSL-2013-G4-CORE-${row.code}`);
  assert.ok(keys.has(row.key)); selected.add(row.key);
  assert.equal(row.disposition,'Full'); assert.equal(row.role,'component'); assert.deepEqual(row.remainingConditions,[]);
  assert.deepEqual(row.topicIds, expected[row.code], 'source contributor binding');
  const protocolId = row.code==='A2.3' ? 'listening-strategy-review' : row.code==='B2.3' ? 'speaking-strategy-review' : 'structured-interaction';
  assert.deepEqual(row.protocolIds,[protocolId],'source protocol binding');
  assert.ok(r.protocols[protocolId].codes.includes(row.code));
  assert.ok(r.protocols[protocolId].actions.length && r.protocols[protocolId].positive && r.protocols[protocolId].transfer);
  for (const id of row.topicIds) {
   assert.ok(topics.has(id)); const pair=JSON.stringify([id,row.key]); assert.ok(!pairs.has(pair)); pairs.add(pair);
  }
 }
 const actual = new Set(), holders = new Set();
 for (const c of alignments) {
  const matches=c.standards.filter(k=>selected.has(k)); if(!matches.length)continue;
  assert.deepEqual([c.scope,c.country,c.region,c.ageRangeStart,c.ageRangeEnd],['jurisdiction','CA','Ontario',9,10]);
  holders.add(c.topicId); for(const key of matches)actual.add(JSON.stringify([c.topicId,key]));
 }
 assert.deepEqual(actual,pairs,'scoped source pairs');
 assert.equal(pairs.size,25); assert.equal(holders.size,7);
 assert.equal(r.scope.componentPairs,pairs.size); assert.equal(r.scope.reusedTopicCount,holders.size); assert.equal(r.scope.recordCount,r.records.length);
}
test('French interaction report binds eight retained source identities, separate reflection protocols and exact scoped pairs',()=>verify(report,contexts));
test('French interaction guard rejects missing data, wrong valid protocol and stale totals',()=>{
 const missing=structuredClone(contexts), key=report.records.find(r=>r.code==='A2.2').key;
 const c=missing.find(c=>c.topicId==='mt_Winq7Tu99m'&&c.standards.includes(key));c.standards=c.standards.filter(k=>k!==key);
 assert.throws(()=>verify(report,missing),/scoped source pairs/);
 const wrong=structuredClone(report);wrong.records.find(r=>r.code==='B2.3').protocolIds=['listening-strategy-review'];
 assert.throws(()=>verify(wrong,contexts),/source protocol binding/);
 const totals=structuredClone(report);totals.scope.componentPairs=24;assert.throws(()=>verify(totals,contexts));
});
