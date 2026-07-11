import { GraphView, SUBJECT_COLORS } from "./graph-view.js";
import { ProfileStore } from "./profile-store.js";
import { assessmentPromptFor, loadTaxonomy } from "./taxonomy.js";

const elements = Object.fromEntries(
  [
    "profile-select", "add-profile", "manage-profile", "search", "search-results", "subject-filter", "age-filter", "mastery-filter",
    "profile-greeting", "progress-summary", "progress-bar", "graph", "zoom-in", "zoom-out", "reset-view",
    "empty-state", "clear-filters", "details-empty", "details-content", "profile-dialog", "dialog-title",
    "profile-name", "save-profile", "profile-danger", "danger-copy", "reset-progress", "delete-profile", "toast",
  ].map((id) => [id, document.getElementById(id)]),
);

const store = new ProfileStore();
let taxonomy;
let graph;
let selectedId = null;
let dialogMode = "add";
let toastTimer;

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
  applyFilters();
}

function renderSummary() {
  if (!taxonomy) return;
  const profile = store.activeProfile;
  const entries = Object.values(profile?.progress ?? {});
  const mastered = entries.filter(({ status }) => status === "mastered").length;
  const learning = entries.filter(({ status }) => status === "learning").length;
  const assessed = entries.filter(({ assessment }) => assessment?.verified).length;
  const percent = Math.round((mastered / taxonomy.topics.length) * 100);
  elements["profile-greeting"].textContent = profile ? `${profile.name}'s learning map` : "Learning overview";
  elements["progress-summary"].textContent = profile
    ? `${mastered} known · ${learning} learning · ${assessed} assessed · ${taxonomy.topics.length - mastered - learning} not started`
    : "Create a private child profile to start tracking progress.";
  elements["progress-bar"].style.width = `${percent}%`;
  const track = elements["progress-bar"].parentElement;
  track.setAttribute("aria-valuenow", String(percent));
  track.setAttribute("aria-valuetext", `${mastered} of ${taxonomy.topics.length} concepts known`);
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
    showToast(value === null ? "Progress cleared" : value === "learning" ? "Marked as learning" : "Marked as known");
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
  assessment.append(makeElement("p", { className: "assessment-help", text: "Check each piece of evidence you observed. This does not score the child; it records your judgement." }));
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
    showToast("Assessment saved privately in this browser");
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
  elements["dialog-title"].textContent = mode === "add" ? "Add a child" : "Manage profile";
  elements["profile-name"].value = mode === "manage" ? profile?.name ?? "" : "";
  elements["profile-danger"].hidden = mode !== "manage";
  elements["danger-copy"].textContent = profile ? `Reset or remove ${profile.name}'s browser-only data.` : "";
  elements["profile-dialog"].showModal();
  setTimeout(() => elements["profile-name"].focus(), 0);
}

function clearFilters() {
  elements.search.value = "";
  elements["subject-filter"].value = "";
  elements["age-filter"].value = "";
  elements["mastery-filter"].value = "dim";
  applyFilters();
}

function bindEvents() {
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
