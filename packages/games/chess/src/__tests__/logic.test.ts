import { describe, it, expect } from 'vitest'
import {
  createInitialChessBoard,
  findKing,
  isInsideBoard,
  getLegalMoves,
  applyChessMove,
} from '../logic'

describe('Chess logic', () => {
  it('creates an 8x8 initial board with white and black pieces', () => {
    const board = createInitialChessBoard()
    expect(board.length).toBe(8)
    expect(board[0].length).toBe(8)

    // King positions
    const whiteKing = findKing(board, 'white')
    const blackKing = findKing(board, 'black')
    expect(whiteKing).toEqual({ row: 7, col: 4 })
    expect(blackKing).toEqual({ row: 0, col: 4 })
  })

  it('validates boundary checks', () => {
    expect(isInsideBoard(0, 0)).toBe(true)
    expect(isInsideBoard(7, 7)).toBe(true)
    expect(isInsideBoard(-1, 0)).toBe(false)
    expect(isInsideBoard(8, 4)).toBe(false)
  })

  it('generates valid opening legal moves for white', () => {
    const board = createInitialChessBoard()
    const moves = getLegalMoves(board, 'white', null)
    // 16 pawn moves (8 single, 8 double) + 4 knight moves = 20 opening moves
    expect(moves.length).toBe(20)
  })

  it('applies a move correctly', () => {
    const board = createInitialChessBoard()
    const pawn = board[6][4]!
    applyChessMove(board, {
      from: { row: 6, col: 4 },
      to: { row: 4, col: 4 },
      piece: pawn,
    })

    expect(board[6][4]).toBeNull()
    expect(board[4][4]?.type).toBe('pawn')
    expect(board[4][4]?.color).toBe('white')
  })
})
