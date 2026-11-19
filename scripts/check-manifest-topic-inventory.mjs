// Authored topic inventory must be updated deliberately, not repaired by projection.
export function checkManifestTopicInventory(topics, manifest) {
  const errors = [];
  if (!Array.isArray(topics?.topics)) return ['topics: missing topic array'];
  const rows = topics.topics;
  if (topics.topicCount !== rows.length) errors.push('topics: topicCount does not match topic inventory');
  if (manifest?.counts?.topics !== rows.length) errors.push('manifest: topics count does not match topic inventory');
  const expected = new Map();
  for (const row of rows) {
    if (typeof row?.subject !== 'string' || !row.subject.length) {
      errors.push('topics: invalid subject in topic inventory');
      continue;
    }
    expected.set(row.subject, (expected.get(row.subject) ?? 0) + 1);
  }
  const declared = manifest?.counts?.topicsBySubject;
  if (!declared || typeof declared !== 'object' || Array.isArray(declared)) {
    errors.push('manifest: topicsBySubject must be an object');
  } else {
    const keys = new Set([...expected.keys(), ...Object.keys(declared)]);
    for (const key of keys) {
      if (!Object.hasOwn(declared, key) || !expected.has(key) || declared[key] !== expected.get(key)) {
        errors.push(`manifest: topicsBySubject mismatch for ${key}`);
      }
    }
  }
  return errors;
}
