import { describe, it, expect } from 'vitest'
import {
  isValidPlacement,
  generateSolvedBoard,
  generateSudokuPuzzle,
  countSolutions,
  solveSudokuPuzzle,
  shuffleArray,
} from '../generator'
import type { SudokuDifficulty } from '../types'

describe('Sudoku logic & generator', () => {
  it('generates a valid 9x9 solved board', () => {
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

  it('Fisher-Yates shuffleArray preserves all elements and does not mutate input', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const originalCopy = [...original]
    const shuffled = shuffleArray(original)

    // Original array remains untouched
    expect(original).toEqual(originalCopy)

    // Shuffled array contains identical length and elements
    expect(shuffled.length).toBe(original.length)
    expect([...shuffled].sort((a, b) => a - b)).toEqual(original)

    // Handles empty and single-element arrays
    expect(shuffleArray([])).toEqual([])
    expect(shuffleArray([42])).toEqual([42])
  })

  it('solution counter accurately distinguishes single vs multiple solutions', () => {
    const solved = generateSolvedBoard()
    expect(countSolutions(solved, 2)).toBe(1)

    // A completely blank grid has multiple solutions
    const blank = Array.from({ length: 9 }, () => Array(9).fill(0))
    expect(countSolutions(blank, 2)).toBe(2)
  })

  it('generates 30 puzzles per difficulty with unique solutions, matching answers, and strict difficulty ordering', () => {
    const difficulties: SudokuDifficulty[] = ['easy', 'medium', 'hard']
    const stats: Record<SudokuDifficulty, { clueCounts: number[]; totalTimeMs: number }> = {
      easy: { clueCounts: [], totalTimeMs: 0 },
      medium: { clueCounts: [], totalTimeMs: 0 },
      hard: { clueCounts: [], totalTimeMs: 0 },
    }

    for (const diff of difficulties) {
      const startTime = performance.now()

      for (let i = 0; i < 30; i++) {
        const { puzzle, solution } = generateSudokuPuzzle(diff)

        // 1. Puzzle must have exactly 1 unique solution
        const numSolutions = countSolutions(puzzle, 2)
        expect(numSolutions).toBe(1)

        // 2. The single unique solution must match the stored solution exactly
        const solved = solveSudokuPuzzle(puzzle)
        expect(solved).not.toBeNull()
        expect(solved).toEqual(solution)

        // Count clues
        let clues = 0
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (puzzle[r][c] !== 0) clues++
          }
        }
        stats[diff].clueCounts.push(clues)
      }

      stats[diff].totalTimeMs = performance.now() - startTime
    }

    const minEasyClues = Math.min(...stats.easy.clueCounts)
    const maxEasyClues = Math.max(...stats.easy.clueCounts)
    const minMediumClues = Math.min(...stats.medium.clueCounts)
    const maxMediumClues = Math.max(...stats.medium.clueCounts)
    const minHardClues = Math.min(...stats.hard.clueCounts)
    const maxHardClues = Math.max(...stats.hard.clueCounts)

    console.log(
      `Easy   (30 puzzles): clues [${minEasyClues}, ${maxEasyClues}], avg time ${(stats.easy.totalTimeMs / 30).toFixed(2)}ms`,
    )
    console.log(
      `Medium (30 puzzles): clues [${minMediumClues}, ${maxMediumClues}], avg time ${(stats.medium.totalTimeMs / 30).toFixed(2)}ms`,
    )
    console.log(
      `Hard   (30 puzzles): clues [${minHardClues}, ${maxHardClues}], avg time ${(stats.hard.totalTimeMs / 30).toFixed(2)}ms`,
    )

    // Strict difficulty ordering: easy clues > medium clues > hard clues
    expect(minEasyClues).toBeGreaterThan(maxMediumClues)
    expect(minMediumClues).toBeGreaterThan(maxHardClues)

    // Performance assertion: hard-mode generation must stay far below 150 ms
    const avgHardTimeMs = stats.hard.totalTimeMs / 30
    expect(avgHardTimeMs).toBeLessThan(150)
  })
})
