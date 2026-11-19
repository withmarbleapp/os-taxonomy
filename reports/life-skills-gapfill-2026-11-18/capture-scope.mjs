// Re-runnable baseline capture. Reads the three data files at a base ref (default
// origin/main) through git, so a rebase can refresh scope.json honestly even
// after this subject's records have been appended to the working tree.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { canonicalResearchDigest } from '../../scripts/canonical-teaching-research.mjs';

export const SUBJECT = 'Life Skills';
const REPORT = 'reports/life-skills-gapfill-2026-11-18/';
const root = new URL('../../', import.meta.url);
const ref = process.argv[2] || 'origin/main';
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 1 << 28 });
const at = path => git(['show', `${ref}:${path}`]);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

const baseCommit = git(['rev-parse', ref]).toString().trim();
const topicsBytes = at('data/topics.json'), dependenciesBytes = at('data/dependencies.json'), researchBytes = at('data/teaching-research.json');
const topics = JSON.parse(topicsBytes), dependencies = JSON.parse(dependenciesBytes).dependencies, research = JSON.parse(researchBytes);
const byId = new Map(topics.topics.map(topic => [topic.id, topic]));
const covered = new Set(research.records.map(row => row.topicId));
const edge = (row, other) => ({ ...row, name: byId.get(other)?.name ?? null });
const scope = topics.topics.filter(topic => topic.subject === SUBJECT && !covered.has(topic.id)).map(topic => ({
  topic,
  prerequisites: dependencies.filter(row => row.topicId === topic.id).map(row => edge(row, row.prerequisiteId)),
  dependents: dependencies.filter(row => row.prerequisiteId === topic.id).map(row => edge(row, row.topicId)),
}));
const snapshot = {
  baseCommit, capturedAt: new Date().toISOString(), subject: SUBJECT,
  topicFileSha256: sha(topicsBytes), dependencyFileSha256: sha(dependenciesBytes), researchFileSha256: sha(researchBytes),
  baselineCoverage: research.coverage,
  baselineSubjectRecords: research.records.filter(row => byId.get(row.topicId)?.subject === SUBJECT).map(row => row.topicId),
  baselineRecordDigests: Object.fromEntries(research.records.map(row => [row.topicId, canonicalResearchDigest(row, { topics })])),
  scope,
};
fs.writeFileSync(new URL(REPORT + 'scope.json', root), JSON.stringify(snapshot, null, 2) + '\n');
console.log(`Captured ${scope.length} ${SUBJECT} gaps and ${Object.keys(snapshot.baselineRecordDigests).length} baseline records at ${baseCommit}.`);
