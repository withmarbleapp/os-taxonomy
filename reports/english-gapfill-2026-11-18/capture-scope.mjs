// Re-runnable baseline capture for the English gap fill.
// Usage: node reports/english-gapfill-2026-11-18/capture-scope.mjs [git-ref]
// The baseline is read from git objects at <git-ref> (default: merge-base of
// HEAD and origin/main), never from the working tree, so re-running after the
// English records are appended still captures an honest pre-fill baseline.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { canonicalResearchDigest } from '../../scripts/canonical-teaching-research.mjs';

const root = new URL('../../', import.meta.url);
const report = 'reports/english-gapfill-2026-11-18/';
const SUBJECT = 'English';
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 1 << 30 });
const ref = process.argv[2] || git('merge-base', 'HEAD', 'origin/main').toString().trim();
const baseCommit = git('rev-parse', ref + '^{commit}').toString().trim();
const at = path => git('show', `${baseCommit}:${path}`);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

const topicsBytes = at('data/topics.json'), dependenciesBytes = at('data/dependencies.json'), researchBytes = at('data/teaching-research.json');
const topics = JSON.parse(topicsBytes), dependencies = JSON.parse(dependenciesBytes).dependencies, research = JSON.parse(researchBytes);
const names = new Map(topics.topics.map(topic => [topic.id, topic.name]));
const covered = new Set(research.records.map(row => row.topicId));
const scope = topics.topics.filter(topic => topic.subject === SUBJECT && !covered.has(topic.id)).map(topic => ({
  topic,
  prerequisites: dependencies.filter(edge => edge.topicId === topic.id).map(edge => ({ ...edge, name: names.get(edge.prerequisiteId) })),
  dependents: dependencies.filter(edge => edge.prerequisiteId === topic.id).map(edge => ({ ...edge, name: names.get(edge.topicId) })),
}));
const snapshot = {
  baseCommit,
  capturedAt: new Date().toISOString(),
  subject: SUBJECT,
  topicFileSha256: sha(topicsBytes),
  dependencyFileSha256: sha(dependenciesBytes),
  researchFileSha256: sha(researchBytes),
  baselineCoverage: research.coverage,
  baselineRecordDigests: Object.fromEntries(research.records.map(row => [row.topicId, canonicalResearchDigest(row, { topics })])),
  scope,
};
fs.writeFileSync(new URL(report + 'scope.json', root), JSON.stringify(snapshot, null, 2) + '\n');
console.log(JSON.stringify({ baseCommit, inScope: scope.length, baselineRecords: research.records.length }));
