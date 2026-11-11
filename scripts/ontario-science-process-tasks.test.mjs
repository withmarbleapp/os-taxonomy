import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url)));
const text = path => readFileSync(new URL(`../reports/${path}`, import.meta.url), 'utf8');
const report = json('reports/ontario-science-a1-process-source-review-2026-11-11.json');
const contexts = json('data/curriculum-alignments.json').alignments;
const slug = report.source.catalogue;
const source = json('data/curriculum-standards.json').curricula.find(value => value.slug === slug);
const selected = source.topics.filter(value => /^ON-SCI-2022-G[1-6]-A1(?:\.[1-5])?$/.test(value.code)).map(value => value.code).sort();
const sharedSections = ['Research and source checking', 'Actual experimentation', 'Actual engineering', 'Established safety in every selected activity', 'Actual communication and changed cases', 'Whole-claim and readiness boundary'];
function section(body, heading) {
  const parts = body.split(/^## /m).slice(1);
  const found = parts.find(value => value.split('\n')[0] === heading);
  assert.ok(found && found.slice(heading.length).trim(), 'Missing actual process section');
}
function check(value, associations = contexts, read = text) {
  assert.deepEqual(value.expectations.map(row => row.code).sort(), selected, 'Missing selected process expectation');
  for (const row of value.expectations) {
    assert.equal(row.key, `${slug}:${row.code}`, 'Process source identity mismatch');
    assert.equal(row.grade, Number(row.code.match(/-G([1-6])-/)[1]), 'Process source grade mismatch');
    assert.ok(row.protocolReference?.startsWith('/protocols/'), 'Missing process protocol binding');
    const protocol = value.protocols[row.protocolReference.slice('/protocols/'.length)];
    assert.ok(protocol && protocol.grade === row.grade && protocol.codes.includes(row.code), 'Missing process protocol target');
    assert.deepEqual([...protocol.contributorIds].sort(), [...row.contributingTopicIds].sort(), 'Process contributor mismatch');
    assert.ok(row.contributingTopicIds.length > 0, 'Missing process contributors');
    for (const id of row.contributingTopicIds) {
      assert.ok(associations.some(context => context.topicId === id && context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart === row.grade + 5 && context.ageRangeEnd === row.grade + 6 && context.standards.includes(row.key)), 'Missing actual process association');
    }
    assert.deepEqual(protocol.requiredStrands, ['B', 'C', 'D', 'E'], 'Missing content-strand investigations');
    assert.deepEqual(Object.keys(protocol.strandSections).sort(), ['B', 'C', 'D', 'E'], 'Missing content-strand binding');
    assert.deepEqual(protocol.sharedSections, sharedSections, 'Missing common process duty');
    assert.deepEqual(protocol.resourceRefs, ['sharedRecords', `gradeSheets/${row.grade}`], 'Missing process resource binding');
    const shared = read(value.resourceScope.sharedRecords);
    const gradePath = value.resourceScope.gradeSheets[row.grade];
    assert.ok(typeof gradePath === 'string' && gradePath.startsWith('assets/ontario-science-processes/'), 'Missing grade investigation resource');
    const grade = read(gradePath);
    for (const heading of protocol.sharedSections) section(shared, heading);
    for (const heading of Object.values(protocol.strandSections)) section(grade, heading);
    assert.ok(protocol.mandatoryActions.length >= 4 && protocol.mandatoryActions.every(action => typeof action === 'string' && action.trim()), 'Missing process actions');
    if (row.proposedDisposition === 'Full' || row.disposition === 'Full') assert.deepEqual(protocol.remainingConditions, [], 'Unresolved process task condition');
    if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, [], 'Unresolved process ledger condition');
  }
}
test('Science A1 source universe binds actual grade scopes and prepared four-strand process tasks', () => check(report));
test('Science A1 missing protocol, source association or strand cannot silently retain completion', () => {
  const row = report.expectations[0];
  const missing = structuredClone(report); delete missing.protocols[row.protocolReference.slice('/protocols/'.length)];
  assert.throws(() => check(missing), /Missing process protocol target/);
  const associations = structuredClone(contexts);
  for (const context of associations) context.standards = context.standards.filter(key => key !== row.key);
  assert.throws(() => check(report, associations), /Missing actual process association/);
  const strand = structuredClone(report);
  delete strand.protocols[row.protocolReference.slice('/protocols/'.length)].strandSections.E;
  assert.throws(() => check(strand), /Missing content-strand binding/);
});
test('Science A1 missing actual asset section and unbound resource fail the task guard', () => {
  const row = report.expectations[0];
  const protocol = report.protocols[row.protocolReference.slice('/protocols/'.length)];
  const path = report.resourceScope.gradeSheets[row.grade];
  for (const heading of Object.values(protocol.strandSections)) {
    assert.throws(() => check(report, contexts, name => name === path ? text(name).replace(`## ${heading}\n`, '## Removed investigation\n') : text(name)), /Missing actual process section/);
  }
  const damaged = structuredClone(report); delete damaged.resourceScope.gradeSheets[row.grade];
  assert.throws(() => check(damaged), /Missing grade investigation resource/);
  const missing = structuredClone(report); delete missing.protocols[row.protocolReference.slice('/protocols/'.length)].resourceRefs;
  assert.throws(() => check(missing), /Missing process resource binding/);
});
test('Science A1 Full proposals cannot ignore an unresolved actual protocol condition', () => {
  const damaged = structuredClone(report);
  Object.values(damaged.protocols)[0].remainingConditions = ['A resource remains unqualified.'];
  assert.throws(() => check(damaged), /Unresolved process task condition/);
  const ledgerCondition = structuredClone(report);
  ledgerCondition.expectations[0].remainingConditions = ['An unresolved source/resource condition.'];
  assert.throws(() => check(ledgerCondition), /Unresolved process ledger condition/);
});
