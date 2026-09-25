import { describe, it, expect } from 'vitest'
import { stateKey, isSolvable, MAX_NODES } from '../solver'
import type { SolitaireState, CardData } from '../types'

function makeMinimalState(): SolitaireState {
  const c1: CardData = { id: 's1', suit: 'spades', rank: 1, color: 'black', faceUp: false }
  const c2: CardData = { id: 'h1', suit: 'hearts', rank: 1, color: 'red', faceUp: false }
  return {
    stock: [c1, c2],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    drawMode: 1,
    moves: 0,
    score: 0,
    isWon: false,
  }
}

describe('solitaire solver', () => {
  it('includes stock order in stateKey so different stock permutations are distinguished', () => {
    const stateA = makeMinimalState()
    const stateB = makeMinimalState()
    // Reverse stock in stateB
    stateB.stock = [stateA.stock[1], stateA.stock[0]]

    const keyA = stateKey(stateA)
    const keyB = stateKey(stateB)

    expect(keyA).not.toBe(keyB)
    expect(keyA).toContain('s1h1')
    expect(keyB).toContain('h1s1')
  })

  it('detects already won state immediately', () => {
    const state = makeMinimalState()
    const winCards = (suit: 'spades' | 'hearts' | 'clubs' | 'diamonds') =>
      Array.from({ length: 13 }, (_, i) => ({
        id: `${suit[0]}${i + 1}`,
        suit,
        rank: (i + 1) as any,
        color: (suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black') as any,
        faceUp: true,
      }))
    state.foundations = [winCards('spades'), winCards('hearts'), winCards('clubs'), winCards('diamonds')]
    expect(isSolvable(state, 10)).toBe(true)
  })

  it('respects node limit', () => {
    const state = makeMinimalState()
    // Empty state with unplayable cards cannot win
    expect(isSolvable(state, 50)).toBe(false)
  })

  it('exports MAX_NODES as 10000', () => {
    expect(MAX_NODES).toBe(10000)
  })
})
