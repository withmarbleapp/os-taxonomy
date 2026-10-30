# Marble component styling

This is the Marble house-style baseline illustrated by **Moon Visit** and
**Sky Colour Explorer** (`moon-visit.html` and `sky-colour-explorer.html`). Use the reusable
[marble-ui.css](../assets/marble-ui.css) rather than rebuilding similar controls.
Inspect the [Moon UI capture](visual/moon-visit-ui.png) and
[Sky UI capture](visual/sky-colour-ui.png) when image inspection is available.
These references govern typography and component styling; the skill's separate
cel-shaded 3D, instructional and assessment requirements still apply. The skill
does not require access to the private prototype checkout.

## Opening-screen exception

Before the lesson, use a richly illustrated title screen with the central
question as its large primary heading. Baloo 2 at 550, sentence case and a
comfortable line height gives the question prominence; the approved Bee cover
uses roughly 52–84px on desktop and 39–60px on phones. These are reference
measurements, not a requirement to shrink long questions into unreadable type.
Recompose the artwork and question for the viewport. Keep one icon-plus-label
start button in the established red style. No subtitle or explanation block is
needed. The small-title roles below govern the lesson after entry.

## Shared roles

All text uses the bundled Baloo 2. Keep sentence case for titles, explanations
and button labels. These house-style roles replace the earlier heavy/all-caps
title and white-rimmed red-button defaults.

| Role | Desktop baseline | Narrow baseline (≤800px) |
|---|---|---|
| Title | 21px / 500, line height 1.2, −0.3px tracking | 17px / 500 |
| Header position | Top 24px, left 32px | Top/left 20px |
| Explanation | `clamp(27px, 2.45vw, 36px)` / 550, line height 1.2, −0.5px tracking | `clamp(22px, 5.9vw, 28px)`, line height 1.17, −0.3px tracking |
| Button / label | 18px / 500, 23px stroke icon, 9px gap | 16px label, 6px gap |
| Button silhouette | Minimum height 50px, radius 22px, padding 10px 18px | Radius 18px, padding 10px 13px |
| Object label chip | 16px / 500, padding 6px 10px, radius 18px | 14px, padding 5px 7px |

On short desktop layouts (height ≤570px), use a 17px title at top 12px and a
23px explanation. Test at the intended device size; accommodate safe areas and
avoid collisions rather than copying every prototype's object coordinates.

## Explanation beside the scene

Use `.ml-header` / `.ml-title` for the small top-left title. Place the single
prominent text slot inside `.ml-explanation` / `.ml-instruction`:

- Desktop: top 24%, left or right 40px; width `min(28vw, 390px)`, padding
  18px 20px and a 4px `#8BC8FA` left accent rule. Choose the side opposite the
  main phenomenon and update it when the composition changes.
- Use `.ml-explanation--right` to anchor on the right. Light scenes use a
  restrained warm-white gradient; dark scenes use a dark gradient and subtle
  text shadow. Set `data-ml-theme="dark"` on the scoped wrapper for the dark
  treatment. Preserve contrast without turning the text into a large opaque card.
- At ≤800px, the panel moves to top 105px, left 20px, width `calc(100% - 40px)`
  with a 3px accent and 14px left padding. The gradient disappears. Reserve scene
  space below the text and check changing explanation lengths.

These are placement defaults for a composed scene, not permission to overlap a
planet, character or answer target. Maintain one title and one current explanation
or instruction; feedback replaces the current text. Keep brief action labels
inside their buttons. Do not copy additional prototype-specific headings or
feedback overlays into the generic skill flow.

## Outlined, tactile buttons

Default `.ml-control` is warm white `#FDFCFA` with a **2px `#242722` outline**
and a **4px solid lower edge** in the same dark color. Use a 500-weight label and
an icon together inside the button. SVG icons are 23px, stroke width 2, rounded
caps/joins, and do not shrink. Use `.ml-button-label` for explicit label styling.

Use `.ml-control--primary` for a primary action: red `#F42324`, white content,
burgundy `#8B0023` outline and lower edge. Secondary buttons remain white.

- Hover: subtle lift and warm-white fill; primary red darkens to `#D61922`.
- Press: move down 3px and reduce the lower edge to 1px.
- Selected (`aria-pressed="true"`): yellow `#FFDA72`, dark content and outline,
  white inset ring. Selection must remain clear without relying on color alone.
- Disabled: opacity .45, default cursor and no hover/press movement.
- Keyboard focus: 4px purple `#774DC7` outline, offset 5px.

Reserve the CSS `translate` property for press/lift. Anchor positioned controls
with `transform`, never with `translate`, so hover and press cannot overwrite
their placement. Use `class="ml-control ml-chip"` for an in-scene chip anchored
above its projected `left`/`top` point: `.ml-chip` supplies `position: absolute`
and `transform: translate(-50%, -100%)`. Keep these physical states consistent when
controls move with the scene. Reduced-motion settings disable decorative motion.

A compact action bar or familiar close/reset action can use
`.ml-control--icon-only` and, when appropriate, `.ml-control--quiet`; retain an
accessible name and at least a 44px target. This is an exception to icon+label,
not the default for prominent learning actions.

## Labels on interactive objects

`.ml-object-control` is a transparent semantic hit area positioned over the 3D
object; its `.ml-button-label` is a warm-white chip, 2px dark outline and 3px lower
edge. Keep the label inside the same button. The world object supplies the visual
context; do not add a second arbitrary icon to a scene object. Position and size
the hit area from the actual projected object and preserve practical touch targets.
Chips identify a manipulation/action rather than becoming explanatory legends.

## Example composition

```html
<div class="marble-learning" data-ml-theme="dark">
  <main class="ml-stage">
    <!-- Application supplies the interactive scene and placement. -->
    <header class="ml-header"><h1 class="ml-title">A daytime visit</h1></header>
    <aside class="ml-explanation ml-explanation--right">
      <p class="ml-instruction" role="status" aria-live="polite">Find a sky with both.</p>
    </aside>
    <button class="ml-control ml-control--primary" type="button">
      <!-- Add a meaningful, aria-hidden inline SVG icon. -->
      <span class="ml-button-label">Try it</span>
    </button>
  </main>
</div>
```

Embed the CSS and font bytes for delivery. The classes provide styling, not scene
logic, object picking, assessment or automatic placement. Browser-check normal,
hover, press, selection, disabled and keyboard states on light/dark scenes and
intended/narrow viewports. Compare the title, accent rule and button silhouette
with the reference captures, not just whether the page runs.

## Inline word meanings

In non-interactive text, technical terms keep the surrounding Baloo 2 size, weight, line height and color,
with a visible dashed underline and a little underline offset. The underline is
the affordance; do not turn each word into a pill or add icons inside prose.
Use a readable warm-white, dark-outlined popover with the established restrained
control depth and one compact, accessible close action. Keep explanations short
and within the viewport at phone widths. Focus remains visible; both desktop
hover and touch activation must work. This temporary word-help region is the
approved text-budget exception, including on the otherwise minimal cover.
Buttons and other action controls and their labels never carry vocabulary
underlines or definition triggers; explain their terms in surrounding lesson text.
