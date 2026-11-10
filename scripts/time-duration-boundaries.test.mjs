import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const topics = new Map(load('../data/topics.json').topics.map(t => [t.id,t]));
const contexts = load('../data/curriculum-alignments.json').alignments;
const edges = load('../data/dependencies.json').dependencies;
const ledger = load('../reports/time-duration-clock-claim-review-2026-11-10.json');
const has = (id,country,start,end,code,region=null) => contexts.some(c => c.topicId===id && c.scope==='jurisdiction' && c.country===country && (c.region??null)===region && (c.framework??null)===null && c.ageRangeStart===start && c.ageRangeEnd===end && c.standards.includes(code));

test('duration and endpoint claims identify different unknown quantities and both endpoint directions', () => {
  const duration=topics.get('mt_4emC463IyW'), endpoint=topics.get('mt_IL86kadLSS');
  assert.match(duration.description,/duration between.*known start.*known finish/i);
  assert.match(endpoint.description,/unknown start or finish/i);
  assert.ok(endpoint.evidence.some(e=>/9:20/.test(e)&&/10:05/.test(e)));
  assert.ok(endpoint.evidence.some(e=>/3:02/.test(e)));
  assert.ok(!edges.some(e=>e.strength==='hard' && [e.topicId,e.prerequisiteId].includes(duration.id) && [e.topicId,e.prerequisiteId].includes(endpoint.id)));
  for(const id of [duration.id,endpoint.id]) assert.ok(!edges.some(e=>e.topicId===id&&e.prerequisiteId==='mt_UNzojLkNdm'&&e.strength==='hard'));
});

test('clock-system boundaries preserve noon and midnight while Roman reading remains independent', () => {
  for(const example of ledger.conversionBoundaryExamples){
    const hour=example.hour12%12+(example.phase==='pm'?12:0);
    assert.equal(`${String(hour).padStart(2,'0')}:${String(example.minute).padStart(2,'0')}`,example.expected24);
  }
  const conversion=topics.get('mt_WfrE_4r-kY');
  for(const time of ['07:05','15:20','12:20','00:20']) assert.ok(conversion.description.includes(time));
  for(const symbol of ['IIII','IX']) assert.ok(topics.get('mt_5J2quSTspi').description.includes(symbol));
  assert.ok(!edges.some(e=>e.topicId===conversion.id&&e.prerequisiteId==='mt_5J2quSTspi'&&e.strength==='hard'));
});

test('measurement source contributions survive at their exact bands, including Indian stage scope', () => {
  const code='ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-COG-COMP-C-8.10';
  assert.ok(has('mt__N55B7u7HD','IN',3,8,code));
  assert.ok(has('mt_tVvZVWO5d6','IN',3,8,code));
  assert.ok(has('mt__N55B7u7HD','US',8,9,'ccss-math:3.MD.1','Common Core'));
  assert.ok(has('mt__N55B7u7HD','AU',8,9,'acara-v9:AC9M3M03','ACARA v9'));
  assert.ok(has('mt_UNzojLkNdm','AU',8,9,'acara-v9:AC9M3M04','ACARA v9'));
  assert.ok(!contexts.some(c=>c.topicId==='mt_IL86kadLSS'&&c.standards.includes('uk-nc-2013:Ma/KS2/Y4/M/6')));
  const india=load('../reports/ncert-foundational-mathematics-alignment-2026-11-10.json');
  const row=india.records.find(r=>r.officialCode==='C-8.10');
  assert.equal(row.disposition,'Partial');
  assert.ok(row.remainingConditions.some(s=>/months/.test(s)));
  assert.ok(row.contributions.some(c=>c.topicId==='mt__N55B7u7HD'));
  assert.equal(india.originalAlignmentBaseCommit,india.baseCommit);
});

test('corrected prompts distinguish observed measurement, start conditions and calendar exceptions', () => {
  assert.match(topics.get('mt__N55B7u7HD').assessmentPrompt,/given a suitable timer.*start and stop.*record/i);
  assert.doesNotMatch(topics.get('mt_UNzojLkNdm').description,/\bset\b/i);
  assert.match(topics.get('mt_TcG90kS8nu').assessmentPrompt,/same time.*start times are unknown/i);
  const calendar=topics.get('mt_EXlmTURK_o');
  assert.ok(calendar.evidence.some(e=>/usually.*exceptions/i.test(e)));
  assert.match(calendar.assessmentPrompt,/calendar/i);
  assert.match(ledger.consumerReassessmentBoundary,/no reset/i);
});

test('active teaching guidance uses a supplied timer and preserves the midnight-hour conversion branch', () => {
  const research=new Map(load('../data/teaching-research.json').records.map(r=>[r.topicId,r]));
  const measuring=research.get('mt__N55B7u7HD');
  assert.match(measuring.learn.activities[0].learnerActions[1],/supplied by the adult/i);
  const converting=research.get('mt_WfrE_4r-kY');
  assert.ok(converting.learn.activities.some(a=>a.learnerActions.some(s=>s.includes('12:20 a.m.')&&s.includes('00:20'))));
  assert.ok(converting.assess.errorPatterns.some(p=>p.nextMove.includes('12:00–12:59 a.m.')&&p.nextMove.includes('00:00–00:59')));
});
