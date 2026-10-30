import { mountLesson } from '/sdk/frame.mjs';
import { descriptor } from './descriptor.mjs';
let model;
function create({ sessionId }) {
  let revision = 0,
    state = { sceneId: sessionId + ':0', parts: 4, draft: '', currentAttempt: {} },
    listeners = new Set();
  const snapshot = () => ({
    protocolVersion: 1,
    sessionId,
    releaseId: descriptor.releaseId,
    revision,
    state: structuredClone(state),
    availableActions: ['new_bar'],
  });
  const emit = (source, name, data) => {
    revision++;
    const update = {
      snapshot: snapshot(),
      events: [{ id: sessionId + ':' + revision, revision, source, name, data }],
    };
    for (const fn of listeners) fn(update);
  };
  return {
    describe: () => descriptor,
    snapshot,
    subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    draft(value) {
      state.draft = value;
      emit('learner', 'draft_changed', {});
    },
    check() {
      state.currentAttempt = {
        id: sessionId + ':attempt:' + revision,
        answer: Number(state.draft),
        expected: state.parts,
        correct: Number(state.draft) === state.parts,
        assisted: false,
      };
      emit('learner', 'answer_checked', state.currentAttempt);
    },
    execute(c) {
      if (
        c.sessionId !== sessionId ||
        c.releaseId !== descriptor.releaseId ||
        c.expectedRevision !== revision ||
        c.name !== 'new_bar' ||
        !Number.isInteger(c.args.parts) ||
        c.args.parts < 2 ||
        c.args.parts > 8
      )
        return {
          accepted: false,
          snapshot: snapshot(),
          error: { message: 'Invalid or stale command' },
        };
      state = {
        sceneId: sessionId + ':' + (revision + 1),
        parts: c.args.parts,
        draft: '',
        currentAttempt: {},
      };
      emit('agent', 'bar_changed', { parts: state.parts });
      return { accepted: true, snapshot: snapshot() };
    },
  };
}
mountLesson({
  create: (args) => (model = create(args)),
  render({ state: s }) {
    const bar = document.getElementById('bar');
    bar.replaceChildren(...Array.from({ length: s.parts }, () => document.createElement('span')));
    const input = document.querySelector('input');
    if (document.activeElement !== input) input.value = s.draft;
    document.getElementById('result').textContent = s.currentAttempt.id
      ? s.currentAttempt.correct
        ? 'That matches the bar.'
        : 'Let’s count each part again.'
      : '';
  },
  view: () => ({ currentAttempt: model.snapshot().state.currentAttempt }),
});
document.querySelector('input').oninput = (e) => model.draft(e.target.value);
document.querySelector('form').onsubmit = (e) => {
  e.preventDefault();
  model.check();
};
