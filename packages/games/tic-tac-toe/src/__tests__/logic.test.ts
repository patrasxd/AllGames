import { describe, it, expect } from 'vitest'
import { checkWinner, getBestMove, isDraw, type Board } from '../logic'

describe('Tic-Tac-Toe Logic', () => {
  it('detects a horizontal win', () => {
    const board: Board = ['X', 'X', 'X', null, null, null, null, null, null]
    const result = checkWinner(board)
    expect(result).not.toBeNull()
    expect(result?.winner).toBe('X')
  })

  it('detects a draw', () => {
    const board: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    expect(checkWinner(board)).toBeNull()
    expect(isDraw(board)).toBe(true)
  })

  it('calculates optimal AI move on hard difficulty', () => {
    const board: Board = ['X', 'X', null, 'O', null, null, null, null, null]
    // AI playing as 'O' should block at index 2
    const move = getBestMove(board, 'hard')
    expect(move).toBe(2)
  })
})
