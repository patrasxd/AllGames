import { memo } from 'react'
import type { CardData } from '../types'
import { renderMemorySymbol } from '../icons'

interface CardProps {
  card: CardData
  isEink: boolean
  onClick: () => void
}

export const Card = memo(function Card({ card, isEink, onClick }: CardProps) {
  const isOpen = card.isFlipped || card.isMatched

  let cardClasses = 'memory-card'
  if (isOpen) cardClasses += ' memory-card--flipped'
  if (card.isMatched) cardClasses += ' memory-card--matched'

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role="button"
      tabIndex={card.isMatched ? -1 : 0}
      aria-label={
        card.isMatched
          ? `Matched card: ${card.symbolId}`
          : card.isFlipped
          ? `Revealed card: ${card.symbolId}`
          : 'Hidden card'
      }
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="memory-card-inner">
        {/* Back side of card (faced down) */}
        <div className="memory-card-face memory-card-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Front side of card (faced up / symbol) */}
        <div className="memory-card-face memory-card-front">
          {renderMemorySymbol(card.symbolId)}
        </div>
      </div>
    </div>
  )
})
