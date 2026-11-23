import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse, source } from './nios-obe-a.mjs';

const catalogue = JSON.parse(readFileSync(new URL('../data/curriculum-standards.json', import.meta.url)));
const alignments = JSON.parse(readFileSync(new URL('../data/curriculum-alignments.json', import.meta.url)));
const published = catalogue.curricula.find(c => c.slug === 'nios-obe-a');

test('nios-obe-a holds 49 unique records in three courses', () => {
  assert.equal(published.topicCount, 49);
  assert.equal(new Set(published.topics.map(t => t.key)).size, 49);
  const perCourse = Object.groupBy(published.topics, t => t.data.courseCode);
  assert.deepEqual(Object.entries(perCourse).map(([k, v]) => [k, v.length]), [['A-102', 36], ['A-103', 7], ['A-104', 6]]);
  for (const t of published.topics) assert.ok(t.data.title && t.data.description, t.code);
});

test('nios-obe-a metadata matches the generator', () => {
  assert.deepEqual(published, source(published.topics));
});

test('nios-obe-a is standards only', () => {
  assert.equal(alignments.alignments.filter(a => a.standards.some(s => s.startsWith('nios-obe-a:'))).length, 0);
});

test('parser keeps wording, joins wrapped lines and skips other sections', () => {
  const text = `Environmental Study (A-102)\n3. Objectives:\n 1. Not a record\n6. Course Description-\nLesson-5: Conservation of Environ\n i. Useful Animals- Milch cattle,\n Pet Animals.\nii. Main parts\n7. Scheme of studies-\n 1. Not a record\nMathematics (A-103)\n4. Course Description\n Lesson-5: Fractions\n To understand use\n of fractions.\n5. Scheme of studies-`;
  assert.deepEqual(parse(text).map(r => [r.code, r.data.description]), [
    ['A102.L5.1', 'Useful Animals- Milch cattle, Pet Animals.'],
    ['A102.L5.2', 'Main parts'],
    ['A103.L5', 'To understand use of fractions.'],
  ]);
});
