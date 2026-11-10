import { createHash } from 'node:crypto';
import { checkSchema } from './check-schema.mjs';
const methodByType = { CONCEPTUAL: 'two_tier', PROCEDURAL: 'performance_task', REPRESENTATIONAL: 'interpret_translate', LANGUAGE: 'use_in_context', META: 'open_epistemic_probe' };

/** Active export repairs must describe the current published assessment.
 * Historical array indexes cannot survive an unrelated assessment rewrite. */
export function checkResearchArchiveReferences(archive, { topics, research }) {
  const errors = [];
  if (!archive || archive.schemaVersion !== 1 || archive.version !== topics.version ||
      !Array.isArray(archive.records) || !Array.isArray(archive.activeReferenceRepairs)) {
    return ['invalid research archive reference inventory'];
  }
  const activeTopics = new Set(topics.topics.map(row => row.id));
  const activeResearch = new Map(research.records.map(row => [row.topicId, row]));
  const seen = new Set();
  for (const repair of archive.activeReferenceRepairs) {
    if (!repair || typeof repair !== 'object' || Array.isArray(repair) ||
        Object.keys(repair).sort().join(',') !== 'from,path,researchTopicId,to' ||
        !['from', 'path', 'researchTopicId', 'to'].every(key => typeof repair[key] === 'string' && repair[key].length > 0)) {
      errors.push('invalid active research reference repair'); continue;
    }
    const match = /^\.?assess\.errorPatterns\[(0|[1-9][0-9]*)\]\.reteachPrerequisiteId$/.exec(repair.path);
    if (!match) { errors.push(`research ${repair.researchTopicId}: unsupported archive repair path`); continue; }
    const key = JSON.stringify([repair.researchTopicId, match[1]]);
    if (seen.has(key)) errors.push(`research ${repair.researchTopicId}: duplicate active archive repair`);
    seen.add(key);
    if (!activeTopics.has(repair.to) || repair.from === repair.to) errors.push(`research ${repair.researchTopicId}: invalid active archive destination`);
    const patterns = activeResearch.get(repair.researchTopicId)?.assess?.errorPatterns;
    const pattern = Array.isArray(patterns) && patterns[Number(match[1])];
    if (!pattern || pattern.reteachPrerequisiteId !== repair.to) {
      errors.push(`research ${repair.researchTopicId}: stale active archive repair at ${repair.path}`);
    }
  }
  return errors;
}
export function checkTeachingResearch(research, { topics, topicsBytes, manifest, schema }) {
  const errors = checkSchema(research, schema);
  if (errors.length) return errors; // Shape checks precede all nested traversal.
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const topicsById = new Map(topics.topics.map(t => [t.id, t])); const seen = new Set();
  check(research.version === topics.version && research.version === manifest.taxonomyVersion, 'research taxonomy version mismatch');
  check(research.topicFileSha256 === createHash('sha256').update(topicsBytes).digest('hex'), 'research topic-file checksum mismatch; regenerate against these topics');
  check(research.recordCount === research.records.length, 'research recordCount mismatch');
  check(manifest.counts.teachingResearch === research.recordCount, 'manifest teachingResearch count mismatch');
  check(JSON.stringify(manifest.teachingResearch?.coverage) === JSON.stringify(research.coverage), 'manifest research coverage mismatch');
  check(manifest.teachingResearch?.schemaVersion === research.schemaVersion && manifest.teachingResearch?.exportedAt === research.exportedAt && manifest.teachingResearch?.topicFileSha256 === research.topicFileSha256, 'manifest research provenance mismatch');
  const expectedSubjects = {};
  const internal = /\b(?:artefactFit|catalogGap|interactive_image|2d_interactive|3d_interactive|draw-path|mcq|fill-blank)\b/i;
  for (const row of research.records) {
    const topic = topicsById.get(row.topicId);
    check(Boolean(topic), `research unknown topic ${row.topicId}`);
    check(!seen.has(row.topicId), `duplicate research ${row.topicId}`); seen.add(row.topicId);
    check(!internal.test(JSON.stringify(row.learn)), `research ${row.topicId}: internal artifact vocabulary`);
    const claims = new Set(row.sources.map(s => s.claim));
    for (const activity of row.learn.activities) for (const claim of activity.sourceClaims) check(claims.has(claim), `research ${row.topicId}: unknown source claim`);
    if (row.assess) {
      check(!topic || row.assess.method === methodByType[topic.type], `research ${row.topicId}: assessment method/type mismatch`);
      for (const pattern of row.assess.errorPatterns) if (pattern.reteachPrerequisiteId) check(topicsById.has(pattern.reteachPrerequisiteId), `research ${row.topicId}: unknown assessment prerequisite`);
    }
  }
  for (const topic of topics.topics) {
    expectedSubjects[topic.subject] ??= { topics: 0, withResearch: 0, withoutResearch: 0 };
    expectedSubjects[topic.subject].topics++;
    expectedSubjects[topic.subject][seen.has(topic.id) ? 'withResearch' : 'withoutResearch']++;
  }
  check(research.coverage.topicCount === topics.topics.length && research.coverage.withResearch === research.records.length && research.coverage.withoutResearch === topics.topics.length - research.records.length, 'research coverage totals mismatch');
  const expectedMissing = topics.topics.map(t => t.id).filter(id => !seen.has(id)).sort();
  check(JSON.stringify(research.coverage.missingTopicIds) === JSON.stringify(expectedMissing), 'research missing-topic list mismatch');
  check(JSON.stringify(research.coverage.bySubject) === JSON.stringify(expectedSubjects), 'research per-subject coverage mismatch');
  return errors;
}
