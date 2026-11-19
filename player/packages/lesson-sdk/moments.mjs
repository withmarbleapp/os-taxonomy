// The moment contract: one engine for every lesson's model.
//
// A lesson is a representation (a scene with its own state and its own truth)
// plus three lists of moments on it:
//
//   show   the lesson explains something while the representation shows it
//   do     the child works on the representation, exploring or towards a goal
//   ask    a question about a situation the representation sets up
//
// The representation may be custom (a meadow, the Sun and Moon) or a standard
// block (a number line). Either way it supplies only what is particular to it:
// its state, what is true of that state, its gestures and its arrangements.
// Everything that is the same in every lesson lives here: the tutor's six
// actions, questions answered by voice or touch, help that returns to the same
// work, retries, what counts as evidence, and the events that record it.
//
// The rules about evidence are fixed here and a lesson cannot change them:
//   - a show is never evidence;
//   - a do is evidence only if it has a goal, is marked `counts`, and the goal
//     was reached without help;
//   - an ask is evidence unless help was shown first, or it is a retry;
//   - every attempt and every goal reached carries `assisted` and `sceneId`.
import { object, validate, commandSchema, assertSnapshot } from '/contract/contracts.mjs';

const bool = { type: 'boolean' },
  text = { type: 'string' },
  list = (items, maxItems) => ({ type: 'array', items, maxItems });
const call = (value, ...args) => (typeof value === 'function' ? value(...args) : value);
const flag = (gesture) => 'can' + gesture.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());

const attempt = object({
  id: text,
  sceneId: text,
  item: text,
  situation: text,
  question: text,
  answer: text,
  correct: bool,
  assisted: bool,
  modality: { enum: ['button', 'voice'] },
  words: text,
  // The answer as data: the choice, the ids tapped in order, or each box's value.
  values: list(text, 12),
});
const result = object({ id: text, sceneId: text, item: text, assisted: bool, detail: text });

export function defineLesson(spec) {
  const shows = spec.show ?? {},
    dos = spec.do ?? {},
    asks = spec.ask ?? {},
    situations = spec.situations ?? {},
    gestures = spec.gestures ?? {},
    controls = spec.controls ?? {},
    repKeys = Object.keys(spec.state.schema),
    // Everything a lesson works out about its state. Hooks get all of it; only
    // the facts named in the schema are published in the snapshot.
    facts = (s) => spec.facts?.of(s) ?? {},
    published = (f) => Object.fromEntries(Object.keys(spec.facts?.schema ?? {}).map((k) => [k, f[k]]));
  for (const [id, item] of Object.entries(shows))
    if (!item.arrange === !item.support) throw Error(`show ${id} needs exactly one of arrange or support`);
  for (const [id, item] of Object.entries({ ...dos, ...asks }))
    for (const g of item.can ?? []) if (!gestures[g]) throw Error(`${id} uses an unknown gesture: ${g}`);
  for (const [id, item] of Object.entries(asks)) {
    if (!item.choices && !item.order && !item.fields) throw Error(`ask ${id} needs choices, order or fields`);
    for (const name of item.situations ?? []) if (!situations[name]) throw Error(`ask ${id} uses an unknown situation: ${name}`);
  }

  const current = (s) => (s.kind === 'do' ? dos[s.item] : s.kind === 'ask' ? asks[s.item] : null);
  const pending = (s) => s.kind === 'ask' && !s.revealed;
  const active = (s) => s.mode === 'activity';
  const lead = (s) => {
    const item = asks[s.item];
    return call(situations[s.situation]?.lead, s) ?? call(item.lead, s) ?? '';
  };

  // One object per question: its speech, its on-screen words and its controls.
  function questionFor(s) {
    if (s.kind !== 'ask') return null;
    const item = asks[s.item];
    return {
      id: s.sceneId,
      item: s.item,
      question: item.question,
      ...(item.order
        ? { order: item.order.map((o) => ({ ...o })) }
        : item.fields
          ? { fields: item.fields.map((o) => ({ ...o })) }
          : { choices: [...item.choices] }),
      speech: [lead(s), item.question].filter(Boolean).join(' '),
      status: s.revealed ? 'answered' : active(s) ? 'awaiting_answer' : 'paused_for_help',
      response: s.revealed ? (s.attempts.filter((a) => a.sceneId === s.sceneId).at(-1) ?? null) : null,
    };
  }
  function derived(s) {
    const item = current(s),
      on = active(s),
      flags = {};
    for (const [name, gesture] of Object.entries(gestures))
      // A gesture marked `always` (turning a model round) is the child's at any
      // time, whatever is being shown or asked.
      flags[flag(name)] = (gesture.always || (on && !s.revealed && !!item?.can?.includes(name))) && (gesture.when?.(s) ?? true);
    return {
      ...published(facts(s)),
      ...flags,
      canAnswer: on && pending(s) && s.attempts.length < 100,
      canHint: on && !!item?.hint && !s.hinted && (s.kind === 'do' || pending(s)) && (item.hintAvailable?.(s, facts(s)) ?? true),
      canResume: s.kind !== 'show' && (!on || s.revealed),
    };
  }
  // What the tutor is told about the screen, in terms the child can see.
  function tutorView(s) {
    const f = facts(s),
      item = current(s),
      d = derived(s);
    return {
      screen: spec.describe(s, f),
      currentCheck: questionFor(s),
      investigation:
        s.kind === 'do'
          ? {
              activity: s.item,
              ...(item.goal
                ? { target: item.target, targetReached: !!item.goal(f, s), reachedThisScene: s.reached }
                : { target: 'Open exploration: nothing to reach.' }),
            }
          : null,
      currentAttempt: s.attempts.filter((a) => a.sceneId === s.sceneId).at(-1) ?? null,
      latestResult: s.results.filter((r) => r.sceneId === s.sceneId).at(-1) ?? null,
      learnerCanDo: !active(s)
        ? ['Look and describe what is shown', ...(s.kind !== 'show' ? ['Try it: return to the same work'] : [])]
        : s.kind === 'ask'
          ? s.revealed
            ? ['Look at the result']
            : [
                item.order
                  ? `Tap in order, then check: ${item.order.map((o) => o.label).join(', ')}`
                  : item.fields
                    ? `Fill in by typing or by voice, then check: ${item.fields.map((o) => o.label).join(', ')}`
                    : `Answer by voice or button: ${item.choices.join(' / ')}`,
                ...(d.canHint ? ['Ask for a hint'] : []),
              ]
          : [...(call(item.canDo, s) ?? []), ...(d.canHint ? ['Ask for a hint'] : [])],
    };
  }

  const ids = (o) => Object.keys(o);
  const hasFields = Object.values(asks).some((a) => a.fields);
  const when = (o) =>
    Object.entries(o)
      .map(([id, item]) => `${id}: ${item.when}`)
      .join(' ');
  const situationNames = [...new Set(Object.values(asks).flatMap((a) => [...(a.situations ?? []), ...(a.fresh ? ['fresh'] : [])]))];
  const descriptor = {
    protocolVersion: 1,
    kind: spec.kind,
    apiVersion: 1,
    releaseId: spec.releaseId,
    description: spec.description,
    stateSchema: object({
      kind: { enum: ['show', 'do', 'ask'] },
      item: text,
      mode: { enum: ['demonstration', 'activity'] },
      moment: text,
      shown: list(text, 64),
      sceneId: text,
      situation: text,
      revealed: bool,
      assisted: bool,
      hinted: bool,
      reached: bool,
      draft: list(text, 12),
      entries: list(object({ field: text, value: text }), 12),
      attempts: list(attempt, 100),
      results: list(result, 100),
      instruction: text,
      canAnswer: bool,
      canHint: bool,
      canResume: bool,
      ...Object.fromEntries(ids(gestures).map((g) => [flag(g), bool])),
      ...spec.state.schema,
      ...(spec.facts?.schema ?? {}),
    }),
    actions: [
      ...(ids(shows).length
        ? [
            {
              name: 'show_moment',
              description:
                'Show and narrate one moment with the lesson’s own words, then continue this turn into something for the child to notice, answer or do. Some moments are help on the work in hand: it is kept, and recorded as helped. Others replace what is on screen, so they are refused while a question is unanswered. ' +
                when(shows),
              inputSchema: object({ moment: { enum: ids(shows) } }),
            },
          ]
        : []),
      ...(ids(dos).length
        ? [
            {
              name: 'start_activity',
              description:
                'Hand the child something to do on the scene; the lesson speaks the instruction. Unanswered work must be answered or left first. ' +
                when(dos),
              inputSchema: object({ activity: { enum: ids(dos) } }),
            },
          ]
        : []),
      ...(ids(asks).length
        ? [
            {
              name: 'start_check',
              description:
                'Ask one question; the lesson speaks the exact words shown on screen. Wait for the answer and do not ask another. ' +
                when(asks) +
                (situationNames.length
                  ? ' Situations: ' +
                    Object.entries(asks)
                      .filter(([, a]) => a.situations || a.fresh)
                      .map(([id, a]) => `${id} takes ${[...(a.situations ?? []), ...(a.fresh ? ['fresh (a new arrangement each time)'] : [])].join(', ')}`)
                      .join('; ') +
                    '.'
                  : ''),
              inputSchema: {
                type: 'object',
                properties: { question: { enum: ids(asks) }, ...(situationNames.length ? { situation: { enum: situationNames } } : {}) },
                required: ['question'],
                additionalProperties: false,
              },
            },
            {
              name: 'answer_check',
              description:
                'Record a clear SPOKEN answer to the waiting question: its sceneId, the index of the choice the child meant, and their actual words. The model scores it. Never use it for an unclear reply, a guess at what they meant, or an answer you supplied.' +
                (hasFields ? ' For a question with boxes to fill, give values instead of choice: what the child said for each box, in the order the boxes are listed, and only when they said every one.' : ''),
              // A lesson with fill-in questions takes the spoken values; others take a choice.
              inputSchema: hasFields
                ? {
                    type: 'object',
                    properties: {
                      sceneId: text,
                      choice: { type: 'integer', minimum: 0, maximum: 11 },
                      values: list({ type: 'string', maxLength: 12 }, 12),
                      words: { type: 'string', minLength: 1, maxLength: 650 },
                    },
                    required: ['sceneId', 'words'],
                    additionalProperties: false,
                  }
                : object({ sceneId: text, choice: { type: 'integer', minimum: 0, maximum: 11 }, words: { type: 'string', minLength: 1, maxLength: 650 } }),
            },
          ]
        : []),
      {
        name: 'leave_activity',
        description: 'Leave unfinished work when the child chooses something else or asks to move on. Earlier attempts are kept; no answer is invented.',
        inputSchema: object({}),
      },
      {
        name: 'resume_activity',
        description:
          'Give the work back to the child after help, exactly as it was, or reopen an answered question for another try. Either is recorded as helped.',
        inputSchema: object({}),
      },
      ...Object.entries(controls).map(([name, c]) => ({ name, description: c.description, inputSchema: object(c.args ?? {}) })),
    ],
    events: {
      scene_changed: object({ kind: text, item: text, sceneId: text }),
      support_changed: object({ name: text, enabled: bool }),
      draft_edited: object({ draft: list(text, 12) }),
      entries_edited: object({ field: text }),
      response_committed: attempt,
      response_reopened: object({ sceneId: text }),
      goal_reached: result,
      ...(spec.events ?? {}),
    },
  };

  function create({ sessionId = crypto.randomUUID(), random = Math.random } = {}) {
    let revision = 0,
      sequence = 0,
      held = null;
    const listeners = new Set(),
      commands = new Map(),
      memory = {}; // a lesson's own record of arrangements already used
    const first = spec.opening;
    let state = {
      kind: 'show',
      item: '',
      mode: 'demonstration',
      moment: first ?? '',
      shown: first ? [first] : [],
      sceneId: sessionId + ':0',
      situation: '',
      revealed: false,
      assisted: true,
      hinted: false,
      reached: false,
      draft: [],
      entries: [],
      attempts: [],
      results: [],
      instruction: first ? shows[first].instruction : (spec.idle ?? ''),
      ...structuredClone(call(spec.state.initial)),
    };
    const ctx = () => ({ random, memory, state });
    // A lesson's patch may only touch its own representation.
    function apply(patch) {
      for (const key of Object.keys(patch ?? {})) if (!repKeys.includes(key)) throw Error(`A lesson patch may not set ${key}`);
      // Copied, so a lesson's own initial and reset values are never the live arrays.
      Object.assign(state, structuredClone(patch ?? {}));
    }
    if (first) apply(shows[first].arrange(ctx()));
    const snapshot = () =>
      assertSnapshot(descriptor, {
        protocolVersion: 1,
        sessionId,
        releaseId: descriptor.releaseId,
        revision,
        state: structuredClone({ ...state, ...derived(state) }),
        availableActions: descriptor.actions
          .filter((a) => {
            if (a.name === 'answer_check') return derived(state).canAnswer && !current(state).order;
            if (a.name === 'leave_activity') return state.kind !== 'show';
            if (a.name === 'resume_activity') return derived(state).canResume;
            if (['start_activity', 'start_check'].includes(a.name)) return !pending(state);
            return true;
          })
          .map((a) => a.name),
      });
    function emit(source, ...events) {
      revision++;
      const update = {
        snapshot: snapshot(),
        events: events.map(([name, data], i) => ({
          id: `${sessionId}:${revision}:${i}`,
          revision,
          source,
          name,
          data: structuredClone(data),
        })),
      };
      for (const fn of listeners) fn(structuredClone(update));
      return update;
    }
    // A new arrangement: a fresh scene with every support and cover cleared.
    function arrange(kind, item, patch) {
      held = null;
      Object.assign(state, {
        kind,
        item,
        mode: kind === 'show' ? 'demonstration' : 'activity',
        moment: '',
        sceneId: sessionId + ':' + ++sequence,
        situation: '',
        revealed: false,
        assisted: true,
        hinted: false,
        reached: false,
        draft: [],
        entries: [],
      });
      apply(call(spec.state.clear));
      apply(patch);
    }
    // After the child changes something: say what happened, and report the
    // first time the goal is reached in this scene.
    function afterGesture(event) {
      const item = current(state),
        f = facts(state),
        events = [event];
      if (item?.status) state.instruction = item.status(f, state);
      if (item?.goal && !state.reached && item.goal(f, state)) {
        state.reached = true;
        const entry = {
          id: `${sessionId}:result:${revision + 1}`,
          sceneId: state.sceneId,
          item: state.item,
          assisted: state.assisted,
          detail: String(call(item.detail, f, state) ?? ''),
        };
        state.results.push(entry);
        events.push(['goal_reached', entry]);
      }
      return emit('learner', ...events);
    }
    function commit(answer, modality = 'button', words = '') {
      if (!derived(state).canAnswer) return false;
      const item = asks[state.item],
        f = facts(state);
      let said, correct, values;
      if (item.order) {
        if (state.draft.length !== item.order.length) return false;
        said = state.draft.map((id) => item.order.find((o) => o.id === id).label).join(', then ');
        correct = !!item.correct(state.draft, f, state);
        values = [...state.draft];
      } else if (item.fields) {
        // Every box filled; the lesson scores the values together.
        const entered = Object.fromEntries(state.entries.map((e) => [e.field, e.value]));
        if (item.fields.some((o) => !(entered[o.id] ?? '').length)) return false;
        said = item.fields.map((o) => `${o.label}: ${entered[o.id]}`).join('; ');
        correct = !!item.correct(entered, f, state);
        values = item.fields.map((o) => entered[o.id]);
      } else {
        if (!Number.isInteger(answer) || !item.choices[answer]) return false;
        said = item.choices[answer];
        correct = answer === call(item.correct, f, state);
        values = [said];
      }
      const entry = {
        id: `${sessionId}:attempt:${revision + 1}`,
        sceneId: state.sceneId,
        item: state.item,
        situation: state.situation,
        question: item.question,
        answer: said,
        correct,
        assisted: state.assisted,
        modality,
        words,
        values,
      };
      state.attempts.push(entry);
      state.revealed = true;
      apply(item.reveal?.(state, f, ctx()));
      state.instruction = call(item.fact, facts(state), state);
      return emit(modality === 'voice' ? 'agent' : 'learner', ['response_committed', entry]);
    }
    // Back to the same work after help, or another try at an answered question.
    function reopen() {
      const item = current(state);
      if (held) {
        Object.assign(state, held);
        held = null;
      }
      if (state.revealed) {
        state.revealed = false;
        state.assisted = true;
        state.draft = [];
        apply(item.hide?.(state, facts(state)));
      }
      state.mode = 'activity';
      state.moment = '';
      apply(item.resume?.(state, facts(state)));
      state.instruction = questionFor(state)?.question ?? item.instruction;
    }
    const help = () => {
      if (!state.revealed) state.assisted = true;
    };

    return {
      describe: () => structuredClone(descriptor),
      snapshot,
      subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      // The child's own gesture on the representation.
      gesture(name, value) {
        const gesture = gestures[name];
        if (!gesture || !derived(state)[flag(name)]) return false;
        const data = gesture.apply(state, value, { help });
        if (data === false || data === undefined) return false;
        return afterGesture([gesture.event, data]);
      },
      // A navigation the child shares with the tutor (changing the view).
      control(name, args = {}) {
        const c = controls[name];
        if (!c) return false;
        const data = c.apply(state, args, { help });
        if (data === false || data === undefined) return false;
        return emit('learner', [c.event, data]);
      },
      answer: (choice) => commit(choice),
      tap(id) {
        const item = current(state);
        if (!derived(state).canAnswer || !item.order?.some((o) => o.id === id) || state.draft.length >= item.order.length) return false;
        state.draft.push(id);
        return emit('learner', ['draft_edited', { draft: state.draft }]);
      },
      clear() {
        if (!derived(state).canAnswer || !current(state).order) return false;
        state.draft = [];
        return emit('learner', ['draft_edited', { draft: [] }]);
      },
      // Fill one box of a fill-in question. A value the question's `accept`
      // pattern rejects is refused; an empty value clears the box.
      enter(field, value) {
        const item = current(state);
        if (!derived(state).canAnswer || !item.fields?.some((o) => o.id === field) || typeof value !== 'string') return false;
        if (value !== '' && !(item.accept ?? /^.{1,12}$/).test(value)) return false;
        state.entries = [...state.entries.filter((e) => e.field !== field), ...(value === '' ? [] : [{ field, value }])];
        return emit('learner', ['entries_edited', { field }]);
      },
      check: () => (current(state)?.order || current(state)?.fields ? commit() : false),
      hint() {
        if (!derived(state).canHint) return false;
        const item = current(state),
          hint = item.hint(state, facts(state), ctx());
        apply(hint.patch);
        state.hinted = true;
        state.assisted = true;
        // A waiting question stays on screen; open work swaps in the hint line.
        if (!pending(state) && hint.instruction) state.instruction = hint.instruction;
        return emit('learner', ['support_changed', { name: 'hint', enabled: true }]);
      },
      resume() {
        if (!derived(state).canResume) return false;
        reopen();
        return emit('learner', ['response_reopened', { sceneId: state.sceneId }]);
      },
      execute(command) {
        validate(commandSchema, command);
        if (commands.has(command.commandId)) return structuredClone(commands.get(command.commandId));
        const reject = (code, message) => ({ commandId: command.commandId, accepted: false, error: { code, message }, snapshot: snapshot() });
        if (command.sessionId !== sessionId || command.releaseId !== descriptor.releaseId || command.expectedRevision !== revision)
          return reject('stale', 'Read the current scene before acting.');
        const action = descriptor.actions.find((a) => a.name === command.name);
        if (!action || !snapshot().availableActions.includes(command.name)) return reject('unavailable', 'Action unavailable in this state.');
        validate(action.inputSchema, command.args);
        const a = command.args;
        const done = (update, extra = {}) => {
          const out = { commandId: command.commandId, accepted: true, snapshot: update.snapshot ?? snapshot(), ...extra };
          commands.set(command.commandId, out);
          return structuredClone(out);
        };
        if (command.name === 'answer_check') {
          if (a.sceneId !== state.sceneId) return reject('stale_question', 'That answer belongs to a different question.');
          const item = current(state);
          if (item.fields) {
            // Spoken values replace whatever was typed, then are checked as one answer.
            if (a.values?.length !== item.fields.length || a.values.some((v) => !(item.accept ?? /^.{1,12}$/).test(v)))
              return reject('invalid_answer', `Give one value for each of: ${item.fields.map((o) => o.label).join(', ')}.`);
            state.entries = item.fields.map((o, i) => ({ field: o.id, value: a.values[i] }));
          }
          if (!commit(a.choice, 'voice', a.words)) return reject('invalid_answer', 'That is not one of the choices.');
          return done({});
        }
        if (controls[command.name]) {
          const c = controls[command.name],
            data = c.apply(state, a, { help });
          if (data === false || data === undefined) return reject('no_change', 'Nothing to change.');
          return done(emit('agent', [c.event, data]));
        }
        let event = ['scene_changed', null],
          speech,
          continueAfterSpeech = false;
        if (command.name === 'show_moment') {
          const item = shows[a.moment];
          if (item.arrange) {
            if (pending(state)) return reject('unfinished_question', 'A question is waiting. Help with a moment that supports the current work, or leave it first.');
            arrange('show', '', item.arrange(ctx()));
          } else {
            const refused = item.available?.(state, facts(state));
            if (typeof refused === 'string') return reject('wrong_moment', refused);
            // A moment that takes the child elsewhere keeps the work to come back to.
            if (item.aside && state.kind !== 'show') held ??= Object.fromEntries(repKeys.map((k) => [k, structuredClone(state[k])]));
            const patch = item.support(state, facts(state), ctx());
            apply(patch);
            // Help added while the child is elsewhere is still there on return.
            if (held && !item.aside) Object.assign(held, structuredClone(patch ?? {}));
            if (state.kind !== 'show') {
              // Help normally takes the work out of the child's hands until it is
              // resumed. A moment marked `stay` only adds to what is on screen
              // (a highlight), so the child keeps control; it is still help.
              if (!item.stay) state.mode = 'demonstration';
              help();
            }
          }
          speech = call(item.speech, state, facts(state));
          state.moment = a.moment;
          state.instruction = item.instruction;
          if (!state.shown.includes(a.moment)) state.shown.push(a.moment);
          continueAfterSpeech = true;
        } else if (command.name === 'start_activity') {
          const item = dos[a.activity],
            patch = item.arrange(ctx());
          if (patch === null) return reject('exhausted', 'No fresh arrangement is left for this activity.');
          arrange('do', a.activity, patch);
          // Open exploration, and work the lesson does not count, are never evidence.
          state.assisted = !(item.goal && item.counts);
          state.instruction = item.instruction;
          speech = item.speech;
        } else if (command.name === 'start_check') {
          const item = asks[a.question];
          let patch,
            supported = !!call(item.supported, ctx());
          if (a.situation === 'fresh' && item.fresh) {
            patch = item.fresh(ctx());
            if (patch === null) return reject('exhausted', 'No fresh arrangement is left; choose a named situation or an activity.');
          } else if (item.situations) {
            if (!item.situations.includes(a.situation)) return reject('missing_situation', `${a.question} needs one of: ${item.situations.join(', ')}.`);
            patch = situations[a.situation].arrange(ctx());
            if (patch === null) return reject('exhausted', 'No fresh arrangement is left for this situation.');
            supported ||= !!call(situations[a.situation].supported, ctx());
          } else patch = item.arrange?.(ctx()) ?? {};
          arrange('ask', a.question, patch);
          state.situation = a.situation ?? '';
          state.assisted = supported;
          apply(item.hide?.(state, facts(state)));
          speech = questionFor(state).speech;
        } else if (command.name === 'leave_activity') {
          if (held) {
            Object.assign(state, held);
            held = null;
          }
          Object.assign(state, { kind: 'show', item: '', mode: 'demonstration', moment: '', situation: '', revealed: false, draft: [] });
          apply(spec.leave?.(state));
          state.instruction = call(spec.idle, state) ?? '';
        } else {
          reopen();
          event = ['response_reopened', { sceneId: state.sceneId }];
          speech = questionFor(state)?.speech ?? current(state).speech;
        }
        const question = questionFor(state);
        if (question?.status === 'awaiting_answer') state.instruction = question.question;
        event[1] ??= { kind: state.kind, item: state.item, sceneId: state.sceneId };
        return done(emit('agent', event), { ...(speech ? { speech } : {}), ...(continueAfterSpeech ? { continueAfterSpeech } : {}) });
      },
    };
  }
  return { descriptor, create, tutorView, questionFor };
}
