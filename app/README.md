# Weekend Worksheets

Local web app for generating themed printable PDF worksheets and tracking each child's progress against the Marble Skill Taxonomy.

## Quick start

```bash
# from repo root
npm install
cp app/.env.example app/.env
npm run seed -w weekend-worksheets   # optional; auto-seeds on first API boot
npm run dev
```

- UI: http://127.0.0.1:5173  
- API: http://127.0.0.1:8787  

Demo mode is **on** by default (`DEMO_MODE=true`) — no API keys required.

## Live agents

Set in `app/.env`:

```
DEMO_MODE=false
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

Or toggle Demo mode off in **Settings** (keys still required).

| Agent | Model |
|---|---|
| Worksheet generator | Claude Sonnet |
| Scan assessor | GPT-4o (vision) |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API + Vite client |
| `npm run seed` / `seed:reset` | Load Maya (5) & Leo (7) + sample worksheets |
| `npm test` | Unit + API tests (Vitest) |
| `npm run test:e2e` | Playwright functional tests |
| `npm run build` / `npm start` | Production client build + API serving static files |

## Data

Child profiles, mastery, worksheets, and assessments live in `app/storage/` (SQLite via Node’s built-in `node:sqlite` + PDFs/scans). Taxonomy is read from repo `data/`.
