import type { Topic, TopicMastery, Dependency, MasteryStatus } from './types.js';
import { isPrerequisiteSatisfied, topicCountForDuration } from './mastery.js';

export interface SelectTopicsInput {
  topics: Topic[];
  dependencies: Dependency[];
  mastery: TopicMastery[];
  age: number;
  count: number;
  subjectFocus?: string | null;
  domainFocus?: string | null;
  preferTopicId?: string | null;
  preferUkNc?: boolean;
}

export interface ScoredTopic {
  topic: Topic;
  score: number;
  reasons: string[];
}

function masteryMap(mastery: TopicMastery[]): Map<string, MasteryStatus> {
  return new Map(mastery.map((m) => [m.topicId, m.status]));
}

function hardPrereqs(
  topicId: string,
  dependencies: Dependency[],
): string[] {
  return dependencies
    .filter((d) => d.topicId === topicId && d.strength === 'hard')
    .map((d) => d.prerequisiteId);
}

function ageFits(topic: Topic, age: number): boolean {
  const start = topic.ageRangeStart ?? age;
  const end = topic.ageRangeEnd ?? age;
  // Allow ±1 year band around the child's age
  return age >= start - 1 && age <= end + 1;
}

function hasUkNc(topic: Topic): boolean {
  return topic.standards.some((s) => s.startsWith('uk-nc-2013:'));
}

/**
 * Deterministic topic selection for worksheet generation.
 * Prefers needs_refresh, then high-centrality gaps with satisfied hard prereqs,
 * UK NC alignment, and optional subject / domain / preferred topic focus.
 */
export function selectTopicsForWorksheet(input: SelectTopicsInput): Topic[] {
  const {
    topics,
    dependencies,
    mastery,
    age,
    count,
    subjectFocus,
    domainFocus,
    preferTopicId,
    preferUkNc = true,
  } = input;

  const statusByTopic = masteryMap(mastery);
  const scored: ScoredTopic[] = [];

  for (const topic of topics) {
    if (!topic.name) continue;
    if (!ageFits(topic, age)) continue;
    if (subjectFocus && topic.subject !== subjectFocus) continue;
    if (domainFocus && (topic.domain ?? 'General') !== domainFocus) continue;

    const status = statusByTopic.get(topic.id) ?? 'not_started';
    if (status === 'mastered') continue;

    const prereqs = hardPrereqs(topic.id, dependencies);
    const prereqsOk = prereqs.every((id) =>
      isPrerequisiteSatisfied(statusByTopic.get(id)),
    );
    // Allow topics with no hard prereqs, or all satisfied
    if (prereqs.length > 0 && !prereqsOk) continue;

    const reasons: string[] = [];
    let score = 0;

    if (preferTopicId && topic.id === preferTopicId) {
      score += 500;
      reasons.push('preferred topic');
    }

    if (status === 'needs_refresh') {
      score += 100;
      reasons.push('needs refresh');
    } else if (status === 'practicing') {
      score += 60;
      reasons.push('practicing');
    } else if (status === 'introduced') {
      score += 40;
      reasons.push('introduced');
    } else {
      score += 20;
      reasons.push('new');
    }

    score += (topic.centrality ?? 0) * 30;

    if (preferUkNc && hasUkNc(topic)) {
      score += 15;
      reasons.push('UK NC');
    }

    // Prefer topics closer to the child's exact age
    const mid =
      ((topic.ageRangeStart ?? age) + (topic.ageRangeEnd ?? age)) / 2;
    score += Math.max(0, 10 - Math.abs(mid - age) * 3);

    scored.push({ topic, score, reasons });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.topic.id < b.topic.id ? -1 : 1;
  });

  // Diversify subjects a little when no subject/domain focus
  const selected: Topic[] = [];
  const usedSubjects = new Set<string>();
  const allowDiversify = !subjectFocus && !domainFocus;

  for (const item of scored) {
    if (selected.length >= count) break;
    if (
      allowDiversify &&
      selected.length > 0 &&
      usedSubjects.has(item.topic.subject) &&
      scored.length > count * 2
    ) {
      continue;
    }
    selected.push(item.topic);
    usedSubjects.add(item.topic.subject);
  }

  // Fill remaining if diversification skipped too many
  if (selected.length < count) {
    for (const item of scored) {
      if (selected.length >= count) break;
      if (selected.some((t) => t.id === item.topic.id)) continue;
      selected.push(item.topic);
    }
  }

  return selected;
}

export function resolveTopicCount(durationMinutes: number): number {
  return topicCountForDuration(durationMinutes);
}
