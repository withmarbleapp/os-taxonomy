import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url)));
const ledger = load('reports/ontario-grade6-social-current-ledger-2026-11-11.json');
const contexts = load('data/curriculum-alignments.json').alignments;
const prefix = 'the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G6-SS-';
const source = load('data/curriculum-standards.json').curricula.find(source => source.slug === 'the-ontario-curriculum-social-studies-history-an');
const codes = source.topics.filter(row => row.key.startsWith(prefix)).map(row => row.key.slice(prefix.length)).sort();
function pointer(value, ref) {
  assert.ok(ref?.startsWith('/'), 'Missing protocol pointer');
  for (const part of ref.split('/').slice(1)) value = value?.[part.replaceAll('~1', '/').replaceAll('~0', '~')];
  assert.ok(value && typeof value === 'object' && Object.keys(value).length, 'Missing protocol target');
  return value;
}
function checkBindings(rows, associations, readReport = name => load(`reports/${name}`)) {
  assert.deepEqual(rows.map(row => row.code).sort(), codes, 'Source/ledger universe differs');
  for (const row of rows) {
    const actual = associations.filter(context => context.country === 'CA' && context.region === 'Ontario' && context.ageRangeStart <= 11 && context.ageRangeEnd >= 12 && context.standards.includes(prefix + row.code)).map(context => context.topicId);
    assert.deepEqual([...row.contributingTopicIds].sort(), [...new Set(actual)].sort(), `Contributor mismatch ${row.code}`);
    if (!['Full', 'Partial'].includes(row.disposition)) continue;
    assert.ok(row.contributingTopicIds.length && row.dossier, 'Missing reviewed contributor/dossier');
    const report = readReport(row.dossier);
    const protocol = pointer(report, row.protocolReference);
    assert.ok(protocol.codes.includes(row.code), 'Protocol does not cover this code');
    if (row.disposition === 'Full') assert.deepEqual(row.remainingConditions, [], 'Unresolved Full condition');
    for (const caseId of protocol.caseRefs ?? []) assert.ok(report.preparedCases?.[caseId], 'Missing prepared case');
    for (const ref of protocol.resourceRefs ?? []) {
      const resource = report.resources[ref];
      assert.ok(resource, 'Missing resource');
      if (resource.report) pointer(load(`reports/${resource.report}`), resource.pointer);
      else assert.ok(['http:', 'https:'].includes(new URL(resource.url).protocol), 'Missing source URL');
    }
  }
}
test('Grade6 current ledger binds actual scoped associations and source/task resources', () => checkBindings(ledger.expectations, contexts));
test('Grade6 binding detects missing links and broken task pointers', () => {
  const reviewed = ledger.expectations.find(row => row.disposition === 'Full');
  const absent = structuredClone(contexts);
  for (const context of absent) context.standards = context.standards.filter(key => key !== prefix + reviewed.code);
  assert.throws(() => checkBindings(ledger.expectations, absent), /Contributor mismatch/);
  const broken = structuredClone(ledger.expectations);
  broken.find(row => row.code === reviewed.code).protocolReference = '/protocols/absent';
  assert.throws(() => checkBindings(broken, contexts), /Missing protocol target/);
});

test('Geographic coordinate task key retains labelled paired references and valid assets', () => {
  const report = load('reports/geographic-coordinate-claim-review-2026-11-11.json');
  const task = report.concreteTasks;
  const points = new Map(task.readingPoints.map(point => [point.id, point]));
  for (const point of [...task.readingPoints, ...task.plottingTargets]) {
    assert.ok(Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90);
    assert.ok(Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180);
  }
  assert.equal(points.get('A').longitude, points.get('B').longitude);
  assert.equal(points.get('A').latitude, -points.get('B').latitude);
  assert.equal(points.get('A').latitude, points.get('C').latitude);
  assert.equal(points.get('A').longitude, -points.get('C').longitude);
  assert.equal(points.get('D').latitude, 0);
  assert.equal(points.get('D').longitude, 0);
  for (const asset of [task.readingGrid, task.blankGrid]) {
    const svg = readFileSync(new URL(`../reports/${asset}`, import.meta.url), 'utf8');
    assert.ok(svg.includes('<svg') && svg.includes('Latitude') && svg.includes('Longitude'));
  }
  const topic = load('data/topics.json').topics.find(row => row.id === report.claimCuration.topicId);
  assert.equal(topic.type, 'REPRESENTATIONAL');
});


test('Grade6 historical case links detect missing actual packets', () => {
  const dossier = 'jewish-canadian-history-claim-review-2026-11-11.json';
  const damaged = structuredClone(load(`reports/${dossier}`));
  delete damaged.preparedCases['postwar-rights'];
  assert.throws(() => checkBindings(ledger.expectations, contexts, name => name === dossier ? damaged : load(`reports/${name}`)), /Missing prepared case/);
});
