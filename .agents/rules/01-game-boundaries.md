# Game Boundaries & Component Contracts

## What Belongs in a Game Package

Each game under `packages/games/<slug>` owns:
1. **Game State & Logic**: Pure reducer/state hooks (`use<Game>.ts`, `logic.ts`).
2. **Game Board & Canvas**: Specialized grid, board, piece rendering, or canvas animation loop.
3. **Game-Specific Assets & Translations**: `i18n.ts` with local Polish and English strings.
4. **Game Metadata**: Static `slug`, `name`, `description`, `icon`, `tags`, `minPlayers`, `maxPlayers`.

## What Does NOT Belong in a Game Package

- Generic UI components (Buttons, Modals, Badges, Segmented Controls, Icons) — import from `@allgames/ui` (and subsequently `@all/ui`).
- Direct shell layout hacking: A game must NOT reach into shell DOM or manipulate global viewport containers.
- Duplicate styling: Do not redeclare `.stats-header`, `.mode-select`, or `.game-btn` in local game CSS.

## The `GameComponentProps` Contract

Games must implement:
```ts
export interface GameComponentProps {
  locale: Locale;
  theme?: 'dark' | 'light';
  isEink?: boolean;
  onSave?: (data: unknown) => void;
  setHeader?: (content: React.ReactNode) => void;
}
```
- `setHeader`: Used to project the game's stats header or scoreboard directly into the shell's top navbar. Must clean up by passing `null` or clearing on unmount.
- `isEink`: When true, games must disable continuous animations, remove drop shadows, and render crisp high-contrast elements.
