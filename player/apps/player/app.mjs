import { readInferenceResponse } from '/runtime/inference-stream.mjs';
import { BrowserSpeech } from '/voice/browser-speech.mjs';
import { createSettings } from './settings.mjs';
import { bindTalkShortcut } from '/sdk/shortcuts.mjs';
import { connectLesson } from '/sdk/host.mjs';
import { TeachingSession } from '/runtime/session.mjs';
import { PushToTalkCapture } from '/voice/audio.mjs';
const $ = (id) => document.getElementById(id),
  config = await fetch('/api/config').then((r) => r.json());
let settings = config.settings,
  session,
  port,
  logs = [],
  logChain = Promise.resolve(),
  audio,
  audioUrl,
  recording = false,
  recordTimer,
  recordEpoch = 0,
  captureSource = null;
const capture = new PushToTalkCapture();
const browserVoice = new BrowserSpeech();
let speechController;
const settingsUI = createSettings({
  request,
  getSettings: () => settings,
  setSettings: (value) => {
    settings = value;
  },
  voice: browserVoice,
  fixture: config.speechBackend === 'fixture',
  pause: pauseControls,
});
const openSettings = () => settingsUI.open();
for (const [column, x] of [56.62, 64.41, 72.19, 79.98, 87.77].entries()) {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.style.setProperty('--column', column);
  for (const y of [62.09, 69.88, 77.67]) {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', 2.3);
    group.append(dot);
  }
  $('walkie-lights').append(group);
}
const canTalk = () =>
  !!session &&
  $('start-cover').hidden &&
  !$('player').hidden &&
  !document.querySelector('dialog[open]') &&
  $('compose').hidden;
function shortcut(action, source = 'keyboard') {
  if (action === 'talk_start') {
    if (canTalk() && !recording) {
      captureSource = source;
      beginTalk();
    }
  } else if (captureSource === source) {
    captureSource = null;
    if (action === 'talk_end') endTalk();
    else cancelRecording();
  }
}
const keys = bindTalkShortcut({ enabled: canTalk, send: (action) => shortcut(action) });
function phase(value) {
  $('walkie-chassis').dataset.phase = value;
}
function cancelRecording() {
  recordEpoch++;
  clearTimeout(recordTimer);
  recording = false;
  captureSource = null;
  capture.stop();
  $('ptt').setAttribute('aria-pressed', 'false');
  phase('idle');
}
function pauseControls() {
  closeComposer(false);
  keys.cancel();
  cancelRecording();
  session?.cancel();
  stopAudio();
  port?.setShortcutsEnabled(false).catch(() => {});
}
function openMenu() {
  pauseControls();
  $('conversation').showModal();
}

async function request(path, { method = 'GET', body, signal, type = 'application/json' } = {}) {
  const r = await fetch('/api/' + path, {
    method,
    headers: {
      'x-marble-token': config.token,
      ...(body !== undefined ? { 'content-type': type } : {}),
    },
    body:
      body === undefined ? undefined : type === 'application/json' ? JSON.stringify(body) : body,
    signal,
  });
  if (!r.ok) throw Error((await r.json()).error);
  return r;
}
const status = (text) => ($('status').textContent = text);
function error(e) {
  status(e.message);
  console.error(e);
}
function message(text, learner = false) {
  const p = document.createElement('p');
  p.textContent = text;
  p.className = learner ? 'learner' : '';
  $('messages').append(p);
  if ($('conversation').open) p.scrollIntoView({ block: 'nearest' });
  return p;
}
function stopAudio() {
  speechController?.abort();
  speechController = null;
  if (audio) {
    audio.pause();
    audio.dispatchEvent(new Event('ended'));
    audio = null;
  }
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  }
}
let speechGroup, speechMessage;
async function speak(text, signal, { group, prepared } = {}) {
  stopAudio();
  if (group && speechGroup === group) speechMessage.textContent += ' ' + text;
  else {
    speechMessage = message(text);
    speechGroup = group;
  }
  $('caption').textContent = text;
  $('caption').hidden = !$('show-captions').checked;
  if (!settings.speech) throw Error('Set up local audio before starting a lesson.');
  phase('speaking');
  try {
    if (config.speechBackend === 'browser') {
      speechController = new AbortController();
      await browserVoice.speak(
        text,
        signal ? AbortSignal.any([signal, speechController.signal]) : speechController.signal,
        prepared,
      );
      return;
    }
    const r = await request('speak', { method: 'POST', body: { text }, signal });
    if (signal?.aborted) return;
    audioUrl = URL.createObjectURL(await r.blob());
    const player = (audio = new Audio(audioUrl));
    await new Promise((resolve, reject) => {
      player.onended = resolve;
      player.onerror = () => reject(Error('Voice playback failed'));
      const abort = () => {
        player.pause();
        resolve();
      };
      signal?.addEventListener('abort', abort, { once: true });
      player.onended = () => {
        signal?.removeEventListener('abort', abort);
        resolve();
      };
      player.play().catch(reject);
    });
  } catch (e) {
    if (!signal?.aborted) throw e;
  } finally {
    if (!recording) phase('idle');
  }
}
speak.prepare = (text, signal) =>
  config.speechBackend === 'browser' ? browserVoice.prepare(text, signal) : undefined;
browserVoice.onMetric = (event) => session?.log(event);
function download(bytes, name) {
  const a = document.createElement('a'),
    url = URL.createObjectURL(bytes);
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function library() {
  const list = await (await request('library')).json();
  $('lessons').replaceChildren();
  for (const pkg of list) {
    const card = document.createElement('article');
    card.className = 'lesson-card';
    const h = document.createElement('h2');
    h.textContent = pkg.manifest.title;
    const p = document.createElement('p');
    p.textContent = pkg.manifest.description;
    const copy = document.createElement('div');
    copy.className = 'lesson-copy';
    copy.append(h, p);
    const mark = document.createElement('span');
    mark.className = 'lesson-mark';
    mark.setAttribute('aria-hidden', 'true');
    // A shared book motif also works for imported lessons without artwork.
    mark.innerHTML =
      '<svg viewBox="0 0 48 48"><path d="M24 13c-5-4-11-5-17-3v26c6-2 12-1 17 3 5-4 11-5 17-3V10c-6-2-12-1-17 3Z"/><path d="M24 13v26M12 17c3 0 5 1 7 2m-7 5c3 0 5 1 7 2m10-7c2-1 4-2 7-2m-7 9c2-1 4-2 7-2"/></svg>';
    const open = document.createElement('button');
    open.className = 'lesson-open';
    open.setAttribute('aria-label', 'Open ' + pkg.manifest.title);
    open.onclick = () => launch(pkg).catch(error);
    const arrow = document.createElement('span');
    arrow.className = 'lesson-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
    const remove = document.createElement('button');
    remove.className = 'lesson-remove';
    remove.setAttribute('aria-label', 'Remove ' + pkg.manifest.title);
    remove.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16M20 4 4 20"/></svg>';
    remove.onclick = () => {
      $('remove-title').textContent = 'Remove “' + pkg.manifest.title + '”?';
      $('remove-description').textContent = pkg.trustedShortcuts
        ? 'This built-in lesson will be hidden from your library. Import its .lesson package to add it again. Session logs are kept.'
        : 'This lesson will be deleted from your library. Your original .lesson file and session logs are kept, so you can import it again.';
      $('remove-status').textContent = '';
      $('confirm-remove').onclick = async () => {
        $('confirm-remove').disabled = true;
        try {
          await request('remove-lesson', {
            method: 'POST',
            body: { id: pkg.manifest.id, version: pkg.manifest.version },
          });
          await library();
          $('remove-lesson').close();
          $('library-status').textContent = pkg.manifest.title + ' removed.';
          $('add-lesson').focus();
        } catch (e) {
          $('remove-status').textContent = e.message;
        } finally {
          $('confirm-remove').disabled = false;
        }
      };
      $('remove-lesson').showModal();
      $('cancel-remove').focus();
    };
    card.append(mark, copy, arrow, open, remove);
    $('lessons').append(card);
  }
}
async function launch(pkg) {
  closeComposer(false);
  $('export-lesson').onclick = async () => {
    try {
      const r = await request(
        `export?id=${encodeURIComponent(pkg.manifest.id)}&version=${encodeURIComponent(pkg.manifest.version)}`,
      );
      download(await r.blob(), pkg.manifest.id + '.lesson');
    } catch (e) {
      error(e);
    }
  };

  session?.close();
  stopAudio();
  logs = [];
  $('messages').replaceChildren();
  $('caption').hidden = true;
  $('instruction').textContent = '';
  $('library').hidden = true;
  $('player').hidden = false;
  $('start-cover').hidden = false;
  $('start-cover').dataset.layout = '';
  $('start').textContent = 'Let’s explore ↗';
  $('talk-controls').hidden = true;
  $('title').textContent = $('start-title').textContent = pkg.manifest.title;
  status('Loading lesson…');
  port = await connectLesson($('scene'), pkg, {
    onInstruction: (text) => ($('instruction').textContent = text),
    onNarrate: (text) => session?.narrate(text).catch(error),
    onIntent: (text) => send(text),
    onShortcut: (action) => shortcut(action, 'scene'),
  });
  const cover = port.presentation().cover;
  if (['illustrated', 'scene'].includes(cover?.layout)) {
    $('start-cover').dataset.layout = cover.layout;
    if (typeof cover.title === 'string') $('start-title').textContent = cover.title;
    if (typeof cover.startLabel === 'string') $('start').textContent = cover.startLabel;
  }
  const sessionId = port.snapshot().sessionId;
  session = new TeachingSession({
    port,
    pkg,
    infer: async (input, signal, onEvent) =>
      readInferenceResponse(
        await request('infer-stream', { method: 'POST', body: input, signal }),
        onEvent,
      ),
    speak,
    onState: (state, detail) => {
      if (state === 'thinking') stopAudio();
      if (!recording) phase(['thinking', 'speaking'].includes(state) ? state : 'idle');
      status(
        detail ??
          (state === 'idle'
            ? ''
            : state === 'thinking'
              ? 'Thinking…'
              : state === 'speaking'
                ? 'Speaking…'
                : state),
      );
    },
    log: (entry) => {
      logs.push(entry);
      logChain = logChain
        .then(() => request('log', { method: 'POST', body: { sessionId, entry } }))
        .catch((e) => status('Could not save session log: ' + e.message));
    },
  });
  status(settings.provider === 'preview' ? 'Explore mode · choose a tutor in Settings' : 'Ready');
}
async function send(text) {
  if (!session || !text.trim()) return;
  stopAudio();
  message(text, true);
  await session.turn(text);
}
$('start').onclick = async () => {
  if (!['claude', 'codex', 'local', 'device'].includes(settings.provider)) {
    openSettings();
    $('settings-status').textContent = 'Choose a tutor and set up local audio to begin.';
    return;
  }
  const startLabel = $('start').textContent;
  $('start').disabled = true;
  try {
    if (config.speechBackend === 'browser' && !browserVoice.ready)
      $('start').textContent = 'Preparing voice…';
    await settingsUI.prepareVoice();
    const microphone = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    microphone.getTracks().forEach((track) => track.stop());
    $('start-cover').hidden = true;
    $('talk-controls').hidden = false;
    await port.setShortcutsEnabled(true);
    await session.start();
  } catch (e) {
    openSettings();
    $('settings-status').textContent =
      e.name === 'NotAllowedError'
        ? 'Allow microphone access to start the voice lesson.'
        : e.message;
  } finally {
    $('start').disabled = false;
    $('start').textContent = startLabel;
  }
};
$('home').onclick = () => {
  closeComposer(false);
  $('conversation').close();
  keys.cancel();
  $('talk-controls').hidden = true;
  recordEpoch++;
  capture.stop();
  recording = false;
  clearTimeout(recordTimer);
  session?.close();
  session = null;
  stopAudio();
  $('scene').src = 'about:blank';
  $('player').hidden = true;
  $('library').hidden = false;
};
function closeComposer(restoreFocus = true) {
  const wasOpen = !$('compose').hidden;
  $('compose').hidden = true;
  $('type-reply').setAttribute('aria-expanded', 'false');
  $('reply-text').value = '';
  if (wasOpen && restoreFocus) $('type-reply').focus();
  if (wasOpen && restoreFocus && canTalk()) port?.setShortcutsEnabled(true).catch(error);
}
function positionComposer() {
  const viewport = window.visualViewport;
  const keyboard = viewport ? Math.max(0, innerHeight - viewport.height - viewport.offsetTop) : 0;
  $('compose').style.setProperty('--keyboard-inset', keyboard + 'px');
  $('compose').classList.toggle('keyboard-visible', keyboard > 80);
}
window.visualViewport?.addEventListener('resize', positionComposer);
window.visualViewport?.addEventListener('scroll', positionComposer);
$('type-reply').onclick = () => {
  if (!$('compose').hidden) {
    closeComposer();
    return;
  }
  pauseControls();
  $('compose').hidden = false;
  $('type-reply').setAttribute('aria-expanded', 'true');
  positionComposer();
  $('reply-text').focus({ preventScroll: true });
};
$('compose').addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closeComposer();
  }
  // An IME confirmation must not send an unfinished message.
  if (event.key === 'Enter' && event.isComposing) event.preventDefault();
});
$('reply-form').onsubmit = (event) => {
  event.preventDefault();
  const text = $('reply-text').value.trim();
  if (!text) return;
  closeComposer();
  send(text).catch(error);
};
async function beginTalk() {
  if (recording || !canTalk()) return;
  if (!settings.speech) {
    status('Set up local audio in the lesson menu.');
    return;
  }
  recording = true;
  const epoch = ++recordEpoch;
  session.cancel();
  stopAudio();
  $('ptt').setAttribute('aria-pressed', 'true');
  phase('listening');
  status('Opening microphone…');
  try {
    if (!(await capture.start()) || epoch !== recordEpoch) {
      if (!recording) status('Microphone ready. Hold to talk again, then release to send.');
      return;
    }
    status('Listening… release to send.');
    recordTimer = setTimeout(endTalk, 30000);
  } catch (e) {
    recording = false;
    phase('idle');
    $('ptt').setAttribute('aria-pressed', 'false');
    status(
      e.name === 'NotAllowedError'
        ? 'Allow microphone access in your browser’s site settings, then try again.'
        : e.name === 'NotFoundError'
          ? 'No microphone was found. Connect one and try again.'
          : e.message,
    );
  }
}
async function endTalk() {
  if (!recording) return;
  recording = false;
  clearTimeout(recordTimer);
  const epoch = recordEpoch;
  phase('thinking');
  $('ptt').setAttribute('aria-pressed', 'false');
  try {
    const blob = await capture.stop();
    if (!blob?.size || epoch !== recordEpoch) {
      phase('idle');
      return;
    }
    status('Listening to your words…');
    const { text } =
      config.speechBackend === 'browser'
        ? await browserVoice.transcribe(blob)
        : await (
            await request('transcribe', { method: 'POST', body: blob, type: blob.type })
          ).json();
    if (epoch === recordEpoch) {
      if (text.trim()) await send(text);
      else {
        phase('idle');
        status('I didn’t hear any words. Hold to talk and try again.');
      }
    }
  } catch (e) {
    if (epoch === recordEpoch) {
      phase('idle');
      error(e);
    }
  }
}
$('ptt').onpointerdown = (e) => {
  e.preventDefault();
  $('ptt').setPointerCapture(e.pointerId);
  captureSource = 'pointer';
  beginTalk();
};
$('ptt').onpointerup = () => {
  if (captureSource === 'pointer') {
    captureSource = null;
    endTalk();
  }
};
$('ptt').onpointercancel = cancelRecording;
$('ptt').onkeydown = (e) => {
  if (e.key === 'Enter' && !e.repeat) {
    e.preventDefault();
    if (recording) endTalk();
    else {
      captureSource = 'toggle';
      beginTalk();
    }
  }
};
$('lesson-menu').onclick = openMenu;
$('walkie-settings').onclick = openSettings;
$('show-captions').onchange = () => {
  $('caption').hidden = !$('show-captions').checked || !$('caption').textContent;
};
for (const b of document.querySelectorAll('[data-close]'))
  b.onclick = () => $(b.dataset.close).close();
for (const dialog of [$('conversation'), $('settings')])
  dialog.addEventListener('close', () => {
    if (canTalk()) port?.setShortcutsEnabled(true).catch(error);
  });
$('settings-open').onclick = openSettings;
$('lesson-settings').onclick = openSettings;
$('add-lesson').onclick = () => $('import').click();
$('import').onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    await request('import', { method: 'POST', body: f, type: 'application/zip' });
    await library();
    $('library-status').textContent = 'Lesson added.';
  } catch (e) {
    $('library-status').textContent = e.message;
  }
  e.target.value = '';
};
$('download-log').onclick = () =>
  download(
    new Blob(
      logs.map((e) => JSON.stringify(e) + '\n'),
      { type: 'application/x-ndjson' },
    ),
    'marble-session.jsonl',
  );
window.addEventListener('blur', () => {
  // A scene-focused Space key is handled in that frame; do not cancel merely
  // because focus moved from the player into its lesson.
  if (captureSource === 'pointer' && recording) cancelRecording();
});
await library();

$('test-voice').onclick = async () => {
  const button = $('test-voice');
  button.disabled = true;
  $('settings-status').textContent = 'Testing local voice…';
  try {
    if (config.speechBackend === 'browser') {
      await settingsUI.prepareVoice();
      stopAudio();
      speechController = new AbortController();
      await browserVoice.speak('Hello! Your Marble audio is working.', speechController.signal);
      $('settings-status').textContent =
        'Voice is working. Hold the walkie-talkie or Space to speak during a lesson.';
      return;
    }
    const response = await request('speak', {
      method: 'POST',
      body: { text: 'Hello! Your Marble audio is working.' },
    });
    stopAudio();
    audioUrl = URL.createObjectURL(await response.blob());
    audio = new Audio(audioUrl);
    await audio.play();
    $('settings-status').textContent =
      'Playing a test message. Microphone access will be requested when you hold to talk.';
  } catch (e) {
    $('settings-status').textContent = e.message;
  } finally {
    button.disabled = false;
  }
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    keys.cancel();
    cancelRecording();
    session?.cancel();
    stopAudio();
  }
});
