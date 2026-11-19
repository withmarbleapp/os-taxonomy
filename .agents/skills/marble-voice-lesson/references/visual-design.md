# Visual design for a voice-led lesson

The child is listening and looking at one thing. The scene's job is to show the
phenomenon truthfully and make clear what can be touched; the tutor's voice
carries the rest. Two levels of finish are recognised: **functional** (accurate,
readable, operable), which every delivered lesson meets, and **polished**, which
is a separate pass described at the end.

## Choose a representation that keeps the relationships

Pick the form that preserves what the child needs to see. When depth, occlusion,
illumination or viewpoint carries the idea, build it in 3D on the player's
shared stage (below), because a flat diagram cannot be looked around. For
equal areas, grouping or fraction parts, a planar model is usually the truer
choice. Accuracy comes first: polish on top of wrong geometry or a misleading
cause teaches the wrong thing more convincingly.

## One scene, little text

- **Opening:** the central question as a large heading over meaningful artwork,
  with a single start button. The player overlays the title and button on a
  cover the lesson draws (see the cover layouts in the package contract).
- **During the lesson:** one small title and one short, prominent instruction.
  Feedback replaces the instruction. The full spoken text appears only when
  captions or text mode is on, alongside the scene's own instruction.
- **Everything else is the phenomenon.** The scene fills the viewport as one
  coherent picture. A sidebar of readouts or a stack of instruction cards turns
  it into a dashboard.
- **New words are explained by the tutor in conversation**, so the scene carries
  no definition pop-ups. Use a technical term only where it helps.
- **Adult matters stay in the menu:** setup, provider details and anything about
  the package itself.

The player already provides the walkie-talkie, menu, typed-reply composer and
captions. The lesson draws none of these and leaves their areas clear.

## Shared 3D stage and props

Marble's 3D look comes from the player: a stage with four settings (daylight,
underwater, space, tabletop), a kit of ready-made objects, and shaping tools
for building anything else in the same style. A package carries no three.js,
renderer or materials of its own.

```js
import { THREE, createStage } from '/sdk/stage.mjs';
import { countryside, character } from '/sdk/props.mjs';

const stage = createStage(canvas, { setting: 'daylight' });
stage.scene.add(countryside(), character('mia', { at: [0, 0, -3] }));
stage.resize(innerWidth, innerHeight);
stage.render(camera); // or stage.render(camera, rect) for an inset view
```

[kit-style.md](kit-style.md) has the style rules, the list of props, how to
build a custom object, and the command that shows a new object beside the kit
so you can see whether it belongs. Read it before writing scene code, and look
at the sheet for every custom object before using it.

## Shared styles

Every lesson loads `/player/scene-base.css`
([source](../../../../player/apps/player/scene-base.css)), which supplies Baloo 2
and the house components. Use its hooks and add only lesson-specific rules in
the package's own stylesheet. Fonts come from `/player/assets/`, so a package
carries no copy of its own.

| Role | Hook in scene-base.css | What it gives |
|---|---|---|
| Small title | `header h1` | 21px / 500 top-left; 17px at ≤800px |
| Current instruction | `#explanation` > `#instruction` | One prominent text slot, `clamp(27px, 2.45vw, 36px)` / 550, with a 4px blue accent rule; moves to the top at ≤800px |
| Light scene | `body.day-sky` | Dark text and a warm-white gradient behind the instruction |
| Button | `.control` | Warm white, 2px dark outline, 4px solid lower edge, 50px minimum height; presses down 3px |
| Primary action | `.control.primary` | Red with burgundy outline and edge |
| Icon-only button | `.control.compact` | 48px square |
| Object in the scene | `.object` with a `span` label | Transparent hit area centred on the object, with an outlined chip; `data-selected="true"` turns the chip yellow |
| Player safe areas | `--marble-controls-right`, `--marble-controls-bottom`, `--marble-menu-right` | Space kept clear for the walkie and menu |

The sheet also sets the purple keyboard-focus outline and switches off
animation under reduced-motion settings.

Composition choices the stylesheet cannot make for you:

- **Sentence case** for titles, instructions and button labels.
- **Place the instruction opposite the main phenomenon.** The default is the
  right-hand side; override it when the composition changes. It stays clear of
  planets, characters and answer targets, and at narrow widths the scene needs
  room below it. Check the longest instruction as well as the first.
- **Prominent actions pair an icon with a label.** Icon-only suits a familiar
  close or reset action, with an accessible name and at least a 44px target.
- **Selection reads without colour alone**, since the yellow fill is the only
  shared cue.
- **A chip names what the child can do with an object** ("Turn Earth"). It is
  part of the same button as the hit area, sized from the object's actual
  projected position. It is a handle on an action, so it does not double as a
  legend, and the object needs no extra icon.
- **Position with `transform`, press with `translate`.** The shared press state
  uses the `translate` property, so a control anchored with `translate` jumps
  out of place when pressed.

The example lessons contain topic-specific choices, such as the cube lesson's
number fields and the Moon's horizon inset. Take them as solutions to those
lessons' problems.

## Check it at the size it will be used

At the target device size and a narrow width, check dense supports, a long but
valid translated instruction, any editable fields and the area around the
walkie-talkie. Assume touch: precise dragging and hover may not be available,
and each essential pointer or sound interaction has a keyboard or text
alternative. Go through normal, hover, pressed, selected, disabled and
keyboard-focus states on the scenes you ship, light and dark.

The [Moon](visual/moon-visit-ui.png) and [sky colour](visual/sky-colour-ui.png)
captures show the intended title, accent rule and chip silhouette. They come
from earlier standalone prototypes, so ignore their progress dots and layout.

## The polish pass

A lesson can be delivered before this pass as long as the report says its
visuals are functional and not yet polished. Name the intended look in the
concept, so the scene is built in a way that can be upgraded.

The look itself is fixed by the shared stage, so this pass is about the scene
built on it: composition, depth and the care taken over the lesson's own
objects. Write down the camera composition, the environment layers and any
colours added to the palette, and make original assets within Marble's
interface roles.

Make one representative scene match that look, then carry it across the others:

- foreground, midground and background depth;
- shaped terrain and vegetation from the kit, with objects resting in their
  own shadows;
- purposeful water and light animation where it belongs.

Flat empty ground, bare cones and boxes standing in for things, colours outside
the palette and debug labels are signs the pass is not finished. Detail serves attention: it should
never obscure the phenomenon or compete with the tutor.

Compare screenshots of the opening, a focused activity and an explanatory
close-up against the written look, with the controls present. Check motion in
the browser too: responsiveness, camera comfort, touch targets, reduced-motion
behaviour and performance on the intended device. Polish leaves geometry, legal
actions and the meaning of every check unchanged, so rerun the model tests and
browser checks afterwards. Report any remaining visual or asset limits as they
are.

## Redistributable assets

A visual reference grants no right to its assets. The player and exported
lessons are open source, so every font and third-party asset needs verified
redistribution terms and its licence notice in the package. The player bundles
OFL-licensed Inter, Baloo 2 and EB Garamond; reuse those. The proprietary Merel
and Bureau Brut Round files from the iOS and Unity prototypes stay out; match
their visual role with an openly licensed font. Check the actual font files and
notices before packaging, since a CSS family name proves nothing about a
licence. Licensed or generated assets are welcome where they improve the scene;
keep their provenance.
