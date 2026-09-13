import { describe, it, expect } from 'vitest'
import {
  dealNewGame,
  canMoveToFoundation,
  canMoveToTableau,
  checkWinCondition,
} from '../logic'
import type { CardData } from '../types'

describe('solitaire logic', () => {
  it('deals a new game with 7 tableau columns and correct stock size', () => {
    const state = dealNewGame(1)
    expect(state.tableau).toHaveLength(7)
    // Column 0 has 1 card, column 6 has 7 cards = 28 cards total
    const totalTableauCards = state.tableau.reduce((sum, col) => sum + col.length, 0)
    expect(totalTableauCards).toBe(28)
    // Stock has 52 - 28 = 24 cards
    expect(state.stock).toHaveLength(24)
    // Only top card in each tableau is face up
    state.tableau.forEach((col, colIdx) => {
      col.forEach((card, rowIdx) => {
        expect(card.faceUp).toBe(rowIdx === colIdx)
      })
    })
  })

  it('validates moves to foundation', () => {
    const aceOfHearts: CardData = { id: 'h1', suit: 'hearts', rank: 1, color: 'red', faceUp: true }
    const twoOfHearts: CardData = { id: 'h2', suit: 'hearts', rank: 2, color: 'red', faceUp: true }
    const twoOfSpades: CardData = { id: 's2', suit: 'spades', rank: 2, color: 'black', faceUp: true }

    // Ace can go to empty foundation
    expect(canMoveToFoundation(aceOfHearts, [])).toBe(true)
    // 2 cannot go to empty foundation
    expect(canMoveToFoundation(twoOfHearts, [])).toBe(false)

    // 2 of hearts can go on Ace of hearts
    expect(canMoveToFoundation(twoOfHearts, [aceOfHearts])).toBe(true)
    // 2 of spades cannot go on Ace of hearts
    expect(canMoveToFoundation(twoOfSpades, [aceOfHearts])).toBe(false)
  })

  it('validates moves to tableau', () => {
    const king: CardData = { id: 'k', suit: 'hearts', rank: 13, color: 'red', faceUp: true }
    const queenRed: CardData = { id: 'qr', suit: 'hearts', rank: 12, color: 'red', faceUp: true }
    const queenBlack: CardData = { id: 'qb', suit: 'spades', rank: 12, color: 'black', faceUp: true }

    // Only Kings on empty columns
    expect(canMoveToTableau(king, [])).toBe(true)
    expect(canMoveToTableau(queenBlack, [])).toBe(false)

    // Alternating color and descending rank
    expect(canMoveToTableau(queenBlack, [king])).toBe(true)
    expect(canMoveToTableau(queenRed, [king])).toBe(false)
  })

  it('checks win condition when all 4 foundations have 13 cards', () => {
    const incompleteFoundations: CardData[][] = [[], [], [], []]
    expect(checkWinCondition(incompleteFoundations)).toBe(false)

    const fullFoundation = Array.from({ length: 13 }, (_, i) => ({
      id: `c${i}`,
      suit: 'hearts' as const,
      rank: (i + 1) as any,
      color: 'red' as const,
      faceUp: true,
    }))
    const winningFoundations = [fullFoundation, fullFoundation, fullFoundation, fullFoundation]
    expect(checkWinCondition(winningFoundations)).toBe(true)
  })
})
