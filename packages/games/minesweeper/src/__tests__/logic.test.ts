import { describe, it, expect } from 'vitest'
import {
  DIFFICULTY_CONFIGS,
  createEmptyBoard,
  populateMines,
  toggleFlag,
} from '../logic'

describe('Minesweeper logic', () => {
  it('creates empty board matching difficulty config dimensions', () => {
    const { rows, cols } = DIFFICULTY_CONFIGS.beginner
    const board = createEmptyBoard(rows, cols)
    expect(board.length).toBe(9)
    expect(board[0].length).toBe(9)
    expect(board.flat().every(c => !c.hasMine && !c.isRevealed)).toBe(true)
  })

  it('populates mines ensuring first clicked cell is never a mine', () => {
    const { rows, cols, mines } = DIFFICULTY_CONFIGS.beginner
    const emptyBoard = createEmptyBoard(rows, cols)
    const boardWithMines = populateMines(emptyBoard, 4, 4, mines)

    // First cell (4,4) must NOT have mine
    expect(boardWithMines[4][4].hasMine).toBe(false)

    // Total mines should match
    const actualMines = boardWithMines.flat().filter(c => c.hasMine).length
    expect(actualMines).toBe(mines)
  })

  it('toggles flags correctly', () => {
    const board = createEmptyBoard(9, 9)
    const flagged = toggleFlag(board, 0, 0)
    expect(flagged[0][0].isFlagged).toBe(true)

    const unflagged = toggleFlag(flagged, 0, 0)
    expect(unflagged[0][0].isFlagged).toBe(false)
  })
})
