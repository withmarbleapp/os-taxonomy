#!/usr/bin/env node
// Local derived artifacts only. No DB, private catalogue or wall-clock inputs.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { normalizeCurriculumAlignments, projectTopicCompatibility } from './check-curriculum-alignments.mjs';
import { checkTeachingResearch } from './check-teaching-research.mjs';

const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const names = ['curriculum-alignments.json', 'topics.json', 'curriculum-standards.json', 'teaching-research.json', 'manifest.json'];
const researchSchema = JSON.parse(readFileSync(new URL('../schema/teaching-research.schema.json', import.meta.url)));

export function generateAlignmentArtifacts(files) {
  const load = name => JSON.parse(files[name]);
  const topics = load('topics.json'), curriculumStandards = load('curriculum-standards.json');
  const context = { topics, curriculumStandards };
  const alignments = normalizeCurriculumAlignments(load('curriculum-alignments.json'), context);
  const projection = new Map(projectTopicCompatibility(alignments, context).topics.map(t => [t.id, t]));
  const nextTopics = { ...topics, topics: topics.topics.map(topic => ({ ...topic, ...projection.get(topic.id) })) };
  const output = { 'curriculum-alignments.json': json(alignments), 'topics.json': json(nextTopics) };
  const research = { ...load('teaching-research.json'), topicFileSha256: sha256(output['topics.json']) };
  const manifest = load('manifest.json');
  assert.equal(manifest.taxonomyVersion, topics.version, 'manifest taxonomy version mismatch');
  manifest.counts.curricula = curriculumStandards.curricula.length;
  manifest.counts.curriculumStandards = curriculumStandards.curricula.reduce((n,source)=>n+source.topics.length,0);
  manifest.codesOnlySources = [...(curriculumStandards.codesOnlySources ?? [])];
  manifest.files['curriculum-standards.json'] = {bytes:files['curriculum-standards.json'].length,sha256:sha256(files['curriculum-standards.json'])};
  manifest.counts.curriculumAlignments = alignments.alignments.length;
  manifest.counts.topicStandardLinks = nextTopics.topics.reduce((n, topic) => n + topic.standards.length, 0);
  // Only the binding changes: authored research, coverage and original timestamps
  // must remain valid as supplied. This is not a general research repair tool.
  manifest.teachingResearch.topicFileSha256 = research.topicFileSha256;
  const errors = checkTeachingResearch(research, { topics: nextTopics, topicsBytes: output['topics.json'], manifest, schema: researchSchema });
  assert.equal(errors.length, 0, errors.join('\n'));
  output['teaching-research.json'] = json(research);
  for (const [name, bytes] of Object.entries(output)) manifest.files[name] = { bytes: bytes.length, sha256: sha256(bytes) };
  output['manifest.json'] = json(manifest);
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { data: { type: 'string' }, write: { type: 'boolean', default: false } }, strict: true });
    const directory = resolve(values.data ?? fileURLToPath(new URL('../data', import.meta.url)));
    const files = Object.fromEntries(names.map(name => [name, readFileSync(resolve(directory, name))]));
    const output = generateAlignmentArtifacts(files);
    const changed = Object.keys(output).filter(name => !output[name].equals(files[name]));
    if (values.write) for (const name of changed) writeFileSync(resolve(directory, name), output[name]);
    else assert.equal(changed.length, 0, `Stale alignment artifacts: ${changed.join(', ')}. Run npm run alignments:generate.`);
    console.log(JSON.stringify({ valid: true, mode: values.write ? 'write' : 'check', changed }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
