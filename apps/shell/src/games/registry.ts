import { lazy } from 'react'
import type { GameMetadata, GameComponentProps } from '../types/game'

// Metadata is imported eagerly (lightweight) — game components are lazy-loaded on demand
import { metadata as ticTacToeMetadata } from '@allgames/tic-tac-toe'
import { metadata as snakeMetadata } from '@allgames/snake'
import { metadata as checkersMetadata } from '@allgames/checkers'
import { metadata as chessMetadata } from '@allgames/chess'
import { metadata as minesweeperMetadata } from '@allgames/minesweeper'
import { metadata as game2048Metadata } from '@allgames/2048'
import { metadata as memoryMetadata } from '@allgames/memory'
import { metadata as sudokuMetadata } from '@allgames/sudoku'
import { metadata as battleshipMetadata } from '@allgames/battleship'
import { metadata as solitaireMetadata } from '@allgames/solitaire'
import { metadata as crystalMatchMetadata } from '@allgames/crystal-match'
import { metadata as wingRushMetadata } from '@allgames/wing-rush'

export interface GameRegistryEntry {
  metadata: GameMetadata
  load: React.LazyExoticComponent<React.ComponentType<GameComponentProps>>
}

function lazyGame(importFn: () => Promise<{ GameComponent: React.ComponentType<GameComponentProps> }>) {
  return lazy(() =>
    importFn().then(mod => ({ default: mod.GameComponent }))
  )
}

export const GAMES: GameRegistryEntry[] = [
  {
    metadata: wingRushMetadata,
    load: lazyGame(() => import('@allgames/wing-rush')),
  },
  {
    metadata: crystalMatchMetadata,
    load: lazyGame(() => import('@allgames/crystal-match')),
  },
  {
    metadata: ticTacToeMetadata,
    load: lazyGame(() => import('@allgames/tic-tac-toe')),
  },
  {
    metadata: snakeMetadata,
    load: lazyGame(() => import('@allgames/snake')),
  },
  {
    metadata: checkersMetadata,
    load: lazyGame(() => import('@allgames/checkers')),
  },
  {
    metadata: chessMetadata,
    load: lazyGame(() => import('@allgames/chess')),
  },
  {
    metadata: minesweeperMetadata,
    load: lazyGame(() => import('@allgames/minesweeper')),
  },
  {
    metadata: game2048Metadata,
    load: lazyGame(() => import('@allgames/2048')),
  },
  {
    metadata: memoryMetadata,
    load: lazyGame(() => import('@allgames/memory')),
  },
  {
    metadata: sudokuMetadata,
    load: lazyGame(() => import('@allgames/sudoku')),
  },
  {
    metadata: battleshipMetadata,
    load: lazyGame(() => import('@allgames/battleship')),
  },
  {
    metadata: solitaireMetadata,
    load: lazyGame(() => import('@allgames/solitaire')),
  },
]

export function findGame(slug: string): GameRegistryEntry | undefined {
  return GAMES.find(g => g.metadata.slug === slug)
}
