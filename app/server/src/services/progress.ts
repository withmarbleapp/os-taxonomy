import type {
  Child,
  ProgressSummary,
  TopicMastery,
  Topic,
} from '../../../shared/types.js';
import { buildProgressStory, tallyRagCounts } from '../../../shared/mastery.js';
import { listMastery } from '../db/repository.js';
import { loadTaxonomy } from './taxonomy.js';
import { buildLearningPath } from './learningPath.js';

export function buildProgressSummary(child: Child): ProgressSummary {
  const mastery = listMastery(child.id);
  const taxonomy = loadTaxonomy();
  return summariseProgress(child, mastery, taxonomy.topicsById);
}

export function summariseProgress(
  child: Child,
  mastery: TopicMastery[],
  topicsById: Map<string, Topic>,
): ProgressSummary {
  const bySubject: ProgressSummary['bySubject'] = {};

  let mastered = 0;
  let practicing = 0;
  let needsRefresh = 0;
  let introduced = 0;

  for (const m of mastery) {
    const topic = topicsById.get(m.topicId);
    const subject = topic?.subject ?? 'Other';
    if (!bySubject[subject]) {
      bySubject[subject] = {
        mastered: 0,
        practicing: 0,
        needsRefresh: 0,
        introduced: 0,
        total: 0,
      };
    }
    bySubject[subject].total += 1;

    switch (m.status) {
      case 'mastered':
        mastered += 1;
        bySubject[subject].mastered += 1;
        break;
      case 'practicing':
        practicing += 1;
        bySubject[subject].practicing += 1;
        break;
      case 'needs_refresh':
        needsRefresh += 1;
        bySubject[subject].needsRefresh += 1;
        break;
      case 'introduced':
        introduced += 1;
        bySubject[subject].introduced += 1;
        break;
      default:
        break;
    }
  }

  const story = buildProgressStory(child.name, bySubject);
  const suggestedTheme = child.interests[0] ?? null;
  const path = buildLearningPath(child, mastery);
  const ragCounts =
    mastery.length > 0
      ? tallyRagCounts(mastery.map((m) => m.status))
      : path.ragCounts;

  return {
    childId: child.id,
    totalTracked: mastery.length,
    mastered,
    practicing,
    needsRefresh,
    introduced,
    ragCounts,
    bySubject,
    story,
    suggestedTheme,
    frontier: path.frontier,
  };
}
