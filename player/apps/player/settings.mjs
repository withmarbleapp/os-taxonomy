export function createSettings({ request, getSettings, setSettings, voice, fixture, pause }) {
  const $ = (id) => document.getElementById(id);
  const providers = ['claude', 'codex', 'ollama', 'lmstudio'];
  const isLocal = (p) => p === 'ollama' || p === 'lmstudio';
  let modelLists = {},
    selectedModels = {};
  let statuses = {},
    checking,
    voiceTask,
    saving = Promise.resolve();
  const labels = {
    available: 'Choose a model',
    no_models: 'No models found',
    choose_model: 'Choose a model',
    auth_required: 'Server requires authentication',
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
    for (const p of providers)
      $(p + '-status').textContent =
        isLocal(p) && statuses[p] === 'unavailable'
          ? 'Not running'
          : (labels[statuses[p]] ?? 'Checking…');
    const p = selected();
    $('local-model-choice').hidden = !isLocal(p);
    $('provider-help-note').textContent = isLocal(p)
      ? 'If the check fails, make sure the server is running and the selected chat model supports structured JSON replies. First loading a model can take a moment.'
      : 'If you’re already signed in, check your subscription’s usage allowance and try again.';
    $('connection-note').textContent = isLocal(p)
      ? 'Marble sends the conversation only to the local app on this computer. Choose a downloaded chat model; there is no cloud fallback.'
      : 'Uses your subscription: Claude Haiku 5.5 or GPT-6 Luna. Your conversation goes to the provider; microphone audio stays on this device.';
    if (isLocal(p)) {
      const select = $('local-model');
      select.replaceChildren(
        new Option('Choose a model', ''),
        ...(modelLists[p] ?? []).map((id) => new Option(id, id)),
      );
      select.value = selectedModels[p] ?? '';
    }
    $('connection-retry').disabled = !p || !!checking;
    $('connection-help').hidden = !!p && statuses[p] === 'ready';
    for (const name of providers) $(name + '-help').hidden = p ? name !== p : false;
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
      for (const s of await (await request('connections')).json()) {
        if (isLocal(s.provider)) {
          modelLists[s.provider] = s.models ?? [];
          if (!modelLists[s.provider].includes(selectedModels[s.provider]))
            selectedModels[s.provider] =
              modelLists[s.provider].length === 1 ? modelLists[s.provider][0] : '';
        }
        if (isLocal(s.provider) || statuses[s.provider] !== 'ready') statuses[s.provider] = s.state;
      }
      render();
    } catch {
      $('settings-status').textContent =
        'Could not check your tutor connections. Please try again.';
    }
  }
  async function check() {
    const p = selected();
    if (!p || checking) return;
    const model = selectedModels[p] ?? '';
    if (isLocal(p) && !model) {
      if (statuses[p] === 'available' || statuses[p] === 'ready') statuses[p] = 'choose_model';
      render();
      return;
    }
    checking = p;
    statuses[p] = 'checking';
    render();
    try {
      const result = await (
        await request('provider-check', { method: 'POST', body: { provider: p, model } })
      ).json();
      statuses[p] = result.state;
    } catch {
      statuses[p] = 'failed';
    } finally {
      checking = null;
      render();
    }
    if (selected() !== p || (isLocal(p) && selectedModels[p] !== model)) {
      statuses[p] = 'available';
      await check();
    }
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
    const saved = getSettings();
    $('settings-form').elements.provider.value = saved.provider;
    if (isLocal(saved.provider)) selectedModels[saved.provider] = saved.model;
    $('settings').showModal();
    render();
    discover().then(() => {
      if (selected() && statuses[selected()] !== 'ready') {
        if (isLocal(selected()))
          save({ provider: selected(), model: selectedModels[selected()] ?? '' })
            .then(check)
            .catch((e) => {
              $('settings-status').textContent = e.message;
            });
        else check();
      }
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
        await save({
          provider: selected(),
          model: isLocal(selected()) ? (selectedModels[selected()] ?? '') : '',
        });
        await check();
      } catch (error) {
        $('settings-status').textContent = error.message;
      }
      // Selecting a tutor is all the setup needed; models are managed by Marble.
      prepareVoice().catch(() => {});
    };
  $('local-model').onchange = async () => {
    const p = selected();
    selectedModels[p] = $('local-model').value;
    statuses[p] = 'available';
    try {
      await save({ provider: p, model: selectedModels[p] });
      await check();
    } catch (e) {
      $('settings-status').textContent = e.message;
    }
  };
  $('connection-retry').onclick = async () => {
    await discover();
    if (isLocal(selected()))
      await save({ provider: selected(), model: selectedModels[selected()] ?? '' });
    await check();
  };
  $('connection-help').onclick = () => {
    const show = $('provider-help').hidden;
    $('provider-help').hidden = !show;
    $('connection-help').setAttribute('aria-expanded', String(show));
  };
  $('prepare-voice').onclick = () => prepareVoice().catch(() => {});
  $('settings-form').onsubmit = async (event) => {
    event.preventDefault();
    if (!selected()) {
      $('settings-status').textContent = 'Choose a tutor connection to continue.';
      return;
    }
    if (isLocal(selected()) && !selectedModels[selected()]) {
      $('settings-status').textContent = 'Choose a local chat model first.';
      return;
    }
    await saving.catch(() => {});
    $('settings').close();
  };
  return { open, prepareVoice };
}
