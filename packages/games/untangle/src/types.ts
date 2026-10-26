import type { ReactNode } from 'react'

export type Locale = 'en' | 'pl'
export type GameTheme = 'dark' | 'light' | 'e-ink-light' | 'e-ink-dark'

export interface GameComponentProps {
  locale?: Locale
  theme?: GameTheme
  isEink?: boolean
  onSave?: (data: unknown) => void
  setHeader?: (content: ReactNode) => void
  setIsActive?: (active: boolean) => void
}

/** A point in the 0..100 board coordinate system. */
export interface Point {
  x: number
  y: number
}

export type LayoutKind = 'grid' | 'ring' | 'diamond' | 'triangle' | 'hex' | 'twin' | 'scatter'

/**
 * Describes where the pegs sit. What `cols`, `rows` and `count` mean depends on the kind:
 * grid = `cols` x `rows`; ring = `count` holes on a circle; diamond / hex = radius in `cols`;
 * triangle = number of rows in `rows`; twin = `count` holes on an outer ring and `rows` on an inner ring plus
 * one in the centre; scatter = `count` holes placed at random from `seed`.
 */
export interface LayoutSpec {
  kind: LayoutKind
  cols: number
  rows: number
  count: number
  seed?: number
}

export type RopeEnd = 'a' | 'b'

/** A rope joins two slots (indices into the layout's slot list). Ids are stable and 0-based. */
export interface Rope {
  id: number
  a: number
  b: number
}

export interface Move {
  ropeId: number
  end: RopeEnd
  from: number
  to: number
}

export interface Conflict {
  /** Ids of the two ropes that cross or touch, `a < b`. */
  a: number
  b: number
  /** Where they meet (used to draw a marker). */
  point: Point
}

export interface LevelConfig {
  level: number
  layout: LayoutSpec
  ropes: Rope[]
  /** Fewest moves the generator knows a solution for (exact when `parExact`). */
  par: number
  parExact: boolean
  starThresholds: [number, number] // [3-star threshold, 2-star threshold]
}

export interface PlayerProgress {
  unlockedLevel: number
  currentLevel?: number
  levelStars: Record<number, number>
  levelBestMoves: Record<number, number>
}

export type GameStatus = 'playing' | 'won'
