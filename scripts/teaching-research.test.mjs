import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkSchema } from './check-schema.mjs';
import { checkTeachingResearch, checkResearchArchiveReferences } from './check-teaching-research.mjs';
const load = name => JSON.parse(readFileSync(new URL(name, import.meta.url)));
const research = load('../data/teaching-research.json');
const context = { topics: load('../data/topics.json'), topicsBytes: readFileSync(new URL('../data/topics.json', import.meta.url)), manifest: load('../data/manifest.json'), schema: load('../schema/teaching-research.schema.json') };
const archive = load('../data/archived-teaching-research.json');
test('active archive repairs point to the current published assessment and active destination', () => {
 assert.deepEqual(checkResearchArchiveReferences(archive, { topics: context.topics, research }), []);
 const obsolete = { researchTopicId: 'mt_4emC463IyW', path: 'assess.errorPatterns[1].reteachPrerequisiteId', from: 'mt_3XJkeIn6J6', to: 'mt_UNzojLkNdm' };
 assert.ok(checkResearchArchiveReferences({ ...archive, activeReferenceRepairs: [...archive.activeReferenceRepairs, obsolete] }, { topics: context.topics, research }).some(error => /stale active archive repair/.test(error)));
});
test('archive repair validation fails closed on malformed, duplicate, missing or changed paths', () => {
 const check = value => checkResearchArchiveReferences(value, { topics: context.topics, research });
 for (const value of [null, {}, { ...archive, activeReferenceRepairs: null }]) assert.ok(check(value).length);
 for (const mutate of [r => { r.path = 'assess.other[0]'; }, r => { r.to = 'mt_missing'; }, r => { r.path = 'assess.errorPatterns[999999].reteachPrerequisiteId'; }, r => { r.from = r.to; }, r => { r.unhandled = true; }, r => { r.researchTopicId = 'mt_missing'; }]) {
  const copy = structuredClone(archive); mutate(copy.activeReferenceRepairs[0]); assert.ok(check(copy).length);
 }
 const duplicate = structuredClone(archive), row = structuredClone(duplicate.activeReferenceRepairs[0]);
 row.path = row.path.startsWith('.') ? row.path.slice(1) : `.${row.path}`;
 duplicate.activeReferenceRepairs.push(row); assert.ok(check(duplicate).some(error => /duplicate/.test(error)));
});
test('archive checks report malformed research inventories without hiding schema errors', () => {
 for (const malformed of [null, {}, { records: null }, { records: [null] }, { records: [42] }, { records: [[]] }, { records: [{}] }]) {
  assert.deepEqual(checkResearchArchiveReferences(archive, { topics: context.topics, research: malformed }), ['invalid research records for archive references']);
 }
 for (const topics of [null, {}, { topics: [null] }]) {
  assert.deepEqual(checkResearchArchiveReferences(archive, { topics, research }), ['invalid topic inventory for research archive references']);
 }
});
test('published research passes schema and cross-file checks', () => assert.deepEqual(checkTeachingResearch(research, context), []));
test('rejects stale version, unknown topic, duplicate record, broken citation and wrong coverage', () => {
 for (const mutate of [r => {r.version='v2'}, r => {r.records[0].topicId='mt_missing'}, r => r.records.push(structuredClone(r.records[0])), r => {r.records[0].learn.activities[0].sourceClaims=['not a source']}, r => {r.coverage.withResearch++}, r => {r.topicFileSha256='0'.repeat(64)}, r => {r.records[0].learn.schemaVersion=1}, r => {r.records[0].privateDbId='secret'}, r => {r.records[0].assess.errorPatterns[0].reteachPrerequisiteId='mt_missing'}]) {
  const copy = structuredClone(research); mutate(copy); assert.ok(checkTeachingResearch(copy, context).length > 0);
 }
});
test('schema validator fails closed on unknown keywords and checks nested types', () => {
 assert.throws(() => checkSchema('x', { unknownKeyword: true }));
 assert.ok(checkSchema({ items: ['x', 3] }, { type:'object',properties:{items:{type:'array',items:{type:'string'}}},additionalProperties:false }).length > 0);
});
test('chart research follows the pie/line split and the updated recovery routes', () => {
 const rows = new Map(research.records.map(r => [r.topicId, r]));
 const pie = rows.get('mt_bESTSBB0wK');
 const earlierLine = rows.get('mt_H6LlpWgEYS');
 const construction = rows.get('mt_HlNSurPVDp');
 const grouped = rows.get('mt_eKJG-0eC6D');
 assert.ok(pie && earlierLine && construction && grouped);
 assert.ok(!/line.graph|temperature/i.test(JSON.stringify(pie.assess)));
 assert.ok(!pie.learn.activities.some(a => /line.graph/i.test(a.title)));
 assert.ok(!earlierLine.learn.activities.some(a => /from bars|bar.graph/i.test(a.title)));
 assert.match(construction.assess.diagnosticPrompt, /construct.*line graph.*blank axes/i);
 assert.equal(construction.assess.method, 'interpret_translate');
 assert.ok(construction.sources.every(s => s.verified === false));
 assert.equal(construction.assess.errorPatterns.find(e => /highest point/.test(e.pattern)).reteachPrerequisiteId, 'mt_H6LlpWgEYS');
 assert.equal(grouped.assess.errorPatterns.find(e => /Wrong representation/.test(e.pattern)).reteachPrerequisiteId, 'mt_ChjMU2GDJa');
 assert.equal(grouped.assess.errorPatterns.find(e => /Pie angle/.test(e.pattern)).reteachPrerequisiteId, 'mt_bESTSBB0wK');
});
test('date-time format requires RFC 3339 timestamps', () => {
 const schema = { type: 'string', format: 'date-time' };
 for (const ok of ['2026-07-01T12:00:00Z', '2026-07-01T12:00:00.123+09:00']) assert.deepEqual(checkSchema(ok, schema), []);
 for (const bad of ['1', '2024', 'March 7 2024', '2026-02-30T00:00:00Z', '2026-07-01']) assert.ok(checkSchema(bad, schema).length > 0, bad);
});
test('date-time format follows Gregorian leap years and allows a leap second', () => {
 const schema = { type: 'string', format: 'date-time' };
 for (const ok of ['0000-02-29T00:00:00Z', '2000-02-29T00:00:00Z', '2024-02-29T00:00:00Z', '2016-12-31T23:59:60Z']) assert.deepEqual(checkSchema(ok, schema), [], ok);
 for (const bad of ['1900-02-29T00:00:00Z', '2023-02-29T00:00:00Z', '2016-12-31T23:59:61Z']) assert.ok(checkSchema(bad, schema).length > 0, bad);
});
test('leap seconds must fall at the end of a UTC month after applying the offset', () => {
 const schema = { type: 'string', format: 'date-time' };
 for (const ok of [
  '2016-12-31T23:59:60Z',
  '2015-06-30t23:59:60.5z',
  '2017-01-01T00:59:60+01:00',
  '2016-12-31T15:59:60-08:00',
  '2015-07-01T05:29:60+05:30',
  '2015-06-30T20:29:60-03:30',
  '0000-02-29T23:59:60Z',
 ]) assert.deepEqual(checkSchema(ok, schema), [], ok);
 for (const bad of [
  '2026-07-01T12:00:60Z',
  '2016-12-30T23:59:60Z',
  '2016-12-31T22:59:60Z',
  '2016-12-31T23:58:60Z',
  '2016-12-31T23:59:60+01:00',
  '2016-12-31T23:59:60-01:00',
  '2017-01-02T00:59:60+01:00',
  '0001-02-28T23:59:60+00:01',
 ]) assert.ok(checkSchema(bad, schema).length > 0, bad);
});
