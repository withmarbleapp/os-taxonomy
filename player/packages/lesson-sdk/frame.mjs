import { bindTalkShortcut } from './shortcuts.mjs';
// Runs only inside the lesson sandbox. No access to host APIs or credentials.
export function mountLesson({
  create,
  render,
  view = () => ({}),
  onStart = () => {},
  onReset = () => {},
  onTutorEvent = () => {},
}) {
  let port,
    experience,
    shortcutsEnabled = false;
  const send = (type, data) => port?.postMessage({ type, ...data });
  bindTalkShortcut({
    enabled: () => shortcutsEnabled,
    send: (action) => send('shortcut', { action }),
  });
  const api = {
    instruction: (text) => send('instruction', { text }),
    narrate: (text) => send('narrate', { text }),
    intent: (text) => send('intent', { text }),
    viewChanged: () => send('view', { view: view() }),
    experience: () => experience,
  };
  window.addEventListener('message', (event) => {
    if (event.source !== parent || event.data?.type !== 'marble:connect' || port || !event.ports[0])
      return;
    port = event.ports[0];
    const initialize = (sessionId) => {
      experience = create({ sessionId });
      experience.subscribe((update) => {
        render(experience.snapshot(), false, api);
        send('update', { update, view: view() });
      });
      onReset(api);
      render(experience.snapshot(), true, api);
      return { snapshot: experience.snapshot(), view: view() };
    };
    port.onmessage = async ({ data: m }) => {
      try {
        let result;
        if (m.method === 'setShortcutsEnabled') {
          shortcutsEnabled = !!m.params.enabled;
          result = true;
        } else if (m.method === 'initialize') result = initialize(m.params.sessionId);
        else if (m.method === 'execute') result = await experience.execute(m.params);
        else if (m.method === 'start') {
          render(experience.snapshot(), false, api);
          await onStart(api);
          result = true;
        } else if (m.method === 'tutorEvent') {
          onTutorEvent(m.params, api);
          result = true;
        } else if (m.method === 'snapshot')
          result = { snapshot: experience.snapshot(), view: view() };
        else throw Error('Unknown lesson bridge method');
        if (m.id) port.postMessage({ id: m.id, result });
      } catch (e) {
        if (m.id) port.postMessage({ id: m.id, error: e.message });
      }
    };
    port.start();
    send('connected', {});
  });
  parent.postMessage({ type: 'marble:ready' }, '*');
  return api;
}
