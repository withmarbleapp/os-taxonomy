import { object, validate, commandSchema, assertSnapshot } from '../contracts.mjs';
import { facts, makeTasks, scorePath } from './geometry.mjs';
const bool = { type: 'boolean' },
  num = { type: 'number' },
  text = { type: 'string' };
const body = { enum: ['sun', 'moon', 'observer'] },
  task = { enum: ['demonstration', 'explore', 'prediction', 'daylight', 'path'] };
const path = { type: 'array', items: body, maxItems: 3 };
const attempt = object({
  id: text,
  sceneId: text,
  task,
  answer: text,
  correct: bool,
  assisted: bool,
  modality: { enum: ['button', 'voice'] },
  words: text,
  theta: num,
  phi: num,
});
export const questionFor = (s) => {
  if (!['prediction', 'daylight'].includes(s.task)) return null;
  return {
    id: s.sceneId,
    question: s.task === 'daylight' ? 'Is it day or night where the explorer is?' : 'Is the Moon above the explorer’s horizon?',
    choices: s.task === 'daylight' ? ['Day', 'Night'] : ['Yes', 'No'],
    values: [true, false],
    status: s.revealed ? 'answered' : s.mode === 'activity' ? 'awaiting_answer' : 'paused_for_help',
    response: s.revealed ? s.attempts.filter(a => a.sceneId === s.sceneId).at(-1) ?? null : null,
  };
};
export function tutorView(s) {
  const f = facts(s.theta, s.phi);
  return {
    screen: s.view === 'space'
      ? { view: 'space diagram', visibleObjects: ['Sun (bright yellow)', 'Earth', 'Moon', 'explorer on Earth'], note: 'All bodies appear in the diagram even when below the explorer’s horizon.' }
      : { view: 'explorer sky', aboveHorizon: [...(f.day ? ['Sun'] : []), ...(f.visible ? ['Moon'] : [])], note: 'Look around or use Find Sun / Find Moon; above horizon does not mean currently in camera frame.' },
    explorer: { time: f.day ? 'daytime' : 'nighttime', moon: f.visible ? 'above horizon; reflected light can reach explorer' : 'below horizon; Earth blocks reflected light' },
    supports: { lightRoute: s.rays, horizon: s.horizon },
    currentCheck: questionFor(s),
    investigation: s.task === 'explore' ? { target: 'Find a position where reflected moonlight reaches the explorer, then inspect their sky. Night or day counts.', targetReached: f.visible } : null,
    currentAttempt: s.attempts.filter(a => a.sceneId === s.sceneId).at(-1) ?? null,
  };
}
const momentSpeech = {
  night_light: 'Here it is night for the explorer. Watch sunlight reach the Moon, then reflect towards the explorer’s eyes.',
  daytime_light: 'Now the explorer is in daylight. The Moon still reflects sunlight towards their eyes.',
  blocked_light: 'Sunlight still reaches the Moon. Here Earth blocks the reflected light from reaching the explorer.',
  daytime_moon: 'Look through the explorer’s eyes: both the Sun and Moon are in this daytime sky.',
  daytime_without_moon: 'This explorer is in daylight, but the Moon is below their horizon.',
  light_journey: 'Follow sunlight from the Sun to the Moon. Reflected light reaches the explorer only when Earth does not block the view.',
  horizon: 'Look at the rose-colored line labeled Horizon. It marks the explorer’s ground level, separating their sky from the region hidden by Earth.',
};
export const descriptor = {
  protocolVersion: 1,
  kind: 'moon-daytime',
  apiVersion: 1,
  releaseId: 'moon-daytime-v7',
  description:
    'Illustrative Sun–Earth–Moon geometry with a linked observer sky. day means Sun above the local horizon; moonAboveHorizon means Moon above it. Distances and body sizes are not to scale. This is not a real-date sky forecast: clouds, glare/contrast, eclipses, refraction and orbit tilt are omitted. Predictions use daylight quarter-like arrangements well away from the horizon and Sun. Above horizon is NOT a guarantee of real-world visibility. Turning Earth changes the observer; looking around only changes the camera. Ground view hides bodies below the horizon. Rays explain reflected sunlight, not eyes emitting light. Exact responses and assistance are separate from interpreted explanations. No completion threshold.',
  stateSchema: object({
    task,
    mode: { enum: ['demonstration', 'activity'] },
    moment: text,
    demonstratedMoments: { type: 'array', items: text, maxItems: 7 },
    sceneId: text,
    theta: num,
    phi: num,
    originTheta: num,
    view: { enum: ['space', 'sky'] },
    horizon: bool,
    rays: bool,
    assisted: bool,
    revealed: bool,
    path,
    attempts: { type: 'array', items: attempt, maxItems: 100 },
    day: bool,
    moonAboveHorizon: bool,
    sunAltitude: num,
    moonAltitude: num,
    canTurn: bool,
    canMoveMoon: bool,
    canAnswer: bool,
    instruction: text,
  }),
  actions: [
    {
      name: 'show_moment',
      description:
        'Show and narrate one moment, then continue this turn into a learner question or activity. night_light introduces reflected light; daytime_light applies the same route by day; blocked_light shows Earth blocking the view. light_journey and horizon support CURRENT work. horizon displays the rose-colored line labeled Horizon: use that visible name when referring to it in either view. daytime_moon/daytime_without_moon show the explorer sky. New setups require resolving or leaving pending work.',
      inputSchema: object({
        moment: { enum: ['night_light', 'daytime_light', 'blocked_light', 'daytime_moon', 'light_journey', 'horizon', 'daytime_without_moon'] },
      }),
    },
    {
      name: 'start_activity',
      description:
        'Start and introduce a task. turn_earth: find a position where reflected moonlight reaches the explorer (night or day), then inspect their sky; use after reflection is familiar. predict_sky: fresh geometry without rays, for transfer after supported understanding. build_light_path: construct the route. Pending work must first be answered or left.',
      inputSchema: object({
        activity: { enum: ['turn_earth', 'predict_sky', 'build_light_path'] },
      }),
    },
    {
      name: 'start_check',
      description: 'Start a supported check with rays and horizon retained. The runtime speaks the exact on-screen question. day_night uses Day/Night; moon_visible uses Yes/No to above-horizon. Await an answer; do not invent another question.',
      inputSchema: object({
        question: { enum: ['day_night', 'moon_visible'] },
        situation: { enum: ['night', 'day', 'below'] },
      }),
    },
    {
      name: 'answer_check',
      description: 'Resolve a clear SPOKEN answer to the pending binary question. Use its sceneId and quote the learner’s actual words. true means Day or Yes; false means Night or No. The model scores it and records voice provenance. Never use for a hypothetical, unclear reply, or answer supplied by the tutor.',
      inputSchema: object({ sceneId: text, answer: bool, words: {type:'string', minLength:1, maxLength:650} }),
    },
    {
      name: 'leave_activity',
      description: 'Leave unfinished work when the child chooses another activity or asks to move on. Preserve prior attempts; do not invent an answer.',
      inputSchema: object({}),
    },
    {
      name: 'set_view',
      description:
        'Navigate the CURRENT arrangement between space and the explorer sky, without resetting work. Use when the child asks to look through the explorer’s eyes or return to space; do it rather than asking permission again. For teaching a new idea prefer show_moment. Revealing sky before a prediction marks help.',
      inputSchema: object({ view: { enum: ['space', 'sky'] } }),
    },
    {
      name: 'resume_activity',
      description:
        'Return control to the child after demonstrating support on their current activity, or reopen their checked response for assisted correction. Preserve geometry and original attempts; do not manufacture a fresh independent success. Unavailable if no activity exists.',
      inputSchema: object({}),
    },
  ],
  events: {
    scene_changed: object({ task, sceneId: text }),
    view_changed: object({ view: { enum: ['space', 'sky'] } }),
    geometry_changed: object({ theta: num, phi: num }),
    support_changed: object({ kind: text, enabled: bool }),
    path_edited: object({ path }),
    response_committed: attempt,
    response_reopened: object({ sceneId: text }),
  },
};
export function createMoon({ sessionId = crypto.randomUUID(), random = Math.random } = {}) {
  let revision = 0,
    sequence = 0;
  const listeners = new Set(),
    commands = new Map(),
    used = [{ theta: 2.35, phi: 1.55 }];
  let state = {
    task: 'demonstration',
    mode: 'demonstration',
    moment: 'daytime_moon',
    demonstratedMoments: ['daytime_moon'],
    sceneId: sessionId + ':0',
    theta: 2.35,
    phi: 1.55,
    originTheta: 2.35,
    view: 'sky',
    horizon: false,
    rays: false,
    assisted: true,
    revealed: false,
    path: [],
    attempts: [],
    instruction: 'Look for the Moon in our daytime sky.',
  };
  let pathExposed = false;
  const pending = () => ['prediction', 'daylight', 'path'].includes(state.task) && !state.revealed;
  function derived() {
    const f = facts(state.theta, state.phi);
    return {
      day: f.day,
      moonAboveHorizon: f.visible,
      sunAltitude: f.sunAltitude,
      moonAltitude: f.moonAltitude,
      canTurn: state.mode === 'activity' && state.task === 'explore',
      canMoveMoon: false,
      canAnswer:
        state.mode === 'activity' &&
        ['prediction', 'daylight', 'path'].includes(state.task) &&
        !state.revealed &&
        state.attempts.length < 100,
    };
  }
  const snapshot = () =>
    assertSnapshot(descriptor, {
      protocolVersion: 1,
      sessionId,
      releaseId: descriptor.releaseId,
      revision,
      state: structuredClone({ ...state, ...derived() }),
      availableActions: descriptor.actions
        .filter((a) => {
          if (a.name === 'answer_check') return ['prediction', 'daylight'].includes(state.task) && derived().canAnswer;
          if (a.name === 'leave_activity') return state.task !== 'demonstration';
          if (a.name === 'resume_activity') return state.task !== 'demonstration' && (state.mode === 'demonstration' || state.revealed);
          if (['start_activity', 'start_check'].includes(a.name)) return !pending();
          return true;
        })
        .map((a) => a.name),
    });
  function emit(source, name, data) {
    revision++;
    const update = {
      snapshot: snapshot(),
      events: [
        { id: sessionId + ':' + revision, revision, source, name, data: structuredClone(data) },
      ],
    };
    for (const fn of listeners) fn(structuredClone(update));
    return update;
  }
  function setup(task, theta, phi, instruction) {
    state = {
      ...state,
      task,
      mode: task === 'demonstration' ? 'demonstration' : 'activity',
      moment: '',
      sceneId: sessionId + ':' + ++sequence,
      theta,
      phi,
      originTheta: theta,
      view: 'space',
      horizon: false,
      rays: false,
      assisted: task === 'explore' || task === 'demonstration',
      revealed: false,
      path: [],
      instruction,
    };
    used.push({ theta, phi });
  }
  function support(kind, enabled) {
    if (kind === 'light' && enabled) pathExposed = true;
    state[kind === 'light' ? 'rays' : 'horizon'] = enabled;
    if (enabled && !state.revealed) state.assisted = true;
  }
  function view(v) {
    state.view = v;
    if (state.task === 'explore' && state.mode === 'activity')
      state.instruction =
        v === 'sky'
          ? 'Look around the sky. Where is the Moon?'
          : 'Turn Earth, then look through the explorer’s eyes.';
    if (v === 'sky' && state.task === 'prediction' && !state.revealed) state.assisted = true;
  }
  function commit(answer, modality = 'button', words = '') {
    if (!derived().canAnswer) return false;
    const correct =
      state.task === 'daylight'
        ? answer === facts(state.theta, state.phi).day
        : state.task === 'prediction'
        ? answer === facts(state.theta, state.phi).visible
        : scorePath(state.path);
    const entry = {
      id: sessionId + ':attempt:' + (revision + 1),
      sceneId: state.sceneId,
      task: state.task,
      answer: String(answer),
      correct,
      assisted: state.assisted,
      modality,
      words,
      theta: state.theta,
      phi: state.phi,
    };
    state.attempts.push(entry);
    state.revealed = true;
    if (state.task === 'daylight') {
      state.view = 'sky';
      state.instruction = facts(state.theta, state.phi).day
        ? 'The Sun is above the explorer’s horizon: daytime.'
        : 'The Sun is below the explorer’s horizon: nighttime.';
    } else if (state.task === 'prediction') {
      state.view = 'sky';
      state.instruction = facts(state.theta, state.phi).visible
        ? 'The Moon is above the explorer’s horizon.'
        : 'The Moon is below the horizon, behind Earth.';
    } else {
      state.rays = true;
      pathExposed = true;
      state.instruction = 'Sunlight travels from the Sun to the Moon, then to our eyes.';
    }
    return emit(modality === 'voice' ? 'agent' : 'learner', 'response_committed', entry);
  }
  return {
    describe: () => structuredClone(descriptor),
    snapshot,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    learnerTurn(delta) {
      if (!derived().canTurn || state.view !== 'space' || !Number.isFinite(delta)) return false;
      state.theta =
        (state.theta + Math.max(-0.4, Math.min(0.4, delta)) + Math.PI * 2) % (Math.PI * 2);
      return emit('learner', 'geometry_changed', { theta: state.theta, phi: state.phi });
    },
    learnerMoon(delta) {
      if (!derived().canMoveMoon || state.view !== 'space' || !Number.isFinite(delta)) return false;
      state.phi = (state.phi + Math.max(-0.4, Math.min(0.4, delta)) + Math.PI * 2) % (Math.PI * 2);
      return emit('learner', 'geometry_changed', { theta: state.theta, phi: state.phi });
    },
    learnerView(v) {
      if (!['space', 'sky'].includes(v) || state.view === v) return false;
      view(v);
      return emit('learner', 'view_changed', { view: v });
    },
    learnerHint() {
      state.mode = 'demonstration';
      state.moment = state.task === 'path' ? 'light_journey' : 'horizon';
      state.view = 'space';
      support(state.task === 'path' ? 'light' : 'horizon', true);
      state.instruction =
        state.task === 'path'
          ? 'Follow the light from the Sun, to the Moon, to our eyes.'
          : 'The ground line separates the sky from the ground below.';
      return emit('learner', 'support_changed', {
        kind: state.task === 'path' ? 'light' : 'horizon',
        enabled: true,
      });
    },
    learnerResume() {
      if (state.task === 'demonstration') return false;
      if (state.revealed) state.path = [];
      state.mode = 'activity';
      state.moment = '';
      state.revealed = false;
      state.assisted = true;
      state.view = 'space';
      state.instruction =
        state.task === 'daylight'
          ? 'Is it day or night where the explorer is?'
          : state.task === 'prediction'
          ? 'Try your prediction again, using what we saw.'
          : state.task === 'path'
            ? 'Try the light journey again.'
            : 'Turn Earth and compare the explorer’s sky.';
      if (questionFor(state)) state.instruction = questionFor(state).question;
      return emit('learner', 'response_reopened', { sceneId: state.sceneId });
    },
    learnerPredict(answer) {
      if (!['prediction', 'daylight'].includes(state.task) || typeof answer !== 'boolean') return false;
      return commit(answer);
    },
    learnerTap(which) {
      if (
        state.task !== 'path' ||
        !derived().canAnswer ||
        !['sun', 'moon', 'observer'].includes(which) ||
        state.path.length >= 3 ||
        state.view !== 'space'
      )
        return false;
      state.path.push(which);
      return emit('learner', 'path_edited', { path: state.path });
    },
    learnerClear() {
      if (state.task !== 'path' || !derived().canAnswer) return false;
      state.path = [];
      return emit('learner', 'path_edited', { path: [] });
    },
    learnerCheckPath() {
      if (state.task !== 'path' || state.path.length !== 3) return false;
      return commit(state.path.join(' → '));
    },
    execute(command) {
      validate(commandSchema, command);
      if (commands.has(command.commandId)) return structuredClone(commands.get(command.commandId));
      const reject = (code, message) => ({
        commandId: command.commandId,
        accepted: false,
        error: { code, message },
        snapshot: snapshot(),
      });
      if (
        command.sessionId !== sessionId ||
        command.releaseId !== descriptor.releaseId ||
        command.expectedRevision !== revision
      )
        return reject('stale', 'Read the current scene before acting.');
      const action = descriptor.actions.find((a) => a.name === command.name);
      if (!action || !snapshot().availableActions.includes(command.name))
        return reject('unavailable', 'Action unavailable in this state.');
      validate(action.inputSchema, command.args);
      const a = command.args;
      if (command.name === 'answer_check') {
        if (a.sceneId !== state.sceneId) return reject('stale_question', 'Answer belongs to a different question.');
        commit(a.answer, 'voice', a.words);
        const result = { commandId: command.commandId, accepted: true, snapshot: snapshot() };
        commands.set(command.commandId, result);
        return structuredClone(result);
      }
      let event = 'scene_changed',
        data;
      if (command.name === 'show_moment') {
        if (['night_light', 'daytime_light', 'blocked_light'].includes(a.moment)) {
          if (['prediction', 'daylight', 'path'].includes(state.task) && !state.revealed)
            return reject('unfinished_activity', 'Support the current check with light_journey or horizon before replacing it.');
          setup('demonstration', { night_light: 0.65, daytime_light: 2.35, blocked_light: 3.95 }[a.moment], 1.55, 'Follow the light to the Moon and towards the explorer.');
          support('light', true);
          support('horizon', true);
        } else if (['daytime_moon', 'daytime_without_moon'].includes(a.moment)) {
          if (['prediction', 'daylight', 'path'].includes(state.task) && !state.revealed)
            return reject(
              'unfinished_activity',
              'Use light_journey or horizon to support current work; do not replace an unanswered task with a new sky example.',
            );
          setup(
            'demonstration',
            a.moment === 'daytime_moon' ? 2.35 : 3.95,
            1.55,
            a.moment === 'daytime_moon'
              ? 'Look for the Moon in our daytime sky.'
              : 'It is still daytime. Where has the Moon gone?',
          );
          state.view = 'sky';
        } else {
          state.view = 'space';
          support(a.moment === 'light_journey' ? 'light' : 'horizon', true);
          state.instruction =
            a.moment === 'light_journey'
              ? 'Watch the sunlight travel.'
              : 'Find the rose-colored line labeled Horizon.';
        }
        state.mode = 'demonstration';
        state.moment = a.moment;
        if (!state.demonstratedMoments.includes(a.moment)) state.demonstratedMoments.push(a.moment);
      } else if (command.name === 'start_check') {
        setup(a.question === 'day_night' ? 'daylight' : 'prediction',
          { night: 0.65, day: 2.35, below: 3.95 }[a.situation], 1.55,
          a.question === 'day_night' ? 'Is it day or night where the explorer is?' : 'Can the reflected moonlight reach this explorer?');
        support('light', true);
        support('horizon', true);
      } else if (command.name === 'start_activity') {
        if (a.activity === 'turn_earth') {
          setup('explore', 3.95, 1.55, 'Turn Earth until moonlight can reach the explorer, then check the sky.');
          state.horizon = true;
          support('light', true);
        } else if (a.activity === 'predict_sky') {
          let candidates;
          try {
            candidates = makeTasks(random, used);
          } catch {
            return reject('exhausted', 'No fresh arrangement found; use supported exploration.');
          }
          const t = candidates[0];
          setup('prediction', t.theta, t.phi, 'Will the Moon be above our explorer’s horizon?');
        } else {
          setup('path', 2.65, 2.02, 'Tap three objects in the order light travels to our eyes.');
          state.assisted = pathExposed;
        }
      } else if (command.name === 'set_view') {
        view(a.view);
        event = 'view_changed';
        data = { view: a.view };
      } else if (command.name === 'leave_activity') {
        state.task = 'demonstration';
        state.mode = 'demonstration';
        state.moment = '';
        state.instruction = 'Look at the current arrangement.';
      } else {
        if (state.revealed) state.path = [];
        state.mode = 'activity';
        state.moment = '';
        state.revealed = false;
        state.assisted = true;
        state.view = 'space';
        state.instruction =
          state.task === 'daylight'
            ? 'Is it day or night where the explorer is?'
            : state.task === 'prediction'
            ? 'Try your prediction again, using what we saw.'
            : state.task === 'path'
              ? 'Try the light journey again.'
              : 'Turn Earth and compare the explorer’s sky.';
        event = 'response_reopened';
        data = { sceneId: state.sceneId };
      }
      const question = questionFor(state);
      if (question?.status === 'awaiting_answer') state.instruction = question.question;
      const update = emit('agent', event, data ?? { task: state.task, sceneId: state.sceneId });
      const result = { commandId: command.commandId, accepted: true, snapshot: update.snapshot };
      if (command.name === 'show_moment') {
        result.speech = momentSpeech[a.moment];
        result.continueAfterSpeech = true;
      }
      if (['start_check', 'resume_activity'].includes(command.name) && question) result.speech = question.question;
      if (command.name === 'start_activity') result.speech = question?.question ?? (a.activity === 'turn_earth'
        ? 'Turn Earth until reflected moonlight can reach the explorer. Then choose See the sky to check your result. Nighttime or daytime both count.'
        : 'Tap the Sun, Moon and explorer in the order light travels to our eyes, then check your journey.');
      commands.set(command.commandId, result);
      return structuredClone(result);
    },
  };
}
