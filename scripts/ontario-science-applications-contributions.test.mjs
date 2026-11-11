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
const topics = new Set(load('../data/topics.json').topics.map(t => t.id));
const gradeMappings = new Map(Array.from({ length: 6 }, (_, index) => {
  const grade = index + 1;
  return [grade, load(`../reports/ontario-grade${grade}-science-mapping-2026-11-09.json`).expectations];
}));
const text = readFileSync(new URL('../reports/assets/ontario-science-coding/community-contributions-and-design.md', import.meta.url), 'utf8');
const community = load('../reports/ontario-grade5-community-conservation-design-2026-11-11.json');

function validate(value, scopedContexts = contexts) {
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
    if (suffix !== 'A3') {
      const mapping = gradeMappings.get(grade).find(row => row.key === p.key);
      assert.ok(mapping, 'Missing original exact source mapping');
      const requiredIds = suffix === 'A3.3' ? ['mt_4A4RpX-Go9'] : mapping.contributions.map(row => row.topicId);
      assert.ok(requiredIds.length, 'Specific task requires reviewed contributors');
      assert.ok(Array.isArray(p.contributorIds) && p.contributorIds.length);
      assert.equal(new Set(p.contributorIds).size, p.contributorIds.length);
      assert.deepEqual([...p.contributorIds].sort(), [...requiredIds].sort(), 'Reviewed contributor inventory must remain present');
      for (const id of p.contributorIds) {
        assert.ok(topics.has(id));
        assert.ok(scopedContexts.some(c => c.topicId === id && c.country === 'CA' && c.region === 'Ontario'
          && c.ageRangeStart === grade+5 && c.ageRangeEnd === grade+6 && c.standards.includes(p.key)), 'Missing exact scoped contributor association');
      }
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
test('application contributors and exact source associations cannot silently disappear', () => {
  for (const suffix of ['A3.1', 'A3.2']) {
    const missing = structuredClone(report);
    const panel = missing.panels.find(p => p.code === `ON-SCI-2022-G4-${suffix}`);
    panel.contributorIds = []; assert.throws(() => validate(missing));
    const lostLink = structuredClone(contexts);
    const original = report.panels.find(p => p.code === `ON-SCI-2022-G4-${suffix}`);
    const row = lostLink.find(c => c.topicId === original.contributorIds[0] && c.country === 'CA' && c.region === 'Ontario'
      && c.ageRangeStart === 9 && c.ageRangeEnd === 10 && c.standards.includes(original.key));
    row.standards = row.standards.filter(key => key !== original.key);
    assert.throws(() => validate(report, lostLink));
    row.standards.push(original.key); row.ageRangeStart = 8; row.ageRangeEnd = 9;
    assert.throws(() => validate(report, lostLink), 'A valid source key in a different age band cannot replace the reviewed association');
  }
});
