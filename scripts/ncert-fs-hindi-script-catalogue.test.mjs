import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = file => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url)));
const index = load('reports/ncert-fs-hindi-script-primary-index-2026-11-12.json');
const catalogue = load('data/curriculum-standards.json');
const alignments = load('data/curriculum-alignments.json').alignments;
const ledger = load('reports/ncert-alignment-readiness-2026-11-10.json');
// Independent printed parent/grade counts, including the continued C-10.3 row.
const counts = [
  ['9.1',2,2],['9.2',2,1],['9.3',3,3],['9.4',2,3],['9.5',1,2],['9.6',1,1],['9.7',1,2],
  ['10.1',3,1],['10.2',3,1],['10.3',3,3],['10.4',2,1],['10.5',3,3],['10.6',1,1],['10.7',1,1],['10.8',4,5],['10.9',4,5],['11.1',3,3],['11.2',2,4],
];
const prefix = 'ncert-fs-2025:IN-NCERT-FS-2025-HI-TEXT-';
const expected = new Set(counts.flatMap(([parent,g1,g2]) => [g1,g2].flatMap((n,i) => Array.from({length:n},(_,j) => `${prefix}G${i+1}-C${parent}-LO${String(j+1).padStart(2,'0')}`))));
function verify(i = index, c = catalogue) {
  assert.equal(i.source, 'ncert-fs-2025');
  assert.equal(i.targetLanguage, null);
  assert.equal(i.counts.newSourcePositions, 83);
  assert.deepEqual([i.counts.grade1,i.counts.grade2,i.counts.communicationTwoLanguages,i.counts.L1Literacy,i.counts.L2BeginningLiteracy],[41,42,26,45,12]);
  assert.equal(i.records.length,83);
  assert.deepEqual(new Set(i.records.map(r=>r.key)),expected);
  assert.ok(!/[\u0900-\u097f]/u.test(JSON.stringify(i)), 'restricted source wording must remain private');
  for (const r of i.records) {
    assert.equal(r.targetLanguage,null);
    assert.equal(r.officialOutcomeCode,null);
    assert.equal(r.key,`${prefix}G${r.grade}-${r.officialParentCode.replace('C-','C')}-LO${String(r.bulletOrdinalWithinGradeParent).padStart(2,'0')}`);
    assert.ok(r.sourcePdfPages.every(p=>p>=35&&p<=43));
    if(r.officialParentCode==='C-10.3'&&r.bulletOrdinalWithinGradeParent===3) assert.deepEqual(r.sourcePdfPages,[40]);
    if(r.officialParentCode==='C-10.9') assert.match(r.sourceMeaning,/Unverified/);
  }
  const source=c.curricula.find(r=>r.slug===i.source);
  assert.equal(source.textIncluded,false);
  assert.equal(source.topicCount,399);
  assert.equal(source.topics.length,399);
  const additions=source.topics.filter(r=>r.key.startsWith(prefix));
  assert.equal(additions.length,83);
  for(const r of additions) assert.deepEqual(Object.keys(r).sort(),['code','key']);
  const historical=ledger.records.filter(r=>r.source==='ncert-fs-2025').map(r=>r.key);
  assert.equal(historical.length,316);
  assert.deepEqual(new Set(source.topics.map(r=>r.key)),new Set([...historical,...expected]));
  assert.equal(ledger.records.length,570);
  assert.ok(alignments.every(r=>r.standards.every(k=>!expected.has(k))), 'catalogue must not silently add semantic coverage');
  assert.deepEqual([i.baselineSeparation.historicalSelectedRecords,i.baselineSeparation.historicalSelectedEligible,i.baselineSeparation.historicalSelectedFull],[570,521,444]);
}
test('83 factual rendition positions preserve the historical selection and unresolved programme identity',()=>verify());
test('wrong grade, missing continuation or deduplicated printed position is rejected',()=>{
  const wrong=structuredClone(index);wrong.records[0].grade=wrong.records[0].grade===1?2:1;assert.throws(()=>verify(wrong));
  const continued=structuredClone(index);continued.records.find(r=>r.officialParentCode==='C-10.3'&&r.bulletOrdinalWithinGradeParent===3).sourcePdfPages=[39];assert.throws(()=>verify(continued));
  const missing=structuredClone(index);missing.records.pop();assert.throws(()=>verify(missing));
});
test('target-language inference and verbatim source fields are rejected',()=>{
  const named=structuredClone(index);named.targetLanguage='Hindi';assert.throws(()=>verify(named));
  const leaked=structuredClone(catalogue);leaked.curricula.find(r=>r.slug===index.source).topics.find(r=>r.key.startsWith(prefix)).description='source text';assert.throws(()=>verify(index,leaked));
});
