import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const records = JSON.parse(readFileSync(new URL('../data/teaching-research.json', import.meta.url))).records;
const guide = records.find(r => r.topicId === 'mt_2agkUcdah9');
function safeFeedback(value) {
  const feedback = value.assess.errorPatterns[2].nextMove;
  assert.doesNotMatch(feedback, /hold candidate materials up to the sun/i);
  assert.match(feedback, /cast shadow on the ground/i);
  assert.match(feedback, /never look towards the Sun/);
  assert.match(feedback, /compare actual shaded and unshaded temperature/);
}
test('shade assessment uses ground observation and an actual warming comparison', () => safeFeedback(guide));
test('restoring the overlooked upward-viewing instruction fails', () => {
  const unsafe = structuredClone(guide);
  unsafe.assess.errorPatterns[2].nextMove = "Hold candidate materials up to the sun and pick the one you can't see through; test which casts the darkest shadow.";
  assert.throws(() => safeFeedback(unsafe));
});
