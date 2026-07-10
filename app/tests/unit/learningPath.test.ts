import { describe, expect, it } from 'vitest';
import type {
  Child,
  Dependency,
  LearningPathSubject,
  Topic,
  TopicMastery,
} from '../../shared/types.js';
import {
  buildLearningPath,
  computeFrontier,
  orderTopicsByPrereqs,
} from '../../server/src/services/learningPath.js';

const child: Child = {
  id: 'c1',
  name: 'Maya',
  dateOfBirth: '2021-03-15',
  age: 5,
  yearGroup: 'Reception',
  interests: ['sea life'],
  avatarColor: '#2a6f7a',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('learning path curation', () => {
  it('orders topics by hard prerequisites', () => {
    const topics: Topic[] = [
      {
        id: 'mt_b',
        type: 'PROCEDURAL',
        subject: 'Mathematics',
        domain: 'Counting',
        name: 'B',
        description: 'b',
        ageRangeStart: 5,
        ageRangeEnd: 6,
        centrality: 0.5,
        evidence: [],
        assessmentPrompt: null,
        standards: [],
      },
      {
        id: 'mt_a',
        type: 'CONCEPTUAL',
        subject: 'Mathematics',
        domain: 'Counting',
        name: 'A',
        description: 'a',
        ageRangeStart: 5,
        ageRangeEnd: 6,
        centrality: 0.9,
        evidence: [],
        assessmentPrompt: null,
        standards: [],
      },
    ];
    const deps: Dependency[] = [
      {
        topicId: 'mt_b',
        prerequisiteId: 'mt_a',
        strength: 'hard',
        reason: 'A before B',
      },
    ];
    const ordered = orderTopicsByPrereqs(topics, deps);
    expect(ordered.map((t) => t.id)).toEqual(['mt_a', 'mt_b']);
  });

  it('computes frontier preferring amber after greens', () => {
    const subjects: LearningPathSubject[] = [
      {
        subject: 'Mathematics',
        ragCounts: { red: 1, amber: 1, green: 1 },
        domains: [
          {
            domain: 'Counting',
            summary: null,
            edges: [],
            topics: [
              {
                id: 'g',
                name: 'Green topic',
                description: '',
                evidence: [],
                rag: 'green',
                status: 'mastered',
                centrality: 1,
                subject: 'Mathematics',
                domain: 'Counting',
              },
              {
                id: 'a',
                name: 'Amber topic',
                description: '',
                evidence: [],
                rag: 'amber',
                status: 'practicing',
                centrality: 0.5,
                subject: 'Mathematics',
                domain: 'Counting',
              },
              {
                id: 'r',
                name: 'Red topic',
                description: '',
                evidence: [],
                rag: 'red',
                status: 'not_started',
                centrality: 0.2,
                subject: 'Mathematics',
                domain: 'Counting',
              },
            ],
          },
        ],
      },
    ];
    const frontier = computeFrontier(subjects);
    expect(frontier?.topicId).toBe('a');
    expect(frontier?.topicName).toBe('Amber topic');
  });

  it('builds an age-curated path with RAG and frontier from real taxonomy', () => {
    const mastery: TopicMastery[] = [
      {
        childId: child.id,
        topicId: 'mt_WcfaSfVT33',
        status: 'mastered',
        confidence: 0.95,
        lastAssessedAt: null,
        notes: null,
      },
      {
        childId: child.id,
        topicId: 'mt_OvyoRo47K-',
        status: 'practicing',
        confidence: 0.7,
        lastAssessedAt: null,
        notes: null,
      },
      {
        childId: child.id,
        topicId: 'mt_QEr24lqzvH',
        status: 'needs_refresh',
        confidence: 0.4,
        lastAssessedAt: null,
        notes: null,
      },
    ];

    const path = buildLearningPath(child, mastery, { maxTopicsPerDomain: 8 });
    expect(path.childId).toBe(child.id);
    expect(path.subjects.length).toBeGreaterThan(0);
    expect(path.ragCounts.red + path.ragCounts.amber + path.ragCounts.green).toBeGreaterThan(0);
    expect(path.frontier).not.toBeNull();
    expect(path.constellation.length).toBeGreaterThan(0);

    const math = path.subjects.find((s) => s.subject === 'Mathematics');
    expect(math).toBeTruthy();
    const allTopics = math!.domains.flatMap((d) => d.topics);
    const mastered = allTopics.find((t) => t.id === 'mt_WcfaSfVT33');
    if (mastered) expect(mastered.rag).toBe('green');
  });
});
