import { validateUpdate, publicView } from '/contract/package.mjs';
import { validate } from '/contract/contracts.mjs';
export async function connectLesson(
  frame,
  pkg,
  {
    onInstruction = () => {},
    onNarrate = () => {},
    onIntent = () => {},
    onShortcut = () => {},
  } = {},
) {
  const channel = new MessageChannel(),
    pending = new Map(),
    listeners = new Set();
  let sequence = 0,
    snapshot,
    view = {},
    closed = false;
  const rpc = (method, params) =>
    new Promise((resolve, reject) => {
      if (closed) return reject(Error('Lesson closed'));
      const id = ++sequence,
        timer = setTimeout(() => {
          pending.delete(id);
          reject(Error('Lesson did not respond'));
        }, 12000);
      pending.set(id, { resolve, reject, timer });
      channel.port1.postMessage({ id, method, params });
    });
  channel.port1.onmessage = ({ data: m }) => {
    if (closed || !m || typeof m !== 'object') return;
    if (m.id) {
      const p = pending.get(m.id);
      if (!p) return;
      clearTimeout(p.timer);
      pending.delete(m.id);
      m.error ? p.reject(Error(m.error)) : p.resolve(m.result);
      return;
    }
    try {
      if (m.type === 'shortcut' && ['talk_start', 'talk_end', 'talk_cancel'].includes(m.action))
        onShortcut(m.action);
      else if (m.type === 'update' && snapshot) {
        validateUpdate(pkg.experience, snapshot, m.update);
        snapshot = structuredClone(m.update.snapshot);
        view = publicView(m.view);
        for (const fn of listeners) fn(m.update);
      } else if (m.type === 'view') view = publicView(m.view);
      else if (m.type === 'instruction' && typeof m.text === 'string' && m.text.length <= 300)
        onInstruction(m.text);
      else if (m.type === 'narrate' && typeof m.text === 'string' && m.text.length <= 1500)
        onNarrate(m.text);
      else if (m.type === 'intent' && typeof m.text === 'string' && m.text.length <= 500)
        onIntent(m.text);
    } catch (e) {
      console.error('Rejected lesson message:', e.message);
    }
  };
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener('message', ready);
      reject(Error('Lesson failed to load'));
    }, 15000);
    const ready = (e) => {
      if (e.source !== frame.contentWindow || e.data?.type !== 'marble:ready') return;
      clearTimeout(timer);
      window.removeEventListener('message', ready);
      frame.contentWindow.postMessage({ type: 'marble:connect' }, '*', [channel.port2]);
      resolve();
    };
    window.addEventListener('message', ready);
    frame.src = pkg.url;
  });
  const sessionId = crypto.randomUUID(),
    initial = await rpc('initialize', { sessionId });
  snapshot = initial.snapshot;
  if (snapshot.sessionId !== sessionId || snapshot.releaseId !== pkg.experience.releaseId)
    throw Error('Lesson initialized the wrong session');
  validate(pkg.experience.stateSchema, snapshot.state);
  view = publicView(initial.view);
  return {
    describe: () => pkg.experience,
    snapshot: () => structuredClone(snapshot),
    presentation: () => structuredClone(view),
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    execute: async (command) => {
      const result = await rpc('execute', command);
      if (result.snapshot?.revision > snapshot.revision) throw Error('Missing command update');
      return result;
    },
    start: () => rpc('start', {}),
    setShortcutsEnabled: (enabled) => rpc('setShortcutsEnabled', { enabled }),
    tutorEvent: (e) => rpc('tutorEvent', e),
    close: () => {
      closed = true;
      channel.port1.close();
      for (const p of pending.values()) {
        clearTimeout(p.timer);
        p.reject(Error('Lesson closed'));
      }
      pending.clear();
      listeners.clear();
    },
  };
}
