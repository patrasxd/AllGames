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

export type MemoryDifficulty = 'easy' | 'medium' | 'hard'
export type MemoryGameMode = '1p' | '2p'

export interface CardData {
  id: string
  symbolId: string
  isFlipped: boolean
  isMatched: boolean
}

export interface BestScoreRecord {
  moves: number
  time: number
}
