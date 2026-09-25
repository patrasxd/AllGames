import type { SudokuDifficulty, SudokuBoard } from './types'

/**
 * Modern Fisher-Yates shuffle helper.
 * Returns a new shuffled array without mutating the input.
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

export function isValidPlacement(grid: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[startRow + r][startCol + c] === num) return false
    }
  }

  return true
}

function solveSudokuRandom(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])

        for (const num of nums) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num

            if (solveSudokuRandom(grid)) {
              return true
            }

            grid[row][col] = 0
          }
        }

        return false
      }
    }
  }

  return true
}

export function generateSolvedBoard(): number[][] {
  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0))
  solveSudokuRandom(grid)
  return grid
}

/**
 * Fast solution counter using bitmasks and MRV (minimum remaining values) heuristic.
 * Stops searching as soon as limit (default 2) is reached.
 */
export function countSolutions(grid: number[][], limit = 2): number {
  const rowMask = new Uint16Array(9)
  const colMask = new Uint16Array(9)
  const boxMask = new Uint16Array(9)
  let emptyCount = 0

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c]
      if (val !== 0) {
        const bit = 1 << val
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
        if ((rowMask[r] & bit) !== 0 || (colMask[c] & bit) !== 0 || (boxMask[b] & bit) !== 0) {
          return 0
        }
        rowMask[r] |= bit
        colMask[c] |= bit
        boxMask[b] |= bit
      } else {
        emptyCount++
      }
    }
  }

  let count = 0

  function backtrack(remaining: number): void {
    if (remaining === 0) {
      count++
      return
    }

    let minCandidates = 10
    let bestR = -1
    let bestC = -1
    let bestMask = 0

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
          const used = rowMask[r] | colMask[c] | boxMask[b]
          const available = ~used & 0x3fe // bits 1..9
          let cands = 0
          for (let n = 1; n <= 9; n++) {
            if ((available & (1 << n)) !== 0) cands++
          }

          if (cands === 0) {
            return
          }

          if (cands < minCandidates) {
            minCandidates = cands
            bestR = r
            bestC = c
            bestMask = available
            if (minCandidates === 1) break
          }
        }
      }
      if (minCandidates === 1) break
    }

    if (bestR === -1) return

    const b = Math.floor(bestR / 3) * 3 + Math.floor(bestC / 3)

    for (let n = 1; n <= 9; n++) {
      const bit = 1 << n
      if ((bestMask & bit) !== 0) {
        grid[bestR][bestC] = n
        rowMask[bestR] |= bit
        colMask[bestC] |= bit
        boxMask[b] |= bit

        backtrack(remaining - 1)

        grid[bestR][bestC] = 0
        rowMask[bestR] &= ~bit
        colMask[bestC] &= ~bit
        boxMask[b] &= ~bit

        if (count >= limit) return
      }
    }
  }

  backtrack(emptyCount)
  return count
}

/**
 * Solves a puzzle deterministically and returns the completed 9x9 board.
 */
export function solveSudokuPuzzle(puzzle: number[][]): number[][] | null {
  const grid = puzzle.map((row) => [...row])
  const rowMask = new Uint16Array(9)
  const colMask = new Uint16Array(9)
  const boxMask = new Uint16Array(9)
  let emptyCount = 0

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c]
      if (val !== 0) {
        const bit = 1 << val
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
        if ((rowMask[r] & bit) !== 0 || (colMask[c] & bit) !== 0 || (boxMask[b] & bit) !== 0) {
          return null
        }
        rowMask[r] |= bit
        colMask[c] |= bit
        boxMask[b] |= bit
      } else {
        emptyCount++
      }
    }
  }

  let solvedGrid: number[][] | null = null

  function backtrack(remaining: number): boolean {
    if (remaining === 0) {
      solvedGrid = grid.map((row) => [...row])
      return true
    }

    let minCandidates = 10
    let bestR = -1
    let bestC = -1
    let bestMask = 0

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
          const used = rowMask[r] | colMask[c] | boxMask[b]
          const available = ~used & 0x3fe
          let cands = 0
          for (let n = 1; n <= 9; n++) {
            if ((available & (1 << n)) !== 0) cands++
          }

          if (cands === 0) return false

          if (cands < minCandidates) {
            minCandidates = cands
            bestR = r
            bestC = c
            bestMask = available
            if (minCandidates === 1) break
          }
        }
      }
      if (minCandidates === 1) break
    }

    if (bestR === -1) return false

    const b = Math.floor(bestR / 3) * 3 + Math.floor(bestC / 3)

    for (let n = 1; n <= 9; n++) {
      const bit = 1 << n
      if ((bestMask & bit) !== 0) {
        grid[bestR][bestC] = n
        rowMask[bestR] |= bit
        colMask[bestC] |= bit
        boxMask[b] |= bit

        if (backtrack(remaining - 1)) return true

        grid[bestR][bestC] = 0
        rowMask[bestR] &= ~bit
        colMask[bestC] &= ~bit
        boxMask[b] &= ~bit
      }
    }

    return false
  }

  backtrack(emptyCount)
  return solvedGrid
}

export function generateSudokuPuzzle(difficulty: SudokuDifficulty): {
  puzzle: number[][]
  solution: number[][]
} {
  // Target removals: easy (38 removals = 43 clues), medium (48 removals = 33 clues), hard (54 removals = 27 clues)
  let targetRemovals = 38
  let minRemovals = 32
  if (difficulty === 'easy') {
    targetRemovals = 38
    minRemovals = 32
  } else if (difficulty === 'medium') {
    targetRemovals = 48
    minRemovals = 44
  } else if (difficulty === 'hard') {
    targetRemovals = 54
    minRemovals = 50
  }

  while (true) {
    const solution = generateSolvedBoard()
    const puzzle = solution.map((row) => [...row])

    const positions: [number, number][] = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c])
      }
    }
    const shuffledPositions = shuffleArray(positions)

    let removed = 0
    for (let i = 0; i < shuffledPositions.length; i++) {
      if (removed >= targetRemovals) break
      const [r, c] = shuffledPositions[i]
      const temp = puzzle[r][c]
      puzzle[r][c] = 0

      // Only keep the cell removed if the remaining board has exactly one unique solution
      if (countSolutions(puzzle, 2) === 1) {
        removed++
      } else {
        puzzle[r][c] = temp
      }
    }

    // Ensure difficulty ordering: easy < medium < hard (in removals), i.e., easy clues > medium clues > hard clues
    if (removed >= minRemovals) {
      return { puzzle, solution }
    }
  }
}

export function createInitialBoard(difficulty: SudokuDifficulty): SudokuBoard {
  const { puzzle, solution } = generateSudokuPuzzle(difficulty)

  return puzzle.map((row, r) =>
    row.map((val, c) => ({
      row: r,
      col: c,
      value: val === 0 ? null : val,
      solution: solution[r][c],
      isInitial: val !== 0,
      isError: false,
      notes: new Set<number>(),
    })),
  )
}
