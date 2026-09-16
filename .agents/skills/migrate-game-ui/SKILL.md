---
name: migrate-game-ui
description: Migrate an existing game to shared UI primitives, responsive layout templates, and theme tokens with attached testing.
---

# Migrate Game UI Skill

Use this skill when migrating an existing AllGames package to use `@all/ui` and standard responsive layout templates.

## Step 1: Pre-Migration Archetype & Bug Audit
1. Open the game's hooks, logic, and styles.
2. Cross-reference with `game-interaction-archetypes`:
   - If swipe game (e.g. Snake, 2048): verify `touch-action: none` on swipe wrapper.
   - If physics/loop (e.g. Wing Rush): check for delta-time normalization and batched state updates.
   - If AI opponent (e.g. Chess, Checkers, Battleship): check if search locks UI thread; ensure non-blocking thinking delays.
   - If long-press (e.g. Minesweeper): ensure cancel-on-move behavior.
3. Fix identified archetype bugs during the migration.

## Step 2: UI Primitives, Overlays & Tokens Migration
1. **Shared Primitives from `@all/ui`**:
   - Replace local buttons (`.game-btn`, custom buttons) with shared `Button` / `IconButton`.
   - Replace local controls containers with `ControlsBar`.
   - Replace local mode selection and status headers with shared `ModeSelect` and `StatsHeader`.
   - Replace custom reset dialogs with shared `ConfirmDialog` and help/rules with `Dialog`.
   - Replace difficulty/mode segmented controls with `PillGroup`.
2. **Game Overlays from `@allgames/ui`**:
   - Integrate `GameResultOverlay` for victory, defeat, or draw states with game statistics and retry action.
   - Use `ComputerIcon`, `TwoPlayersIcon`, `SinglePlayerIcon` for mode select options.
3. **Design Tokens**:
   - Replace hardcoded hex colors and raw variables with semantic tokens (`--all-bg`, `--all-surface`, `--all-surface-2`, `--all-border`, `--all-border-2`, `--all-text`, `--all-text-muted`, `--all-danger`, `--all-accent`, etc.).
   - Wire `isEink` prop to eliminate drop shadows, blur filters, and transitions, using crisp 1-2px solid borders.

## Step 3: Viewport & Responsive Template Integration
1. Remove conflicting wrapper divs (e.g. `.sdk-root`, `.bs-game` with custom `justify-content: space-between`) that fight the template.
2. Wrap game content inside `@all/ui`'s `BoardLayout` (or `FullBleedLayout` for action canvas games).
   - Use `variant="square"` for 1:1 boards (Chess, Checkers, TicTacToe, 2048).
   - Use `variant="fluid"` or `variant="wide"` with `align="center"` for multi-board or flexible grid games (Battleship, Sudoku, Solitaire, Minesweeper).
3. Ensure board scales up on desktop without arbitrary max-width restrictions, and remains properly sized and touchable on mobile portrait (< 420px) without shrinking into tiny stamps.
4. Wire `setIsActive(isGameActive)` to notify the shell of active game progress, enabling the back navigation leave confirmation dialog (`ConfirmDialog`), and attach a `beforeunload` listener while the game is active.

## Step 4: Attached Testing & Gating (Mandatory)
1. **Tooling Check**: Check for Vitest in repository (`npm run test`).
2. **Logic & Integration Unit Tests**: Add or update tests in `src/__tests__/`:
   - State management, moves, victory/loss conditions.
   - `setIsActive(true)` reporting during active sessions.
   - Reset confirmation modal (`ConfirmDialog`).
   - Clean rendering in E-Ink mode (`isEink={true}`).
3. **Visual & Responsive Verification**:
   - Mobile portrait (360-412px width).
   - Mobile landscape (short viewport < 500px).
   - Desktop (1280px+).
   - Themes: Dark, Light, E-Ink Light, E-Ink Dark.
4. **Golden Path Check**: Verify touch and keyboard interactions function properly across viewports without page-level scrollbars.
