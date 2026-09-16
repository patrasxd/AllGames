import { describe, it, expect } from 'vitest'
import { dealNewGame } from '../logic'
import { isSolvable } from '../solver'

describe('Solitaire Draw 3 mode verification', () => {
  it('dealNewGame(3) initializes game in drawMode 3 with correct stock size', () => {
    const state = dealNewGame(3)
    expect(state.drawMode).toBe(3)
    expect(state.tableau).toHaveLength(7)
    expect(state.stock).toHaveLength(24)
    expect(state.waste).toHaveLength(0)
    // Confirm the deal is solvable
    expect(isSolvable(state)).toBe(true)
  }, 15000)

  it('draws 3 cards at a time from stock to waste and recycles properly', () => {
    const state = dealNewGame(3)
    expect(state.stock.length).toBe(24)

    // Simulate clicking stock: draw 3 cards
    const draw1 = Math.min(state.drawMode, state.stock.length)
    const drawn1 = state.stock.splice(state.stock.length - draw1, draw1).reverse()
    drawn1.forEach(c => { c.faceUp = true; state.waste.push(c) })

    expect(state.stock.length).toBe(21)
    expect(state.waste.length).toBe(3)
    expect(state.waste[2].faceUp).toBe(true)

    // Draw all remaining cards from stock (7 more draws of 3 cards = 21 cards)
    for (let i = 0; i < 7; i++) {
      const draw = Math.min(state.drawMode, state.stock.length)
      const drawn = state.stock.splice(state.stock.length - draw, draw).reverse()
      drawn.forEach(c => { c.faceUp = true; state.waste.push(c) })
    }

    expect(state.stock.length).toBe(0)
    expect(state.waste.length).toBe(24)

    // Recycle waste back to stock
    state.stock = state.waste.reverse().map(c => ({ ...c, faceUp: false }))
    state.waste = []

    expect(state.stock.length).toBe(24)
    expect(state.waste.length).toBe(0)
    expect(state.stock[0].faceUp).toBe(false)
  }, 15000)
})
