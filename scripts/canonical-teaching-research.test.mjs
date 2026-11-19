import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { canonicalResearchJson, canonicalResearchDigest, checkCanonicalResearch, previewCanonicalResearch, summarizeCanonicalResearchPreview } from './canonical-teaching-research.mjs';

const load = name => JSON.parse(readFileSync(new URL(name, import.meta.url)));
const legacyFixture = load('./fixtures/legacy-research-v1.json');
const published = legacyFixture.research, topicFile = legacyFixture.topics;
const hash = value => createHash('sha256').update(value).digest('hex');
function seal(input) {
  input.researchBytes = Buffer.from(JSON.stringify(input.research));
  input.manifest.files['teaching-research.json'] = { sha256: hash(input.researchBytes), bytes: input.researchBytes.length };
  return input;
}
function fixture() {
  const row = structuredClone(published.records.find(row => row.assess && row.assess.errorPatterns.length >= 2 && row.learn.activities.length >= 2 &&
    row.sources.length >= 2 && new Set(row.sources.map(source => source.claim)).size === row.sources.length && !JSON.stringify(row).includes('[curriculum wording omitted;')));
  assert.ok(row, 'A representative public legacy record exists');
  row.assess.errorPatterns.forEach(pattern => { pattern.reteachPrerequisiteId = null; });
  row.learn.activities[0].sourceClaims = [row.sources[0].claim];
  row.learn.activities[1].sourceClaims = [row.sources[1].claim];
  const topic = structuredClone(topicFile.topics.find(topic => topic.id === row.topicId));
  const topics = { version: published.version, topics: [topic] }, topicsBytes = Buffer.from(JSON.stringify(topics));
  const coverage = { topicCount: 1, withResearch: 1, withoutResearch: 0, missingTopicIds: [], bySubject: { [topic.subject]: { topics: 1, withResearch: 1, withoutResearch: 0 } } };
  const research = { ...structuredClone(published), records: [row], recordCount: 1, topicFileSha256: hash(topicsBytes), coverage };
  return seal({ research, topics, topicsBytes, manifest: { taxonomyVersion: research.version, counts: { teachingResearch: 1 }, files: {},
    teachingResearch: { schemaVersion: research.schemaVersion, exportedAt: research.exportedAt, topicFileSha256: research.topicFileSha256, coverage } } });
}
const normalized = input => previewCanonicalResearch(input).records[0].record;

test('normalization preserves teaching text and authorship while separating operational metadata', () => {
  const input = fixture(), before = { ...structuredClone(input), researchBytes: Buffer.from(input.researchBytes), topicsBytes: Buffer.from(input.topicsBytes) };
  const preview = previewCanonicalResearch(input), row = preview.records[0].record;
  assert.equal(preview.readyToPublish, false); assert.equal(preview.structurallyEligible, 1);
  assert.deepEqual(input, before);
  assert.deepEqual(row.pedagogy, input.research.records[0].pedagogy);
  assert.deepEqual(row.authorship, { attribution: input.research.records[0].provenance.originalResearchGeneratedBy });
  assert.deepEqual(preview.legacyMetadata[0].provenance, input.research.records[0].provenance);
  assert.equal(Object.hasOwn(row, 'provenance'), false); assert.equal(Object.hasOwn(row, 'publicationNotes'), false);
  assert.equal(row.learn.activities[0].sourceIds[0], row.sources[0].id);
  assert.equal(Object.hasOwn(row.learn.activities[0], 'sourceClaims'), false);
  assert.equal(preview.records[0].authoredSha256, canonicalResearchDigest(row, input));
  const sourceById = new Map(row.sources.map(source => [source.id, source]));
  const restored = { pedagogy: row.pedagogy, confidence: row.confidence,
    sources: row.sources.map(({ id, ...source }) => source),
    learn: { ...row.learn, activities: row.learn.activities.map(({ id, sourceIds, ...activity }) =>
      ({ ...activity, sourceClaims: sourceIds.map(id => sourceById.get(id).claim) })) },
    assess: { ...row.assess, errorPatterns: row.assess.errorPatterns.map(({ id, ...diagnostic }) => diagnostic) } };
  for (const [field, value] of Object.entries(restored)) assert.deepEqual(value, input.research.records[0][field], field);
});
test('identical preview and saved ID map reproduce exact IDs; reviewed IDs are retained', () => {
  const input = fixture(), first = previewCanonicalResearch(input);
  assert.deepEqual(previewCanonicalResearch(input), first);
  assert.deepEqual(previewCanonicalResearch({ ...input, migrationMap: first.migrationMap }), first);
  const map = structuredClone(first.migrationMap); map.entries[0].citationIds[0] = 'citation_reviewed_identity';
  const next = previewCanonicalResearch({ ...input, migrationMap: map });
  assert.equal(next.records[0].record.sources[0].id, 'citation_reviewed_identity');
  assert.equal(next.records[0].record.learn.activities[0].sourceIds[0], 'citation_reviewed_identity');
});
test('stale, incomplete, duplicate and extra ID mappings fail before normalization', () => {
  const input = fixture(), map = previewCanonicalResearch(input).migrationMap;
  for (const mutate of [m => {m.legacyResearchSha256 = '0'.repeat(64)}, m => m.entries.pop(), m => m.entries[0].activityIds.pop(),
    m => {m.entries[0].citationIds[1] = m.entries[0].citationIds[0]}, m => {m.unexpected = true}, m => {m.entries[0].topicId = 'mt_missing'}]) {
    const copy = structuredClone(map); mutate(copy); assert.throws(() => previewCanonicalResearch({ ...input, migrationMap: copy }));
  }
  input.research.records[0].learn.activities.reverse(); seal(input);
  assert.throws(() => previewCanonicalResearch({ ...input, migrationMap: map }), /exact legacy bytes/);
});
test('schema and semantic checks reject unsupported fields, references, identities and versions', () => {
  const input = fixture(), row = normalized(input);
  for (const mutate of [r => {r.schemaVersion = 3}, r => {r.privateNotes = 'not authored'}, r => {r.learn.activities[0].privateNote = 'not authored'},
    r => {r.namespace = 'other'}, r => {r.topicId = 'mt_missing'}, r => {r.learn.activities[0].sourceIds = ['citation_missing_reference']},
    r => {r.sources[1].id = r.sources[0].id}, r => {r.assess.errorPatterns[1].id = r.assess.errorPatterns[0].id},
    r => {r.assess.errorPatterns[0].reteachPrerequisiteId = 'mt_retired'}, r => {r.assess.method = 'wrong'},
    r => {r.learn.activities[0].sourceIds.push(r.learn.activities[0].sourceIds[0])}]) {
    const copy = structuredClone(row); mutate(copy); assert.ok(checkCanonicalResearch(copy, input).length); assert.throws(() => canonicalResearchDigest(copy, input));
  }
});
test('reordering canonical items preserves their IDs and citations while changing the authored digest', () => {
  const input = fixture(), row = normalized(input), reordered = structuredClone(row);
  reordered.sources.reverse(); reordered.learn.activities.reverse(); reordered.assess.errorPatterns.reverse();
  assert.deepEqual(checkCanonicalResearch(reordered, input), []);
  assert.deepEqual(new Set(reordered.sources.map(row => row.id)), new Set(row.sources.map(row => row.id)));
  assert.notEqual(canonicalResearchDigest(reordered, input), canonicalResearchDigest(row, input));
});
test('digest preserves every authored value and array order but ignores object key order', () => {
  const input = fixture(), row = normalized(input), reordered = Object.fromEntries(Object.entries(row).reverse());
  assert.equal(canonicalResearchDigest(reordered, input), canonicalResearchDigest(row, input));
  for (const mutate of [r => {r.pedagogy.summary += ' '}, r => {r.sources[0].verified = !r.sources[0].verified},
    r => {r.authorship.attribution += ' reviewed'}, r => {r.confidence = r.confidence === 'high' ? 'low' : 'high'}]) {
    const copy = structuredClone(row); mutate(copy); assert.notEqual(canonicalResearchDigest(copy, input), canonicalResearchDigest(row, input));
  }
  assert.equal(canonicalResearchJson({ 10: 'ten', 2: 'two' }), '{"10":"ten","2":"two"}');
  assert.notEqual(canonicalResearchJson('é'), canonicalResearchJson('e\u0301'));
  for (const value of [undefined, NaN, Infinity, [undefined], new Date()]) assert.throws(() => canonicalResearchJson(value));
});
test('source omissions remain unchanged and blocked; encoded markers cannot bypass validation', () => {
  const input = fixture(), marker = '[curriculum wording omitted; reference TEST-01]';
  input.research.records[0].pedagogy.summary += marker; seal(input);
  const preview = previewCanonicalResearch(input);
  assert.equal(preview.records[0].record.pedagogy.summary, input.research.records[0].pedagogy.summary);
  assert.equal(preview.blockedForContentReview, 1); assert.equal(preview.records[0].authoredSha256, null); assert.equal(preview.readyToPublish, false);
  const copy = normalized(fixture()); copy.sources[0].url = 'https://example.org/' + encodeURIComponent(marker);
  assert.ok(checkCanonicalResearch(copy, input).some(error => /placeholder/.test(error)));
  for (const prefix of ['50% chance: ', '%broken ', '%FF']) {
    const mixed = normalized(fixture()); mixed.learn.summary += prefix + encodeURIComponent(marker);
    assert.ok(checkCanonicalResearch(mixed, input).some(error => /placeholder/.test(error)), prefix);
    assert.throws(() => canonicalResearchDigest(mixed, input), /placeholder/);
  }
  const percentages = normalized(fixture()); percentages.learn.summary += ' 50% chance, %broken, %FF';
  assert.deepEqual(checkCanonicalResearch(percentages, input), []);
});
test('ambiguous legacy source claims require review instead of guessing a citation identity', () => {
  const input = fixture(), row = input.research.records[0], oldClaim = row.sources[1].claim;
  row.sources[1].claim = row.sources[0].claim;
  for (const activity of row.learn.activities) activity.sourceClaims = activity.sourceClaims.map(claim => claim === oldClaim ? row.sources[0].claim : claim);
  seal(input);
  const preview = previewCanonicalResearch(input);
  assert.equal(preview.blockedForContentReview, 1); assert.equal(preview.records[0].authoredSha256, null);
  assert.ok(preview.records[0].reviewRequired.some(error => /ambiguous/.test(error)));
});
test('legacy byte/object drift, checksum drift and unknown nested fields cannot be projected away', () => {
  const input = fixture();
  assert.throws(() => previewCanonicalResearch({ ...input, researchBytes: Buffer.from('{}') }), /Exact legacy/);
  const changedTopics = structuredClone(input.topics); changedTopics.topics[0].description += ' Changed meaning.';
  assert.throws(() => previewCanonicalResearch({ ...input, topics: changedTopics }), /Exact legacy topic bytes/);
  assert.throws(() => previewCanonicalResearch({ ...input, topicsBytes: Buffer.from('{}') }), /Exact legacy topic bytes/);
  input.manifest.files['teaching-research.json'].sha256 = '0'.repeat(64);
  assert.throws(() => previewCanonicalResearch(input), /manifest binding/);
  seal(input); input.research.records[0].learn.activities[0].hidden = true; seal(input);
  assert.throws(() => previewCanonicalResearch(input), /Legacy research validation/);
});
test('offline CLI preview, summary and authored check make no input writes and fail closed', () => {
  const dir = mkdtempSync(join(tmpdir(), 'canonical-research-'));
  try {
    const input = fixture(), paths = {};
    for (const [key, value] of Object.entries({ research: input.research, topics: input.topics, manifest: input.manifest, record: normalized(input) })) {
      paths[key] = join(dir, key + '.json'); writeFileSync(paths[key], JSON.stringify(value));
    }
    const before = Object.fromEntries(Object.entries(paths).map(([key, path]) => [key, readFileSync(path)]));
    const run = args => spawnSync(process.execPath, [new URL('./research-canonical.mjs', import.meta.url).pathname, ...args], { encoding: 'utf8' });
    const inputs = ['--research', paths.research, '--topics', paths.topics, '--manifest', paths.manifest];
    const preview = run(['preview', ...inputs]); assert.equal(preview.status, 0, preview.stderr);
    assert.equal(JSON.parse(preview.stdout).readyToPublish, false);
    const summary = run(['summary', ...inputs]); assert.equal(summary.status, 0, summary.stderr);
    assert.deepEqual(JSON.parse(summary.stdout), summarizeCanonicalResearchPreview(JSON.parse(preview.stdout)));
    const checked = run(['check', '--record', paths.record, '--topics', paths.topics]); assert.equal(checked.status, 0, checked.stderr);
    assert.equal(JSON.parse(checked.stdout).authoredSha256, canonicalResearchDigest(normalized(input), input));
    assert.notEqual(run(['check', '--record', paths.record, '--research', paths.research]).status, 0);
    assert.notEqual(run(['apply', ...inputs]).status, 0);
    for (const [key, path] of Object.entries(paths)) assert.deepEqual(readFileSync(path), before[key]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
