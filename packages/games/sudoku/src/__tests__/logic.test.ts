import { describe, it, expect } from 'vitest'
import {
  isValidPlacement,
  generateSolvedBoard,
  generateSudokuPuzzle,
} from '../generator'

describe('Sudoku logic', () => {
  it('generates a 9x9 solved board', () => {
    const solved = generateSolvedBoard()
    expect(solved.length).toBe(9)
    for (const row of solved) {
      expect(row.length).toBe(9)
      const digits = new Set(row)
      expect(digits.size).toBe(9)
      for (let d = 1; d <= 9; d++) {
        expect(digits.has(d)).toBe(true)
      }
    }
  })

  it('validates duplicate placement in row, col, or box', () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0))
    grid[0][0] = 5
    // Same row
    expect(isValidPlacement(grid, 0, 4, 5)).toBe(false)
    // Same col
    expect(isValidPlacement(grid, 4, 0, 5)).toBe(false)
    // Same 3x3 box
    expect(isValidPlacement(grid, 1, 1, 5)).toBe(false)
    // Different box & row & col
    expect(isValidPlacement(grid, 4, 4, 5)).toBe(true)
  })

  it('generates a puzzle with clues based on difficulty', () => {
    const { puzzle, solution } = generateSudokuPuzzle('easy')
    expect(puzzle.length).toBe(9)
    expect(solution.length).toBe(9)

    let clueCount = 0
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] !== 0) clueCount++
      }
    }
    // Easy gives around 38 clues
    expect(clueCount).toBeGreaterThan(30)
  })
})
