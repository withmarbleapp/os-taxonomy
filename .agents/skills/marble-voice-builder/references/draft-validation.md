# Historical validation notes

The snapshot tests below describe earlier drafts, not the current repo layout.
Current commands and limitations are in [shared-player.md](shared-player.md).

# Draft validation — 2026-10-28

- Skill Creator frontmatter validation passed.
- Portable bundle resource, forbidden-file and hash validation passed.
- create_experience.py generated an isolated workspace under /tmp; it used only
  bundled files. Test dependencies were copied from the existing local install
  into that temporary workspace, not included in the skill. No npm network
  install or model download was performed.
- 102 Node tests passed, including the inherited examples/runtime and two new
  domain-neutral fraction adapter/tutor tests.
- The generated /lesson route passed the browser fixture with a local synthetic
  tutor: actual parts/fields, exact scoring, a follow-up question and desktop/
  narrow overflow checks. Both screenshots were visually inspected.
- The local speech source, requirements, model lock and setup path are included
  from the previously used stack. They were not newly installed, benchmarked or
  tested with child speech from this portable copy. No cloud model calls, live
  authoring evaluation, paid services or child-data transmission were run.
- This validates a draft starter and its contract seams. It does not establish
  live-model pedagogical reliability, cross-platform voice behavior, research
  efficacy or learning outcomes with children.


## Shared-player migration (2026-10-28)

New lessons now target the portable player snapshot in assets/player. Seven
Node tests cover archives, API isolation, corrected work, stale responses and
subprocess handling. Browser fixtures cover wrong→correct cube plans, current
Roanoke source→scene context and an imported third lesson. Real local voice
synthesis/recognition smoke-tested; Linux unpacked application builds. Native
launch is blocked on this host by Linux sandbox configuration. No live Claude/
Codex account inference, child learning, Mac or Windows validation was performed.
The new player is a developer preview; see its README for distribution limits.

## Native startup follow-up

After installing the app-specific Ubuntu AppArmor profile, the native Electron
window loaded and exited successfully with sandboxing enabled. Startup must use
app.whenReady().then(...) rather than top-level await, which stalled ESM loading.
This verifies window startup, not native microphone/lesson operation.
