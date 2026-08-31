import type { SudokuDifficulty, SudokuBoard } from './types'

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

function solveSudoku(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)

        for (const num of nums) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num

            if (solveSudoku(grid)) {
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
  solveSudoku(grid)
  return grid
}

export function generateSudokuPuzzle(difficulty: SudokuDifficulty): {
  puzzle: number[][]
  solution: number[][]
} {
  const solution = generateSolvedBoard()
  const puzzle = solution.map(row => [...row])

  let removals = 40
  if (difficulty === 'easy') removals = 38
  else if (difficulty === 'medium') removals = 48
  else if (difficulty === 'hard') removals = 54

  const positions: [number, number][] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c])
    }
  }

  // Shuffle positions
  positions.sort(() => Math.random() - 0.5)

  for (let i = 0; i < removals && i < positions.length; i++) {
    const [r, c] = positions[i]
    puzzle[r][c] = 0
  }

  return { puzzle, solution }
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
    }))
  )
}
