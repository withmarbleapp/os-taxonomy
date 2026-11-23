#!/usr/bin/env node
// Rebuild the `nios-obe-a` source from the official NIOS PDF.
//   curl -sSLo Aleveleng.pdf https://nios.ac.in/media/documents/Aleveleng.pdf
//   node scripts/nios-obe-a.mjs Aleveleng.pdf          # check against the data
//   node scripts/nios-obe-a.mjs Aleveleng.pdf --write  # then: npm run alignments:generate
// Needs `pdftotext` (Poppler). Descriptions are the source wording; only
// whitespace is normalized.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const SOURCE_SHA256 = '4ca3178f94bb45d07cf6cbc8ce6d021d0546ef2dd40981cab480385e2f51a295';
const SLUG = 'nios-obe-a';
const clean = text => text.replace(/\s+/g, ' ').trim();
// Roman numerals are used only in A-102 lesson 5; numbers elsewhere.
const ITEM = /^\s*(?:(\d+)|(i{1,3}))\.\s+(.*)$/;

export function parse(text) {
  const records = [];
  let course = null, lesson = null, item = null, inDescription = false;
  for (const line of text.replace(/\f/g, '\n').split('\n')) {
    const courseMatch = line.match(/^\s*(\S.*?)\s*\((A-\d{3})\)\s*$/);
    if (courseMatch) { course = { name: courseMatch[1], code: courseMatch[2] }; inDescription = false; lesson = item = null; continue; }
    if (/^\s*\d\.\s*Course Description/.test(line)) { inDescription = true; continue; }
    if (/^\s*\d\.\s*Scheme of stud/i.test(line)) { inDescription = false; continue; }
    if (!course || !inDescription || !line.trim()) continue;
    const lessonMatch = line.match(/^\s*Lesson\s*-\s*(\d+):\s*(.*)$/);
    if (lessonMatch) { lesson = { number: Number(lessonMatch[1]), title: clean(lessonMatch[2]) }; item = null; continue; }
    assert(lesson, `text outside a lesson: ${line}`);
    const itemMatch = course.code === 'A-102' && line.match(ITEM);
    if (itemMatch || !item) {
      assert(itemMatch || course.code !== 'A-102', `unnumbered A-102 text: ${line}`);
      const number = itemMatch ? Number(itemMatch[1] ?? itemMatch[2].length) : null;
      const base = `${course.code.replace('-', '')}.L${lesson.number}`;
      item = {
        code: number ? `${base}.${number}` : base,
        data: { title: '', course: course.name, courseCode: course.code, level: 'A', lesson: `Lesson ${lesson.number}: ${lesson.title}`, description: itemMatch ? itemMatch[3] : line },
      };
      records.push(item);
    } else {
      item.data.description += ' ' + line;
    }
    item.data.description = clean(item.data.description);
  }
  for (const r of records) {
    // Whole-lesson records use the lesson heading; A-102 items are their own title.
    r.data.title = r.data.courseCode === 'A-102' ? r.data.description : r.data.lesson.replace(/^Lesson \d+: /, '');
  }
  return records.map(r => ({ key: `${SLUG}:${r.code}`, code: r.code, data: r.data }));
}

export function source(topics) {
  return {
    slug: SLUG, country: 'IN',
    name: "NIOS Open Basic Education (Adult) — Level 'A'",
    version: 'English course curriculum PDF, file dated 12 April 2017; courses A-102, A-103 and A-104',
    sourceUrl: 'https://nios.ac.in/media/documents/Aleveleng.pdf',
    textIncluded: true,
    license: 'NIOS Copyright Statement: free reproduction if accurate, not misleading, and the source is prominently acknowledged. Not relicensed under ODbL. See PROVENANCE.md.',
    topicCount: topics.length, topics,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pdf = process.argv[2];
  assert(pdf, 'usage: node scripts/nios-obe-a.mjs <Aleveleng.pdf> [--write]');
  assert.equal(createHash('sha256').update(readFileSync(pdf)).digest('hex'), SOURCE_SHA256, 'PDF differs from the reviewed snapshot');
  const built = source(parse(execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' })));
  const path = fileURLToPath(new URL('../data/curriculum-standards.json', import.meta.url));
  const catalogue = JSON.parse(readFileSync(path, 'utf8'));
  const at = catalogue.curricula.findIndex(c => c.slug === SLUG);
  if (process.argv.includes('--write')) {
    if (at < 0) catalogue.curricula.push(built); else catalogue.curricula[at] = built;
    catalogue.curriculumCount = catalogue.curricula.length;
    writeFileSync(path, JSON.stringify(catalogue, null, 2) + '\n');
  } else {
    assert.deepEqual(catalogue.curricula[at], built, 'data differs from the PDF');
  }
  console.log(`${built.topicCount} records`);
}
