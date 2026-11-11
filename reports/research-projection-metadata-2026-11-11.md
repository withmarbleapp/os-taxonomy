# New-guide publication metadata and wording corrections

The read-only publication roundtrip identified two source issues in the proposed primary-curriculum integration. This change corrects the public source rather than bypassing the exact postimage check.

- Render creation/update timestamps on 41 newly added guides at the publisher's supported millisecond precision. Of the 82 fields, 60 differ only in formatting and 22 lose a fractional remainder below one millisecond. Original authoring values remain in the private audit; this is an explicit metadata correction, not a claim that every timestamp denotes exactly the same instant. No previously accepted guide timestamp changes.
- Replace only the opening sentence of the Canadian francophone-community guide's learning summary with an original description of its three actual cultural cases. Its activities, factual repertoire, assessment, source flags and confidence remain unchanged.

All topic cards, scoped alignments, dependencies, catalogue records, archives and other authored guide fields are preserved. These source corrections make no database or learner-state changes and do not qualify staging publication.

The final full-array check also requires the existing exporter ordering: research records are now ordered by `topicId.localeCompare(other.topicId, 'en')`. Every complete record remains identical by ID; only its array position changes. The original slice append sequences remain in their immutable source commits. Exact accepted-base comparison still runs before target preparation; ordering is not silently ignored during verification.
