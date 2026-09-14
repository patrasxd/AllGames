# AllGames Architecture

## Repository Structure

AllGames is a multi-package monorepo managed with npm workspaces:

- `apps/shell`: The central Vite + React 18 + TypeScript + PWA shell (mounted at base path `/AllGames/`).
- `packages/ui`: Local UI package (`@allgames/ui`), now re-exporting unified, tokenized components from `@all/ui` for 100% backward compatibility.
- `packages/games/*`: 12 individual, self-contained game packages (`2048`, `battleship`, `checkers`, `chess`, `crystal-match`, `memory`, `minesweeper`, `snake`, `solitaire`, `sudoku`, `tic-tac-toe`, `wing-rush`).

## Shell & Registry Contract

Games are registered in `apps/shell/src/games/registry.ts`:
- Eager metadata import: `import { metadata as <name>Metadata } from '@allgames/<slug>/metadata'`
- Lazy component loading: `load: lazyGame(() => import('@allgames/<slug>'))`

Each game package must maintain two strictly decoupled entry points defined in `package.json`:
```json
{
  "exports": {
    ".": "./src/index.tsx",
    "./metadata": "./src/metadata.tsx"
  }
}
```

1. **Root entry point** (`./src/index.tsx`):
```ts
export { Game as GameComponent } from './Game';
```

2. **Metadata subpath** (`./src/metadata.tsx`):
```ts
export const metadata: GameMetadata = { ... };
```

### Critical Bundling Rule
`metadata.tsx` must be completely decoupled from `GameComponent` and must never import game canvas/UI components, large assets, or game state, so importing metadata does not bundle the heavy game component into the shell entry chunk.

## Technology Stack
- **Framework**: React 18 (using hooks, functional components, memo)
- **Styling**: Vanilla CSS with CSS Custom Properties (design tokens), no Tailwind
- **Animations**: `framer-motion` (respecting `prefers-reduced-motion`)
- **PWA**: `vite-plugin-pwa` with workbox service worker
- **Routing**: `react-router-dom` v6
