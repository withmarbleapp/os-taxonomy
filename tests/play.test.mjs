import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { getEarnedStars, getPlayChapters, getPlayPath, missionTextForLanguage, playText, replayCountingLayout, spokenTaskText } from '../explorer/src/play-view.js';
import { buildTaxonomy } from '../explorer/src/taxonomy.js';

const { topics } = JSON.parse(readFileSync(new URL('../data/topics.json', import.meta.url)));
const { dependencies } = JSON.parse(readFileSync(new URL('../data/dependencies.json', import.meta.url)));
const taxonomy = buildTaxonomy(topics, dependencies);

test('Play can keep English and Romanian together in one mixed-language mode', () => {
  assert.equal(playText({ en: 'garage', ro: 'garaj', mix: 'garage' }, 'mix'), 'garage');
  assert.equal(missionTextForLanguage({ en: 'How many cars?', ro: 'Câte mașini?' }, 'mix'), 'Hai să încercăm. How many cars?');
  assert.equal(missionTextForLanguage({ en: 'How many cars?', ro: 'Câte mașini?', mix: 'Câte toy cars sunt?' }, 'mix'), 'Câte toy cars sunt?');
  assert.equal(missionTextForLanguage({ en: 'How many cars?', ro: 'Câte mașini?' }, 'ro'), 'Câte mașini?');
});

test('counting replay layouts change the visual arrangement without changing arithmetic groups', () => {
  const first = replayCountingLayout([4, 3], () => 0);
  const second = replayCountingLayout([4, 3], () => 0.999999);

  assert.deepEqual(first.map(({ indexes }) => indexes.length), [4, 3]);
  assert.deepEqual(second.map(({ indexes }) => indexes.length), [4, 3]);
  assert.ok(first[0].indexes.every((index) => index >= 0 && index < 4));
  assert.ok(first[1].indexes.every((index) => index >= 4 && index < 7));
  assert.notDeepEqual(first, second);
  for (const group of [...first, ...second]) {
    assert.equal(new Set(group.indexes).size, group.indexes.length);
    assert.ok(group.columns >= 1 && group.columns <= group.indexes.length);
  }
});

test('spoken mission text includes the game action before the question', () => {
  const spoken = spokenTaskText({
    interaction: { instruction: { en: 'Tap each car and count as you go.' } },
    prompt: { en: 'How many toy cars are there?' },
    choices: [{ label: { en: '6 cars' } }, { label: { en: '7 cars' } }],
  }, 'en');
  assert.equal(spoken, 'Tap each car and count as you go. How many toy cars are there? 6 cars, 7 cars');
});

test('trail stars persist from completed topics and stay isolated by profile', () => {
  const progress = {
    masteredTopic: { status: 'mastered' },
    practicedTopic: { status: 'practiced' },
    inProgressTopic: { status: 'learning' },
  };
  assert.equal(getEarnedStars(progress), 2);
  assert.equal(getEarnedStars({}), 0);
  assert.equal(getEarnedStars({ one: { status: 'mastered' } }), 1);
});

test('Play assignments come from the taxonomy quick assessments for the selected age', () => {
  const path = getPlayPath(taxonomy, {}, 5);
  assert.ok(path.available.length > 0);
  for (const topic of path.available) {
    assert.ok(topic.ageRangeStart <= 5 && topic.ageRangeEnd >= 5, topic.name);
    assert.ok(topic.assessmentPrompt, topic.name);
    assert.equal(taxonomy.prerequisites.get(topic.id).filter(({ strength }) => strength === 'hard').length, 0, topic.name);
  }
});

test('kid chapters group the age-filtered path by its existing taxonomy domains', () => {
  for (const subject of taxonomy.subjects) {
    const chapters = getPlayChapters(taxonomy, {}, 5, subject);
    const expected = topics.filter((topic) => topic.subject === subject && topic.ageRangeStart <= 5 && topic.ageRangeEnd >= 5);
    assert.equal(chapters.reduce((sum, chapter) => sum + chapter.total, 0), expected.length, subject);
    assert.equal(new Set(chapters.map(({ domain }) => domain)).size, chapters.length, subject);
    assert.ok(chapters.every(({ domain, number, total }) => domain && number > 0 && total > 0), subject);
    for (const chapter of chapters) {
      const path = getPlayPath(taxonomy, {}, 5, subject, chapter.domain);
      assert.equal(path.available.length + path.locked.length + path.completed.length, chapter.total, `${subject} / ${chapter.domain}`);
    }
  }
});

test('finishing a hard prerequisite unlocks its next quick assignment', () => {
  const dependency = dependencies.find(({ topicId, prerequisiteId, strength }) => {
    if (strength !== 'hard') return false;
    const topic = taxonomy.byId.get(topicId);
    const prerequisite = taxonomy.byId.get(prerequisiteId);
    return topic && prerequisite && topic.assessmentPrompt && topic.ageRangeStart <= 5 && topic.ageRangeEnd >= 5 &&
      prerequisite.ageRangeStart <= 5 && prerequisite.ageRangeEnd >= 5 &&
      taxonomy.prerequisites.get(topicId).filter(({ strength: edgeStrength }) => edgeStrength === 'hard').length === 1;
  });
  assert.ok(dependency, 'expected a single-prerequisite assignment in the age-five path');

  const lockedPath = getPlayPath(taxonomy, {}, 5);
  assert.ok(lockedPath.locked.some(({ topic }) => topic.id === dependency.topicId));

  const nextPath = getPlayPath(taxonomy, {
    [dependency.prerequisiteId]: { status: 'mastered' },
  }, 5);
  assert.ok(nextPath.available.some(({ id }) => id === dependency.topicId));
});

test('finishing a self-guided practice mission unlocks the next step without claiming mastery', () => {
  const dependency = dependencies.find(({ topicId, prerequisiteId, strength }) => {
    if (strength !== 'hard') return false;
    const topic = taxonomy.byId.get(topicId);
    const prerequisite = taxonomy.byId.get(prerequisiteId);
    return topic && prerequisite && topic.ageRangeStart <= 5 && topic.ageRangeEnd >= 5 &&
      prerequisite.ageRangeStart <= 5 && prerequisite.ageRangeEnd >= 5 &&
      taxonomy.prerequisites.get(topicId).filter(({ strength: edgeStrength }) => edgeStrength === 'hard').length === 1;
  });
  assert.ok(dependency);

  const path = getPlayPath(taxonomy, {
    [dependency.prerequisiteId]: { status: 'practiced', updatedAt: '2026-01-01T00:00:00.000Z' },
  }, 5);
  assert.ok(path.completed.some(({ id }) => id === dependency.prerequisiteId));
  assert.ok(path.available.some(({ id }) => id === dependency.topicId));
});

test('topics without evidence lists still receive a playable path assignment', () => {
  const topic = topics.find(({ evidence }) => !evidence?.length);
  assert.ok(topic, 'expected at least one topic without evidence entries');

  const path = getPlayPath(taxonomy, {}, topic.ageRangeStart);
  const includedIds = new Set([
    ...path.available.map(({ id }) => id),
    ...path.locked.map(({ topic: lockedTopic }) => lockedTopic.id),
  ]);
  assert.ok(includedIds.has(topic.id), topic.name);
});
