# Synthetic alignment fixtures

These are invented contract examples, not official expectations, a real curriculum proposal or learner data.

- `topics.json` and `curriculum-standards.json` provide complete miniature public input snapshots. Four invented sources deliberately share code `S1` under different namespaces.
- `input.json` includes two national contexts for one topic, a reusable international source, an intentional age-only context and a topic with no context.
- `normalized.json` is the expected canonical alignment document.
- `projection.json` is the expected partial compatibility preview, not a complete topic file.

See the [contract and commands](../../docs/curriculum-alignment-contract.md). `npm test` verifies these golden outputs, rejects corruptions, and checks optional dataset validation using disposable synthetic snapshots.
