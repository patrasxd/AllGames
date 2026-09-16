# Game Boundaries & Component Contracts

## What Belongs in a Game Package

Each game under `packages/games/<slug>` owns:
1. **Game State & Logic**: Pure reducer/state hooks (`use<Game>.ts`, `logic.ts`).
2. **Game Board & Canvas**: Specialized grid, board, piece rendering, or canvas animation loop.
3. **Game-Specific Assets & Translations**: `i18n.ts` with local Polish and English strings.
4. **Game Metadata**: Static `slug`, `name`, `description`, `icon`, `tags`, `minPlayers`, `maxPlayers` in `metadata.tsx`.

## What Does NOT Belong in a Game Package

- **Generic UI primitives & design tokens**: Import from `@all/ui` (`Button`, `IconButton`, `ControlsBar`, `PillGroup`, `ConfirmDialog`, `Dialog`, `StatsHeader`, `ModeSelect`, `BoardLayout`, `FullBleedLayout`).
- **Game-specific overlays & HUD icons**: Import from `@allgames/ui` (`GameResultOverlay`, `GameStartOverlay`, `SinglePlayerIcon`, `TwoPlayersIcon`, `ComputerIcon`, `DPad`).
- **Direct shell layout hacking**: A game must NOT reach into shell DOM or manipulate global viewport containers.
- **Duplicate styling**: Do not redeclare `.stats-header`, `.mode-select`, `.all-board-layout`, or custom button styles in local game CSS. Use semantic design tokens (`--all-surface`, `--all-surface-2`, `--all-border`, `--all-text`, `--all-danger`, etc.).

## The `GameComponentProps` Contract

Games must implement:
```ts
export interface GameComponentProps {
  locale: Locale;
  theme?: 'dark' | 'light';
  isEink?: boolean;
  onSave?: (data: unknown) => void;
  setHeader?: (content: React.ReactNode) => void;
  setIsActive?: (active: boolean) => void;
}
```

### Key Lifecycle & Shell Integration Props:
1. **`setHeader`**:
   - Used to project the game's stats header or scoreboard directly into the shell's top navbar.
   - Must clean up by passing `null` or clearing on unmount:
     ```ts
     useEffect(() => () => setHeader?.(null), [setHeader])
     ```
2. **`setIsActive` (Leave Game Protection)**:
   - Games must notify the shell when an active session is in progress (e.g. moves have been made, cards drawn, ships placed, timer running).
   - When `isGameActive` is true, clicking the shell's `< ALL GAMES` back link intercepts navigation and opens the shell's `ConfirmDialog` ("Leave Game Confirmation").
   - Games should also bind a `beforeunload` listener while `isGameActive` is true to guard against accidental browser reloads or tab closures:
     ```ts
     useEffect(() => {
       setIsActive?.(isGameActive)
       return () => setIsActive?.(false)
     }, [isGameActive, setIsActive])

     useEffect(() => {
       if (!isGameActive) return
       const handleBeforeUnload = (e: BeforeUnloadEvent) => {
         e.preventDefault()
         e.returnValue = ''
       }
       window.addEventListener('beforeunload', handleBeforeUnload)
       return () => window.removeEventListener('beforeunload', handleBeforeUnload)
     }, [isGameActive])
     ```
3. **`isEink`**:
   - When true, games must disable continuous animations, remove drop shadows/blurs, and render crisp, high-contrast borders and solid fills (`[data-theme^='e-ink']` and `[data-eink='true']`).
