import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url)));
const dossier = load('reports/ontario-grade5-historical-inquiry-design-2026-11-11.json');
function checkPreparation(report) {
  const models = report.protocols.questions.questionModels;
  assert.ok(models.length >= 3, 'Missing research questions');
  for (const model of models) {
    assert.ok(model.question?.trim(), 'Missing question');
    const sources = model.sourceIds.map(id => report.resources[id]);
    assert.ok(sources.every(source => source?.url && source.originGroup), 'Unresolved source');
    assert.ok(new Set(sources.map(source => source.originGroup)).size >= 2, 'Two independent source origins required');
  }
  assert.ok(Object.values(report.resources).some(source => source.type.startsWith('primary')), 'Missing primary source');
  for (const [protocol, required] of [['maps', ['historical-inquiry-map', 'familiar-place-map']], ['sources', ['organised-print-notes', 'two-source-paragraph']]]) {
    for (const id of required) {
      const product = report.protocols[protocol].products.find(product => product.id === id);
      assert.ok(product?.requiredOperation && product.instruction?.trim(), `Missing actual product task ${id}`);
    }
  }
}
test('Historical inquiry retains actual source variety and whole research/map products', () => checkPreparation(dossier));
test('Historical inquiry rejects missing sources, duplicate origins and removed production', () => {
  const absent = structuredClone(dossier);
  delete absent.resources[absent.protocols.questions.questionModels[0].sourceIds[0]];
  assert.throws(() => checkPreparation(absent), /Unresolved source/);
  const duplicate = structuredClone(dossier);
  duplicate.protocols.questions.questionModels[0].sourceIds.fill('museum-trade');
  assert.throws(() => checkPreparation(duplicate), /independent source origins/);
  const removed = structuredClone(dossier);
  removed.protocols.maps.products = removed.protocols.maps.products.filter(product => product.id !== 'historical-inquiry-map');
  assert.throws(() => checkPreparation(removed), /Missing actual product task/);
});

const repertoire = load('reports/early-colonial-relationships-review-2026-11-11.json');
function checkCasePackets(report) {
  const sources = new Set(report.sources.map(source => source.url));
  for (const protocol of Object.values(report.protocols)) {
    assert.ok(protocol.caseRefs.length, 'Missing case references');
    for (const ref of protocol.caseRefs) {
      let packet = report;
      for (const key of ref.split('/').slice(1)) packet = packet?.[key];
      assert.ok(packet?.period && packet.facts?.length && packet.limits, 'Missing prepared case');
      assert.ok(packet.sourceRefs?.length && packet.sourceRefs.every(url => sources.has(url)), 'Unbound case source');
    }
  }
}
test('Early relationship repertoire binds actual public case facts to reviewed sources', () => checkCasePackets(repertoire));
test('Early relationship repertoire rejects missing case packets and unbound sources', () => {
  const absent = structuredClone(repertoire);
  delete absent.preparedCases['qikiqtani-contact'];
  assert.throws(() => checkCasePackets(absent), /Missing prepared case/);
  const wrong = structuredClone(repertoire);
  wrong.preparedCases['metis-longer-term'].sourceRefs = ['https://example.invalid/unreviewed'];
  assert.throws(() => checkCasePackets(wrong), /Unbound case source/);
});

const integrated = load('reports/ontario-grade5-historical-relationships-integration-2026-11-11.json');
function checkIntegratedResources(report) {
  for (const protocol of Object.values(report.protocols)) {
    assert.ok(protocol.actions.length && protocol.contributorIds.length, 'Missing actual task/contributor');
    for (const ref of protocol.resourceRefs) {
      const resource = report.resources[ref];
      assert.ok(resource, 'Missing integrated resource');
      if (resource.url) {
        assert.ok(['http:', 'https:'].includes(new URL(resource.url).protocol), 'Invalid source URL');
      } else {
        let target;
        try { target = load(`reports/${resource.report}`); } catch { assert.fail('Missing resource report'); }
        for (const part of resource.pointer.split('/').slice(1)) target = target?.[part];
        assert.ok(target && typeof target === 'object' && Object.keys(target).length, 'Missing resource target');
      }
    }
  }
}
test('Historical integrated duties resolve their actual whole-claim resource programmes', () => checkIntegratedResources(integrated));
test('Historical integrated duties reject absent reports and broken programme pointers', () => {
  const path = structuredClone(integrated);
  path.resources['early-organisation'].report = 'absent-source-programme.json';
  assert.throws(() => checkIntegratedResources(path), /Missing resource report/);
  const target = structuredClone(integrated);
  target.resources['early-organisation'].pointer = '/originalResearch/absent';
  assert.throws(() => checkIntegratedResources(target), /Missing resource target/);
});
