import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import { after, before, test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { learningPath, loadTaxonomy, resolveDataDir, resolveTopic } from '../lib/data.mjs';
import { NOTICES, credit, instructions, registerAll } from '../lib/tools.mjs';

let tx;
let client;

before(async () => {
  tx = loadTaxonomy();
  const server = new McpServer({ name: 'marble-skill-taxonomy', version: 'test' }, { instructions: instructions(tx) });
  registerAll(server, tx);
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  client = new Client({ name: 'test', version: '0' });
  await client.connect(b);
});
after(() => client?.close());

const call = async (name, args) => {
  const r = await client.callTool({ name, arguments: args });
  return { text: r.content.map((c) => c.text).join('\n'), isError: Boolean(r.isError) };
};

test('six read-only tools and the about resource', async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(),
    ['find_standard', 'get_learning_path', 'get_teaching_research', 'get_topic', 'list_curricula', 'search_topics']);
  assert.ok(tools.every((t) => t.annotations.readOnlyHint));
  const { contents } = await client.readResource({ uri: 'marble://about' });
  assert.ok(contents[0].text.includes(credit(tx)));
});

test('credit and notices are verbatim from README and PROVENANCE', () => {
  const dir = resolveDataDir();
  const readme = fs.readFileSync(`${dir}/README.md`, 'utf8');
  const provenance = fs.readFileSync(`${dir}/PROVENANCE.md`, 'utf8');
  assert.ok(readme.includes(credit(tx)));
  for (const notice of new Set(Object.values(NOTICES))) assert.ok(provenance.includes(notice), notice.slice(0, 50));
});

test('filters come from the data', async () => {
  const props = (await client.listTools()).tools.find((t) => t.name === 'search_topics').inputSchema.properties;
  assert.deepEqual([...props.country.enum].sort(), tx.countries);
  assert.deepEqual([...props.subject.enum].sort(), tx.subjects);
});

test('search ranks the named topic first and matches word forms', async () => {
  assert.match((await call('search_topics', { query: 'water cycle' })).text.split('\n')[0], /The Water Cycle/);
  assert.match((await call('search_topics', { query: 'subtraction regrouping', age: 7 })).text.split('\n')[0], /Adding and subtracting \(age 7\+\)/);
});

test('country and age filter on that country\'s own alignment ages', async () => {
  const r = await call('search_topics', { country: 'CA', age: 7, limit: 50 });
  const ids = [...r.text.matchAll(/`(mt_[^`]+)`/g)].map((m) => m[1]);
  assert.ok(ids.length > 0);
  for (const id of ids) {
    assert.ok(tx.contexts.get(id).some((a) => a.country === 'CA' && a.ageRangeStart <= 7 && 7 <= a.ageRangeEnd), id);
  }
});

test('get_topic shows prerequisites, unlocks and alignments with ages and notices', async () => {
  const r = await call('get_topic', { topic: 'Simple Food Chains' });
  assert.match(r.text, /^# Simple Food Chains/);
  assert.match(r.text, /\*\*Prerequisites\*\*[\s\S]*\*\*Unlocks\*\*/);
  assert.match(r.text, /India[^\n]*ages? \d/);
  assert.doesNotMatch(r.text, /\{\{/);
  const ccssTopic = tx.contextsByStandard.get('ccss-math:3.NF.1')[0].topicId;
  assert.ok((await call('get_topic', { topic: ccssTopic })).text.includes(NOTICES['ccss-math']));
});

test('shared names return the candidates instead of picking one', async () => {
  const shared = [...tx.byName.values()].find((list) => list.length > 1);
  assert.ok(resolveTopic(tx, shared[0].name).candidates.length > 1);
  const r = await call('get_topic', { topic: shared[0].name });
  assert.equal(r.isError, true);
  for (const t of shared) assert.ok(r.text.includes(t.id));
});

test('an unmatched topic is an error, not a guess', async () => {
  assert.deepEqual(resolveTopic(tx, 'zzzz qqqq not a thing'), {});
  assert.equal((await call('get_topic', { topic: 'zzzz qqqq not a thing' })).isError, true);
  assert.doesNotMatch((await call('get_topic', { topic: 'the and of' })).text, /Closest/);
});

test('learning path: prerequisites in order, exact known topics only, reported back', async () => {
  const target = tx.byName.get('long multiplication')[0];
  for (const hardOnly of [false, true]) {
    const path = learningPath(tx, target.id, { hardOnly }).ids;
    const pos = new Map(path.map((id, i) => [id, i]));
    for (const id of path) {
      for (const p of tx.prerequisites.get(id)) if (!hardOnly || p.strength === 'hard') assert.ok(pos.get(p.id) < pos.get(id));
    }
  }
  const { ids } = learningPath(tx, target.id);
  assert.equal(ids.at(-1), target.id);
  const known = tx.byId.get(ids[Math.floor(ids.length / 2)]);
  const r = await call('get_learning_path', { topic: target.id, known: [known.id, 'multiplication'] });
  assert.ok(r.text.includes(`Treated as known: ${known.name}`));
  assert.match(r.text, /Not matched, so not skipped: multiplication/);
  assert.ok(!r.text.includes(`\`${known.id}\` ·`));
});

test('capped paths keep the closest steps: every direct prerequisite survives, order holds', async () => {
  let capped = 0;
  for (const t of tx.topics) {
    const { ids, omitted } = learningPath(tx, t.id, { limit: 60 });
    if (!omitted) continue;
    capped++;
    assert.equal(ids.length, 60);
    assert.equal(ids.at(-1), t.id);
    for (const p of tx.prerequisites.get(t.id)) assert.ok(ids.includes(p.id), `${t.name} lost ${p.id}`);
    const pos = new Map(ids.map((id, i) => [id, i]));
    for (const id of ids) for (const p of tx.prerequisites.get(id)) if (pos.has(p.id)) assert.ok(pos.get(p.id) < pos.get(id));
  }
  assert.ok(capped > 0);
  const big = tx.topics.map((t) => [t, learningPath(tx, t.id).ids.length]).sort((a, b) => b[1] - a[1])[0][0];
  const r = await call('get_learning_path', { topic: big.id });
  assert.match(r.text, /more distant foundations omitted/);
  assert.equal(r.text.match(/^\d+\. /gm).length, 60);
});

test('teaching research keeps constraints, review notes and its caveats, with the NGSS notice when cited', async () => {
  const water = tx.byName.get('the water cycle').find((t) => tx.research.has(t.id));
  const r = await call('get_teaching_research', { topic: water.id });
  for (const s of ['**Activities**', '**Diagnostic**', 'not re-fetched or re-verified', 'not empirically validated']) assert.ok(r.text.includes(s), s);
  const withNgss = [...tx.research.values()].find((x) => JSON.stringify(x).includes('NGSS'));
  assert.ok((await call('get_teaching_research', { topic: withNgss.topicId })).text.includes(NOTICES['ngss-k5']));
});

test('find_standard: codes, CCSS clusters, identifiers, wording search, codes-only stays codes-only', async () => {
  assert.match((await call('find_standard', { code: 'CCSS.MATH.CONTENT.3.NF.A.1' })).text, /### 3\.NF\.1/);
  assert.match((await call('find_standard', { code: '3.NF.A' })).text, /### 3\.NF\.1/);
  assert.ok((await call('find_standard', { code: 'ac9e1la01' })).text.includes(NOTICES['acara-v9']));
  assert.match((await call('find_standard', { code: 'IN-NCERT-LO-2017-MATH-G1-LO01' })).text, /Codes only/);
  assert.ok((await call('find_standard', { code: '1-ESS1-1' })).text.includes(NOTICES['ngss-k5']));
  assert.match((await call('find_standard', { curriculum: 'ccss-math', text: 'unit fractions number line' })).text, /NF/);
  assert.match((await call('find_standard', { curriculum: 'ccss-math', text: 'the and of' })).text, /No matching standard/);
  assert.match((await call('find_standard', { code: 'ccss-math:3.NF.1' })).text, /### 3\.NF\.1/);
  assert.match((await call('search_topics', { query: 'the of' })).text, /No topics found/);
});

test('list_curricula lists every catalogued framework', async () => {
  const r = await call('list_curricula', {});
  for (const slug of tx.curricula.keys()) assert.ok(r.text.includes(`\`${slug}\``), slug);
});

test('HTTP: serves a real MCP client and survives malformed and aborted requests', async (t) => {
  const child = spawn(process.execPath, ['server.mjs', '--http', '0'], { stdio: ['ignore', 'ignore', 'pipe'] });
  t.after(() => child.kill());
  const port = await new Promise((resolve, reject) => {
    child.stderr.on('data', (d) => { const m = d.toString().match(/:(\d+)\/mcp/); if (m) resolve(Number(m[1])); });
    child.on('exit', reject);
  });
  const raw = (payload) => new Promise((resolve) => {
    const s = net.connect(port, '127.0.0.1', () => { s.write(payload); setTimeout(() => { s.destroy(); resolve(); }, 100); });
    s.on('error', resolve);
  });
  await raw('GET http://[::1 HTTP/1.1\r\nHost: x\r\n\r\n');
  await raw('POST /mcp HTTP/1.1\r\nHost: x\r\nContent-Type: application/json\r\nContent-Length: 500\r\n\r\n{"jsonrpc"');
  assert.equal(child.exitCode, null);

  const remote = new Client({ name: 'http-test', version: '0' });
  await remote.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)));
  assert.equal(remote.getServerVersion().name, 'marble-skill-taxonomy');
  const r = await remote.callTool({ name: 'get_learning_path', arguments: { topic: 'Development and spread of zero and positional notation' } });
  assert.match(r.content[0].text, /Place value/);
  await remote.close();
});
