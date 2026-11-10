import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const report = read('reports/ncert-fundamental-movement-alignment-2026-11-10.json');
const protocols = read('reports/ncert-fundamental-movement-protocols-2026-11-10.json');
const alignments = read('data/curriculum-alignments.json');
const catalogue = read('data/curriculum-standards.json');
const topics = read('data/topics.json');
const research = read('data/teaching-research.json');
const ledger = read('reports/ncert-alignment-readiness-2026-11-10.json');
function check(r, p, a) {
  assert.equal(r.records.length, 26);
  assert.equal(new Set(r.records.map(x => x.key)).size, 26);
  const available = new Set(catalogue.curricula.flatMap(c => c.topics.map(s => `${c.slug}:${s.code}`)));
  const protocolIds = new Set(p.protocols.map(x => x.id));
  const topicMap = new Map(topics.topics.map(x => [x.id,x]));
  const selected = new Set(r.records.map(x => x.key));
  const expected = new Set();
  const recordKinds = new Map();
  for (const row of r.records) {
    assert.ok(available.has(row.key), `unknown source position: ${row.key}`);
    assert.ok(row.assessmentProtocols.length);
    for (const id of row.assessmentProtocols) assert.ok(protocolIds.has(id), `unknown protocol: ${id}`);
    const age = row.source === 'ncert-fs-2025' ? [6,8] : row.key.includes('-FOUNDATION-') ? [3,8] : [8,11];
    assert.deepEqual(row.ageBand, age);
    recordKinds.set(row.source + (row.key.includes('-PREP-') ? ':Prep' : ':FS'),
      (recordKinds.get(row.source + (row.key.includes('-PREP-') ? ':Prep' : ':FS')) ?? 0) + 1);
    const entry = ledger.records.filter(x => x.key === row.key);
    assert.equal(entry.length, 1);
    assert.equal(entry[0].disposition, row.disposition);
    assert.equal(entry[0].reviewReport, 'ncert-fundamental-movement-alignment-2026-11-10.json');
    for (const c of row.contributions) {
      assert.equal(c.role, 'component');
      assert.equal(topicMap.get(c.topicId)?.name, c.topicName);
      expected.add(JSON.stringify([c.topicId,...age,row.key]));
    }
  }
  assert.equal(recordKinds.get('ncert-fs-2025:FS'),12);
  assert.equal(recordKinds.get('ncert-ncfse-2023-ed2024:FS'),5);
  assert.equal(recordKinds.get('ncert-ncfse-2023-ed2024:Prep'),9);
  assert.equal(expected.size,71);
  const actual = new Set();
  for (const context of a.alignments) for (const key of context.standards) {
    if (!selected.has(key)) continue;
    assert.equal(context.scope,'jurisdiction');
    assert.equal(context.country,'IN');
    assert.ok(!context.region && !context.framework && !context.ageOnly);
    actual.add(JSON.stringify([context.topicId,context.ageRangeStart,context.ageRangeEnd,key]));
  }
  assert.deepEqual(actual,expected,'movement report and scoped associations differ');
  assert.equal(new Set(r.newClaimIds).size,7);
  const researched = new Set(research.records.map(x => x.topicId));
  for(const id of r.newClaimIds) {
    assert.equal(topicMap.get(id)?.subject,'Physical Education');
    assert.equal(topicMap.get(id)?.domain,'Fundamental Movement');
    assert.ok(researched.has(id),`missing new-claim guidance: ${id}`);
  }
  const rhythm = r.records.find(x => x.key.endsWith('PREP-PE-LS1-COMP-C-3.2'));
  assert.deepEqual(rhythm.contributions.map(x => x.topicId),['mt_OTFABm2xdf']);
  assert.ok(!r.newClaimIds.includes('mt_OTFABm2xdf'));
}
test('NCERT movement review binds source positions, tasks, guidance and scoped contributions', () => {
  check(report,protocols,alignments);
});
test('movement review rejects cross-artifact drift while allowing unrelated future additions', () => {
  const missing = structuredClone(protocols); missing.protocols.shift();
  assert.throws(() => check(report,missing,alignments),/unknown protocol/);
  const changed = structuredClone(alignments);
  const context = changed.alignments.find(x => x.standards.includes(report.records[0].key));
  context.standards = context.standards.filter(x => x !== report.records[0].key);
  assert.throws(() => check(report,protocols,changed),/scoped associations differ/);
  const future = structuredClone(alignments);
  future.alignments.push({topicId:'mt_example',scope:'jurisdiction',country:'IN',ageRangeStart:8,ageRangeEnd:11,standards:['synthetic:unrelated']});
  check(report,protocols,future);
});
