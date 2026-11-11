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
