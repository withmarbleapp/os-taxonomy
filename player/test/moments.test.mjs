// The moment engine, tested on a representation small enough to read at a
// glance: a marker on a line of numbers. Nothing here belongs to any lesson.
import test from 'node:test';
import assert from 'node:assert/strict';
import { defineLesson } from '/sdk/moments.mjs';
import { assertUpdate } from '/contract/contracts.mjs';

const int = { type: 'integer' },
  bool = { type: 'boolean' };
const line = defineLesson({
  kind: 'line',
  releaseId: 'line-v1',
  description: 'A marker on a line from 0 to 10.',
  opening: 'meet',
  idle: 'Look at the line.',
  state: {
    schema: { at: int, target: int, jumps: bool, zoomed: bool },
    initial: { at: 0, target: 0, jumps: false, zoomed: false },
    clear: { jumps: false, zoomed: false },
  },
  facts: { schema: { onTarget: bool }, of: (s) => ({ onTarget: s.at === s.target }) },
  describe: (s) => ({ marker: s.at, jumpsDrawn: s.jumps }),
  gestures: {
    move: {
      event: 'marker_moved',
      apply(s, to) {
        if (!Number.isInteger(to) || to < 0 || to > 10) return false;
        s.at = to;
        return { at: to };
      },
    },
  },
  events: { marker_moved: { type: 'object', properties: { at: int }, required: ['at'], additionalProperties: false } },
  situations: {
    at_three: { lead: 'The marker is on three.', arrange: () => ({ at: 3, target: 5 }) },
    with_jumps: { lead: 'The jumps are drawn.', supported: true, arrange: () => ({ at: 3, target: 5, jumps: true }) },
  },
  show: {
    meet: { when: 'the opening.', speech: 'This is a number line.', instruction: 'Look at the line.', arrange: () => ({ at: 0, target: 0 }) },
    jumps: { when: 'help on current work.', speech: (s) => `Count the jumps from ${s.at}.`, instruction: 'Count the jumps.', support: () => ({ jumps: true }) },
    zoom: { when: 'a close look, away from the work.', speech: 'Look closely.', instruction: 'Look closely.', aside: true, support: () => ({ zoomed: true, at: 9 }) },
  },
  do: {
    wander: { when: 'free exploring.', speech: 'Move the marker anywhere.', instruction: 'Move the marker.', arrange: () => ({ at: 0, target: 99 }), can: ['move'] },
    reach: {
      when: 'put the marker on seven.',
      speech: 'Put the marker on seven.',
      instruction: 'Put the marker on seven.',
      arrange: () => ({ at: 0, target: 7 }),
      can: ['move'],
      goal: (f) => f.onTarget,
      counts: true,
      target: 'The marker is on seven.',
      hint: () => ({ patch: { jumps: true }, instruction: 'Count along the jumps.' }),
      status: (f) => (f.onTarget ? 'That is seven.' : 'Not seven yet.'),
    },
  },
  ask: {
    two_more: {
      when: 'two more than the marker.',
      question: 'What is two more?',
      choices: ['Four', 'Five'],
      situations: ['at_three', 'with_jumps'],
      correct: 1,
      hide: () => ({ jumps: false }),
      reveal: () => ({ jumps: true }),
      fact: 'Two more than three is five.',
      hint: () => ({ patch: { jumps: true } }),
    },
    order: {
      when: 'smallest first.',
      question: 'Tap from smallest to largest.',
      order: [
        { id: 'a', label: 'Two' },
        { id: 'b', label: 'Nine' },
      ],
      correct: (draft) => draft.join() === 'a,b',
      fact: 'Two, then nine.',
    },
  },
});

const make = () => {
  const m = line.create({ sessionId: 'test' }),
    events = [];
  m.subscribe((u) => {
    assertUpdate(line.descriptor, u);
    events.push(...u.events);
  });
  const exec = (name, args = {}) => {
    const s = m.snapshot();
    return m.execute({ protocolVersion: 1, sessionId: s.sessionId, releaseId: s.releaseId, commandId: crypto.randomUUID(), expectedRevision: s.revision, name, args });
  };
  return { m, exec, events, state: () => m.snapshot().state };
};

test('moments: the tutor gets the same six actions for any representation', () => {
  assert.deepEqual(
    line.descriptor.actions.map((a) => a.name),
    ['show_moment', 'start_activity', 'start_check', 'answer_check', 'leave_activity', 'resume_activity'],
  );
  const { m, state } = make();
  assert.deepEqual([state().kind, state().moment, state().instruction], ['show', 'meet', 'Look at the line.']);
  assert.deepEqual(m.snapshot().availableActions, ['show_moment', 'start_activity', 'start_check']);
  // Each list tells the tutor when its items are worth using.
  assert.match(line.descriptor.actions[0].description, /jumps: help on current work\./);
});

test('moments: showing is never evidence, and neither is open exploring', () => {
  const { m, exec, state, events } = make();
  const shown = exec('show_moment', { moment: 'jumps' });
  assert.deepEqual([shown.speech, shown.continueAfterSpeech, state().jumps], ['Count the jumps from 0.', true, true]);
  assert.equal(m.gesture('move', 4), false, 'nothing can be moved during a demonstration');
  exec('start_activity', { activity: 'wander' });
  assert.equal(state().jumps, false, 'a new arrangement clears the supports');
  assert.ok(m.gesture('move', 4));
  assert.equal(m.gesture('move', 40), false);
  assert.deepEqual([state().attempts.length, state().results.length, state().assisted], [0, 0, true]);
  assert.ok(events.every((e) => !['response_committed', 'goal_reached'].includes(e.name)));
});

test('moments: reaching a goal unaided is evidence; after a hint it is helped', () => {
  const own = make();
  own.exec('start_activity', { activity: 'reach' });
  own.m.gesture('move', 6);
  assert.equal(own.state().instruction, 'Not seven yet.');
  own.m.gesture('move', 7);
  own.m.gesture('move', 7);
  assert.deepEqual(
    own.events.filter((e) => e.name === 'goal_reached').map((e) => [e.data.item, e.data.assisted, e.data.sceneId]),
    [['reach', false, own.state().sceneId]],
    'reported once per scene',
  );
  const helped = make();
  helped.exec('start_activity', { activity: 'reach' });
  assert.equal(helped.state().canHint, true);
  helped.m.hint();
  assert.deepEqual([helped.state().jumps, helped.state().canHint, helped.state().instruction], [true, false, 'Count along the jumps.']);
  helped.m.gesture('move', 7);
  assert.equal(helped.state().results[0].assisted, true);
});

test('moments: one question owns its speech, its words on screen and both ways of answering', () => {
  const touch = make(),
    voice = make();
  const asked = touch.exec('start_check', { question: 'two_more', situation: 'at_three' });
  voice.exec('start_check', { question: 'two_more', situation: 'at_three' });
  const q = line.questionFor(asked.snapshot.state);
  assert.equal(asked.speech, 'The marker is on three. What is two more?');
  assert.deepEqual([asked.snapshot.state.instruction, q.choices, q.status], ['What is two more?', ['Four', 'Five'], 'awaiting_answer']);
  assert.equal(touch.exec('start_check', { question: 'order' }).accepted, false, 'one question at a time');
  assert.equal(voice.exec('answer_check', { sceneId: 'other', choice: 1, words: 'five' }).error.code, 'stale_question');
  touch.m.answer(1);
  assert.ok(voice.exec('answer_check', { sceneId: q.id, choice: 1, words: 'I think five' }).accepted);
  const [a, b] = [touch.state().attempts[0], voice.state().attempts[0]];
  assert.deepEqual([a.answer, a.correct, a.assisted, a.modality], ['Five', true, false, 'button']);
  assert.deepEqual([b.answer, b.correct, b.assisted, b.modality, b.words], ['Five', true, false, 'voice', 'I think five']);
  assert.deepEqual([touch.state().jumps, touch.state().instruction], [true, 'Two more than three is five.']);
  // A situation that keeps the support on screen is a supported check.
  const supported = make();
  supported.exec('start_check', { question: 'two_more', situation: 'with_jumps' });
  supported.m.answer(1);
  assert.equal(supported.state().attempts[0].assisted, true);
  assert.equal(supported.exec('start_check', { question: 'two_more' }).error.code, 'missing_situation');
});

test('moments: help keeps the same work, and a retry is recorded as helped', () => {
  const { m, exec, state } = make();
  exec('start_check', { question: 'two_more', situation: 'at_three' });
  const scene = state().sceneId;
  assert.equal(exec('show_moment', { moment: 'meet' }).error.code, 'unfinished_question', 'a new arrangement would lose the question');
  // Help on the work in hand.
  exec('show_moment', { moment: 'jumps' });
  assert.deepEqual([state().mode, state().canAnswer, state().assisted, state().sceneId], ['demonstration', false, true, scene]);
  assert.equal(m.answer(1), false);
  assert.equal(line.questionFor(state()).status, 'paused_for_help');
  const back = exec('resume_activity');
  assert.equal(back.speech, 'The marker is on three. What is two more?');
  assert.deepEqual([state().mode, state().canAnswer, state().jumps], ['activity', true, true]);
  m.answer(0);
  const wrong = state().attempts[0];
  assert.deepEqual([wrong.correct, wrong.assisted], [false, true]);
  // Reopened: the answer is hidden again and the first attempt is kept.
  exec('resume_activity');
  assert.deepEqual([state().revealed, state().jumps], [false, false]);
  m.answer(1);
  assert.deepEqual(state().attempts[0], wrong);
  assert.deepEqual([state().attempts[1].correct, state().attempts[1].assisted], [true, true]);
});

test('moments: a moment that goes elsewhere brings the work back exactly as it was', () => {
  const { m, exec, state } = make();
  exec('start_activity', { activity: 'reach' });
  m.gesture('move', 4);
  exec('show_moment', { moment: 'zoom' });
  assert.deepEqual([state().zoomed, state().at], [true, 9]);
  exec('resume_activity');
  assert.deepEqual([state().zoomed, state().at, state().mode, state().assisted], [false, 4, 'activity', true]);
  // Leaving also returns from it, and invents no answer.
  exec('show_moment', { moment: 'zoom' });
  exec('leave_activity');
  assert.deepEqual([state().kind, state().at, state().results.length, state().instruction], ['show', 4, 0, 'Look at the line.']);
});

test('moments: an answer given by tapping in order', () => {
  const { m, exec, state } = make();
  exec('start_check', { question: 'order' });
  assert.equal(m.snapshot().availableActions.includes('answer_check'), false, 'tapped answers are not spoken');
  m.tap('b');
  assert.equal(m.check(), false, 'every item is needed');
  m.clear();
  m.tap('a');
  m.tap('b');
  assert.equal(m.tap('a'), false);
  m.check();
  assert.deepEqual([state().attempts[0].answer, state().attempts[0].correct], ['Two, then Nine', true]);
});

test('moments: commands are refused when stale and repeat safely', () => {
  const { m } = make(),
    s = m.snapshot();
  const command = { protocolVersion: 1, sessionId: s.sessionId, releaseId: s.releaseId, commandId: 'one', expectedRevision: s.revision, name: 'show_moment', args: { moment: 'jumps' } };
  const first = m.execute(command);
  assert.ok(first.accepted);
  assert.deepEqual(m.execute(command), first);
  assert.equal(m.execute({ ...command, commandId: 'two' }).error.code, 'stale');
});

test('moments: a lesson cannot set what the engine owns', () => {
  assert.throws(
    () =>
      defineLesson({
        kind: 'bad',
        releaseId: 'bad',
        description: '',
        opening: 'cheat',
        state: { schema: { n: int }, initial: { n: 0 }, clear: {} },
        describe: () => ({}),
        show: { cheat: { when: '', speech: '', instruction: '', arrange: () => ({ assisted: false }) } },
      }).create(),
    /may not set assisted/,
  );
});

test('moments: help given during a close look is still there on return; attempts carry their values', () => {
  const { m, exec, state } = make();
  exec('start_check', { question: 'two_more', situation: 'at_three' });
  exec('show_moment', { moment: 'zoom' });
  exec('show_moment', { moment: 'jumps' });
  exec('resume_activity');
  assert.deepEqual([state().zoomed, state().at, state().jumps], [false, 3, true]);
  m.answer(1);
  assert.deepEqual(state().attempts[0].values, ['Five']);
});
