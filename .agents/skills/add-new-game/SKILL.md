---
name: add-new-game
description: Create and register a new game in AllGames with built-in testing and responsive template setup.
---

# Add New Game Skill

Follow this standardized procedure to scaffold, implement, test, and register a new game in AllGames.

## 1. Interaction Archetype Selection
Classify the new game against the workspace archetypes catalog:
- Archetype 1: Discrete, event-driven state (e.g. TicTacToe, Sudoku, Battleship)
- Archetype 2: Swipe/drag grid game (requires `touch-action: none`)
- Archetype 3: Continuous animation-loop (requires delta-time normalization, batched setState)
- Archetype 4: AI opponent (requires minimax offload, non-blocking delay)
- Archetype 5: Long-press / secondary action (requires cancel-on-move)
- Archetype 6: Cascade / timed animations
- Archetype 7: Tap-to-select board

## 2. Package Scaffolding & Module Graph Separation
1. Create `packages/games/<slug>`:
   - `package.json` (`@allgames/<slug>`, version `0.1.0`, private)
   - `src/metadata.tsx` (isolated `metadata` and lightweight SVG icon — MUST have zero component imports or heavy runtime dependencies)
   - `src/types.ts` (`GameMetadata`, local types, implementing `GameComponentProps`)
   - `src/i18n.ts` (bilingual `en` and `pl` strings)
   - `src/logic.ts` (pure game rules, non-visual)
   - `src/hooks/use<Game>.ts` (state management)
   - `src/<Game>.tsx` (main component)
   - `src/index.tsx` (component entry point exporting `GameComponent`)
2. **CRITICAL Module Graph Rule**: The metadata entry point and the component entry point must be resolvable as genuinely separate module graphs, never re-exported from one barrel file. If a single file or barrel is imported both statically (for metadata) and dynamically (for lazy loading), Vite/Rollup merges the dynamic import into the eager entry chunk, causing the entire game to leak into the initial bundle.
3. **Use Shared UI Components (`@all/ui` and `@allgames/ui`)**:
   - Layout Templates (`@all/ui`): `BoardLayout` (for grid/board/card games: 2048, Sudoku, Chess, Checkers, Battleship, Solitaire, Minesweeper), `FullBleedLayout` (for canvas/action games: Wing Rush).
   - Action Bars & Controls (`@all/ui`): `ControlsBar`, `Button`, `IconButton`, `PillGroup`.
   - Modals & Dialogs (`@all/ui`): `ConfirmDialog` (for reset confirmation and shell leave dialogs), `Dialog` (for rules/help/settings).
   - Status & Headers (`@all/ui`): `StatsHeader`, `ModeSelect`.
   - Overlays & Game HUD (`@allgames/ui`): `GameResultOverlay`, `GameStartOverlay`, `DPad`, icons (`ComputerIcon`, `TwoPlayersIcon`, `SinglePlayerIcon`).
4. **Active Game Session & Shell Contract**:
   - Pass `setHeader` to project scores/stats into the shell navbar (clear on unmount).
   - Pass `setIsActive(isGameActive)` to signal to the shell when an active game session is running, enabling back navigation leave confirmation dialog.
   - Attach a `beforeunload` listener while `isGameActive` is true to prevent accidental tab close or page reload.

## 3. Register in App Shell
In `apps/shell/src/games/registry.ts`:
```ts
// Eagerly import ONLY isolated metadata:
import { metadata as newGameMeta } from '@allgames/<slug>/metadata'

// Lazy-load game component:
{
  metadata: newGameMeta,
  load: lazyGame(() => import('@allgames/<slug>')),
}
```
Add package dependency to `apps/shell/package.json`.

## 4. Built-in Testing & Bundle Verification (Mandatory)
1. **Tooling Check**: Verify Vitest exists (`cmd.exe /c npx vitest run packages/games/<slug>`).
2. **Unit & Integration Tests**: Create `src/__tests__/`:
   - `logic.test.ts` covering initial state, valid moves, win/loss conditions.
   - `<Game>.test.tsx` testing rendering, interactions, `setIsActive(true)` reporting, and confirm modal behaviors.
3. **Visual Baseline**: Verify responsive behavior across mobile portrait (390-412px), landscape, and desktop (1280px), ensuring boards fill the viewport properly without page scrollbars.
4. **Concrete Build Verification**:
   - Run a real production build: `npm run build -w @allgames/shell`
   - Verify that Vite/Rollup outputs **ZERO** warnings of dynamic imports being merged into eager chunks.
