import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = name => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const ledger = read('reports/ontario-grade4-social-current-ledger-2026-11-10.json');
const contexts = read('data/curriculum-alignments.json').alignments;
const prefix = 'the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G4-SS-';
const catalogue = read('data/curriculum-standards.json').curricula.find(row => row.slug === 'the-ontario-curriculum-social-studies-history-an');
const codes = catalogue.topics.filter(row => row.key.startsWith(prefix)).map(row => row.key.slice(prefix.length));
const dossiers = Object.fromEntries(ledger.expectations.filter(row => row.dossier).map(row => [row.dossier, read(`reports/${row.dossier}`)]));
const sorted = values => [...values].sort();
function checkBindings(rows, associations) {
  assert.deepEqual(sorted(rows.map(row => row.code)), sorted(codes), 'Catalogue/ledger universe differs');
  for (const row of rows) {
    const linked = associations.filter(context => context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart <= 9 && context.ageRangeEnd >= 10 && context.standards.includes(prefix + row.code)).map(context => context.topicId);
    assert.deepEqual(sorted(row.contributingTopicIds), sorted(new Set(linked)), `Scoped contributors differ for ${row.code}`);
    if (!['Full', 'Partial'].includes(row.disposition)) continue;
    assert.ok(row.contributingTopicIds.length, `Missing contributors for ${row.code}`);
    let protocol = dossiers[row.dossier];
    assert.ok(protocol && row.protocolReference?.startsWith('/'), `Missing dossier/reference for ${row.code}`);
    for (const segment of row.protocolReference.split('/').slice(1)) protocol = protocol?.[segment.replaceAll('~1', '/').replaceAll('~0', '~')];
    assert.ok(protocol && typeof protocol === 'object' && Object.keys(protocol).length, `Missing protocol for ${row.code}`);
    if (Array.isArray(protocol.codes)) assert.ok(protocol.codes.includes(row.code), `Wrong protocol code for ${row.code}`);
    if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, [], `Unresolved Full condition for ${row.code}`);
  }
}
test('Grade4 current dispositions bind complete scoped contributors and actual protocols', () => checkBindings(ledger.expectations, contexts));
test('Grade4 binding catches missing links and protocols without freezing future reviewed additions', () => {
  const code = ledger.expectations.find(row => row.disposition === 'Full').code;
  const missing = structuredClone(contexts);
  for (const row of missing) row.standards = row.standards.filter(key => key !== prefix + code);
  assert.throws(() => checkBindings(ledger.expectations, missing), /Scoped contributors differ/);
  const broken = structuredClone(ledger.expectations);
  broken.find(row => row.code === code).protocolReference = '/absent';
  assert.throws(() => checkBindings(broken, contexts), /Missing protocol/);
  const futureRows = structuredClone(ledger.expectations);
  futureRows.find(row => row.code === code).contributingTopicIds.push('future-reviewed-topic');
  checkBindings(futureRows, [...contexts, {topicId: 'future-reviewed-topic', country: 'CA', region: 'Ontario', ageRangeStart: 9, ageRangeEnd: 10, standards: [prefix + code]}]);
});
test('Grade4 peoples packet covers each named political division with attributed location examples', () => {
  const report = read('reports/ontario-grade4-peoples-location-review-2026-11-10.json');
  const political = read('reports/ontario-canadian-political-geography-claim-2026-11-10.json');
  const required = {...political.verifiedKnowledge.provinces, ...political.verifiedKnowledge.territories};
  assert.deepEqual(sorted(report.regionalResourceRows.map(row => row.region)), sorted(Object.keys(required)));
  for (const row of report.regionalResourceRows) {
    assert.equal(row.capital, required[row.region]);
    assert.ok(row.location && row.qualifiedDescription && row.peoplesExamples.length);
    assert.ok(report.resources.some(source => source.id === row.sourceId));
  }
});
