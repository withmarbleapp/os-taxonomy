import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const report = read('reports/ncert-twau-alignment-2026-11-10.json');
const protocols = read('reports/ncert-twau-protocols-2026-11-10.json');
const ledger = read('reports/ncert-alignment-readiness-2026-11-10.json');
const alignments = read('data/curriculum-alignments.json').alignments;
const topics = read('data/topics.json').topics;
const catalogue = read('data/curriculum-standards.json').curricula;
const summary = read('reports/ncert-primary-alignment-review-summary-2026-11-10.json');
const clone = value => structuredClone(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const expectedProtocols = {
  "C-1.1": [
    "local-observation"
  ],
  "C-1.2": [
    "community-relationships"
  ],
  "C-1.3": [
    "patterns-questions-predictions"
  ],
  "C-1.4": [
    "institutions-roles"
  ],
  "C-1.5": [
    "local-material-construction"
  ],
  "C-2.1": [
    "supporting-systems"
  ],
  "C-2.2": [
    "nature-cultural-practice"
  ],
  "C-2.3": [
    "local-change-evidence"
  ],
  "C-3.1": [
    "needs-and-protection"
  ],
  "C-3.2": [
    "everyday-emergency-preparation"
  ],
  "C-3.3": [
    "safety-messages-roleplay"
  ],
  "C-4.1": [
    "local-living-diversity"
  ],
  "C-4.2": [
    "local-cultural-diversity"
  ],
  "C-4.3": [
    "resource-use"
  ],
  "C-4.4": [
    "resource-care-sharing"
  ],
  "C-4.5": [
    "support-living-needs"
  ],
  "C-4.6": [
    "access-fair-work"
  ],
  "C-4.7": [
    "norms-and-actual-care"
  ],
  "C-5.1": [
    "plans-and-maps"
  ],
  "C-5.2": [
    "plans-and-maps"
  ],
  "C-5.3": [
    "map-scale-transfer"
  ],
  "C-6.1": [
    "safe-inquiry"
  ],
  "C-6.2": [
    "findings-representations"
  ],
  "C-7.1": [
    "crosscutting-science"
  ],
  "C-7.2": [
    "science-engineering-portfolio"
  ],
  "CG-1": [
    "goal-local-world"
  ],
  "CG-2": [
    "goal-interdependence"
  ],
  "CG-3": [
    "goal-safety"
  ],
  "CG-4": [
    "goal-sensitive-care"
  ],
  "CG-5": [
    "goal-maps"
  ],
  "CG-6": [
    "goal-inquiry"
  ],
  "CG-7": [
    "goal-science-engineering"
  ]
};
const reviewedPairDigest = 'd8eb07692d2d0f18c4bbadae7332e9e019b3e05faef890cae5049b0f208020ee';
const reviewedConditionDigest = '70573e1a3000db1b2f2a01fe2bc0c3042e0ee01ba14b2dbb06159efc527cfa1c';
const sourcePrefix = 'ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-TWAU-';

function check(r, p, l = ledger, a = alignments) {
  const rows = r.records;
  const cautions = new Map(r.existingGuideInterpretationCautions.map(c => [c.topicId, c]));
  for (const [id, flag] of [['mt_EHuU1ZeUFA','correctCombinedMoonMotionIsWrong'],['mt_KsKLVW_ssY','suppliedMapReadingProvesOwnModelConstruction'],['mt_VI5kdtf28e','sortingAloneProvesObtainAndCombine'],['mt_ZFwPZaDJ0_','observationalRecordingRequiresControlledExperiment'],['mt_Pl-nsjYGZ3','isothermalMeltingRequiresParticleSpeedIncrease'],['mt_qeZYF6HZ4o','deferredAdvancedViewpointDowngradesBasicPosition']]) assert.equal(cautions.get(id)?.[flag], false, 'Inherited rubric caution lost');
  assert.equal(rows.length, 32);
  const keys = rows.map(row => row.key);
  assert.equal(new Set(keys).size, 32);
  const acceptedKeys = catalogue.flatMap(source => source.topics.map(row => row.key)).filter(key => key.startsWith(sourcePrefix));
  assert.deepEqual([...keys].sort(), acceptedKeys.sort());
  assert.equal(rows.filter(row => row.recordKind === 'stageCompetency').length, 25);
  assert.equal(rows.filter(row => row.recordKind === 'curricularGoal').length, 7);
  assert.equal(rows.filter(row => row.disposition === 'Full').length, 29);
  assert.equal(rows.filter(row => row.disposition === 'SkillWithContextualEngagement').length, 3);
  const families = new Map(p.protocols.map(family => [family.id, family]));
  assert.equal(families.size, p.protocols.length);
  assert.equal(families.size, 31);
  assert.equal(digest(Object.fromEntries(p.protocols.map(family => [family.id, family.sourceConditions]))), reviewedConditionDigest, 'Reviewed source performance conditions changed');
  const bindings = new Map(p.sourceBindings.map(binding => [binding.key, binding]));
  assert.equal(bindings.size, 32);
  const contributed = [];
  for (const row of rows) {
    assert.ok(row.key.startsWith(sourcePrefix));
    assert.equal(row.sourceStatus, 'formal-stage-standard');
    assert.deepEqual(row.sourceGradeBand, [3, 4, 5]);
    assert.deepEqual(row.ageBand, [8, 11]);
    assert.deepEqual(row.assessmentProtocols, expectedProtocols[row.officialCode], `${row.officialCode}: wrong valid protocol`);
    const b = bindings.get(row.key);
    assert.ok(b);
    assert.equal(b.officialCode, row.officialCode);
    assert.deepEqual(b.protocolIds, row.assessmentProtocols);
    const expected = Object.fromEntries(row.assessmentProtocols.map(id => {
      const family = families.get(id); assert.ok(family);
      return [id, family.sourceConditions];
    }));
    assert.deepEqual(row.taskConditions, expected);
    assert.deepEqual(b.requiredSourceConditions, expected);
    const entry = l.records.find(entry => entry.key === row.key);
    assert.ok(entry);
    assert.equal(entry.alignmentReviewStatus, 'reviewed-twau');
    assert.equal(entry.disposition, row.disposition);
    assert.deepEqual(entry.contributions, row.contributions);
    assert.deepEqual(entry.assessmentProtocols, row.assessmentProtocols);
    assert.equal(entry.assessmentProtocolReport, 'ncert-twau-protocols-2026-11-10.json');
    for (const c of row.contributions) {
      assert.equal(c.role, 'component');
      const t = topics.find(t => t.id === c.topicId); assert.ok(t);
      assert.equal(c.topicName, t.name);
      contributed.push([row.key, c.topicId]);
      assert.ok(a.some(context => context.topicId === c.topicId && context.scope === 'jurisdiction' && context.country === 'IN' && context.ageRangeStart === 8 && context.ageRangeEnd === 11 && !context.ageOnly && context.standards.includes(row.key)), `Missing exact stage context: ${row.key}/${c.topicId}`);
    }
  }
  contributed.sort((a,b) => a[0].localeCompare(b[0], 'en') || a[1].localeCompare(b[1], 'en'));
  // ASCII keys and IDs: use code-unit ordering for a stable reviewed-pair digest.
  contributed.sort((a,b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0);
  assert.equal(digest(contributed), reviewedPairDigest, 'Reviewed component pairs drifted');
  assert.equal(contributed.length, 114);
  assert.equal(new Set(contributed.map(pair => pair[1])).size, 54);
  const actual = a.flatMap(context => context.country === 'IN' ? context.standards.filter(key => keys.includes(key)).map(key => [key, context.topicId]) : []);
  assert.equal(new Set(actual.map(JSON.stringify)).size, 114);
  assert.deepEqual([...new Set(actual.map(JSON.stringify))].sort(), contributed.map(JSON.stringify).sort());
  for (const family of p.protocols.filter(family => family.id.startsWith('goal-'))) {
    assert.ok(family.includesProtocols.length >= 2);
    assert.equal(new Set(family.includesProtocols).size, family.includesProtocols.length);
    for (const id of family.includesProtocols) assert.ok(families.has(id));
    assert.equal(family.sourceConditions.completeChildProtocols, true);
    assert.equal(family.sourceConditions.independentGoalTransfer, true);
  }
  assert.equal(l.records.length, 570);
  assert.equal(new Set(l.records.map(row => row.key)).size, 570);
  const acceptedPrimary = catalogue.filter(source => ['ncert-fs-2025','ncert-ncfse-2023-ed2024'].includes(source.slug)).flatMap(source => source.topics.map(row => row.key));
  assert.deepEqual(l.records.map(row => row.key).sort(), acceptedPrimary.sort());
  const reviewed = l.records.filter(row => row.alignmentReviewStatus !== 'not-reviewed-in-this-slice').length;
  assert.equal(reviewed, 570);
  assert.equal(l.counts.alignmentReviewedHere, reviewed);
  assert.equal(l.counts.notAlignmentReviewedHere, l.records.length - reviewed);
  for (const group of l.groups) {
    const scope = l.records.filter(row => ['source','stage','area','recordKind'].every(key => row[key] === group[key]));
    assert.equal(group.records, scope.length);
    assert.equal(group.reviewedHere, scope.filter(row => row.alignmentReviewStatus !== 'not-reviewed-in-this-slice').length);
    assert.equal(group.pendingHere, group.records - group.reviewedHere);
  }
  const scaleKey = 'ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C9-LO01';
  const unresolved = l.records.find(row => row.key === scaleKey); assert.ok(unresolved);
  assert.equal(unresolved.disposition, 'Unverified');
  assert.ok(!a.some(context => context.standards.includes(scaleKey)), 'Unresolved musical scale meaning silently acquired a graph link');
}

test('TWAU source identities, exact protocol conditions, stage contexts and complete selected ledger agree', () => check(report, protocols));
test('a different existing valid protocol cannot silently replace a source task', () => {
  const r = clone(report), p = clone(protocols);
  const row = r.records.find(row => row.officialCode === 'C-1.1');
  row.assessmentProtocols = ['plans-and-maps'];
  row.taskConditions = { 'plans-and-maps': p.protocols.find(f => f.id === 'plans-and-maps').sourceConditions };
  const b = p.sourceBindings.find(b => b.key === row.key);
  b.protocolIds = row.assessmentProtocols; b.requiredSourceConditions = row.taskConditions;
  assert.throws(() => check(r, p), /wrong valid protocol/);
});
test('source-specific real performance and all hazard cases cannot be deleted', () => {
  for (const id of ['institutions-roles','everyday-emergency-preparation','safety-messages-roleplay','plans-and-maps','crosscutting-science','safe-inquiry']) {
    const p = clone(protocols); const f = p.protocols.find(f => f.id === id);
    delete f.sourceConditions[Object.keys(f.sourceConditions)[0]];
    assert.throws(() => check(report, p), /performance conditions changed/);
  }
});
test('a required broad-goal child cannot be dropped or replaced by an unrelated valid family', () => {
  const p = clone(protocols); p.protocols.find(f => f.id === 'goal-safety').includesProtocols = ['plans-and-maps','safe-inquiry'];
  // Goal compositions are source duties too, independently compared below.
  assert.notDeepEqual(p.protocols.find(f => f.id === 'goal-safety').includesProtocols, ['needs-and-protection','everyday-emergency-preparation','safety-messages-roleplay']);
  assert.throws(() => checkGoalChildren(p));
});
const expectedGoalChildren = {
  "goal-local-world": [
    "local-observation",
    "community-relationships",
    "patterns-questions-predictions",
    "institutions-roles",
    "local-material-construction"
  ],
  "goal-interdependence": [
    "supporting-systems",
    "nature-cultural-practice",
    "local-change-evidence"
  ],
  "goal-safety": [
    "needs-and-protection",
    "everyday-emergency-preparation",
    "safety-messages-roleplay"
  ],
  "goal-sensitive-care": [
    "local-living-diversity",
    "local-cultural-diversity",
    "resource-use",
    "resource-care-sharing",
    "support-living-needs",
    "access-fair-work",
    "norms-and-actual-care"
  ],
  "goal-maps": [
    "plans-and-maps",
    "map-scale-transfer"
  ],
  "goal-inquiry": [
    "safe-inquiry",
    "findings-representations"
  ],
  "goal-science-engineering": [
    "crosscutting-science",
    "science-engineering-portfolio"
  ]
};
function checkGoalChildren(p) {
  for (const [id, children] of Object.entries(expectedGoalChildren)) assert.deepEqual(p.protocols.find(f => f.id === id).includesProtocols, children);
}
test('every goal composes its reviewed child duties exactly', () => checkGoalChildren(protocols));
test('missing real association and silently resolving the scale phrase fail', () => {
  const a = clone(alignments); const context = a.find(c => c.country === 'IN' && c.standards.some(key => key.startsWith(sourcePrefix)));
  context.standards = context.standards.filter(key => !key.startsWith(sourcePrefix));
  assert.throws(() => check(report, protocols, ledger, a));
  const l = clone(ledger); l.records.find(r => r.key === 'ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C9-LO01').disposition = 'Full';
  assert.throws(() => check(report, protocols, l));
});

test('complete selected review summary derives every disposition without converting conditional or Unverified to Full', () => {
  const counts = {};
  for (const row of ledger.records) {
    const disposition = row.disposition ?? row.reviewedDisposition; assert.ok(disposition);
    counts[disposition] = (counts[disposition] ?? 0) + 1;
  }
  assert.deepEqual(summary.dispositions, Object.fromEntries(Object.entries(counts).sort()));
  assert.equal(summary.counts.reviewedSourceRecords, ledger.records.length);
  assert.equal(summary.counts.FullAuthoring, counts.Full);
  assert.equal(summary.counts.Unverified, counts.Unverified);
  assert.equal(summary.exceptions.length, 1);
  assert.equal(summary.exceptions[0].key, 'ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C9-LO01');
  for (const group of summary.groups) {
    const scope = ledger.records.filter(row => ['source','stage','area','recordKind'].every(key => row[key] === group[key]));
    const dispositions = {};
    for (const row of scope) { const d = row.disposition ?? row.reviewedDisposition; dispositions[d] = (dispositions[d] ?? 0) + 1; }
    assert.deepEqual(group.dispositions, Object.fromEntries(Object.entries(dispositions).sort()));
  }
});

test('inherited rubric cautions cannot silently assert false equivalence or a universal recording gate', () => {
  for (const flag of ['correctCombinedMoonMotionIsWrong','suppliedMapReadingProvesOwnModelConstruction','sortingAloneProvesObtainAndCombine','observationalRecordingRequiresControlledExperiment','isothermalMeltingRequiresParticleSpeedIncrease','deferredAdvancedViewpointDowngradesBasicPosition']) {
    const r = clone(report); r.existingGuideInterpretationCautions.find(c => flag in c)[flag] = true;
    assert.throws(() => check(r, protocols), /rubric caution lost/);
  }
});
