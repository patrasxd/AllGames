import { memo } from 'react'
import type { CardData, Suit } from '../types'
import { formatRank } from '../cards'

interface CardViewProps {
  card: CardData
  isSelected?: boolean
  isHintSource?: boolean
  isHintTarget?: boolean
  isEink?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
}

/* ─── Sketched Vector Suit Icons ──────────────────────────── */
export function SuitIcon({ suit, className }: { suit: Suit; className?: string }) {
  switch (suit) {
    case 'spades':
      return (
        <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C9.5 7 4 9.5 4 15a5 5 0 0 0 7 4.58V22h2v-2.42A5 5 0 0 0 20 15c0-5.5-5.5-8-8-13z" />
        </svg>
      )
    case 'hearts':
      return (
        <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )
    case 'diamonds':
      return (
        <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2L3 12l9 10 9-10L12 2z" />
        </svg>
      )
    case 'clubs':
      return (
        <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3a4 4 0 0 0-4 4 4 4 0 0 0 .8 2.36A4.5 4.5 0 0 0 4 13.5a4.5 4.5 0 0 0 7 3.73V21h2v-3.77a4.5 4.5 0 0 0 7-3.73 4.5 4.5 0 0 0-4.8-4.14A4 4 0 0 0 16 7a4 4 0 0 0-4-4z" />
        </svg>
      )
  }
}

export const CardView = memo(function CardView({
  card,
  isSelected,
  isHintSource,
  isHintTarget,
  isEink,
  onClick,
  onDoubleClick,
}: CardViewProps) {
  if (!card.faceUp) {
    return (
      <div className="sol-card sol-card--back" onClick={onClick}>
        <div className="sol-card-back-pattern" />
      </div>
    )
  }

  let cardClass = `sol-card sol-card--face sol-card--${card.color}`
  if (isSelected) cardClass += ' sol-card--selected'
  if (isHintSource) cardClass += ' sol-card--hint-source'
  if (isHintTarget) cardClass += ' sol-card--hint-target'

  return (
    <div
      className={cardClass}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      role="button"
      tabIndex={0}
      aria-label={`${formatRank(card.rank)} of ${card.suit}`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      {/* Top Left Rank + Suit */}
      <div className="sol-card-corner sol-card-corner--top">
        <span className="sol-card-rank">{formatRank(card.rank)}</span>
        <SuitIcon suit={card.suit} className="sol-card-suit-mini" />
      </div>

      {/* Center Large Suit Symbol */}
      <div className="sol-card-center">
        <SuitIcon suit={card.suit} className="sol-card-suit-large" />
      </div>

      {/* Bottom Right Rank + Suit (Inverted) */}
      <div className="sol-card-corner sol-card-corner--bottom">
        <span className="sol-card-rank">{formatRank(card.rank)}</span>
        <SuitIcon suit={card.suit} className="sol-card-suit-mini" />
      </div>
    </div>
  )
})
