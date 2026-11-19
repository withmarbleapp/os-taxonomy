import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { checkCurriculumAlignments, normalizeCurriculumAlignments, projectTopicCompatibility, checkTopicCompatibility, CurriculumAlignmentError } from './check-curriculum-alignments.mjs';

const directory = new URL('../fixtures/curriculum-alignments-v2/', import.meta.url);
const load = name => JSON.parse(readFileSync(new URL(name, directory), 'utf8'));
const fresh = () => ({ document: load('input.json'), context: { topics: load('topics.json'), curriculumStandards: load('curriculum-standards.json') } });
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

test('v2 golden outputs retain global guidance, framework and jurisdiction age associations without mutation', () => {
  const { document, context } = freeze(fresh());
  assert.deepEqual(normalizeCurriculumAlignments(document, context), load('normalized.json'));
  assert.deepEqual(projectTopicCompatibility(document, context), load('projection.json'));
  assert.deepEqual(checkTopicCompatibility(document, context), []);
  const gb = normalizeCurriculumAlignments(document, context).alignments.filter(r => r.country === 'GB');
  assert.deepEqual(gb.map(r => [r.ageRangeStart, r.ageRangeEnd, r.standards]), [[5, 6, ['gb-lang:S2']], [7, 9, ['gb-lang:S1']]]);
});

test('v2 ordering is stable under permutations and normalization is idempotent', () => {
  const { document, context } = fresh();
  document.alignments.reverse().forEach(row => row.standards.reverse());
  context.topics.topics.reverse(); context.curriculumStandards.curricula.reverse();
  assert.deepEqual(normalizeCurriculumAlignments(document, context), load('normalized.json'));
  assert.deepEqual(normalizeCurriculumAlignments(load('normalized.json'), context), load('normalized.json'));
});

test('global and framework records coexist even with exactly the same ages', () => {
  const { document, context } = fresh();
  const global = document.alignments.find(r => r.scope === 'global');
  global.ageRangeStart = 8; global.ageRangeEnd = 9;
  const rows = normalizeCurriculumAlignments(document, context).alignments.filter(r => r.topicId === global.topicId && r.ageRangeStart === 8 && r.ageRangeEnd === 9);
  assert.deepEqual(rows.map(r => r.scope), ['framework', 'global']);
  assert.deepEqual(rows.map(r => r.standards), [['global-learning:S1'], []]);
});

test('disjoint age intervals survive even when the same standard appears in both', () => {
  const { document, context } = fresh();
  document.alignments = [
    { topicId: 'mt_shared', scope: 'jurisdiction', country: 'GB', ageRangeStart: 5, ageRangeEnd: 6, standards: ['gb-lang:S1'] },
    { topicId: 'mt_shared', scope: 'jurisdiction', country: 'GB', ageRangeStart: 9, ageRangeEnd: 10, standards: ['gb-lang:S1'] },
  ];
  const normalized = normalizeCurriculumAlignments(document, context);
  assert.equal(normalized.alignments.length, 2);
  assert.deepEqual(normalized.alignments.map(r => [r.ageRangeStart, r.ageRangeEnd]), [[5, 6], [9, 10]]);
  const topic = projectTopicCompatibility(document, context).topics.find(t => t.id === 'mt_shared');
  assert.deepEqual(topic, { id: 'mt_shared', standards: ['gb-lang:S1'], ageRangeStart: 5, ageRangeEnd: 10 });
  // Flat bounds are intentionally lossy; consumers must use the authored intervals.
  assert.ok(checkTopicCompatibility(document, context).length);
});

test('framework scope can identify an intentional age-only association without claiming coverage', () => {
  const { document, context } = fresh();
  const row = document.alignments.find(r => r.scope === 'framework');
  row.standards = []; row.ageOnly = true;
  const normalized = normalizeCurriculumAlignments(document, context);
  assert.equal(normalized.alignments.find(r => r.scope === 'framework').ageOnly, true);
  assert.ok(checkTopicCompatibility(document, context).length);
});

const corruptions = [
  ['missing scope', d => { delete d.alignments[0].scope; }, /allowed shape/],
  ['unknown scope', d => { d.alignments[0].scope = 'difficulty'; }, /allowed shape/],
  ['legacy UNIVERSAL country', d => { d.alignments[0].country = 'UNIVERSAL'; }, /allowed shape/],
  ['International used as a jurisdiction', d => { d.alignments[0].country = 'International'; }, /allowed shape/],
  ['missing jurisdiction country', d => { delete d.alignments[0].country; }, /allowed shape/],
  ['global country field', d => { d.alignments[1].country = 'CA'; }, /allowed shape/],
  ['global region field', d => { d.alignments[1].region = 'Universal'; }, /allowed shape/],
  ['global framework field', d => { d.alignments[1].framework = 'global-learning'; }, /allowed shape/],
  ['global standard link', d => { d.alignments[1].standards = ['global-learning:S1']; delete d.alignments[1].ageOnly; }, /allowed shape/],
  ['global missing age-only marker', d => { delete d.alignments[1].ageOnly; }, /allowed shape/],
  ['framework country field', d => { d.alignments[3].country = 'IB'; }, /allowed shape/],
  ['framework region field', d => { d.alignments[3].region = 'IB PYP'; }, /allowed shape/],
  ['unknown framework', d => { d.alignments[3].framework = 'missing'; }, /unknown framework/],
  ['national source as framework', d => { d.alignments[3].framework = 'ca-lang'; d.alignments[3].standards = ['ca-lang:S1']; }, /International catalogue/],
  ['foreign framework standard', d => { d.alignments[3].standards = ['ca-lang:S1']; }, /framework mismatch/],
  ['national jurisdiction mismatch', d => { d.alignments[0].standards = ['gb-lang:S1']; }, /country mismatch/],
  ['unknown namespaced standard', d => { d.alignments[3].standards = ['global-learning:missing']; }, /unresolved standard/],
  ['bare code', d => { d.alignments[3].standards = ['S1']; }, /allowed shape/],
  ['duplicate standard', d => { d.alignments[3].standards.push(d.alignments[3].standards[0]); }, /duplicate standard/],
  ['duplicate global interval', d => { d.alignments.push({ ...d.alignments[1] }); }, /duplicate or conflicting/],
  ['duplicate framework interval', d => { d.alignments.push({ ...d.alignments[3] }); }, /duplicate or conflicting/],
  ['conflicting same jurisdiction interval', d => { d.alignments.push({ ...d.alignments[2], region: '', standards: ['global-learning:S1'] }); }, /duplicate or conflicting/],
  ['implicit empty framework mapping', d => { d.alignments[3].standards = []; }, /ageOnly/],
  ['unsafe age', d => { d.alignments[0].ageRangeEnd = 2 ** 53; }, /allowed shape/],
  ['reversed ages', d => { d.alignments[0].ageRangeStart = 13; }, /exceeds/],
  ['private field', d => { d.alignments[3].privateSourceText = 'must fail'; }, /allowed shape/],
];
for (const [name, corrupt, message] of corruptions) test(`v2 rejects ${name}`, () => {
  const { document, context } = fresh();
  assert.deepEqual(checkCurriculumAlignments(document, context), []);
  corrupt(document, context);
  assert.match(checkCurriculumAlignments(document, context).join('\n'), message);
  assert.throws(() => normalizeCurriculumAlignments(document, context), CurriculumAlignmentError);
});

test('a framework row cannot link another International source even though countries match', () => {
  const { document, context } = fresh();
  context.curriculumStandards.curricula.push({ slug: 'second-global', country: 'International', name: 'Another invented framework', version: 'synthetic-1', textIncluded: false, topicCount: 1, topics: [{ code: 'S1', key: 'second-global:S1' }] });
  context.curriculumStandards.curriculumCount++;
  document.alignments[3].standards = ['second-global:S1'];
  assert.match(checkCurriculumAlignments(document, context).join('\n'), /framework mismatch/);
});

test('v1 is not upgraded or reinterpreted implicitly', () => {
  const v1dir = new URL('../fixtures/curriculum-alignments/', import.meta.url);
  const document = JSON.parse(readFileSync(new URL('input.json', v1dir), 'utf8'));
  const { context } = fresh();
  assert.equal(normalizeCurriculumAlignments(document, context).schemaVersion, 1);
  document.alignments[0].scope = 'jurisdiction';
  assert.match(checkCurriculumAlignments(document, context).join('\n'), /unexpected property scope/);
});

test('CLI reports v2 honestly and emits golden read-only previews', () => {
  const cli = fileURLToPath(new URL('./curriculum-alignments.mjs', import.meta.url));
  const names = ['input.json', 'topics.json', 'curriculum-standards.json'];
  const files = names.map(n => fileURLToPath(new URL(n, directory)));
  const before = files.map(f => readFileSync(f, 'utf8'));
  const args = ['--alignments', files[0], '--topics', files[1], '--curricula', files[2]];
  for (const [command, golden] of [['check', null], ['normalize', 'normalized.json'], ['project', 'projection.json']]) {
    const result = spawnSync(process.execPath, [cli, command, ...args], { cwd: tmpdir(), encoding: 'utf8' });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    if (golden) assert.deepEqual(JSON.parse(result.stdout), load(golden));
    else assert.equal(JSON.parse(result.stdout).schemaVersion, 2);
  }
  assert.deepEqual(files.map(f => readFileSync(f, 'utf8')), before);
});
