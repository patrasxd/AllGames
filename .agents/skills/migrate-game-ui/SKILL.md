---
name: migrate-game-ui
description: Migrate an existing game to shared UI primitives, responsive layout templates, and theme tokens with attached testing.
---

# Migrate Game UI Skill

Use this skill when migrating an existing AllGames package to use `@all/ui` and standard responsive layout templates.

## Step 1: Pre-Migration Archetype & Bug Audit
1. Open the game's hooks and styles.
2. Cross-reference with `game-interaction-archetypes`:
   - If swipe game (e.g. Snake, 2048): verify `touch-action: none` on swipe wrapper.
   - If physics/loop (e.g. Wing Rush): check for delta-time normalization and batched state updates.
   - If AI opponent (e.g. Chess, Checkers): check if search locks UI thread; plan Web Worker offload if deep.
   - If long-press (e.g. Minesweeper): ensure cancel-on-move behavior.
3. Fix identified archetype bugs during the migration.

## Step 2: UI Primitives & Tokens Migration
1. Replace local ad-hoc buttons (`.game-btn`, custom buttons) with shared `Button` / `IconButton`.
2. Replace local mode selection and status headers with shared `ModeSelect` and `StatsHeader`.
3. Replace custom dialogs with shared `Modal` / `ConfirmDialog`.
4. Replace hardcoded hex colors with semantic CSS custom properties (`--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--accent`).
5. Wire `isEink` prop to eliminate drop shadows, blur filters, and transitions.

## Step 3: Viewport & Responsive Template Integration
1. Remove hardcoded clamp formulas (e.g. `width: min(390px, ...)`).
2. Place game content inside the designated responsive template (e.g. `SquareBoardTemplate`).
3. Ensure the board scales up to fill available height/width while preserving aspect ratio.
4. Support mobile landscape: place controls/HUD to the side of the board rather than below.

## Step 4: Attached Testing & Gating (Mandatory)
1. **Tooling Check**: Check for Vitest in repository; install if absent.
2. **Logic Unit Tests**: Add or run unit tests in `src/__tests__/` to ensure rules and state transitions remain intact.
3. **Visual Regression Baselines**: Compare before/after screenshots for active themes:
   - Dark theme
   - Light theme
   - E-Ink Light & E-Ink Dark
   *(Note: Candy is a proposed future theme, not present in the current codebase; test it only if explicitly implemented)*
4. **Golden Path Check**: Verify touch and keyboard interactions function properly across viewports.
5. **Bundle Size Check**: Verify package exports do not pollute shell initial chunk.
