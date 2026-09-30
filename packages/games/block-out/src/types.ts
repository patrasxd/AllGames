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

export type Orientation = 'h' | 'v'

export interface Block {
  id: string
  orientation: Orientation
  length: 2 | 3
  row: number
  col: number
  isTarget?: boolean
}

export interface Move {
  blockId: string
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}

export interface LevelConfig {
  level: number
  blocks: Block[]
  minMoves: number
  starThresholds: [number, number] // [3-star threshold, 2-star threshold]
}

export interface PlayerProgress {
  unlockedLevel: number
  levelStars: Record<number, number>
  levelBestMoves: Record<number, number>
}

export type GameStatus = 'playing' | 'won'
