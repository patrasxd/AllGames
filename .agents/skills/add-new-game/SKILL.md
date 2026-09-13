---
name: add-new-game
description: Create and register a new game in AllGames with built-in testing and responsive template setup.
---

# Add New Game Skill

Follow this standardized procedure to scaffold, implement, test, and register a new game in AllGames.

## 1. Interaction Archetype Selection
Classify the new game against the workspace archetypes catalog:
- Archetype 1: Discrete, event-driven state (e.g. TicTacToe, Sudoku)
- Archetype 2: Swipe/drag grid game (requires `touch-action: none`)
- Archetype 3: Continuous animation-loop (requires delta-time normalization, batched setState)
- Archetype 4: AI opponent (requires minimax offload or time-slicing)
- Archetype 5: Long-press / secondary action
- Archetype 6: Cascade / timed animations
- Archetype 7: Tap-to-select board

## 2. Package Scaffolding & Module Graph Separation
1. Create `packages/games/<slug>`:
   - `package.json` (`@allgames/<slug>`, version `0.1.0`, private)
   - `src/metadata.ts` (isolated `metadata` and lightweight SVG icon — MUST have zero component imports or heavy runtime dependencies)
   - `src/types.ts` (`GameMetadata`, local types)
   - `src/i18n.ts` (bilingual `en` and `pl` strings)
   - `src/logic.ts` (pure game rules, non-visual)
   - `src/hooks/use<Game>.ts` (state management)
   - `src/<Game>.tsx` (main component)
   - `src/index.tsx` (component entry point exporting `GameComponent`)
2. **CRITICAL Module Graph Rule**: The metadata entry point and the component entry point must be resolvable as genuinely separate module graphs, never re-exported from one barrel file. If a single file or barrel is imported both statically (for metadata) and dynamically (for lazy loading), Vite/Rollup merges the dynamic import into the eager entry chunk, causing the entire game to leak into the initial bundle.
3. Use shared UI primitives (`@all/ui` or `@allgames/ui`) rather than custom buttons or modals.
4. Wrap game in an appropriate responsive template (e.g. SquareBoardTemplate).

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
1. **Tooling Check**: Verify Vitest and Playwright exist; set up minimal runners if absent.
2. **Unit Tests**: Create `src/__tests__/logic.test.ts` covering initial state, valid moves, win/loss conditions.
3. **Visual Baseline**: Capture screenshots across themes (Dark, Light, E-Ink) and viewports (mobile portrait 390px, desktop 1280px).
4. **Concrete Build Verification**:
   - Run a real production build: `npm run build -w @allgames/shell`
   - Verify that Vite/Rollup outputs **ZERO** warnings of the form:
     `(!) ... is dynamically imported by ... but also statically imported by ..., dynamic import will not move module into another chunk.`
   - Verify via the build output / sourcemap that the new game's component, hooks, and logic reside strictly inside a dynamic chunk (`assets/index-*.js`), and that only its isolated `metadata` contributes to the main entry chunk. Do NOT rely on visual inspection alone.

