// Re-runnable baseline capture. Run on a clean checkout of the base commit
// (or with this branch's History additions removed) to freeze the baseline
// honestly: node reports/history-gapfill-2026-11-18/capture-scope.mjs [--base <research.json>]
// With --base <file> --ref <ref>, the file must be byte-identical to data/teaching-research.json at <ref>; baseCommit is that ref's commit.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { canonicalResearchDigest } from '../../scripts/canonical-teaching-research.mjs';

const root = new URL('../../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const SUBJECT = 'History';
const report = 'reports/history-gapfill-2026-11-18/';

const arg = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const cwd = new URL(root).pathname;
const baseFile = arg('--base');
if (baseFile && !process.argv.includes('--ref')) throw Error('--base requires an explicit --ref naming the commit the file came from');
const baseRef = arg('--ref') ?? 'origin/main';
const baseCommit = execFileSync('git', ['rev-parse', '--verify', baseRef + '^{commit}'], { cwd }).toString().trim();
const refBytes = execFileSync('git', ['show', `${baseCommit}:data/teaching-research.json`], { cwd, maxBuffer: 1 << 30 });
const researchBytes = baseFile ? fs.readFileSync(baseFile) : refBytes;
// A file baseline is accepted only if it is byte-identical to the research file at the recorded commit.
if (sha(researchBytes) !== sha(refBytes)) throw Error(`--base file does not match data/teaching-research.json at ${baseCommit}`);
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
