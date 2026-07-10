import type {
  Child,
  Dependency,
  LearningPath,
  LearningPathDomain,
  LearningPathFrontier,
  LearningPathSubject,
  LearningPathTopic,
  MasteryStatus,
  RagCounts,
  Topic,
  TopicMastery,
} from '../../../shared/types.js';
import {
  emptyRagCounts,
  tallyRagCounts,
  toRagLevel,
} from '../../../shared/mastery.js';
import { getChild, listMastery } from '../db/repository.js';
import { getClusterSummary, loadTaxonomy } from './taxonomy.js';

function ageFits(topic: Topic, age: number): boolean {
  const start = topic.ageRangeStart ?? age;
  const end = topic.ageRangeEnd ?? age;
  return age >= start - 1 && age <= end + 1;
}

function hasUkNc(topic: Topic): boolean {
  return topic.standards.some((s) => s.startsWith('uk-nc-2013:'));
}

function topicScore(topic: Topic): number {
  let score = (topic.centrality ?? 0) * 100;
  if (hasUkNc(topic)) score += 15;
  return score;
}

/** Kahn topological sort within a domain; falls back to centrality order. */
export function orderTopicsByPrereqs(
  topics: Topic[],
  dependencies: Dependency[],
): Topic[] {
  const ids = new Set(topics.map((t) => t.id));
  const byId = new Map(topics.map((t) => [t.id, t]));
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of ids) {
    indegree.set(id, 0);
    adj.set(id, []);
  }

  for (const dep of dependencies) {
    if (dep.strength !== 'hard') continue;
    if (!ids.has(dep.topicId) || !ids.has(dep.prerequisiteId)) continue;
    adj.get(dep.prerequisiteId)!.push(dep.topicId);
    indegree.set(dep.topicId, (indegree.get(dep.topicId) ?? 0) + 1);
  }

  const queue = [...ids]
    .filter((id) => (indegree.get(id) ?? 0) === 0)
    .sort((a, b) => topicScore(byId.get(b)!) - topicScore(byId.get(a)!));

  const ordered: Topic[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    ordered.push(byId.get(id)!);
    for (const next of adj.get(id) ?? []) {
      const nextDeg = (indegree.get(next) ?? 1) - 1;
      indegree.set(next, nextDeg);
      if (nextDeg === 0) {
        queue.push(next);
        queue.sort((a, b) => topicScore(byId.get(b)!) - topicScore(byId.get(a)!));
      }
    }
  }

  for (const t of topics) {
    if (!ordered.some((o) => o.id === t.id)) ordered.push(t);
  }
  return ordered;
}

function toPathTopic(topic: Topic, status: MasteryStatus): LearningPathTopic {
  return {
    id: topic.id,
    name: topic.name,
    description: topic.description,
    evidence: topic.evidence,
    rag: toRagLevel(status),
    status,
    centrality: topic.centrality,
    subject: topic.subject,
    domain: topic.domain ?? 'General',
  };
}

export function computeFrontier(
  subjects: LearningPathSubject[],
): LearningPathFrontier | null {
  const ranked = [...subjects].sort((a, b) => {
    if (b.ragCounts.green !== a.ragCounts.green) {
      return b.ragCounts.green - a.ragCounts.green;
    }
    return a.subject.localeCompare(b.subject);
  });

  for (const subject of ranked) {
    for (const domain of subject.domains) {
      let sawGreen = false;
      let firstAmber: LearningPathTopic | null = null;
      let firstRedAfterGreen: LearningPathTopic | null = null;
      let firstRed: LearningPathTopic | null = null;

      for (const topic of domain.topics) {
        if (topic.rag === 'green') {
          sawGreen = true;
          continue;
        }
        if (topic.rag === 'amber' && !firstAmber) firstAmber = topic;
        if (topic.rag === 'red') {
          if (!firstRed) firstRed = topic;
          if (sawGreen && !firstRedAfterGreen) firstRedAfterGreen = topic;
        }
      }

      const pick = firstAmber ?? firstRedAfterGreen ?? firstRed;
      if (pick) {
        return {
          subject: subject.subject,
          domain: domain.domain,
          topicId: pick.id,
          topicName: pick.name,
        };
      }
    }
  }

  return null;
}

export function buildLearningPath(
  child: Child,
  mastery: TopicMastery[],
  options?: { maxTopicsPerDomain?: number },
): LearningPath {
  const taxonomy = loadTaxonomy();
  const maxPerDomain = options?.maxTopicsPerDomain ?? 18;
  const statusByTopic = new Map(mastery.map((m) => [m.topicId, m.status]));

  const ageTopics = taxonomy.topics.filter(
    (t) => t.name && ageFits(t, child.age),
  );

  const subjectMap = new Map<string, Map<string, Topic[]>>();
  for (const topic of ageTopics) {
    const domain = topic.domain ?? 'General';
    if (!subjectMap.has(topic.subject)) subjectMap.set(topic.subject, new Map());
    const domains = subjectMap.get(topic.subject)!;
    if (!domains.has(domain)) domains.set(domain, []);
    domains.get(domain)!.push(topic);
  }

  const subjects: LearningPathSubject[] = [];

  for (const [subject, domains] of [...subjectMap.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const pathDomains: LearningPathDomain[] = [];
    const subjectStatuses: MasteryStatus[] = [];

    for (const [domain, topics] of [...domains.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      const ranked = [...topics].sort((a, b) => topicScore(b) - topicScore(a));
      const curated = ranked.slice(0, maxPerDomain);
      const ordered = orderTopicsByPrereqs(curated, taxonomy.dependencies);
      const idSet = new Set(ordered.map((t) => t.id));

      const pathTopics = ordered.map((t) => {
        const status = statusByTopic.get(t.id) ?? 'not_started';
        subjectStatuses.push(status);
        return toPathTopic(t, status);
      });

      const edges = taxonomy.dependencies
        .filter(
          (d) =>
            d.strength === 'hard' &&
            idSet.has(d.topicId) &&
            idSet.has(d.prerequisiteId),
        )
        .map((d) => ({ from: d.prerequisiteId, to: d.topicId }));

      pathDomains.push({
        domain,
        summary: getClusterSummary(subject, domain, child.age),
        topics: pathTopics,
        edges,
      });
    }

    subjects.push({
      subject,
      domains: pathDomains,
      ragCounts: tallyRagCounts(subjectStatuses),
    });
  }

  const allStatuses = subjects.flatMap((s) =>
    s.domains.flatMap((d) => d.topics.map((t) => t.status)),
  );
  const ragCounts = tallyRagCounts(allStatuses);
  const frontier = computeFrontier(subjects);

  const tracked = mastery
    .map((m) => {
      const topic = taxonomy.topicsById.get(m.topicId);
      if (!topic?.name) return null;
      return toPathTopic(topic, m.status);
    })
    .filter((t): t is LearningPathTopic => Boolean(t))
    .sort((a, b) => (b.centrality ?? 0) - (a.centrality ?? 0));

  const constellation = tracked.slice(0, 48);
  if (frontier) {
    const already = constellation.some((t) => t.id === frontier.topicId);
    if (!already) {
      const topic = taxonomy.topicsById.get(frontier.topicId);
      if (topic) {
        constellation.unshift(
          toPathTopic(topic, statusByTopic.get(topic.id) ?? 'not_started'),
        );
      }
    }
  }

  return {
    childId: child.id,
    age: child.age,
    ragCounts,
    subjects,
    frontier,
    constellation,
  };
}

export function buildLearningPathForChild(child: Child): LearningPath {
  return buildLearningPath(child, listMastery(child.id));
}

export function getLearningPathForChild(childId: string): LearningPath | null {
  const child = getChild(childId);
  if (!child) return null;
  return buildLearningPathForChild(child);
}

export function ragCountsFromMastery(mastery: TopicMastery[]): RagCounts {
  if (mastery.length === 0) return emptyRagCounts();
  return tallyRagCounts(mastery.map((m) => m.status));
}
