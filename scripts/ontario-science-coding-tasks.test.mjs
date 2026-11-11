import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const report = load('../reports/ontario-science-coding-task-designs-2026-11-11.json');
const catalogue = load('../data/curriculum-standards.json').curricula.find(c => c.slug === report.source.catalogue);
const topics = new Set(load('../data/topics.json').topics.map(t => t.id));
const contexts = load('../data/curriculum-alignments.json').alignments;
const expected = catalogue.topics.filter(t => /^ON-SCI-2022-G[1-6]-A2\.1$/.test(t.code)).map(t => t.key).sort();
function validate(value) {
  assert.equal(value.panels.length, 6, 'All six coding duties must be checked');
  assert.deepEqual(value.panels.map(p => p.key).sort(), expected);
  assert.equal(new Set(value.panels.map(p => p.id)).size, 6);
  for (const panel of value.panels) {
    assert.match(panel.code, /^ON-SCI-2022-G[1-6]-A2\.1$/);
    assert.equal(panel.proposedDisposition, 'Full');
    assert.deepEqual(panel.ageBand, [panel.grade + 5, panel.grade + 6]);
    assert.ok(panel.mandatoryTaskDuty.trim() && panel.wholeClaimBoundary.trim());
    assert.ok(panel.actualDeliveryEvidence.length >= 3);
    assert.match(panel.actualDeliveryEvidence.join(' '), /actual run\/check/);
    assert.match(panel.actualDeliveryEvidence.join(' '), /Learner-authored saved visual program/);
    assert.ok(panel.contributorIds.length);
    for (const id of panel.contributorIds) {
      assert.ok(topics.has(id));
      assert.ok(contexts.some(c => c.topicId === id && c.country === 'CA' && c.region === 'Ontario'
        && c.ageRangeStart <= panel.ageBand[0] && c.ageRangeEnd >= panel.ageBand[1] && c.standards.includes(panel.key)));
    }
    assert.match(panel.taskResource.report, /^assets\/ontario-science-coding\/[a-z-]+\.md$/);
    const text = readFileSync(new URL('../reports/' + panel.taskResource.report, import.meta.url), 'utf8');
    assert.ok(text.includes('## ' + panel.taskResource.section + '\n'), 'Missing actual grade recipe');
    assert.ok(text.includes('invented practice data') && text.includes('not measurements made by a child'));
  }
  assert.match(value.panels[5].mandatoryTaskDuty, /communication form/);
  assert.match(value.panels[5].mandatoryTaskDuty, /typed input requests a scientific trial/);
  assert.equal(value.counts.historicalOverallPositionsClosed, 0);
}
test('all six applied coding duties resolve actual grade recipes and retained source components', () => validate(report));
test('empty coverage, missing recipe and lost different-purpose input duty cannot pass', () => {
  const empty = structuredClone(report); empty.panels = []; assert.throws(() => validate(empty));
  const missing = structuredClone(report); missing.panels[2].taskResource.section = 'Missing recipe'; assert.throws(() => validate(missing));
  const samePurpose = structuredClone(report); samePurpose.panels[5].mandatoryTaskDuty = 'Two buttons select the same trial.'; assert.throws(() => validate(samePurpose));
});
