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
  locale?: Locale
  isEink?: boolean
  onSave?: (data: unknown) => void
  setHeader?: (content: ReactNode) => void
}

export type SudokuDifficulty = 'easy' | 'medium' | 'hard'

export interface SudokuCellData {
  row: number
  col: number
  value: number | null
  solution: number
  isInitial: boolean
  isError: boolean
  notes: Set<number>
}

export type SudokuBoard = SudokuCellData[][]

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'
