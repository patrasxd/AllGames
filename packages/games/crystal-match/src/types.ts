import type { ReactNode } from 'react'

export type Locale = 'en' | 'pl'

export type LocalizedText = string | Record<Locale, string>
export type LocalizedTags = string[] | Record<Locale, string[]>

export interface GameMetadata {
  slug: string
  name: LocalizedText
  description: LocalizedText
  icon: string | ReactNode
  tags: LocalizedTags
  minPlayers: 1 | 2
  maxPlayers: 1 | 2
}

export interface GameComponentProps {
  setHeader?: (header: ReactNode) => void
  setIsActive?: (active: boolean) => void
  locale?: Locale
  isEink?: boolean
}

export type GemType = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'amethyst' | 'amber'

export type SpecialType = 'none' | 'line-h' | 'line-v' | 'bomb' | 'prism'

export type ObstacleType = 'none' | 'ice' | 'double-ice' | 'stone' | 'empty'

export interface Tile {
  /**
   * Identity of the GEM sitting in this cell. It travels with the gem when the
   * gem is swapped, falls or is reshuffled, which is what lets the renderer
   * animate movement. Cells that hold no gem (holes, stones) keep a static id.
   */
  id: string
  row: number
  col: number
  gem: GemType | null
  special: SpecialType
  /** Static layer of the CELL (ice under the gem, stone / hole). Never moves with gems. */
  obstacle: ObstacleType
  /** Refilled gems only: how many rows above its final cell the gem enters from. */
  spawnDrop?: number
  /** Special gem created by a match: plays a pop-in instead of falling. */
  spawnPop?: boolean
}

export type GoalType = 'score' | 'ice' | 'gems'

export interface LevelGoal {
  type: GoalType
  target: number
  current: number
  gemType?: GemType
}

export interface LevelConfig {
  level: number
  rows: number
  cols: number
  maxMoves: number
  gemColors: GemType[]
  goals: LevelGoal[]
  starThresholds: [number, number, number]
  /** Seed of the starting board, so a level always begins the same way. */
  seed?: number
  initialObstacles?: { row: number; col: number; obstacle: ObstacleType }[]
}

export type GameStatus = 'playing' | 'animating' | 'won' | 'lost'

/** One-shot sparkle at a cleared cell. Animates itself, so it needs no per-frame state. */
export interface Burst {
  id: string
  row: number
  col: number
  color: string
}

export interface ComboPopup {
  id: string
  text: string
  x: number
  y: number
}

export interface PlayerProgress {
  unlockedLevel: number
  levelStars: Record<number, number>
  levelHighScores: Record<number, number>
  totalScore: number
}
