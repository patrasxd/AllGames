import type React from 'react'

export type Locale = 'en' | 'pl'

export type Difficulty = 'easy' | 'normal' | 'hard'

export type GameStatus = 'ready' | 'aiming' | 'shooting' | 'won' | 'lost'

export type BubbleColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'

/** A grid cell: either empty (null) or holding a settled bubble of a given color. */
export type Cell = BubbleColor | null

/** ROWS x COLS matrix of settled bubbles. Odd rows have one fewer usable column (hex offset). */
export type Grid = Cell[][]

/** The bubble currently flying from the shooter toward the grid. */
export interface ShotBubble {
  x: number
  y: number
  vx: number
  vy: number
  color: BubbleColor
  radius: number
}

export interface DifficultyConfig {
  initialRows: number
  colorCount: number
  shotsPerNewRow: number
  shotSpeed: number
}

export interface HighScores {
  easy: number
  normal: number
  hard: number
}

export type GameTheme = 'dark' | 'light' | 'e-ink-light' | 'e-ink-dark'

export interface GameComponentProps {
  setHeader?: (content: React.ReactNode) => void
  setIsActive?: (active: boolean) => void
  locale?: Locale
  isEink?: boolean
  theme?: GameTheme
}

/** Cleared this shot: matched color group plus any bubbles left floating (unsupported). */
export interface PopResult {
  matched: string[]
  floating: string[]
}

export interface PopCell {
  row: number
  col: number
  color: BubbleColor
}

/** Emitted by the game logic after each shot (or reset) so the canvas can play matching animations. */
export interface ShotEvent {
  seq: number
  kind: 'reset' | 'shot'
  /** Row parity the cell coordinates below refer to (i.e. before any row insertion this shot). */
  parity: number
  landed?: PopCell & { fromX: number; fromY: number }
  matched: PopCell[]
  floating: PopCell[]
  gained: number
  rowInserted: boolean
}

/** Mutable game snapshot read by the canvas every frame (kept out of React state to avoid per-frame renders). */
export interface BubbleView {
  grid: Grid
  shot: ShotBubble | null
  event: ShotEvent | null
  currentColor: BubbleColor
  nextColor: BubbleColor
  aimAngle: number
  status: GameStatus
  shotsUntilNewRow: number
  shotsPerNewRow: number
  /** Whether row 0 is flush (0) or offset (1); flips every time a row is inserted at the top. */
  rowParity: number
}
