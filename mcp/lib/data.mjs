// Reads the taxonomy files once and builds the lookups the tools need. Read-only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function resolveDataDir() {
  const dir = process.env.OS_TAXONOMY_DIR ? path.resolve(process.env.OS_TAXONOMY_DIR) : REPO;
  if (!fs.existsSync(path.join(dir, 'data', 'topics.json'))) {
    throw new Error(`No taxonomy data in ${dir}/data. Set OS_TAXONOMY_DIR to an os-taxonomy checkout.`);
  }
  return dir;
}

const readJson = (dir, file) => JSON.parse(fs.readFileSync(path.join(dir, 'data', file), 'utf8'));
const push = (map, key, value) => (map.get(key) ?? map.set(key, []).get(key)).push(value);

export function loadTaxonomy(dir = resolveDataDir()) {
  const manifest = readJson(dir, 'manifest.json');
  const topics = readJson(dir, 'topics.json').topics;
  const dependencies = readJson(dir, 'dependencies.json').dependencies;
  const catalogue = readJson(dir, 'curriculum-standards.json').curricula;
  const alignments = readJson(dir, 'curriculum-alignments.json').alignments;
  const research = readJson(dir, 'teaching-research.json').records;

  const byId = new Map(topics.map((t) => [t.id, t]));
  const byName = new Map(); // several topics can share a name
  for (const t of topics) push(byName, t.name.toLowerCase(), t);

  // dependencies.json: topicId depends on prerequisiteId
  const prerequisites = new Map(topics.map((t) => [t.id, []]));
  const unlocks = new Map(topics.map((t) => [t.id, []]));
  for (const d of dependencies) {
    if (!byId.has(d.topicId) || !byId.has(d.prerequisiteId)) continue;
    prerequisites.get(d.topicId).push({ id: d.prerequisiteId, strength: d.strength, reason: d.reason });
    unlocks.get(d.prerequisiteId).push({ id: d.topicId, strength: d.strength, reason: d.reason });
  }

  const curricula = new Map();
  const standards = new Map();
  const byCode = new Map();
  for (const { topics: entries, ...meta } of catalogue) {
    curricula.set(meta.slug, { ...meta, textIncluded: Boolean(meta.textIncluded), standardCount: entries.length });
    for (const s of entries) {
      standards.set(s.key, { key: s.key, code: s.code, curriculum: meta.slug, data: s.data ?? null });
      for (const code of new Set([s.code, s.data?.standardCode].filter(Boolean).map(normalizeCode))) push(byCode, code, s.key);
    }
  }

  // Authored scoped alignments: where a topic applies, at which ages, through which standards.
  // The flat topic `standards` and age fields are a lossy compatibility projection of these.
  const contexts = new Map(topics.map((t) => [t.id, []]));
  const contextsByStandard = new Map();
  for (const a of alignments) {
    if (!byId.has(a.topicId) || a.scope === 'global') continue;
    contexts.get(a.topicId).push(a);
    for (const key of a.standards) push(contextsByStandard, key, a);
  }

  const index = topics.map((t) => ({
    id: t.id,
    fields: [[tokenize(t.name), 4], [tokenize(`${t.domain ?? ''} ${t.subject}`), 1.5],
      [tokenize(t.description ?? ''), 1], [tokenize((t.evidence ?? []).join(' ')), 0.5]],
  }));
  const docFreq = new Map();
  for (const d of index) for (const tok of new Set(d.fields.flatMap(([toks]) => toks))) docFreq.set(tok, (docFreq.get(tok) ?? 0) + 1);

  return {
    manifest, topics, byId, byName, prerequisites, unlocks, curricula, standards, byCode, contexts, contextsByStandard,
    research: new Map(research.map((r) => [r.topicId, r])), index, docFreq,
    subjects: [...new Set(topics.map((t) => t.subject))].sort(),
    countries: [...new Set(catalogue.map((c) => c.country))].sort(),
    ageRange: [Math.min(...topics.map((t) => t.ageRangeStart)), Math.max(...topics.map((t) => t.ageRangeEnd))],
  };
}

export function normalizeCode(code) {
  return String(code).trim().toUpperCase().replace(/^CCSS\.(MATH\.CONTENT|ELA-LITERACY)\./, '').replace(/\s+/g, '');
}

// Official CCSS codes carry a cluster letter ("3.NF.A.1"); the catalogue stores "3.NF.1".
export function codeVariants(code) {
  const n = normalizeCode(code);
  const m = n.match(/^([^.]+\.[^.]+)\.[A-Z](?:\.(.+))?$/);
  return m ? [n, m[2] ? `${m[1]}.${m[2]}` : `${m[1]}.`] : [n];
}

const STOP = new Set('a an and are as at be by can do does for from how in into is it of on or the their this to what when which who why with'.split(' '));
export function tokenize(text) {
  return String(text).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)).map(stem);
}

// Light suffix stripping so "subtraction", "subtracting" and "subtracts" meet at "subtract".
function stem(w) {
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  for (const suffix of ['ing', 'ion', 'ed']) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 4) return w.slice(0, -suffix.length);
  }
  return w;
}

// A context applies to a country (jurisdiction scope) or, for International sources, to its framework.
export function contextMatches(tx, a, { country, curriculum, age }) {
  if (country && !(a.scope === 'jurisdiction' ? a.country === country
    : country === 'International' && tx.curricula.get(a.framework)?.country === 'International')) return false;
  if (curriculum && !a.standards.some((k) => k.startsWith(`${curriculum}:`))) return false;
  return age == null || (a.ageRangeStart <= age && age <= a.ageRangeEnd);
}

export function searchTopics(tx, query = '', { subject, age, country, curriculum, limit = 10 } = {}) {
  const words = tokenize(query);
  if (query.trim() && !words.length) return [];
  const n = tx.index.length;
  const scored = [];
  for (const d of tx.index) {
    const t = tx.byId.get(d.id);
    if (subject && t.subject !== subject) continue;
    if (country || curriculum) {
      if (!tx.contexts.get(t.id).some((a) => contextMatches(tx, a, { country, curriculum, age }))) continue;
    } else if (age != null && !(t.ageRangeStart <= age && age <= t.ageRangeEnd)) continue;
    if (!words.length) { scored.push([t, t.centrality ?? 0]); continue; }
    let score = 0;
    const matched = new Set();
    for (const w of words) {
      const idf = Math.log(1 + n / (1 + (tx.docFreq.get(w) ?? 0)));
      for (const [toks, weight] of d.fields) {
        const hits = toks.filter((x) => x === w || (w.length > 3 && x.startsWith(w))).length;
        if (hits) { score += weight * idf * (1 + Math.log(hits)); matched.add(w); }
      }
    }
    if (!score) continue;
    if (t.name.toLowerCase() === query.trim().toLowerCase()) score += 100;
    scored.push([t, score * (0.4 + 0.6 * (matched.size / words.length))]); // favour topics matching more of the query
  }
  return scored.sort((a, b) => b[1] - a[1]).slice(0, limit).map(([t]) => t);
}

// { topic } on a unique match, { candidates } when a name is shared, {} when nothing matches.
// Fuzzy matching accepts the best hit only if its name covers most of the words asked for.
export function resolveTopic(tx, ref, { fuzzy = true } = {}) {
  const s = String(ref ?? '').trim();
  if (tx.byId.has(s)) return { topic: tx.byId.get(s) };
  const named = tx.byName.get(s.toLowerCase());
  if (named) return named.length === 1 ? { topic: named[0] } : { candidates: named };
  const want = tokenize(s);
  if (!fuzzy || !want.length) return {};
  const best = searchTopics(tx, s, { limit: 1 })[0];
  if (!best) return {};
  const name = tokenize(best.name);
  if (want.filter((w) => name.some((x) => x.startsWith(w) || w.startsWith(x))).length / want.length < 0.6) return {};
  const same = tx.byName.get(best.name.toLowerCase());
  return same.length === 1 ? { topic: best } : { candidates: same };
}

// Prerequisites of a topic, each listed after the prerequisites it depends on, the topic last.
// Known topics are skipped together with their own prerequisites. With a limit, the steps
// closest to the topic (fewest links away) are kept and `omitted` counts the farther ones.
export function learningPath(tx, targetId, { known = [], hardOnly = false, limit = Infinity } = {}) {
  const follows = (p) => !hardOnly || p.strength === 'hard';
  const skip = new Set();
  const markKnown = (id) => {
    if (skip.has(id)) return;
    skip.add(id);
    for (const p of tx.prerequisites.get(id) ?? []) if (follows(p)) markKnown(p.id);
  };
  known.forEach(markKnown);
  const distance = new Map();
  const queue = skip.has(targetId) ? [] : [targetId];
  distance.set(targetId, 0);
  while (queue.length) {
    const id = queue.shift();
    for (const p of tx.prerequisites.get(id) ?? []) {
      if (follows(p) && !skip.has(p.id) && !distance.has(p.id)) { distance.set(p.id, distance.get(id) + 1); queue.push(p.id); }
    }
  }
  const order = [];
  const seen = new Set();
  const visit = (id) => {
    if (seen.has(id) || skip.has(id)) return;
    seen.add(id);
    for (const p of tx.prerequisites.get(id) ?? []) if (follows(p)) visit(p.id);
    order.push(id);
  };
  visit(targetId);
  if (order.length <= limit) return { ids: order, omitted: 0 };
  const keep = new Set([...order].sort((a, b) => distance.get(a) - distance.get(b)).slice(0, limit));
  return { ids: order.filter((id) => keep.has(id)), omitted: order.length - limit };
}
