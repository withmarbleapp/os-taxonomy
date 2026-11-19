import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Real tabs, origin storage and storage events. No remote content or dependencies.
test('two tabs preserve different-topic and conflicting same-topic notes through reload/export', { timeout: 30000 }, async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'psd-notes-tabs-'));
  const chrome = spawn(process.env.CHROME_BIN || '/usr/bin/google-chrome', [
    '--headless', '--no-sandbox', '--disable-gpu', '--disable-background-networking',
    '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let socket;
  try {
    const endpoint = await new Promise((resolve, reject) => {
      let stderr = '';
      chrome.stderr.on('data', bytes => {
        stderr += bytes;
        const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) resolve(match[1]);
      });
      chrome.once('error', reject);
      chrome.once('exit', code => reject(Error('Chrome exited before connection: ' + code + '\n' + stderr)));
    });
    socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let sequence = 0;
    const pending = new Map();
    socket.onmessage = event => {
      const message = JSON.parse(event.data), request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    };
    const command = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
    const evaluate = async (session, expression) => {
      const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, session);
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const ready = async session => {
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(session, 'typeof select === "function" && !!document.querySelector("#content h2")')) return;
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      throw Error('Review page did not load');
    };
    const openTab = async () => {
      const { targetId } = await command('Target.createTarget', { url: new URL('index.html', import.meta.url).href });
      const { sessionId } = await command('Target.attachToTarget', { targetId, flatten: true });
      await ready(sessionId);
      return sessionId;
    };
    const first = await openTab(), second = await openTab();
    const ids = await evaluate(first, 'entries.slice(0, 2).map(e => e.topic.id)');
    const edit = (tab, id, text) => evaluate(tab, `select(${JSON.stringify(id)}); $('notes').value=${JSON.stringify(text)}; $('notes').dispatchEvent(new Event('input'));`);
    const exportNotes = tab => evaluate(tab, `(async()=>{
      const create=URL.createObjectURL, click=HTMLAnchorElement.prototype.click;let captured;
      URL.createObjectURL=blob=>{captured=blob;return 'blob:test';};HTMLAnchorElement.prototype.click=()=>{};
      try{$('export').click();return JSON.parse(await captured.text()).reviews;}
      finally{URL.createObjectURL=create;HTMLAnchorElement.prototype.click=click;}
    })()`);
    const waitFor = async (tab, expression) => {
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(tab, expression)) return;
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      throw Error('Storage event did not update other tab: ' + expression);
    };

    // Both tabs are open before either writes: the original whole-store save loses A.
    await edit(first, ids[0], 'First tab topic A');
    await edit(second, ids[1], 'Second tab topic B');
    for (const tab of [first, second]) {
      const rows = await exportNotes(tab);
      assert.ok(rows.some(row => row.topicId === ids[0] && row.notes === 'First tab topic A'));
      assert.ok(rows.some(row => row.topicId === ids[1] && row.notes === 'Second tab topic B'));
      await command('Page.reload', {}, tab);
      await ready(tab);
      assert.equal((await exportNotes(tab)).length, 2, 'Both notes survive reload');
    }
    await evaluate(second, `select(${JSON.stringify(ids[0])})`);
    await edit(first, ids[0], 'Visible in the second tab');
    await waitFor(second, `$('notes').value === 'Visible in the second tab'`);

    // Two delayed edits from the same parent must remain separate heads, regardless
    // of which storage event/write wins. This also exercises different bindings.
    const parent = await evaluate(first, `notes[${JSON.stringify(ids[0])}].revisionId`);
    const digest = await evaluate(first, `byId.get(${JSON.stringify(ids[0])}).digest`);
    await Promise.all([
      evaluate(first, `saveNote(${JSON.stringify(ids[0])},'Concurrent A',null,[${JSON.stringify(parent)}])`),
      evaluate(second, `saveNote(${JSON.stringify(ids[0])},'Concurrent B',${JSON.stringify(digest)},[${JSON.stringify(parent)}])`),
    ]);
    for (const tab of [first, second]) {
      await waitFor(tab, `!$('note-conflicts').hidden && $('note-status').textContent.includes('Conflicting edits')`);
      const rows = (await exportNotes(tab)).filter(row => row.topicId === ids[0]);
      assert.deepEqual(rows.map(row => row.notes).sort(), ['Concurrent A', 'Concurrent B']);
      assert.ok(rows.every(row => row.conflictingVersions));
      assert.equal(rows.find(row => row.notes === 'Concurrent A').researchDigest, null);
      assert.equal(rows.find(row => row.notes === 'Concurrent B').researchDigest, digest);
    }
    await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false }, second);
    assert.ok(await evaluate(second, 'document.documentElement.scrollWidth <= window.innerWidth'), 'Conflict controls fit a narrow viewport');
    await command('Page.reload', {}, second); await ready(second);
    assert.equal((await exportNotes(second)).filter(row => row.topicId === ids[0]).length, 2, 'Conflicts survive reload');
    await evaluate(second, `select(${JSON.stringify(ids[0])}); const keep=(noteHeads.get(current)||[]).find(row=>row.notes==='Concurrent A'); $('note-conflicts').querySelector('[data-revision="'+keep.revisionId+'"]').click();`);
    await waitFor(first, `$('note-conflicts').hidden && $('notes').value === 'Concurrent A'`);
    const resolved = (await exportNotes(first)).filter(row => row.topicId === ids[0]);
    assert.equal(resolved.length, 1);
    assert.equal(resolved[0].researchDigest, null, 'Resolution preserves the selected version binding');
    assert.equal(resolved[0].conflictingVersions, false);
    assert.ok((await exportNotes(first)).some(row => row.topicId === ids[1]), 'Resolution retains other topics');

    // Normal typing retains a bounded set of heads, not a full copy per keypress.
    await evaluate(first, `for(let i=0;i<30;i++){ $('notes').value='Typing '+i; $('notes').dispatchEvent(new Event('input')); }`);
    assert.ok(await evaluate(first, `Object.keys(localStorage).filter(key=>key.startsWith(NOTE_PREFIX)).length <= 2`), 'Superseded revisions are compacted');
    const latest = (await exportNotes(first)).find(row => row.topicId === ids[0]);

    // A simultaneous clear is a conflict too, rather than silently deleting text.
    const resolvedParent = latest.revisionId;
    await Promise.all([
      evaluate(first, `saveNote(${JSON.stringify(ids[0])},'',null,[${JSON.stringify(resolvedParent)}])`),
      evaluate(second, `saveNote(${JSON.stringify(ids[0])},'Text alongside clear',null,[${JSON.stringify(resolvedParent)}])`),
    ]);
    await evaluate(first, 'refreshNotes();render()');
    const cleared = (await exportNotes(first)).filter(row => row.topicId === ids[0]);
    assert.deepEqual(cleared.map(row => row.notes).sort(), ['', 'Text alongside clear']);
    await evaluate(first, `$('notes').value='Combined reviewed note';$('notes').dispatchEvent(new Event('input'));$('resolve-current').click();`);
    await waitFor(second, `$('note-conflicts').hidden && $('notes').value === 'Combined reviewed note'`);
    const combined = (await exportNotes(second)).filter(row => row.topicId === ids[0]);
    assert.equal(combined.length, 1);
    assert.equal(combined[0].notes, 'Combined reviewed note');
    assert.equal(combined[0].researchDigest, null, 'Combining does not silently rebind to current research');
  } finally {
    socket?.close();
    const exited = chrome.exitCode !== null ? Promise.resolve() : new Promise(resolve => chrome.once('exit', resolve));
    chrome.kill();
    await exited;
    fs.rmSync(profile, { recursive: true, force: true });
  }
});
