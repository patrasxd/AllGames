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

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'
export type CardColor = 'black' | 'red'

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

export interface CardData {
  id: string
  suit: Suit
  rank: Rank
  color: CardColor
  faceUp: boolean
}

export type DrawMode = 1 | 3

export type LocationType = 'stock' | 'waste' | 'foundation' | 'tableau'

export interface CardLocation {
  type: LocationType
  pileIndex?: number // 0-3 for foundation, 0-6 for tableau
  cardIndex?: number // index within pile
}

export interface SolitaireState {
  stock: CardData[]
  waste: CardData[]
  foundations: CardData[][] // 4 piles
  tableau: CardData[][] // 7 piles
  drawMode: DrawMode
  moves: number
  score: number
  isWon: boolean
}
