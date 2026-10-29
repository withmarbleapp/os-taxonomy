export function createSettings({ request, getSettings, setSettings, voice, fixture, pause }) {
  const $ = (id) => document.getElementById(id);
  let statuses = {},
    checking,
    voiceTask,
    saving = Promise.resolve();
  const labels = {
    missing: 'Not installed',
    unavailable: 'Could not start',
    sign_in: 'Sign in needed',
    signed_in: 'Signed in',
    checking: 'Checking connection…',
    ready: 'Connected',
    failed: 'Connection check failed',
  };
  const selected = () => $('settings-form').elements.provider.value;
  function render() {
    for (const p of ['claude', 'codex'])
      $(p + '-status').textContent = labels[statuses[p]] ?? 'Checking…';
    const p = selected();
    $('connection-retry').disabled = !p || !!checking;
    $('connection-help').hidden = !!p && statuses[p] === 'ready';
    for (const name of ['claude', 'codex']) $(name + '-help').hidden = p ? name !== p : false;
    if (statuses[p] === 'ready') {
      $('provider-help').hidden = true;
      $('connection-help').setAttribute('aria-expanded', 'false');
    }
  }
  function save(values) {
    // Serialize selection saves so a slow earlier request cannot overwrite a later choice.
    saving = saving
      .catch(() => {})
      .then(async () => {
        const result = await (await request('settings', { method: 'POST', body: values })).json();
        setSettings(result);
      });
    return saving;
  }
  async function discover() {
    try {
      for (const s of await (await request('connections')).json())
        if (statuses[s.provider] !== 'ready') statuses[s.provider] = s.state;
      render();
    } catch {
      $('settings-status').textContent =
        'Could not check your tutor connections. Please try again.';
    }
  }
  async function check() {
    const p = selected();
    if (!p || checking) return;
    checking = p;
    statuses[p] = 'checking';
    render();
    try {
      const result = await (
        await request('provider-check', { method: 'POST', body: { provider: p } })
      ).json();
      statuses[p] = result.state;
    } catch {
      statuses[p] = 'failed';
    } finally {
      checking = null;
      render();
    }
    if (selected() !== p) await check();
  }
  function voiceStatus(text, busy = false, ratio) {
    $('voice-status').textContent = text;
    $('voice-progress').hidden = !busy;
    if (ratio === undefined) $('voice-progress').removeAttribute('value');
    else $('voice-progress').value = ratio;
    $('prepare-voice').disabled = busy;
    $('prepare-voice').hidden = voice.ready || fixture;
    $('test-voice').disabled = !voice.ready && !fixture;
  }
  async function prepareVoice() {
    if (voice.ready || fixture) return;
    if (voiceTask) return voiceTask;
    voiceTask = (async () => {
      try {
        voiceStatus('Preparing voice…', true);
        let state = await (await request('voice-prepare', { method: 'POST', body: {} })).json();
        while (state.state === 'downloading') {
          voiceStatus(
            `Downloading voice · ${Math.round(state.loaded / 1e6)} of ${Math.round(state.total / 1e6)} MB`,
            true,
            state.loaded / state.total,
          );
          await new Promise((r) => setTimeout(r, 750));
          state = await (await request('voice')).json();
        }
        if (state.state !== 'ready')
          throw Error(state.error ?? 'Voice setup did not finish. Please retry.');
        await voice.load((text) => voiceStatus(text, true));
        await save({ speech: true });
        voiceStatus('Ready · listening and speaking stay on this device');
      } catch (error) {
        voiceStatus(error.message);
        $('prepare-voice').textContent = 'Retry voice setup';
        throw error;
      } finally {
        voiceTask = null;
      }
    })();
    return voiceTask;
  }
  function open() {
    pause();
    $('conversation').close();
    $('settings-form').elements.provider.value = getSettings().provider;
    $('settings').showModal();
    render();
    discover().then(() => {
      if (selected() && statuses[selected()] !== 'ready') check();
    });
    if (voice.ready || fixture) voiceStatus('Ready · listening and speaking stay on this device');
    else if (!voiceTask)
      request('voice')
        .then((r) => r.json())
        .then((s) => {
          if (voiceTask) return;
          voiceStatus(
            s.state === 'ready'
              ? 'Voice downloaded · ready to start'
              : 'Voice models download once · about 230 MB',
          );
          $('prepare-voice').textContent = s.state === 'ready' ? 'Prepare voice' : 'Set up voice';
        })
        .catch(() => voiceStatus('Could not check voice setup. Please retry.'));
  }
  for (const input of $('settings-form').querySelectorAll('[name=provider]'))
    input.onchange = async () => {
      render();
      try {
        await save({ provider: selected(), model: '' });
        await check();
      } catch (error) {
        $('settings-status').textContent = error.message;
      }
      // Selecting a tutor is all the setup needed; models are managed by Marble.
      prepareVoice().catch(() => {});
    };
  $('connection-retry').onclick = check;
  $('connection-help').onclick = () => {
    const show = $('provider-help').hidden;
    $('provider-help').hidden = !show;
    $('connection-help').setAttribute('aria-expanded', String(show));
  };
  $('prepare-voice').onclick = () => prepareVoice().catch(() => {});
  $('settings-form').onsubmit = async (event) => {
    event.preventDefault();
    if (!selected()) {
      $('settings-status').textContent = 'Choose Claude or Codex to continue.';
      return;
    }
    await saving.catch(() => {});
    $('settings').close();
  };
  return { open, prepareVoice };
}
