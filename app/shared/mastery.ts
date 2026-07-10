import type {
  MasteryStatus,
  AssessmentRecommendation,
  RagLevel,
  RagCounts,
} from './types.js';

const STATUS_RANK: Record<MasteryStatus, number> = {
  not_started: 0,
  introduced: 1,
  practicing: 2,
  mastered: 3,
  needs_refresh: 2,
};

/** Map mastery status to parent-facing RAG colour. Untracked defaults to red. */
export function toRagLevel(status: MasteryStatus | undefined | null): RagLevel {
  if (!status || status === 'not_started' || status === 'needs_refresh') return 'red';
  if (status === 'introduced' || status === 'practicing') return 'amber';
  return 'green';
}

export function ragLabel(rag: RagLevel): string {
  switch (rag) {
    case 'red':
      return 'Needs learning';
    case 'amber':
      return 'Growing';
    case 'green':
      return 'Excellent';
  }
}

export function ragCssClass(rag: RagLevel): string {
  return `rag-${rag}`;
}

export function emptyRagCounts(): RagCounts {
  return { red: 0, amber: 0, green: 0 };
}

export function tallyRagCounts(
  statuses: Array<MasteryStatus | undefined | null>,
): RagCounts {
  const counts = emptyRagCounts();
  for (const status of statuses) {
    counts[toRagLevel(status)] += 1;
  }
  return counts;
}

export function isPrerequisiteSatisfied(status: MasteryStatus | undefined): boolean {
  if (!status) return false;
  return status === 'mastered' || status === 'practicing';
}

export function applyAssessmentRecommendation(
  current: MasteryStatus | undefined,
  recommendation: AssessmentRecommendation,
  score: number,
): MasteryStatus {
  const base = current ?? 'not_started';

  if (recommendation === 'refresh') {
    return 'needs_refresh';
  }

  if (recommendation === 'practice') {
    if (base === 'not_started') return 'introduced';
    if (base === 'mastered') return 'practicing';
    return 'practicing';
  }

  // advance
  if (score >= 0.85) return 'mastered';
  if (score >= 0.6) return 'practicing';
  if (base === 'not_started') return 'introduced';
  return 'practicing';
}

export function topicCountForDuration(minutes: number): number {
  if (minutes <= 15) return 1;
  if (minutes <= 20) return 2;
  if (minutes <= 30) return 3;
  return 4;
}

export function statusRank(status: MasteryStatus): number {
  return STATUS_RANK[status];
}

export function buildProgressStory(
  childName: string,
  bySubject: Record<string, { mastered: number; practicing: number; needsRefresh: number }>,
): string {
  const entries = Object.entries(bySubject).filter(
    ([, v]) => v.mastered + v.practicing + v.needsRefresh > 0,
  );

  if (entries.length === 0) {
    return `${childName} is ready for a first adventure — pick a theme and we'll begin.`;
  }

  const growing = entries
    .map(([subject, v]) => ({ subject, score: v.mastered * 2 + v.practicing }))
    .sort((a, b) => b.score - a.score)[0];

  const refresh = entries.find(([, v]) => v.needsRefresh > 0);

  if (refresh) {
    return `${childName} is growing in ${growing.subject}, and a gentle refresh on ${refresh[0]} will keep things solid.`;
  }

  return `${childName} is growing in ${growing.subject}.`;
}
