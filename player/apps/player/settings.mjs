export function createSettings({ request, getSettings, setSettings, voice, fixture, pause }) {
  const $ = (id) => document.getElementById(id);
  const providers = ['claude', 'codex', 'device'];
  let deviceTask,
    deviceDownloaded = false;
  let statuses = {},
    checking,
    voiceTask,
    saving = Promise.resolve();
  const labels = {
    installed: 'Downloaded',
    not_installed: 'Download needed',
    downloading: 'Downloading…',
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
    for (const p of providers) $(p + '-status').textContent = labels[statuses[p]] ?? 'Checking…';
    const p = selected();
    $('device-setup').hidden = p !== 'device';
    $('prepare-device').hidden = deviceDownloaded;
    $('prepare-device').disabled = !!deviceTask || statuses.device === 'downloading';
    $('provider-help-note').textContent =
      p === 'device'
        ? 'First loading can take a moment. The model runs inside Marble.'
        : 'If you’re already signed in, check your subscription’s usage allowance and try again.';
    $('connection-note').textContent =
      p === 'device'
        ? 'Your conversation and voice stay on this computer. No cloud fallback.'
        : 'Uses your subscription: Claude Haiku 5.5 or GPT-6 Luna. Your conversation goes to the provider; microphone audio stays on this device.';
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
        if (s.provider === 'device') deviceDownloaded = ['installed', 'ready'].includes(s.state);
        if (statuses[s.provider] !== 'ready') statuses[s.provider] = s.state;
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
    if (p === 'device' && !['installed', 'ready', 'failed'].includes(statuses.device)) return;
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
  async function prepareDevice() {
    if (deviceTask) return deviceTask;
    deviceTask = (async () => {
      try {
        statuses.device = 'downloading';
        render();
        $('device-progress').hidden = false;
        let state = await (await request('device-prepare', { method: 'POST', body: {} })).json();
        while (state.state === 'downloading') {
          $('device-progress').value = state.loaded / state.total;
          $('device-progress-label').textContent =
            `Downloading · ${(state.loaded / 1e9).toFixed(2)} of ${(state.total / 1e9).toFixed(2)} GB`;
          await new Promise((r) => setTimeout(r, 750));
          state = await (await request('device-model')).json();
        }
        if (state.state !== 'ready')
          throw Error(state.error ?? 'Download did not finish. Please retry.');
        deviceDownloaded = true;
        statuses.device = 'installed';
        $('device-progress-label').textContent = 'Downloaded and verified.';
        if (selected() === 'device') await check();
      } catch (e) {
        statuses.device = 'failed';
        $('device-progress-label').textContent = e.message;
      } finally {
        deviceTask = null;
        $('device-progress').hidden = true;
        render();
      }
    })();
    return deviceTask;
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
    $('settings').showModal();
    render();
    discover().then(() => {
      if (statuses.device === 'downloading' && !deviceTask) prepareDevice();
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
        await save({
          provider: selected(),
          model: '',
        });
        await check();
      } catch (error) {
        $('settings-status').textContent = error.message;
      }
      // Selecting a tutor is all the setup needed; models are managed by Marble.
      prepareVoice().catch(() => {});
    };
  $('prepare-device').onclick = prepareDevice;
  $('connection-retry').onclick = async () => {
    await discover();
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
    if (selected() === 'device' && !deviceDownloaded) {
      $('settings-status').textContent = 'Download the on-device tutor first.';
      return;
    }
    await saving.catch(() => {});
    $('settings').close();
  };
  return { open, prepareVoice };
}
