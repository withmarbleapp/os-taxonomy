// Re-runnable baseline capture. Reads topics, dependencies and research from the
// base commit (default: merge-base of HEAD and origin/main) so a rebase can refresh
// the frozen baseline honestly. Usage: node capture-scope.mjs [baseCommit]
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { canonicalResearchDigest } from '../../scripts/canonical-teaching-research.mjs';

const root = new URL('../../', import.meta.url);
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 1 << 30 });
const base = (process.argv[2] || git('merge-base', 'HEAD', 'origin/main').toString()).trim();
const baseCommit = git('rev-parse', base).toString().trim();
const atBase = path => git('show', `${baseCommit}:${path}`);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const SUBJECT = 'Personal & Social Development';
// No exclusions: every uncovered topic in the subject is in scope. The mechanism is kept
// so a future capture can document a deliberate exclusion with its reason.
const EXCLUDED = {};

const topicsBytes = atBase('data/topics.json'), dependenciesBytes = atBase('data/dependencies.json'), researchBytes = atBase('data/teaching-research.json');
const topics = JSON.parse(topicsBytes), dependencies = JSON.parse(dependenciesBytes).dependencies, research = JSON.parse(researchBytes);
const byId = new Map(topics.topics.map(t => [t.id, t]));
const covered = new Set(research.records.map(r => r.topicId));
const inSubject = topics.topics.filter(t => t.subject === SUBJECT && !covered.has(t.id));
const scope = inSubject.filter(t => !EXCLUDED[t.id]).map(topic => ({
  topic,
  prerequisites: dependencies.filter(d => d.topicId === topic.id).map(d => ({ ...d, name: byId.get(d.prerequisiteId)?.name })),
  dependents: dependencies.filter(d => d.prerequisiteId === topic.id).map(d => ({ ...d, name: byId.get(d.topicId)?.name })),
}));
const excluded = inSubject.filter(t => EXCLUDED[t.id]).map(t => ({ topicId: t.id, name: t.name, domain: t.domain, reason: EXCLUDED[t.id] }));
const snapshot = {
  baseCommit, capturedAt: new Date().toISOString(), subject: SUBJECT,
  topicFileSha256: sha(topicsBytes), dependencyFileSha256: sha(dependenciesBytes), researchFileSha256: sha(researchBytes),
  baselineCoverage: research.coverage,
  baselineRecordDigests: Object.fromEntries(research.records.map(r => [r.topicId, canonicalResearchDigest(r, { topics })])),
  subjectBaseline: { topics: topics.topics.filter(t => t.subject === SUBJECT).length, withResearch: topics.topics.filter(t => t.subject === SUBJECT && covered.has(t.id)).length, uncovered: inSubject.length },
  excluded, scope,
};
fs.writeFileSync(new URL('reports/psd-gapfill-2026-11-18/scope.json', root), JSON.stringify(snapshot, null, 2) + '\n');
console.log(JSON.stringify({ baseCommit, inScope: scope.length, excluded: excluded.length, baseline: research.records.length, subjectBaseline: snapshot.subjectBaseline }));
