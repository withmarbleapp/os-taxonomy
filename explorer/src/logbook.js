export function getProgressStats(topics, progress) {
  const entries = Object.values(progress);
  const known = entries.filter(({ status }) => status === "mastered").length;
  const practiced = entries.filter(({ status }) => status === "practiced").length;
  const learning = entries.filter(({ status }) => status === "learning").length;
  const assessed = entries.filter(({ assessment }) => assessment?.verified).length;
  return { known, practiced, learning, assessed, notStarted: topics.length - known - practiced - learning, total: topics.length };
}

export function getSubjectJourneys(topics, progress) {
  const journeys = new Map();
  for (const topic of topics) {
    const journey = journeys.get(topic.subject) ?? { subject: topic.subject, total: 0, known: 0, practiced: 0, learning: 0, assessed: 0 };
    const entry = progress[topic.id];
    journey.total += 1;
    if (entry?.status === "mastered") journey.known += 1;
    if (entry?.status === "practiced") journey.practiced += 1;
    if (entry?.status === "learning") journey.learning += 1;
    if (entry?.assessment?.verified) journey.assessed += 1;
    journeys.set(topic.subject, journey);
  }
  return [...journeys.values()].sort((left, right) => right.known - left.known || left.subject.localeCompare(right.subject));
}

export function getRecommendedTopics(taxonomy, progress, limit = 5) {
  const complete = new Set(Object.entries(progress).filter(([, entry]) => entry.status === "mastered" || entry.status === "practiced").map(([id]) => id));
  const learning = new Set(Object.entries(progress).filter(([, entry]) => entry.status === "learning").map(([id]) => id));
  const unlockedByCompletion = new Set(
    taxonomy.dependencies.filter(({ prerequisiteId }) => complete.has(prerequisiteId)).map(({ topicId }) => topicId),
  );

  return taxonomy.topics
    .filter((topic) => !complete.has(topic.id))
    .filter((topic) => taxonomy.prerequisites.get(topic.id).filter(({ strength }) => strength === "hard").every(({ prerequisiteId }) => complete.has(prerequisiteId)))
    .sort((left, right) => {
      const leftPriority = learning.has(left.id) ? 0 : unlockedByCompletion.has(left.id) ? 1 : 2;
      const rightPriority = learning.has(right.id) ? 0 : unlockedByCompletion.has(right.id) ? 1 : 2;
      return leftPriority - rightPriority || left.ageRangeStart - right.ageRangeStart || right.centrality - left.centrality || left.name.localeCompare(right.name);
    })
    .slice(0, limit);
}

export function filterLogbookTopics(topics, progress, { status = "all", query = "" } = {}) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return topics
    .filter((topic) => {
      const entry = progress[topic.id];
      if (status === "known" && entry?.status !== "mastered") return false;
      if (status === "practiced" && entry?.status !== "practiced") return false;
      if (status === "learning" && entry?.status !== "learning") return false;
      if (status === "not-started" && entry) return false;
      if (status === "assessed" && !entry?.assessment?.verified) return false;
      if (normalizedQuery && !`${topic.name} ${topic.subject} ${topic.domain}`.toLocaleLowerCase().includes(normalizedQuery)) return false;
      return true;
    })
    .sort((left, right) => {
      const leftUpdated = progress[left.id]?.updatedAt ?? "";
      const rightUpdated = progress[right.id]?.updatedAt ?? "";
      if (leftUpdated || rightUpdated) return rightUpdated.localeCompare(leftUpdated);
      return left.ageRangeStart - right.ageRangeStart || left.subject.localeCompare(right.subject) || left.name.localeCompare(right.name);
    });
}
