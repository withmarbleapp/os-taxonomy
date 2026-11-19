import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRainbow, descriptor, predictionCases, questionFor, tutorView } from '../lessons/how-rainbows-form/model/rainbow.mjs';
import { COLOURS, DEG, dropRay, rainbowAngleDeg, rainbow, bowDirections, sunDirection, facingWater, wrap } from '../lessons/how-rainbows-form/model/optics.mjs';
import { assertUpdate } from '/contract/contracts.mjs';

const exec = (m, name, args = {}, patch = {}) => {
  const s = m.snapshot();
  return m.execute({
    protocolVersion: 1,
    sessionId: s.sessionId,
    releaseId: s.releaseId,
    commandId: crypto.randomUUID(),
    expectedRevision: s.revision,
    name,
    args,
    ...patch,
  });
};
const make = (random) => {
  const m = createRainbow({ sessionId: 'test', ...(random ? { random } : {}) });
  const events = [];
  m.subscribe((u) => {
    assertUpdate(descriptor, u);
    events.push(...u.events);
  });
  return { m, events, state: () => m.snapshot().state };
};
const W = Math.PI;
const base = { sunAz: W, sunHeight: 'low', sunShining: true, raining: true, source: 'rain', spot: W, heading: 0 };

test('experience.json is the serialised descriptor', async () => {
  assert.deepEqual(JSON.parse(await readFile(new URL('../lessons/how-rainbows-form/experience.json', import.meta.url))), descriptor);
});

test('one drop: light returns on the Sun side, at most about 42 degrees from straight back', () => {
  const red = rainbowAngleDeg(COLOURS[0].n),
    violet = rainbowAngleDeg(COLOURS[2].n);
  assert.ok(Math.abs(red.angle - 42.4) < 0.3, `red ${red.angle}`);
  assert.ok(Math.abs(violet.angle - 40.6) < 0.3, `violet ${violet.angle}`);
  assert.ok(red.angle > violet.angle, 'red leaves at the larger angle, so it is the outer colour');
  for (let b = 0.05; b < 0.98; b += 0.03)
    for (const c of COLOURS) {
      const r = dropRay(b, c.n);
      assert.ok(r.out[0] < 0, 'leaving light heads back towards the Sun side');
      assert.ok(r.out[1] < 0, 'and downwards when it entered above the middle');
      assert.ok(r.through[0] > 0, 'unreflected light leaves through the back');
      assert.ok(r.backAngleDeg <= red.angle + 1e-6);
      for (const p of [r.entry, r.back, r.exit]) assert.ok(Math.abs(Math.hypot(...p) - 1) < 1e-9, 'points lie on the drop');
    }
  // Violet bends more than red on the way in.
  assert.ok(dropRay(0.86, 1.343).inside[1] < dropRay(0.86, 1.331).inside[1]);
});

test('the bow is 42 degrees from the point opposite the Sun', () => {
  for (const h of ['low', 'mid', 'high']) {
    const s = sunDirection(1.1, h);
    for (const d of bowDirections(1.1, h)) {
      const cos = -(d[0] * s[0] + d[1] * s[1] + d[2] * s[2]);
      assert.ok(Math.abs(Math.acos(cos) / DEG - 42) < 1e-6);
    }
  }
  assert.ok(Math.abs(rainbow(base).topDeg - 22) < 1e-9);
});

test('a rainbow needs sunlight, drops, the Sun behind and the right gaze', () => {
  assert.equal(rainbow(base).status, 'rainbow');
  assert.equal(rainbow(base).amount, 'most of a bow');
  assert.equal(rainbow({ ...base, sunShining: false }).status, 'no_sunlight');
  assert.equal(rainbow({ ...base, raining: false }).status, 'no_drops');
  assert.equal(rainbow({ ...base, heading: W }).status, 'looking_away');
  assert.equal(rainbow({ ...base, spot: 0, heading: W }).status, 'drops_elsewhere');
  assert.equal(rainbow({ ...base, spot: W / 2, heading: facingWater(W / 2) }).status, 'drops_elsewhere');
  assert.equal(rainbow({ ...base, sunHeight: 'high' }).status, 'sun_too_high');
  assert.equal(rainbow({ ...base, sunHeight: 'mid' }).status, 'rainbow');
  // Part way round, only a piece of the bow has drops behind it.
  const part = rainbow({ ...base, spot: wrap(W + 50 * DEG), heading: facingWater(wrap(W + 50 * DEG)) });
  assert.equal(part.amount, 'a piece of a bow');
  // The same holds wherever the Sun is, and at the fountain.
  for (const sunAz of [0, 2, 3.7, 5.5])
    for (const source of ['rain', 'fountain']) {
      assert.equal(rainbow({ ...base, source, sunAz, spot: sunAz, heading: facingWater(sunAz) }).status, 'rainbow');
      assert.equal(rainbow({ ...base, source, sunAz, spot: wrap(sunAz + W), heading: facingWater(sunAz + W) }).status, 'drops_elsewhere');
    }
});

test('prediction cases are unambiguous and balanced enough', () => {
  const cases = predictionCases();
  assert.ok(cases.filter((c) => c.seen).length >= 5);
  assert.ok(cases.filter((c) => !c.seen).length >= 5);
  for (const c of cases) {
    const f = rainbow(c);
    assert.equal(f.seen, c.seen);
    assert.ok(c.seen ? f.share >= 0.5 : f.share === 0);
    assert.notEqual(c.key, 'rain:180:sun_behind');
  }
});

test('the opening is a demonstration, not learner work', () => {
  const { state, m } = make();
  assert.equal(state().mode, 'demonstration');
  assert.equal(state().rainbowStatus, 'rainbow');
  assert.equal(state().attempts.length + state().results.length, 0);
  assert.equal(tutorView(state()).screen.mia.sees, 'a rainbow (most of a bow)');
  assert.ok(!m.snapshot().availableActions.includes('answer_check'));
  assert.equal(m.gesture('toggle_sun'), false);
});

test('every moment returns authored speech and continues the turn', () => {
  for (const moment of descriptor.actions[0].inputSchema.properties.moment.enum) {
    const { m, state } = make();
    const r = exec(m, 'show_moment', { moment });
    assert.ok(r.accepted, moment);
    assert.ok(r.speech.length > 20 && r.speech.length <= 650, moment);
    assert.equal(r.continueAfterSpeech, true);
    assert.equal(state().mode, 'demonstration');
    assert.equal(state().view, ['inside_drop', 'colours_spread'].includes(moment) ? 'drop' : 'outdoor');
    assert.ok(state().shown.includes(moment));
    assert.equal(state().results.length, 0);
  }
  const { m, state } = make();
  exec(m, 'show_moment', { moment: 'high_sun' });
  assert.equal(state().rainbowStatus, 'sun_too_high');
  assert.ok(state().cone);
});

test('sunlight_path speech is true of the current arrangement', () => {
  const { m } = make();
  assert.match(exec(m, 'show_moment', { moment: 'sunlight_path' }).speech, /back to Mia’s eyes/);
  exec(m, 'start_activity', { activity: 'turn_to_find' });
  assert.match(exec(m, 'show_moment', { moment: 'sunlight_path' }).speech, /looking the other way/);
  exec(m, 'start_activity', { activity: 'walk_around' });
  assert.match(exec(m, 'show_moment', { moment: 'sunlight_path' }).speech, /not standing there/);
  exec(m, 'start_activity', { activity: 'sun_and_rain' });
  assert.match(exec(m, 'show_moment', { moment: 'sunlight_path' }).speech, /no drops/);
});

test('sun and rain: the rainbow needs both, and the first one is reported once', () => {
  const { m, state, events } = make();
  const r = exec(m, 'start_activity', { activity: 'sun_and_rain' });
  assert.ok(r.speech.includes('Tap the rain cloud'));
  assert.equal(r.continueAfterSpeech, undefined);
  assert.equal(state().rainbowStatus, 'no_drops');
  m.gesture('toggle_water');
  assert.equal(state().rainbowStatus, 'rainbow');
  assert.equal(events.filter((e) => e.name === 'goal_reached').length, 1);
  assert.equal(events.find((e) => e.name === 'goal_reached').source, 'learner');
  m.gesture('toggle_sun');
  assert.equal(state().rainbowStatus, 'no_sunlight');
  assert.match(state().instruction, /No sunlight/);
  m.gesture('toggle_sun');
  assert.equal(state().rainbowStatus, 'rainbow');
  assert.equal(events.filter((e) => e.name === 'goal_reached').length, 1, 'not reported again in the same scene');
  assert.deepEqual(state().results.map((f) => [f.item, f.assisted]), [['sun_and_rain', true]]);
  assert.equal(m.gesture('turn', 1), false, 'only the clouds can be changed here');
  assert.equal(m.gesture('walk', 1), false);
});

test('turning and walking isolate one decision each', () => {
  const { m, state, events } = make();
  exec(m, 'start_activity', { activity: 'turn_to_find' });
  assert.equal(state().rainbowStatus, 'looking_away');
  assert.equal(m.gesture('walk', 0), false);
  assert.equal(m.gesture('toggle_sun'), false);
  m.gesture('turn', Math.PI / 2);
  assert.equal(state().rainbowStatus, 'looking_away');
  m.gesture('turn', 0);
  assert.equal(state().rainbowStatus, 'rainbow');
  assert.equal(events.at(-1).name, 'goal_reached');
  exec(m, 'start_activity', { activity: 'walk_around' });
  assert.equal(state().rainbowStatus, 'drops_elsewhere');
  assert.equal(m.gesture('turn', 1), false);
  m.gesture('walk', Math.PI / 2);
  assert.equal(state().rainbowStatus, 'drops_elsewhere');
  assert.ok(Math.abs(state().heading - facingWater(Math.PI / 2)) < 1e-9, 'she keeps looking at the rain');
  m.gesture('walk', Math.PI);
  assert.equal(state().rainbowStatus, 'rainbow');
  assert.equal(state().results.length, 2);
});

test('make_rainbow: independent unless a hint was used', () => {
  for (const hint of [false, true]) {
    const { m, state } = make();
    exec(m, 'start_activity', { activity: 'make_rainbow' });
    assert.equal(state().source, 'fountain');
    assert.equal(state().sunAz, 0);
    assert.equal(state().rainbowStatus, 'no_drops');
    assert.equal(state().rays, 'none');
    if (hint) m.hint();
    m.gesture('toggle_water');
    assert.notEqual(state().rainbowStatus, 'rainbow');
    m.gesture('walk', 0);
    m.gesture('turn', Math.PI);
    assert.equal(state().rainbowStatus, 'rainbow');
    assert.deepEqual(state().results.map((f) => [f.item, f.detail, f.assisted]), [['make_rainbow', state().rainbowAmount, hint]]);
  }
});

test('sun height: the bow sinks and disappears', () => {
  const { m, state } = make();
  exec(m, 'start_activity', { activity: 'sun_height' });
  assert.equal(state().rainbowStatus, 'rainbow');
  m.gesture('move_sun');
  assert.equal(state().sunHeight, 'mid');
  assert.equal(state().rainbowStatus, 'rainbow');
  m.gesture('move_sun');
  assert.equal(state().rainbowStatus, 'sun_too_high');
  assert.equal(state().results.length, 0, 'not a finding task');
});

test('aim the sunbeam is unscored and clamped', () => {
  const { m, state } = make();
  exec(m, 'start_activity', { activity: 'aim_sunbeam' });
  assert.equal(state().view, 'drop');
  m.gesture('aim', 2);
  assert.equal(state().beam, 0.97);
  m.gesture('aim', 0.3);
  assert.equal(state().beam, 0.3);
  assert.equal(state().attempts.length, 0);
  assert.ok(tutorView(state()).screen.drop.lightLeavesDeg < 42.5);
});

test('checks: one question object for speech, screen and buttons; exact scoring from geometry', () => {
  const expected = { sun_behind: 'Yes', far_side: 'No', side_on: 'No', facing_sun: 'No', cloud_over_sun: 'No', water_off: 'No', high_sun: 'No' };
  for (const [situation, right] of Object.entries(expected))
    for (const pick of [0, 1]) {
      const { m, state } = make();
      const r = exec(m, 'start_check', { question: 'see_rainbow', situation });
      const q = questionFor(state());
      assert.ok(r.speech.endsWith(q.question));
      assert.equal(r.continueAfterSpeech, undefined);
      assert.equal(state().instruction, q.question);
      assert.equal(q.status, 'awaiting_answer');
      assert.equal(q.response, null);
      assert.ok(state().windowCovered);
      assert.equal(tutorView(state()).screen.mia.sees, 'hidden from the child');
      assert.equal(state().rays, 'sunlight');
      m.answer(pick);
      const a = state().attempts.at(-1);
      assert.equal(a.answer, q.choices[pick]);
      assert.equal(a.correct, q.choices[pick] === right, `${situation} ${pick}`);
      assert.equal(a.modality, 'button');
      assert.equal(a.assisted, false);
      assert.equal(state().windowCovered, false);
      assert.ok(state().instruction.startsWith(right));
      assert.equal(questionFor(state()).status, 'answered');
      assert.deepEqual(questionFor(state()).response, a);
    }
  const fixed = { sun_where: 'Behind Mia', drop_exit: 'Back on the Sun’s side', drop_colours: 'They were already in the sunlight', reach_rainbow: 'No, it moves when she moves' };
  for (const [question, right] of Object.entries(fixed)) {
    const { m, state } = make();
    exec(m, 'start_check', { question });
    const q = questionFor(state());
    assert.equal(state().view, question.startsWith('drop') ? 'drop' : 'outdoor');
    if (question === 'drop_exit') assert.equal(state().dropStage, 'to_bounce');
    if (question === 'sun_where') assert.ok(state().windowCovered);
    m.answer(q.choices.indexOf(right));
    assert.ok(state().attempts.at(-1).correct, question);
    assert.equal(state().dropStage, 'full');
    if (question === 'sun_where') assert.equal(state().rainbowStatus, 'rainbow');
  }
  const { m } = make();
  assert.equal(exec(m, 'start_check', { question: 'see_rainbow' }).accepted, false);
});

test('a spoken answer scores like a button and keeps its words', () => {
  const run = (voice) => {
    const { m, state, events } = make();
    exec(m, 'start_check', { question: 'see_rainbow', situation: 'far_side' });
    if (voice) {
      const r = exec(m, 'answer_check', { sceneId: state().sceneId, choice: 1, words: 'nope, the sun is in her face' });
      assert.ok(r.accepted);
    } else m.answer(1);
    return { a: state().attempts.at(-1), e: events.at(-1), s: state() };
  };
  const b = run(false),
    v = run(true);
  assert.equal(b.a.correct, true);
  assert.equal(v.a.correct, true);
  assert.equal(v.a.modality, 'voice');
  assert.equal(v.a.words, 'nope, the sun is in her face');
  assert.equal(b.a.modality, 'button');
  assert.equal(b.a.words, '');
  assert.equal(v.e.source, 'agent', 'a voice commit must not cancel the tutor turn');
  assert.equal(b.e.source, 'learner');
  assert.equal(b.s.instruction, v.s.instruction);
});

test('stale commands and stale questions are rejected', () => {
  const { m, state } = make();
  exec(m, 'start_check', { question: 'sun_where' });
  const old = state().sceneId;
  assert.equal(exec(m, 'answer_check', { sceneId: 'other', choice: 0, words: 'behind' }).error.code, 'stale_question');
  assert.equal(exec(m, 'start_check', { question: 'drop_exit' }).error.code, 'unavailable', 'a pending question is not replaced');
  assert.equal(exec(m, 'show_moment', { moment: 'why_a_bow' }).error.code, 'unfinished_question');
  assert.equal(exec(m, 'answer_check', { sceneId: old, choice: 0, words: 'behind' }, { expectedRevision: 0 }).error.code, 'stale');
  assert.equal(state().attempts.length, 0);
  m.answer(0);
  assert.equal(exec(m, 'answer_check', { sceneId: old, choice: 1, words: 'in front' }).error.code, 'unavailable');
  exec(m, 'start_check', { question: 'drop_exit' });
  assert.equal(exec(m, 'answer_check', { sceneId: old, choice: 1, words: 'back' }).error.code, 'stale_question');
  assert.equal(state().attempts.length, 1);
});

test('help pauses a question, marks it assisted, and returns to the same question', () => {
  const { m, state } = make();
  exec(m, 'start_check', { question: 'see_rainbow', situation: 'far_side' });
  const id = state().sceneId,
    before = { spot: state().spot, heading: state().heading };
  const help = exec(m, 'show_moment', { moment: 'sunlight_path' });
  assert.ok(help.accepted);
  assert.equal(questionFor(state()).status, 'paused_for_help');
  assert.equal(m.answer(1), false, 'no answering while paused');
  assert.ok(state().windowCovered, 'help does not uncover the window');
  // The close-up keeps the outdoor arrangement.
  exec(m, 'show_moment', { moment: 'inside_drop' });
  assert.equal(state().view, 'drop');
  const back = exec(m, 'resume_activity');
  assert.ok(back.speech.endsWith('Can Mia see a rainbow from here?'));
  assert.equal(state().view, 'outdoor');
  assert.equal(state().sceneId, id);
  assert.deepEqual({ spot: state().spot, heading: state().heading }, before);
  assert.equal(questionFor(state()).status, 'awaiting_answer');
  m.answer(1);
  assert.deepEqual([state().attempts[0].correct, state().attempts[0].assisted], [true, true]);
});

test('a corrected answer becomes current; the first attempt stays as history', () => {
  const { m, state } = make();
  exec(m, 'start_check', { question: 'see_rainbow', situation: 'facing_sun' });
  m.answer(0);
  const first = structuredClone(state().attempts[0]);
  assert.equal(first.correct, false);
  assert.ok(m.snapshot().availableActions.includes('resume_activity'));
  exec(m, 'resume_activity');
  assert.ok(state().windowCovered);
  assert.equal(questionFor(state()).status, 'awaiting_answer');
  m.answer(1);
  assert.deepEqual(state().attempts[0], first);
  assert.equal(state().attempts.length, 2);
  assert.deepEqual([state().attempts[1].correct, state().attempts[1].assisted], [true, true]);
  assert.deepEqual(tutorView(state()).currentAttempt, state().attempts[1]);
});

test('unfinished work can be left without inventing an answer', () => {
  const { m, state } = make();
  exec(m, 'start_check', { question: 'drop_colours' });
  assert.ok(exec(m, 'leave_activity').accepted);
  assert.equal(state().attempts.length, 0);
  assert.equal(questionFor(state()), null);
  assert.ok(exec(m, 'start_activity', { activity: 'walk_around' }).accepted);
});

test('help during an investigation returns to the same arrangement with its history', () => {
  const { m, state } = make();
  exec(m, 'start_activity', { activity: 'walk_around' });
  m.gesture('walk', 1.2);
  const spot = state().spot;
  exec(m, 'show_moment', { moment: 'colours_spread' });
  assert.equal(m.gesture('walk', 2), false);
  exec(m, 'resume_activity');
  assert.equal(state().spot, spot);
  assert.equal(state().view, 'outdoor');
  assert.ok(state().canWalk);
});

test('predictions are fresh, unsupported and never repeat', () => {
  const seq = [0.1, 0.9, 0.6, 0.2, 0.4, 0.8, 0.3, 0.7];
  let i = 0;
  const { m, state } = make(() => seq[i++ % seq.length]);
  const seenKeys = new Set();
  let yes = 0;
  for (let k = 0; k < 12; k++) {
    const r = exec(m, 'start_check', { question: 'see_rainbow', situation: 'fresh' });
    assert.ok(r.accepted);
    assert.ok(r.speech.endsWith('Can Mia see a rainbow from here?'));
    const s = state();
    assert.ok(s.windowCovered);
    assert.equal(s.rays, 'none');
    assert.equal(s.assisted, false);
    const key = [s.source, s.sunAz, s.spot, s.heading, s.sunShining, s.raining].join();
    assert.ok(!seenKeys.has(key));
    seenKeys.add(key);
    const truth = rainbow(s).seen;
    yes += truth;
    m.answer(truth ? 0 : 1);
    assert.ok(state().attempts.at(-1).correct);
    assert.deepEqual([state().attempts.at(-1).item, state().attempts.at(-1).situation], ['see_rainbow', 'fresh']);
  }
  assert.ok(yes >= 3 && yes <= 9);
  // A hint is recorded with the attempt it affected.
  exec(m, 'start_check', { question: 'see_rainbow', situation: 'fresh' });
  m.hint();
  assert.equal(state().instruction, 'Can Mia see a rainbow from here?', 'a hint leaves the question on screen');
  assert.equal(state().rays, 'full');
  assert.ok(state().windowCovered);
  m.answer(0);
  assert.equal(state().attempts.at(-1).assisted, true);
});

test('repeated command ids are answered once', () => {
  const { m, state } = make();
  const s = m.snapshot();
  const c = { protocolVersion: 1, sessionId: s.sessionId, releaseId: s.releaseId, commandId: 'same', expectedRevision: s.revision, name: 'start_activity', args: { activity: 'sun_and_rain' } };
  const a = m.execute(c),
    rev = m.snapshot().revision,
    b = m.execute(c);
  assert.deepEqual(a, b);
  assert.equal(m.snapshot().revision, rev);
  assert.deepEqual([state().kind, state().item], ['do', 'sun_and_rain']);
});

test('the wrap-up marks helped work as helped and unaided work as the child’s own', async () => {
  const { loadDirectory } = await import('../packages/authoring-tools/archive.mjs');
  const { outcomeFor, stampRecord } = await import('../packages/teaching-runtime/outcome.mjs');
  const pkg = await loadDirectory('lessons/how-rainbows-form');
  assert.deepEqual(pkg.teaching.evidenceEvents, ['response_committed', 'goal_reached']);
  for (const name of pkg.teaching.evidenceEvents)
    for (const field of ['assisted', 'sceneId']) assert.ok(descriptor.events[name].properties[field], `${name} carries ${field}`);
  const { m, state, events } = make();
  const stamp = (focus) =>
    stampRecord(
      { focus, interpretation: 'understood', evidence: 'committed work' },
      { origin: 'observation', work: events.findLast((e) => pkg.teaching.evidenceEvents.includes(e.name)), sceneId: state().sceneId },
    );
  const row = (learning) => outcomeFor(pkg, learning).skills.find((s) => s.skill === 'find-a-rainbow').state;
  // A question answered after help, then a fresh one answered unaided.
  exec(m, 'start_check', { question: 'see_rainbow', situation: 'fresh' });
  m.hint();
  m.answer(rainbow(state()).seen ? 0 : 1);
  const helped = stamp('position');
  assert.equal(row([helped]), 'help');
  exec(m, 'start_check', { question: 'see_rainbow', situation: 'fresh' });
  m.answer(rainbow(state()).seen ? 0 : 1);
  assert.equal(row([helped, stamp('position')]), 'own');
  // An investigation's rainbow is never the child's own; building one unaided is.
  exec(m, 'start_activity', { activity: 'sun_and_rain' });
  m.gesture('toggle_water');
  assert.equal(row([stamp('position')]), 'help');
  exec(m, 'start_activity', { activity: 'make_rainbow' });
  m.gesture('toggle_water');
  m.gesture('walk', 0);
  m.gesture('turn', Math.PI);
  assert.equal(events.at(-1).name, 'goal_reached');
  assert.equal(row([stamp('position')]), 'own');
});
