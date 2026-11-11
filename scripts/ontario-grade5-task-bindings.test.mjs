import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = name => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const ledger = read('reports/ontario-grade5-social-current-ledger-2026-11-11.json');
const contexts = read('data/curriculum-alignments.json').alignments;
const prefix = 'the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G5-SS-';
const source = read('data/curriculum-standards.json').curricula.find(row => row.slug === 'the-ontario-curriculum-social-studies-history-an');
const codes = source.topics.filter(row => row.key.startsWith(prefix)).map(row => row.key.slice(prefix.length));
const sorted = values => [...values].sort();
function checkBindings(rows, associations) {
  assert.deepEqual(sorted(rows.map(row => row.code)), sorted(codes), 'Catalogue/ledger universe differs');
  for (const row of rows) {
    const linked = associations.filter(context => context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart <= 10 && context.ageRangeEnd >= 11 && context.standards.includes(prefix + row.code)).map(context => context.topicId);
    assert.deepEqual(sorted(row.contributingTopicIds), sorted(new Set(linked)), `Scoped contributors differ for ${row.code}`);
    if (!['Full', 'Partial'].includes(row.disposition)) continue;
    assert.ok(row.contributingTopicIds.length, `Missing contributors for ${row.code}`);
    let protocol = row.dossier && read(`reports/${row.dossier}`);
    assert.ok(protocol && row.protocolReference?.startsWith('/'), `Missing dossier/reference for ${row.code}`);
    for (const part of row.protocolReference.split('/').slice(1)) protocol = protocol?.[part.replaceAll('~1', '/').replaceAll('~0', '~')];
    assert.ok(protocol && typeof protocol === 'object' && Object.keys(protocol).length, `Missing protocol for ${row.code}`);
    if (Array.isArray(protocol.codes)) assert.ok(protocol.codes.includes(row.code), `Wrong protocol code for ${row.code}`);
    if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, [], `Unresolved Full condition for ${row.code}`);
  }
}
test('Grade5 reviewed dispositions bind actual scoped contributors and protocols', () => checkBindings(ledger.expectations, contexts));
test('Grade5 binding rejects lost links/protocols while permitting coordinated future additions', () => {
  const code = ledger.expectations.find(row => row.disposition === 'Full').code;
  const missing = structuredClone(contexts);
  for (const row of missing) row.standards = row.standards.filter(key => key !== prefix + code);
  assert.throws(() => checkBindings(ledger.expectations, missing), /Scoped contributors differ/);
  const broken = structuredClone(ledger.expectations);
  broken.find(row => row.code === code).protocolReference = '/absent';
  assert.throws(() => checkBindings(broken, contexts), /Missing protocol/);
  const future = structuredClone(ledger.expectations);
  future.find(row => row.code === code).contributingTopicIds.push('future-reviewed-topic');
  checkBindings(future, [...contexts, {topicId: 'future-reviewed-topic', country: 'CA', region: 'Ontario', ageRangeStart: 10, ageRangeEnd: 11, standards: [prefix + code]}]);
});
