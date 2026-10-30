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

Merel-Regular.otf, Merel-Black.otf and EBGaramond-Regular.otf are copied from
that module's Resources/Fonts directory and bundled for offline use.
The shell stylesheet defines the shared palette as CSS custom properties.
Lesson artwork and the walkie-talkie retain their authored styling.

`marble-wordmark.svg` is the unchanged red `Icons/MarbleLogo` vector used by
`MarbleWordmark.swift`. The iOS dashboard uses Apple's system `gearshape.fill`
(not a bundled vector); `settings-gear.svg` is an Electron-compatible filled
gear counterpart, not an extracted SF Symbols asset.
