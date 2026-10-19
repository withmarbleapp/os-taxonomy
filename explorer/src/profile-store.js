export const STORAGE_KEY = "marble-taxonomy:learner-profiles";
export const STORAGE_VERSION = 3;
export const PROGRESS_STATUSES = new Set(["learning", "practiced", "mastered"]);
export const ACTIVITY_ACTIONS = new Set(["learning", "practiced", "mastered", "assessed", "cleared"]);
const ACTIVITY_LIMIT = 500;

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function cleanName(name) {
  return String(name ?? "").trim().slice(0, 60);
}

export function createEmptyState() {
  return { version: STORAGE_VERSION, activeProfileId: null, profiles: [] };
}

function sanitizeAssessment(value) {
  if (!value || typeof value !== "object" || value.verified !== true) return undefined;
  return {
    verified: true,
    evidence: Array.isArray(value.evidence) ? value.evidence.filter(Number.isInteger) : [],
    assessedAt: typeof value.assessedAt === "string" ? value.assessedAt : new Date(0).toISOString(),
  };
}

function sanitizeObservation(value) {
  if (!value || typeof value !== "object") return undefined;
  if (value.kind === "sorting") {
    const itemCount = Number.isInteger(value.itemCount) ? Math.min(100, Math.max(1, value.itemCount)) : null;
    const sortedCount = Number.isInteger(value.sortedCount) ? Math.min(itemCount ?? 0, Math.max(0, value.sortedCount)) : null;
    if (itemCount === null || sortedCount === null) return undefined;
    const incorrectAttempts = Number.isInteger(value.incorrectAttempts) ? Math.min(500, Math.max(0, value.incorrectAttempts)) : 0;
    return { kind: "sorting", itemCount, sortedCount, incorrectAttempts };
  }
  if (value.kind !== "counting") return undefined;
  const objectCount = Number.isInteger(value.objectCount) ? Math.min(30, Math.max(1, value.objectCount)) : null;
  const uniqueTaps = Number.isInteger(value.uniqueTaps) ? Math.min(objectCount ?? 0, Math.max(0, value.uniqueTaps)) : null;
  if (objectCount === null || uniqueTaps === null) return undefined;
  const objectKind = ["car", "apple", "object"].includes(value.objectKind) ? value.objectKind : "object";
  const answers = Array.isArray(value.answers)
    ? value.answers.filter((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 30).slice(0, 20)
    : [];
  const revisitTaps = Number.isInteger(value.revisitTaps) ? Math.min(500, Math.max(0, value.revisitTaps)) : 0;
  const responseMs = Number.isInteger(value.responseMs) ? Math.min(3_600_000, Math.max(0, value.responseMs)) : null;
  return { kind: "counting", objectKind, objectCount, uniqueTaps, revisitTaps, answers, responseMs };
}

function sanitizeActivities(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((activity) =>
      activity &&
      typeof activity.id === "string" &&
      typeof activity.topicId === "string" &&
      activity.topicId.startsWith("mt_") &&
      ACTIVITY_ACTIONS.has(activity.action) &&
      typeof activity.at === "string",
    )
    .slice(-ACTIVITY_LIMIT)
    .map(({ id, topicId, action, at, observation }) => {
      const safeObservation = sanitizeObservation(observation);
      return { id, topicId, action, at, ...(safeObservation ? { observation: safeObservation } : {}) };
    });
}

export function sanitizeState(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.profiles)) return createEmptyState();

  const ids = new Set();
  const profiles = [];
  for (const candidate of value.profiles) {
    const id = typeof candidate?.id === "string" && candidate.id ? candidate.id : makeId();
    const name = cleanName(candidate?.name);
    if (!name || ids.has(id)) continue;
    ids.add(id);

    const progress = {};
    if (candidate.progress && typeof candidate.progress === "object") {
      for (const [topicId, entry] of Object.entries(candidate.progress)) {
        if (!topicId.startsWith("mt_") || !PROGRESS_STATUSES.has(entry?.status)) continue;
        const assessment = entry.status === "mastered" ? sanitizeAssessment(entry.assessment) : undefined;
        progress[topicId] = {
          status: entry.status,
          updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date(0).toISOString(),
          ...(assessment ? { assessment } : {}),
        };
      }
    }

    profiles.push({
      id,
      name,
      createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date(0).toISOString(),
      updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date(0).toISOString(),
      progress,
      activities: sanitizeActivities(candidate.activities),
    });
  }

  const requestedActiveId = typeof value.activeProfileId === "string" ? value.activeProfileId : null;
  return {
    version: STORAGE_VERSION,
    activeProfileId: profiles.some(({ id }) => id === requestedActiveId) ? requestedActiveId : profiles[0]?.id ?? null,
    profiles,
  };
}

export class ProfileStore {
  #storage;
  #now;
  #listeners = new Set();
  #state;

  constructor(storage = globalThis.localStorage, now = () => new Date()) {
    this.#storage = storage;
    this.#now = now;
    this.#state = this.#read();
  }

  #read() {
    try {
      return sanitizeState(JSON.parse(this.#storage.getItem(STORAGE_KEY) || "null"));
    } catch {
      return createEmptyState();
    }
  }

  #commit(nextState) {
    this.#state = sanitizeState(nextState);
    this.#storage.setItem(STORAGE_KEY, JSON.stringify(this.#state));
    for (const listener of this.#listeners) listener(this.state);
    return this.state;
  }

  get state() {
    return structuredClone(this.#state);
  }

  get activeProfile() {
    const profile = this.#state.profiles.find(({ id }) => id === this.#state.activeProfileId);
    return profile ? structuredClone(profile) : null;
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  reload() {
    this.#state = this.#read();
    for (const listener of this.#listeners) listener(this.state);
  }

  addProfile(name) {
    const cleanedName = cleanName(name);
    if (!cleanedName) throw new Error("Please enter a name.");
    const timestamp = this.#now().toISOString();
    const profile = { id: makeId(), name: cleanedName, createdAt: timestamp, updatedAt: timestamp, progress: {}, activities: [] };
    return this.#commit({ ...this.#state, activeProfileId: profile.id, profiles: [...this.#state.profiles, profile] });
  }

  setActive(profileId) {
    if (!this.#state.profiles.some(({ id }) => id === profileId)) return this.state;
    return this.#commit({ ...this.#state, activeProfileId: profileId });
  }

  renameActive(name) {
    const cleanedName = cleanName(name);
    if (!cleanedName) throw new Error("Please enter a name.");
    const timestamp = this.#now().toISOString();
    return this.#commit({
      ...this.#state,
      profiles: this.#state.profiles.map((profile) =>
        profile.id === this.#state.activeProfileId ? { ...profile, name: cleanedName, updatedAt: timestamp } : profile,
      ),
    });
  }

  deleteActive() {
    const profiles = this.#state.profiles.filter(({ id }) => id !== this.#state.activeProfileId);
    return this.#commit({ ...this.#state, profiles, activeProfileId: profiles[0]?.id ?? null });
  }

  setProgress(topicId, status, { evidence = [], verified = false, observation } = {}) {
    if (!this.#state.activeProfileId) throw new Error("Create a child profile first.");
    if (!topicId.startsWith("mt_")) throw new Error("Invalid topic identifier.");
    if (status !== null && !PROGRESS_STATUSES.has(status)) throw new Error("Invalid progress status.");

    const activeProfile = this.#state.profiles.find(({ id }) => id === this.#state.activeProfileId);
    const previous = activeProfile?.progress[topicId];
    if (!verified && (previous?.status ?? null) === status && status !== "practiced") return this.state;

    const timestamp = this.#now().toISOString();
    const action = verified ? "assessed" : status === "learning" ? "learning" : status === "practiced" ? "practiced" : status === "mastered" ? "mastered" : "cleared";
    const safeObservation = sanitizeObservation(observation);
    return this.#commit({
      ...this.#state,
      profiles: this.#state.profiles.map((profile) => {
        if (profile.id !== this.#state.activeProfileId) return profile;
        const progress = { ...profile.progress };
        if (status === null) {
          delete progress[topicId];
        } else {
          const existingAssessment = progress[topicId]?.status === status ? progress[topicId].assessment : undefined;
          progress[topicId] = {
            status,
            updatedAt: timestamp,
            ...(verified
              ? { assessment: { verified: true, evidence: [...new Set(evidence.filter(Number.isInteger))], assessedAt: timestamp } }
              : existingAssessment ? { assessment: existingAssessment } : {}),
          };
        }
        const activities = [
          ...profile.activities,
          {
            id: makeId(), topicId, action, at: timestamp,
            ...(safeObservation ? { observation: safeObservation } : {}),
          },
        ].slice(-ACTIVITY_LIMIT);
        return { ...profile, progress, activities, updatedAt: timestamp };
      }),
    });
  }

  recordPractice(topicId, observation) {
    if (!this.#state.activeProfileId) throw new Error("Create a child profile first.");
    if (!topicId.startsWith("mt_")) throw new Error("Invalid topic identifier.");
    const timestamp = this.#now().toISOString();
    const safeObservation = sanitizeObservation(observation);
    return this.#commit({
      ...this.#state,
      profiles: this.#state.profiles.map((profile) => profile.id !== this.#state.activeProfileId ? profile : {
        ...profile,
        activities: [
          ...profile.activities,
          { id: makeId(), topicId, action: "practiced", at: timestamp, ...(safeObservation ? { observation: safeObservation } : {}) },
        ].slice(-ACTIVITY_LIMIT),
        updatedAt: timestamp,
      }),
    });
  }

  resetActiveProgress() {
    if (!this.#state.activeProfileId) return this.state;
    const timestamp = this.#now().toISOString();
    return this.#commit({
      ...this.#state,
      profiles: this.#state.profiles.map((profile) =>
        profile.id === this.#state.activeProfileId ? { ...profile, progress: {}, activities: [], updatedAt: timestamp } : profile,
      ),
    });
  }
}
