import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { buildCanonicalResearchCollection, checkCanonicalResearchCollection, canonicalResearchManifestMetadata, regenerateCanonicalResearchCollection } from './canonical-research-collection.mjs';
import { previewCanonicalResearch, canonicalResearchDigest } from './canonical-teaching-research.mjs';
import { checkTeachingResearch, checkResearchArchiveReferences } from './check-public-teaching-research.mjs';

const read = name => readFileSync(new URL('../data/' + name, import.meta.url));
const research = JSON.parse(read('teaching-research.json')), fullTopics = JSON.parse(read('topics.json'));
const candidates = research.schemaVersion === 2 ? research.records : previewCanonicalResearch({ research, researchBytes: read('teaching-research.json'),
  topics: fullTopics, topicsBytes: read('topics.json'), manifest: JSON.parse(read('manifest.json')) }).records.filter(row => row.authoredSha256).map(row => row.record);
function fixture() {
  const record = structuredClone(candidates[0]);
  if (record.assess) record.assess.errorPatterns.forEach(row => { row.reteachPrerequisiteId = null; });
  const topic = structuredClone(fullTopics.topics.find(row => row.id === record.topicId));
  const topics = { version: 'v1', topicCount: 1, topics: [topic] }, topicsBytes = Buffer.from(JSON.stringify(topics));
  const collection = buildCanonicalResearchCollection({ records: [record], topics, topicsBytes, notes: ['Invented collection fixture context'] });
  const manifest = { taxonomyVersion: 'v1', counts: { teachingResearch: 1 }, teachingResearch: canonicalResearchManifestMetadata(collection) };
  return { record, topics, topicsBytes, collection, manifest };
}
test('canonical collection derives only coverage/binding and preserves complete authored values', () => {
  const f = fixture(), before = structuredClone(f.record);
  assert.deepEqual(f.collection.records[0], before);
  assert.deepEqual(checkCanonicalResearchCollection(f.collection, f), []);
  assert.deepEqual(checkTeachingResearch(f.collection, f), []);
  assert.equal(Object.hasOwn(f.collection, 'exportedAt'), false);
  assert.equal(canonicalResearchDigest(f.collection.records[0], f), canonicalResearchDigest(f.record, f));
  assert.equal(f.collection.topicFileSha256, createHash('sha256').update(f.topicsBytes).digest('hex'));
});
test('collection and manifest inconsistencies fail without repairing authored data', () => {
  for (const mutate of [c => {c.schemaVersion = 3}, c => {c.recordCount++}, c => {c.coverage.missingTopicIds = ['mt_unknown']},
    c => {c.canonicalSchemaSha256 = '0'.repeat(64)}, c => {c.digestContract = 'other'}, c => {c.privatePayload = true},
    c => {c.records[0].learn.summary += ' [curriculum wording omitted; reference TEST]'}, c => c.records.push(structuredClone(c.records[0]))]) {
    const f = fixture(), copy = structuredClone(f.collection); mutate(copy);
    assert.ok(checkCanonicalResearchCollection(copy, f).length);
  }
  const f = fixture(); f.manifest.teachingResearch.exportedAt = '2026-01-01T00:00:00Z';
  assert.ok(checkCanonicalResearchCollection(f.collection, f).length);
  const changed = structuredClone(f.topics); changed.topics[0].description += ' Unbound';
  assert.ok(checkCanonicalResearchCollection(f.collection, { ...f, topics: changed }).length);
});
test('collection subject keys are data rather than object prototype mutations', () => {
  const f = fixture(); f.topics.topics[0].subject = '__proto__'; f.topicsBytes = Buffer.from(JSON.stringify(f.topics));
  const collection = buildCanonicalResearchCollection({ records: [f.record], ...f });
  assert.equal(Object.hasOwn(collection.coverage.bySubject, '__proto__'), true);
  assert.deepEqual(collection.coverage.bySubject.__proto__, { topics: 1, withResearch: 1, withoutResearch: 0 });
  assert.equal(Object.hasOwn(Object.prototype, 'topics'), false);
});
test('explicit envelope generation fixes derived counts but rejects unknown fields and unsupported contracts', () => {
  const f = fixture(), stale = structuredClone(f.collection); stale.recordCount = 0; stale.coverage.missingTopicIds = ['mt_wrong'];
  assert.ok(checkCanonicalResearchCollection(stale, f).length);
  assert.deepEqual(regenerateCanonicalResearchCollection(stale, f), f.collection);
  for (const mutate of [c => {c.privateNotes = true}, c => {c.schemaVersion = 3}, c => {c.canonicalSchemaSha256 = '0'.repeat(64)},
    c => {c.digestContract = 'future'}, c => {c.records[0].learn.summary += '[curriculum wording omitted; reference TEST]'}]) {
    const copy = structuredClone(stale); mutate(copy); assert.throws(() => regenerateCanonicalResearchCollection(copy, f));
  }
});
test('canonical archive provenance is historical and cannot silently repair current guidance', () => {
  const f = fixture(), archive = { schemaVersion: 1, version: 'v1', records: [], activeReferenceRepairs: [], historicalReferenceRepairs: {
    sourceCommit: 'a'.repeat(40), sourceResearchSha256: 'b'.repeat(64), entries: [{ researchTopicId: f.record.topicId,
      diagnosticId: 'diagnostic_historical_fixture', path: '.assess.errorPatterns[0].reteachPrerequisiteId', from: 'mt_old', to: 'mt_previous' }] } };
  assert.deepEqual(checkResearchArchiveReferences(archive, { topics: f.topics, research: f.collection }), []);
  // Later authored guidance may deliberately replace the original diagnostic;
  // historical mappings do not require its old destination to remain current.
  for (const bad of [null, {}, { ...archive.historicalReferenceRepairs, sourceCommit: 'main' },
    { ...archive.historicalReferenceRepairs, entries: [null] }, { ...archive.historicalReferenceRepairs, entries: [{ privateNote: true }] }]) {
    assert.ok(checkResearchArchiveReferences({ ...archive, historicalReferenceRepairs: bad }, { topics: f.topics, research: f.collection }).length);
  }
  const active = { ...archive, activeReferenceRepairs: [{ researchTopicId: f.record.topicId, path: '.assess.errorPatterns[0].reteachPrerequisiteId', from: 'mt_old', to: f.record.topicId }] };
  assert.ok(checkResearchArchiveReferences(active, { topics: f.topics, research: f.collection }).length);
});
