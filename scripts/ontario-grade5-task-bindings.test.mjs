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
    if (row.disposition === 'Full') {
      assert.deepEqual(row.remainingConditions, [], `Unresolved Full condition for ${row.code}`);
      for (const code of protocol.requiresSpecificDispositions ?? []) assert.equal(rows.find(item => item.code === code)?.disposition, 'Full', `Unresolved integrated specific ${code}`);
    }
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

function checkMapProduction(protocol) {
  const maps = protocol.products.filter(item => item.kind === 'thematic-map');
  assert.ok(new Set(maps.map(item => item.medium)).size >= 2, 'Missing map format variety');
  assert.ok(maps.some(item => item.medium === 'digital'), 'Missing digital map product');
  for (const product of maps) {
    assert.ok(protocol.learnerSteps.some(step => step.operation === 'construct' && step.instruction && step.outputs.includes(product.id)), `Missing learner construction for ${product.id}`);
  }
}
function checkResearchSources(report) {
  const questions = report.protocols.questions.researchQuestions;
  assert.ok(questions.length >= 3, 'Missing whole short-research questions');
  for (const question of questions) {
    const sources = question.sourceIds.map(id => report.resources[id]);
    assert.ok(sources.every(source => source?.url && source.originGroup), 'Missing research source');
    assert.ok(new Set(sources.map(source => source.originGroup)).size >= 2, 'Duplicate underlying source origins');
  }
  for (const perspective of report.perspectiveRecords) {
    assert.ok(perspective.basis && perspective.sourceIds.length, 'Missing perspective basis');
    assert.ok(perspective.sourceIds.every(id => report.resources[id]?.url), 'Missing perspective source');
  }
}
test('Grade5 maps require actual learner digital construction and another map format', () => {
  const protocol = read('reports/ontario-grade5-environmental-inquiry-review-2026-11-11.json').protocols.maps;
  checkMapProduction(protocol);
  const lostStep = structuredClone(protocol);
  const digitalIds = new Set(protocol.products.filter(item => item.kind === 'thematic-map' && item.medium === 'digital').map(item => item.id));
  lostStep.learnerSteps = lostStep.learnerSteps.filter(step => !step.outputs.some(id => digitalIds.has(id)));
  assert.throws(() => checkMapProduction(lostStep), /Missing learner construction/);
  const paperOnly = structuredClone(protocol);
  for (const product of paperOnly.products) product.medium = 'paper';
  assert.throws(() => checkMapProduction(paperOnly), /Missing map format variety|Missing digital map/);
});
test('Grade5 question sources and perspectives retain actual bound documentary origins', () => {
  const report = read('reports/ontario-grade5-environmental-inquiry-review-2026-11-11.json');
  checkResearchSources(report);
  const missing = structuredClone(report);
  delete missing.resources[missing.protocols.questions.researchQuestions[0].sourceIds[0]];
  assert.throws(() => checkResearchSources(missing), /Missing research source/);
  const repeated = structuredClone(report);
  const question = repeated.protocols.questions.researchQuestions[0];
  question.sourceIds = [question.sourceIds[0], question.sourceIds[0]];
  assert.throws(() => checkResearchSources(repeated), /Duplicate underlying source origins/);
});

function checkActionPlanActors(report, protocol) {
  const actors = new Map(protocol.actors.map(actor => [actor.id, actor]));
  for (const step of protocol.actionSteps) {
    const actor = actors.get(step.actorId);
    assert.ok(actor && actor.body && step.action && step.purpose, 'Missing actor/action binding');
    assert.ok(actor.sourceRefs.length, 'Missing actor source');
    for (const ref of actor.sourceRefs) {
      const source = report.resources[ref];
      assert.ok(source?.url || source?.report, 'Missing actor source');
      if (source.report) {
        assert.ok(!source.report.includes('/') && source.report.endsWith('.json'), 'Invalid source report path');
        assert.ok(Object.keys(read(`reports/${source.report}`)).length, 'Empty source report');
      }
    }
  }
  const activeActors = protocol.actionSteps.map(step => actors.get(step.actorId));
  assert.ok(activeActors.some(actor => actor.kind === 'government'), 'Missing government action');
  assert.ok(activeActors.some(actor => actor.kind === 'government' && actor.indigenousGovernment), 'Missing Indigenous government action');
  assert.ok(activeActors.some(actor => actor.kind === 'citizen'), 'Missing citizen action');
}
test('Grade5 action plans bind actual government and citizen steps to source roles', () => {
  const report = read('reports/ontario-grade5-social-environment-action-plans-2026-11-11.json');
  for (const protocol of Object.values(report.protocols)) {
    checkActionPlanActors(report, protocol);
    const noGovernment = structuredClone(protocol);
    const governments = new Set(protocol.actors.filter(actor => actor.kind === 'government').map(actor => actor.id));
    noGovernment.actionSteps = noGovernment.actionSteps.filter(step => !governments.has(step.actorId));
    assert.throws(() => checkActionPlanActors(report, noGovernment), /Missing government action/);
    const noCitizens = structuredClone(protocol);
    const citizens = new Set(protocol.actors.filter(actor => actor.kind === 'citizen').map(actor => actor.id));
    noCitizens.actionSteps = noCitizens.actionSteps.filter(step => !citizens.has(step.actorId));
    assert.throws(() => checkActionPlanActors(report, noCitizens), /Missing citizen action/);
    const brokenSource = structuredClone(report);
    delete brokenSource.resources[protocol.actors[0].sourceRefs[0]];
    assert.throws(() => checkActionPlanActors(brokenSource, protocol), /Missing actor source/);
  }
});

function checkPublicInputProcesses(report) {
  const protocol = report.protocols['public-input'];
  assert.ok(new Set(protocol.processes.map(process => process.method)).size >= 3, 'Missing distinct input methods');
  for (const process of protocol.processes) {
    assert.ok(report.resources[process.resourceRef]?.url && process.decisionLink, 'Missing process source/decision link');
  }
  const described = protocol.learnerSteps.find(step => step.operation === 'describe-and-contrast');
  assert.ok(described?.instruction && described.processIds.length >= 3, 'Missing actual process-description task');
  for (const id of described.processIds) assert.ok(protocol.processes.some(process => process.id === id), 'Missing described process');
  const rationale = protocol.learnerSteps.find(step => step.operation === 'explain-all-levels');
  assert.ok(rationale?.instruction && rationale.resourceRefs.every(ref => report.resources[ref]), 'Missing all-level importance task/source');
  assert.ok(protocol.learnerSteps.some(step => step.operation === 'perspective-and-plan' && step.instruction), 'Missing whole shared-operation task');
  assert.ok(protocol.learnerSteps.some(step => step.operation === 'transfer' && step.instruction), 'Missing changed-scenario task');
}
test('Grade5 public-input processes require sourced methods, decision links and actual all-level explanation', () => {
  const report = read('reports/ontario-grade5-public-input-processes-2026-11-11.json');
  checkPublicInputProcesses(report);
  const missingRationale = structuredClone(report);
  missingRationale.protocols['public-input'].learnerSteps = missingRationale.protocols['public-input'].learnerSteps.filter(step => step.operation !== 'explain-all-levels');
  assert.throws(() => checkPublicInputProcesses(missingRationale), /Missing all-level/);
  const wrongSource = structuredClone(report);
  wrongSource.protocols['public-input'].processes[0].resourceRef = 'absent';
  assert.throws(() => checkPublicInputProcesses(wrongSource), /Missing process source/);
  const noDecisionLink = structuredClone(report);
  delete noDecisionLink.protocols['public-input'].processes[0].decisionLink;
  assert.throws(() => checkPublicInputProcesses(noDecisionLink), /Missing process source\/decision link/);
});

function checkCanadianSharedCases(report) {
  for (const protocol of Object.values(report.protocols)) {
    assert.ok(protocol.actions.length && protocol.caseRefs.length, 'Missing jurisdiction task/case');
    for (const ref of protocol.caseRefs) {
      const task = report.preparedTaskCases[ref];
      assert.ok(task?.facts.length && task.task && task.answerBoundary, 'Missing prepared shared case');
      assert.ok(task.sourceRefs.length, 'Missing shared-case source');
      for (const sourceRef of task.sourceRefs) {
        const source = report.resources[sourceRef];
        assert.ok(source?.url || source?.report, 'Missing shared-case source');
        if (source.report) assert.ok(Object.keys(read(`reports/${source.report}`)).length, 'Missing inherited shared-case dossier');
      }
    }
  }
}
test('Canadian shared responsibility tasks bind actual prepared cases and primary source locators', () => {
  const report = read('reports/canadian-government-responsibilities-review-2026-11-11.json');
  checkCanadianSharedCases(report);
  const lostCase = structuredClone(report);
  delete lostCase.preparedTaskCases['fishery-issue'];
  assert.throws(() => checkCanadianSharedCases(lostCase), /Missing prepared shared case/);
  const lostSource = structuredClone(report);
  delete lostSource.resources['nfn-fishery-actions'];
  assert.throws(() => checkCanadianSharedCases(lostSource), /Missing shared-case source/);
});
