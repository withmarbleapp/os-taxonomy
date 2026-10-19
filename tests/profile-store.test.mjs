import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProfileStore, STORAGE_KEY, sanitizeState } from "../explorer/src/profile-store.js";

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, value); }
}

const date = new Date("2026-06-15T10:00:00.000Z");

describe("ProfileStore", () => {
  it("keeps independent progress for multiple child profiles", () => {
    const store = new ProfileStore(new MemoryStorage(), () => date);
    store.addProfile("Ada");
    const adaId = store.activeProfile.id;
    store.setProgress("mt_one", "mastered");
    store.addProfile("Linus");
    store.setProgress("mt_two", "learning");

    assert.deepEqual(store.activeProfile.progress, {
      mt_two: { status: "learning", updatedAt: date.toISOString() },
    });
    store.setActive(adaId);
    assert.equal(store.activeProfile.progress.mt_one.status, "mastered");
    assert.equal(store.activeProfile.progress.mt_two, undefined);
  });

  it("records child-finished practice separately from known and assessed mastery", () => {
    const store = new ProfileStore(new MemoryStorage(), () => date);
    store.addProfile("Ada");
    store.setProgress("mt_one", "practiced");
    store.setProgress("mt_one", "practiced");

    assert.equal(store.activeProfile.progress.mt_one.status, "practiced");
    assert.equal(store.activeProfile.progress.mt_one.assessment, undefined);
    assert.deepEqual(store.activeProfile.activities.map(({ action }) => action), ["practiced", "practiced"]);
  });

  it("stores bounded, local play observations without treating them as mastery evidence", () => {
    const storage = new MemoryStorage();
    const store = new ProfileStore(storage, () => date);
    store.addProfile("Ada");
    const observation = {
      kind: "counting",
      objectKind: "car",
      objectCount: 7,
      uniqueTaps: 7,
      revisitTaps: 2,
      answers: [6, 7],
      responseMs: 12500,
    };
    store.setProgress("mt_cars", "practiced", { observation });

    const restored = new ProfileStore(storage, () => date);
    assert.equal(restored.activeProfile.progress.mt_cars.status, "practiced");
    assert.equal(restored.activeProfile.progress.mt_cars.assessment, undefined);
    assert.deepEqual(restored.activeProfile.activities[0].observation, observation);

    restored.setProgress("mt_cars", "mastered");
    restored.recordPractice("mt_cars", observation);
    assert.equal(restored.activeProfile.progress.mt_cars.status, "mastered", "replaying does not downgrade known progress");
    assert.deepEqual(restored.activeProfile.activities.at(-1).observation, observation);
  });

  it("records verified assessment evidence with mastery", () => {
    const store = new ProfileStore(new MemoryStorage(), () => date);
    store.addProfile("Ada");
    store.setProgress("mt_one", "mastered", { verified: true, evidence: [0, 1, 1, 2] });

    assert.deepEqual(store.activeProfile.progress.mt_one.assessment, {
      verified: true,
      evidence: [0, 1, 2],
      assessedAt: date.toISOString(),
    });

    store.setProgress("mt_one", "mastered");
    assert.equal(store.activeProfile.progress.mt_one.assessment.verified, true, "reapplying mastery preserves its assessment");
  });

  it("can clear one concept or reset only the active profile", () => {
    const store = new ProfileStore(new MemoryStorage(), () => date);
    store.addProfile("Ada");
    store.setProgress("mt_one", "learning");
    store.setProgress("mt_one", null);
    assert.deepEqual(store.activeProfile.progress, {});

    store.setProgress("mt_two", "mastered");
    store.addProfile("Linus");
    store.setProgress("mt_three", "mastered");
    store.resetActiveProgress();
    assert.deepEqual(store.activeProfile.progress, {});

    store.setActive(store.state.profiles[0].id);
    assert.equal(store.activeProfile.progress.mt_two.status, "mastered");
  });

  it("persists and restores state from the versioned local-storage key", () => {
    const storage = new MemoryStorage();
    const first = new ProfileStore(storage, () => date);
    first.addProfile("Ada");
    first.setProgress("mt_one", "learning");
    const restored = new ProfileStore(storage, () => date);

    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).version, 3);
    assert.equal(restored.activeProfile.name, "Ada");
    assert.equal(restored.activeProfile.progress.mt_one.status, "learning");
  });

  it("keeps a chronological activity log and clears it with progress", () => {
    const storage = new MemoryStorage();
    const store = new ProfileStore(storage, () => date);
    store.addProfile("Ada");
    store.setProgress("mt_one", "learning");
    store.setProgress("mt_one", "mastered");
    store.setProgress("mt_one", "mastered", { verified: true, evidence: [0] });

    assert.deepEqual(store.activeProfile.activities.map(({ action }) => action), ["learning", "mastered", "assessed"]);
    assert.equal(store.activeProfile.activities[0].topicId, "mt_one");
    store.resetActiveProgress();
    assert.deepEqual(store.activeProfile.activities, []);
  });
});

describe("sanitizeState", () => {
  it("rejects malformed profiles, progress, and unknown statuses", () => {
    const state = sanitizeState({
      activeProfileId: "p1",
      profiles: [
        { id: "p1", name: " Ada ", progress: { mt_ok: { status: "learning" }, mt_bad: { status: "guessed" }, nope: { status: "mastered" } } },
        { id: "p1", name: "duplicate", progress: {} },
        { id: "p2", name: "   ", progress: {} },
      ],
    });

    assert.equal(state.profiles.length, 1);
    assert.equal(state.profiles[0].name, "Ada");
    assert.deepEqual(Object.keys(state.profiles[0].progress), ["mt_ok"]);
    assert.deepEqual(state.profiles[0].activities, []);
  });

  it("sanitizes stored play observations to bounded numeric facts", () => {
    const state = sanitizeState({
      activeProfileId: "p1",
      profiles: [{
        id: "p1",
        name: "Ada",
        activities: [{
          id: "a1", topicId: "mt_count", action: "practiced", at: date.toISOString(),
          observation: { kind: "counting", objectKind: "private text", objectCount: 7, uniqueTaps: 99, revisitTaps: 800, answers: [6, "secret", 7], responseMs: 5000000 },
        }, {
          id: "a2", topicId: "mt_sort", action: "practiced", at: date.toISOString(),
          observation: { kind: "sorting", itemCount: 9, sortedCount: 9, incorrectAttempts: 2, privateText: "discard me" },
        }],
      }],
    });

    assert.deepEqual(state.profiles[0].activities[0].observation, {
      kind: "counting", objectKind: "object", objectCount: 7, uniqueTaps: 7,
      revisitTaps: 500, answers: [6, 7], responseMs: 3600000,
    });
    assert.deepEqual(state.profiles[0].activities[1].observation, {
      kind: "sorting", itemCount: 9, sortedCount: 9, incorrectAttempts: 2,
    });
  });
});
