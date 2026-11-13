import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createMoon, descriptor } from '../lessons/moon-daytime/model/moon.mjs';
import { facts, makeTasks, scorePath } from '../lessons/moon-daytime/model/geometry.mjs';
import { assertUpdate } from '../lessons/moon-daytime/contracts.mjs';
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
  assert.equal(m.learnerPredict(true), false);
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
  assert.equal(s.canMoveMoon, false);
  assert.equal(s.moonAboveHorizon, false);
  const theta = s.theta;
  m.learnerTurn(0.2);
  s = m.snapshot().state;
  assert.notEqual(s.theta, theta);
  const coords = [s.theta, s.phi];
  m.learnerView('sky');
  assert.deepEqual([m.snapshot().state.theta, m.snapshot().state.phi], coords);
  assert.equal(m.snapshot().state.attempts.length, 0);
  m.learnerView('space');
  assert.deepEqual([m.snapshot().state.theta, m.snapshot().state.phi], coords);
  exec(m, 'start_activity', { activity: 'predict_sky' });
  const before = m.snapshot();
  assert.equal(m.learnerTurn(0.2), false);
  assert.equal(m.learnerMoon(0.2), false);
  assert.deepEqual(m.snapshot(), before);
});
test('support pauses current prediction then resumes same task with help provenance', () => {
  const m = createMoon();
  exec(m, 'start_activity', { activity: 'predict_sky' });
  const initial = m.snapshot().state;
  assert.equal(exec(m, 'show_moment', { moment: 'daytime_without_moon' }).accepted, false);
  exec(m, 'show_moment', { moment: 'horizon' });
  let s = m.snapshot().state;
  assert.equal(s.sceneId, initial.sceneId);
  assert.equal(s.mode, 'demonstration');
  assert.equal(s.canAnswer, false);
  assert.equal(m.learnerPredict(true), false);
  exec(m, 'resume_activity');
  s = m.snapshot().state;
  assert.equal(s.sceneId, initial.sceneId);
  assert.equal(s.canAnswer, true);
  assert.equal(s.assisted, true);
  m.learnerPredict(!s.moonAboveHorizon);
  const wrong = m.snapshot().state.attempts[0];
  assert.equal(wrong.correct, false);
  exec(m, 'resume_activity');
  m.learnerPredict(m.snapshot().state.moonAboveHorizon);
  assert.deepEqual(m.snapshot().state.attempts[0], wrong);
  assert.equal(m.snapshot().state.attempts.at(-1).correct, true);
  assert.equal(m.snapshot().state.attempts.at(-1).assisted, true);
});
test('light demonstration transfers no credit and later reconstruction remains assisted', () => {
  const m = createMoon();
  exec(m, 'show_moment', { moment: 'light_journey' });
  exec(m, 'start_activity', { activity: 'build_light_path' });
  assert.equal(m.snapshot().state.rays, false);
  assert.equal(m.snapshot().state.assisted, true);
  m.learnerTap('sun');
  assert.equal(m.learnerCheckPath(), false);
  m.learnerTap('moon');
  exec(m, 'show_moment', { moment: 'light_journey' });
  assert.deepEqual(m.snapshot().state.path, ['sun', 'moon']);
  assert.equal(m.learnerTap('observer'), false);
  exec(m, 'resume_activity');
  assert.deepEqual(m.snapshot().state.path, ['sun', 'moon']);
  m.learnerTap('observer');
  m.learnerCheckPath();
  assert.equal(m.snapshot().state.attempts.at(-1).correct, true);
  assert.equal(m.snapshot().state.attempts.at(-1).assisted, true);
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
      const answer = question === 'day_night' ? s.day : s.moonAboveHorizon;
      assert.ok(s.rays && s.horizon && s.assisted && s.canAnswer);
      assert.equal(m.learnerTurn(0.2), false);
      m.learnerPredict(!answer);
      const wrong = m.snapshot().state.attempts.at(-1);
      assert.equal(wrong.correct, false);
      exec(m, 'show_moment', {moment:'light_journey'});
      exec(m, 'resume_activity');
      m.learnerPredict(answer);
      assert.equal(m.snapshot().state.attempts.at(-1).correct, true);
      assert.equal(m.snapshot().state.attempts.at(-1).assisted, true);
      assert.deepEqual(m.snapshot().state.attempts.at(-2), wrong);
    }
  }
  exec(m, 'start_activity', {activity:'predict_sky'});
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
    assert.equal(exec(voice, 'answer_check', {sceneId:'old', answer:true, words:'yes'}).accepted, false);
    button.learnerPredict(true);
    const result = exec(voice, 'answer_check', {sceneId:q.id, answer:true, words:question === 'day_night' ? 'It is day' : 'Yes'});
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
  assert.equal(v.explorer.time,'nighttime');
  assert.ok(v.screen.visibleObjects.some(x=>x.startsWith('Sun')));
  exec(m,'set_view',{view:'sky'});
  v = tutorView(m.snapshot().state);
  assert.deepEqual(v.screen.aboveHorizon,['Moon']);
});
