import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkCanonicalResearch, canonicalResearchDigest } from '../../scripts/canonical-teaching-research.mjs';

const root = new URL('../../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const json = path => JSON.parse(read(path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const report = 'reports/psd-gapfill-2026-11-18/';
const ATTRIBUTION = 'Claude; Personal & Social Development teaching-research gap fill, 18 November 2026. No independent review or empirical activity validation claimed.';

export function validateGapfill({ snapshot, topics, topicsBytes, dependenciesBytes, collection }) {
  const errors = [], overlap = [], identities = new Set();
  const assert = (condition, message) => { if (!condition) errors.push(message); };
  const byId = new Map(collection.records.map(row => [row.topicId, row]));
  const expected = new Set(snapshot.scope.map(row => row.topic.id));
  const excluded = new Set((snapshot.excluded || []).map(row => row.topicId));
  const baseline = new Set(Object.keys(snapshot.baselineRecordDigests));
  assert(sha(topicsBytes) === snapshot.topicFileSha256, 'Topic inventory changed since scope capture');
  assert(sha(dependenciesBytes) === snapshot.dependencyFileSha256, 'Dependencies changed since scope capture');
  // Counts come from the frozen capture rather than constants, so a rebase re-capture stays honest.
  assert(expected.size > 0 && expected.size + excluded.size === snapshot.subjectBaseline.uncovered, 'Frozen scope does not account for every uncovered subject topic');
  assert(baseline.size === snapshot.baselineCoverage.withResearch, 'Frozen baseline size differs from its coverage');
  assert(byId.size === collection.records.length, 'Duplicate topic record');
  assert(collection.records.length === baseline.size + expected.size, 'Unexpected final record count');
  for (const [id, digest] of Object.entries(snapshot.baselineRecordDigests)) {
    const row = byId.get(id);
    assert(!!row, `Missing baseline record ${id}`);
    if (row) assert(canonicalResearchDigest(row, { topics }) === digest, `Existing authored research changed: ${id}`);
  }
  for (const row of collection.records) assert(baseline.has(row.topicId) || expected.has(row.topicId), `Out-of-scope addition ${row.topicId}`);
  for (const id of excluded) assert(!byId.has(id), `Excluded topic received a record: ${id}`);
  const methods = { CONCEPTUAL: 'two_tier', PROCEDURAL: 'performance_task', REPRESENTATIONAL: 'interpret_translate', META: 'open_epistemic_probe', LANGUAGE: 'use_in_context' };
  const words = value => value.toLowerCase().match(/[a-z0-9]+/g) || [];
  for (const { topic, prerequisites } of snapshot.scope) {
    assert(!baseline.has(topic.id), `Already covered at baseline: ${topic.id}`);
    const row = byId.get(topic.id);
    assert(!!row, `Missing new research ${topic.id}`);
    if (!row) continue;
    errors.push(...checkCanonicalResearch(row, { topics }).map(error => `${topic.id}: ${error}`));
    assert(row.sources.some(source => source.verified && source.url), `${topic.id}: no checked linked source`);
    assert(row.assess.method === methods[topic.type], `${topic.id}: assessment method does not match topic type`);
    assert(row.confidence !== 'high', `${topic.id}: high confidence claimed`);
    assert(row.authorship.attribution === ATTRIBUTION, `${topic.id}: attribution differs`);
    assert(row.learn.activities.length >= 3, `${topic.id}: insufficient exercise progression`);
    assert(row.learn.activities.every(a => a.sourceIds.length > 0), `${topic.id}: activity without citation`);
    assert(row.learn.constraints.some(value => /Exercise design:/i.test(value)), `${topic.id}: no generation guidance`);
    assert(row.learn.constraints.some(value => /^Safeguarding:.*never require a child to disclose/i.test(value)), `${topic.id}: no safeguarding/no-disclosure constraint`);
    assert(row.learn.reviewNotes.some(value => /not.*independently reviewed|no (?:learner trial[^.]*)?independent|not.*independent.*review/i.test(value)), `${topic.id}: missing review limitation`);
    for (const item of [...row.sources, ...row.learn.activities, ...row.assess.errorPatterns]) {
      assert(!identities.has(item.id), `${topic.id}: repeated structured identity ${item.id}`);
      identities.add(item.id);
    }
    for (const error of row.assess.errorPatterns) {
      if (error.reteachPrerequisiteId) assert(prerequisites.some(p => p.prerequisiteId === error.reteachPrerequisiteId), `${topic.id}: recovery is not an actual prerequisite`);
      if (row.assess.method === 'performance_task' || error.kind === 'performance' || error.kind === 'developmental') assert(error.distractor === null, `${topic.id}: performance/developmental distractor`);
      assert(error.nextMove.length > 30 && error.revealedBy.length > 30, `${topic.id}: incomplete diagnostic feedback`);
      // A diagnostic names its own basis: one of this record's cited sources, or the topic itself.
      const basis = error.revealedBy.match(/Evidence basis: (.*?) This is an authored observable/)?.[1];
      assert(basis === "the topic's own stated mastery evidence; no cited source documents this specific pattern." || row.sources.some(source => source.source === basis), `${topic.id}: diagnostic evidence basis is not one of the record's sources`);
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
  const missing = topics.topics.filter(topic => topic.subject === snapshot.subject && !byId.has(topic.id) && !excluded.has(topic.id));
  assert(missing.length === 0, `${snapshot.subject}: ${missing.length} uncovered topics outside the documented exclusion`);
  return { valid: errors.length === 0 && overlap.length === 0, errors, overlap,
    added: expected.size, preserved: baseline.size,
    excluded: [...excluded],
    subjectCoverage: `${topics.topics.filter(t => t.subject === snapshot.subject && byId.has(t.id)).length} / ${topics.topics.filter(t => t.subject === snapshot.subject).length}`,
    confidence: snapshot.scope.reduce((counts, { topic }) => {
      const confidence = byId.get(topic.id)?.confidence || 'missing';
      counts[confidence] = (counts[confidence] || 0) + 1;
      return counts;
    }, {}),
    limitation: 'Structural and overlap checks do not establish source entailment, semantic independence, safeguarding adequacy, calibrated difficulty or teaching effectiveness. No independent content or safeguarding review claimed.' };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateGapfill({ snapshot: json(report + 'scope.json'), topics: json('data/topics.json'), topicsBytes: read('data/topics.json'), dependenciesBytes: read('data/dependencies.json'), collection: json('data/teaching-research.json') });
  if (process.argv.includes('--write')) fs.writeFileSync(new URL(report + 'validation.json', root), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
}
