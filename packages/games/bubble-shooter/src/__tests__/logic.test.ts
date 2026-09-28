import { describe, it, expect } from 'vitest'
import {
  createEmptyGrid,
  cellExists,
  getNeighbors,
  findConnectedGroup,
  findFloatingCells,
  settleBubble,
  isBoardCleared,
  isGameOver,
  insertRowAtTop,
  generateInitialGrid,
  DANGER_ROW,
  cellX,
  ROWS,
  COLS,
} from '../logic/engine'

describe('Bubble Shooter grid geometry', () => {
  it('gives odd rows one fewer column than even rows', () => {
    expect(cellExists(0, COLS - 1)).toBe(true)
    expect(cellExists(1, COLS - 1)).toBe(false)
    expect(cellExists(1, COLS - 2)).toBe(true)
  })

  it('rejects out-of-range rows and columns', () => {
    expect(cellExists(-1, 0)).toBe(false)
    expect(cellExists(ROWS, 0)).toBe(false)
    expect(cellExists(0, -1)).toBe(false)
  })

  it('returns only neighbors that exist on the hex grid', () => {
    const neighbors = getNeighbors(0, 0)
    for (const [r, c] of neighbors) {
      expect(cellExists(r, c)).toBe(true)
    }
    // Corner cell has fewer than 6 neighbors
    expect(neighbors.length).toBeLessThan(6)
  })
})

describe('Bubble Shooter matching', () => {
  it('finds a connected same-color group via BFS', () => {
    const grid = createEmptyGrid()
    grid[0][0] = 'red'
    grid[0][1] = 'red'
    grid[1][0] = 'red'
    grid[0][2] = 'blue'

    const group = findConnectedGroup(grid, 0, 0)
    expect(group.has('0,0')).toBe(true)
    expect(group.has('0,1')).toBe(true)
    expect(group.has('1,0')).toBe(true)
    expect(group.has('0,2')).toBe(false)
    expect(group.size).toBe(3)
  })

  it('pops a matched group of 3+ and awards nothing below threshold', () => {
    const grid = createEmptyGrid()
    grid[0][0] = 'red'
    grid[0][1] = 'red'

    const { grid: after, result } = settleBubble(grid, 1, 0, 'red')
    expect(result.matched.length).toBeGreaterThanOrEqual(3)
    expect(after[0][0]).toBeNull()
    expect(after[0][1]).toBeNull()
    expect(after[1][0]).toBeNull()
  })

  it('leaves a pair of matching bubbles untouched', () => {
    const grid = createEmptyGrid()
    grid[0][0] = 'red'

    const { grid: after, result } = settleBubble(grid, 0, 1, 'red')
    expect(result.matched.length).toBe(0)
    expect(after[0][0]).toBe('red')
    expect(after[0][1]).toBe('red')
  })
})

describe('Bubble Shooter floating bubbles', () => {
  it('detects bubbles disconnected from the ceiling after a pop', () => {
    const grid = createEmptyGrid()
    // A little island hanging off row 0, plus a separate floating chain.
    grid[0][0] = 'blue'
    grid[1][0] = 'green'
    grid[2][0] = 'green'
    grid[2][1] = 'green'

    // Without removing the bridge, everything is still anchored.
    const floating = findFloatingCells(grid)
    expect(floating.size).toBe(0)

    grid[1][0] = null
    const floatingAfterBreak = findFloatingCells(grid)
    expect(floatingAfterBreak.has('2,0')).toBe(true)
    expect(floatingAfterBreak.has('2,1')).toBe(true)
    expect(floatingAfterBreak.has('0,0')).toBe(false)
  })

  it('reports a cleared board only when every cell is empty', () => {
    const grid = createEmptyGrid()
    expect(isBoardCleared(grid)).toBe(true)
    grid[5][2] = 'purple'
    expect(isBoardCleared(grid)).toBe(false)
  })
})

describe('Bubble Shooter danger line and row insertion', () => {
  it('flags game over once a bubble reaches the danger row', () => {
    const grid = createEmptyGrid()
    expect(isGameOver(grid)).toBe(false)
    grid[DANGER_ROW][0] = 'orange'
    expect(isGameOver(grid)).toBe(true)
  })

  it('shifts the whole grid down by one row when a new row is inserted', () => {
    const grid = createEmptyGrid()
    grid[0][0] = 'red'
    const { grid: shifted, parity } = insertRowAtTop(grid, 4, 0)
    expect(shifted[1][0]).toBe('red')
    expect(shifted[0].some((cell) => cell !== null)).toBe(true)
    expect(parity).toBe(1)
  })

  it('keeps every existing bubble at the same screen position after a row insertion', () => {
    for (const startParity of [0, 1]) {
      const { parity } = insertRowAtTop(createEmptyGrid(), 4, startParity)
      for (let row = 0; row < ROWS - 1; row++) {
        for (let col = 0; col < COLS; col++) {
          const existedBefore = cellExists(row, col, startParity)
          // Same slot must exist one row lower, at the same x, with the row spacing added to y.
          expect(cellExists(row + 1, col, parity)).toBe(existedBefore)
          if (existedBefore) {
            expect(cellX(row + 1, col, parity)).toBe(cellX(row, col, startParity))
          }
        }
      }
    }
  })

  it('keeps bubbles adjacent to the same neighbours after a row insertion', () => {
    const startParity = 0
    const { parity } = insertRowAtTop(createEmptyGrid(), 4, startParity)
    for (let row = 0; row < ROWS - 2; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!cellExists(row, col, startParity)) continue
        const before = getNeighbors(row, col, startParity)
          .map(([r, c]) => `${r + 1},${c}`)
          .sort()
        const after = getNeighbors(row + 1, col, parity)
          .filter(([r]) => r >= 1)
          .map(([r, c]) => `${r},${c}`)
          .sort()
        expect(after).toEqual(before)
      }
    }
  })

  it('does not orphan a connected chain when a row is inserted', () => {
    // A chain hanging from the ceiling down the left edge must stay attached after the shift.
    let grid = createEmptyGrid()
    for (let row = 0; row < 6; row++) grid[row][0] = 'red'
    const { grid: shifted, parity } = insertRowAtTop(grid, 4, 0)
    grid = shifted
    expect(findFloatingCells(grid, parity).size).toBe(0)
  })

  it('generates the requested number of initial rows using only the given color count', () => {
    const grid = generateInitialGrid(4, 3)
    const usedColors = new Set(grid.flat().filter(Boolean))
    expect(usedColors.size).toBeLessThanOrEqual(3)
    for (let row = 4; row < ROWS; row++) {
      expect(grid[row].every((cell) => cell === null)).toBe(true)
    }
  })
})
