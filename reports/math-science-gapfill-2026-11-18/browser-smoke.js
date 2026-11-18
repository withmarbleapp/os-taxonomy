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
  const prior = localStorage.getItem(KEY);
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
    assert(filtered.length === 111, 'Initial topic count');
    input('subject', 'Science');
    assert(filtered.length === 29, 'Science filter');
    input('subject', '');
    input('confidence', 'low');
    assert(filtered.length === 34, 'Confidence filter');
    input('confidence', '');
    input('search', 'Finding the median');
    assert(filtered.some(e => e.topic.id === 'mt_qwFJvRRucu'), 'Search');
    $('topics').querySelector('[data-id="mt_qwFJvRRucu"]').click();
    assert($('content').textContent.includes('23.5'), 'Fresh median assessment');
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
    select('mt_qwFJvRRucu');
    $('notes').value = 'Browser smoke note <with literal text>';
    $('notes').dispatchEvent(new Event('input'));
    const saved = JSON.parse(localStorage.getItem(KEY))[current];
    assert(saved.notes === $('notes').value && saved.researchDigest === byId.get(current).digest, 'Note and reviewed digest persistence');
    const parsed = await exportNotes();
    assert(parsed.reviews.some(r => r.topicId === current && r.notes.includes('<with literal text>') && r.researchDigest === byId.get(current).digest), 'Export content and digest');

    // Simulate loading the same saved notes after a record edit and page rebuild.
    const reviewedDigest = byId.get(current).digest;
    byId.get(current).digest = '0'.repeat(64);
    notes = loadNotes(JSON.parse(localStorage.getItem(KEY)));
    render();
    assert(!$('confirm-version').hidden && $('note-status').textContent.includes('earlier version'), 'Stale note warning');
    $('notes').value += ' More detail';
    $('notes').dispatchEvent(new Event('input'));
    const stale = (await exportNotes()).reviews.find(r => r.topicId === current);
    assert(stale.researchDigest === reviewedDigest && stale.currentResearchDigest === '0'.repeat(64) && !stale.matchesCurrentRecord, 'Stale export preserves original digest even after editing');
    $('confirm-version').click();
    assert($('confirm-version').hidden && (await exportNotes()).reviews.find(r => r.topicId === current).matchesCurrentRecord, 'Explicit re-review confirmation');

    notes = loadNotes({ [current]: 'Legacy unversioned note' });
    render();
    assert(!$('confirm-version').hidden && $('note-status').textContent.includes('no saved record version'), 'Legacy note warning');
    $('notes').value += ' More detail';
    $('notes').dispatchEvent(new Event('input'));
    assert((await exportNotes()).reviews.find(r => r.topicId === current).researchDigest === null, 'Legacy notes never acquire an inferred digest');
    byId.get(current).digest = reviewedDigest;

    // Back must restore the topic and its notes even when filters exclude it.
    const maths = entries[0], science = entries.find(e => e.topic.subject === 'Science');
    notes[maths.topic.id] = { notes: 'Maths history note', researchDigest: maths.digest };
    notes[science.topic.id] = { notes: 'Science history note', researchDigest: science.digest };
    select(maths.topic.id); await settle();
    select(science.topic.id); await settle();
    input('subject', 'Science');
    input('domain', science.topic.domain);
    input('confidence', science.research.confidence);
    input('search', science.topic.name);
    await moveHistory('back');
    assert(current === maths.topic.id && $('content').querySelector('h2').textContent === maths.topic.name && $('notes').value === 'Maths history note', 'Back restores displayed topic and notes');
    assert(['search', 'subject', 'domain', 'confidence'].every(id => $(id).value === ''), 'Back clears filters that excluded its topic');
    assert($('topics').querySelector('[aria-current="true"]').dataset.id === current, 'Back restores selected navigation item');
    await moveHistory('forward');
    assert(current === science.topic.id && $('notes').value === 'Science history note', 'Forward restores topic and notes');
    const citation = science.research.sources[0].id;
    location.hash = citation; await settle();
    select(maths.topic.id); await settle();
    await moveHistory('back');
    assert(location.hash === '#' + citation && current === science.topic.id && $('notes').value === 'Science history note', 'Back to source anchor restores owning topic');
    assert(document.documentElement.scrollWidth <= window.innerWidth, 'No horizontal page overflow');
    result.textContent = 'PASS: 111 topic renders; filters; navigation; source rendering; versioned/legacy/stale note persistence and export; explicit re-review; Back/Forward with conflicting filters and source anchors; width.';
  } catch (error) {
    result.textContent = 'FAIL: ' + error.stack;
  } finally {
    URL.createObjectURL = create; URL.revokeObjectURL = revoke; HTMLAnchorElement.prototype.click = click;
    for (const entry of entries) entry.digest = originalDigests.get(entry.topic.id);
    if (prior === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, prior);
  }
})();
