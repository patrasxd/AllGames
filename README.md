# AllGames

> A PWA collection of mini-games with a minimalist sketch aesthetic. No logins, no tracking, no ads — everything runs in your browser and works offline. Available in English and Polish.

---

## 🎯 What's This?

A collection of simple games you can play right in your browser. No account needed, no distractions:

- **Play anywhere** — Works offline, installable on mobile and desktop
- **Clean design** — Minimalist black-and-white style with hand-drawn animations
- **Your language** — English and Polish, switch anytime
- **Save progress** — All scores and preferences stay on your device
- **Modular codebase** — Each game is its own package, easy to add more

---

## 🏗️ Architecture & Monorepo Structure

The project is structured as an **npm workspaces monorepo**:

```
AllGames/
├── package.json                   # Root workspace configuration
├── README.md                      # Project documentation (English)
│
├── apps/
│   └── shell/                     # Main host application (Vite + React + TS)
│       ├── src/
│       │   ├── i18n/              # Shell translations & language context (EN/PL)
│       │   ├── types/             # Core contracts (GameMetadata, GameComponentProps)
│       │   ├── hooks/             # Theme & localStorage hooks
│       │   ├── games/             # Game registry (eager metadata, lazy component loading)
│       │   ├── components/        # Layout, Header Menu (Theme + Lang), GameCard
│       │   ├── pages/             # HomePage, GamePage (no-scroll viewport layout)
│       │   ├── styles/            # Design tokens & global CSS
│       │   ├── App.tsx            # Animated routes
│       │   └── main.tsx           # React DOM root
│       ├── public/
│       │   ├── manifest.json      # PWA manifest
│       │   └── icons/             # App icons & SVG favicon
│       └── vite.config.ts         # Vite configuration with PWA plugin
│
└── packages/
    ├── ui/                        # Shared UI components (@allgames/ui: ModeSelect, StatsHeader, GameModal, PillGroup, icons)
    └── games/
        ├── tic-tac-toe/           # Standalone Tic-Tac-Toe (2P / vs Computer, 3 difficulties)
        ├── snake/                 # Standalone Snake (3 map modes, 3 speeds, high scores)
        ├── checkers/              # Standalone Checkers (2P / Minimax AI, 3 difficulties)
        ├── chess/                 # Standalone Chess (Full rules, castling, en passant, promotion, Minimax AI)
        ├── minesweeper/           # Standalone Minesweeper (3 board sizes, safe first click, best time records)
        ├── 2048/                  # Standalone 2048 (3x3, 4x4, 5x5 boards, swipe/arrows, undo, best scores)
        ├── memory/                # Standalone Memory (1P / 2P, 12 vector sketch symbols, 3 board sizes)
        ├── sudoku/                # Standalone Sudoku (3 difficulties, pencil notes mode, mistakes counter, best times)
        ├── battleship/            # Standalone Battleship (1P vs 3-tier AI / 2P, radar grids, auto-deploy)
        └── solitaire/             # Standalone Solitaire (Draw 1/3, auto-finish, hints, undo, Vegas/standard scoring)
```

---

## 🔌 Game API Contract

Every game module in `packages/games/*` must conform to the following export contract in its `src/index.ts`:

```ts
import type { GameMetadata, GameComponentProps } from '../../../apps/shell/src/types/game'

export const metadata: GameMetadata = {
  slug: 'tic-tac-toe',             // URL slug: /games/:slug
  name: {
    en: 'Tic-Tac-Toe',
    pl: 'Kółko i krzyżyk'
  },
  description: {
    en: 'Classic 3x3 game. Play against a friend or challenge the computer.',
    pl: 'Klasyczne kółko i krzyżyk. Graj z przyjacielem lub zmierz się z komputerem.'
  },
  icon: '✕',                       // Emoji or SVG icon identifier
  tags: {
    en: ['classic', '2 players', 'vs computer'],
    pl: ['klasyczna', '2 graczy', 'vs komputer']
  },
  minPlayers: 1,
  maxPlayers: 2,
}

export { TicTacToe as GameComponent } from './TicTacToe'
```

### Game Component Props

```ts
export interface GameComponentProps {
  /** Current language code ('en' | 'pl') */
  locale: 'en' | 'pl';
  /** Optional callback to render custom widgets (e.g. scoreboard) into the shell's top title bar */
  setHeader?: (content: React.ReactNode) => void;
  /** Callback for persisting arbitrary state if needed */
  onSave?: (data: unknown) => void;
}
```

---

## 🎨 Design System & Aesthetics

- **Color Palette**: Monochrome high-contrast palette with CSS variables (`--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--accent`).
- **Typography**: 
  - Display & Headings: `Instrument Serif` (Italic)
  - UI & Text: `Inter`
  - Numbers & Stats: `JetBrains Mono`
- **Animations**: SVG line stroke drawing (`pathLength`), smooth framer-motion transitions, subtle button scaling, and hover border drawing.
- **Grain Overlay**: SVG turbulence fractal noise overlay simulating textured sketchbook paper.
- **Viewport Layout**: Game pages are engineered for 100% viewport fit (no scrolling), displaying header stats alongside the game title.

---

## 🌍 Internationalization (i18n)

- Automatically determines locale based on browser preferences (`navigator.language`).
- Allows users to switch between English and Polish in the settings/menu drawer in the header.
- Selected language is saved in `localStorage` under `allgames:language`.
- All code comments and documentation are strictly written in English.

---

## 💾 LocalStorage Convention

All data persisted to `localStorage` follows standardized key prefixes:

| Key | Type / Value | Description |
|---|---|---|
| `allgames:theme` | `'dark' \| 'light'` | User theme preference |
| `allgames:language` | `'en' \| 'pl'` | User language preference |
| `allgames:tic-tac-toe:settings` | `{ mode: '2p' \| 'ai' }` | Selected game mode |
| `allgames:tic-tac-toe:stats-ai` | `{ X: number, O: number, draw: number }` | Persistent score vs computer |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+ (supporting npm workspaces)

### Installation & Run

```bash
# Install all monorepo dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Preview build locally
npm run preview
```

### Adding a New Game
1. Copy the `packages/games/tic-tac-toe` directory to `packages/games/<new-game>`.
2. Update `package.json` with `@allgames/<new-game>`.
3. Implement the game logic and export `{ metadata, GameComponent }` from `src/index.ts`.
4. Register the new game in `apps/shell/src/games/registry.ts`.

---



*License: MIT*
