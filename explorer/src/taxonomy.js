export async function loadTaxonomy(baseUrl = "../data") {
  const [topicResponse, dependencyResponse] = await Promise.all([
    fetch(`${baseUrl}/topics.json`),
    fetch(`${baseUrl}/dependencies.json`),
  ]);
  if (!topicResponse.ok || !dependencyResponse.ok) throw new Error("The taxonomy data could not be loaded.");
  const [{ topics }, { dependencies }] = await Promise.all([topicResponse.json(), dependencyResponse.json()]);
  return buildTaxonomy(topics, dependencies);
}

export function buildTaxonomy(topics, dependencies) {
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  const prerequisites = new Map(topics.map(({ id }) => [id, []]));
  const unlocks = new Map(topics.map(({ id }) => [id, []]));

  for (const dependency of dependencies) {
    prerequisites.get(dependency.topicId)?.push({ ...dependency, topic: byId.get(dependency.prerequisiteId) });
    unlocks.get(dependency.prerequisiteId)?.push({ ...dependency, topic: byId.get(dependency.topicId) });
  }

  return {
    topics,
    dependencies,
    byId,
    prerequisites,
    unlocks,
    subjects: [...new Set(topics.map(({ subject }) => subject))].sort(),
    minAge: Math.min(...topics.map(({ ageRangeStart }) => ageRangeStart)),
    maxAge: Math.max(...topics.map(({ ageRangeEnd }) => ageRangeEnd)),
  };
}

export function assessmentPromptFor(topic, childName) {
  const replacement = childName || "the child";
  return topic.assessmentPrompt.replaceAll("{{name}}", replacement);
}
