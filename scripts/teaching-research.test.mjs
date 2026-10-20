import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkSchema } from './check-schema.mjs';
import { checkTeachingResearch } from './check-teaching-research.mjs';
const load = name => JSON.parse(readFileSync(new URL(name, import.meta.url)));
const research = load('../data/teaching-research.json');
const context = { topics: load('../data/topics.json'), topicsBytes: readFileSync(new URL('../data/topics.json', import.meta.url)), manifest: load('../data/manifest.json'), schema: load('../schema/teaching-research.schema.json') };
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
