import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createMoon, descriptor } from '../lessons/moon-daytime/model/moon.mjs';
import { facts, makeTasks, scorePath } from '../lessons/moon-daytime/model/geometry.mjs';
import { assertUpdate } from '/contract/contracts.mjs';
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
test('Moon descriptor matches; prediction geometry stays unambiguous', async () => {
  assert.deepEqual(
    JSON.parse(await readFile(new URL('../lessons/moon-daytime/experience.json', import.meta.url))),
    descriptor,
  );
  for (let i = 0; i < 50; i++) {
    const tasks = makeTasks();
    assert.equal(tasks.filter((t) => facts(t.theta, t.phi).visible).length, 2);
    for (const t of tasks) {
      const f = facts(t.theta, t.phi);
      assert.ok(f.day && f.sunAltitude > 0.28 && Math.abs(f.moonAltitude) > 0.3);
    }
  }
  assert.ok(scorePath(['sun', 'moon', 'observer']));
  assert.equal(scorePath(['observer', 'moon', 'sun']), false);
});
test('demonstration provides a view, not a learner task or success', () => {
  const m = createMoon();
  m.subscribe((u) => assertUpdate(descriptor, u));
  let s = m.snapshot().state;
  assert.equal(s.mode, 'demonstration');
  assert.equal(s.view, 'sky');
  assert.equal(s.canTurn, false);
  assert.equal(m.answer(0), false);
  exec(m, 'show_moment', { moment: 'light_journey' });
  s = m.snapshot().state;
  assert.equal(s.view, 'space');
  assert.equal(s.rays, true);
  assert.equal(s.attempts.length, 0);
  assert.equal(s.canAnswer, false);
  exec(m, 'show_moment', { moment: 'daytime_without_moon' });
  s = m.snapshot().state;
  assert.ok(s.day);
  assert.equal(s.moonAboveHorizon, false);
  assert.equal(s.view, 'sky');
});
test('child activity supplies meaningful control and preserves geometry on view change', () => {
  const m = createMoon();
  exec(m, 'start_activity', { activity: 'turn_earth' });
  let s = m.snapshot().state;
  assert.equal(s.mode, 'activity');
  assert.ok(s.canTurn);
  assert.equal(s.moonAboveHorizon, false);
  const theta = s.theta;
  m.gesture('turn', 0.2);
  s = m.snapshot().state;
  assert.notEqual(s.theta, theta);
  const coords = [s.theta, s.phi];
  m.control('set_view', { view: 'sky' });
  assert.deepEqual([m.snapshot().state.theta, m.snapshot().state.phi], coords);
  assert.equal(m.snapshot().state.attempts.length, 0);
  m.control('set_view', { view: 'space' });
  assert.deepEqual([m.snapshot().state.theta, m.snapshot().state.phi], coords);
  // Reaching the target is recorded, and exploration is never evidence.
  while (!m.snapshot().state.reached) m.gesture('turn', 0.3);
  assert.deepEqual(
    m.snapshot().state.results.map((r) => [r.item, r.assisted]),
    [['turn_earth', true]],
  );
  exec(m, 'start_check', { question: 'moon_visible', situation: 'fresh' });
  const before = m.snapshot();
  assert.equal(m.gesture('turn', 0.2), false);
  assert.deepEqual(m.snapshot(), before);
});
test('support pauses current prediction then resumes same task with help provenance', () => {
  const m = createMoon();
  exec(m, 'start_check', { question: 'moon_visible', situation: 'fresh' });
  const initial = m.snapshot().state;
  assert.equal(exec(m, 'show_moment', { moment: 'daytime_without_moon' }).accepted, false);
  exec(m, 'show_moment', { moment: 'horizon' });
  let s = m.snapshot().state;
  assert.equal(s.sceneId, initial.sceneId);
  assert.equal(s.mode, 'demonstration');
  assert.equal(s.canAnswer, false);
  assert.equal(m.answer(0), false);
  exec(m, 'resume_activity');
  s = m.snapshot().state;
  assert.equal(s.sceneId, initial.sceneId);
  assert.equal(s.canAnswer, true);
  assert.equal(s.assisted, true);
  m.answer(s.moonAboveHorizon ? 1 : 0);
  const wrong = m.snapshot().state.attempts[0];
  assert.equal(wrong.correct, false);
  exec(m, 'resume_activity');
  m.answer(m.snapshot().state.moonAboveHorizon ? 0 : 1);
  assert.deepEqual(m.snapshot().state.attempts[0], wrong);
  assert.equal(m.snapshot().state.attempts.at(-1).correct, true);
  assert.equal(m.snapshot().state.attempts.at(-1).assisted, true);
});
test('light demonstration transfers no credit and later reconstruction remains assisted', () => {
  const m = createMoon();
  exec(m, 'show_moment', { moment: 'light_journey' });
  exec(m, 'start_check', { question: 'light_path' });
  assert.equal(m.snapshot().state.rays, false);
  assert.equal(m.snapshot().state.assisted, true);
  m.tap('sun');
  assert.equal(m.check(), false);
  m.tap('moon');
  exec(m, 'show_moment', { moment: 'light_journey' });
  assert.deepEqual(m.snapshot().state.draft, ['sun', 'moon']);
  assert.equal(m.tap('observer'), false);
  exec(m, 'resume_activity');
  assert.deepEqual(m.snapshot().state.draft, ['sun', 'moon']);
  m.tap('observer');
  m.check();
  assert.equal(m.snapshot().state.attempts.at(-1).correct, true);
  assert.equal(m.snapshot().state.attempts.at(-1).assisted, true);
  // With no route drawn beforehand, building it is the child's own work.
  const own = createMoon();
  exec(own, 'show_moment', { moment: 'daytime_moon' });
  exec(own, 'start_check', { question: 'light_path' });
  for (const id of ['sun', 'moon', 'observer']) own.tap(id);
  own.check();
  assert.deepEqual([own.snapshot().state.attempts[0].correct, own.snapshot().state.attempts[0].assisted], [true, false]);
});
test('commands remain stale-safe and idempotent after new moment staging', () => {
  const m = createMoon(),
    s = m.snapshot();
  const c = {
    protocolVersion: 1,
    sessionId: s.sessionId,
    releaseId: s.releaseId,
    commandId: 'one',
    expectedRevision: s.revision,
    name: 'show_moment',
    args: { moment: 'horizon' },
  };
  const r = m.execute(c);
  assert.ok(r.accepted);
  assert.deepEqual(m.execute(c), r);
  assert.equal(m.execute({ ...c, commandId: 'two' }).accepted, false);
});
test('matched light moments distinguish local night, day and blocked view with Moon fixed', () => {
  const m = createMoon();
  for (const [moment, day, visible] of [['night_light', false, true], ['daytime_light', true, true], ['blocked_light', true, false]]) {
    assert.ok(exec(m, 'show_moment', {moment}).accepted);
    const s = m.snapshot().state;
    assert.equal(s.phi, 1.55);
    assert.equal(s.day, day);
    assert.equal(s.moonAboveHorizon, visible);
    assert.ok(s.rays && s.horizon);
    assert.equal(s.view, 'space');
    assert.equal(s.attempts.length, 0);
  }
});
test('small supported checks score the intended relationship and preserve assistance on retry', () => {
  const m = createMoon();
  for (const situation of ['night', 'day', 'below']) {
    for (const question of ['day_night', 'moon_visible']) {
      assert.ok(exec(m, 'start_check', {question, situation}).accepted);
      const s = m.snapshot().state;
      const answer = (question === 'day_night' ? s.day : s.moonAboveHorizon) ? 0 : 1;
      assert.ok(s.rays && s.horizon && s.assisted && s.canAnswer);
      assert.equal(m.gesture('turn', 0.2), false);
      m.answer(1 - answer);
      const wrong = m.snapshot().state.attempts.at(-1);
      assert.equal(wrong.correct, false);
      exec(m, 'show_moment', {moment:'light_journey'});
      exec(m, 'resume_activity');
      m.answer(answer);
      assert.equal(m.snapshot().state.attempts.at(-1).correct, true);
      assert.equal(m.snapshot().state.attempts.at(-1).assisted, true);
      assert.deepEqual(m.snapshot().state.attempts.at(-2), wrong);
    }
  }
  exec(m, 'start_check', {question:'moon_visible', situation:'fresh'});
  assert.equal(m.snapshot().state.rays, false);
  assert.equal(m.snapshot().state.assisted, false);
});
test('one question owns spoken text, screen text, choices and both answer modalities', async () => {
  const { questionFor, tutorView } = await import('../lessons/moon-daytime/model/moon.mjs');
  for (const question of ['day_night', 'moon_visible']) {
    const button = createMoon(), voice = createMoon();
    const b = exec(button, 'start_check', {question, situation:'day'});
    const v = exec(voice, 'start_check', {question, situation:'day'});
    const q = questionFor(v.snapshot.state);
    assert.equal(v.speech, q.question);
    assert.equal(v.speech, v.snapshot.state.instruction);
    assert.deepEqual(q.choices, question === 'day_night' ? ['Day','Night'] : ['Yes','No']);
    assert.equal(exec(voice, 'start_check', {question, situation:'night'}).accepted, false);
    assert.equal(exec(voice, 'answer_check', {sceneId:'old', choice:0, words:'yes'}).accepted, false);
    button.answer(0);
    const result = exec(voice, 'answer_check', {sceneId:q.id, choice:0, words:question === 'day_night' ? 'It is day' : 'Yes'});
    assert.ok(result.accepted);
    const va = voice.snapshot().state.attempts.at(-1), ba = button.snapshot().state.attempts.at(-1);
    assert.equal(va.correct, ba.correct);
    assert.equal(va.answer, ba.answer);
    assert.equal(va.assisted, ba.assisted);
    assert.equal(va.modality, 'voice');
    assert.equal(ba.modality, 'button');
    assert.ok(va.words);
    assert.equal(tutorView(voice.snapshot().state).currentCheck.status, 'answered');
    assert.deepEqual(tutorView(voice.snapshot().state).currentCheck.response, va);
    assert.ok(exec(voice, 'show_moment', {moment:'blocked_light'}).accepted);
  }
});
test('leaving a pending check unblocks a new moment without manufacturing evidence', () => {
  const m = createMoon();
  exec(m, 'start_check', {question:'moon_visible', situation:'day'});
  assert.equal(exec(m, 'show_moment', {moment:'blocked_light'}).accepted, false);
  assert.ok(exec(m, 'leave_activity').accepted);
  assert.ok(exec(m, 'show_moment', {moment:'blocked_light'}).accepted);
  assert.equal(m.snapshot().state.attempts.length, 0);
});
test('screen diagram and explorer visibility remain distinct at night', async () => {
  const {tutorView} = await import('../lessons/moon-daytime/model/moon.mjs');
  const m = createMoon();
  exec(m,'show_moment',{moment:'night_light'});
  let v = tutorView(m.snapshot().state);
  assert.equal(v.screen.explorer.time,'nighttime');
  assert.ok(v.screen.view.visibleObjects.some(x=>x.startsWith('Sun')));
  exec(m,'set_view',{view:'sky'});
  v = tutorView(m.snapshot().state);
  assert.deepEqual(v.screen.view.aboveHorizon,['Moon']);
});

test('a fresh prediction is never a near copy of an arrangement already shown', () => {
  const shown = { blocked_light: 3.95, daytime_without_moon: 3.95, daytime_moon: 2.35, daytime_light: 2.35 };
  for (const [moment, theta] of Object.entries(shown))
    for (let seed = 0; seed < 200; seed++) {
      let n = seed;
      const random = () => ((n = (n * 1103515245 + 12345) % 2147483648), n / 2147483648);
      const m = createMoon({ sessionId: 'test', random });
      exec(m, 'show_moment', { moment });
      exec(m, 'start_check', { question: 'moon_visible', situation: 'fresh' });
      const s = m.snapshot().state;
      assert.ok(Math.abs(s.theta - theta) >= 0.15 || Math.abs(s.phi - 1.55) >= 0.15, `${moment} seed ${seed}`);
    }
});
