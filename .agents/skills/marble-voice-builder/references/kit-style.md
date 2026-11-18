# The 3D kit and its style

Marble's 3D scenes share one look, supplied by the player. A lesson chooses a
setting, places kit objects, and builds whatever is missing in the same way.
Read this before writing any scene code.

## What the look is

- **Flat colour in three steps.** Light, half shade, shade. No gloss, no
  texture detail beyond a few flat marks.
- **Hairline outlines in the darkest tone of the setting**, never pure black:
  dark teal underwater, deep blue in space.
- **Few, rounded forms with a clear silhouette.** An otter is two stretched
  spheres for a body, three for a head with ears, and small ones for paws.
  If the outline alone does not say what a thing is, add or move a form;
  surface detail will not rescue it.
- **Muted, natural colour.** One or two warm accents carry attention (a fish,
  a jumper); everything else stays quiet.
- **Air.** Fog, a graded backdrop and light shafts place the subject in a
  world. A bare object on an empty ground looks unfinished.
- **One subject, framed.** A small island of content (a rock shelf, a table, a
  clearing) reads better than ground running to the horizon.

## Settings

`createStage(canvas, { setting })` sets the backdrop, air, light and outline
colour together.

| Setting | For | Reference |
|---|---|---|
| `daylight` | Outdoor scenes, weather, plants, people, places | [countryside](visual/kit/countryside.png), [a clearing](visual/kit/meadow.png), [props](visual/kit/catalogue.png) |
| `underwater` | Sea and pond life, habitats | [kelp forest](visual/kit/underwater.png) |
| `space` | Sun, planets, moons, orbits; hard light with one sharp edge and a dark far side | [Sun, Earth and Moon](visual/kit/space.png) |
| `tabletop` | Maths models and bench science | [maths table](visual/kit/tabletop.png) |

These pictures are the kit's fixtures: small scenes built only from the kit.
Compare a new scene against the fixture for its setting.

## What is in the kit

All from `/sdk/props.mjs`; options are documented beside each function in
[the SDK](../../../../player/packages/lesson-sdk).

- **Land:** `countryside` (a whole scene: plaza, fountain, lane, village,
  mountains), or its pieces: `terrain`, `meadow`, `grass`, `flowers`, `tree`
  (oak, fir, birch, willow), `scatter`, `bush`, `rock`, `plaza`, `lane`,
  `fountain`, `house`, `village`, `mountains`.
- **Sky:** `skyClouds` (drawn on the sky), `cloud` (an object in the scene,
  such as a rain cloud).
- **People:** `character('mia' | 'sam' | 'noor' | 'leo')`, the game's child
  avatar ([picture](visual/kit/people.png)). It stands still by default;
  `userData.play('walk')` or `'idle'` (a livelier sway) animates it. It
  loads a moment after it is added; `await character.userData.ready` when
  something must wait for it.
- **Sea:** `shelf`, `kelp`, `seagrass`, `otter`, `fish`, `urchin`, `crab`,
  `seaStar`, `mussel`, `seaDepth`.
- **Space:** `star` (a glowing sun), `earth`, `moon`, `orbit`.
- **Maths:** `table`, `cubes`, `baseTen`, `fractionBar`, `fractionCircle`,
  `numberLine`, `counters`, `balance`, `label`.
- **Teaching marks:** `ray`, `arrow`.
- **Light that glows:** `light()` builds soft-edged beams and sheets of colour
  that add brightness; `spectrum(n)` gives the colours from red to violet,
  balanced so that together they make white.

## The Sun, and other far-off light

The Sun is too far away to be an object in a scene. Never place a Sun among
the things it lights.

- **In a view from above**, the Sun is off the picture. Show where its light
  comes from: cast shadows (set with `stage.setSun(direction)`), `ray`s that
  start beyond the edge of the screen, and an abstract sign near that edge.
  The sign is an element with class `sun-marker`: a white badge whose pointed
  corner aims at the Sun, holding a plain sun symbol. Place it at
  `stage.edgePoint(camera, direction, { inset: 52 })` and set its `--toward`
  from the returned `angle`. It must read as a pointer on the page, never as a
  Sun in the scene, so do not make it glow or shine beams. A `sun-veil` element
  sliding over it is a cloud covering the Sun; a button placed over the sign
  lets the child move the Sun.
- **In a character's own view**, when they face it, draw `sun()`: a small
  bright disc in a soft glow, placed far off in the true direction and hidden
  from every other camera.
- **In space**, the Sun is a body in the scene: use `star()`.

## Close-ups and explanatory views

A close-up that explains a mechanism (light inside a raindrop, the parts of a
flower) is a scene like any other. Build it on the same stage, with the same
character, ground, light marks and Sun sign as the rest of the lesson, so the
child sees one world at a different scale. Do not switch to a separately drawn
flat diagram with its own colours, stick figures and symbols: that is where
lessons have looked worst.

- Keep something from the main scene in view (the character, the ground) to
  say where we are and how much things are magnified.
- Glass and water are a `toon` surface made see-through, which keeps the ink
  rim, with one `flat` highlight.
- Light paths on a dark backdrop are built with `light()`: a bright core in a
  soft glow. For colour splitting, trace many colours from `spectrum()`
  through the model's own optics and lay them on top of each other: they read
  as white where they coincide and come apart into a continuous rainbow where
  the model separates them. Never draw three coloured lines to stand for a
  spectrum. Light arriving from the Sun comes in from off the picture, beside
  the Sun sign.
- Fit the picture into the part of the screen the page leaves free (below the
  instruction, above answer buttons and the walkie), and check it at phone
  width, where the arrangement usually needs to tighten.
- Choose a backdrop the light shows against: `stage.setSky` with darker
  colours, as under a rain cloud.

## Building something the kit lacks

Use the shaping tools in `/sdk/shapes.mjs`, colour with `toon` from `PALETTE`,
and add with `solid`:

| Tool | Makes |
|---|---|
| `blob` | Soft bodies from overlapping stretched spheres: animals, fruit, stones |
| `turned` | Anything round about an axis: cups, columns, wheels |
| `slab` (with `shoreline`) | A flat outline given thickness: islands, tiles |
| `ribbon` | Thin bending strips: leaves, kelp, flags |
| `tube` | Stems, ropes, tails |
| `box` | Blocks with softened edges |

```js
import { THREE, toon, flat, solid, unlined, PALETTE } from '/sdk/stage.mjs';
import { blob } from '/sdk/shapes.mjs';

export default function snail() {
  const g = new THREE.Group();
  solid(blob([[0, 0.14, 0.1, 0.22, 0.14, 0.62], [0, 0.34, 0.62, 0.16, 0.2, 0.17]]), toon(PALETTE.furLight), g);
  solid(blob([[0, 0.55, -0.08, 0.2, 0.42, 0.42]]), toon(PALETTE.wood), g);
  return g;
}
```

- **`solid` + `toon`** for anything in the world: shaded, outlined, casting a
  shadow.
- **`flat` + `unlined`** for light itself and for marks drawn onto the scene:
  rays, glows, eyes, highlights.
- **Merge the forms of one body** (that is what `blob` does), so it is outlined
  as one thing and not as a pile of parts.
- **Colours come from `PALETTE`.** Add one only when the subject needs it, and
  match the muted level of its neighbours.
- **Put each object in its own file** exporting a function that returns a
  group standing on y = 0, like the kit's props.

## Look before you use it

```
npm --prefix player run kit -- look /abs/path/scene/snail.mjs --setting daylight
```

This writes a sheet showing the object from three sides between two kit
objects of that setting. Open the picture and check, in this order: can you
tell what it is from the outline; is it as simple and rounded as its
neighbours; do its colours sit at their level; is its size right beside the
child or the otter. Revise and run it again. Keep the final sheet with the
lesson's other captures.

`npm --prefix player run marble -- validate` also prints style notes when a
lesson brings its own renderer, materials or many colours from outside the
palette. They are advice: act on them or say in the design note why not.

## When an object belongs in the kit

If another lesson would want it (an animal, a plant, a measuring tool), say so
in the report and name the file. Adding it to the kit means adding it to a
fixture too, so the kit is always judged on everything it holds.

## Known limits

Characters have one neutral face and two animations. Nothing has been
measured on a tablet, and the stage draws the scene twice per view, so keep
scenes modest and report anything that feels slow.
