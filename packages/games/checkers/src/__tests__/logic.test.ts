import { describe, it, expect } from 'vitest'
import {
  createInitialBoard,
  countPieces,
  isInside,
  applyMove,
  getSimpleMovesForPiece,
  getJumpsForPiece,
  getAllLegalMoves,
  getBestAIMove,
  BOARD_SIZE,
} from '../logic'
import type { BoardState } from '../types'

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
    expect(isInside(3, 8)).toBe(false)
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

  it('enforces mandatory jumps over simple moves when captures are available', () => {
    // Empty board with 1 white piece and 1 black piece positioned for a jump
    const board: BoardState = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))

    board[4][3] = { id: 'w1', color: 'white', isKing: false }
    board[3][4] = { id: 'b1', color: 'black', isKing: false }
    // White can jump over black at (3,4) landing on (2,5)
    // White could also step to (3,2) if simple moves were allowed

    const legalMoves = getAllLegalMoves(board, 'white')
    // Mandatory jump rule: only the jump should be returned
    expect(legalMoves.length).toBe(1)
    expect(legalMoves[0].captured).toEqual({ row: 3, col: 4 })
    expect(legalMoves[0].to).toEqual({ row: 2, col: 5 })
  })

  it('handles capture and removes the jumped piece from board', () => {
    const board: BoardState = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))

    board[4][3] = { id: 'w1', color: 'white', isKing: false }
    board[3][4] = { id: 'b1', color: 'black', isKing: false }

    const jumpMove = {
      from: { row: 4, col: 3 },
      to: { row: 2, col: 5 },
      captured: { row: 3, col: 4 },
    }

    applyMove(board, jumpMove)
    expect(board[4][3]).toBeNull()
    expect(board[3][4]).toBeNull() // Captured piece removed
    expect(board[2][5]?.color).toBe('white')
  })

  it('promotes white piece to king upon reaching row 0', () => {
    const board: BoardState = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))

    board[1][2] = { id: 'w1', color: 'white', isKing: false }

    const { promoted } = applyMove(board, {
      from: { row: 1, col: 2 },
      to: { row: 0, col: 1 },
    })

    expect(promoted).toBe(true)
    expect(board[0][1]?.isKing).toBe(true)

    // King can move backwards
    const kingMoves = getSimpleMovesForPiece(board, { row: 0, col: 1 })
    expect(kingMoves.some((m) => m.to.row === 1)).toBe(true)
  })

  it('detects consecutive / multi-jumps', () => {
    const board: BoardState = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))

    board[5][2] = { id: 'w1', color: 'white', isKing: false }
    board[4][3] = { id: 'b1', color: 'black', isKing: false }
    board[2][5] = { id: 'b2', color: 'black', isKing: false }

    // First jump
    const jumps1 = getJumpsForPiece(board, { row: 5, col: 2 })
    expect(jumps1.length).toBe(1)
    expect(jumps1[0].to).toEqual({ row: 3, col: 4 })

    // Apply first jump
    applyMove(board, jumps1[0])

    // Check for chain jump from new position (3, 4) -> jump over (2,5) to (1,6)
    const jumps2 = getJumpsForPiece(board, { row: 3, col: 4 })
    expect(jumps2.length).toBe(1)
    expect(jumps2[0].to).toEqual({ row: 1, col: 6 })
  })

  it('produces valid AI moves across all difficulty levels', () => {
    const board = createInitialBoard()

    const easyMove = getBestAIMove(board, 'easy')
    expect(easyMove).not.toBeNull()
    expect(easyMove?.from.row).toBeLessThan(3) // Black starts on rows 0,1,2

    const mediumMove = getBestAIMove(board, 'medium')
    expect(mediumMove).not.toBeNull()

    const hardMove = getBestAIMove(board, 'hard')
    expect(hardMove).not.toBeNull()
  })
})
