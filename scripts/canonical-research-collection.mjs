import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { checkSchema } from './check-schema.mjs';
import { checkCanonicalResearch, canonicalResearchSchemaSha256, canonicalResearchDigestContract } from './canonical-teaching-research.mjs';

const legacy = JSON.parse(readFileSync(new URL('../schema/teaching-research.schema.json', import.meta.url)));
const authored = JSON.parse(readFileSync(new URL('../schema/canonical-teaching-research-v2.schema.json', import.meta.url)));
const topicsSchema = JSON.parse(readFileSync(new URL('../schema/topics.schema.json', import.meta.url)));
// One authored-record schema; collection metadata reuses existing export shapes.
const properties = Object.fromEntries(['version', 'topicFileSha256', 'recordCount', 'coverage', 'notes'].map(key => [key, legacy.properties[key]]));
Object.assign(properties, { schemaVersion: { type: 'integer', const: 2 },
  canonicalSchemaSha256: { type: 'string', const: canonicalResearchSchemaSha256 },
  digestContract: { type: 'string', const: canonicalResearchDigestContract }, records: { type: 'array', items: authored } });
export const canonicalResearchCollectionSchema = { type: 'object', properties, required: Object.keys(properties), additionalProperties: false };
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function contextErrors(topics, topicsBytes) {
  if (!Buffer.isBuffer(topicsBytes) || !isDeepStrictEqual(JSON.parse(topicsBytes), topics)) return ['Exact topic-file bytes required'];
  const errors = checkSchema(topics, topicsSchema);
  if (errors.length) return errors;
  if (!topics.version || topics.topicCount !== topics.topics.length || new Set(topics.topics.map(row => row.id)).size !== topics.topics.length) errors.push('Complete unique topic inventory required');
  return errors;
}
function coverageFor(records, topics) {
  const known = new Set(records.map(row => row.topicId)), subjects = new Map();
  for (const topic of topics.topics) {
    if (!subjects.has(topic.subject)) subjects.set(topic.subject, { topics: 0, withResearch: 0, withoutResearch: 0 });
    const counts = subjects.get(topic.subject); counts.topics++;
    counts[known.has(topic.id) ? 'withResearch' : 'withoutResearch']++;
  }
  return { topicCount: topics.topics.length, withResearch: records.length, withoutResearch: topics.topics.length - records.length,
    bySubject: Object.fromEntries(subjects), missingTopicIds: topics.topics.map(row => row.id).filter(id => !known.has(id)).sort() };
}
export function canonicalResearchManifestMetadata(collection) {
  return { schemaVersion: 2, topicFileSha256: collection.topicFileSha256, canonicalSchemaSha256: collection.canonicalSchemaSha256,
    digestContract: collection.digestContract, coverage: structuredClone(collection.coverage) };
}
export function checkCanonicalResearchCollection(collection, { topics, topicsBytes, manifest }) {
  const errors = checkSchema(collection, canonicalResearchCollectionSchema);
  if (errors.length) return errors;
  errors.push(...contextErrors(topics, topicsBytes));
  if (errors.length) return errors;
  if (collection.version !== topics.version) errors.push('Research collection namespace differs');
  if (collection.topicFileSha256 !== sha256(topicsBytes)) errors.push('Research collection topic-file checksum differs');
  const seen = new Set();
  for (const row of collection.records) {
    if (seen.has(row.topicId)) errors.push('Duplicate canonical research topic');
    seen.add(row.topicId);
    errors.push(...checkCanonicalResearch(row, { topics }).map(error => `${row.topicId}: ${error}`));
  }
  if (collection.recordCount !== collection.records.length) errors.push('Research recordCount mismatch');
  if (!isDeepStrictEqual(collection.coverage, coverageFor(collection.records, topics))) errors.push('Research coverage mismatch or missing-topic list differs');
  if (manifest) {
    if (manifest.taxonomyVersion !== topics.version || manifest.counts?.teachingResearch !== collection.recordCount) errors.push('Manifest research inventory differs');
    if (!isDeepStrictEqual(manifest.teachingResearch, canonicalResearchManifestMetadata(collection))) errors.push('Manifest canonical research metadata differs');
  }
  return errors;
}

/** Explicit deterministic artifact construction. Every authored value and input
 * list order is retained; only coverage and file bindings are derived. */
export function buildCanonicalResearchCollection({ records, topics, topicsBytes, notes = [] }) {
  const errors = contextErrors(topics, topicsBytes);
  if (errors.length) throw Error(errors.join('; '));
  const rows = structuredClone(records);
  const result = { schemaVersion: 2, version: topics.version, topicFileSha256: sha256(topicsBytes),
    canonicalSchemaSha256: canonicalResearchSchemaSha256, digestContract: canonicalResearchDigestContract,
    recordCount: rows.length, coverage: coverageFor(rows, topics), notes: structuredClone(notes), records: rows };
  const problems = checkCanonicalResearchCollection(result, { topics, topicsBytes });
  if (problems.length) throw Error(problems.slice(0, 10).join('; '));
  return result;
}

/** Refresh generated envelope fields only. Unknown fields and unsupported
 * contracts are rejected rather than projected away or silently upgraded. */
export function regenerateCanonicalResearchCollection(input, context) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).some(key => !Object.hasOwn(properties, key)) || input.schemaVersion !== 2 ||
      !Object.hasOwn(input, 'records') || !Object.hasOwn(input, 'notes') ||
      input.version !== context.topics.version || input.canonicalSchemaSha256 !== canonicalResearchSchemaSha256 ||
      input.digestContract !== canonicalResearchDigestContract) throw Error('Unsupported canonical collection contract or unowned field');
  return buildCanonicalResearchCollection({ records: input.records, notes: input.notes, topics: context.topics, topicsBytes: context.topicsBytes });
}
