import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assessmentPromptFor, buildTaxonomy } from "../explorer/src/taxonomy.js";

const topics = [
  { id: "mt_a", name: "A", subject: "Science", ageRangeStart: 5, ageRangeEnd: 6, assessmentPrompt: "Can {{name}} do A?" },
  { id: "mt_b", name: "B", subject: "Mathematics", ageRangeStart: 7, ageRangeEnd: 8, assessmentPrompt: "Can {{name}} do B?" },
];
const dependencies = [{ topicId: "mt_b", prerequisiteId: "mt_a", strength: "hard", reason: "A comes first" }];

describe("buildTaxonomy", () => {
  it("indexes prerequisite and unlock relationships in both directions", () => {
    const result = buildTaxonomy(topics, dependencies);
    assert.equal(result.prerequisites.get("mt_b")[0].topic.name, "A");
    assert.equal(result.unlocks.get("mt_a")[0].topic.name, "B");
    assert.deepEqual(result.subjects, ["Mathematics", "Science"]);
    assert.equal(result.minAge, 5);
    assert.equal(result.maxAge, 8);
  });
});

describe("assessmentPromptFor", () => {
  it("fills every child-name placeholder without mutating the topic", () => {
    assert.equal(assessmentPromptFor(topics[0], "Ada"), "Can Ada do A?");
    assert.equal(topics[0].assessmentPrompt, "Can {{name}} do A?");
  });
});
