// Run only in a temporary copy of index.html appended after its application script.
// Uses actual browser DOM/events; does not send data or follow source links.
(async () => {
  const result = document.createElement('pre');
  result.id = 'browser-smoke-result';
  document.body.append(result);
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const input = (id, value) => {
    $(id).value = value;
    $(id).dispatchEvent(new Event(id === 'search' ? 'input' : 'change'));
  };
  const settle = () => new Promise(resolve => setTimeout(resolve, 0));
  const moveHistory = direction => new Promise(resolve => {
    window.addEventListener('hashchange', resolve, { once: true });
    history[direction]();
  });
  const storedKeys = () => Object.keys(localStorage).filter(key => key === KEY || key.startsWith(NOTE_PREFIX));
  const prior = new Map(storedKeys().map(key => [key, localStorage.getItem(key)]));
  const create = URL.createObjectURL, revoke = URL.revokeObjectURL, click = HTMLAnchorElement.prototype.click;
  const originalDigests = new Map(entries.map(e => [e.topic.id, e.digest]));
  let exported;
  URL.createObjectURL = blob => { exported = blob; return 'blob:local-smoke'; };
  URL.revokeObjectURL = () => {};
  HTMLAnchorElement.prototype.click = () => {};
  const exportNotes = async () => {
    $('export').click();
    return JSON.parse(await exported.text());
  };
  try {
    assert(filtered.length === 52, 'Initial topic count');
    input('subject', 'Computing');
    assert(filtered.length === 52, 'Computing filter');
    input('domain', 'Artificial Intelligence');
    assert(filtered.length === entries.filter(e => e.topic.domain === 'Artificial Intelligence').length, 'Domain filter');
    input('domain', '');
    input('subject', '');
    input('confidence', 'low');
    assert(filtered.length === 6, 'Confidence filter');
    input('confidence', '');
    input('search', 'Binary on and off');
    assert(filtered.some(e => e.topic.id === 'mt_WQiVj8gIRs'), 'Search');
    $('topics').querySelector('[data-id="mt_WQiVj8gIRs"]').click();
    assert($('content').textContent.includes('10011=19'), 'Fresh binary assessment');
    input('search', 'a deliberately nonexistent topic query');
    assert(filtered.length === 0 && $('review-notes').hidden, 'Empty state');
    input('search', '');
    for (const entry of entries) {
      select(entry.topic.id);
      assert($('content').querySelector('h2').textContent === entry.topic.name, 'Render ' + entry.topic.id);
      assert($('content').querySelectorAll('.source').length === entry.research.sources.length, 'Source rendering');
    }
    select(entries[0].topic.id);
    $('next').click();
    assert(current === entries[1].topic.id, 'Next topic');
    $('previous').click();
    assert(current === entries[0].topic.id, 'Previous topic');
    select('mt_WQiVj8gIRs');
    $('notes').value = 'Browser smoke note <with literal text>';
    $('notes').dispatchEvent(new Event('input'));
    refreshNotes();
    const saved = notes[current];
    assert(saved.notes === $('notes').value && saved.researchDigest === byId.get(current).digest, 'Note and reviewed digest persistence');
    const parsed = await exportNotes();
    assert(parsed.reviews.some(r => r.topicId === current && r.notes.includes('<with literal text>') && r.researchDigest === byId.get(current).digest), 'Export content and digest');

    // Simulate loading the same saved notes after a record edit and page rebuild.
    const reviewedDigest = byId.get(current).digest;
    byId.get(current).digest = '0'.repeat(64);
    refreshNotes();
    render();
    assert(!$('confirm-version').hidden && $('note-status').textContent.includes('earlier version'), 'Stale note warning');
    $('notes').value += ' More detail';
    $('notes').dispatchEvent(new Event('input'));
    const stale = (await exportNotes()).reviews.find(r => r.topicId === current);
    assert(stale.researchDigest === reviewedDigest && stale.currentResearchDigest === '0'.repeat(64) && !stale.matchesCurrentRecord, 'Stale export preserves original digest even after editing');
    $('confirm-version').click();
    assert($('confirm-version').hidden && (await exportNotes()).reviews.find(r => r.topicId === current).matchesCurrentRecord, 'Explicit re-review confirmation');

    for (const key of storedKeys()) localStorage.removeItem(key);
    localStorage.setItem(KEY, JSON.stringify({ [current]: 'Legacy unversioned note' }));
    refreshNotes();
    render();
    assert(!$('confirm-version').hidden && $('note-status').textContent.includes('no saved record version'), 'Legacy note warning');
    $('notes').value += ' More detail';
    $('notes').dispatchEvent(new Event('input'));
    assert((await exportNotes()).reviews.find(r => r.topicId === current).researchDigest === null, 'Legacy notes never acquire an inferred digest');
    byId.get(current).digest = reviewedDigest;

    // Back must restore the topic and its notes even when filters exclude it.
    const programming = entries[0], ai = entries.find(e => e.topic.domain === 'Artificial Intelligence');
    saveNote(programming.topic.id, 'Programming history note', programming.digest, []);
    saveNote(ai.topic.id, 'AI history note', ai.digest, []);
    select(programming.topic.id); await settle();
    select(ai.topic.id); await settle();
    input('subject', 'Computing');
    input('domain', ai.topic.domain);
    input('confidence', ai.research.confidence);
    input('search', ai.topic.name);
    await moveHistory('back');
    assert(current === programming.topic.id && $('content').querySelector('h2').textContent === programming.topic.name && $('notes').value === 'Programming history note', 'Back restores displayed topic and notes');
    assert(['search', 'subject', 'domain', 'confidence'].every(id => $(id).value === ''), 'Back clears filters that excluded its topic');
    assert($('topics').querySelector('[aria-current="true"]').dataset.id === current, 'Back restores selected navigation item');
    await moveHistory('forward');
    assert(current === ai.topic.id && $('notes').value === 'AI history note', 'Forward restores topic and notes');
    const citation = ai.research.sources[0].id;
    location.hash = citation; await settle();
    select(programming.topic.id); await settle();
    await moveHistory('back');
    assert(location.hash === '#' + citation && current === ai.topic.id && $('notes').value === 'AI history note', 'Back to source anchor restores owning topic');
    assert(document.documentElement.scrollWidth <= window.innerWidth, 'No horizontal page overflow');
    result.textContent = 'PASS: 52 topic renders; filters; navigation; source rendering; versioned/legacy/stale note persistence and export; explicit re-review; Back/Forward with conflicting filters and source anchors; width.';
  } catch (error) {
    result.textContent = 'FAIL: ' + error.stack;
  } finally {
    URL.createObjectURL = create; URL.revokeObjectURL = revoke; HTMLAnchorElement.prototype.click = click;
    for (const entry of entries) entry.digest = originalDigests.get(entry.topic.id);
    for (const key of storedKeys()) localStorage.removeItem(key);
    for (const [key, value] of prior) localStorage.setItem(key, value);
  }
})();
