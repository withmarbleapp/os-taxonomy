import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { childAssessmentFor } from '../explorer/src/child-assessments.js';
import { preschoolActivityFor } from '../explorer/src/preschool-activities.js';

const { topics } = JSON.parse(readFileSync(new URL('../data/topics.json', import.meta.url)));

test('every taxonomy topic has at least one playable child mission', () => {
  assert.ok(topics.length > 1000, 'expected the full taxonomy dataset');
  for (const topic of topics) {
    const assessment = childAssessmentFor(topic);
    assert.ok(assessment, topic.name);
    assert.ok(['choice', 'practice-game', 'guided'].includes(assessment.kind), topic.name);
    assert.ok(assessment.tasks.length > 0, topic.name);
    for (const task of assessment.tasks) {
      assert.ok(task.prompt?.en?.trim(), `${topic.name} has an empty mission prompt`);
      for (const index of task.evidenceIndexes ?? [task.evidenceIndex]) {
        assert.ok(Number.isInteger(index) && index >= 0 && index < topic.evidence.length, `${topic.name} maps outside its evidence list`);
      }
    }
    const mappedEvidence = [...new Set(assessment.tasks.flatMap(({ evidenceIndexes, evidenceIndex }) =>
      evidenceIndexes ?? (Number.isInteger(evidenceIndex) ? [evidenceIndex] : []),
    ))].sort((left, right) => left - right);
    if (mappedEvidence.length) assert.deepEqual(mappedEvidence, topic.evidence.map((_, index) => index), topic.name);
  }
});

test('authored quizzes are only used when every evidence item has an answer-bearing task', () => {
  for (const topic of topics) {
    const assessment = childAssessmentFor(topic);
    if (assessment.kind !== 'choice') continue;

    const mappedEvidence = assessment.tasks.map(({ evidenceIndex }) => evidenceIndex);
    assert.deepEqual(mappedEvidence, topic.evidence.map((_, index) => index), topic.name);
    for (const task of assessment.tasks) {
      assert.ok(task.choices.length >= 2, topic.name);
      assert.ok(task.choices.some(({ correct }) => correct === true), topic.name);
    }
  }
});

test('the age-five money journey has a self-checking, bilingual mission for every money topic', () => {
  const moneyIds = ['mt_SsS7GptD_o', 'mt_FNSeo9_T2Z', 'mt_zrCyqhngYm'];
  const moneyTopics = moneyIds.map((id) => topics.find((topic) => topic.id === id));
  assert.ok(moneyTopics.every(Boolean));

  for (const topic of moneyTopics) {
    assert.ok(topic.ageRangeStart <= 5 && topic.ageRangeEnd >= 5, topic.name);
    const assessment = childAssessmentFor(topic);
    assert.equal(assessment.kind, 'choice', topic.name);
    assert.equal(assessment.tasks.length, topic.evidence.length, topic.name);
    for (const [index, task] of assessment.tasks.entries()) {
      assert.equal(task.evidenceIndex, index, `${topic.name} task ${index + 1} maps to its source criterion`);
      assert.ok(task.vocabulary?.length && task.vocabulary.every(({ en, ro }) => en && ro), `${topic.name} has words to learn in mixed mode`);
      assert.ok(task.prompt.en && task.prompt.ro, `${topic.name} has both child languages`);
      assert.ok(task.choices.every(({ icon, label }) => icon && label?.en && label?.ro), `${topic.name} has visual bilingual options`);
      assert.ok(task.choices.some(({ correct }) => correct), `${topic.name} has a self-checkable answer`);
      assert.ok((task.requiredCount ?? 1) <= task.choices.filter(({ correct }) => correct).length, `${topic.name} has enough correct answers`);
    }
  }
});

test('curated picture games are first-class Play missions without claiming full-topic mastery', () => {
  const gameTopics = topics.filter((topic) => preschoolActivityFor(topic));
  assert.equal(gameTopics.length, 16);
  for (const topic of gameTopics) {
    const assessment = childAssessmentFor(topic);
    assert.equal(assessment.kind, 'practice-game', topic.name);
    assert.equal(assessment.tasks.length, 1, topic.name);
    assert.deepEqual(assessment.tasks[0].evidenceIndexes, [], `${topic.name} game does not claim to cover the full evidence list`);
    if (assessment.tasks[0].interaction?.kind === 'tap-sort') {
      const { bins, items } = assessment.tasks[0].interaction;
      assert.ok(bins.length >= 2 && items.length >= 2, topic.name);
      assert.ok(items.every(({ bin }) => bins.some((candidate) => candidate.id === bin)), topic.name);
    } else {
      assert.ok(assessment.tasks[0].choices.some(({ correct }) => correct), topic.name);
    }
  }
});

test('counting games make every object tappable and keep answer choices visually equivalent', () => {
  const countingIds = ['mt_WcfaSfVT33', 'mt_dmNvjroCPT', 'mt_OvyoRo47K-'];
  for (const id of countingIds) {
    const topic = topics.find((candidate) => candidate.id === id);
    const assessment = childAssessmentFor(topic);
    const task = assessment.tasks[0];
    const { interaction } = task;

    assert.equal(assessment.kind, 'practice-game', topic.name);
    assert.equal(interaction.kind, 'tap-each', topic.name);
    assert.equal(interaction.groups.reduce((sum, count) => sum + count, 0), interaction.count, topic.name);
    assert.ok(interaction.instruction.en && interaction.instruction.ro, topic.name);
    assert.ok(task.choices.every(({ icon }) => /^\d+$/.test(icon)), `${topic.name} uses number-only answer visuals`);
    assert.ok(task.choices.every(({ value, label }) => Number(label.en.match(/^\d+/)?.[0]) === value), topic.name);
    assert.equal(task.choices.find(({ correct }) => correct).value, interaction.count, topic.name);
    assert.ok(task.prompt.mix, `${topic.name} has a natural mixed-language question`);
    assert.ok(interaction.instruction.mix, `${topic.name} has a mixed-language play instruction`);
    assert.ok(interaction.objectLabel.mix && interaction.destination.mix, `${topic.name} has mixed-language object labels`);
    assert.ok(task.choices.every(({ label }) => label.mix), `${topic.name} has mixed-language answer labels`);
    assert.ok(task.vocabulary?.length && task.vocabulary.every(({ en, ro }) => en && ro), `${topic.name} has mixed-language vocabulary`);
  }
});

test('the animal sort is a self-guided, age-five practice game with explicit homes', () => {
  const topic = topics.find(({ id }) => id === 'mt_muxjw0fxxN');
  assert.ok(topic && topic.ageRangeStart <= 5 && topic.ageRangeEnd >= 5);
  const assessment = childAssessmentFor(topic);
  const task = assessment.tasks[0];
  assert.equal(assessment.kind, 'practice-game');
  assert.equal(task.interaction.kind, 'tap-sort');
  assert.deepEqual(task.evidenceIndexes, []);
  assert.ok(task.interaction.instruction.en && task.interaction.instruction.ro && task.interaction.instruction.mix);
  assert.ok(task.interaction.bins.every(({ label }) => label.en && label.ro));
  assert.equal(task.interaction.items.length, 9);
});

test('topics with no rubric get a single self-guided mission without fabricated evidence or repeated child names', () => {
  const topic = topics.find((candidate) => candidate.evidence.length === 0 && !preschoolActivityFor(candidate));
  assert.ok(topic);
  const assessment = childAssessmentFor(topic);
  assert.equal(assessment.kind, 'guided');
  assert.equal(assessment.tasks.length, 1);
  assert.deepEqual(assessment.tasks[0].evidenceIndexes, []);
  assert.doesNotMatch(assessment.tasks[0].prompt.en, /Alex/);
});

test('research-reference-only evidence uses the observable topic prompt instead of asking a child to repeat citations', () => {
  const topic = topics.find(({ name }) => name === 'Reading for Meaning');
  assert.ok(topic);
  const assessment = childAssessmentFor(topic);
  assert.equal(assessment.kind, 'guided');
  assert.equal(assessment.tasks.length, 1);
  assert.deepEqual(assessment.tasks[0].evidenceIndexes, []);
  assert.doesNotMatch(assessment.tasks[0].prompt.en, /Alex/);
});
