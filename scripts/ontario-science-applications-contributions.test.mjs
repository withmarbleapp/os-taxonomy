import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const report = load('../reports/ontario-science-applications-contributions-task-designs-2026-11-11.json');
const catalogue = load('../data/curriculum-standards.json').curricula.find(c => c.slug === report.source.catalogue);
const selected = catalogue.topics.filter(t => /^ON-SCI-2022-G[1-6]-A3(?:\.[123])?$/.test(t.code));
const expected = selected.map(t => t.key).sort();
const sourceCodes = new Map(selected.map(t => [t.key, t.code]));
const contexts = load('../data/curriculum-alignments.json').alignments;
const text = readFileSync(new URL('../reports/assets/ontario-science-coding/community-contributions-and-design.md', import.meta.url), 'utf8');
const community = load('../reports/ontario-grade5-community-conservation-design-2026-11-11.json');

function validate(value) {
  assert.equal(value.panels.length, 24);
  assert.deepEqual(value.panels.map(p => p.key).sort(), expected);
  assert.equal(value.panels.filter(p => p.priorDisposition === 'Partial').length, 18);
  assert.equal(value.panels.filter(p => p.priorDisposition === 'Full').length, 6);
  assert.ok(community.preparedCases && community.protocol);
  for (const p of value.panels) {
    assert.equal(p.code, sourceCodes.get(p.key));
    const [,gradeText,suffix] = /^ON-SCI-2022-G([1-6])-(A3(?:\.[123])?)$/.exec(p.code);
    const grade = Number(gradeText);
    assert.equal(p.grade, grade);
    assert.deepEqual(p.ageBand, [grade+5, grade+6]);
    assert.equal(p.taskRef.report, 'assets/ontario-science-coding/community-contributions-and-design.md');
    assert.equal(p.taskRef.section, `Grade ${grade}: practical contributions portfolio`);
    assert.ok(text.includes('## '+p.taskRef.section+'\n'));
    assert.equal(p.proposedDisposition, 'Full');
    assert.deepEqual(p.remainingConditions, []);
    if (suffix === 'A3' || suffix === 'A3.2') {
      assert.deepEqual(p.integratedSubjects, ['science','mathematics','language']);
      assert.equal(p.physicalTask, grade === 1 ? 'shade' : 'soft-ball-route');
      assert.ok(p.actualDeliveryConditions.some(s => /Actual design, build, comparison and retest required/.test(s)));
    }
    if (suffix === 'A3' || suffix === 'A3.1') assert.deepEqual(p.applicationContexts,
      grade <= 3 ? ['home-or-residential','school-or-community'] : ['machinist-skilled-trade','nasa-mathematician']);
    if (suffix === 'A3' || suffix === 'A3.3') {
      assert.deepEqual(p.communityCaseIds, grade <= 3 ? ['tsouke','mno'] : ['tsouke','mno','nunatsiavut']);
      assert.equal(p.additionalComparison, 'johnson');
      assert.ok(p.requiredOperations.some(s => /what knowledge\/work/.test(s) && /decision/.test(s)));
      assert.ok(p.requiredOperations.some(s => /measured outcome/.test(s)));
    }
    if (suffix === 'A3.3') {
      assert.deepEqual(p.contributorIds, ['mt_4A4RpX-Go9']);
      assert.ok(contexts.some(c => c.topicId === 'mt_4A4RpX-Go9' && c.country === 'CA' && c.region === 'Ontario'
        && c.ageRangeStart === grade+5 && c.ageRangeEnd === grade+6 && c.standards.includes(p.key)));
    }
  }
}
test('source applications and contribution tasks resolve all24 positions with exact scope and independent overall duties', () => validate(report));
test('wrong grade, no trade, one community and link-only performance cannot pass', () => {
  const wrong = structuredClone(report); wrong.panels[0].taskRef.section = 'Grade 6: practical contributions portfolio'; assert.throws(() => validate(wrong));
  const trade = structuredClone(report); trade.panels.find(p => p.code === 'ON-SCI-2022-G4-A3.1').applicationContexts = ['engineers']; assert.throws(() => validate(trade));
  const community = structuredClone(report); community.panels.find(p => p.code === 'ON-SCI-2022-G1-A3.3').communityCaseIds = ['tsouke']; assert.throws(() => validate(community));
  const links = structuredClone(report); links.panels.find(p => p.code === 'ON-SCI-2022-G6-A3').actualDeliveryConditions = ['Both child codes linked']; assert.throws(() => validate(links));
});
