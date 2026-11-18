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
    const prior = localStorage.getItem(KEY);
    $('notes').value = 'Browser smoke note <with literal text>';
    $('notes').dispatchEvent(new Event('input'));
    assert(JSON.parse(localStorage.getItem(KEY))[current] === $('notes').value, 'Note persistence');
    let exported;
    const create = URL.createObjectURL, revoke = URL.revokeObjectURL, click = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = blob => { exported = blob; return 'blob:local-smoke'; };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = () => {};
    $('export').click();
    const parsed = JSON.parse(await exported.text());
    URL.createObjectURL = create; URL.revokeObjectURL = revoke; HTMLAnchorElement.prototype.click = click;
    assert(parsed.reviews.some(r => r.topicId === current && r.notes.includes('<with literal text>') && r.researchDigest === byId.get(current).digest), 'Export content and digest');
    if (prior === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, prior);
    assert(document.documentElement.scrollWidth <= window.innerWidth, 'No horizontal page overflow');
    result.textContent = 'PASS: 111 topic renders; subject/confidence/search/empty filters; navigation; source rendering; note persistence and export; width.';
  } catch (error) {
    result.textContent = 'FAIL: ' + error.stack;
  }
})();
