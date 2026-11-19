#!/usr/bin/env node
// Marble Skill Taxonomy MCP server.
//   node server.mjs                local, over stdio
//   node server.mjs --http [port]  Streamable HTTP at /mcp, stateless (HOST defaults to 127.0.0.1)
import fs from 'node:fs';
import http from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { loadTaxonomy } from './lib/data.mjs';
import { about, instructions, registerAll } from './lib/tools.mjs';

const { version } = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const tx = loadTaxonomy();

function createServer() {
  const server = new McpServer(
    { name: 'marble-skill-taxonomy', title: 'Marble Skill Taxonomy', version, websiteUrl: 'https://withmarble.com' },
    { instructions: instructions(tx) },
  );
  registerAll(server, tx);
  return server;
}

const flag = process.argv.indexOf('--http');
if (flag === -1) {
  await createServer().connect(new StdioServerTransport());
} else {
  const port = Number(process.argv[flag + 1] ?? process.env.PORT ?? 8080);
  const host = process.env.HOST ?? '127.0.0.1';
  const rpcError = (res, status, code, message, headers = {}) => res.writeHead(status, { 'Content-Type': 'application/json', ...headers })
    .end(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id: null }));

  async function handle(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Mcp-Protocol-Version');
    const path = new URL(req.url ?? '/', 'http://localhost').pathname;
    if (req.method === 'OPTIONS') return res.writeHead(204).end();
    if (path === '/') return res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' }).end(`${about(tx)}\n\nMCP endpoint: /mcp\n`);
    if (path !== '/mcp') return res.writeHead(404).end();
    // Stateless: no sessions, so no GET stream or DELETE.
    if (req.method !== 'POST') return rpcError(res, 405, -32000, 'Method not allowed', { Allow: 'POST, OPTIONS' });

    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 1e6) return rpcError(res, 413, -32600, 'Request too large');
    }
    let message;
    try { message = JSON.parse(body); } catch { return rpcError(res, 400, -32700, 'Parse error'); }

    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => { transport.close(); server.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res, message);
  }

  const httpServer = http.createServer((req, res) => {
    req.on('error', () => res.destroy());
    handle(req, res).catch((err) => {
      if (!req.destroyed && !res.destroyed) console.error(err); // aborted requests are routine, not errors
      if (!res.headersSent) rpcError(res, 500, -32603, 'Internal error'); else res.destroy();
    });
  });
  httpServer.listen(port, host, () => console.error(`Marble Skill Taxonomy MCP server: http://${host}:${httpServer.address().port}/mcp`));
}
