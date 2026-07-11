import { GraphView, SUBJECT_COLORS } from "./graph-view.js";
import { filterLogbookTopics, getProgressStats, getRecommendedTopics, getSubjectJourneys } from "./logbook.js";
import { ProfileStore } from "./profile-store.js";
import { assessmentPromptFor, loadTaxonomy } from "./taxonomy.js";

const elements = Object.fromEntries(
  [
    "profile-select", "add-profile", "manage-profile", "search", "search-results", "subject-filter", "age-filter", "mastery-filter",
    "profile-greeting", "progress-summary", "progress-bar", "graph", "zoom-in", "zoom-out", "reset-view",
    "empty-state", "clear-filters", "details-empty", "details-content", "profile-dialog", "dialog-title",
    "profile-name", "profile-name-field", "save-profile", "profile-danger", "danger-copy", "reset-progress", "delete-profile", "toast",
    "workspace", "graph-mode", "logbook-mode", "logbook-view", "logbook-content", "profile-dialog-actions",
    "managed-profile-summary", "managed-profile-name", "managed-profile-avatar", "edit-profile-name", "name-once-note", "celebration",
  ].map((id) => [id, document.getElementById(id)]),
);

const store = new ProfileStore();
let taxonomy;
let graph;
let selectedId = null;
let dialogMode = "add";
let toastTimer;
let currentView = "graph";
let logbookFilter = "all";
let logbookSearch = "";
let logbookLimit = 60;

function activeProgress() {
  return store.activeProfile?.progress ?? {};
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2600);
}

function makeElement(tag, { className, text, attrs = {} } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
  return element;
}

function topicButton(topic, relationship) {
  const button = makeElement("button", { className: "relationship-item", attrs: { type: "button" } });
  const copy = makeElement("span");
  copy.append(makeElement("strong", { text: topic.name }), makeElement("small", { text: `${topic.subject} · ages ${topic.ageRangeStart}–${topic.ageRangeEnd}` }));
  button.append(copy, makeElement("span", { className: "relationship-arrow", text: relationship === "prerequisite" ? "←" : "→" }));
  button.addEventListener("click", () => selectTopic(topic.id));
  return button;
}

function renderProfiles() {
  const state = store.state;
  elements["profile-select"].replaceChildren();
  if (!state.profiles.length) {
    elements["profile-select"].append(new Option("No child profile", ""));
  } else {
    for (const profile of state.profiles) elements["profile-select"].append(new Option(profile.name, profile.id));
    elements["profile-select"].value = state.activeProfileId;
  }
  elements["manage-profile"].disabled = !state.activeProfileId;
  renderSummary();
  renderDetails();
  renderLogbook();
  applyFilters();
}

function renderSummary() {
  if (!taxonomy) return;
  const profile = store.activeProfile;
  const stats = getProgressStats(taxonomy.topics, profile?.progress ?? {});
  const percent = Math.round((stats.known / stats.total) * 100);
  elements["profile-greeting"].textContent = profile ? `${profile.name}'s learning map` : "Learning overview";
  elements["progress-summary"].textContent = profile
    ? `${stats.known} known · ${stats.learning} learning · ${stats.assessed} assessed · ${stats.notStarted} not started`
    : "Create a private child profile to start tracking progress.";
  elements["progress-bar"].style.width = `${percent}%`;
  const track = elements["progress-bar"].parentElement;
  track.setAttribute("aria-valuenow", String(percent));
  track.setAttribute("aria-valuetext", `${stats.known} of ${stats.total} concepts known`);
}

function filters() {
  return {
    query: elements.search.value.trim().toLocaleLowerCase(),
    subject: elements["subject-filter"].value,
    age: Number(elements["age-filter"].value) || null,
    masteryMode: elements["mastery-filter"].value,
  };
}

function renderSearchResults() {
  if (!taxonomy) return;
  const query = elements.search.value.trim().toLocaleLowerCase();
  const results = elements["search-results"];
  results.replaceChildren();
  if (query.length < 2 || document.activeElement !== elements.search) {
    results.hidden = true;
    elements.search.setAttribute("aria-expanded", "false");
    return;
  }

  const matches = taxonomy.topics
    .filter((topic) => `${topic.name} ${topic.domain} ${topic.description}`.toLocaleLowerCase().includes(query))
    .sort((left, right) => {
      const leftStarts = left.name.toLocaleLowerCase().startsWith(query) ? 0 : 1;
      const rightStarts = right.name.toLocaleLowerCase().startsWith(query) ? 0 : 1;
      return leftStarts - rightStarts || right.centrality - left.centrality || left.name.localeCompare(right.name);
    })
    .slice(0, 8);

  if (!matches.length) {
    results.append(makeElement("p", { text: "No matching concepts" }));
  } else {
    for (const topic of matches) {
      const button = makeElement("button", { attrs: { type: "button", role: "option" } });
      const dot = makeElement("i");
      dot.style.background = SUBJECT_COLORS[topic.subject] || "#92a3bb";
      const copy = makeElement("span");
      copy.append(makeElement("strong", { text: topic.name }), makeElement("small", { text: `${topic.subject} · ${topic.domain}` }));
      button.append(dot, copy);
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => {
        results.hidden = true;
        elements.search.setAttribute("aria-expanded", "false");
        selectTopic(topic.id);
      });
      results.append(button);
    }
  }
  results.hidden = false;
  elements.search.setAttribute("aria-expanded", "true");
}

const SUBJECT_GLYPHS = {
  Computing: "⌘",
  English: "Aa",
  History: "⌛",
  "Learning to Learn": "✦",
  "Life Skills": "☀",
  Mathematics: "π",
  "Personal & Social Development": "♥",
  Science: "⚗",
};

function celebrate() {
  if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const container = elements.celebration;
  container.replaceChildren();
  const colors = ["#7df0bd", "#fff3a6", "#7c6df2", "#eb6f92", "#4e83e6"];
  for (let index = 0; index < 24; index += 1) {
    const piece = makeElement("i");
    piece.style.setProperty("--x", `${(Math.random() - 0.5) * 520}px`);
    piece.style.setProperty("--y", `${-120 - Math.random() * 330}px`);
    piece.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    piece.style.setProperty("--delay", `${Math.random() * 0.16}s`);
    piece.style.background = colors[index % colors.length];
    container.append(piece);
  }
  container.classList.remove("playing");
  requestAnimationFrame(() => container.classList.add("playing"));
  setTimeout(() => container.replaceChildren(), 1400);
}

function switchView(view) {
  currentView = view;
  const logbook = view === "logbook";
  elements.workspace.classList.toggle("logbook-mode", logbook);
  elements["logbook-view"].hidden = !logbook;
  elements["graph-mode"].classList.toggle("active", !logbook);
  elements["graph-mode"].setAttribute("aria-pressed", String(!logbook));
  elements["logbook-mode"].classList.toggle("active", logbook);
  elements["logbook-mode"].setAttribute("aria-pressed", String(logbook));
  if (logbook) renderLogbook();
  else requestAnimationFrame(() => graph?.resize());
}

function openFromLogbook(topicId) {
  switchView("graph");
  selectTopic(topicId);
}

function logbookSection(title, description) {
  const section = makeElement("section", { className: "logbook-section" });
  const heading = makeElement("div", { className: "logbook-section-heading" });
  const copy = makeElement("div");
  copy.append(makeElement("h2", { text: title }), makeElement("p", { text: description }));
  heading.append(copy);
  section.append(heading);
  return { section, heading };
}

function logbookStatus(entry) {
  if (entry?.assessment?.verified) return { label: "Assessed", className: "assessed", icon: "★" };
  if (entry?.status === "mastered") return { label: "Known", className: "known", icon: "✓" };
  if (entry?.status === "learning") return { label: "Learning", className: "learning", icon: "↗" };
  return { label: "Not yet", className: "not-started", icon: "○" };
}

function renderLogbook() {
  if (!taxonomy) return;
  const content = elements["logbook-content"];
  content.replaceChildren();
  const profile = store.activeProfile;
  if (!profile) {
    const empty = makeElement("div", { className: "logbook-empty" });
    empty.append(
      makeElement("span", { className: "logbook-empty-icon", text: "✦" }),
      makeElement("h1", { text: "Every adventure needs a learner" }),
      makeElement("p", { text: "Create one private profile, then the logbook will organize everything they know, are learning, and can try next." }),
    );
    const add = makeElement("button", { className: "button primary", text: "Create child profile", attrs: { type: "button" } });
    add.addEventListener("click", () => openProfileDialog("add"));
    empty.append(add);
    content.append(empty);
    return;
  }

  const progress = profile.progress;
  const stats = getProgressStats(taxonomy.topics, progress);
  const points = stats.known * 10 + stats.assessed * 5 + stats.learning * 2;
  const level = Math.floor(points / 100) + 1;
  const levelProgress = points % 100;

  const hero = makeElement("header", { className: "logbook-hero" });
  const heroCopy = makeElement("div");
  heroCopy.append(
    makeElement("p", { className: "eyebrow", text: `${profile.name}'s learning adventure` }),
    makeElement("h1", { text: "Learning Logbook" }),
    makeElement("p", { text: `One friendly place to see what ${profile.name} knows, what is in progress, and which adventure could come next.` }),
  );
  const levelCard = makeElement("div", { className: "level-card", attrs: { title: "Learning points come from concepts tracked in this browser." } });
  const levelRing = makeElement("div", { className: "level-ring" });
  levelRing.style.setProperty("--level-progress", `${levelProgress * 3.6}deg`);
  levelRing.append(makeElement("strong", { text: String(level) }), makeElement("small", { text: "LEVEL" }));
  const pointCopy = makeElement("span");
  pointCopy.append(makeElement("strong", { text: `${points} points` }), makeElement("small", { text: `${100 - levelProgress} to level ${level + 1}` }));
  levelCard.append(levelRing, pointCopy);
  hero.append(heroCopy, levelCard);
  content.append(hero);

  const statsGrid = makeElement("div", { className: "logbook-stats" });
  for (const [value, label, icon, kind] of [
    [stats.known, "Known", "✓", "known"],
    [stats.learning, "Learning", "↗", "learning"],
    [stats.assessed, "Assessed", "★", "assessed"],
    [stats.notStarted, "Not yet", "○", "not-started"],
  ]) {
    const card = makeElement("button", { className: `logbook-stat ${kind}`, attrs: { type: "button" } });
    card.append(makeElement("i", { text: icon }), makeElement("strong", { text: String(value) }), makeElement("span", { text: label }));
    card.addEventListener("click", () => {
      logbookFilter = kind === "not-started" ? "not-started" : kind;
      document.getElementById("logbook-ledger")?.scrollIntoView({ behavior: "smooth" });
      renderLogbook();
      setTimeout(() => document.getElementById("logbook-ledger")?.scrollIntoView({ behavior: "smooth" }), 0);
    });
    statsGrid.append(card);
  }
  content.append(statsGrid);

  const recommendations = getRecommendedTopics(taxonomy, progress, 5);
  const adventure = logbookSection("Next adventures", `A suggested path based on what ${profile.name} is learning and which prerequisites are complete.`);
  const path = makeElement("div", { className: "adventure-path" });
  for (const [index, topic] of recommendations.entries()) {
    const entry = progress[topic.id];
    const step = makeElement("article", { className: `path-step${entry?.status === "learning" ? " current" : ""}` });
    const orb = makeElement("button", { className: "path-orb", attrs: { type: "button", "aria-label": `Open ${topic.name}` } });
    orb.style.setProperty("--subject-color", SUBJECT_COLORS[topic.subject] || "#92a3bb");
    orb.append(makeElement("span", { text: SUBJECT_GLYPHS[topic.subject] || "✦" }));
    orb.addEventListener("click", () => openFromLogbook(topic.id));
    const copy = makeElement("div", { className: "path-copy" });
    copy.append(
      makeElement("small", { text: entry?.status === "learning" ? "Continue learning" : index === 0 ? "Suggested next" : `Step ${index + 1}` }),
      makeElement("h3", { text: topic.name }),
      makeElement("p", { text: `${topic.subject} · ${topic.domain} · ages ${topic.ageRangeStart}–${topic.ageRangeEnd}` }),
    );
    const action = makeElement("button", {
      className: `button ${entry?.status === "learning" ? "secondary" : "path-action"}`,
      text: entry?.status === "learning" ? "Continue" : "Start",
      attrs: { type: "button" },
    });
    action.addEventListener("click", () => {
      if (entry?.status === "learning") return openFromLogbook(topic.id);
      store.setProgress(topic.id, "learning");
      showToast(`${profile.name} started ${topic.name}!`);
    });
    step.append(orb, copy, action);
    path.append(step);
  }
  adventure.section.append(path);
  content.append(adventure.section);

  const subjectSection = logbookSection("Subject journeys", "Progress across the whole taxonomy. Open any journey back in the graph.");
  const journeys = makeElement("div", { className: "subject-journeys" });
  for (const journey of getSubjectJourneys(taxonomy.topics, progress)) {
    const percent = Math.round((journey.known / journey.total) * 100);
    const card = makeElement("button", { className: "journey-card", attrs: { type: "button" } });
    const icon = makeElement("i", { text: SUBJECT_GLYPHS[journey.subject] || "✦" });
    icon.style.background = SUBJECT_COLORS[journey.subject] || "#92a3bb";
    const copy = makeElement("span");
    copy.append(
      makeElement("strong", { text: journey.subject }),
      makeElement("small", { text: `${journey.known} known · ${journey.learning} learning · ${journey.total} total` }),
    );
    const bar = makeElement("span", { className: "journey-progress" });
    const fill = makeElement("i");
    fill.style.width = `${Math.max(percent, journey.known ? 2 : 0)}%`;
    fill.style.background = SUBJECT_COLORS[journey.subject] || "#92a3bb";
    bar.append(fill);
    card.append(icon, copy, makeElement("b", { text: `${percent}%` }), bar);
    card.addEventListener("click", () => {
      elements["subject-filter"].value = journey.subject;
      elements.search.value = "";
      applyFilters();
      switchView("graph");
    });
    journeys.append(card);
  }
  subjectSection.section.append(journeys);
  content.append(subjectSection.section);

  const ledger = logbookSection("The complete logbook", "Search every concept or focus on what is known, in progress, assessed, or not started yet.");
  ledger.section.id = "logbook-ledger";
  const controls = makeElement("div", { className: "ledger-controls" });
  const search = makeElement("input", { attrs: { type: "search", placeholder: "Search the logbook…", "aria-label": "Search the logbook" } });
  search.value = logbookSearch;
  const statusFilter = makeElement("select", { attrs: { "aria-label": "Logbook status" } });
  for (const [value, label] of [["all", "All concepts"], ["learning", "Learning"], ["known", "Known"], ["assessed", "Assessed"], ["not-started", "Not yet"]]) {
    statusFilter.append(new Option(label, value, false, logbookFilter === value));
  }
  const resultCount = makeElement("span", { className: "ledger-count" });
  controls.append(search, statusFilter, resultCount);
  ledger.heading.append(controls);
  const rows = makeElement("div", { className: "ledger-rows" });
  const loadMore = makeElement("button", { className: "button secondary load-more", text: "Show more", attrs: { type: "button" } });

  function updateLedger() {
    const matches = filterLogbookTopics(taxonomy.topics, progress, { status: logbookFilter, query: logbookSearch });
    resultCount.textContent = `${matches.length} concept${matches.length === 1 ? "" : "s"}`;
    rows.replaceChildren();
    if (!matches.length) rows.append(makeElement("p", { className: "ledger-empty", text: "Nothing matches yet. Try another filter or search." }));
    for (const topic of matches.slice(0, logbookLimit)) {
      const entry = progress[topic.id];
      const status = logbookStatus(entry);
      const row = makeElement("article", { className: "ledger-row" });
      const subjectDot = makeElement("i", { className: "ledger-subject" });
      subjectDot.style.background = SUBJECT_COLORS[topic.subject] || "#92a3bb";
      const topicCopy = makeElement("button", { className: "ledger-topic", attrs: { type: "button" } });
      topicCopy.append(makeElement("strong", { text: topic.name }), makeElement("small", { text: `${topic.subject} · ${topic.domain} · ages ${topic.ageRangeStart}–${topic.ageRangeEnd}` }));
      topicCopy.addEventListener("click", () => openFromLogbook(topic.id));
      const badge = makeElement("span", { className: `ledger-status ${status.className}` });
      badge.append(makeElement("i", { text: status.icon }), document.createTextNode(status.label));
      const actions = makeElement("div", { className: "ledger-actions" });
      if (entry?.status !== "learning") {
        const learn = makeElement("button", { text: "Learn", attrs: { type: "button", title: "Mark as learning" } });
        learn.addEventListener("click", () => { store.setProgress(topic.id, "learning"); showToast(`${profile.name} is learning ${topic.name}`); });
        actions.append(learn);
      }
      if (entry?.status !== "mastered") {
        const know = makeElement("button", { className: "know-action", text: "Know it", attrs: { type: "button", title: "Mark as known" } });
        know.addEventListener("click", () => { store.setProgress(topic.id, "mastered"); celebrate(); showToast(`Wonderful — ${profile.name} knows ${topic.name}!`); });
        actions.append(know);
      }
      const assess = makeElement("button", { text: "Assess", attrs: { type: "button", title: "Open the evidence checklist" } });
      assess.addEventListener("click", () => openFromLogbook(topic.id));
      actions.append(assess);
      row.append(subjectDot, topicCopy, badge, actions);
      rows.append(row);
    }
    loadMore.hidden = matches.length <= logbookLimit;
  }
  search.addEventListener("input", (event) => { logbookSearch = event.target.value; logbookLimit = 60; updateLedger(); });
  statusFilter.addEventListener("change", (event) => { logbookFilter = event.target.value; logbookLimit = 60; updateLedger(); });
  loadMore.addEventListener("click", () => { logbookLimit += 60; updateLedger(); });
  updateLedger();
  ledger.section.append(rows, loadMore);
  content.append(ledger.section);

  const recent = logbookSection("Recent moments", `A private activity trail for ${profile.name}, stored only in this browser.`);
  const timeline = makeElement("div", { className: "activity-timeline" });
  const recentActivities = [...profile.activities].reverse().slice(0, 12);
  if (!recentActivities.length) {
    timeline.append(makeElement("p", { className: "activity-empty", text: "New learning moments will appear here as you update the logbook." }));
  } else {
    const labels = {
      learning: ["↗", "started learning"],
      mastered: ["✓", "marked as known"],
      assessed: ["★", "completed an assessment for"],
      cleared: ["○", "moved back to not started"],
    };
    for (const activity of recentActivities) {
      const topic = taxonomy.byId.get(activity.topicId);
      if (!topic) continue;
      const [icon, verb] = labels[activity.action];
      const item = makeElement("button", { className: `activity-item ${activity.action}`, attrs: { type: "button" } });
      item.append(makeElement("i", { text: icon }), makeElement("span", { text: `${profile.name} ${verb} “${topic.name}”` }), makeElement("time", { text: new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(activity.at)), attrs: { datetime: activity.at } }));
      item.addEventListener("click", () => openFromLogbook(topic.id));
      timeline.append(item);
    }
  }
  recent.section.append(timeline);
  content.append(recent.section);
}

function applyFilters() {
  if (!taxonomy || !graph) return;
  const { query, subject, age, masteryMode } = filters();
  const progress = activeProgress();
  const visibleIds = new Set();
  for (const topic of taxonomy.topics) {
    const known = progress[topic.id]?.status === "mastered";
    const searchText = `${topic.name} ${topic.description} ${topic.domain}`.toLocaleLowerCase();
    if (query && !searchText.includes(query)) continue;
    if (subject && topic.subject !== subject) continue;
    if (age && (age < topic.ageRangeStart || age > topic.ageRangeEnd)) continue;
    if (masteryMode === "hide" && known) continue;
    if (masteryMode === "only" && !known) continue;
    visibleIds.add(topic.id);
  }
  elements["empty-state"].hidden = visibleIds.size > 0;
  graph.update({ visibleIds, progress, masteryMode, selectedId });
}

function statusButton(label, value, current, topicId) {
  const button = makeElement("button", {
    className: `status-button${current === value ? " active" : ""}`,
    text: label,
    attrs: { type: "button", "aria-pressed": String(current === value) },
  });
  button.addEventListener("click", () => {
    if (!store.activeProfile) return openProfileDialog("add");
    store.setProgress(topicId, value);
    const name = store.activeProfile?.name ?? "Your learner";
    if (value === "mastered") celebrate();
    showToast(value === null ? "Progress cleared" : value === "learning" ? `${name} started a new adventure!` : `Wonderful — ${name} knows this!`);
  });
  return button;
}

function sectionHeading(title, count) {
  const heading = makeElement("div", { className: "section-heading" });
  heading.append(makeElement("h3", { text: title }), makeElement("span", { text: String(count) }));
  return heading;
}

function renderDetails() {
  if (!taxonomy) return;
  const topic = taxonomy.byId.get(selectedId);
  elements["details-empty"].hidden = Boolean(topic);
  elements["details-content"].hidden = !topic;
  if (!topic) return;

  const profile = store.activeProfile;
  const entry = profile?.progress[topic.id];
  const current = entry?.status ?? null;
  const content = elements["details-content"];
  content.replaceChildren();

  const header = makeElement("header", { className: "topic-header" });
  const kicker = makeElement("div", { className: "topic-kicker" });
  const color = SUBJECT_COLORS[topic.subject] || "#92a3bb";
  const subjectDot = makeElement("i", { className: "subject-dot" });
  subjectDot.style.background = color;
  kicker.append(subjectDot, document.createTextNode(`${topic.subject} · ${topic.domain}`));
  header.append(kicker, makeElement("h1", { text: topic.name }), makeElement("p", { text: topic.description }));
  const chips = makeElement("div", { className: "chips" });
  chips.append(
    makeElement("span", { text: `Ages ${topic.ageRangeStart}–${topic.ageRangeEnd}` }),
    makeElement("span", { text: topic.type.toLowerCase().replaceAll("_", " ") }),
  );
  if (entry?.assessment?.verified) chips.append(makeElement("span", { className: "verified-chip", text: "✓ Assessed" }));
  header.append(chips);

  const progressSection = makeElement("section", { className: "detail-section progress-section" });
  progressSection.append(makeElement("h2", { text: profile ? `What does ${profile.name} know?` : "Track this concept" }));
  const statusControl = makeElement("div", { className: "status-control" });
  statusControl.append(
    statusButton("Not started", null, current, topic.id),
    statusButton("Learning", "learning", current, topic.id),
    statusButton("Knows it", "mastered", current, topic.id),
  );
  progressSection.append(statusControl);
  if (!profile) progressSection.append(makeElement("p", { className: "inline-note", text: "Selecting a status will first create a private child profile." }));

  const assessment = makeElement("section", { className: "detail-section assessment-card" });
  assessment.append(makeElement("p", { className: "eyebrow", text: "Quick assessment" }));
  assessment.append(makeElement("h2", { text: assessmentPromptFor(topic, profile?.name) }));
  assessment.append(makeElement("p", {
    className: "assessment-help",
    text: profile
      ? `${profile.name}'s name is added automatically. Check each piece of evidence you observed; this records your judgement rather than scoring the child.`
      : "The profile name will be added automatically. Check each piece of evidence you observed; this records your judgement rather than scoring the child.",
  }));
  const checklist = makeElement("div", { className: "evidence-list" });
  const savedEvidence = new Set(entry?.assessment?.evidence ?? []);
  const checkboxes = topic.evidence.map((evidence, index) => {
    const label = makeElement("label");
    const input = makeElement("input", { attrs: { type: "checkbox" } });
    input.checked = savedEvidence.has(index);
    label.append(input, makeElement("span", { text: evidence }));
    checklist.append(label);
    return input;
  });
  const assessButton = makeElement("button", {
    className: "button assessment-action",
    text: entry?.assessment?.verified ? "Update assessment" : "Confirm assessment & mark known",
    attrs: { type: "button" },
  });
  function syncAssessButton() {
    const complete = checkboxes.length > 0 && checkboxes.every(({ checked }) => checked);
    assessButton.disabled = !complete;
    assessButton.title = complete ? "" : "Check every observed outcome to confirm this assessment";
  }
  checkboxes.forEach((checkbox) => checkbox.addEventListener("change", syncAssessButton));
  syncAssessButton();
  assessButton.addEventListener("click", () => {
    if (!store.activeProfile) return openProfileDialog("add");
    store.setProgress(topic.id, "mastered", { verified: true, evidence: checkboxes.map((_, index) => index) });
    celebrate();
    showToast(`Assessment complete — great work, ${store.activeProfile?.name}!`);
  });
  assessment.append(checklist, assessButton);

  content.append(header, progressSection, assessment);

  const prereqs = taxonomy.prerequisites.get(topic.id).filter(({ topic: linkedTopic }) => linkedTopic);
  const unlocks = taxonomy.unlocks.get(topic.id).filter(({ topic: linkedTopic }) => linkedTopic);
  for (const [title, items, relationship] of [
    ["Builds on", prereqs, "prerequisite"],
    ["Unlocks", unlocks, "unlock"],
  ]) {
    const section = makeElement("section", { className: "detail-section relationships" });
    section.append(sectionHeading(title, items.length));
    if (items.length) {
      for (const { topic: linkedTopic } of items.slice(0, 12)) section.append(topicButton(linkedTopic, relationship));
      if (items.length > 12) section.append(makeElement("p", { className: "inline-note", text: `And ${items.length - 12} more connected concepts.` }));
    } else {
      section.append(makeElement("p", { className: "inline-note", text: relationship === "prerequisite" ? "No prerequisite is recorded." : "No direct unlock is recorded." }));
    }
    content.append(section);
  }
}

function selectTopic(topicId) {
  selectedId = topicId;
  graph.select(topicId);
  renderDetails();
  if (globalThis.innerWidth < 900) document.getElementById("details").scrollIntoView({ behavior: "smooth", block: "start" });
}

function openProfileDialog(mode) {
  dialogMode = mode;
  const profile = store.activeProfile;
  const adding = mode === "add";
  elements["dialog-title"].textContent = adding ? "Add a child" : "Manage profile";
  elements["profile-name"].value = adding ? "" : profile?.name ?? "";
  elements["profile-name-field"].hidden = !adding;
  elements["profile-dialog-actions"].hidden = !adding;
  elements["managed-profile-summary"].hidden = adding;
  elements["name-once-note"].hidden = !adding;
  elements["profile-danger"].hidden = adding;
  elements["managed-profile-name"].textContent = profile?.name ?? "";
  elements["managed-profile-avatar"].textContent = profile?.name?.slice(0, 1).toLocaleUpperCase() ?? "";
  elements["danger-copy"].textContent = profile ? `Reset or remove ${profile.name}'s browser-only data.` : "";
  elements["profile-dialog"].showModal();
  if (adding) setTimeout(() => elements["profile-name"].focus(), 0);
}

function clearFilters() {
  elements.search.value = "";
  elements["subject-filter"].value = "";
  elements["age-filter"].value = "";
  elements["mastery-filter"].value = "dim";
  applyFilters();
}

function bindEvents() {
  elements["graph-mode"].addEventListener("click", () => switchView("graph"));
  elements["logbook-mode"].addEventListener("click", () => switchView("logbook"));
  elements["profile-select"].addEventListener("change", (event) => store.setActive(event.target.value));
  elements["add-profile"].addEventListener("click", () => openProfileDialog("add"));
  elements["manage-profile"].addEventListener("click", () => openProfileDialog("manage"));
  elements.search.addEventListener("input", () => { applyFilters(); renderSearchResults(); });
  elements.search.addEventListener("focus", renderSearchResults);
  elements.search.addEventListener("blur", () => setTimeout(renderSearchResults, 0));
  for (const element of [elements["subject-filter"], elements["age-filter"], elements["mastery-filter"]]) element.addEventListener("input", applyFilters);
  elements["clear-filters"].addEventListener("click", clearFilters);
  elements["zoom-in"].addEventListener("click", () => graph.zoom(1.25));
  elements["zoom-out"].addEventListener("click", () => graph.zoom(0.8));
  elements["reset-view"].addEventListener("click", () => graph.fit());
  elements["edit-profile-name"].addEventListener("click", () => {
    dialogMode = "rename";
    elements["dialog-title"].textContent = "Edit child's name";
    elements["managed-profile-summary"].hidden = true;
    elements["profile-name-field"].hidden = false;
    elements["profile-dialog-actions"].hidden = false;
    elements["profile-name"].value = store.activeProfile?.name ?? "";
    setTimeout(() => elements["profile-name"].focus(), 0);
  });
  elements["save-profile"].addEventListener("click", (event) => {
    event.preventDefault();
    if (!elements["profile-name"].reportValidity()) return;
    try {
      if (dialogMode === "add") store.addProfile(elements["profile-name"].value);
      else store.renameActive(elements["profile-name"].value);
      elements["profile-dialog"].close();
      showToast(dialogMode === "add" ? "Child profile created" : "Profile updated");
    } catch (error) {
      elements["profile-name"].setCustomValidity(error.message);
      elements["profile-name"].reportValidity();
      elements["profile-name"].setCustomValidity("");
    }
  });
  elements["reset-progress"].addEventListener("click", () => {
    const profile = store.activeProfile;
    if (profile && confirm(`Reset all learning progress for ${profile.name}? This cannot be undone.`)) {
      store.resetActiveProgress();
      elements["profile-dialog"].close();
      showToast("Progress reset");
    }
  });
  elements["delete-profile"].addEventListener("click", () => {
    const profile = store.activeProfile;
    if (profile && confirm(`Delete ${profile.name}'s profile and all progress from this browser?`)) {
      store.deleteActive();
      elements["profile-dialog"].close();
      showToast("Profile deleted");
    }
  });
  globalThis.addEventListener("storage", (event) => {
    if (event.key === "marble-taxonomy:learner-profiles") store.reload();
  });
}

async function initialize() {
  bindEvents();
  try {
    taxonomy = await loadTaxonomy();
    for (const subject of taxonomy.subjects) elements["subject-filter"].append(new Option(subject, subject));
    for (let age = taxonomy.minAge; age <= taxonomy.maxAge; age += 1) elements["age-filter"].append(new Option(`Age ${age}`, String(age)));
    graph = new GraphView(elements.graph, taxonomy, selectTopic);
    store.subscribe(renderProfiles);
    renderProfiles();
    if (!store.activeProfile) openProfileDialog("add");
  } catch (error) {
    elements["progress-summary"].textContent = error.message;
    elements["details-empty"].querySelector("h1").textContent = "The explorer could not start";
    elements["details-empty"].querySelector("p").textContent = "Serve the repository over HTTP with `npm run serve`, then reload this page.";
  }
}

initialize();
