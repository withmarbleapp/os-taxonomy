# Player shell design

The player shell follows the Marble variant of the iOS design system in
`tutor-prototype/ios/modules/Design/Sources/Design`:

- `Presentation/Color/PColor.swift`: `PColor.Marble` canvas, surface, text,
  border and brand tokens.
- `Presentation/Font/PFontStyle.swift`: parent-brand Merel Regular/Black
  body, heading and button styles; EB Garamond display titles.
- `Presentation/Components/Auth/PAuthButton.swift`: raised primary and
  secondary pill buttons.
- `Presentation/Spacing/PSpacing.swift` and
  `Presentation/CornerRadius/PCornerRadius.swift`: spacing and rounded surfaces.

The prototype's proprietary Merel and Bureau Brut Round fonts are not distributed.
The open-source player substitutes Inter for interface text and Baloo 2 for the
composer and SEND label, retaining EB Garamond for display titles. All three
are SIL OFL 1.1; see FONT-LICENSES.md and the accompanying license notices.
The shell stylesheet defines the shared palette as CSS custom properties.
Lesson artwork and the walkie-talkie retain their authored styling.

`marble-wordmark.svg` is the unchanged red `Icons/MarbleLogo` vector used by
`MarbleWordmark.swift`. The iOS dashboard uses Apple's system `gearshape.fill`
(not a bundled vector); `settings-gear.svg` is an Electron-compatible filled
gear counterpart, not an extracted SF Symbols asset.

The lesson-card removal button follows `SeedDetailSheet.closeButton` and
`MarbleControls.RaisedSurface` in the iOS ParentDashboard redesign: a 40pt
surface-primary circle, surface-tertiary raised edge, and dark 16pt semibold
`xmark`. The web SVG is a rounded-stroke counterpart of the system symbol,
not an extracted SF Symbols asset.

The nonmodal keyboard composer ports Unity's `Companion/UI/TextChatDocument.uss`
and `TextChatDocument.uxml`: F1EFED grille pill, RoundMedium input and tilted red
PebbleButton with RoundCondensedBlack SEND label. Only the grille texture is copied from `unity/Assets/Modules/UI`; its proprietary
font styling is adapted using Baloo 2. Its web placement is bottom-center;
mobile keyboard positioning uses VisualViewport.
