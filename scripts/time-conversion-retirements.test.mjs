import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const report = load('../reports/time-conversion-retired-topic-mappings-2026-11-10.json');
const topics = new Map(load('../data/topics.json').topics.map(t => [t.id, t]));
const contexts = load('../data/curriculum-alignments.json').alignments;
const edges = load('../data/dependencies.json').dependencies;
const research = load('../data/teaching-research.json').records;
const archive = load('../data/archived-teaching-research.json');
const retired = new Set(report.retirements.map(r => r.retiredId));
const retained = 'mt_d8al9JcajP';
const canonical = value => value && typeof value === 'object'
  ? Array.isArray(value) ? value.map(canonical)
    : Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]))
  : value;
const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const identity = row => JSON.stringify(['scope', 'country', 'region', 'framework', 'ageRangeStart', 'ageRangeEnd'].map(k => row[k] ?? null));

test('conversion retirements are flat and preserve original topic/research values', () => {
  assert.equal(retired.size, 3);
  for (const row of report.retirements) {
    assert.ok(!topics.has(row.retiredId));
    assert.deepEqual(row.omittedEvidence, []);
    assert.ok(row.destinations.length);
    for (const destination of row.destinations) {
      assert.ok(topics.has(destination.topicId));
      assert.ok(!retired.has(destination.topicId));
      assert.ok(destination.clause.trim());
    }
    const saved = archive.records.find(r => r.originalTopicId === row.retiredId);
    assert.equal(saved.sourceCommit, report.baseCommit);
    assert.deepEqual(saved.relatedTopicIds, [retained]);
    assert.equal(digest({ topic: saved.topic, research: saved.research }), row.originalTopicAndResearchSha256);
  }
});

test('every original context interval and standard remains represented', () => {
  const actual = contexts.filter(r => r.topicId === retained);
  const expected = new Map();
  for (const original of report.preservedAssociationRequirements) {
    const key = identity(original);
    if (!expected.has(key)) expected.set(key, new Set());
    for (const standard of original.standards) expected.get(key).add(standard);
  }
  for (const { destination } of report.associationRedistributions) {
    if (destination.topicId !== retained) continue;
    const key = identity(destination);
    if (!expected.has(key)) expected.set(key, new Set());
    for (const standard of destination.standards) expected.get(key).add(standard);
  }
  const byIdentity = new Map(actual.map(row => [identity(row), row]));
  // This historical preservation guard must allow later curriculum additions.
  // The current cleanup's exact before/after delta is audited separately.
  for (const [key, codes] of expected) {
    const row = byIdentity.get(key);
    assert.ok(row, `missing preserved context ${key}`);
    for (const code of codes) assert.ok(row.standards.includes(code), `missing preserved code ${code}`);
  }
});

test('refocused dimensional claim preserves linear and financial components on suitable exact-band holders', () => {
  const financial = 'the-ontario-curriculum-mathematics-2020:ON-MATH-2020-G7-F1.1';
  assert.ok(!contexts.some(r => r.topicId === 'mt_tpT9brpI6D' && r.standards.includes(financial)));
  for (const transfer of report.associationRedistributions) {
    const actual = contexts.find(r => r.topicId === transfer.destination.topicId && identity(r) === identity(transfer.destination));
    assert.ok(actual, `missing exact-band destination for ${transfer.destination.topicId}`);
    for (const code of transfer.destination.standards) {
      assert.ok(actual.standards.includes(code));
      assert.ok(transfer.from.standards.includes(code));
    }
    if (transfer.destination.standards.includes(financial)) {
      assert.equal(actual.topicId, 'mt_EmR5n58jZt');
      assert.match(topics.get(actual.topicId).description, /scaling/);
      assert.deepEqual([actual.ageRangeStart, actual.ageRangeEnd], [12, 13]);
    }
  }
  const d8 = topics.get(retained);
  assert.doesNotMatch(d8.description, /decimals up to three/);
});

test('no retired ID remains in active graph/research and no inappropriate hard gate is inherited', () => {
  for (const edge of edges) {
    assert.ok(!retired.has(edge.topicId) && !retired.has(edge.prerequisiteId));
    assert.notEqual(edge.topicId, edge.prerequisiteId);
  }
  for (const record of research) {
    assert.ok(!retired.has(record.topicId));
    for (const pattern of record.assess?.errorPatterns ?? []) {
      assert.ok(!retired.has(pattern.reteachPrerequisiteId));
      if (pattern.reteachPrerequisiteId) assert.ok(topics.has(pattern.reteachPrerequisiteId));
    }
  }
  assert.ok(!edges.some(e => e.topicId === retained && e.prerequisiteId === 'mt_IL86kadLSS'));
  for (const prerequisiteId of ['mt_KaF0SQvaiu', 'mt_wPgpMJ0-PA', 'mt_LlMl2PbaZe']) {
    assert.equal(edges.find(e => e.topicId === retained && e.prerequisiteId === prerequisiteId)?.strength, 'soft');
  }
});

test('older retirement mappings still resolve directly to active topics', () => {
  for (const map of [report, load('../reports/acara-v9-retired-topic-mappings-2026-10-23.json')]) {
    for (const row of map.retirements) for (const destination of row.destinations) {
      assert.ok(topics.has(destination.topicId), `${row.retiredId} -> ${destination.topicId}`);
    }
  }
});

test('separate dimensional scaling and applied conversion assessments exercise their actual claims', () => {
  const dimensional = topics.get('mt_tpT9brpI6D').assessmentPrompt;
  assert.match(dimensional, /m²/);
  assert.match(dimensional, /cm³/);
  assert.match(dimensional, /litres/);
  const applied = topics.get('mt_SqhXQhAEUf').assessmentPrompt;
  assert.match(applied, /kg/);
  assert.match(applied, /grams/);
  assert.match(applied, /three batches/);
});

test('power-of-ten worked answers respect the unchanged three-decimal scope', () => {
  const topic = topics.get('mt_wPgpMJ0-PA');
  assert.match(topic.description, /up to three decimal places/);
  const equations = topic.evidence.flatMap(text => [...text.matchAll(/(\d+(?:\.\d+)?)\s*([×÷])\s*(\d+)\s*=\s*(\d+(?:\.\d+)?)/g)]);
  assert.ok(equations.some(([, , op]) => op === '÷'));
  for (const [, left, op, right, answer] of equations) {
    const computed = op === '×' ? Number(left) * Number(right) : Number(left) / Number(right);
    assert.ok(Math.abs(computed - Number(answer)) < 1e-10);
    assert.ok((answer.split('.')[1]?.length ?? 0) <= 3, `${left} ${op} ${right} = ${answer}`);
  }
});
