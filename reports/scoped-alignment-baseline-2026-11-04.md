# Scoped alignment baseline

4 November 2026. This public data proposal preserves the former flat release's known associations and adds its previously unpublished age contexts under schema version 2. It also resolves the reviewed initial-baseline decisions below. This is a repository data change; no live database, agent state or learner data is changed, and the future publisher is not active.

## Data and preservation

The base is accepted public commit `fdcc958385af80a263795246449c41cb76da2ae0`. Its 1,861 topics, 4,003 dependencies, 17 sources, 7,743 catalogue expectations and 1,049 authored research records are retained. Topic IDs, claims, evidence, assessments, types, global ages, dependency data, source definitions and research content do not change. The flat topic diff is exactly 14 added standard keys on six existing English topics; all 7,048 known pairs remain, yielding 7,062. These additions are kindergarten–Grade 3 or UK Year 2; this proposal extends no secondary coverage.

`data/curriculum-alignments.json` contains all 3,733 original age contexts: 571 global, 50 framework and 3,112 jurisdiction. Different age bands remain separate records. Age guidance and links on one topic do not create difficulty levels or separate learner mastery states. Context scope, exact ages and every previously resolved reference were compared against the retained authoring graph and DB projection in the private baseline audit; the public file contains only public topic IDs, source keys, scope and age fields.

The public document is a reviewed migration proposal, not a claim that the previous live baseline passed. The 4 November read-only audit verified the independently retrieved full normal-tool memory artifact against its receipt and saved graph, with zero semantic differences across all six public/graph/DB comparison scopes. Its generic backup timestamp advanced during capture, so backup drift remained a blocker, alongside the unapplied reference/age-only decisions. No clean live baseline, deployment or learner-preservation observation is asserted by this PR. Raw captures and environment identities remain private; contributors need none of them to review, validate or edit the public data.

## Reference decisions

Forty-one unresolved reference occurrences could not be included as valid public keys without review. Eleven receive explicit bindings (eight punctuation repairs and three semantic replacements). Thirty remain in private historical metadata with their original contexts; shared active semantics no longer depend on those unidentified or unsupported references in this proposed public representation. The live legacy graph is not modified by publishing this proposal. Three additional links are independently justified, rather than presented as recovered identities.

| Existing topic | Added exact public keys | Decision |
| --- | --- | --- |
| Segmenting words into sounds (`mt_BhYJZUsErp`) | `ccss-ela:RF.K.2.d`, `ccss-ela:RF.1.2.d` | Repair the kindergarten separator. Replace unresolved `RF.1.2e` with the Grade 1 full phoneme-segmentation entry already supported by the existing claim; the replacement does not prove the old key's identity. |
| Listening and responding (`mt_mB7DVai-Uf`) | `ccss-ela:SL.K.1.a`, `ccss-ela:SL.1.1.a`, `ccss-ela:SL.2.1.a`, `ccss-ela:SL.3.1.b` | Four discussion-rule separator repairs. Retain two older role-related literals privately because carrying out assigned discussion roles is absent from the existing claim/evidence/assessment. |
| Group discussions (`mt_wwdRhPyz6s`) | `ccss-ela:SL.K.1.b`, `ccss-ela:SL.1.1.b`, `ccss-ela:SL.2.1.b` | Three repairs for conversational exchange. Retain four rule references privately because those associations belong to Listening and responding; do not double-map them. Retain three preparation references and two assigned-role references privately: the current claim does not assess prior reading/study, use of preparation or assigned roles. |
| Predicting what happens next (`mt_8-POYyg7GJ`) | `uk-nc-2013:Eng/KS1/Y2/C/2e` | Semantic replacement for unresolved `Eng_Y2_RC_09` using the pinned Year 2 prediction entry; retain the original age band. |
| Comparatives & Superlatives (`mt_X1L9DoUwjF`) | `ccss-ela:L.3.1g` | The comparative/superlative adjective/adverb entry matches the existing claim. Treat as a semantic replacement for one untraceable identifier, not recovered identity. |
| Onsets & Rimes (`mt_PvU3eoikev`) | `ccss-ela:RF.K.2.c`, `ccss-ela:RF.K.2.d`, `ccss-ela:RF.K.2.e` | Retain nine unidentified old values privately. Independently associate these three kindergarten entries with the existing onset/rime blending, individual CVC phoneme and phoneme addition/substitution claim, in its US ages 5–7 context. Retain the other US ages 6–7 context as age guidance. This does not reconstruct nine identities. |

Ten remaining unresolved occurrences are on seven existing secondary-science topics: current/voltage (`mt_2bnXrfS4Iq`, two), Ohm's law (`mt_H3ZDK0EYNV`, one), series/parallel (`mt_loEMaQ8kFA`, one), static electricity (`mt_2_YoprauaJ`, one), electromagnets (`mt_2qkn8Lhc8e`, one), motors (`mt__7BVYUN180`, one), and tables/graphs (`mt_YHsUhi4Prc`, three). These literals remain private history, with original ages and all known public links preserved. Secondary repair is outside this primary scope; suffix similarity to a differently defined expectation is not enough to repair a link. No topic is retired or redefined.

These are claim-to-expectation associations, not independent Full-coverage certification, source-quality scores or proof of learner mastery. Whole-expectation conditions matter; missing preparation/role conditions are not solved by adding an apparently matching code or expanding a claim for migration convenience. Source text/rights policy is unchanged, including codes-only Ontario sources.

## Age-only decisions

Explicitly retain the 87 originally empty jurisdiction contexts (64 GB, 22 US, one AU) as age guidance, with no standard-coverage claim. This is a conservative migration policy, not recovered original author intent. Retain another eight contexts emptied by archival: seven GB science contexts and the second US Onsets & Rimes band. There are therefore 95 jurisdiction age-only contexts. The 571 global contexts continue the documented exploratory-age-guidance rule. Every original interval survives; empty contexts are not silently discarded or relabelled as coverage.

## Reproducing artifacts and contributing

Edit the actual public alignment/topic data and open a normal PR. No private plan file, account, database, second semantic approval or running agent is required. From this repository:

```sh
npm run alignments:generate
npm run validate
npm run alignments:generated-check
npm test
```

The generator normalizes alignment records, projects flat topic standards/ages, refreshes the research topic-file binding and the affected manifest checksums/counts. It preserves authored topic fields, research records/coverage and original export timestamps; those timestamps describe the source export, not a new live capture. It performs no network operations. The default script mode checks without writing; only `--write` (the `alignments:generate` command) edits the four local artifact files. Unresolved keys, duplicate contexts and inconsistent supplied research fail before writes. Unrelated data checksums are not regenerated to conceal other changes; run the full validator too.

The 93 public tests pass, including byte-for-byte regeneration, repeated generation, edited association propagation, input immutability, rejection of invalid inputs and CLI check/write boundaries. Dataset validation verifies every alignment against the catalogue and flat projection; the generated-artifact check detects stale bytes. Those mechanical checks do not certify pedagogy or a future downstream writer. The next consumer milestone remains a read-only publication planner and bounded reconciliation against fresh settled evidence before any writer or authority cutover.
