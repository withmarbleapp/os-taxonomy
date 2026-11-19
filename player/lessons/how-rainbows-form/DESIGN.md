# How does a rainbow form? — design note

This note travels with the lesson. It contains nothing about any individual child.

## Brief (phase 1)

- **For:** a child of about 8; English; tablet in landscape first (1024×768), also
  checked at phone width (390×844).
- **Goal:** the child can make a rainbow appear for the explorer (Sun behind her,
  drops in front, looking away from the Sun) and say in their own words why:
  sunlight goes into drops, bends, bounces back and spreads into colours that were
  already in it.
- **Not in scope:** the second bow, why light bends (speed change), wavelength or
  frequency, the colour order as a list to memorise, angle calculation, ray
  drawing, colour of objects and filters.
- **Assumed prerequisites:** recognises the Sun, rain and a cloud; knows light
  can bounce off things (`mt_gLy3ZgZWiN`); accepts that a figure in the scene
  stands for a viewpoint.
- **Taxonomy:** Marble Skill Taxonomy v1 at commit
  `cfb9beba327a3994492652ae847fecba89a42ab7`. The manifest checksums for
  `topics.json`, `dependencies.json` and `teaching-research.json` matched the
  files, and the research `topicFileSha256` matched the topic bytes.
  - `mt_qzGADV-NGe` White Light & Colour (11–12): white light is a mixture; a
    prism separates and does not create colours. The lesson takes only that
    qualitative idea, three years early, and none of the topic's object-colour
    or filter content.
  - `mt_gLy3ZgZWiN` Reflecting Light (7–8): light bounces off surfaces. Used as
    the prerequisite for the bounce inside the drop.
  - Its hard prerequisite `mt_PifbJOuXrG` Reflection & Refraction (11–12) is
    **not** assumed. The lesson says "bends" and shows it; it does not explain it.
  - No topic is about rainbows. This lesson is a narrower, earlier introduction
    and claims alignment with neither whole topic.
- **Likely misconceptions:** the drop or the prism makes the colours (listed in
  the `mt_qzGADV-NGe` research record); white light is "just light" (same
  record). My proposals, not from the record: a rainbow is an object at a place
  you can walk to; rain plus Sun anywhere gives a rainbow; the rainbow is "in"
  the rain cloud.
- **Representation and its limits:** a 3D meadow seen from outside, with a small
  window showing what the explorer (Mia) sees, because viewpoint carries the
  idea. The rainbow is drawn only in that window. One drop is shown as a flat
  2D diagram, because refraction and reflection in a sphere's cross-section are
  planar. See Model limits.

### Sources

| Claim the design relies on | Source | Read on | Status |
|---|---|---|---|
| Sunlight contains a spectrum of colours that look white together | [Met Office, Rainbows](https://weather.metoffice.gov.uk/learn-about/weather/optical-effects/rainbows) | 2026-11-17 | source-backed |
| In a raindrop light bends, some reflects off the inside, and bends again on leaving | same | 2026-11-17 | source-backed |
| The Sun must be behind you and the drops in front | same | 2026-11-17 | source-backed |
| Rainbows are full circles; the ground usually hides the lower half; with a high Sun only a small arc may show | same | 2026-11-17 | source-backed |
| Bow at about 42° (red) and 40.6° (violet) from the point opposite the Sun; red outside | Computed in `model/optics.mjs` from Snell's law with n = 1.331 (red) and 1.343 (violet); the page above gives no angle | 2026-11-17 | derived by the model and tested; standard optics, not read from a cited page |
| Colours separate because each bends by a different amount; the bow is centred on the point opposite the Sun; each observer sees their own | Standard optics, consistent with the model's geometry. The Met Office page does not state these in so many words | — | my statement, not source-checked |
| A prism separates colours and does not create them; children often think it adds them | Taxonomy research record for `mt_qzGADV-NGe` (agent-authored, untested with children) | 2026-11-17 | from the dataset; a proposal, not evidence |
| Predict, then observe, then reconcile | same record | 2026-11-17 | proposal |
| The activities, checks and their order of difficulty | — | — | my proposal |

NOAA SciJinks ("What causes a rainbow?") was tried as a second source and could
not be reached, so it is not cited.

## Concept (phase 2)

- **Opening question and artwork:** "How does a rainbow form?" over the view
  through Mia's eyes: rain ahead, a rainbow across it.
- **Intended look:** a soft low-poly meadow in spring greens under a clear blue
  sky that greys when the Sun is covered; rounded cel-shaded clouds; warm yellow
  Sun; Mia in a red coat as the one saturated figure. The drop close-up is a dark
  blue field so white light and the three colours stand out. The scene is built
  from grouped primitives (`land`, `rain`, `fountain`, `mia`) so a polish pass
  can replace each with crafted terrain, water and a character without touching
  the geometry in `model/`.

### Situation table

Opportunities, not a sequence.

| Relationship | Shown by the tutor | Held fixed | Child does | Visible outcome | Help | Transfer |
|---|---|---|---|---|---|---|
| A rainbow needs sunlight and drops together | `rainbow_scene` | Mia's spot and gaze (Sun behind, rain ahead) | Taps the rain cloud and the Sun's cloud (`sun_and_rain`) | Rainbow in Mia's window only with both | `sunlight_path` on the current setup | `see_rainbow` checks `cloud_over_sun`, `water_off`; fountain cases in `predict` |
| A drop sends light back: bends in, bounces, bends out | `inside_drop` (animated) | One drop, light from the Sun's side | Slides the sunbeam up and down (`aim_sunbeam`) | Colours always leave on the Sun's side, never above about 42° | Replay via `inside_drop` | `drop_exit` check; explains why the Sun must be behind |
| The colours were already in the sunlight | `colours_spread` | Same drop | Same slider; watches white go in and colours come out | Fan of red, green, violet | `colours_spread` again | `drop_colours` check |
| You must look away from the Sun | `sunlight_path` | Spot (Sun behind), Sun, rain | Turns Mia with the arrow (`turn_to_find`) | Rainbow enters her window as she turns from the Sun | `sunlight_path` | `see_rainbow` `facing_sun`; `sun_where` |
| You must stand on the Sun's side of the drops | `sunlight_path` | Gaze (always at the rain), Sun, rain | Walks Mia round the shower (`walk_around`) | A piece of bow, then most of it, as the Sun comes behind her | `sunlight_path` | `see_rainbow` `far_side`, `side_on`; `predict`; `make_rainbow` |
| Deeper: it is a circle round the line Sun–head–shadow, cut by the ground | `why_a_bow` | Good spot | Walks and watches the bow stay with her; answers `reach_rainbow` | The white circle of drops moves with Mia | — | `reach_rainbow` |
| Deeper: red on top | `red_on_top` | Good spot | Says which drop sends which colour | Red arrow from the higher drop, violet from the lower | `inside_drop` | — |
| Deeper: no rainbow under a high Sun | `high_sun` | Good spot | Taps the Sun to lift it (`sun_height`) | Bow sinks, then is gone | — | `see_rainbow` `high_sun` |

### Difficulty map

| Opportunity | Depends on | Support it keeps | Small check | A mistake calls for | Skip or fade when |
|---|---|---|---|---|---|
| Sunlight and drops | — | Good spot fixed; window open | `see_rainbow` `cloud_over_sun` / `water_off` | `sun_and_rain` again, naming what is missing | Child names both unprompted |
| Light comes back from a drop | Light bounces | Whole path drawn | `drop_exit` | `inside_drop`, then `aim_sunbeam` | Child describes in–bounce–out |
| Colours were in the sunlight | Light comes back | Whole path drawn | `drop_colours` | `colours_spread` | Child says the drop splits, not makes |
| Sun behind, drops in front | Light comes back (for the reason); sunlight and drops | Sunlight arrows; one variable free | `sun_where`; `see_rainbow` `far_side`, `side_on`, `facing_sun` | `sunlight_path` on that arrangement, then resume | One unassisted correct prediction with a reason |
| Prediction (`see_rainbow`, situation `fresh`) | All of the above | None: window covered, no arrows | It is the check | Hint (arrows) → assisted retry | — |
| Building at the fountain (`make_rainbow`) | Same, in a new setting | Window open (live feedback) | `goal_reached` with `assisted` | Hint; or `walk_around` first | — |
| Deeper aspects | Sun behind (bow, high Sun); drop and colours (red on top) | Circle and dotted line drawn | `reach_rainbow`; `see_rainbow` `high_sun` | The matching moment | Offered only when the child wants more |

Two dials, kept separate: **demand** rises from one free variable (clouds, gaze
or position) to a fresh arrangement (`see_rainbow` with `fresh`) to a new setting with everything
free (`make_rainbow`). **Support** falls from open window plus arrows, to arrows
with the window covered (checks), to neither (a `fresh` check). More practice at the
same demand is another `fresh` check.

### What an own-words explanation would show

That the child connects three links: sunlight is many colours; a drop bends it,
bounces it back and spreads the colours; so the rainbow is seen with the Sun
behind and the rain in front. At eight a partial chain is normal. A correct
arrangement or Yes/No answer does not show it.

### Example exchange

> **Tutor:** (after `rainbow_scene`) What do you think Mia needs for her rainbow?
> **Child:** Rain. It comes after rain.
> **Tutor:** Let's test that. (`start_activity sun_and_rain`)
> *Child stops the rain, starts it, covers the Sun; the bow vanishes.*
> **Child:** It went away when the cloud came!
> **Tutor:** So what does it need?
> **Child:** Rain and the Sun.

Had the child answered "the Sun shines through the rain and you have to have it
behind you", the tutor would instead go straight to a `fresh` check.

### Fresh problems, practice and deeper aspects

- `see_rainbow` with `fresh`: 42 distinct arrangements (rain or fountain; Sun on either side or
  behind-left/right; six situations). Only 7 of them show a rainbow, so each
  new prediction is chosen as a yes or a no with equal chance until the yes
  cases run out.
  Prerequisite: sunlight-and-drops and Sun-behind look secure.
- `make_rainbow`: fountain, Sun on the right, fountain off, Mia on the wrong
  side facing away. Prerequisite: as above.
- Deeper: `why_a_bow` + `reach_rainbow`, `red_on_top`, `high_sun` + `sun_height`,
  each with the prerequisite in the difficulty map.

**Concept confirmed by:** the requester, 2026-11-17 ("Full concept", tablet first).

## Responsibilities (phases 3 and 4)

Since version 2.0.0 the model is a specification on the player's shared
moment engine (`/sdk/moments.mjs`). `model/rainbow.mjs` holds only what is
particular to this lesson: the arrangements, the optics' verdict on them, the
child's gestures and the words, as three lists (`show`, `do`, `ask`). The
tutor's actions, answering by voice or touch, help that returns to the same
work, retries and the evidence events are the engine's, and the answer
buttons, hint and "try it" are the player's standard controls
(`/sdk/moments-ui.mjs`).

- **Tutor tools** (all lesson-worded; `teaching[]` is empty):
  - `show_moment` → authored speech, `continueAfterSpeech`. `rainbow_scene`,
    `why_a_bow`, `red_on_top`, `high_sun` stage a whole scene and are refused
    while a question is unanswered. `sunlight_path` draws the light on the
    *current* outdoor arrangement and its speech depends on the model's status.
    `inside_drop` and `colours_spread` open the close-up and leave the outdoor
    arrangement and any current work untouched.
  - `start_activity` → authored instruction, then waits. Investigations:
    `sun_and_rain`, `turn_to_find`, `walk_around`, `aim_sunbeam`, `sun_height`.
    Transfer: `make_rainbow`.
  - `start_check` → the exact question, then waits. `see_rainbow` with the
    situation `fresh` is the prediction on a new arrangement.
  - `answer_check`, `leave_activity`, `resume_activity`.
- **Checks:** each entry of `ask` in `model/rainbow.mjs` is the single source for the
  speech, the on-screen question and the two button labels. `see_rainbow` is
  scored from the geometry; the other four have a fixed answer. A spoken answer
  goes through `answer_check` with the scene id, the choice index and the
  child's words; it is scored by the same function as a button and recorded as
  `modality: voice`. A stale scene id is rejected.
- **State the tutor relies on:** `attempts[]` (never rewritten; the last one
  for the scene is current), `results[]` (first rainbow per scene in a finding
  activity), each with `assisted`; `revealed`, `mode` (a paused question reports
  `paused_for_help`); `windowCovered`; `rays`; `rainbowStatus`.
  `assisted` is set by a hint, by any help moment during unanswered work, and
  by every retry after the answer was shown.
- **Screen versus viewpoint:** the meadow shows the Sun, cloud, water and Mia
  from outside; the rainbow exists only in "What Mia sees". The tutor view
  reports `screen.view` and `screen.mia` separately, and reports the window as covered
  while a prediction is pending.

## Model limits

- Sizes and distances are illustrative. The Sun is drawn close and large; its
  light is treated as parallel.
- The Sun has three heights (20°, 35°, 55°). The bow is the set of directions
  42° from the point opposite the Sun, sampled every 4°; arcs shorter than 12°
  are ignored. Mia sees a sample when it is above the horizon, her sight line
  passes through the water volume (a cylinder), the Sun is uncovered, and it is
  within her 100° view.
- The Sun's cloud blocks all sunlight or none. The rain cloud casts no shadow.
  Hills and trees do not block anything.
- The bow in Mia's window is drawn more than twice its true width, and the colour
  fan leaving the drop five times wider than it is, so the colours can be told
  apart. Inside the drop the paths are exact for n = 1.331, 1.335 and 1.343.
- Seven display bands stand in for a continuous spectrum.
- In `red_on_top` the two marked drops are 3.6° apart, wider than the real
  spread of about 1.8°.
- Not computed: the secondary bow, brightness, drop size, supernumerary bows,
  fog bows, moonbows, polarisation, and light reflected more than once.
- A child or parent should not conclude that a rainbow has a location, that its
  band is as wide as drawn, or that the Sun must be at exactly these heights.

## Validation (phase 5)

| Check | What was run | Result |
|---|---|---|
| Model and scoring tests | `node --test test/*.test.mjs` (23 tests): drop optics against the 42.4°/40.6° angles; bow geometry; each status; each moment's speech and view; each activity's single free variable; every check for both answers, scored from one question object; voice and button parity with provenance; stale revision and stale question; help pausing and resuming with history intact; correction keeping the first attempt; leaving without an answer; 12 non-repeating predictions; hint recorded as assistance; idempotent command ids; `experience.json` equals the descriptor | 22 pass |
| Package | `marble validate` | Valid |
| Shared player tests | `npm --prefix player test` (the player was not changed) | 64 pass |
| Browser checks | `player/scripts/rainbow-browser-check.mjs`: the lesson opened in the real player in headless Chrome at 1024×768 and 390×844 (opening also at 1440×900). Cover; every moment; every activity started and its controls asserted present, inside the viewport and at least 44px; real mouse taps on both clouds and the Sun; mouse drags on Mia, her arrow and the sunbeam; arrow keys finishing the turn; a wrong answer, "Try again" and a corrected answer; help in the close-up and return to the same spot; hint on a prediction; no page errors. 78 screenshots, inspected by the author | Pass |
| Desk check of the teaching material | Read `teaching.json`, the action descriptions and all authored speech against the nine learner types in the skill's validation table | Each has a move; see gaps below |

- **Visuals:** functional, not polished. Geometry and causality are exact within
  the limits above; terrain, trees, clouds, fountain and Mia are plain
  primitives, and there are no contact shadows or water materials.
- **Gaps found in the desk check, and what was done:**
  - A hint on a pending prediction replaced the question on screen. The question
    now stays; only free building shows a hint line.
  - The coloured arrows in `sunlight_path` all came from the top of the bow and
    overlapped. They now come from the two ends and the top.
  - Inside the drop the three colours overlap, so the beam looked violet before
    it had separated. The inside path is now white with a thin line per colour.
  - The high-Sun line in `sunlight_path` was vague; it now says the colours hit
    the ground before they reach Mia.
- **Not evaluated:** the tutor's live teaching with this lesson, voice
  behaviour (including recognition of children's speech), and children's
  learning. The browser check uses a fixture tutor that says one line.
- **Open issues:**
  - At phone width in `make_rainbow` the five object chips can overlap one
    another around the small fountain. All five remain tappable.
  - When a chip sits above Mia it covers her head.
  - Dragging emits one update per step, as in the Moon lesson; a tutor command
    issued mid-drag is rejected as stale and must be retried by the runtime.
  - The reduced-motion path (static water, no travelling light) was written but
    not exercised in the browser check.
  - Authored speech has been read for length and vocabulary but not heard
    through the speech engine.

## Running

The lesson ships with the player. From the os-taxonomy checkout run
`npm run player:dev` and open it from the library. From the `player` folder,
`node --import ./test/support/player-paths.mjs scripts/write-experience.mjs lessons/how-rainbows-form model/rainbow.mjs`
regenerates `experience.json`, and `node lessons/how-rainbows-form/tools/write-teaching.mjs`
regenerates `teaching.json`, after edits. From the same folder,
`npm test` runs its model tests (`test/rainbow.test.mjs`) and
`OUT=/some/dir node scripts/rainbow-browser-check.mjs` repeats the browser check.

## Assets and licences

- three.js r180 and the shared 3D stage are loaded from the player
  (`/sdk/stage.mjs`, MIT licence in `/sdk/three/r180/LICENSE.txt`); the package
  holds no copy.
- Baloo 2 is loaded from the player (`/player/assets/`, OFL); the package holds
  no font files.
- All scene art is generated in code for this lesson. No third-party images,
  models or textures.
