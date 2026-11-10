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
