import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const load = path => JSON.parse(read(path));
const name = 'ontario-grade2-machine-impact-force-task-design-2026-11-12.json';
const resource = load(`reports/${name}`);
const ledger = load('reports/ontario-grade2-machine-impact-force-current-ledger-2026-11-12.json');
const contexts = load('data/curriculum-alignments.json').alignments;
const source = 'the-ontario-curriculum-science-and-technology-20';
const full = ['D1', 'D1.1', 'D1.2', 'D2.5'];
const partial = ['D2', 'D2.3', 'D2.4'];
function checkBindings(rows = ledger, tasks = resource, associations = contexts) {
  assert.deepEqual(rows.records.filter(r => r.disposition === 'Full').map(r => r.code), full.map(c => `ON-SCI-2022-G2-${c}`));
  for (const row of rows.records) {
    assert.equal(row.resource, name, 'Ledger must resolve the actual task resource');
    const protocol = row.protocolReference.split('/').slice(1).reduce((value, key) => value?.[key], tasks);
    assert.equal(typeof protocol, 'string', 'Ledger protocol reference must resolve');
    assert.ok(protocol.trim(), 'Protocol must contain an independent performance instruction');
  }
  for (const code of partial) assert.equal(rows.records.find(r => r.code === `ON-SCI-2022-G2-${code}`)?.disposition, 'Partial', 'Unreviewed machine scope remains Partial');
  const expected = [['mt_MVlTa0XKgo', 'D1'], ['mt_deexfCHU9m', 'D1'], ['mt_deexfCHU9m', 'D1.2']];
  assert.deepEqual(tasks.reviewedSourceScope.newComponentPairs.map(r => [r.topicId, r.code]), expected);
  for (const [id, code] of expected) {
    assert.ok(rows.componentAssociations.some(r => r.topicId === id && r.code === code && r.role === 'component'));
    assert.ok(associations.some(r => r.topicId === id && r.country === 'CA' && r.region === 'Ontario' && r.ageRangeStart === 7 && r.ageRangeEnd === 8 && r.standards.includes(`${source}:ON-SCI-2022-G2-${code}`)), 'Missing reviewed existing-band component pair');
  }
  assert.ok(tasks.readableStudy.some(r => r.id === 'library-ramp-and-cart'));
  assert.ok(tasks.readableStudy.some(r => r.id === 'water-pulley-community'));
  assert.ok(tasks.readableStudy.some(r => r.id === 'movement-and-environment'));
  assert.match(tasks.independentSourceProtocols.D1, /social and environmental/);
  assert.match(read(`reports/${tasks.studyAsset}`), /<svg|six-machine/);
}
test('machine source closures resolve protocols, study assets and exact component contexts', () => checkBindings());
test('dangling protocols, missing pairs and unreviewed promotions fail the contract', () => {
  const tasks = structuredClone(resource); delete tasks.independentSourceProtocols['D2.5'];
  assert.throws(() => checkBindings(ledger, tasks), /reference must resolve/);
  const rows = structuredClone(ledger); rows.records.find(r => r.code.endsWith('-D2.3')).disposition = 'Full';
  assert.throws(() => checkBindings(rows));
  const associations = structuredClone(contexts);
  for (const row of associations) if (row.topicId === 'mt_deexfCHU9m' && row.region === 'Ontario') row.standards = row.standards.filter(s => !s.endsWith('-G2-D1.2'));
  assert.throws(() => checkBindings(ledger, resource, associations), /component pair/);
});
test('force data retain matched-load input-force comparisons and both countercases', () => {
  const data = resource.forceComparisonAssessmentResource;
  assert.match(data.kind, /same load and start\/end height/);
  assert.match(data.kind, /input-force readings in the same arbitrary force units/);
  assert.match(data.kind, /not observed classroom results/);
  const direct = data.table.find(r => r.arrangement === 'direct vertical lift');
  const fixed = data.table.find(r => r.arrangement === 'one fixed overhead pulley');
  assert.ok(direct && fixed);
  assert.equal(fixed.inputForce, direct.inputForce, 'Fixed pulley changes direction without an automatic force reduction');
  for (const type of ['ramp', 'lever', 'moving pulley']) assert.ok(data.table.some(r => r.arrangement.includes(type) && Number.isFinite(r.inputForce) && r.inputDirection), `Missing ${type} comparison`);
  const checks = data.requiredIndependentComparisons.join('\n');
  assert.match(checks, /EACH machine row with direct lift/);
  assert.match(checks, /Changed lever:[\s\S]*closer to the support/);
  assert.match(checks, /different heavier load/);
  assert.match(data.boundary, /does not award whole Testing/);
});
