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

export type PieceColor = 'white' | 'black'
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king'

export interface ChessPieceData {
  id: string
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

export type ChessBoardState = (ChessPieceData | null)[][]

export interface SquareCoord {
  row: number
  col: number
}

export interface ChessMove {
  from: SquareCoord
  to: SquareCoord
  piece: ChessPieceData
  captured?: ChessPieceData | null
  isCastling?: 'kingside' | 'queenside'
  isEnPassant?: boolean
  promotion?: PieceType
}

export type ChessGameMode = '2p' | 'ai'
export type ChessDifficulty = 'easy' | 'medium' | 'hard'
