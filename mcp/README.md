# MCP server

Gives AI assistants read-only access to the Marble Skill Taxonomy through the
[Model Context Protocol](https://modelcontextprotocol.io): Claude, ChatGPT,
Cursor, Claude Code, Codex and other MCP clients can search topics, follow
prerequisites, look up curriculum standards and read teaching research without
loading the files themselves.

It serves the `data/` of the commit it runs from and changes nothing. The
taxonomy itself stays dependency-free; this folder is optional.

## Tools

| Tool | Returns |
|---|---|
| `search_topics` | Topics matching keywords, or browsed by subject, age, country or curriculum |
| `get_topic` | Description, evidence, quick check, prerequisites with reasons, what it unlocks, alignments with ages |
| `get_learning_path` | Prerequisites in dependency order, skipping topics the child already knows |
| `get_teaching_research` | Best practices, misconceptions, activities and a diagnostic for one topic |
| `find_standard` | A standard by code or identifier (e.g. `3.NF.A.1`, `AC9M3N01`, `1-ESS1-1`) and the topics that address it, at which ages |
| `list_curricula` | The catalogued frameworks, with source links |

The `marble://about` resource carries the version, counts and required credit.

Alignments come from the authored records in `data/curriculum-alignments.json`,
so each standard is shown with the ages it applies to in its country or
framework, and country and age filters use those ages. Filters are read from the
data, so newly catalogued curricula appear without code changes. Codes-only
sources never return wording, and the notices required by
[PROVENANCE.md](../PROVENANCE.md) are returned with the material they cover.
Alignments do not certify full coverage, and teaching research is
agent-authored, not empirically validated; the tools say so.

## Use

Local, from a checkout:

```sh
npm run mcp:install
claude mcp add marble-skill-taxonomy -- node "$(pwd)/mcp/server.mjs"
```

Other clients launch the same command: `node /path/to/os-taxonomy/mcp/server.mjs`.
`OS_TAXONOMY_DIR` points the server at another checkout.

Hosted, over Streamable HTTP:

```sh
npm --prefix mcp run start:http   # http://localhost:8080/mcp
docker build -f mcp/Dockerfile -t marble-skill-taxonomy-mcp .
```

The HTTP server is stateless, needs no sign-in and listens on `127.0.0.1`
unless `HOST` is set (the container sets `0.0.0.0`). Clients add it by URL, for
example `claude mcp add --transport http marble-skill-taxonomy https://<host>/mcp`,
or as a custom connector in Claude or ChatGPT.

## Test

```sh
npm run mcp:test
```

The tests drive every tool through a real MCP client, in memory and over HTTP,
against the repository data, and check that the credit and notices match the
README and PROVENANCE word for word.

## Licence

Data: see the [repository licence](../README.md#license) and attribution.
Server code: CC BY-SA 4.0, like the repository's other Marble-authored source.
