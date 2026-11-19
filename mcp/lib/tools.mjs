// MCP tools and the about resource. All read-only.
import { z } from 'zod';
import { codeVariants, learningPath, resolveTopic, searchTopics, tokenize } from './data.mjs';

const REPO_URL = 'https://github.com/withmarbleapp/os-taxonomy';
const PLACE = { US: 'US', GB: 'England', AU: 'Australia', CA: 'Canada', IN: 'India', International: 'International (IB)' };
const MAX_PATH = 60;

// Required credit (README "Attribution") and upstream notices (PROVENANCE.md), verbatim.
export const credit = (tx) => `Marble Skill Taxonomy (${tx.manifest.taxonomyVersion}) · © Generative Spark, Inc. (Marble) · `
  + 'https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).';
const CCSS = '© Copyright 2010 National Governors Association Center for Best Practices and Council of Chief State School Officers.';
const NGSS = 'NGSS is a registered trademark of WestEd. Neither WestEd nor the lead states and partners that developed the Next '
  + 'Generation Science Standards were involved in the production of this product, and do not endorse it.';
export const NOTICES = {
  'uk-nc-2013': 'Contains public sector information licensed under the Open Government Licence v3.0.',
  'acara-v9': '© Australian Curriculum, Assessment and Reporting Authority (ACARA) 2009 to present, unless otherwise indicated. '
    + 'This material was downloaded from the ACARA website (https://www.australiancurriculum.edu.au/) (accessed 20 October 2026) '
    + 'and was modified only to normalize whitespace and render equation fractions as text. The material is licensed under '
    + 'CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). ACARA does not endorse any product that uses ACARA material '
    + 'or make any representations as to the quality of such products. Any product that uses material published on this '
    + 'website should not be taken to be affiliated with ACARA or have the sponsorship or approval of ACARA. It is up to each '
    + 'person to make their own assessment of the product.',
  'ccss-ela': CCSS,
  'ccss-math': CCSS,
  'ngss-k5': NGSS,
  'ngss-ms': NGSS,
};

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const reply = (body, slugs = []) => {
  const notes = [...new Set([...slugs].map((s) => NOTICES[s]).filter(Boolean))];
  return { content: [{ type: 'text', text: notes.length ? `${body}\n\n---\n${notes.map((n) => `_${n}_`).join('\n\n')}` : body }] };
};
const fail = (text) => ({ content: [{ type: 'text', text }], isError: true });

const span = (a) => (a.ageRangeEnd > a.ageRangeStart ? `ages ${a.ageRangeStart}–${a.ageRangeEnd}` : `age ${a.ageRangeStart}`);
const line = (t) => `- **${t.name}** \`${t.id}\` · ${t.subject}${t.domain ? ` › ${t.domain}` : ''} · ${span(t)}`;
const bullets = (items, n = Infinity, indent = '') => (items ?? []).slice(0, n).map((x) => `${indent}- ${x}`).join('\n');
const more = (total, shown) => (total > shown ? `\n- … ${total - shown} more` : '');
const parentText = (s) => String(s ?? '').replace(/\{\{\s*name\s*\}\}/g, 'your child');
const slugOf = (key) => key.slice(0, key.indexOf(':'));
const where = (tx, a) => (a.scope === 'framework' ? tx.curricula.get(a.framework)?.name ?? a.framework
  : `${PLACE[a.country] ?? a.country}${a.region ? ` (${a.region})` : ''}`);
const stdLabel = (tx, key) => {
  const s = tx.standards.get(key);
  return s?.data?.title ? `${s.code} (${s.data.title})` : s?.code ?? key.slice(key.indexOf(':') + 1);
};

function related(tx, rels, n) {
  if (!rels.length) return '- none';
  return rels.slice(0, n).map((r) => {
    const t = tx.byId.get(r.id);
    return `- **${t.name}** \`${t.id}\` (${r.strength})${r.reason ? `: ${r.reason}` : ''}`;
  }).join('\n') + more(rels.length, n);
}

function alignmentsOf(tx, t, perContext = 4) {
  const slugs = new Set();
  const rows = tx.contexts.get(t.id)
    .map((a) => {
      a.standards.forEach((k) => slugs.add(slugOf(k)));
      const codes = a.standards.length
        ? `${a.standards.slice(0, perContext).map((k) => stdLabel(tx, k)).join('; ')}${a.standards.length > perContext ? ` … ${a.standards.length - perContext} more` : ''}`
        : 'age guidance only';
      return `- ${where(tx, a)}, ${span(a)}: ${codes}`;
    })
    .sort();
  return { text: rows.join('\n') || '- none yet', slugs };
}

// Resolve a topic argument, or explain why not (no match, or a name shared by several topics).
function topicOrReply(tx, ref) {
  const r = resolveTopic(tx, ref);
  if (r.topic) return { topic: r.topic };
  if (r.candidates) {
    return { error: fail(`Several topics are named "${r.candidates[0].name}". Use one id:\n${r.candidates.map(line).join('\n')}`) };
  }
  const near = tokenize(ref).length ? searchTopics(tx, ref, { limit: 5 }) : [];
  return { error: fail(`No topic matches "${ref}".${near.length ? ` Closest:\n${near.map(line).join('\n')}` : ' Try search_topics.'}`) };
}

export function registerAll(server, tx) {
  const [minAge, maxAge] = tx.ageRange;
  const country = z.enum(tx.countries).describe(`Country: ${tx.countries.map((c) => `${c} (${PLACE[c] ?? c})`).join(', ')}`);
  const curriculum = z.enum([...tx.curricula.keys()]).describe('Curriculum slug from list_curricula');

  server.registerTool('search_topics', {
    title: 'Search topics',
    description: `Find topics (skills and concepts a child learns, ages ${minAge}–${maxAge}) by keywords, or browse with filters only. `
      + 'Keywords match topic names and descriptions: prefer curriculum terms ("regrouping", "column subtraction", "phonics") '
      + 'and retry with other wording if results look off. With country or curriculum, age uses that context\'s ages. '
      + 'Returns topic ids for the other tools.',
    inputSchema: {
      query: z.string().optional().describe('Keywords; omit to browse by filters'),
      subject: z.enum(tx.subjects).optional(),
      age: z.number().int().min(minAge).max(maxAge).optional().describe('Only topics taught at this age'),
      country: country.optional().describe('Only topics with an alignment in this country (standards or age guidance)'),
      curriculum: curriculum.optional().describe('Only topics linked to this curriculum'),
      limit: z.number().int().min(1).max(50).optional().describe('Default 10'),
    },
    annotations: { title: 'Search topics', ...READ_ONLY },
  }, async (args) => {
    const hits = searchTopics(tx, args.query, args);
    return reply(hits.length ? hits.map((t) => `${line(t)}\n  ${t.description ?? ''}`).join('\n')
      : 'No topics found. Try other wording, fewer words or fewer filters.');
  });

  server.registerTool('get_topic', {
    title: 'Get topic',
    description: 'One topic in full: description, evidence of mastery, a quick check a parent can ask, prerequisites with reasons, '
      + 'the topics it unlocks, and where it is aligned: country or framework, ages and standards.',
    inputSchema: { topic: z.string().describe('Topic id (e.g. "mt__p5n8z5soJ") or name') },
    annotations: { title: 'Get topic', ...READ_ONLY },
  }, async ({ topic }) => {
    const { topic: t, error } = topicOrReply(tx, topic);
    if (error) return error;
    const aligned = alignmentsOf(tx, t);
    return reply([
      `# ${t.name}`,
      `\`${t.id}\` · ${t.subject}${t.domain ? ` › ${t.domain}` : ''} · ${span(t)} overall`,
      t.description,
      t.evidence?.length && `**Evidence of mastery**\n${bullets(t.evidence)}`,
      t.assessmentPrompt && `**Quick check**: ${parentText(t.assessmentPrompt)}`,
      `**Prerequisites**\n${related(tx, tx.prerequisites.get(t.id), 12)}`,
      `**Unlocks**\n${related(tx, tx.unlocks.get(t.id), 12)}`,
      `**Alignments** (where a standard is addressed, not certified full coverage)\n${aligned.text}`,
      tx.research.has(t.id) && 'Teaching research: get_teaching_research.',
    ].filter(Boolean).join('\n\n'), aligned.slugs);
  });

  server.registerTool('get_learning_path', {
    title: 'Get learning path',
    description: 'The prerequisites of a topic, each listed after the ones it depends on, ending with the topic. '
      + `Long paths keep the ${MAX_PATH} steps closest to the topic. Topics the child already knows (exact ids or names) are skipped `
      + 'together with their own prerequisites; hard_only keeps just the essential links.',
    inputSchema: {
      topic: z.string().describe('Target topic id or name'),
      known: z.array(z.string()).optional().describe('Exact ids or names of topics the child has mastered'),
      hard_only: z.boolean().optional().describe('Follow only hard (essential) prerequisites, not soft (helpful) ones'),
    },
    annotations: { title: 'Get learning path', ...READ_ONLY },
  }, async ({ topic, known = [], hard_only = false }) => {
    const { topic: t, error } = topicOrReply(tx, topic);
    if (error) return error;
    const knownTopics = [];
    const unmatched = [];
    for (const k of known) {
      const r = resolveTopic(tx, k, { fuzzy: false });
      if (r.topic) knownTopics.push(r.topic); else unmatched.push(r.candidates ? `${k} (several topics share this name; use an id)` : k);
    }
    const { ids, omitted } = learningPath(tx, t.id, { known: knownTopics.map((k) => k.id), hardOnly: hard_only, limit: MAX_PATH });
    const notes = [
      knownTopics.length && `Treated as known: ${knownTopics.map((k) => `${k.name} \`${k.id}\``).join(', ')}`,
      unmatched.length && `Not matched, so not skipped: ${unmatched.join('; ')}`,
    ].filter(Boolean).join('\n');
    if (!ids.length) return reply(`"${t.name}" is already covered by the known topics.${notes ? `\n${notes}` : ''}`);
    const steps = ids.map((id, i) => {
      const s = tx.byId.get(id);
      return `${i + 1}. **${s.name}** \`${s.id}\` · ${s.subject} · ${span(s)}`;
    });
    return reply([
      `Path to **${t.name}** (${hard_only ? 'hard' : 'hard and soft'} prerequisites): ${ids.length + omitted - 1} topic(s) first.`,
      notes,
      omitted && `Showing the ${MAX_PATH} steps closest to the topic; ${omitted} more distant foundations omitted. Pass known topics or hard_only to shorten.`,
      steps.join('\n'),
    ].filter(Boolean).join('\n\n'));
  });

  server.registerTool('get_teaching_research', {
    title: 'Get teaching research',
    description: 'Teaching research for one topic: best practices, representations, misconceptions, activities (what the child does '
      + 'and should notice), constraints, review notes and a diagnostic. Agent-authored proposals, not empirically validated.',
    inputSchema: { topic: z.string().describe('Topic id or name') },
    annotations: { title: 'Get teaching research', ...READ_ONLY },
  }, async ({ topic }) => {
    const { topic: t, error } = topicOrReply(tx, topic);
    if (error) return error;
    const r = tx.research.get(t.id);
    if (!r) return reply(`No teaching research for "${t.name}" yet. get_topic has its description and evidence of mastery.`);
    const p = r.pedagogy ?? {};
    const l = r.learn ?? {};
    const a = r.assess;
    const activities = (l.activities ?? []).map((x, i) => [
      `${i + 1}. **${x.title}**`,
      bullets(x.learnerActions, Infinity, '   '),
      x.intendedInsight && `   Intended insight: ${x.intendedInsight}`,
      x.feedback?.length && `   Feedback:\n${bullets(x.feedback, Infinity, '   ')}`,
    ].filter(Boolean).join('\n'));
    const body = [
      `# Teaching ${t.name} (${span(t)})`,
      l.summary,
      p.bestPractices?.length && `**Best practices**\n${bullets(p.bestPractices)}`,
      p.keyRepresentations?.length && `**Representations**\n${bullets(p.keyRepresentations)}`,
      p.commonMisconceptions?.length && `**Common misconceptions**\n${bullets(p.commonMisconceptions)}`,
      activities.length && `**Activities**\n${activities.join('\n')}`,
      l.constraints?.length && `**Constraints**\n${bullets(l.constraints)}`,
      l.reviewNotes?.length && `**Review notes**\n${bullets(l.reviewNotes)}`,
      a && ['**Diagnostic**',
        a.diagnosticPrompt && `Ask: ${parentText(a.diagnosticPrompt)}`,
        a.correctAnswer && `Full answer: ${a.correctAnswer}`,
        ...(a.errorPatterns ?? []).map((e) => `- ${e.revealedBy ?? e.pattern} → ${e.nextMove}`),
      ].filter(Boolean).join('\n'),
      r.sources?.length && `**Sources** (as recorded; not re-fetched or re-verified)\n${bullets(r.sources.map((s) => `${s.source}${s.url ? ` <${s.url}>` : ''}`))}`,
      `_Agent-authored (${r.authorship?.attribution ?? 'unattributed'}), confidence ${r.confidence ?? 'n/a'}; not empirically validated._`,
    ].filter(Boolean).join('\n\n');
    return reply(body, /NGSS|Next Generation Science/.test(body) ? ['ngss-k5'] : []);
  });

  server.registerTool('find_standard', {
    title: 'Find standard',
    description: 'Look up a curriculum standard by code or identifier (e.g. Common Core "3.NF.A.1", Australia "AC9M3N01", NGSS "1-ESS1-1", '
      + 'or the England, Ontario, NCERT and CBSE identifiers in this catalogue) and see which topics address it, at which ages. '
      + 'Or search standard wording, available for curricula whose text is included.',
    inputSchema: {
      code: z.string().optional().describe('Code or identifier, case-insensitive; a prefix lists several'),
      text: z.string().optional().describe('Words from the standard'),
      curriculum: curriculum.optional().describe('Restrict to one curriculum'),
      limit: z.number().int().min(1).max(30).optional().describe('Default 8'),
    },
    annotations: { title: 'Find standard', ...READ_ONLY },
  }, async ({ code, text: words, curriculum: slug, limit = 8 }) => {
    let keys;
    if (code) {
      const variants = codeVariants(code);
      keys = tx.standards.has(code.trim()) ? [code.trim()] : variants.flatMap((v) => tx.byCode.get(v) ?? []);
      if (!keys.length && variants[0].length >= 3) {
        keys = [...tx.byCode].filter(([c]) => variants.some((v) => c.startsWith(v))).flatMap(([, k]) => k);
      }
    } else if (words) {
      const want = tokenize(words);
      keys = [...tx.standards.values()].filter((s) => s.data && (!slug || s.curriculum === slug))
        .map((s) => [s.key, new Set(tokenize(`${s.data.title ?? ''} ${s.data.description ?? ''}`))])
        .map(([k, have]) => [k, want.filter((w) => have.has(w)).length])
        .filter(([, hits]) => hits).sort((x, y) => y[1] - x[1]).map(([k]) => k);
    } else {
      return fail('Give a code, or text to search standard wording.');
    }
    keys = [...new Set(keys)].filter((k) => !slug || slugOf(k) === slug);
    if (!keys.length) return reply('No matching standard. list_curricula shows what is catalogued.');
    const blocks = keys.slice(0, limit).map((k) => {
      const s = tx.standards.get(k);
      const c = tx.curricula.get(s.curriculum);
      const grade = s.data?.gradeLevel ? `grade ${s.data.gradeLevel}` : s.data?.yearLevels ? `Year ${s.data.yearLevels.join(', ')}` : s.data?.keyStage;
      const wording = s.data?.description ?? s.data?.title ?? (c.textIncluded ? '' : `_Codes only; wording at ${c.sourceUrl}_`);
      const ctx = tx.contextsByStandard.get(k) ?? [];
      const topics = ctx.slice(0, 12).map((a) => `${line(tx.byId.get(a.topicId))} (here: ${where(tx, a)}, ${span(a)})`);
      return `### ${s.code} · ${c.name}${grade ? ` · ${grade}` : ''}\n${wording}\n`
        + `Topics:\n${topics.length ? topics.join('\n') + more(ctx.length, 12) : '- none linked yet'}`;
    });
    const rest = keys.length > limit ? `\n\n… ${keys.length - limit} more standards; raise limit or narrow the code.` : '';
    return reply(blocks.join('\n\n') + rest, keys.slice(0, limit).map(slugOf));
  });

  server.registerTool('list_curricula', {
    title: 'List curricula',
    description: 'The curriculum frameworks in the catalogue: country, version, size, whether wording is included, and source link.',
    inputSchema: { country: country.optional() },
    annotations: { title: 'List curricula', ...READ_ONLY },
  }, async ({ country: cc }) => {
    const rows = [...tx.curricula.values()].filter((c) => !cc || c.country === cc)
      .map((c) => `- **${c.name}** \`${c.slug}\` · ${PLACE[c.country] ?? c.country} · ${c.version} · ${c.standardCount} entries`
        + `${c.textIncluded ? '' : ', codes only'} · ${c.sourceUrl}`);
    return reply(`${rows.join('\n')}\n\nA catalogued framework is not a coverage claim. Per-source terms: ${REPO_URL}/blob/main/PROVENANCE.md`);
  });

  server.registerResource('about', 'marble://about', {
    title: 'About the Marble Skill Taxonomy', description: 'Version, counts, licensing and attribution', mimeType: 'text/markdown',
  }, async (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: about(tx) }] }));
}

export function about(tx) {
  const { counts, taxonomyVersion, generatedAt } = tx.manifest;
  return [
    '# Marble Skill Taxonomy',
    `An open, graph-structured taxonomy of primary/elementary learning: ${counts.topics} topics, ${counts.dependencies} `
      + `prerequisite links, ${counts.topicStandardLinks} topic–standard links across ${counts.curricula} curriculum frameworks, `
      + `and teaching research for ${tx.research.size} topics.`,
    `Taxonomy ${taxonomyVersion}, data generated ${generatedAt}. Source: ${REPO_URL}`,
    `Any use must credit: ${credit(tx)}`,
    `Curriculum standards keep their upstream terms; codes-only sources omit wording. See ${REPO_URL}/blob/main/PROVENANCE.md`,
  ].join('\n\n');
}

export function instructions(tx) {
  const { counts, taxonomyVersion } = tx.manifest;
  return `Marble Skill Taxonomy ${taxonomyVersion}: ${counts.topics} topics a child learns from about age ${tx.ageRange[0]} to `
    + `${tx.ageRange[1]}, their prerequisites, alignments to ${counts.curricula} curriculum frameworks `
    + `(${tx.countries.map((c) => PLACE[c] ?? c).join(', ')}), and teaching research. Find topic ids with search_topics, then use `
    + 'get_topic, get_learning_path or get_teaching_research; use find_standard for curriculum codes. Alignments do not certify '
    + 'full coverage, and teaching research is agent-authored and not empirically validated. Keep the notices returned with '
    + `standards. Any use must credit: ${credit(tx)}`;
}
