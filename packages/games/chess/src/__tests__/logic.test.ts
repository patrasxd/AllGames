import { describe, it, expect } from 'vitest'
import {
  createInitialChessBoard,
  findKing,
  isInsideBoard,
  getLegalMoves,
  applyChessMove,
  isKingInCheck,
  getBestChessAIMove,
  cloneChessBoard,
  BOARD_SIZE,
} from '../logic'
import type { ChessBoardState } from '../types'

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

  it('detects when a king is in check', () => {
    // Set up a custom board where a white rook directly attacks black king
    const board: ChessBoardState = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))

    board[0][4] = { id: 'bk', type: 'king', color: 'black' }
    board[7][4] = { id: 'wr', type: 'rook', color: 'white' }
    board[7][0] = { id: 'wk', type: 'king', color: 'white' }

    expect(isKingInCheck(board, 'black')).toBe(true)
    expect(isKingInCheck(board, 'white')).toBe(false)
  })

  it('detects checkmate when king has no legal moves', () => {
    // Scholar's Mate / Fool's Mate scenario or Queen + Rook checkmate on back rank
    const board: ChessBoardState = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))

    // Black king trapped on a8 with enemy queen on b8 backed by rook
    board[0][0] = { id: 'bk', type: 'king', color: 'black' }
    board[0][1] = { id: 'wq', type: 'queen', color: 'white' }
    board[2][1] = { id: 'wr', type: 'rook', color: 'white' }
    board[7][7] = { id: 'wk', type: 'king', color: 'white' }

    expect(isKingInCheck(board, 'black')).toBe(true)
    const legalMoves = getLegalMoves(board, 'black', null)
    expect(legalMoves.length).toBe(0) // Checkmate!
  })

  it('handles pawn promotion correctly when reaching the last rank', () => {
    const board: ChessBoardState = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))

    const pawn = { id: 'wp', type: 'pawn' as const, color: 'white' as const }
    board[1][0] = pawn
    board[7][7] = { id: 'wk', type: 'king', color: 'white' }
    board[0][7] = { id: 'bk', type: 'king', color: 'black' }

    applyChessMove(board, {
      from: { row: 1, col: 0 },
      to: { row: 0, col: 0 },
      piece: pawn,
      promotion: 'queen',
    })

    expect(board[1][0]).toBeNull()
    expect(board[0][0]?.type).toBe('queen')
    expect(board[0][0]?.color).toBe('white')
  })

  it('generates valid AI moves across difficulty levels', () => {
    const board = createInitialChessBoard()

    const easyMove = getBestChessAIMove(board, null, 'easy')
    expect(easyMove).not.toBeNull()
    expect(easyMove?.piece.color).toBe('black')

    const mediumMove = getBestChessAIMove(board, null, 'medium')
    expect(mediumMove).not.toBeNull()
    expect(mediumMove?.piece.color).toBe('black')

    const hardMove = getBestChessAIMove(board, null, 'hard')
    expect(hardMove).not.toBeNull()
    expect(hardMove?.piece.color).toBe('black')
  })
})
