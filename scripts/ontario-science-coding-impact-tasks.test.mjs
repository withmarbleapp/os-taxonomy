import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const report = load('../reports/ontario-science-coding-impact-task-designs-2026-11-11.json');
const coding = load('../reports/ontario-science-coding-task-designs-2026-11-11.json');
const catalogue = load('../data/curriculum-standards.json').curricula.find(c => c.slug === report.source.catalogue);
const selected = catalogue.topics.filter(t => /^ON-SCI-2022-G[1-6]-A2(?:\.2)?$/.test(t.code));
const expected = selected.map(t => t.key).sort();
const codes = new Map(selected.map(t => [t.key, t.code]));
const topics = new Set(load('../data/topics.json').topics.map(t => t.id));
const contexts = load('../data/curriculum-alignments.json').alignments;
const cases = readFileSync(new URL('../reports/assets/ontario-science-coding/everyday-impact-cases.md', import.meta.url), 'utf8');
const caseSections = {
  'programmed-report': 'Programmed reporting changes what people receive',
  'ai-captions': 'AI captioning can help, with limits',
  machinist: 'Skilled trades: a machinist checks a program',
};

function resolveCase(value, id) {
  assert.ok(value.resources && Object.hasOwn(value.resources, id), 'Missing own case resource');
  assert.ok(Object.hasOwn(caseSections, id), 'Unreviewed case identity');
  const resource = value.resources[id];
  assert.ok(resource && Object.hasOwn(resource, 'report') && Object.hasOwn(resource, 'section'));
  assert.equal(resource.report, 'assets/ontario-science-coding/everyday-impact-cases.md');
  assert.equal(resource.section, caseSections[id], 'Case identity must resolve its actual reviewed section');
  const text = readFileSync(new URL('../reports/' + resource.report, import.meta.url), 'utf8');
  assert.ok(text.includes('## ' + resource.section + '\n'), 'Missing case section');
}

function validate(value) {
  assert.equal(value.panels.length, 12);
  assert.deepEqual(value.panels.map(p => p.key).sort(), expected, 'All actual overall and specific source positions required');
  for (const panel of value.panels) {
    assert.equal(panel.code, codes.get(panel.key), 'Actual source key/code must agree');
    const grade = Number(/^ON-SCI-2022-G([1-6])-A2(?:\.2)?$/.exec(panel.code)?.[1]);
    assert.equal(panel.grade, grade);
    assert.equal(panel.taskRef.report, 'assets/ontario-science-coding/everyday-impact-cases.md');
    assert.equal(panel.taskRef.section, `Grade ${grade}: impact assessment`);
    assert.ok(cases.includes('## ' + panel.taskRef.section + '\n'));
    assert.deepEqual(panel.ageBand, [grade + 5, grade + 6]);
    assert.equal(panel.proposedDisposition, 'Full');
    assert.deepEqual(panel.remainingConditions, []);
    assert.ok(panel.contributorIds.length);
    for (const id of panel.contributorIds) {
      assert.ok(topics.has(id));
      if (panel.kind === 'specific') assert.ok(contexts.some(c => c.topicId === id
        && c.country === 'CA' && c.region === 'Ontario' && c.ageRangeStart <= grade + 5
        && c.ageRangeEnd >= grade + 6 && c.standards.includes(panel.key)), 'Component must retain its actual scoped source association');
    }
    assert.ok(panel.caseIds.includes('programmed-report') && panel.caseIds.includes('ai-captions'));
    for (const id of panel.caseIds) resolveCase(value, id);
    assert.equal(panel.skilledTradeRequired, grade >= 4);
    if (grade >= 4) {
      assert.ok(panel.caseIds.includes('machinist'), 'Later source explicitly requires skilled trades');
      assert.ok(panel.requiredImpactOperations.some(s => /machinist/.test(s) && /inspection/.test(s)));
    }
    if (panel.code.endsWith('-A2')) {
      assert.equal(panel.kind, 'overall');
      const recipe = coding.panels.find(p => p.grade === grade);
      assert.equal(panel.codingSourceKey, recipe.key);
      assert.deepEqual(panel.codingTaskRef, recipe.taskResource, 'Overall must reference its actual grade recipe');
      assert.ok(panel.integratedAssessment.some(s => /author and execute/.test(s) && /actual run/.test(s)));
      assert.ok(panel.integratedAssessment.some(s => /independently assess/.test(s)));
      assert.ok(panel.deliveryConditions.some(s => /Actual saved learner-authored/.test(s)));
    } else assert.equal(panel.kind, 'specific');
  }
}

test('twelve science coding/impact duties bind source, grade, actual recipe and concrete cases', () => validate(report));
test('missing trade, wrong existing recipe, absent impact and paper-only execution fail', () => {
  const missingTrade = structuredClone(report); missingTrade.panels.find(p => p.code === 'ON-SCI-2022-G4-A2.2').caseIds = ['programmed-report', 'ai-captions']; assert.throws(() => validate(missingTrade));
  const wrongRecipe = structuredClone(report); wrongRecipe.panels.find(p => p.code === 'ON-SCI-2022-G1-A2').codingTaskRef = coding.panels[5].taskResource; assert.throws(() => validate(wrongRecipe));
  const missingImpact = structuredClone(report); missingImpact.panels.find(p => p.code === 'ON-SCI-2022-G2-A2').integratedAssessment = ['Actually author and execute a program with actual run.']; assert.throws(() => validate(missingImpact));
  const paper = structuredClone(report); paper.panels.find(p => p.code === 'ON-SCI-2022-G3-A2').deliveryConditions = ['Read the paper algorithm.']; assert.throws(() => validate(paper));
  const empty = structuredClone(report); empty.panels = []; assert.throws(() => validate(empty));
});
test('missing, inherited, absent-heading and wrong-existing case targets fail', () => {
  const missing = structuredClone(report); delete missing.resources.machinist; assert.throws(() => validate(missing));
  const inherited = structuredClone(report); inherited.resources = Object.create(report.resources); assert.throws(() => validate(inherited));
  const heading = structuredClone(report); heading.resources.machinist.section = 'Missing trade case'; assert.throws(() => validate(heading));
  const wrong = structuredClone(report); wrong.resources.machinist.section = report.resources['ai-captions'].section; assert.throws(() => validate(wrong));
  const file = structuredClone(report); file.resources.machinist.report = 'assets/ontario-science-coding/shadow-observation-recipes.md'; assert.throws(() => validate(file));
});
