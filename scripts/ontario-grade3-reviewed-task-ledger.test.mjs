import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = name => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const contexts = read('data/curriculum-alignments.json').alignments;
const ledger = read('reports/ontario-grade3-social-current-ledger-2026-11-10.json');
const prefix = 'the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G3-SS-';
for (const name of ['population-land-use', 'history-comparison']) {
  test(`Grade3 ${name} reviewed dispositions resolve to existing scoped associations and protocols`, () => {
    const file = `ontario-grade3-${name}-review-2026-11-10.json`;
    const report = read(`reports/${file}`);
    const pairs = report.reviewedAssociations ?? report.proposedAssociations;
    for (const code of report.reviewedCodes) {
      const record = ledger.expectations.find(row => row.code === code);
      assert.equal(record?.disposition, 'Full');
      assert.equal(record.dossier, file);
      assert.ok(Object.values(report.protocols).some(protocol => protocol.codes.includes(code)));
      for (const [topicId, codes] of Object.entries(pairs)) {
        if (!codes.includes(code)) continue;
        assert.ok(record.contributingTopicIds.includes(topicId));
        assert.ok(contexts.some(row => row.topicId === topicId && row.country === 'CA' && row.region === 'Ontario' && row.ageRangeStart === 8 && row.ageRangeEnd === 9 && row.standards.includes(prefix + code)));
      }
    }
  });
}
test('historical inquiry keeps overall community duty distinct from specific minima and both map media', () => {
  const report = read('reports/ontario-grade3-historical-inquiry-review-2026-11-10.json');
  const conditions = report.protocol.performanceConditions;
  const required = conditions.communityRequirements;
  for (const category of ['First Nations', 'Métis', 'Inuit']) {
    assert.ok(required.overallAllRequired.includes(category));
    assert.ok(required.actualCaseUse.some(item => item.category === category && item.caseId));
  }
  assert.equal(required.specificMinimumDoesNotReplaceOverall, true);
  for (const operation of ['mapAnalysis', 'mapConstruction']) {
    assert.ok(conditions[operation].includes('print'));
    assert.ok(conditions[operation].includes('digital'));
  }
  for (const code of report.reviewedCodes) {
    const row = ledger.expectations.find(item => item.code === code);
    assert.equal(row?.disposition, 'Full');
    assert.equal(row.dossier, 'ontario-grade3-historical-inquiry-review-2026-11-10.json');
    assert.ok(report.protocol.performanceConditions.communityRequirements.actualCaseUse.length >= 3);
    for (const [topicId, codes] of Object.entries(report.proposedAssociations)) {
      if (codes.includes(code)) assert.ok(contexts.some(context => context.topicId === topicId && context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart === 8 && context.ageRangeEnd === 9 && context.standards.includes(prefix + code)));
    }
  }
});
test('then-now comparison retains two actual community case sets across both roles and challenges', () => {
  const report = read('reports/ontario-grade3-history-comparison-review-2026-11-10.json');
  const conditions = report.protocols['roles-and-challenges-then-now'].performanceConditions;
  assert.ok(new Set(conditions.actualIndigenousCaseSets).size >= 2);
  for (const requirement of ['historical-role', 'contemporary-role', 'historical-challenge-or-demand', 'contemporary-challenge-and-response', 'supported-continuity-and-change']) assert.ok(conditions.forEach.includes(requirement));
  assert.ok(report.resources.some(item => item.id === 'fort-william-current-roles'));
  assert.ok(report.resources.some(item => item.id === 'inuvialuit-current-roles-and-challenges'));
});
test('environment overall dispositions retain reviewed specifics and an integrated protocol', () => {
  const report = read('reports/ontario-grade3-environment-integrated-review-2026-11-10.json');
  for (const [overall, specifics] of Object.entries(report.prerequisiteSpecificDispositions)) {
    assert.ok(Object.values(report.protocols).some(protocol => protocol.codes.includes(overall)));
    for (const code of specifics) assert.equal(ledger.expectations.find(row => row.code === code)?.disposition, 'Full');
    assert.equal(ledger.expectations.find(row => row.code === overall)?.dossier, 'ontario-grade3-environment-integrated-review-2026-11-10.json');
    for (const [topicId, codes] of Object.entries(report.associations)) if (codes.includes(overall)) assert.ok(contexts.some(row => row.topicId === topicId && row.country === 'CA' && row.region === 'Ontario' && row.ageRangeStart === 8 && row.ageRangeEnd === 9 && row.standards.includes(prefix + overall)));
  }
});
