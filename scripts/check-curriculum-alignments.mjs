// Public, dependency-free preparation contract. No DB access or data-file writes.
import { readFileSync } from 'node:fs';
import { checkSchema } from './check-schema.mjs';
const schema = name => JSON.parse(readFileSync(new URL(`../schema/${name}.schema.json`, import.meta.url), 'utf8'));
const alignmentSchema = schema('curriculum-alignments');
const topicsSchema = schema('topics');
const curriculaSchema = schema('curriculum-standards');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const countryPattern = /^(?:[A-Z]{2}|International)$/;

export class CurriculumAlignmentError extends Error {
  constructor(errors) {
    super(`Invalid curriculum alignments:\n${errors.map(e => `  - ${e}`).join('\n')}`);
    this.name = 'CurriculumAlignmentError';
    this.errors = errors;
  }
}

function prepare(document, { topics, curriculumStandards } = {}) {
  const errors = [
    ...checkSchema(document, alignmentSchema, 'alignments'),
    ...checkSchema(topics, topicsSchema, 'topics'),
    ...checkSchema(curriculumStandards, curriculaSchema, 'curricula'),
  ];
  if (errors.length) return { errors };
  const check = (ok, message) => { if (!ok) errors.push(message); };
  check(document.version === topics.version, 'alignment/topic taxonomy version mismatch');
  check(topics.topicCount === topics.topics.length, 'topicCount mismatch');
  check(curriculumStandards.curriculumCount === curriculumStandards.curricula.length, 'curriculumCount mismatch');
  const topicIds = new Set();
  for (const topic of topics.topics) {
    check(!topicIds.has(topic.id), `duplicate topic ID ${topic.id}`);
    topicIds.add(topic.id);
  }
  const slugs = new Set();
  const standards = new Map();
  for (const curriculum of curriculumStandards.curricula) {
    check(curriculum.slug.length > 0 && !/[\s:]/.test(curriculum.slug), `invalid curriculum slug ${curriculum.slug}`);
    check(!slugs.has(curriculum.slug), `duplicate curriculum slug ${curriculum.slug}`);
    slugs.add(curriculum.slug);
    check(countryPattern.test(curriculum.country), `non-canonical curriculum country ${curriculum.slug}`);
    check(curriculum.topicCount === curriculum.topics.length, `standard count mismatch for ${curriculum.slug}`);
    for (const standard of curriculum.topics) {
      check(standard.key === `${curriculum.slug}:${standard.code}`, `standard key/code mismatch ${standard.key}`);
      check(!standards.has(standard.key), `duplicate catalogue standard ${standard.key}`);
      standards.set(standard.key, curriculum.country);
    }
  }
  const contexts = new Set();
  const alignments = document.alignments.map((row, index) => {
    const where = `alignment ${index} (${row.topicId})`;
    // Only region spelling is normalized. Country/standard identifiers must be explicit.
    const region = typeof row.region === 'string' ? row.region.normalize('NFC').trim() : '';
    check(!/[\u0000-\u001f\u007f]/.test(region), `${where}: region contains control characters`);
    const contextKey = JSON.stringify([row.topicId, row.country, region]);
    check(topicIds.has(row.topicId), `${where}: unknown topic`);
    check(!contexts.has(contextKey), `${where}: duplicate or conflicting country/region context`);
    contexts.add(contextKey);
    check(row.ageRangeStart <= row.ageRangeEnd, `${where}: ageRangeStart exceeds ageRangeEnd`);
    check((row.standards.length === 0) === (row.ageOnly === true), `${where}: empty standards require ageOnly:true; linked contexts must omit ageOnly`);
    const seen = new Set();
    for (const key of row.standards) {
      check(!seen.has(key), `${where}: duplicate standard ${key}`);
      seen.add(key);
      check(standards.has(key), `${where}: unresolved standard ${key}`);
      if (standards.has(key)) {
        const country = standards.get(key);
        check(country === row.country || country === 'International', `${where}: standard country mismatch ${key}`);
      }
    }
    return {
      topicId: row.topicId,
      country: row.country,
      ...(region ? { region } : {}),
      ageRangeStart: row.ageRangeStart,
      ageRangeEnd: row.ageRangeEnd,
      standards: [...row.standards].sort(compare),
      ...(row.ageOnly === true ? { ageOnly: true } : {}),
    };
  }).sort((a, b) => compare(a.topicId, b.topicId) || compare(a.country, b.country) || compare(a.region ?? '', b.region ?? ''));
  return { errors, normalized: { schemaVersion: 1, version: document.version, alignments } };
}

export function checkCurriculumAlignments(document, context) {
  return prepare(document, context).errors;
}

export function normalizeCurriculumAlignments(document, context) {
  const { errors, normalized } = prepare(document, context);
  if (errors.length) throw new CurriculumAlignmentError(errors);
  return normalized;
}

// A projection of three compatibility fields, not a replacement topics.json.
export function projectTopicCompatibility(document, context) {
  const normalized = normalizeCurriculumAlignments(document, context);
  const projected = new Map(context.topics.topics.map(t => [t.id, {
    id: t.id, standards: [], ageRangeStart: null, ageRangeEnd: null,
  }]));
  const unions = new Map();
  for (const row of normalized.alignments) {
    const topic = projected.get(row.topicId);
    topic.ageRangeStart = topic.ageRangeStart === null ? row.ageRangeStart : Math.min(topic.ageRangeStart, row.ageRangeStart);
    topic.ageRangeEnd = topic.ageRangeEnd === null ? row.ageRangeEnd : Math.max(topic.ageRangeEnd, row.ageRangeEnd);
    if (!unions.has(row.topicId)) unions.set(row.topicId, new Set());
    for (const key of row.standards) unions.get(row.topicId).add(key);
  }
  for (const [id, keys] of unions) projected.get(id).standards = [...keys].sort(compare);
  return { version: normalized.version, topicCount: projected.size, topics: [...projected.values()].sort((a, b) => compare(a.id, b.id)) };
}

export function checkTopicCompatibility(document, context) {
  let projection;
  try { projection = projectTopicCompatibility(document, context); }
  catch (error) {
    if (error instanceof CurriculumAlignmentError) return error.errors;
    throw error;
  }
  const actual = new Map(context.topics.topics.map(t => [t.id, t]));
  const errors = [];
  for (const expected of projection.topics) {
    const topic = actual.get(expected.id);
    if (JSON.stringify([...topic.standards].sort(compare)) !== JSON.stringify(expected.standards)) errors.push(`${topic.id}: flat standards disagree with alignment projection`);
    for (const field of ['ageRangeStart', 'ageRangeEnd']) {
      if ((topic[field] ?? null) !== expected[field]) errors.push(`${topic.id}: ${field} disagrees with alignment projection`);
    }
  }
  return errors;
}
