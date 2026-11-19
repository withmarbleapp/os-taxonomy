import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGapfill } from './validate.mjs';

const root = new URL('../../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const fixture = {
  snapshot: JSON.parse(read('reports/life-skills-gapfill-2026-11-18/scope.json')),
  topics: JSON.parse(read('data/topics.json')),
  topicsBytes: read('data/topics.json'),
  dependenciesBytes: read('data/dependencies.json'),
  collection: JSON.parse(read('data/teaching-research.json')),
};
const changed = () => ({ ...fixture, collection: structuredClone(fixture.collection) });
const added = input => input.collection.records.find(r => r.topicId === fixture.snapshot.scope[0].topic.id);

test('complete gap fill preserves baseline and satisfies the scoped checks', () => {
  const result = validateGapfill(fixture);
  assert.equal(result.valid, true, JSON.stringify(result));
  assert.equal(result.added, fixture.snapshot.scope.length);
  assert.equal(result.preserved, Object.keys(fixture.snapshot.baselineRecordDigests).length);
  assert.equal(result.uncovered, 0);
});
test('detects accidental edits to existing research', () => {
  const input = changed();
  input.collection.records[0].pedagogy.summary += ' An unintended edit.';
  assert.ok(validateGapfill(input).errors.some(e => e.includes('Existing authored research changed')));
});
test('detects a missing gap record even when record metadata is stale', () => {
  const input = changed();
  input.collection.records = input.collection.records.filter(r => r !== added(input));
  assert.ok(validateGapfill(input).errors.some(e => e.includes('Missing new research')));
});
test('detects assessment stimuli copied from a teaching activity', () => {
  const input = changed(), row = added(input);
  const text = 'A newly copied stimulus has sufficiently many distinct words to reveal reuse across the two task sections.';
  row.learn.activities[0].learnerActions = [text];
  row.assess.diagnosticPrompt = text;
  assert.ok(validateGapfill(input).overlap.some(e => e.topicId === row.topicId));
});
test('detects invented prerequisite recovery and performance distractors', () => {
  const input = changed(), row = added(input);
  row.assess.errorPatterns[0].reteachPrerequisiteId = 'mt_not_a_prerequisite';
  row.assess.errorPatterns[0].kind = 'performance';
  row.assess.errorPatterns[0].distractor = 'A multiple-choice answer';
  const result = validateGapfill(input);
  assert.ok(result.errors.some(e => e.includes('recovery is not an actual prerequisite')));
  assert.ok(result.errors.some(e => e.includes('performance/developmental distractor')));
});

test('detects an assessment method inconsistent with topic type', () => {
  const input = changed(), row = added(input);
  row.assess.method = row.assess.method === 'two_tier' ? 'open_epistemic_probe' : 'two_tier';
  assert.ok(validateGapfill(input).errors.some(e => e.includes('assessment method does not match topic type')));
});

test('detects a predict-observe-explain task on a non-conceptual topic', () => {
  const input = changed(), row = input.collection.records.find(r => r.topicId === fixture.snapshot.scope.find(s => s.topic.type === 'PROCEDURAL')?.topic.id);
  assert.ok(row, 'fixture needs a PROCEDURAL topic in scope');
  row.assess.poeTask = 'Predict what happens, observe it and explain.';
  assert.ok(validateGapfill(input).errors.some(e => e.includes('POE on non-conceptual topic')));
});
