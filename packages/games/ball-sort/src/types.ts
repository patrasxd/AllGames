import type React from 'react'

export type Locale = 'en' | 'pl'

export type GameComponentProps = {
  setHeader?: (content: React.ReactNode) => void
  setIsActive?: (active: boolean) => void
  locale?: Locale
  isEink?: boolean
}

/** Up to 8 distinguishable colors. Every color also has its own glyph (see Icons.tsx) so the
 * game stays playable without relying on hue alone. */
export type BallColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'charcoal' | 'cream'

/** One tube, bottom to top. An empty array is an empty tube. */
export type Tube = BallColor[]

export type GameStatus = 'playing' | 'won'

export interface LevelConfig {
  level: number
  numColors: number
  capacity: number
  numEmptyTubes: number
  colors: BallColor[]
  /** Reversal-move count used to build the level — a safe (not necessarily optimal) upper bound on the moves needed to solve it. Used as the par for star ratings. */
  parMoves: number
  /** Max moves for 3 stars, then for 2 stars. More moves than that still wins, just at 1 star. */
  starThresholds: [number, number]
  seed: number
}

/** A single pour: `count` balls of `color` moved from the top of `from` to `to`. */
export interface Move {
  from: number
  to: number
  count: number
  color: BallColor
}

export interface PlayerProgress {
  unlockedLevel: number
  currentLevel?: number
  levelStars: Record<number, number>
  levelBestMoves: Record<number, number>
}
