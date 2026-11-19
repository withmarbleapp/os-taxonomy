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
test('final historical dossiers bind their reviewed records and actual community policy cases', () => {
  for (const name of ['historical-location-impact', 'policy-identity', 'history-integrated']) {
    const file = `ontario-grade3-${name}-review-2026-11-10.json`;
    const report = read(`reports/${file}`);
    for (const code of report.codes) {
      const record = ledger.expectations.find(row => row.code === code);
      assert.equal(record?.disposition, 'Full');
      assert.equal(record.dossier, file);
      assert.ok(Object.values(report.protocols).some(protocol => protocol.codes.includes(code)));
      for (const [topicId, codes] of Object.entries(report.associations ?? report.proposedAssociations)) if (codes.includes(code)) {
        assert.ok(record.contributingTopicIds.includes(topicId));
        assert.ok(contexts.some(row => row.topicId === topicId && row.country === 'CA' && row.region === 'Ontario' && row.ageRangeStart === 8 && row.ageRangeEnd === 9 && row.standards.includes(prefix + code)));
      }
    }
    for (const specifics of Object.values(report.prerequisiteSpecificDispositions ?? {})) for (const code of specifics) assert.equal(ledger.expectations.find(row => row.code === code)?.disposition, 'Full');
  }
  const policy = read('reports/ontario-grade3-policy-identity-review-2026-11-10.json');
  const requirements = policy.protocols['period-and-later-policy'].performanceConditions;
  for (const category of ['First Nations', 'Métis', 'Inuit']) {
    const selected = requirements.actualCases.find(item => item.category === category);
    assert.ok(selected);
    assert.ok(policy.resources.some(resource => resource.id === selected.caseId));
  }
  assert.equal(requirements.learnerDisclosureRequired, false);
});

const catalogue = read('data/curriculum-standards.json').curricula.find(source => source.slug === 'the-ontario-curriculum-social-studies-history-an');
const requiredGrade3Codes = catalogue.topics.filter(item => item.key.startsWith(prefix)).map(item => item.key.slice(prefix.length));
const dossiers = Object.fromEntries([...new Set(ledger.expectations.map(row => row.dossier))].map(file => [file, read(`reports/${file}`)]));
function verifyGrade3LedgerBindings(candidateLedger, candidateContexts, candidateDossiers = dossiers) {
  const sorted = values => [...values].sort();
  const rows = candidateLedger.expectations;
  assert.equal(new Set(rows.map(row => row.code)).size, rows.length, 'Duplicate ledger code');
  assert.deepEqual(sorted(rows.map(row => row.code)), sorted(requiredGrade3Codes), 'Catalogue/ledger code coverage differs');
  const actual = new Map(requiredGrade3Codes.map(code => [code, new Set()]));
  for (const context of candidateContexts) {
    if (context.country !== 'CA' || context.region !== 'Ontario' || context.ageRangeStart > 8 || context.ageRangeEnd < 9) continue;
    for (const standard of context.standards) {
      if (!standard.startsWith(prefix)) continue;
      const code = standard.slice(prefix.length);
      assert.ok(actual.has(code), `Uncatalogued scoped Grade3 code ${code}`);
      actual.get(code).add(context.topicId);
    }
  }
  for (const row of rows) {
    assert.ok(row.contributingTopicIds.length > 0, `Missing contributors for ${row.code}`);
    assert.equal(new Set(row.contributingTopicIds).size, row.contributingTopicIds.length, `Duplicate contributor for ${row.code}`);
    assert.deepEqual(sorted(row.contributingTopicIds), sorted(actual.get(row.code)), `Scoped contributors differ for ${row.code}`);
    const dossier = candidateDossiers[row.dossier];
    assert.ok(dossier, `Missing dossier for ${row.code}`);
    const declared = new Set([dossier.code, ...(dossier.codes ?? []), ...(dossier.selectedCodes ?? []), ...(dossier.sourceCodes ?? []), ...(dossier.reviewedCodes ?? []), ...(dossier.context?.standards ?? []), ...(dossier.newContext?.standards ?? [])]);
    assert.ok(declared.has(row.code) || declared.has(prefix + row.code), `Dossier does not declare ${row.code}`);
    assert.equal(typeof row.protocolReference, 'string', `Missing protocol reference for ${row.code}`);
    assert.ok(row.protocolReference.startsWith('/'), `Invalid protocol reference for ${row.code}`);
    let protocol = dossier;
    for (const segment of row.protocolReference.split('/').slice(1)) protocol = protocol?.[segment.replaceAll('~1', '/').replaceAll('~0', '~')];
    assert.ok(protocol && typeof protocol === 'object' && Object.keys(protocol).length > 0, `Missing protocol for ${row.code}`);
    if (!Array.isArray(protocol) && Array.isArray(protocol.codes)) assert.ok(protocol.codes.includes(row.code), `Wrong protocol code for ${row.code}`);
  }
}
test('every catalogued Grade3 code binds its complete scoped contributors and dossier protocol', () => {
  verifyGrade3LedgerBindings(ledger, contexts);
});
test('Grade3 ledger binding rejects missing B2.3 map links and extra scoped links', () => {
  const missing = structuredClone(contexts);
  for (const row of missing) if (row.topicId === 'mt_w4cUnN_SsQ' && row.country === 'CA' && row.region === 'Ontario' && row.ageRangeStart <= 8 && row.ageRangeEnd >= 9) row.standards = row.standards.filter(code => code !== prefix + 'B2.3');
  assert.throws(() => verifyGrade3LedgerBindings(ledger, missing), /Scoped contributors differ for B2.3/);
  const extra = structuredClone(contexts);
  extra.push({topicId: 'unreviewed-test-contributor', scope: 'jurisdiction', country: 'CA', region: 'Ontario', ageRangeStart: 8, ageRangeEnd: 9, standards: [prefix + 'B2.3']});
  assert.throws(() => verifyGrade3LedgerBindings(ledger, extra), /Scoped contributors differ for B2.3/);
});
test('Grade3 ledger binding rejects omitted codes, incomplete contributor lists and unresolved protocols', () => {
  const omitted = structuredClone(ledger);
  omitted.expectations = omitted.expectations.filter(row => row.code !== 'B2.3');
  assert.throws(() => verifyGrade3LedgerBindings(omitted, contexts), /Catalogue\/ledger code coverage differs/);
  const incomplete = structuredClone(ledger);
  incomplete.expectations.find(row => row.code === 'B2.3').contributingTopicIds = [];
  assert.throws(() => verifyGrade3LedgerBindings(incomplete, contexts), /Missing contributors for B2.3/);
  const unresolved = structuredClone(ledger);
  unresolved.expectations.find(row => row.code === 'B2.3').protocolReference = '/missing-protocol';
  assert.throws(() => verifyGrade3LedgerBindings(unresolved, contexts), /Missing protocol for B2.3/);
  const absent = structuredClone(ledger);
  delete absent.expectations.find(row => row.code === 'B2.3').protocolReference;
  assert.throws(() => verifyGrade3LedgerBindings(absent, contexts), /Missing protocol reference for B2.3/);
});
test('Grade3 binding permits a new scoped contributor when the reviewed ledger is updated', () => {
  const updatedContexts = structuredClone(contexts);
  const updatedLedger = structuredClone(ledger);
  updatedContexts.push({topicId: 'future-reviewed-test-contributor', scope: 'jurisdiction', country: 'CA', region: 'Ontario', ageRangeStart: 8, ageRangeEnd: 9, standards: [prefix + 'B2.3']});
  updatedLedger.expectations.find(row => row.code === 'B2.3').contributingTopicIds.push('future-reviewed-test-contributor');
  verifyGrade3LedgerBindings(updatedLedger, updatedContexts);
  const incomplete = structuredClone(ledger);
  incomplete.expectations.find(row => row.code === 'B2').contributingTopicIds.pop();
  assert.throws(() => verifyGrade3LedgerBindings(incomplete, contexts), /Scoped contributors differ for B2/);
});
