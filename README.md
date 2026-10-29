# Marble Skill Taxonomy

An open, structured taxonomy of **what children learn** across the primary/elementary years — decomposed into fine-grained "micro-topics", wired into a prerequisite graph, and aligned to national curriculum standards. Produced by [Marble](https://withmarble.com).

> **Version:** `v1` · **Topics:** 1,855 · **Prerequisite edges:** 3,986 · **Subjects:** 9

## Interactive audio lessons and local app

This repository also owns the [Marble player](player/README.md) and the
[audio lesson authoring skill](.agents/skills/marble-voice-builder/SKILL.md).
The taxonomy stays in `data/` and `schema/`; the software has its own dependency
lock and build inside `player/`.

| Location | Responsibility |
|---|---|
| `player/apps/desktop` | Local Electron app and device permissions |
| `player/apps/player` | Shared lesson UI, walkie-talkie, typed replies |
| `player/apps/local-service` | Local APIs, provider calls and session logs |
| `player/packages/lesson-contract`, `lesson-sdk` | Portable lesson format and scene bridge |
| `player/packages/teaching-runtime` | Adaptive tutor orchestration |
| `player/packages/voice`, `providers` | Local speech and inference connections |
| `player/lessons` | Cube volume and Roanoke example packages |
| `.agents/skills/marble-voice-builder` | Research, pedagogy and audio lesson authoring guidance |

```sh
npm run player:install          # install pinned player dependencies (Node 24+)
npm run player:dev              # browser development at localhost:3235
npm run player:start            # native Electron app, with system sandbox support
npm run player:test
npm run player:test:browser
npm run skill:validate
```

Configure voice and a tutor connection using [player setup](player/README.md).
The app is a developer preview; native Linux launch on the current development
machine works after the documented AppArmor setup. Models are installed separately, not stored in Git.
Local speech can be paired with local inference or an experimental CLI provider.
See the README for platform and provider limitations.

The skill references `player/` directly. It never maintains a second runtime.
Its `scripts/create_experience.py` creates a content-only lesson package;
`scripts/create_player.py` exports a standalone source starter when needed.
Settings, credentials, learner logs, recordings, weights, dependencies and builds
are not repository content. For contract changes, update the SDK, affected lesson
examples and authoring guidance together in this repo.

## See it

![The taxonomy as a rotating 3D graph: every dot a micro-topic, colored by subject, wired by prerequisites](media/curriculum-viz.gif)

Every dot is a micro-topic, colored by subject; height is age; each thread is a prerequisite ([full-quality video](media/curriculum-viz.mp4)). Explore it interactively at [withmarble.com/curriculum](https://withmarble.com/curriculum) — tap any concept to trace everything a learner must master before it.


## What this is

Most curriculum data is either a flat list of standards or locked inside a product. This dataset is a **connected graph of learning**:

- **1,855 micro-topics** — a single, teachable idea (e.g. *"Building sentences"*, *"Apparent brightness of stars"*), each with a plain-language description, mastery **evidence** criteria, a type (conceptual / procedural / representational / language / meta), a subject + domain, and an approximate age range.
- **3,986 prerequisite dependencies** — a directed acyclic graph: *"topic X depends on prerequisite Y"*, each edge tagged `hard`/`soft` and carrying a one-line **reason**.
- **Curriculum alignment** — each micro-topic links to the standards it was distilled from (NGSS, Common Core, the UK National Curriculum, and more).
- **Teaching research** — 1,049 records. Coverage is partial; 806 topics have no research in this release.
- **Domain clusters** — 176 parent-friendly one-paragraph summaries per (subject, domain, age band).

### Subjects

| Subject | Topics |
|---|---:|
| Computing | 52 |
| English | 333 |
| Geography | 22 |
| History | 109 |
| Learning to Learn | 18 |
| Life Skills | 46 |
| Mathematics | 581 |
| Personal & Social Development | 118 |
| Science | 576 |

## Files

All data lives in [`data/`](data/) as UTF-8 JSON. See [`schema/`](schema/) for JSON Schemas and [`manifest.json`](data/manifest.json) for counts + SHA-256 checksums.

| File | What it holds |
|---|---|
| [`data/topics.json`](data/topics.json) | The micro-topics (graph **nodes**). |
| [`data/dependencies.json`](data/dependencies.json) | Prerequisite **edges** (`topicId` depends on `prerequisiteId`). |
| [`data/curriculum-standards.json`](data/curriculum-standards.json) | The source curriculum standards, grouped by curriculum. |
| [`data/clusters.json`](data/clusters.json) | Parent-friendly domain summaries. |
| [`data/teaching-research.json`](data/teaching-research.json) | Teaching research joined by `topicId`, with explicit coverage and publication notes (~24 MB). |
| [`data/archived-teaching-research.json`](data/archived-teaching-research.json) | Historical guidance for merged or refocused topics, with original records and current topic associations. |
| [`data/manifest.json`](data/manifest.json) | Counts, per-subject breakdown, per-file checksums. |

The catalogue contains **17 sources / 7,743 expectations**. It includes 620 Australian Curriculum v9 content descriptions and 3,862 Ontario expectations from nine elementary documents. Ontario is exported as codes and official source links only; ingestion of source expectations is separate from authoring topic coverage. Ontario Grades 1–7 Mathematics have received focused taxonomy authoring passes. The [Grade 2 report](reports/ontario-grade2-mathematics-2026-10-23.md) distinguishes reused claims, extracted elementary claims and the concurrency gap; mappings do not certify learner mastery of every linked topic. The [Grade 3 report](reports/ontario-grade3-mathematics-2026-10-23.md) records reuse of 114 existing topics, the congruence extension and prerequisite repairs; no topics were added. The [Grade 4 report](reports/ontario-grade4-mathematics-2026-10-24.md) records reuse of 126 existing topics, two missing skills, two focused extractions and prerequisite repairs. The [Grade 5 report](reports/ontario-grade5-mathematics-2026-10-24.md) records reuse of 145 existing topics, one missing mathematical representation, one financial/civic concept and one focused extraction. The [Grade 6 report](reports/ontario-grade6-mathematics-2026-10-27.md) records reuse of 173 existing topics and five additions: two procedures, one focused extraction and two financial-content claims. The [Grade 7 report](reports/ontario-grade7-mathematics-2026-10-27.md) records reuse of 171 existing topics and two spatial additions; the square-root proposal was withdrawn.

The Australian cleanup reviewed all 314 additions and 14 later edited IDs, consolidated repeated skills and redistributed bundled requirements. All 593 selected expectation codes remain linked. Those links do not certify whole-standard coverage: 572 previous Full claims have not been independently recertified. The 27 PE/movement descriptions remain excluded. Read the [cleanup report](reports/acara-v9-cleanup-2026-10-23.md) and [current area-by-area mapping counts](reports/acara-v9-scope-coverage.md).

See [PROVENANCE.md](PROVENANCE.md) for sources and attribution.

### Adding curricula

Curricula map onto one shared taxonomy. Keep subjects and domains consistent
across countries; a curriculum's learning-area labels do not create separate
subject trees.

- Reuse a topic when it assesses the same concept or operation. Add local
  examples without changing what mastery means.
- Review affected assessment guidance and learner estimates before changing a
  mastery claim. Assess independent procedures separately; topics do not track
  multiple difficulty levels.
- Record whole-expectation, component and prerequisite contributions explicitly.
  A topic–code link alone does not establish Full coverage.
- Reuse existing domains before adding a distinct new domain. Keep names
  consistent and avoid parallel country-specific domain trees.
- Keep each topic focused on a teachable concept or skill. A standard can link
  to several topics; its bundled requirements need not become one topic.
- Add country-specific topics where the knowledge genuinely differs, such as a
  country's history or constitutional arrangements. Use shared topics for common
  concepts and skills, with local examples where useful.

### A topic

```json
{
  "id": "mt_N8CpN1EJrP",
  "type": "CONCEPTUAL",
  "subject": "English",
  "domain": "Grammar & Punctuation",
  "name": "Building sentences",
  "description": "Understand that words combine to make sentences — a sentence expresses a complete thought…",
  "ageRangeStart": 4,
  "ageRangeEnd": 6,
  "centrality": 0.257,
  "evidence": [
    "Distinguish between complete sentences and fragments",
    "Compose a complete sentence with a subject and verb"
  ],
  "assessmentPrompt": "If {{name}} says something like \"The dog\", can they tell you that's not a complete sentence…?",
  "standards": ["ccss-ela:L.K.1f", "uk-nc-2013:Eng.App2.Y1.Sent.1"]
}
```

- `id` — stable identifier (`mt_…`), referenced by dependencies and by neighbours.
- `standards` — keys into `curriculum-standards.json` (`"<curriculum-slug>:<code>"`).
- `assessmentPrompt` — a natural-language check for the idea. Contains a `{{name}}` placeholder (the child's name); substitute or strip before display.

### A dependency

```json
{ "topicId": "mt__00ZSLnB7p", "prerequisiteId": "mt_VBl1T1sFCM", "strength": "hard",
  "reason": "Must understand vibrations make sound before finding volume patterns" }
```

`topicId` **depends on** `prerequisiteId`. Reverse the edge to get "unlocks".

## Teaching research

[`data/teaching-research.json`](data/teaching-research.json) adds **how a topic
might be taught** to the graph of what children learn. It contains **1,049 active topic records**. `coverage.missingTopicIds` and per-subject counts
make the **806 topics without research** explicit; absence is not a judgement
about whether a topic can be taught.

[`archived-teaching-research.json`](data/archived-teaching-research.json) preserves two historical records excluded from active coverage after a topic merge and a change in learning scope. Each entry includes the original topic and research record, its archive reason, and related current topic IDs. The archive also records the assessment prerequisite reference redirected after the merge.

The active `teaching-research.json` file has `schemaVersion: 1` and taxonomy `version: "v1"`. Each `records[]`
entry joins `topics.json` through `topicId` and contains:

| Field | Meaning |
|---|---|
| `pedagogy` | Original teaching summary, practices, representations and misconceptions. |
| `learn` | Portable learning guidance (`schemaVersion: 2`): a summary, activities, educational constraints and review notes. |
| `learn.activities[]` | Learner actions, intended insight, feedback, rationale and supporting source claims. No product artifact types or fit rankings. |
| `assess` | Original diagnostic/task, response levels, error patterns and next teaching moves; nullable in the public interface. |
| `sources` | Claim, named source, optional URL and the original author's verification flag. |
| `confidence` | Original authoring confidence; not an independent quality score. |
| `provenance` | Original authoring model and source record timestamps. The update timestamp also reflects the learning-guidance rewrite. |
| `publicationNotes` | Paths and curriculum codes for text omitted under the codes-only publication policy. |

`sourceClaims` exactly match `sources[].claim` after publication transformations.
A source may support a general principle or curriculum alignment; this does not
mean the proposed activity was tested. Some activities have no directly linked
source claim.

These records were agent-authored. The learning guidance was rewritten for
portability, checked by a separate factual critic, and sampled by a second agent.
Most original pedagogy and assessment were retained and may contain claims that
the updated guidance qualifies; chart-specific alignment repairs after #30 are
recorded in the affected learning-guidance review notes; read the constraints and review notes alongside
them. Sources were **not re-fetched or re-verified** for the initial publication;
later nutrition-guide checks are recorded in the affected review notes. Historical
`verified: true` and `confidence: "high"` are not new evidence ratings. Activities
are research-informed proposals, **not empirically validated interventions**.

Nutrition terminology corrections in [#63](https://github.com/withmarbleapp/os-taxonomy/pull/63)
update the existing Animal Nutrition, Balanced Diet & Food Groups, and Nutrients
in a Healthy Diet guidance, activities and assessment to distinguish nutrients
from food groups. Balanced-plate activities use food groups in a local guide;
the records retain their identities. See the
[review note](reports/acara-v9-design-technologies-authoring-review.md#teaching-guidance-correction-after-pr-review).

Some original research quoted restricted curriculum standards. Matched passages
are replaced with inline curriculum references, including inside citation claims;
all transformed paths are listed in `publicationNotes`. This is a conservative
mechanical omission pass, not comprehensive rights clearance. Consult the linked
upstream sources for their wording and terms. See [PROVENANCE.md](PROVENANCE.md).

After the chart split in [#30](https://github.com/withmarbleapp/os-taxonomy/pull/30),
`mt_bESTSBB0wK` covers pie charts, `mt_H6LlpWgEYS` covers earlier line-graph
problem-solving, and `mt_HlNSurPVDp` has a separate construction-and-interpretation
record. The new record adapts existing graph research; it is not a fresh
literature review, and all reused source-verification flags are false. Its
assessment requires a complete constructed graph. The later grouped-charts
assessment routes graph-choice errors to data presentation and sector-angle
errors to pie charts.

The file is bound to the exact `topics.json` bytes through `topicFileSha256`.
Regenerate the research projection when the canonical topic file changes, even
when topic IDs remain stable.

## Using it

Pure data — no runtime, no dependencies. Load the JSON and go.

```js
import topics from './data/topics.json' with { type: 'json' };
import deps from './data/dependencies.json' with { type: 'json' };

const byId = new Map(topics.topics.map(t => [t.id, t]));
const prereqs = deps.dependencies
  .filter(d => d.topicId === 'mt_N8CpN1EJrP')
  .map(d => byId.get(d.prerequisiteId).name);
```

Join teaching guidance to a topic:

```js
import research from './data/teaching-research.json' with { type: 'json' };

const guidanceByTopic = new Map(research.records.map(r => [r.topicId, r]));
const guidance = guidanceByTopic.get('mt_N8CpN1EJrP'); // undefined: English is not covered yet
const activities = guidance?.learn.activities ?? [];
```

Validate structure, research coverage, evidence links and checksums:

```bash
node scripts/validate.mjs
node --test scripts/teaching-research.test.mjs
```

## Marble Builder

The [`marble-builder` agent skill](.agents/skills/marble-builder/SKILL.md)
helps turn a child's age and a user-confirmed goal into a standalone HTML
learning experience that works offline by default. It uses topic prerequisites
and available teaching research,
develops a targeted research brief when needed, and agrees a concept with you
before building. Experiences use visual interactions, scaffolding, UI-assessed
transfer tasks and optional extensions. Spatial topics use Three.js with direct
scene manipulation and a crafted cel-shaded look with flat colors and black
outlines. Visual simulations must meet a beauty, craft and polish bar as well as
work correctly. The public skill includes Marble-derived UI tokens, tactile
controls refined in Moon Visit and Sky Colour Explorer, and the openly licensed
Baloo 2 font, with one title and one instruction
visible at a time: a small top-left title and a large, prominent instruction or
explanation, plus concise button labels paired with icons. [Water Lab](https://withmarble.com/water-lab) is the visual quality
reference. The agent renders, inspects and iterates
in the browser rather than stopping at the first working HTML file.

The skill includes [five runnable examples with readable source, key-state
screenshots and design notes](.agents/skills/marble-builder/references/examples.md):
Moon Visit, Sky Colour Explorer, Hidden Cubes, Bee Builder and Otter Forest. The notes explain
what to borrow and where each prototype has limits or exceptions.

Optional connected LLM mode requires explicit author approval and a learning goal
whose open-ended reasoning or text production cannot be adequately supported
locally. That mode requires internet and a separate account connection; ChatGPT
plan usage is a preview option for eligible local/open-source integrations.

In Codex, open this repository and invoke `$marble-builder`, for example:

> Use $marble-builder to help my 8-year-old understand why equivalent
> fractions represent the same quantity.

Other agents can follow the linked `SKILL.md` directly. No Marble account or
hosting is required. New reusable teaching research can optionally be proposed
as a separate PR, with no child-specific information included.

## License

This dataset is **multi-licensed** — read this before you use or redistribute it.

| Layer | License |
|---|---|
| **The database** — the collection, structure, IDs, topic↔topic and topic↔standard relationships | [**ODbL 1.0**](LICENSE) — free for research **and** commercial use, **attribution** required, **share-alike** (derivative *databases* must stay open under ODbL). |
| **The textual content Marble authored** — topic `description`/`name`/`evidence`/`assessmentPrompt`, dependency `reason`s, cluster `summary`s, original teaching-research prose | [**CC BY-SA 4.0**](LICENSE-CONTENT) — same spirit: attribution + share-alike. |
| **Marble-authored learning examples** — application source, original artwork, captures and design notes | [**CC BY-SA 4.0**](LICENSE-CONTENT). Bundled Three.js and Baloo 2 retain their separate MIT and OFL licenses and notices. |
| **`curriculum-standards.json`** — extracted from third-party frameworks | **Not** Marble's to relicense. Each source is under **its own upstream license** — see [**PROVENANCE.md**](PROVENANCE.md). |

**Why share-alike + still commercial-friendly:** ODbL distinguishes a *derivative database* (extend/modify the taxonomy → must stay open) from a *produced work* (use it inside a product, model, or app → stays yours). So you can build a commercial product on this without open-sourcing your product; you only owe back improvements to the *taxonomy itself*.

### Attribution

Any use must credit:

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).

Plus the upstream notices in [PROVENANCE.md](PROVENANCE.md) for any curriculum standards you use. See [CITATION.cff](CITATION.cff) for a formal citation.

## What's *not* here

Deliberately excluded from this release: semantic embeddings (derived, recomputable) and any per-child / user data (never published). See [CHANGELOG.md](CHANGELOG.md).
