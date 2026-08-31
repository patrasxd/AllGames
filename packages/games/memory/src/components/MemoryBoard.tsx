import { memo } from 'react'
import type { CardData, MemoryDifficulty } from '../types'
import { Card } from './Card'

interface MemoryBoardProps {
  cards: CardData[]
  difficulty: MemoryDifficulty
  isEink: boolean
  onCardClick: (cardId: string) => void
}

export const MemoryBoard = memo(function MemoryBoard({
  cards,
  difficulty,
  isEink,
  onCardClick,
}: MemoryBoardProps) {
  let cols = 4
  if (difficulty === 'easy') cols = 4 // 3x4 = 12
  else if (difficulty === 'medium') cols = 4 // 4x4 = 16
  else if (difficulty === 'hard') cols = 6 // 4x6 = 24

  return (
    <div className="memory-board-wrapper" data-difficulty={difficulty}>
      <div
        className="memory-board-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            isEink={isEink}
            onClick={() => onCardClick(card.id)}
          />
        ))}
      </div>
    </div>
  )
})
