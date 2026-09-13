# Themes and Motion in AllGames

## Visual Themes

AllGames supports the following active themes:
- `dark` (default theme)
- `light`
- `e-ink-light` (high-contrast monochrome, white background, no shadows, no animations)
- `e-ink-dark` (inverted monochrome, black background)

> [!IMPORTANT]
> **Candy Theme Status**: Candy is a proposed future theme, not present in the current codebase. Do not build supporting infrastructure for it unless separately requested.

### Theme Mechanics
- Document root receives `data-theme="dark|light|e-ink-light|e-ink-dark"`.
- Legacy compatibility: `data-eink="true"` is preserved alongside semantic theme attributes during migration.
- All colors must derive from semantic design tokens (`--bg`, `--surface`, `--surface-2`, `--border`, `--border-2`, `--text`, `--text-muted`, `--text-dim`, `--accent`).

## Motion Profiles

Motion is strictly decoupled from visual theme:
- `none`: Used in E-Ink modes and when `prefers-reduced-motion: reduce` is detected. All Framer Motion animations disabled or instant.
- `normal`: Standard clean transitions (150ms-250ms ease-out) for Light and Dark modes.
- `expressive`: Reserved for future playful themes (e.g. Candy if built in the future).

### Reduced Motion Override
Any `window.matchMedia('(prefers-reduced-motion: reduce)')` MUST force the motion profile to `none`.
Application playability and responsiveness must never depend on an animation completing.
