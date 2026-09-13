---
name: visual-game-audit
description: Audit an AllGames game screen for responsive viewport usage, theme rendering, and layout defects.
---

# Visual Game Audit Skill

Use this skill to inspect and verify an AllGames screen across all required viewports and theme modes.

## Audit Checklist

### 1. Viewport Utilization
Test the screen under 5 standardized viewports:
- **Mobile Portrait** (390 x 844)
- **Mobile Landscape** (844 x 390)
- **Tablet** (820 x 1180)
- **Desktop** (1280 x 800)
- **Large Desktop** (1920 x 1080)

Verify:
- Does the board occupy a generous, balanced portion of the screen (not clamped to a tiny 360-390px box)?
- In mobile landscape, are controls positioned beside the board instead of causing page scrollbars?
- Does the game avoid vertical page scrolling during active play?
- Are all touch targets at least 44x44px?

### 2. Theme Verification
Cycle through all active themes:
- `dark`: High-contrast dark surfaces, legible muted text.
- `light`: Clean light surfaces, proper contrast ratios (> 4.5:1).
- `e-ink-light`: Pure white background, pure black borders (>= 2px), no drop shadows, no animations.
- `e-ink-dark`: Pure black background, crisp white borders.
*(Candy is a proposed future theme, not present in the current codebase; audit it only if implemented)*

### 3. Motion & Accessibility
- Emulate `prefers-reduced-motion: reduce`: Verify all continuous motion stops immediately.
- Verify focus indicators exist for keyboard navigation.
- Capture comparison screenshots and record any regressions.
