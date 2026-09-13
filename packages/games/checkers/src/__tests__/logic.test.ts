import { describe, it, expect } from 'vitest'
import {
  createInitialBoard,
  countPieces,
  isInside,
  applyMove,
  getSimpleMovesForPiece,
} from '../logic'

describe('Checkers logic', () => {
  it('creates an 8x8 initial board with 12 pieces for each player', () => {
    const board = createInitialBoard()
    expect(board.length).toBe(8)
    expect(board[0].length).toBe(8)

    const counts = countPieces(board)
    expect(counts.white).toBe(12)
    expect(counts.black).toBe(12)
  })

  it('validates boundary bounds', () => {
    expect(isInside(0, 0)).toBe(true)
    expect(isInside(7, 7)).toBe(true)
    expect(isInside(-1, 0)).toBe(false)
    expect(isInside(8, 0)).toBe(false)
  })

  it('generates forward regular moves for starting white piece', () => {
    const board = createInitialBoard()
    // row 5, col 0 has a white piece ((5+0)%2 === 1)
    const moves = getSimpleMovesForPiece(board, { row: 5, col: 0 })
    expect(moves.length).toBe(1)
    expect(moves[0].to).toEqual({ row: 4, col: 1 })
  })

  it('applies regular move and updates positions', () => {
    const board = createInitialBoard()
    const { promoted } = applyMove(board, {
      from: { row: 5, col: 0 },
      to: { row: 4, col: 1 },
    })

    expect(promoted).toBe(false)
    expect(board[5][0]).toBeNull()
    expect(board[4][1]?.color).toBe('white')
  })
})
