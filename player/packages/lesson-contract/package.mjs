import { validate } from './contracts.mjs';
export const CONTRACT_VERSION = 1;
export function safePath(path) {
  return (
    typeof path === 'string' &&
    path.length < 240 &&
    !path.includes('\\') &&
    !path.includes('\0') &&
    !path.startsWith('/') &&
    path
      .split('/')
      .every(
        (p) =>
          p &&
          p !== '.' &&
          p !== '..' &&
          !/[. ]$/.test(p) &&
          !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p),
      ) &&
    !/[:?#%]/.test(path)
  );
}
const assert = (value, message) => {
  if (!value) throw Error(message);
};
export function validatePackage(manifest, teaching, experience) {
  assert(
    manifest?.format === 'marble-lesson' && manifest.contractVersion === 1,
    'Unsupported lesson contract',
  );
  assert(/^[a-z][a-z0-9-]{1,63}$/.test(manifest.id), 'Invalid lesson ID');
  assert(/^\d+\.\d+\.\d+$/.test(manifest.version), 'Use a numeric semantic package version');
  for (const key of ['title', 'description'])
    assert(
      typeof manifest[key] === 'string' && manifest[key].length > 0 && manifest[key].length < 600,
      'Invalid ' + key,
    );
  for (const key of ['entry', 'teaching', 'experience'])
    assert(safePath(manifest[key]), 'Invalid ' + key + ' path');
  assert(
    Array.isArray(manifest.capabilities) &&
      manifest.capabilities.every((c) => ['webgl', 'voice', 'tutor'].includes(c)),
    'Unsupported capability',
  );
  assert(
    teaching?.id === manifest.id && teaching.dialogue?.mode === 'adaptive-general',
    'Package needs adaptive teaching guidance',
  );
  assert(
    Array.isArray(teaching.learningGoals) && teaching.learningGoals.length > 0,
    'Missing learning goals',
  );
  assert(
    Array.isArray(teaching.dialogue.focuses) && teaching.dialogue.focuses.length > 0,
    'Missing teaching focuses',
  );
  const goals = new Set(teaching.learningGoals.map((g) => g.id));
  assert(goals.size === teaching.learningGoals.length, 'Duplicate learning goal');
  for (const f of teaching.dialogue.focuses)
    assert(
      f.goals?.every((id) => goals.has(id)),
      'Unknown focus goal',
    );
  assert(
    experience?.protocolVersion === 1 &&
      Array.isArray(experience.actions) &&
      experience.events &&
      experience.stateSchema,
    'Invalid experience descriptor',
  );
  const actions = new Set(experience.actions.map((a) => a.name));
  assert(actions.size === experience.actions.length, 'Duplicate action');
  for (const a of experience.actions)
    assert(
      /^[a-z][a-z0-9_]*$/.test(a.name) && a.inputSchema && typeof a.description === 'string',
      'Invalid action',
    );
  for (const e of [...(teaching.observationEvents ?? []), ...(teaching.evidenceEvents ?? [])])
    assert(experience.events[e], 'Unknown event: ' + e);
  for (const m of teaching.teaching ?? []) assert(actions.has(m.action), 'Unknown teaching action');
  assert(
    typeof teaching.tutorGuidance === 'string' && teaching.tutorGuidance.length < 16000,
    'Missing teaching guidance',
  );
  return { manifest, teaching, experience };
}
export function validateUpdate(descriptor, previous, update) {
  const s = update?.snapshot;
  assert(
    s && s.sessionId === previous.sessionId && s.releaseId === descriptor.releaseId,
    'Wrong lesson session',
  );
  assert(
    Number.isSafeInteger(s.revision) && s.revision > previous.revision,
    'Out-of-order snapshot',
  );
  validate(descriptor.stateSchema, s.state);
  assert(
    Array.isArray(s.availableActions) &&
      s.availableActions.every((n) => descriptor.actions.some((a) => a.name === n)),
    'Unknown available action',
  );
  assert(Array.isArray(update.events) && update.events.length <= 32, 'Invalid events');
  for (const e of update.events) {
    assert(
      e.revision === s.revision &&
        ['learner', 'agent', 'system'].includes(e.source) &&
        typeof e.id === 'string',
      'Invalid event envelope',
    );
    assert(descriptor.events[e.name], 'Unknown event');
    validate(descriptor.events[e.name], e.data);
  }
  return update;
}
export function publicView(view) {
  if (view === undefined || view === null) return {};
  assert(
    typeof view === 'object' && !Array.isArray(view) && JSON.stringify(view).length < 32000,
    'Invalid current view',
  );
  return structuredClone(view);
}
