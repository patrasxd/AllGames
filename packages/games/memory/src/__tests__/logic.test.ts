import { describe, it, expect } from 'vitest'
import { createDeck, DIFFICULTY_PAIR_COUNTS } from '../logic'

describe('Memory logic', () => {
  it('creates deck with correct number of paired cards per difficulty', () => {
    const easyDeck = createDeck('easy')
    expect(easyDeck.length).toBe(DIFFICULTY_PAIR_COUNTS.easy * 2) // 12 cards

    const medDeck = createDeck('medium')
    expect(medDeck.length).toBe(DIFFICULTY_PAIR_COUNTS.medium * 2) // 16 cards

    const hardDeck = createDeck('hard')
    expect(hardDeck.length).toBe(DIFFICULTY_PAIR_COUNTS.hard * 2) // 24 cards
  })

  it('guarantees each symbol appears exactly twice', () => {
    const deck = createDeck('medium')
    const symbolCounts: Record<string, number> = {}

    for (const card of deck) {
      symbolCounts[card.symbolId] = (symbolCounts[card.symbolId] || 0) + 1
      expect(card.isFlipped).toBe(false)
      expect(card.isMatched).toBe(false)
    }

    for (const count of Object.values(symbolCounts)) {
      expect(count).toBe(2)
    }
  })
})
