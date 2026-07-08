# Marble Skill Taxonomy

An open, structured taxonomy of **what children learn** across the early childhood and primary/elementary years — decomposed into fine-grained "micro-topics", wired into a prerequisite graph, and aligned to national curriculum standards. Produced by [Marble](https://withmarble.com).

> **Version:** `v1` · **Topics:** 1,617 · **Prerequisite edges:** 3,287 · **Subjects:** 8

## See it

![The taxonomy as a rotating 3D graph: every dot a micro-topic, colored by subject, wired by prerequisites](media/curriculum-viz.gif)

Every dot is a micro-topic, colored by subject; height is age; each thread is a prerequisite ([full-quality video](media/curriculum-viz.mp4)). Explore it interactively at [withmarble.com/curriculum](https://withmarble.com/curriculum) — tap any concept to trace everything a learner must master before it.


## What this is

Most curriculum data is either a flat list of standards or locked inside a product. This dataset is a **connected graph of learning**:

- **1,617 micro-topics** — a single, teachable idea (e.g. *"Building sentences"*, *"Apparent brightness of stars"*), each with a plain-language description, mastery **evidence** criteria, a type (conceptual / procedural / representational / language / meta), a subject + domain, and an approximate age range.
- **3,287 prerequisite dependencies** — a directed acyclic graph: *"topic X depends on prerequisite Y"*, each edge tagged `hard`/`soft` and carrying a one-line **reason**.
- **Curriculum alignment** — each micro-topic links to the standards it was distilled from (Head Start ELOF, NGSS, Common Core, the UK National Curriculum, and more).
- **Domain clusters** — 188 parent-friendly one-paragraph summaries per (subject, domain, age band).

### Subjects

| Subject | Topics |
|---|---:|
| Science | 547 |
| Mathematics | 503 |
| English | 312 |
| History | 90 |
| Personal & Social Development | 88 |
| Life Skills | 37 |
| Computing | 21 |
| Learning to Learn | 19 |

## Files

All data lives in [`data/`](data/) as UTF-8 JSON. See [`schema/`](schema/) for JSON Schemas and [`manifest.json`](data/manifest.json) for counts + SHA-256 checksums.

| File | What it holds |
|---|---|
| [`data/topics.json`](data/topics.json) | The micro-topics (graph **nodes**). |
| [`data/dependencies.json`](data/dependencies.json) | Prerequisite **edges** (`topicId` depends on `prerequisiteId`). |
| [`data/curriculum-standards.json`](data/curriculum-standards.json) | The source curriculum standards, grouped by curriculum. |
| [`data/clusters.json`](data/clusters.json) | Parent-friendly domain summaries. |
| [`data/manifest.json`](data/manifest.json) | Counts, per-subject breakdown, per-file checksums. |

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

Validate structure + referential integrity:

```bash
node scripts/validate.mjs
```

## License

This dataset is **multi-licensed** — read this before you use or redistribute it.

| Layer | License |
|---|---|
| **The database** — the collection, structure, IDs, topic↔topic and topic↔standard relationships | [**ODbL 1.0**](LICENSE) — free for research **and** commercial use, **attribution** required, **share-alike** (derivative *databases* must stay open under ODbL). |
| **The textual content Marble authored** — topic `description`/`name`/`evidence`/`assessmentPrompt`, dependency `reason`s, cluster `summary`s | [**CC BY-SA 4.0**](LICENSE-CONTENT) — same spirit: attribution + share-alike. |
| **`curriculum-standards.json`** — extracted from third-party frameworks | **Not** Marble's to relicense. Each source is under **its own upstream license** — see [**PROVENANCE.md**](PROVENANCE.md). |

**Why share-alike + still commercial-friendly:** ODbL distinguishes a *derivative database* (extend/modify the taxonomy → must stay open) from a *produced work* (use it inside a product, model, or app → stays yours). So you can build a commercial product on this without open-sourcing your product; you only owe back improvements to the *taxonomy itself*.

### Attribution

Any use must credit:

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).

Plus the upstream notices in [PROVENANCE.md](PROVENANCE.md) for any curriculum standards you use. See [CITATION.cff](CITATION.cff) for a formal citation.

## What's *not* here

Deliberately excluded from this release: semantic embeddings (derived, recomputable) and any per-child / user data (never published). See [CHANGELOG.md](CHANGELOG.md).
