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

export type GridSize = 3 | 4 | 5

export interface TileData {
  id: string
  value: number
  row: number
  col: number
  mergedInto?: string
  isNew?: boolean
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export type Game2048Status = 'playing' | 'won' | 'lost'
