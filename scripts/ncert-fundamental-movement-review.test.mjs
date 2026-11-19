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
// These bind the reviewed pinned source positions to their actual task families,
// rather than merely checking that an arbitrary protocol happens to exist.
const expectedBindings = new Map();
const bind = (source, suffix, protocol) => expectedBindings.set(`${source}:${suffix}`, protocol);
for (const [code, protocol] of Object.entries({
  'CG-3':'integrated-body-task', 'C-3.1':'movement-and-object-control',
  'C-3.2':'balance-and-flexibility', 'C-3.3':'precision-in-functional-making',
  'C-3.4':'sustained-functional-effort',
})) bind('ncert-ncfse-2023-ed2024', `IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-${code.startsWith('CG')?'GOAL':'COMP'}-${code}`, protocol);
for (let n=1;n<=6;n++) bind('ncert-fs-2025', `IN-NCERT-FS-2025-PM-G1-G2-C13-LO${String(n).padStart(2,'0')}`, 'movement-and-object-control');
for (const [suffix, protocol] of Object.entries({
  'G1-C14-LO01':'sustained-functional-effort', 'G1-C14-LO02':'sustained-functional-effort',
  'G1-C14-LO03':'balance-and-flexibility', 'G2-C14-LO01':'rope-coordination',
  'G2-C14-LO02':'balance-and-flexibility', 'G2-C14-LO03':'timed-single-leg-source-case',
})) bind('ncert-fs-2025', `IN-NCERT-FS-2025-PM-${suffix}`, protocol);
for (const [suffix, protocol] of Object.entries({
  'LS1-GOAL-CG-3':'combined-game-application', 'LS1-COMP-C-3.1':'combined-game-application',
  'LS1-COMP-C-3.2':'rhythm-reuse', 'LS1-COMP-C-3.3':'partner-coordination',
  'LS1-COMP-C-3.4':'preparation-for-activity', 'LS2-GOAL-CG-1':'combined-game-application',
  'LS2-COMP-C-1.1':'combined-game-application', 'LS2-COMP-C-1.2':'partner-coordination',
  'LS2-COMP-C-1.3':'preparation-for-activity',
})) bind('ncert-ncfse-2023-ed2024', `IN-NCERT-NCFSE-2023-ED2024-PREP-PE-${suffix}`, protocol);
const expectedConditions = {
  'IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-PHYSICAL-COMP-C-3.4':{performance:['carrying','walking','running'],qualities:['strength','endurance']},
  'IN-NCERT-FS-2025-PM-G1-G2-C13-LO06':{hopping:'sustained-period'},
  'IN-NCERT-FS-2025-PM-G1-C14-LO01':{participation:'whole-hopping-game'},
  'IN-NCERT-FS-2025-PM-G1-C14-LO02':{carriedObject:'suitably-demanding-safe-load',handling:'controlled-balance-and-technique'},
  'IN-NCERT-FS-2025-PM-G1-C14-LO03':{balanceDuring:'faster-movement'},
  'IN-NCERT-FS-2025-PM-G2-C14-LO01':{equipment:'rope',actions:['skipping','hopping']},
  'IN-NCERT-FS-2025-PM-G2-C14-LO02':{qualities:['agility','balance']},
  'IN-NCERT-FS-2025-PM-G2-C14-LO03':{position:'single-leg-other-leg-folded',durationSeconds:60},
};
function check(r, p, a) {
  assert.equal(r.records.length, 26);
  assert.equal(new Set(r.records.map(x => x.key)).size, 26);
  assert.deepEqual(new Set(r.records.map(x => x.key)),new Set(expectedBindings.keys()));
  const available = new Set(catalogue.curricula.flatMap(c => c.topics.map(s => `${c.slug}:${s.code}`)));
  const protocolIds = new Set(p.protocols.map(x => x.id));
  const topicMap = new Map(topics.topics.map(x => [x.id,x]));
  const selected = new Set(r.records.map(x => x.key));
  const expected = new Set();
  const recordKinds = new Map();
  for (const row of r.records) {
    assert.ok(available.has(row.key), `unknown source position: ${row.key}`);
    assert.deepEqual(row.assessmentProtocols,row.key.endsWith('FOUNDATION-PHYSICAL-COMP-C-3.3')?[expectedBindings.get(row.key)]:[],`source protocol mismatch: ${row.key}`);
    assert.equal(row.disposition,row.key.endsWith('FOUNDATION-PHYSICAL-COMP-C-3.3')?'Full':'OutOfScope');
    if(row.disposition==='OutOfScope')assert.deepEqual(row.contributions,[]);
    const condition = expectedConditions[row.key.split(':')[1]];
    if (condition) assert.deepEqual(row.sourcePerformanceConditions,condition,`source conditions lost: ${row.key}`);
    for (const id of row.assessmentProtocols) assert.ok(protocolIds.has(id), `unknown protocol: ${id}`);
    const age = row.source === 'ncert-fs-2025' ? [6,8] : row.key.includes('-FOUNDATION-') ? [3,8] : [8,11];
    assert.deepEqual(row.ageBand, age);
    recordKinds.set(row.source + (row.key.includes('-PREP-') ? ':Prep' : ':FS'),
      (recordKinds.get(row.source + (row.key.includes('-PREP-') ? ':Prep' : ':FS')) ?? 0) + 1);
    const entry = ledger.records.filter(x => x.key === row.key);
    assert.equal(entry.length, 1);
    assert.equal(entry[0].disposition, row.disposition);
    assert.equal(entry[0].reviewReport, row.disposition==='OutOfScope'?'ncert-physical-education-exclusion-2026-11-11.json':'ncert-fundamental-movement-alignment-2026-11-10.json');
    for (const c of row.contributions) {
      assert.equal(c.role, 'component');
      assert.equal(topicMap.get(c.topicId)?.name, c.topicName);
      expected.add(JSON.stringify([c.topicId,...age,row.key]));
    }
  }
  assert.deepEqual(p.protocols.find(x => x.id === 'timed-single-leg-source-case').sourcePerformanceConditions,
    expectedConditions['IN-NCERT-FS-2025-PM-G2-C14-LO03'],'timed protocol conditions lost');
  assert.equal(recordKinds.get('ncert-fs-2025:FS'),12);
  assert.equal(recordKinds.get('ncert-ncfse-2023-ed2024:FS'),5);
  assert.equal(recordKinds.get('ncert-ncfse-2023-ed2024:Prep'),9);
  assert.equal(expected.size,2);
  const actual = new Set();
  for (const context of a.alignments) for (const key of context.standards) {
    if (!selected.has(key)) continue;
    assert.equal(context.scope,'jurisdiction');
    assert.equal(context.country,'IN');
    assert.ok(!context.region && !context.framework && !context.ageOnly);
    actual.add(JSON.stringify([context.topicId,context.ageRangeStart,context.ageRangeEnd,key]));
  }
  assert.deepEqual(actual,expected,'movement report and scoped associations differ');
  assert.equal(new Set(r.newClaimIds).size,0);
  const researched = new Set(research.records.map(x => x.topicId));
  for(const id of r.newClaimIds) {
    assert.equal(topicMap.get(id)?.subject,'Physical Education');
    assert.equal(topicMap.get(id)?.domain,'Fundamental Movement');
    assert.ok(researched.has(id),`missing new-claim guidance: ${id}`);
  }
  const rhythm = r.records.find(x => x.key.endsWith('PREP-PE-LS1-COMP-C-3.2'));
  assert.equal(rhythm.disposition,'OutOfScope');assert.deepEqual(rhythm.contributions,[]);
  assert.ok(!r.newClaimIds.includes('mt_OTFABm2xdf'));
}
test('NCERT movement review binds source positions, tasks, guidance and scoped contributions', () => {
  check(report,protocols,alignments);
});
test('movement review rejects cross-artifact drift while allowing unrelated future additions', () => {
  const missing = structuredClone(protocols); missing.protocols=missing.protocols.filter(x=>x.id!=='precision-in-functional-making');
  assert.throws(() => check(report,missing,alignments),/unknown protocol/);
  const wrong = structuredClone(report);
  wrong.records.find(x => x.key.endsWith('PM-G2-C14-LO03')).assessmentProtocols=['balance-and-flexibility'];
  assert.throws(() => check(wrong,protocols,alignments),/source protocol mismatch/);
  const lost = structuredClone(report);
  delete lost.records.find(x => x.key.endsWith('PM-G2-C14-LO03')).sourcePerformanceConditions.durationSeconds;
  assert.throws(() => check(lost,protocols,alignments),/source conditions lost/);
  const shortened = structuredClone(protocols);
  shortened.protocols.find(x => x.id==='timed-single-leg-source-case').sourcePerformanceConditions.durationSeconds=5;
  assert.throws(() => check(report,shortened,alignments),/timed protocol conditions lost/);
  const changed = structuredClone(alignments);
  const context = changed.alignments.find(x => x.standards.includes(report.records.find(r=>r.disposition==='Full').key));
  context.standards = context.standards.filter(x => x !== report.records.find(r=>r.disposition==='Full').key);
  assert.throws(() => check(report,protocols,changed),/scoped associations differ/);
  const future = structuredClone(alignments);
  future.alignments.push({topicId:'mt_example',scope:'jurisdiction',country:'IN',ageRangeStart:8,ageRangeEnd:11,standards:['synthetic:unrelated']});
  check(report,protocols,future);
});
