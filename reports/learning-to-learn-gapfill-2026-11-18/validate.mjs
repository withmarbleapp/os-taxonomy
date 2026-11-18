import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkCanonicalResearch, canonicalResearchDigest } from '../../scripts/canonical-teaching-research.mjs';

const root = new URL('../../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const json = path => JSON.parse(read(path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const report = 'reports/learning-to-learn-gapfill-2026-11-18/';

export function validateGapfill({ snapshot, topics, topicsBytes, dependenciesBytes, collection }) {
  const errors = [], overlap = [], identities = new Set();
  const assert = (condition, message) => { if (!condition) errors.push(message); };
  const byId = new Map(collection.records.map(row => [row.topicId, row]));
  const expected = new Set(snapshot.scope.map(row => row.topic.id));
  const baseline = new Set(Object.keys(snapshot.baselineRecordDigests));
  assert(sha(topicsBytes) === snapshot.topicFileSha256, 'Topic inventory changed since scope capture');
  assert(sha(dependenciesBytes) === snapshot.dependencyFileSha256, 'Dependencies changed since scope capture');
  // Expected counts come from the frozen baseline, not hardcoded literals.
  const subjectBaseline = snapshot.baselineCoverage.bySubject[snapshot.subject];
  assert(expected.size === snapshot.scope.length && expected.size === subjectBaseline.withoutResearch && expected.size > 0, 'Unexpected frozen scope size');
  assert(baseline.size === snapshot.baselineCoverage.withResearch, 'Unexpected frozen baseline size');
  for (const id of snapshot.baselineSubjectRecords) assert(baseline.has(id), `Baseline ${snapshot.subject} record not frozen: ${id}`);
  assert(byId.size === collection.records.length, 'Duplicate topic record');
  assert(collection.records.length === baseline.size + expected.size, 'Unexpected final record count');
  for (const [id, digest] of Object.entries(snapshot.baselineRecordDigests)) {
    const row = byId.get(id);
    assert(!!row, `Missing baseline record ${id}`);
    if (row) assert(canonicalResearchDigest(row, { topics }) === digest, `Existing authored research changed: ${id}`);
  }
  for (const row of collection.records) assert(baseline.has(row.topicId) || expected.has(row.topicId), `Out-of-scope addition ${row.topicId}`);
  const words = value => value.toLowerCase().match(/[a-z0-9]+/g) || [];
  for (const { topic, prerequisites } of snapshot.scope) {
    assert(!baseline.has(topic.id), `Already covered at baseline: ${topic.id}`);
    const row = byId.get(topic.id);
    assert(!!row, `Missing new research ${topic.id}`);
    if (!row) continue;
    errors.push(...checkCanonicalResearch(row, { topics }).map(error => `${topic.id}: ${error}`));
    assert(row.sources.some(source => source.verified && source.url), `${topic.id}: no checked linked source`);
    const methods = { CONCEPTUAL: 'two_tier', PROCEDURAL: 'performance_task', REPRESENTATIONAL: 'interpret_translate', META: 'open_epistemic_probe', LANGUAGE: 'use_in_context' };
    assert(row.assess.method === methods[topic.type], `${topic.id}: assessment method does not match topic type`);
    assert(row.learn.activities.length >= 3, `${topic.id}: insufficient exercise progression`);
    assert(row.learn.constraints.some(value => /Exercise design:/i.test(value)), `${topic.id}: no generation guidance`);
    assert(row.learn.reviewNotes.some(value => /not.*independently reviewed|no (?:learner trial or )?independent|not.*independent.*review/i.test(value)), `${topic.id}: missing review limitation`);
    for (const item of [...row.sources, ...row.learn.activities, ...row.assess.errorPatterns]) {
      assert(!identities.has(item.id), `${topic.id}: repeated structured identity ${item.id}`);
      identities.add(item.id);
    }
    for (const error of row.assess.errorPatterns) {
      if (error.reteachPrerequisiteId) assert(prerequisites.some(p => p.prerequisiteId === error.reteachPrerequisiteId), `${topic.id}: recovery is not an actual prerequisite`);
      if (row.assess.method === 'performance_task' || error.kind === 'performance' || error.kind === 'developmental') assert(error.distractor === null, `${topic.id}: performance/developmental distractor`);
      assert(error.nextMove.length > 30 && error.revealedBy.length > 30, `${topic.id}: incomplete diagnostic feedback`);
    }
    assert(!row.assess.poeTask || topic.type === 'CONCEPTUAL', `${topic.id}: POE on non-conceptual topic`);
    if (topic.type === 'META') assert(/not an answer key/i.test(row.assess.correctAnswer), `${topic.id}: scored META answer`);
    const assessment = words(row.assess.diagnosticPrompt);
    let longest = [];
    // Detect copied stimuli, not correctness or semantic transfer. Keep activity
    // boundaries separate so adjacent exercises cannot create an artificial match.
    for (const activity of row.learn.activities) {
      const teaching = words(activity.learnerActions.join(' '));
      for (let a = 0; a < assessment.length; a++) for (let b = 0; b < teaching.length; b++) {
        let n = 0;
        while (assessment[a + n] !== undefined && assessment[a + n] === teaching[b + n]) n++;
        if (n > longest.length) longest = assessment.slice(a, a + n);
      }
    }
    if (longest.length >= 12) overlap.push({ topicId: topic.id, words: longest.length, sharedText: longest.join(' ') });
  }
  const missing = topics.topics.filter(topic => topic.subject === snapshot.subject && !byId.has(topic.id));
  assert(missing.length === 0, `${snapshot.subject}: ${missing.length} uncovered topics`);
  return { valid: errors.length === 0 && overlap.length === 0, errors, overlap,
    added: expected.size, preserved: baseline.size, uncovered: missing.length,
    confidence: snapshot.scope.reduce((counts, { topic }) => {
      const confidence = byId.get(topic.id)?.confidence || 'missing';
      counts[confidence] = (counts[confidence] || 0) + 1;
      return counts;
    }, {}),
    limitation: 'Structural and overlap checks do not establish source entailment, semantic independence, calibrated difficulty or teaching effectiveness. No independent content review claimed.' };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateGapfill({ snapshot: json(report + 'scope.json'), topics: json('data/topics.json'), topicsBytes: read('data/topics.json'), dependenciesBytes: read('data/dependencies.json'), collection: json('data/teaching-research.json') });
  if (process.argv.includes('--write')) fs.writeFileSync(new URL(report + 'validation.json', root), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
}
