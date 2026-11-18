import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const report = read('reports/bullying-definition-context-review-2026-11-11.json');
function qualify(r = report) {
  const { Ontario: on, Australia: au } = r.definitionFrames;
  assert.equal(on.singleIncidentCanQualify, true); assert.equal(on.provenIntentAlwaysRequired, false);
  assert.equal(au.repetitionOrPotentialRepetitionRequired, true); assert.equal(au.intentionalHarmCriterion, true);
  assert.deepEqual(r.originalCases.map(c => c.id), ['equal-peer-disagreement', 'isolated-power-harm', 'repeated-deliberate-exclusion', 'single-online-action-recirculates', 'uncertain-intention-or-label']);
  const [equal, isolated, repeated, online, uncertain] = r.originalCases;
  assert.equal(equal.powerImbalance, false); assert.equal(equal.label, 'ordinary-conflict-not-bullying-from-these-facts'); assert.equal(equal.helpIfHarmful, true);
  assert.equal(isolated.Ontario, 'can-qualify-under-stated-local-context');
  assert.equal(isolated.Australia, 'repetition-or-potential-repetition-not-established'); assert.equal(isolated.helpInEitherFrame, true);
  assert.equal(repeated.repeated, true); assert.equal(repeated.intentionalHarm, true);
  assert.equal(online.potentialRepetitionEstablished, true); assert.equal(online.bothFrames, 'can-fit-through-continuing-circulation');
  assert.equal(uncertain.waitForIntentAdmissionOrRepeatBeforeHelp, false);
}
test('declared local frames distinguish classification from timely help', () => qualify());
test('one jurisdiction cannot silently replace the other frame', () => {
  for (const change of [r => r.definitionFrames.Australia.repetitionOrPotentialRepetitionRequired = false, r => r.definitionFrames.Ontario.provenIntentAlwaysRequired = true, r => r.originalCases[1].Australia = r.originalCases[1].Ontario]) {
    const r = structuredClone(report); change(r); assert.throws(() => qualify(r));
  }
});
test('ordinary disagreement cannot become bullying merely by being unpleasant', () => {
  const r = structuredClone(report); r.originalCases[0].label = 'fits-stated-bullying-criteria'; assert.throws(() => qualify(r));
});
test('a single online action retains potential repetition without requiring reposting by the child', () => {
  const r = structuredClone(report); r.originalCases[3].potentialRepetitionEstablished = false; assert.throws(() => qualify(r));
});
test('support cannot wait for repetition or proof of intent', () => {
  for (const change of [r => r.originalCases[1].helpInEitherFrame = false, r => r.originalCases[4].waitForIntentAdmissionOrRepeatBeforeHelp = true]) {
    const r = structuredClone(report); change(r); assert.throws(() => qualify(r));
  }
});
test('canonical two-field revision retains form inventory and help assessment', () => {
  const card = read('data/topics.json').topics.find(t => t.id === report.topicId);
  assert.equal(card.description, report.after.description); assert.equal(card.evidence[0], report.after.evidence0);
  assert.equal(card.evidence[1], 'Name at least three forms of bullying including cyberbullying');
  assert.equal(card.evidence[2], 'Describe the steps they should take if they experience or witness bullying');
  assert.ok(card.assessmentPrompt.includes('rather than just ignoring it'));
  assert.deepEqual(report.changedPaths, ['description', 'evidence[0]']);
  checkGuide(read('data/teaching-research.json').records, card.id);
});
// Teaching research for the revised card must keep the declared-frame reading
// and must not make help conditional on repetition or proven intent.
function checkGuide(records, topicId) {
  const rows = records.filter(g => g.topicId === topicId);
  assert.equal(rows.length, 1);
  // Authored teaching text only: a cited source's name is not frame reasoning.
  const { pedagogy, learn, assess } = rows[0];
  const text = JSON.stringify({ pedagogy, learn, assess }).toLowerCase();
  assert.doesNotMatch(text, /bullying (?:is|must be) always repeated|bullying requires (?:proof|proven|an admission) of intent/);
  assert.ok((text.includes('ontario') && text.includes('australia')) || /applicable school or community definition/.test(text));
  assert.match(text, /help(?:-seeking)? (?:does not|doesn't|never) waits? for/);
}
test('bullying guide keeps declared frames and help that does not wait', () => {
  const records = read('data/teaching-research.json').records;
  const row = records.find(g => g.topicId === report.topicId);
  const mutate = edit => { const copy = structuredClone(row); edit(copy); return [...records.filter(g => g !== row), copy]; };
  const say = sentence => r => { r.pedagogy.summary += ` ${sentence}`; };
  const strip = pattern => r => { for (const key of ['pedagogy', 'learn', 'assess']) r[key] = JSON.parse(JSON.stringify(r[key]).replace(pattern, '')); };
  for (const bad of [
    records.filter(g => g !== row),
    [...records, structuredClone(row)],
    mutate(say('Bullying is always repeated.')),
    mutate(say('Bullying requires proof of intent.')),
    mutate(strip(/ontario|australia|applicable school or community definition/gi)),
    mutate(strip(/help(?:-seeking)? (?:does not|doesn't|never) waits? for/gi)),
  ]) assert.throws(() => checkGuide(bad, report.topicId));
});
