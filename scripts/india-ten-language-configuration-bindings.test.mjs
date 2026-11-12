import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const load = p => JSON.parse(read(p));
const report = load('reports/india-ten-language-configuration-current-review-2026-11-12.json');
const ledger = load('reports/india-formal-primary-completion-ledger-2026-11-12.json');
const remaining = load('reports/india-selected-primary-remaining-conditions-current-2026-11-12.json');
const protocols = ['foundational', 'preparatory'].flatMap(s => load(`reports/ncert-${s}-language-protocols-2026-11-10.json`).protocols);
function check(r, get = read) {
  const expected = ledger.records.filter(x => x.currentAuthoringDisposition === 'ConditionalLanguageBinding');
  assert.equal(expected.length, 10);
  assert.deepEqual(r.records.map(x => x.key).sort(), expected.map(x => x.key).sort());
  for (const row of r.records) {
    assert.equal(row.sourceDispositionRetained, 'ConditionalLanguageBinding');
    assert.equal(row.actualProgrammeReady, false);
    assert.equal(row.deliveryOrLearnerPerformanceClaimed, false);
    assert.equal(row.programmeGates.length, 3);
    const text = get(`reports/${row.taskContract}`);
    const part = text.split(`<a id="${row.taskAnchor}"></a>`)[1]?.split('<a id=')[0];
    assert.ok(part && part.length > 350, 'exact task anchor resolves to complete material');
    assert.ok(get(`reports/${row.sharedRoleContract}`).includes('Configuration and acceptance'));
    for (const id of row.existingProtocolBindings) assert.ok(protocols.some(x => x.id === id), 'existing complete source protocol resolves');
    assert.equal(remaining.records.find(x => x.key === row.key).currentDisposition, 'ConditionalLanguageBinding');
  }
  const text = get(`reports/${r.records[0].taskContract}`);
  for (const id of ['fresh-r2-poem', 'fresh-r2-information', 'changed-r2-information']) {
    const part = text.split(`<a id="${id}"></a>`)[1]?.split('<a id=')[0];
    assert.ok(part && part.length > 450, 'fresh reading input and key supplied');
  }
  const oral = text.split('<a id="preparatory-r1-oral"></a>')[1].split('<a id=')[0];
  assert.match(oral, /Because the path is narrow/);
  assert.match(oral, /simple\/compound-only answer.*does not satisfy/);
  assert.match(oral, /unavailable table.*new independent complex explanation/);
  const svg = get(`reports/${r.newOriginalResources[0]}`);
  assert.match(svg, /<svg[\s>]/);
  assert.match(svg.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '), /A Map for Our Table/);
  assert.match(svg, /Where does it go/);
  assert.deepEqual(ledger.currentAuthoringCounts, { eligible: 221, Full: 176, nonFull: 45, newSourceAuthoringFull: 7, acceptedMainFull: 169, acceptedMainNonFull: 52 });
  assert.equal(remaining.counts.nonFull, 70);
  assert.equal(remaining.counts.FullCurrentAuthoring, 451);
}
test('ten conditional language contracts resolve concrete tasks, fresh inputs and unchanged source status', () => check(report));
test('language contract guard rejects missing tasks/materials, premature programme readiness and removed complex transfer', () => {
  const missing = structuredClone(report); missing.records[0].taskAnchor = 'missing-task';
  assert.throws(() => check(missing), /exact task anchor/);
  const premature = structuredClone(report); premature.records[0].actualProgrammeReady = true;
  assert.throws(() => check(premature));
  assert.throws(() => check(report, p => { if (p.endsWith('.svg')) throw Error('missing printable'); return read(p); }), /missing printable/);
  assert.throws(() => check(report, p => p.endsWith('configuration-and-parent-tasks-2026-11-12.md') ? read(p).replace('id="fresh-r2-poem"', 'id="removed"') : read(p)), /fresh reading input/);
  assert.throws(() => check(report, p => p.endsWith('configuration-and-parent-tasks-2026-11-12.md') ? read(p).replace('unavailable table', 'available table') : read(p)), /unavailable table/);
});
test('finite source inventory and selected remainder reconcile every retained source key without denominator inflation', () => {
  const sourceRows = load('reports/ncert-alignment-readiness-2026-11-10.json').records;
  const inventory = load('reports/india-primary-source-accounting-decision-2026-11-12.json');
  const formal = sourceRows.filter(r => r.source === 'ncert-ncfse-2023-ed2024');
  assert.equal(formal.length, 254);
  const censusKeys = inventory.formalSourceCensus.flatMap(c => c.sourceKeys);
  assert.equal(new Set(censusKeys).size, 254);
  assert.deepEqual(censusKeys.sort(), formal.map(r => r.key).sort());
  assert.equal(inventory.formalSourceCensus.length, 12);
  assert.equal(inventory.selectedImplementationMaterials.length, 30);
  assert.equal(inventory.countsMeaning.formalEligible, 221);
  assert.equal(inventory.countsMeaning.formalActualPEExcluded, 33);
  assert.equal(inventory.countsMeaning.overallIndiaDenominator, null);
  assert.equal(inventory.countsMeaning.overallCBSEPrimaryDenominator, null);
  const overlay = new Map(ledger.records.map(r => [r.key, r.currentAuthoringDisposition]));
  const expected = sourceRows.filter(r => !['Full', 'OutOfScope'].includes(overlay.get(r.key) ?? r.disposition ?? r.reviewedDisposition));
  assert.deepEqual(remaining.records.map(r => r.key).sort(), expected.map(r => r.key).sort());
  assert.equal(new Set(remaining.records.map(r => r.key)).size, 70);
  assert.equal(remaining.records.filter(r => r.formalFrameworkOverlap).length, 45);
  for (const r of remaining.records) for (const ref of r.completeTaskProtocolReferences) {
    const body = load(`reports/${ref.file}`);
    if (ref.protocolId) assert.ok(body.protocols?.some(p => p.id === ref.protocolId), 'every retained duty resolves to its complete current protocol');
    else { assert.equal(ref.path, '/'); assert.ok(body.protocol && body.sourceRequirementHandling, 'root protocol body resolves'); }
  }
});
