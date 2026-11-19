import test from 'node:test';
import assert from 'node:assert/strict';
import { createCubes, descriptor } from '../lessons/cube-volume/model/cubes.mjs';
import { chooseTask, practiceShapes, scorePlan, shapeKey, taskPools } from '../lessons/cube-volume/model/cube-tasks.mjs';
import { loadDirectory } from '../packages/authoring-tools/archive.mjs';
import { outcomeFor, stampRecord } from '../packages/teaching-runtime/outcome.mjs';

const exec = (m, name, args = {}) => {
  const s = m.snapshot();
  return m.execute({
    protocolVersion: 1,
    sessionId: s.sessionId,
    releaseId: s.releaseId,
    commandId: crypto.randomUUID(),
    expectedRevision: s.revision,
    name,
    args,
  });
};
const make = () => {
  const m = createCubes({ sessionId: 'test', random: () => 0 });
  const events = [];
  m.subscribe((u) => events.push(...u.events));
  return { m, events, state: () => m.snapshot().state };
};
const plan = (m, numbers) => {
  for (const [field, value] of Object.entries(numbers)) m.learnerEdit(field, String(value));
  return m.learnerCommit();
};
const right = (s) => ({ perLayer: s.cubesPerLayer, layers: s.layerCount, total: s.totalCubes });

test('cube: the model counts layers, totals and cubes shut in on every side', () => {
  const { m, state } = make();
  assert.deepEqual([state().dims, state().cubesPerLayer, state().layerCount, state().totalCubes], [[3, 2, 2], 6, 2, 12]);
  assert.equal(state().hasInterior, false);
  assert.ok(exec(m, 'show_example', { kind: 'inside' }).accepted);
  assert.deepEqual([state().dims, state().totalCubes, state().interiorCount, state().hasInterior], [[3, 3, 3], 27, 1, true]);
  // Highlighting a hidden cube is refused where there is none.
  exec(m, 'show_example', { kind: 'layers' });
  assert.equal(exec(m, 'show_teaching', { focus: 'inside' }).error.code, 'no_interior');
});

test('cube: building a layer, stacking and adding back rows are the child’s own actions', () => {
  const { m, state, events } = make();
  exec(m, 'prepare_activity', { kind: 'fill' });
  assert.deepEqual([state().task, state().dims, state().totalCubes], ['fill', [3, 2, 1], 0]);
  assert.equal(m.learnerStack(), false, 'a layer cannot be stacked before it is full');
  assert.ok(m.learnerPlace(2, 1));
  assert.equal(m.learnerPlace(2, 1), false, 'a place is filled once');
  while (!state().layerComplete) m.learnerPlace();
  assert.equal(state().totalCubes, 6);
  m.learnerStack();
  m.learnerStack();
  assert.equal(m.learnerStack(), false, 'three layers is the limit');
  m.learnerDeepen();
  assert.deepEqual([state().dims, state().totalCubes, state().task], [[3, 3, 3], 27, 'explore']);
  assert.ok(events.every((e) => e.name !== 'response_committed'), 'building is not a checked answer');
});

test('cube: a plan is scored exactly, and help before or after it is recorded', () => {
  const { m, state, events } = make();
  exec(m, 'prepare_fresh_box', { difficulty: 'small' });
  assert.deepEqual(state().dims, [2, 2, 2], 'the first small block');
  assert.equal(m.learnerCommit(), false, 'all three boxes are needed');
  // A right total with a wrong layer count is wrong.
  plan(m, { perLayer: 2, layers: 4, total: 8 });
  let attempt = state().attempts.at(-1);
  assert.deepEqual([attempt.correct, attempt.assisted, state().revealed, state().layersOpen], [false, false, true, true]);
  assert.equal(m.learnerEdit('total', '8'), false, 'a checked plan is closed');
  // Reopened with help: right, but assisted.
  assert.ok(exec(m, 'reopen_plan').accepted);
  plan(m, right(state()));
  attempt = state().attempts.at(-1);
  assert.deepEqual([attempt.correct, attempt.assisted, attempt.sceneId], [true, true, state().sceneId]);
  // A fresh block, unaided.
  exec(m, 'prepare_fresh_box', { difficulty: 'small' });
  plan(m, right(state()));
  assert.deepEqual([state().attempts.at(-1).correct, state().attempts.at(-1).assisted], [true, false]);
  // Opening the layers first makes the next plan assisted, and closing them does not undo that.
  exec(m, 'prepare_fresh_box', { difficulty: 'long' });
  m.learnerOpen(true);
  m.learnerOpen(false);
  plan(m, right(state()));
  assert.equal(state().attempts.at(-1).assisted, true);
  assert.equal(events.filter((e) => e.name === 'response_committed').length, 4);
  // A worked example cannot replace a plan that has not been checked.
  exec(m, 'prepare_fresh_box', { difficulty: 'buried' });
  assert.equal(state().hasInterior, true);
  assert.equal(exec(m, 'show_example', { kind: 'layers' }).error.code, 'unfinished_plan');
});

test('cube: fresh blocks are never a shape already seen, in any rotation', () => {
  assert.equal(scorePlan([4, 2, 3], { perLayer: 8, layers: 3, total: 24 }), true);
  assert.equal(scorePlan([4, 2, 3], { perLayer: 12, layers: 2, total: 24 }), false);
  for (const pool of taskPools) for (const dims of pool) assert.ok(!practiceShapes.includes(shapeKey(dims)));
  const used = [...practiceShapes];
  for (let i = 0; i < 4; i++) {
    const next = chooseTask(0, used, false, () => 0);
    assert.ok(!used.includes(shapeKey(next)));
    used.push(shapeKey(next));
  }
  assert.equal(chooseTask(0, taskPools[0].map(shapeKey)), null, 'runs out honestly');
});

test('cube: the wrap-up marks helped plans as helped and unaided ones as the child’s own', async () => {
  const pkg = await loadDirectory('lessons/cube-volume');
  assert.deepEqual(pkg.teaching.evidenceEvents, ['response_committed']);
  for (const name of pkg.teaching.evidenceEvents) assert.ok(descriptor.events[name].properties.assisted);
  const skills = pkg.teaching.selfEvaluation.skills;
  for (const skill of skills) {
    assert.ok(skill.focuses.length, skill.id + ' can be marked');
    assert.ok(!skill.description.endsWith('.'));
  }
  const { m, state, events } = make();
  const stamp = () =>
    stampRecord(
      { focus: 'layers', interpretation: 'understood', evidence: 'checked a plan' },
      { origin: 'observation', work: events.findLast((e) => e.name === 'response_committed'), sceneId: state().sceneId },
    );
  const row = (learning) => outcomeFor(pkg, learning).skills.find((s) => s.skill === 'count-block').state;
  exec(m, 'prepare_fresh_box', { difficulty: 'small' });
  m.learnerOpen(true);
  plan(m, right(state()));
  const helped = stamp();
  assert.equal(row([helped]), 'help');
  exec(m, 'prepare_fresh_box', { difficulty: 'small' });
  plan(m, right(state()));
  assert.equal(row([helped, stamp()]), 'own');
});
