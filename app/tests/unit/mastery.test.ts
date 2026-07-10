import { describe, expect, it } from 'vitest';
import {
  toRagLevel,
  ragLabel,
  tallyRagCounts,
  applyAssessmentRecommendation,
  topicCountForDuration,
  isPrerequisiteSatisfied,
  buildProgressStory,
} from '../../shared/mastery.js';

describe('mastery helpers', () => {
  it('maps duration to topic counts', () => {
    expect(topicCountForDuration(15)).toBe(1);
    expect(topicCountForDuration(20)).toBe(2);
    expect(topicCountForDuration(30)).toBe(3);
    expect(topicCountForDuration(45)).toBe(4);
  });

  it('treats mastered and practicing as satisfied prerequisites', () => {
    expect(isPrerequisiteSatisfied('mastered')).toBe(true);
    expect(isPrerequisiteSatisfied('practicing')).toBe(true);
    expect(isPrerequisiteSatisfied('introduced')).toBe(false);
    expect(isPrerequisiteSatisfied(undefined)).toBe(false);
  });

  it('applies assessment recommendations', () => {
    expect(applyAssessmentRecommendation('practicing', 'refresh', 0.3)).toBe('needs_refresh');
    expect(applyAssessmentRecommendation('not_started', 'practice', 0.5)).toBe('introduced');
    expect(applyAssessmentRecommendation('practicing', 'advance', 0.9)).toBe('mastered');
    expect(applyAssessmentRecommendation('introduced', 'advance', 0.7)).toBe('practicing');
  });

  it('builds a parent-facing progress story', () => {
    const story = buildProgressStory('Maya', {
      Mathematics: { mastered: 2, practicing: 1, needsRefresh: 0 },
      English: { mastered: 0, practicing: 0, needsRefresh: 1 },
    });
    expect(story).toContain('Maya');
    expect(story).toContain('Mathematics');
    expect(story).toContain('English');
  });

  it('maps mastery statuses to RAG levels', () => {
    expect(toRagLevel(undefined)).toBe('red');
    expect(toRagLevel('not_started')).toBe('red');
    expect(toRagLevel('needs_refresh')).toBe('red');
    expect(toRagLevel('introduced')).toBe('amber');
    expect(toRagLevel('practicing')).toBe('amber');
    expect(toRagLevel('mastered')).toBe('green');
  });

  it('provides parent-facing RAG labels', () => {
    expect(ragLabel('red')).toBe('Needs learning');
    expect(ragLabel('amber')).toBe('Growing');
    expect(ragLabel('green')).toBe('Excellent');
  });

  it('tallies RAG counts', () => {
    expect(
      tallyRagCounts(['mastered', 'practicing', 'needs_refresh', 'not_started', 'introduced']),
    ).toEqual({ red: 2, amber: 2, green: 1 });
  });
});
