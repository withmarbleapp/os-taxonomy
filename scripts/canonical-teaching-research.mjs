import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { checkSchema } from './check-schema.mjs';
import { checkTeachingResearch, methodByType } from './check-teaching-research.mjs';

const schemaBytes = readFileSync(new URL('../schema/canonical-teaching-research-v2.schema.json', import.meta.url));
const schema = JSON.parse(schemaBytes);
const legacySchema = JSON.parse(readFileSync(new URL('../schema/teaching-research.schema.json', import.meta.url)));
const sha256 = value => createHash('sha256').update(value).digest('hex');
export const canonicalResearchSchemaSha256 = sha256(schemaBytes);
export const canonicalResearchDigestContract = 'authored-research-json-v1';

/** UTF-16 object-key ordering, JSON finite-number encoding, exact strings and
 * array order. No Unicode/whitespace normalization or omitted authored fields. */
export function canonicalResearchJson(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + Array.from(value, canonicalResearchJson).join(',') + ']';
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonicalResearchJson(value[key])).join(',') + '}';
  }
  throw Error('Authored digest accepts JSON values only');
}

function inventory(topics) {
  if (!topics || typeof topics.version !== 'string' || !Array.isArray(topics.topics) ||
      !topics.topics.every(row => row && typeof row.id === 'string' && Object.hasOwn(methodByType, row.type))) throw Error('Complete typed topic inventory required');
  const byId = new Map(topics.topics.map(row => [row.id, row]));
  if (byId.size !== topics.topics.length) throw Error('Duplicate topic identity');
  return byId;
}

export function checkCanonicalResearch(record, { topics }) {
  const errors = checkSchema(record, schema);
  if (errors.length) return errors;
  const byId = inventory(topics);
  if (record.namespace !== topics.version) errors.push('Research namespace differs from topic inventory');
  const topic = byId.get(record.topicId);
  if (!topic) errors.push('Unknown research topic');
  const identities = new Set();
  function add(id) { if (identities.has(id)) errors.push('Duplicate structured item identity'); identities.add(id); }
  const citations = new Set(record.sources.map(source => source.id));
  record.sources.forEach(source => add(source.id));
  for (const activity of record.learn.activities) {
    add(activity.id);
    if (new Set(activity.sourceIds).size !== activity.sourceIds.length) errors.push('Duplicate activity citation reference');
    if (activity.sourceIds.some(id => !citations.has(id))) errors.push('Unresolved activity citation reference');
  }
  if (record.assess) {
    if (topic && record.assess.method !== methodByType[topic.type]) errors.push('Assessment method differs from topic type');
    for (const diagnostic of record.assess.errorPatterns) {
      add(diagnostic.id);
      if (diagnostic.reteachPrerequisiteId !== null && !byId.has(diagnostic.reteachPrerequisiteId)) errors.push('Unresolved assessment prerequisite');
    }
  }
  const internal = /\b(?:artefactFit|catalogGap|interactive_image|2d_interactive|3d_interactive|draw-path|mcq|fill-blank)\b/i;
  if (internal.test(JSON.stringify(record.learn))) errors.push('Internal artifact vocabulary in learning guidance');
  function checkText(value) {
    if (typeof value === 'string') {
      // Inspect percent-encoded ASCII even beside literal '%' or invalid UTF-8.
      // This never alters authored prose or its digest; the known marker is ASCII.
      const decoded = value.replace(/%([0-9a-f]{2})/gi, (_match, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
      if (/\[curriculum wording omitted;/i.test(decoded)) errors.push('Source omission placeholder requires reviewed original wording');
    } else if (Array.isArray(value)) value.forEach(checkText);
    else if (value && typeof value === 'object') Object.values(value).forEach(checkText);
  }
  checkText(record);
  return [...new Set(errors)];
}

export function canonicalResearchDigest(record, context) {
  const errors = checkCanonicalResearch(record, context);
  if (errors.length) throw Error(errors.join('; '));
  return sha256(canonicalResearchJson(record));
}

const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).sort().join(',') === [...keys].sort().join(',');
const items = row => ({ activityIds: row.learn.activities.length, diagnosticIds: row.assess?.errorPatterns.length ?? 0, citationIds: row.sources.length });
const prefixes = { activityIds: 'activity', diagnosticIds: 'diagnostic', citationIds: 'citation' };

/** Candidate IDs are bootstrapped once, then reviewed/stored. Their map is bound
 * to exact legacy bytes, so later legacy edits/reordering cannot silently rebind. */
function makeMap(research, sourceSha256) {
  return { schemaVersion: 1, kind: 'canonical-research-id-map-v1', legacyResearchSha256: sourceSha256,
    entries: research.records.map(row => ({ topicId: row.topicId, ...Object.fromEntries(Object.entries(items(row)).map(([key, count]) =>
      [key, Array.from({ length: count }, (_, index) => prefixes[key] + '_' + sha256(JSON.stringify([sourceSha256, row.topicId, key, index])).slice(0, 24))])) })) };
}

function validateMap(map, research, sourceSha256) {
  if (!exactKeys(map, ['schemaVersion', 'kind', 'legacyResearchSha256', 'entries']) || map.schemaVersion !== 1 ||
      map.kind !== 'canonical-research-id-map-v1' || map.legacyResearchSha256 !== sourceSha256 || !Array.isArray(map.entries) ||
      map.entries.length !== research.records.length) throw Error('Complete ID map bound to exact legacy bytes required');
  const records = new Map(research.records.map(row => [row.topicId, row])), seenTopics = new Set(), seenIds = new Set();
  for (const entry of map.entries) {
    if (!exactKeys(entry, ['topicId', ...Object.keys(prefixes)]) || !records.has(entry.topicId) || seenTopics.has(entry.topicId)) throw Error('Invalid ID map topic inventory');
    seenTopics.add(entry.topicId);
    for (const [key, count] of Object.entries(items(records.get(entry.topicId)))) {
      if (!Array.isArray(entry[key]) || entry[key].length !== count) throw Error('Incomplete ID map item inventory');
      for (const id of entry[key]) {
        if (typeof id !== 'string' || !new RegExp('^' + prefixes[key] + '_[A-Za-z0-9_-]{8,64}$').test(id) || seenIds.has(id)) throw Error('Invalid or duplicate mapped item identity');
        seenIds.add(id);
      }
    }
  }
}

export function previewCanonicalResearch({ research, researchBytes, topics, topicsBytes, manifest, migrationMap }) {
  if (!Buffer.isBuffer(researchBytes) || !isDeepStrictEqual(JSON.parse(researchBytes), research)) throw Error('Exact legacy research bytes required');
  if (!Buffer.isBuffer(topicsBytes) || !isDeepStrictEqual(JSON.parse(topicsBytes), topics)) throw Error('Exact legacy topic bytes required');
  const errors = checkTeachingResearch(research, { topics, topicsBytes, manifest, schema: legacySchema });
  if (errors.length) throw Error('Legacy research validation failed: ' + errors.slice(0, 5).join('; '));
  if (manifest.files?.['teaching-research.json']?.sha256 !== sha256(researchBytes) ||
      manifest.files?.['teaching-research.json']?.bytes !== researchBytes.length) throw Error('Legacy research manifest binding differs');
  inventory(topics);
  const sourceSha256 = sha256(researchBytes), map = structuredClone(migrationMap ?? makeMap(research, sourceSha256));
  validateMap(map, research, sourceSha256);
  const entries = new Map(map.entries.map(entry => [entry.topicId, entry]));
  const candidates = research.records.map(row => {
    const ids = entries.get(row.topicId), problems = [];
    const sources = row.sources.map((source, index) => ({ ...structuredClone(source), id: ids.citationIds[index] }));
    const learn = structuredClone(row.learn);
    learn.activities = learn.activities.map((activity, index) => {
      const { sourceClaims, ...content } = activity;
      const sourceIds = [];
      for (const claim of sourceClaims) {
        const matches = sources.filter(source => source.claim === claim);
        if (matches.length !== 1) problems.push('Legacy activity citation is ambiguous; review its exact source mapping');
        else sourceIds.push(matches[0].id);
      }
      return { ...content, id: ids.activityIds[index], sourceIds };
    });
    const assess = structuredClone(row.assess);
    if (assess) assess.errorPatterns = assess.errorPatterns.map((pattern, index) => ({ ...pattern, id: ids.diagnosticIds[index] }));
    const record = { schemaVersion: 2, namespace: research.version, topicId: row.topicId, pedagogy: structuredClone(row.pedagogy),
      learn, assess, sources, confidence: row.confidence, authorship: { attribution: row.provenance.originalResearchGeneratedBy } };
    problems.push(...checkCanonicalResearch(record, { topics }));
    return { topicId: row.topicId, record, reviewRequired: [...new Set(problems)],
      authoredSha256: problems.length ? null : canonicalResearchDigest(record, { topics }) };
  });
  return { schemaVersion: 1, kind: 'canonical-research-normalization-preview-v1', readyToPublish: false,
    digestContract: canonicalResearchDigestContract, canonicalSchemaSha256: canonicalResearchSchemaSha256,
    legacyResearchSha256: sourceSha256, candidates: candidates.length,
    structurallyEligible: candidates.filter(row => row.reviewRequired.length === 0).length,
    blockedForContentReview: candidates.filter(row => row.reviewRequired.length !== 0).length,
    migrationMap: map, records: candidates,
    legacyMetadata: research.records.map(row => ({ topicId: row.topicId, provenance: structuredClone(row.provenance), publicationNotes: structuredClone(row.publicationNotes) })),
    remainingGates: ['Review and persist stable item IDs and source mappings', 'Reconcile all private teaching/support dispositions',
      'Resolve source placeholders with reviewed original prose', 'Implement and qualify exact downstream runtime readback'] };
}

export function summarizeCanonicalResearchPreview(preview) {
  const reviewReasons = {};
  for (const row of preview.records) for (const problem of row.reviewRequired) reviewReasons[problem] = (reviewReasons[problem] ?? 0) + 1;
  return { schemaVersion: 1, kind: 'canonical-research-normalization-summary-v1', readyToPublish: false,
    digestContract: preview.digestContract, canonicalSchemaSha256: preview.canonicalSchemaSha256,
    legacyResearchSha256: preview.legacyResearchSha256, candidates: preview.candidates,
    structurallyEligible: preview.structurallyEligible, blockedForContentReview: preview.blockedForContentReview,
    migrationMapSha256: sha256(canonicalResearchJson(preview.migrationMap)), reviewReasons, remainingGates: preview.remainingGates };
}
