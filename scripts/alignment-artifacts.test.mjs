import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { generateAlignmentArtifacts } from './generate-alignment-artifacts.mjs';

const names = ['curriculum-alignments.json', 'topics.json', 'curriculum-standards.json', 'teaching-research.json', 'manifest.json'];
const fresh = () => Object.fromEntries(names.map(name => [name, readFileSync(new URL(`../data/${name}`, import.meta.url))]));
const load = (files, name) => JSON.parse(files[name]);
const encode = value => Buffer.from(JSON.stringify(value));

test('committed artifacts reproduce byte-for-byte without mutating inputs', () => {
  const files = fresh(), before = structuredClone(files);
  const output = generateAlignmentArtifacts(files);
  for (const [name, bytes] of Object.entries(output)) assert.deepEqual(bytes, files[name], name);
  for (const name of names) assert.deepEqual(files[name], Buffer.from(before[name]));
  assert.deepEqual(generateAlignmentArtifacts({ ...files, ...output }), output);
});

test('a public alignment edit refreshes only compatibility fields and bindings', () => {
  const files = fresh(), document = load(files, 'curriculum-alignments.json');
  const row = document.alignments.find(r => r.standards.length > 0);
  const topicId = row.topicId, key = row.standards[0];
  for (const context of document.alignments.filter(r => r.topicId === topicId)) {
    context.standards = context.standards.filter(k => k !== key);
    if (!context.standards.length) context.ageOnly = true;
  }
  files['curriculum-alignments.json'] = encode(document);
  const output = generateAlignmentArtifacts(files), topics = load(output, 'topics.json');
  const original = load(files, 'topics.json');
  assert.deepEqual(topics, { ...original, topics: original.topics.map(t => t.id === topicId ? { ...t, standards: t.standards.filter(k => k !== key) } : t) });
  const research = load(output, 'teaching-research.json'), oldResearch = load(files, 'teaching-research.json');
  assert.deepEqual(research, { ...oldResearch, topicFileSha256: createHash('sha256').update(output['topics.json']).digest('hex') });
  const manifest = load(output, 'manifest.json');
  assert.equal(manifest.generatedAt, load(files, 'manifest.json').generatedAt);
  assert.equal(manifest.counts.topicStandardLinks, load(files, 'manifest.json').counts.topicStandardLinks - 1);
  for (const [name, bytes] of Object.entries(output).filter(([name]) => name !== 'manifest.json')) {
    assert.deepEqual(manifest.files[name], { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
});

test('unresolved alignments and invalid research coverage cannot be regenerated into success', () => {
  const files = fresh(), document = load(files, 'curriculum-alignments.json');
  document.alignments.find(r => r.standards.length).standards.push('missing:standard');
  assert.throws(() => generateAlignmentArtifacts({ ...files, 'curriculum-alignments.json': encode(document) }), /unresolved standard/);
  const research = load(files, 'teaching-research.json');
  research.coverage.missingTopicIds = [];
  assert.throws(() => generateAlignmentArtifacts({ ...files, 'teaching-research.json': encode(research) }), /coverage mismatch|missing-topic list/);
});

test('CLI detects stale artifacts without writing; explicit write reproduces the checked result', t => {
  const directory = mkdtempSync(join(tmpdir(), 'alignment-artifacts-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const files = fresh(), topics = load(files, 'topics.json');
  topics.topics.find(topic => topic.standards.length > 0).standards = [];
  files['topics.json'] = encode(topics);
  for (const [name, bytes] of Object.entries(files)) writeFileSync(join(directory, name), bytes);
  const script = fileURLToPath(new URL('./generate-alignment-artifacts.mjs', import.meta.url));
  const run = args => {
    const result = spawnSync(process.execPath, [script, '--data', directory, ...args], { encoding: 'utf8' });
    assert.ifError(result.error); return result;
  };
  assert.equal(run([]).status, 1);
  for (const name of names) assert.deepEqual(readFileSync(join(directory, name)), files[name]);
  assert.equal(run(['--write']).status, 0);
  assert.equal(run([]).status, 0);
});

test('catalogue-only NCERT additions refresh source counts and hashes without changing topics or research',()=>{
  const files=fresh(),catalogue=load(files,'curriculum-standards.json'),source=catalogue.curricula.find(c=>c.slug==='ncert-fs-2025');
  assert.equal(source.topicCount,source.topics.length);
  // Invented fixture identifier, independent of the growing official catalogue.
  const code='SYNTHETIC-GENERATOR-ADDITION';
  assert.ok(!source.topics.some(row=>row.code===code));
  source.topics.push({key:`${source.slug}:${code}`,code});source.topicCount++;files['curriculum-standards.json']=encode(catalogue);
  const output=generateAlignmentArtifacts(files),manifest=load(output,'manifest.json');
  assert.equal(manifest.counts.curricula,catalogue.curricula.length);assert.equal(manifest.counts.curriculumStandards,catalogue.curricula.reduce((n,c)=>n+c.topics.length,0));
  assert.deepEqual(manifest.codesOnlySources,catalogue.codesOnlySources);assert.deepEqual(manifest.files['curriculum-standards.json'],{bytes:files['curriculum-standards.json'].length,sha256:createHash('sha256').update(files['curriculum-standards.json']).digest('hex')});
  for(const name of ['topics.json','curriculum-alignments.json','teaching-research.json'])assert.deepEqual(output[name],files[name]);
});
