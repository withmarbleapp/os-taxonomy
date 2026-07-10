import { describe, expect, it } from 'vitest';
import { selectTopicsForWorksheet, resolveTopicCount } from '../../shared/topicSelection.js';
import type { Dependency, Topic, TopicMastery } from '../../shared/types.js';

const topics: Topic[] = [
  {
    id: 'mt_a',
    type: 'CONCEPTUAL',
    subject: 'Mathematics',
    domain: 'Counting',
    name: 'Counting fish',
    description: 'Count sea creatures',
    ageRangeStart: 4,
    ageRangeEnd: 6,
    centrality: 0.9,
    evidence: ['Counts to 10'],
    assessmentPrompt: null,
    standards: ['uk-nc-2013:Maths/Y1/NPV/1'],
  },
  {
    id: 'mt_b',
    type: 'PROCEDURAL',
    subject: 'English',
    domain: 'Grammar',
    name: 'Building sentences',
    description: 'Write a sentence',
    ageRangeStart: 5,
    ageRangeEnd: 7,
    centrality: 0.5,
    evidence: ['Writes a sentence'],
    assessmentPrompt: null,
    standards: ['uk-nc-2013:Eng.App2.Y1.Sent.1'],
  },
  {
    id: 'mt_c',
    type: 'CONCEPTUAL',
    subject: 'Science',
    domain: 'Animals',
    name: 'Naming animals',
    description: 'Name animals',
    ageRangeStart: 5,
    ageRangeEnd: 7,
    centrality: 0.4,
    evidence: ['Names animals'],
    assessmentPrompt: null,
    standards: [],
  },
  {
    id: 'mt_locked',
    type: 'PROCEDURAL',
    subject: 'Mathematics',
    domain: 'Addition',
    name: 'Advanced adding',
    description: 'Needs prereq',
    ageRangeStart: 5,
    ageRangeEnd: 7,
    centrality: 0.95,
    evidence: [],
    assessmentPrompt: null,
    standards: ['uk-nc-2013:Maths/Y1/AS/1'],
  },
];

const dependencies: Dependency[] = [
  {
    topicId: 'mt_locked',
    prerequisiteId: 'mt_a',
    strength: 'hard',
    reason: 'Must count first',
  },
];

describe('topic selection', () => {
  it('resolves topic count from duration', () => {
    expect(resolveTopicCount(20)).toBe(2);
  });

  it('prefers needs_refresh and skips mastered', () => {
    const mastery: TopicMastery[] = [
      {
        childId: 'c1',
        topicId: 'mt_a',
        status: 'mastered',
        confidence: 1,
        lastAssessedAt: null,
        notes: null,
      },
      {
        childId: 'c1',
        topicId: 'mt_b',
        status: 'needs_refresh',
        confidence: 0.4,
        lastAssessedAt: null,
        notes: null,
      },
    ];

    const selected = selectTopicsForWorksheet({
      topics,
      dependencies,
      mastery,
      age: 5,
      count: 2,
    });

    expect(selected.map((t) => t.id)).toContain('mt_b');
    expect(selected.map((t) => t.id)).not.toContain('mt_a');
  });

  it('blocks topics with unsatisfied hard prerequisites', () => {
    const selected = selectTopicsForWorksheet({
      topics,
      dependencies,
      mastery: [],
      age: 5,
      count: 5,
    });
    expect(selected.map((t) => t.id)).not.toContain('mt_locked');
  });

  it('unlocks topics when hard prerequisites are practicing', () => {
    const mastery: TopicMastery[] = [
      {
        childId: 'c1',
        topicId: 'mt_a',
        status: 'practicing',
        confidence: 0.7,
        lastAssessedAt: null,
        notes: null,
      },
    ];
    const selected = selectTopicsForWorksheet({
      topics,
      dependencies,
      mastery,
      age: 5,
      count: 5,
    });
    expect(selected.map((t) => t.id)).toContain('mt_locked');
  });

  it('respects subject focus', () => {
    const selected = selectTopicsForWorksheet({
      topics,
      dependencies,
      mastery: [],
      age: 5,
      count: 3,
      subjectFocus: 'English',
    });
    expect(selected.every((t) => t.subject === 'English')).toBe(true);
  });

  it('filters by domain focus', () => {
    const selected = selectTopicsForWorksheet({
      topics,
      dependencies,
      mastery: [],
      age: 5,
      count: 3,
      subjectFocus: 'English',
      domainFocus: 'Grammar',
    });
    expect(selected.length).toBeGreaterThan(0);
    expect(selected.every((t) => t.domain === 'Grammar')).toBe(true);
  });

  it('boosts preferTopicId when eligible', () => {
    const selected = selectTopicsForWorksheet({
      topics,
      dependencies,
      mastery: [],
      age: 5,
      count: 1,
      preferTopicId: 'mt_c',
    });
    expect(selected.map((t) => t.id)).toEqual(['mt_c']);
  });
});
