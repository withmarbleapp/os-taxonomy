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

    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).version, 2);
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
});
