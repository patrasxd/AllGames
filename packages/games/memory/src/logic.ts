import type { MemoryDifficulty, CardData } from './types'
import { MEMORY_SYMBOLS } from './icons'

export const DIFFICULTY_PAIR_COUNTS: Record<MemoryDifficulty, number> = {
  easy: 6,    // 12 cards (3x4)
  medium: 8,  // 16 cards (4x4)
  hard: 12,   // 24 cards (4x6)
}

export function createDeck(difficulty: MemoryDifficulty): CardData[] {
  const pairCount = DIFFICULTY_PAIR_COUNTS[difficulty]
  const selectedSymbols = MEMORY_SYMBOLS.slice(0, pairCount)

  const cards: CardData[] = []
  let idCounter = 1

  for (const sym of selectedSymbols) {
    // Two cards for each symbol
    cards.push({
      id: `card-${idCounter++}`,
      symbolId: sym,
      isFlipped: false,
      isMatched: false,
    })
    cards.push({
      id: `card-${idCounter++}`,
      symbolId: sym,
      isFlipped: false,
      isMatched: false,
    })
  }

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }

  return cards
}
