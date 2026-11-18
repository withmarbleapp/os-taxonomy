// Re-runnable baseline capture. Run on a clean checkout of the base commit
// (or with this branch's History additions removed) to freeze the baseline
// honestly: node reports/history-gapfill-2026-11-18/capture-scope.mjs [--base <research.json>]
// With --base, baseline records come from that file (e.g. `git show origin/main:data/teaching-research.json`).
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { canonicalResearchDigest } from '../../scripts/canonical-teaching-research.mjs';

const root = new URL('../../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const SUBJECT = 'History';
const report = 'reports/history-gapfill-2026-11-18/';

const baseArg = process.argv.indexOf('--base');
const baseRef = process.argv.includes('--ref') ? process.argv[process.argv.indexOf('--ref') + 1] : 'origin/main';
const researchBytes = baseArg > 0 ? fs.readFileSync(process.argv[baseArg + 1])
  : execFileSync('git', ['show', `${baseRef}:data/teaching-research.json`], { cwd: new URL(root).pathname, maxBuffer: 1 << 30 });
const baseCommit = execFileSync('git', ['rev-parse', baseRef], { cwd: new URL(root).pathname }).toString().trim();
const topicsBytes = read('data/topics.json'), dependenciesBytes = read('data/dependencies.json');
const topics = JSON.parse(topicsBytes), deps = JSON.parse(dependenciesBytes).dependencies, research = JSON.parse(researchBytes);
const byId = new Map(topics.topics.map(t => [t.id, t]));
const covered = new Set(research.records.map(r => r.topicId));
const scope = topics.topics.filter(t => t.subject === SUBJECT && !covered.has(t.id)).map(topic => ({
  topic,
  prerequisites: deps.filter(d => d.topicId === topic.id).map(d => ({ ...d, name: byId.get(d.prerequisiteId)?.name ?? null })),
  dependents: deps.filter(d => d.prerequisiteId === topic.id).map(d => ({ ...d, name: byId.get(d.topicId)?.name ?? null })),
}));
const snapshot = {
  subject: SUBJECT,
  baseCommit,
  capturedAt: new Date().toISOString(),
  topicFileSha256: sha(topicsBytes),
  dependencyFileSha256: sha(dependenciesBytes),
  researchFileSha256: sha(researchBytes),
  baselineCoverage: research.coverage,
  baselineRecordDigests: Object.fromEntries(research.records.map(r => [r.topicId, canonicalResearchDigest(r, { topics })])),
  expectedAdded: scope.length,
  expectedPreserved: research.records.length,
  scope,
};
fs.writeFileSync(new URL(report + 'scope.json', root), JSON.stringify(snapshot, null, 2) + '\n');
console.log(JSON.stringify({ baseCommit, inScope: scope.length, preserved: research.records.length }));
