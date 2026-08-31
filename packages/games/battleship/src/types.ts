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

export type BattleshipDifficulty = 'easy' | 'medium' | 'hard'
export type BattleshipMode = 'ai' | '2p'

export type Orientation = 'horizontal' | 'vertical'

export interface ShipDef {
  id: string
  name: string
  size: number
}

export interface PlacedShip {
  id: string
  name: string
  size: number
  row: number
  col: number
  orientation: Orientation
  hits: number
  isSunk: boolean
  coords: [number, number][]
}

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk'

export interface PlayerGridState {
  ships: PlacedShip[]
  grid: CellState[][]
  shotsReceived: number
}

export type GamePhase = 'mode-select' | 'placement' | 'battle' | 'ended'
