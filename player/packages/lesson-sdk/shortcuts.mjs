// Shared by the player and isolated scenes; never capture ordinary text entry.
export function bindTalkShortcut({ target = document, enabled = () => true, send }) {
  let held = false;
  const release = (action = 'talk_cancel') => {
    if (!held) return;
    held = false;
    send(action);
  };
  const down = (event) => {
    if (
      !event.isTrusted ||
      event.code !== 'Space' ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.shiftKey ||
      event.isComposing ||
      !enabled()
    )
      return;
    const element = event.target;
    if (
      element?.closest?.(
        'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]',
      ) ||
      target.querySelector('dialog[open]')
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (held || event.repeat) return;
    held = true;
    send('talk_start');
  };
  const up = (event) => {
    if (event.code !== 'Space' || !held) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    release('talk_end');
  };
  const blur = () => release();
  target.addEventListener('keydown', down, true);
  target.addEventListener('keyup', up, true);
  target.defaultView.addEventListener('blur', blur);
  return {
    cancel: blur,
    close() {
      blur();
      target.removeEventListener('keydown', down, true);
      target.removeEventListener('keyup', up, true);
      target.defaultView.removeEventListener('blur', blur);
    },
  };
}
