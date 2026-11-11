import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkManifestTopicInventory } from './check-manifest-topic-inventory.mjs';
import { generateAlignmentArtifacts } from './generate-alignment-artifacts.mjs';

const fixture = () => ({
  topics: { topicCount: 3, topics: [{ subject: 'Geography' }, { subject: 'History' }, { subject: 'Geography' }] },
  manifest: { counts: { topics: 3, topicsBySubject: { History: 1, Geography: 2 } } },
});

test('topic inventory uses exact dynamic counts and ignores subject property order', () => {
  const { topics, manifest } = fixture();
  assert.deepEqual(checkManifestTopicInventory(topics, manifest), []);
  topics.topics.push({ subject: 'A future subject' });
  topics.topicCount++;
  manifest.counts.topics++;
  manifest.counts.topicsBySubject['A future subject'] = 1;
  assert.deepEqual(checkManifestTopicInventory(topics, manifest), []);
});

for (const [name, mutate] of Object.entries({
  'stale total': ({ manifest }) => { manifest.counts.topics--; },
  'stale subject count with correct total': ({ manifest }) => { manifest.counts.topicsBySubject.Geography--; },
  'missing subject': ({ manifest }) => { delete manifest.counts.topicsBySubject.History; },
  'extra subject': ({ manifest }) => { manifest.counts.topicsBySubject.Unknown = 0; },
  'non-object subjects': ({ manifest }) => { manifest.counts.topicsBySubject = []; },
  'null subjects': ({ manifest }) => { manifest.counts.topicsBySubject = null; },
  'string count': ({ manifest }) => { manifest.counts.topicsBySubject.Geography = '2'; },
  'stale topic document count': ({ topics }) => { topics.topicCount--; },
  'invalid subject': ({ topics }) => { topics.topics[0].subject = null; },
})) {
  test(`topic inventory rejects ${name}`, () => {
    const value = fixture(); mutate(value);
    assert.ok(checkManifestTopicInventory(value.topics, value.manifest).length > 0);
  });
}

test('generator refuses stale manifest inventory instead of silently repairing it', () => {
  const names = ['curriculum-alignments.json', 'topics.json', 'curriculum-standards.json', 'teaching-research.json', 'manifest.json'];
  const files = Object.fromEntries(names.map(name => [name, readFileSync(new URL(`../data/${name}`, import.meta.url))]));
  const original = JSON.parse(files['manifest.json']);
  for (const mutate of [m => { m.counts.topics--; }, m => { delete m.counts.topicsBySubject.Geography; }]) {
    const manifest = structuredClone(original); mutate(manifest);
    assert.throws(() => generateAlignmentArtifacts({ ...files, 'manifest.json': Buffer.from(JSON.stringify(manifest)) }), /manifest: .*topic/i);
  }
});
