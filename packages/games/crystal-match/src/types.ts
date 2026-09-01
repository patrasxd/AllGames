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
  locale?: Locale
  isEink?: boolean
}

export type GemType = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'amethyst' | 'amber'

export type SpecialType = 'none' | 'line-h' | 'line-v' | 'bomb' | 'prism'

export type ObstacleType = 'none' | 'ice' | 'double-ice' | 'stone' | 'empty'

export interface Tile {
  id: string
  row: number
  col: number
  gem: GemType | null
  special: SpecialType
  obstacle: ObstacleType
  isMatched?: boolean
  isFalling?: boolean
  animOffset?: { x: number; y: number }
}

export interface SwapAnimation {
  r1: number
  c1: number
  r2: number
  c2: number
  phase: 'sliding' | 'reverting'
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
  initialObstacles?: { row: number; col: number; obstacle: ObstacleType }[]
}

export type GameStatus = 'playing' | 'animating' | 'won' | 'lost'

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  alpha: number
  life: number
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
