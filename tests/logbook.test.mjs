import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterLogbookTopics, getProgressStats, getRecommendedTopics, getSubjectJourneys } from "../explorer/src/logbook.js";
import { buildTaxonomy } from "../explorer/src/taxonomy.js";

const topics = [
  { id: "mt_a", name: "Foundations", subject: "Science", domain: "Basics", ageRangeStart: 4, ageRangeEnd: 5, centrality: 0.8 },
  { id: "mt_b", name: "Next step", subject: "Science", domain: "Basics", ageRangeStart: 5, ageRangeEnd: 6, centrality: 0.7 },
  { id: "mt_c", name: "Numbers", subject: "Mathematics", domain: "Number", ageRangeStart: 4, ageRangeEnd: 5, centrality: 0.9 },
];
const taxonomy = buildTaxonomy(topics, [{ topicId: "mt_b", prerequisiteId: "mt_a", strength: "hard", reason: "first" }]);
const progress = {
  mt_a: { status: "mastered", updatedAt: "2026-01-01T00:00:00.000Z", assessment: { verified: true } },
  mt_c: { status: "learning", updatedAt: "2026-01-02T00:00:00.000Z" },
};

describe("logbook summaries", () => {
  it("counts current progress and groups it by subject", () => {
    assert.deepEqual(getProgressStats(topics, progress), { known: 1, learning: 1, assessed: 1, notStarted: 1, total: 3 });
    assert.deepEqual(getSubjectJourneys(topics, progress), [
      { subject: "Science", total: 2, known: 1, learning: 0, assessed: 1 },
      { subject: "Mathematics", total: 1, known: 0, learning: 1, assessed: 0 },
    ]);
  });

  it("recommends learning topics first and concepts whose prerequisites are met", () => {
    assert.deepEqual(getRecommendedTopics(taxonomy, progress).map(({ id }) => id), ["mt_c", "mt_b"]);
  });

  it("filters by state and searches across subject and domain", () => {
    assert.deepEqual(filterLogbookTopics(topics, progress, { status: "known" }).map(({ id }) => id), ["mt_a"]);
    assert.deepEqual(filterLogbookTopics(topics, progress, { status: "not-started" }).map(({ id }) => id), ["mt_b"]);
    assert.deepEqual(filterLogbookTopics(topics, progress, { query: "number" }).map(({ id }) => id), ["mt_c"]);
  });
});
