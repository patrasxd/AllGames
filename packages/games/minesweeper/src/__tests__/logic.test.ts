import { describe, it, expect } from 'vitest'
import {
  DIFFICULTY_CONFIGS,
  createEmptyBoard,
  populateMines,
  revealCell,
  toggleFlag,
  chordReveal,
  countFlags,
  checkWin,
} from '../logic'

describe('Minesweeper logic unit tests', () => {
  it('creates empty boards matching all difficulty config dimensions', () => {
    // Beginner 9x9
    const bBoard = createEmptyBoard(DIFFICULTY_CONFIGS.beginner.rows, DIFFICULTY_CONFIGS.beginner.cols)
    expect(bBoard.length).toBe(9)
    expect(bBoard[0].length).toBe(9)
    expect(bBoard.flat().every(c => !c.hasMine && !c.isRevealed && !c.isFlagged)).toBe(true)

    // Intermediate 16x16
    const iBoard = createEmptyBoard(DIFFICULTY_CONFIGS.intermediate.rows, DIFFICULTY_CONFIGS.intermediate.cols)
    expect(iBoard.length).toBe(16)
    expect(iBoard[0].length).toBe(16)

    // Expert 16x30
    const eBoard = createEmptyBoard(DIFFICULTY_CONFIGS.expert.rows, DIFFICULTY_CONFIGS.expert.cols)
    expect(eBoard.length).toBe(16)
    expect(eBoard[0].length).toBe(30)
  })

  it('populates mines ensuring first clicked cell and its neighbors are never a mine', () => {
    const { rows, cols, mines } = DIFFICULTY_CONFIGS.beginner
    const emptyBoard = createEmptyBoard(rows, cols)
    const boardWithMines = populateMines(emptyBoard, 4, 4, mines)

    // First cell (4,4) and surrounding 8 neighbors must NOT have mines
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        expect(boardWithMines[4 + dr][4 + dc].hasMine).toBe(false)
      }
    }

    // Total mines placed must match configuration
    const actualMines = boardWithMines.flat().filter(c => c.hasMine).length
    expect(actualMines).toBe(mines)
  })

  it('toggles flags and calculates countFlags accurately', () => {
    const board = createEmptyBoard(9, 9)
    expect(countFlags(board)).toBe(0)

    const flagged = toggleFlag(board, 2, 3)
    expect(flagged[2][3].isFlagged).toBe(true)
    expect(countFlags(flagged)).toBe(1)

    // Cannot toggle flag on an already revealed cell
    flagged[0][0].isRevealed = true
    const unchangeable = toggleFlag(flagged, 0, 0)
    expect(unchangeable[0][0].isFlagged).toBe(false)

    // Unflagging returns count to 0
    const unflagged = toggleFlag(flagged, 2, 3)
    expect(unflagged[2][3].isFlagged).toBe(false)
    expect(countFlags(unflagged)).toBe(0)
  })

  it('reveals empty cells with cascading flood-fill', () => {
    const board = createEmptyBoard(3, 3)
    // No mines on the 3x3 board
    const { nextBoard, status } = revealCell(board, 1, 1)

    // All cells should be revealed since center is 0
    expect(status).toBe('won')
    expect(nextBoard.flat().every(c => c.isRevealed)).toBe(true)
  })

  it('stepping on a mine detonates the cell and reveals all mines', () => {
    const board = createEmptyBoard(3, 3)
    board[0][0].hasMine = true
    board[2][2].hasMine = true

    const { nextBoard, status } = revealCell(board, 0, 0)
    expect(status).toBe('lost')
    expect(nextBoard[0][0].isExploded).toBe(true)
    expect(nextBoard[0][0].isRevealed).toBe(true)
    expect(nextBoard[2][2].isRevealed).toBe(true)
  })

  it('executes chordReveal when flagged neighbors match neighbor count', () => {
    const board = createEmptyBoard(3, 3)
    // Place mine at (0, 1)
    board[0][1].hasMine = true

    // Center cell (1, 1) has 1 neighbor mine
    board[1][1].neighborMines = 1
    board[1][1].isRevealed = true

    // Flag the mine at (0, 1)
    board[0][1].isFlagged = true

    // Chord click on center cell
    const { nextBoard, status } = chordReveal(board, 1, 1)
    expect(status).not.toBe('lost')
    // Unflagged neighbors should now be revealed
    expect(nextBoard[0][0].isRevealed).toBe(true)
    expect(nextBoard[2][2].isRevealed).toBe(true)
  })

  it('chordReveal does nothing when flagged count does not match neighborMines', () => {
    const board = createEmptyBoard(3, 3)
    board[1][1].neighborMines = 2
    board[1][1].isRevealed = true

    // Only 1 flag placed
    board[0][1].isFlagged = true

    const { nextBoard } = chordReveal(board, 1, 1)
    // Neighbors remain unrevealed
    expect(nextBoard[0][0].isRevealed).toBe(false)
  })

  it('evaluates checkWin correctly', () => {
    const board = createEmptyBoard(2, 2)
    board[0][0].hasMine = true

    expect(checkWin(board)).toBe(false)

    // Reveal non-mine cells
    board[0][1].isRevealed = true
    board[1][0].isRevealed = true
    board[1][1].isRevealed = true

    expect(checkWin(board)).toBe(true)
  })
})
