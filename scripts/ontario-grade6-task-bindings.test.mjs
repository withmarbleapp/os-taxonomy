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
    if (row.disposition === 'Full') for (const code of protocol.requiredSourceCodes ?? []) assert.equal(rows.find(candidate => candidate.code === code)?.disposition, 'Full', 'Incomplete integrated source duty');
    for (const caseId of protocol.caseRefs ?? []) assert.ok(report.preparedCases?.[caseId], 'Missing prepared case');
    for (const asset of protocol.assetRefs ?? []) {
      assert.ok(asset.startsWith('assets/') && !asset.includes('..'), 'Invalid task asset path');
      assert.ok(readFileSync(new URL(`../reports/${asset}`, import.meta.url), 'utf8').includes('<svg'), 'Missing task asset');
    }
    for (const required of protocol.requiredEvidence ?? []) {
      const resource = report.resources[required.resourceRef];
      assert.ok(resource?.report && resource.pointer, 'Missing prepared evidence resource');
      pointer(pointer(readReport(resource.report), resource.pointer), required.pointer);
    }
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


test('Named-city approximation and plotted answer agree with source and graticule', () => {
  const report = load('reports/ontario-grade6-country-city-location-design-2026-11-11.json');
  const fixtures = report.originalMapFixtures;
  const task = readFileSync(new URL(`../reports/${fixtures.originalAssets[0]}`, import.meta.url), 'utf8');
  const answer = readFileSync(new URL(`../reports/${fixtures.originalAssets[1]}`, import.meta.url), 'utf8');
  assert.ok(!task.includes('data-city='), 'Task should not contain answer markers');
  const markers = [...answer.matchAll(/<circle\b[^>]*>/g)].map(match => Object.fromEntries([...match[0].matchAll(/([a-z-]+)="([^"]*)"/g)].map(a => [a[1], a[2]]))).filter(attrs => attrs['data-city']);
  for (const point of fixtures.cityCoordinates) {
    const {latitude, longitude} = point.teachingApproximation;
    const unit = point.resolutionDegrees;
    assert.ok(Math.abs(latitude - Math.round(point.sourceDecimal.latitude / unit) * unit) < 1e-9);
    assert.ok(Math.abs(longitude - Math.round(point.sourceDecimal.longitude / unit) * unit) < 1e-9);
    const marker = markers.find(row => row['data-city'] === point.city);
    assert.ok(marker, 'Missing actual city answer');
    assert.equal(Number(marker['data-latitude']), latitude);
    assert.equal(Number(marker['data-longitude']), longitude);
    const panel = point.panel;
    const [west, east] = panel.longitudeBounds;
    const [south, north] = panel.latitudeBounds;
    assert.ok(latitude >= south && latitude <= north && longitude >= west && longitude <= east);
    assert.ok(Math.abs(Number(marker.cx) - (longitude - west) / (east - west) * panel.width) < 0.02);
    assert.ok(Math.abs(Number(marker.cy) - (north - latitude) / (north - south) * panel.height) < 0.02);
  }
});


test('Grade6 integrated Full cannot bypass an unresolved required specific duty', () => {
  const damaged = structuredClone(ledger.expectations);
  const child = damaged.find(row => row.code === 'B1.2');
  child.disposition = 'Partial';
  child.remainingConditions = ['A source duty remains unresolved'];
  assert.throws(() => checkBindings(damaged, contexts), /Incomplete integrated source duty/);
});


test('Grade6 historical comparisons bind actual selected community packets', () => {
  const dossier = 'ontario-grade6-historical-communities-design-2026-11-11.json';
  const report = load(`reports/${dossier}`);
  for (const target of ['indigenous-developments', 'settler-developments', 'community-differences']) {
    assert.ok(report.protocols[target].requiredEvidence.length >= 2, 'Missing community comparison evidence');
  }
  const damaged = structuredClone(report);
  damaged.protocols['indigenous-developments'].requiredEvidence[0].pointer = '/absent-community';
  assert.throws(() => checkBindings(ledger.expectations, contexts, name => name === dossier ? damaged : load(`reports/${name}`)), /Missing protocol target/);
  const original = 'early-colonial-relationships-review-2026-11-11.json';
  const missing = structuredClone(load(`reports/${original}`));
  delete missing.preparedCases['metis-longer-term'];
  assert.throws(() => checkBindings(ledger.expectations, contexts, name => name === original ? missing : load(`reports/${name}`)), /Missing protocol target/);
});
