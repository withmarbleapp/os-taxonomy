# Preserve research citation locators

An earlier prose-redaction pass transformed the same reference URL in two teaching guides into a placeholder. The resulting strings still passed URI-format validation but no longer pointed to the reference.

This correction restores `sources[1].url` for `mt_lp1eTsQen7` and `mt_tiPyEkm4cU` to the original [NGSS structures and processes locator](https://www.nextgenscience.org/dci-arrangement/ms-ls1-from-molecules-to-organisms-structures-and-processes), and removes only the corresponding URL-omission entries. Curriculum claim prose remains omitted where previously required. Teaching and assessment content, source verification flags, confidence and provenance are unchanged. Restoring the locator is not fresh verification of its content or the teaching guidance.

Research validation now rejects a prose-redaction marker in a citation URL, including its percent-encoded form, and rejects an omission declaration targeting that URL field. Existing URI-format and prose checks still apply.

Private export tooling must distinguish the historical prose-URL policy from the corrected citation-locator policy when proving an accepted preimage and a proposed target. This source correction neither publishes to a database nor authorises a private-state change.
