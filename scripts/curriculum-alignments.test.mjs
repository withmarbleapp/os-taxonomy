import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { checkCurriculumAlignments, normalizeCurriculumAlignments, projectTopicCompatibility, checkTopicCompatibility, CurriculumAlignmentError } from './check-curriculum-alignments.mjs';

const fixtures = new URL('../fixtures/curriculum-alignments/', import.meta.url);
const load = name => JSON.parse(readFileSync(new URL(name, fixtures), 'utf8'));
const fresh = () => ({ document: load('input.json'), context: { topics: load('topics.json'), curriculumStandards: load('curriculum-standards.json') } });
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const run = (script, args = [], cwd = tmpdir()) => {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', cwd });
  assert.ifError(result.error);
  return result;
};

test('golden normalization/projection preserve national contexts and do not mutate inputs', () => {
  const { document, context } = freeze(fresh());
  assert.deepEqual(normalizeCurriculumAlignments(document, context), load('normalized.json'));
  assert.deepEqual(projectTopicCompatibility(document, context), load('projection.json'));
  assert.deepEqual(checkTopicCompatibility(document, context), []);
  // Same code S1 in different namespaces is deliberately not collapsed.
  assert.equal(projectTopicCompatibility(document, context).topics[1].standards.length, 3);
});

test('normalization is idempotent and independent of record/catalogue/topic/standard ordering', () => {
  const { document, context } = fresh();
  const expected = load('normalized.json');
  document.alignments.reverse().forEach(r => r.standards.reverse());
  context.topics.topics.reverse();
  context.curriculumStandards.curricula.reverse();
  assert.deepEqual(normalizeCurriculumAlignments(document, context), expected);
  assert.deepEqual(normalizeCurriculumAlignments(expected, context), expected);
  assert.deepEqual(projectTopicCompatibility(document, context), load('projection.json'));
});

test('region aliases normalize; distinct regions and Unicode case remain distinct', () => {
  for (const region of [undefined, null, '', '  ']) {
    const { document, context } = fresh();
    if (region === undefined) delete document.alignments[0].region;
    else document.alignments[0].region = region;
    assert.equal(Object.hasOwn(normalizeCurriculumAlignments(document, context).alignments[2], 'region'), false);
  }
  const { document, context } = fresh();
  document.alignments[1].region = ' Que\u0301bec ';
  document.alignments.push({ ...document.alignments[1], region: 'québec' });
  const normalized = normalizeCurriculumAlignments(document, context);
  assert.deepEqual(normalized.alignments.filter(r => r.country === 'CA').map(r => r.region), ['Québec', 'québec']);
  assert.deepEqual(checkTopicCompatibility(document, context), []);
});

const corruptions = [
  ['unknown topic', d => { d.alignments[0].topicId = 'mt_missing'; }, /unknown topic/],
  ['unresolved namespaced standard', d => { d.alignments[0].standards[0] = 'missing:S1'; }, /unresolved standard/],
  ['bare standard', d => { d.alignments[0].standards[0] = 'S1'; }, /pattern/],
  ['wrong national source', d => { d.alignments[0].standards[0] = 'us-math:S1'; }, /country mismatch/],
  ['duplicate standard', d => { d.alignments[0].standards.push(d.alignments[0].standards[0]); }, /duplicate standard/],
  ['duplicate context', d => { d.alignments.push({ ...d.alignments[1], region: 'Ontario' }); }, /duplicate or conflicting/],
  ['conflicting context', d => { d.alignments.push({ ...d.alignments[1], region: 'Ontario', ageRangeEnd: 15 }); }, /duplicate or conflicting/],
  ['null/omitted context collision', d => { const r = { ...d.alignments[0] }; delete r.region; d.alignments.push(r); }, /duplicate or conflicting/],
  ['Unicode context collision', d => { d.alignments[1].region = 'Québec'; d.alignments.push({ ...d.alignments[1], region: 'Que\u0301bec' }); }, /duplicate or conflicting/],
  ['reversed ages', d => { d.alignments[0].ageRangeStart = 10; }, /exceeds/],
  ['negative age', d => { d.alignments[0].ageRangeStart = -1; }, /minimum/],
  ['fractional age', d => { d.alignments[0].ageRangeStart = 7.5; }, /integer/],
  ['unsafe age', d => { d.alignments[0].ageRangeEnd = 2 ** 53; }, /maximum/],
  ['null age', d => { d.alignments[0].ageRangeEnd = null; }, /integer/],
  ['implicit age-only', d => { delete d.alignments[2].ageOnly; }, /ageOnly/],
  ['false age-only', d => { d.alignments[2].ageOnly = false; }, /must equal true/],
  ['age-only with links', d => { d.alignments[0].ageOnly = true; }, /ageOnly/],
  ['unknown field', d => { d.alignments[0].privateSourceText = 'must not pass through'; }, /unexpected property/],
  ['unknown envelope field', d => { d.privateSnapshot = {}; }, /unexpected property/],
  ['unsupported schema', d => { d.schemaVersion = 99; }, /must equal 1/],
  ['wrong version', d => { d.version = 'v2'; }, /version mismatch/],
  ['lowercase country', d => { d.alignments[0].country = 'gb'; }, /pattern/],
  ['region control character', d => { d.alignments[0].region = 'A\u0000B'; }, /control characters/],
  ['wrong count', (d, c) => { c.topics.topicCount++; }, /topicCount/],
  ['duplicate topic', (d, c) => { c.topics.topics.push(c.topics.topics[0]); c.topics.topicCount++; }, /duplicate topic/],
  ['duplicate source', (d, c) => { c.curriculumStandards.curricula.push(c.curriculumStandards.curricula[0]); c.curriculumStandards.curriculumCount++; }, /duplicate curriculum/],
  ['duplicate catalogue key', (d, c) => { const s = c.curriculumStandards.curricula[0]; s.topics.push(s.topics[0]); s.topicCount++; }, /duplicate catalogue/],
  ['wrong source count', (d, c) => { c.curriculumStandards.curriculumCount++; }, /curriculumCount/],
  ['wrong standard count', (d, c) => { c.curriculumStandards.curricula[0].topicCount++; }, /standard count/],
  ['key/code mismatch', (d, c) => { c.curriculumStandards.curricula[0].topics[0].code = 'S2'; }, /key\/code/],
  ['invalid source country', (d, c) => { c.curriculumStandards.curricula[0].country = 'Canada'; }, /non-canonical/],
  ['invalid source slug', (d, c) => { c.curriculumStandards.curricula[0].slug = 'bad:slug'; }, /invalid curriculum slug/],
];
for (const [name, corrupt, message] of corruptions) test(`rejects ${name}`, () => {
  const { document, context } = fresh();
  assert.deepEqual(checkCurriculumAlignments(document, context), []);
  corrupt(document, context);
  assert.match(checkCurriculumAlignments(document, context).join('\n'), message);
  assert.throws(() => normalizeCurriculumAlignments(document, context), CurriculumAlignmentError);
});

test('missing and malformed snapshots fail closed without nested traversal errors', () => {
  const { document, context } = fresh();
  for (const bad of [null, {}, [], { schemaVersion: 1, version: 'v1', alignments: [null] }]) {
    assert.ok(checkCurriculumAlignments(bad, context).length);
  }
  assert.ok(checkCurriculumAlignments(document).length);
  assert.ok(checkCurriculumAlignments(document, {}).length);
});

test('normalization is distinct from completeness checking; flat-field drift fails', () => {
  const { document, context } = fresh();
  document.alignments = [];
  assert.deepEqual(checkCurriculumAlignments(document, context), []);
  assert.ok(checkTopicCompatibility(document, context).length);
  for (const change of [t => t.standards.pop(), t => t.standards.push(t.standards[0]), t => t.ageRangeStart++, t => t.ageRangeEnd--]) {
    const pair = fresh();
    change(pair.context.topics.topics[0]);
    assert.ok(checkTopicCompatibility(pair.document, pair.context).length);
  }
});

test('CLI uses explicit inputs, returns golden previews and never modifies sources', () => {
  const cli = fileURLToPath(new URL('./curriculum-alignments.mjs', import.meta.url));
  const files = ['input.json', 'topics.json', 'curriculum-standards.json'].map(f => fileURLToPath(new URL(f, fixtures)));
  const before = files.map(f => readFileSync(f, 'utf8'));
  const args = ['--alignments', files[0], '--topics', files[1], '--curricula', files[2]];
  for (const [command, expected] of [['normalize', 'normalized.json'], ['project', 'projection.json']]) {
    const result = run(cli, [command, ...args]);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), load(expected));
  }
  const check = run(cli, ['check', ...args]);
  assert.equal(check.status, 0, check.stderr);
  assert.equal(JSON.parse(check.stdout).valid, true);
  for (const badArgs of [['check'], ['check', ...args, '--out', 'ignored.json'], ['check', '--alignments', '/no/such/file']]) {
    const result = run(cli, badArgs);
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /"valid":true/);
  }
  assert.deepEqual(files.map(f => readFileSync(f, 'utf8')), before);
});

// Complete synthetic snapshot: no private data or copies of the published dataset.
function snapshot(directory, includeAlignments, scoped = false) {
  const data = join(directory, 'data');
  mkdirSync(data);
  for (const part of ['schema', 'scripts']) cpSync(new URL(`../${part}`, import.meta.url), join(directory, part), { recursive: true });
  const { document, context } = fresh();
  if (scoped) {
    document.schemaVersion = 2;
    document.alignments = document.alignments.map(row => ({ ...row, scope: 'jurisdiction' }));
  }
  const manifest = { taxonomyVersion: 'v1', counts: { teachingResearch: 0 }, files: {} };
  const put = (name, value) => {
    const bytes = JSON.stringify(value, null, 2) + '\n';
    writeFileSync(join(data, name), bytes);
    manifest.files[name] = { sha256: createHash('sha256').update(bytes).digest('hex'), bytes: Buffer.byteLength(bytes) };
  };
  put('topics.json', context.topics);
  put('curriculum-standards.json', context.curriculumStandards);
  put('dependencies.json', { version: 'v1', edgeCount: 0, dependencies: [] });
  put('clusters.json', { version: 'v1', clusterCount: 1, clusters: [{ subject: 'English', domain: 'Synthetic fixtures', ageRangeStart: 4, summary: 'Invented summary.' }] });
  const research = {
    schemaVersion: 1, version: 'v1', exportedAt: '2026-11-03T00:00:00Z', topicFileSha256: manifest.files['topics.json'].sha256,
    recordCount: 0, coverage: { topicCount: 3, withResearch: 0, withoutResearch: 3, bySubject: { English: { topics: 3, withResearch: 0, withoutResearch: 3 } }, missingTopicIds: context.topics.topics.map(t => t.id).sort() }, notes: ['Synthetic snapshot.'], records: [],
  };
  manifest.teachingResearch = { schemaVersion: research.schemaVersion, exportedAt: research.exportedAt, topicFileSha256: research.topicFileSha256, coverage: research.coverage };
  put('teaching-research.json', research);
  if (includeAlignments) {
    put('curriculum-alignments.json', document);
    manifest.counts.curriculumAlignments = document.alignments.length;
  }
  return { manifest, document, put, validate() {
    writeFileSync(join(data, 'manifest.json'), JSON.stringify(manifest));
    return run(join(directory, 'scripts', 'validate.mjs'));
  } };
}

test('dataset validation distinguishes preparation mode from complete manifest-bound alignments', () => {
  for (const present of [false, true]) {
    const dir = mkdtempSync(join(tmpdir(), 'taxonomy-alignments-'));
    try {
      const fixture = snapshot(dir, present);
      const baseline = fixture.validate();
      assert.equal(baseline.status, 0, baseline.stderr);
      assert.match(baseline.stdout, present ? /Alignment contract: validated/ : /not supplied \(preparation mode\)/);
      if (present) {
        fixture.document.alignments.pop();
        fixture.put('curriculum-alignments.json', fixture.document);
        fixture.manifest.counts.curriculumAlignments--;
        const incomplete = fixture.validate();
        assert.equal(incomplete.status, 1);
        assert.match(incomplete.stderr, /disagrees/);
        assert.doesNotMatch(incomplete.stderr, /checksum mismatch|count mismatch/);
      }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
});

test('optional alignment file and manifest declarations must agree, including zero counts', () => {
  for (const present of [false, true]) for (const declaration of ['checksum', 'count']) {
    const dir = mkdtempSync(join(tmpdir(), 'taxonomy-alignments-manifest-'));
    try {
      const fixture = snapshot(dir, present);
      assert.equal(fixture.validate().status, 0);
      if (present) {
        if (declaration === 'checksum') delete fixture.manifest.files['curriculum-alignments.json'];
        else delete fixture.manifest.counts.curriculumAlignments;
      } else if (declaration === 'checksum') fixture.manifest.files['curriculum-alignments.json'] = { sha256: '0'.repeat(64), bytes: 0 };
      else fixture.manifest.counts.curriculumAlignments = 0;
      const result = fixture.validate();
      assert.equal(result.status, 1);
      assert.match(result.stderr, present ? /manifest missing curriculum-alignments.json checksum|manifest curriculumAlignments count mismatch/ : /manifest declares missing/);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
});

test('dataset validation accepts v2 and rejects scope corruption even with updated checksums/counts', () => {
  const dir = mkdtempSync(join(tmpdir(), 'taxonomy-alignments-v2-'));
  try {
    const fixture = snapshot(dir, true, true);
    const baseline = fixture.validate();
    assert.equal(baseline.status, 0, baseline.stderr);
    assert.match(baseline.stdout, /Alignment contract: validated/);
    fixture.document.alignments[0].scope = 'global';
    fixture.put('curriculum-alignments.json', fixture.document);
    const bad = fixture.validate();
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /allowed shape/);
    assert.doesNotMatch(bad.stderr, /checksum mismatch|count mismatch/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
