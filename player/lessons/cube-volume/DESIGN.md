# Volume in layers — design note

This note travels with the lesson. It contains nothing about any individual child.

The lesson was first built as a standalone prototype ("Hidden Cubes") and
later moved into the shared player. This note was written when the scene was
moved onto the shared 3D kit and the teaching file was rewritten (version
1.1.0), and revised when the lesson was moved onto the shared moment contract
(version 2.0.0). It records the design as it stands; it is not a record of the original
research, which was not kept with the lesson.

## Brief

- **For:** a child of about 9 to 11; English; tablet in landscape first
  (1024×768), also checked at phone width (390×844).
- **Goal:** on a block they have not seen, the child gives the cubes in one
  layer, the number of layers and the cubes altogether, and says how that
  counts every cube once.
- **Not in scope:** the formula length × width × height as a rule, cubic units
  and their notation (cm³), estimating, comparing volume with surface area,
  shapes that are not cuboids.
- **Assumed prerequisites:** counts in equal groups or multiplies small
  numbers; has handled or seen interlocking cubes.
- **Taxonomy:** `mt_d7XktBQPxm` Counting Unit Cubes and `mt_IuHa5UI5od` What
  volume means. The lesson covers the layer-counting part of both. It does not cover cubic-unit notation or the contrast with area, which
  both topics include, so it claims neither whole topic.
- **Likely misconceptions:** counting only the cubes that can be seen; counting
  a corner or edge cube once per visible face. Both are listed in the taxonomy
  research records for these topics, which attribute the layer-structuring
  account to Battista and Clements. Those records are agent-authored and
  untested with children, and the original papers were not read for this note.

## Concept

One block of equal cubes on a table. The child can turn it and pull its
horizontal layers apart, and nothing they do changes how many cubes there are.
Each layer has its own colour, so a layer reads as one thing whether the block
is closed or open.

### Difficulty map

| Relationship | Shown by | Child can | Evidence |
|---|---|---|---|
| One cube is one, however many faces show | `unit_help` colours one cube | say how many cubes the coloured piece is | says it is one cube |
| A layer is one flat level, back rows included | `one_layer`, `layer_example`; `build_layer` | fill a layer cube by cube, then stack it | counts a whole layer without being told |
| Equal layers make the block | `layers`, `repetition-help`; Open layers | add or multiply the layers | joins one layer, the number of layers and the total in their own words |
| A plan on a fresh block | `layer_plan` (small, large, long) | fill three boxes and check | all three right, with no help first |

Leaving out cubes that cannot be seen is a common mistake, not a part of the
map. Counting in layers already prevents it, so the tutor is told not to raise
hidden cubes at all unless the child's own count or words show the mistake.
Three explanations (`inside`, `larger_example`, `no_buried`) exist for that
case only, and it is not a goal or a wrap-up skill.

The map is used in any order. A child who already explains layers can go
straight to a fresh block.

### What help does to evidence

A checked plan is the lesson's one evidence event (`response_committed`). It
carries `assisted: true` when the layers were opened before checking, when a
teaching view was shown on that block, or when the plan was reopened after a
wrong answer. The wrap-up screen marks such work "with help". Building,
turning and opening are never evidence on their own. Stacking a layer or
adding back rows does prompt the tutor to respond, because it changes the
count and anything being said about the old one is out of date.

## Responsibilities

The lesson is written on the shared moment contract (`/sdk/moments.mjs`), like
the Moon and rainbow lessons.

- **Model (`model/cubes.mjs`):** only what is particular to the block: its
  state, its counts, its gestures (turn, open, place, stack, add back rows) and
  the lesson's words. Twelve explanations to show, two things to do (build a
  layer, explore a block) and one question to ask (the layer plan).
- **Shared engine:** the tutor's actions, scoring a checked plan, the retry in
  the same boxes, and the `assisted` flag. The plan is a fill-in question:
  three number boxes answered by typing or by saying all three numbers.
- **Scene (`scene/scene.mjs`):** draws the block on the shared stage (tabletop
  setting, kit cube shape and palette) and reports taps, drags and arrow keys.
  It never scores.
- **Teaching file:** the map above for the tutor. The lesson words its own
  explanations and its question; the tutor words everything in between.

### What changed with the contract (2.0.0)

- The lesson speaks its twelve explanations itself. Before, the tutor chose
  one and spoke its own version of it.
- A plan can be answered by voice, when the child says all three numbers.
- An unanswered plan must be answered or left before another block is given.
  Before, a new block silently replaced it.
- The child can turn the block and open its layers at any time, as before; the
  engine had to learn that some gestures are always available.
- An explanation shown on the block during a plan leaves the boxes open, as
  before; in the Moon and rainbow lessons help takes the work away until it is
  resumed.

## Model limits

- Cubes have no real size, so the lesson gives no centimetres.
- Only horizontal layers open. Slicing the other ways would count the same
  total but is not shown.
- The tutor knows the exact counts, not which cubes the child can see from
  their angle.
- Three labelled boxes hand the child the method. A right plan does not show
  they would choose layers unprompted.
- Blocks go up to 8 cubes long and 80 cubes altogether.

## Validation

- `test/cube.test.mjs`: counts; building; exact scoring;
  help recorded before and after a plan; fresh blocks never repeat a shape;
  wrap-up marks.
- `scripts/cube-browser-check.mjs`: opens the lesson in the real player with a
  stand-in tutor and checks the teaching views, filling by tap, stacking,
  turning by drag and keys, opening by drag, button and key, and a wrong then
  corrected plan, at tablet and phone widths. The screenshots were looked at.
- Not done: a session with a real tutor, any session with a child, a real
  tablet.

## Running

From `player/`: `npm test` runs the model tests;
`OUT=/some/dir node scripts/cube-browser-check.mjs` runs the browser check and
saves screenshots.

## Assets and licences

No assets of its own. three.js and the kit come from the player.
