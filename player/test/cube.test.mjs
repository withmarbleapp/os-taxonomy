import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createCubes, descriptor, tutorView } from '../lessons/cube-volume/model/cubes.mjs';
import { chooseTask, practiceShapes, scorePlan, shapeKey, taskPools } from '../lessons/cube-volume/model/cube-tasks.mjs';
import { loadDirectory } from '../packages/authoring-tools/archive.mjs';
import { outcomeFor, stampRecord } from '../packages/teaching-runtime/outcome.mjs';
import { assertUpdate } from '../packages/lesson-contract/contracts.mjs';

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
  m.subscribe((u) => {
    assertUpdate(descriptor, u);
    events.push(...u.events);
  });
  return { m, events, state: () => m.snapshot().state };
};
const plan = (m, numbers) => {
  for (const [field, value] of Object.entries(numbers)) m.enter(field, String(value));
  return m.check();
};
const right = (s) => ({ perLayer: s.cubesPerLayer, layers: s.layerCount, total: s.totalCubes });
const fresh = (m, situation) => exec(m, 'start_check', { question: 'layer_plan', situation });

test('cube: the shipped description is the model’s own', async () => {
  assert.deepEqual(JSON.parse(await readFile(new URL('../lessons/cube-volume/experience.json', import.meta.url))), descriptor);
});

test('cube: the model counts layers, totals and cubes shut in on every side', () => {
  const { m, state } = make();
  assert.deepEqual([state().dims, state().cubesPerLayer, state().layerCount, state().totalCubes], [[3, 2, 2], 6, 2, 12]);
  assert.equal(state().hasInterior, false);
  // Highlighting a hidden cube is refused where there is none.
  assert.equal(exec(m, 'show_moment', { moment: 'inside' }).error.code, 'wrong_moment');
  const shown = exec(m, 'show_moment', { moment: 'larger_example' });
  assert.ok(shown.accepted && shown.continueAfterSpeech);
  assert.deepEqual([state().dims, state().totalCubes, state().interiorCount, state().hasInterior], [[3, 3, 3], 27, 1, true]);
  assert.ok(exec(m, 'show_moment', { moment: 'inside' }).accepted);
  assert.equal(state().focus, 'inside');
  // The lesson words its explanations from the block's own numbers.
  assert.match(exec(m, 'show_moment', { moment: 'layers' }).speech, /9 cubes in each layer and 3 layers\. That makes 27 cubes altogether/);
  assert.equal(state().attempts.length, 0, 'showing is never an answer');
});

test('cube: building a layer, stacking and adding back rows are the child’s own actions', () => {
  const { m, state, events } = make();
  exec(m, 'start_activity', { activity: 'build_layer' });
  assert.deepEqual([state().building, state().dims, state().totalCubes], [true, [3, 2, 1], 0]);
  assert.equal(m.gesture('stack'), false, 'a layer cannot be stacked before it is full');
  assert.ok(m.gesture('place', [2, 1]));
  assert.equal(m.gesture('place', [2, 1]), false, 'a place is filled once');
  // An explanation that points at the block needs a whole block.
  assert.equal(exec(m, 'show_moment', { moment: 'one_layer' }).error.code, 'wrong_moment');
  while (!state().layerComplete) m.gesture('place');
  assert.equal(state().totalCubes, 6);
  m.gesture('stack');
  m.gesture('stack');
  assert.equal(m.gesture('stack'), false, 'three layers is the limit');
  m.gesture('deepen');
  assert.deepEqual([state().dims, state().totalCubes, state().building], [[3, 3, 3], 27, false]);
  assert.ok(events.every((e) => e.name !== 'response_committed'), 'building is not a checked answer');
  // Reaching the goal is recorded, and never as independent evidence.
  assert.deepEqual(events.filter((e) => e.name === 'goal_reached').map((e) => e.data.assisted), [true]);
});

test('cube: the child can turn and open the block whatever is on screen', () => {
  const { m, state } = make();
  assert.ok(m.gesture('turn', 0.3));
  assert.ok(m.gesture('open'));
  assert.equal(state().layersOpen, true);
  fresh(m, 'small');
  assert.ok(m.gesture('turn', 0.3), 'during a plan');
  plan(m, right(state()));
  assert.ok(m.gesture('turn', 0.3), 'after a plan is checked');
  assert.ok(m.gesture('open', false));
});

test('cube: a plan is scored exactly, and help before or after it is recorded', () => {
  const { m, state, events } = make();
  const asked = fresh(m, 'small');
  assert.match(asked.speech, /^Your turn with a new block\. Fill in the three boxes, then press Check my plan\. How many cubes altogether\?$/);
  assert.equal(state().instruction, 'How many cubes altogether?');
  assert.deepEqual(state().dims, [2, 2, 2], 'the first small block');
  assert.equal(m.check(), false, 'all three boxes are needed');
  assert.equal(m.enter('total', 'eight'), false, 'boxes take numbers');
  // A right total with a wrong layer count is wrong.
  plan(m, { perLayer: 2, layers: 4, total: 8 });
  let attempt = state().attempts.at(-1);
  assert.deepEqual([attempt.correct, attempt.assisted, state().revealed, state().layersOpen], [false, false, true, true]);
  assert.deepEqual(tutorView(state()).screen.checkedPlan.wrongFields, ['perLayer', 'layers']);
  assert.equal(m.enter('total', '8'), false, 'a checked plan is closed');
  // Reopened with help: the same boxes, right this time, but assisted.
  assert.ok(exec(m, 'resume_activity').accepted);
  assert.deepEqual(state().entries.map((e) => e.value), ['2', '4', '8'], 'what they entered is still there');
  plan(m, right(state()));
  attempt = state().attempts.at(-1);
  assert.deepEqual([attempt.correct, attempt.assisted, attempt.sceneId], [true, true, state().sceneId]);
  // A fresh block, unaided.
  fresh(m, 'small');
  plan(m, right(state()));
  assert.deepEqual([state().attempts.at(-1).correct, state().attempts.at(-1).assisted], [true, false]);
  // Opening the layers first makes the next plan assisted, and closing them does not undo that.
  fresh(m, 'long');
  m.gesture('open', true);
  m.gesture('open', false);
  plan(m, right(state()));
  assert.equal(state().attempts.at(-1).assisted, true);
  // So does an explanation shown on the block, which leaves the boxes open.
  fresh(m, 'long');
  exec(m, 'show_moment', { moment: 'one_layer' });
  assert.deepEqual([state().mode, state().canAnswer, state().instruction], ['activity', true, state().instruction]);
  plan(m, right(state()));
  assert.equal(state().attempts.at(-1).assisted, true);
  assert.equal(events.filter((e) => e.name === 'response_committed').length, 5);
  // A worked example cannot replace a plan that has not been checked.
  fresh(m, 'large');
  assert.equal(state().hasInterior, true);
  assert.equal(exec(m, 'show_moment', { moment: 'layer_example' }).error.code, 'unfinished_question');
});

test('cube: a spoken plan needs all three numbers and is scored like a typed one', () => {
  const { m, state, events } = make();
  fresh(m, 'small');
  const s = state();
  const say = (values) => exec(m, 'answer_check', { sceneId: s.sceneId, values, words: 'four in a layer, two layers, eight' });
  assert.equal(say(['4', '2']).error.code, 'invalid_answer');
  assert.equal(say(['4', 'two', '8']).error.code, 'invalid_answer');
  assert.equal(state().attempts.length, 0);
  assert.ok(say(['4', '2', '8']).accepted);
  const attempt = state().attempts.at(-1);
  assert.deepEqual([attempt.correct, attempt.assisted, attempt.modality], [true, false, 'voice']);
  assert.equal(events.at(-1).source, 'agent');
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
  // The lesson never repeats one either, and says so when a size runs out.
  const { m, state } = make(),
    seen = new Set();
  let asked = 0;
  for (; asked < 60; asked++) {
    if (!fresh(m, 'large').accepted) break;
    assert.ok(!seen.has(shapeKey(state().dims)));
    seen.add(shapeKey(state().dims));
    plan(m, right(state()));
  }
  assert.ok(asked > 0 && asked < 60);
  assert.equal(fresh(m, 'large').error.code, 'exhausted');
});

test('cube: the wrap-up marks helped plans as helped and unaided ones as the child’s own', async () => {
  const pkg = await loadDirectory('lessons/cube-volume');
  assert.deepEqual(pkg.teaching.evidenceEvents, ['response_committed']);
  assert.deepEqual(pkg.teaching.passiveEvents, ['block_rotated', 'entries_edited']);
  assert.deepEqual(pkg.teaching.teaching, [], 'the lesson words its own explanations');
  for (const name of pkg.teaching.evidenceEvents) {
    assert.ok(descriptor.events[name].properties.assisted);
    assert.ok(descriptor.events[name].properties.sceneId);
  }
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
  fresh(m, 'small');
  m.gesture('open', true);
  plan(m, right(state()));
  const helped = stamp();
  assert.equal(row([helped]), 'help');
  fresh(m, 'small');
  plan(m, right(state()));
  assert.equal(row([helped, stamp()]), 'own');
});

test('starting the layer activity again gives an empty layer, in this model and the next', () => {
  const { m, state } = make();
  exec(m, 'start_activity', { activity: 'build_layer' });
  while (!state().layerComplete) m.gesture('place');
  exec(m, 'start_activity', { activity: 'build_layer' });
  assert.equal(state().filled.length, 0);
  assert.equal(state().layerComplete, false);
  assert.ok(m.gesture('place'));
  const next = make();
  exec(next.m, 'start_activity', { activity: 'build_layer' });
  assert.equal(next.state().filled.length, 0);
});
