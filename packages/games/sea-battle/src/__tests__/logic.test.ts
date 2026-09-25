import { describe, it, expect } from 'vitest'
import { createEmptyGrid, canPlaceShip, autoPlaceFleet, processShot, STANDARD_FLEET } from '../logic'
import type { PlayerGridState } from '../types'

describe('battleship logic', () => {
  it('creates an empty 10x10 grid', () => {
    const grid = createEmptyGrid()
    expect(grid).toHaveLength(10)
    expect(grid[0]).toHaveLength(10)
    expect(grid.every((row) => row.every((cell) => cell === 'empty'))).toBe(true)
  })

  it('validates ship placement boundaries and buffer zones', () => {
    const grid = createEmptyGrid()
    // Valid placement
    expect(canPlaceShip(grid, 0, 0, 4, 'horizontal')).toBe(true)
    // Out of bounds
    expect(canPlaceShip(grid, 0, 8, 4, 'horizontal')).toBe(false)
    expect(canPlaceShip(grid, 8, 0, 4, 'vertical')).toBe(false)

    // Place a ship
    grid[0][0] = 'ship'
    grid[0][1] = 'ship'

    // Adjacent cells should be blocked by buffer
    expect(canPlaceShip(grid, 1, 0, 2, 'horizontal')).toBe(false)
    expect(canPlaceShip(grid, 1, 1, 2, 'horizontal')).toBe(false)
    // Non-adjacent cell should be allowed
    expect(canPlaceShip(grid, 2, 0, 2, 'horizontal')).toBe(true)
  })

  it('autoPlaceFleet places all 10 standard ships', () => {
    const { ships, grid } = autoPlaceFleet()
    expect(ships).toHaveLength(STANDARD_FLEET.length)
    const shipCellCount = grid.flat().filter((c) => c === 'ship').length
    const expectedTotalSize = STANDARD_FLEET.reduce((sum, s) => sum + s.size, 0)
    expect(shipCellCount).toBe(expectedTotalSize)
  })

  it('processes hits, misses, and sinking correctly', () => {
    const initialGrid = createEmptyGrid()
    const state: PlayerGridState = {
      grid: initialGrid,
      ships: [
        {
          id: 'ship-1-1',
          name: 'patrol',
          size: 1,
          row: 0,
          col: 0,
          orientation: 'horizontal',
          hits: 0,
          isSunk: false,
          coords: [[0, 0]],
        },
      ],
      shotsReceived: 0,
    }
    initialGrid[0][0] = 'ship'

    // Miss shot
    const missResult = processShot(state, 5, 5)
    expect(missResult.hit).toBe(false)
    expect(missResult.nextState.grid[5][5]).toBe('miss')

    // Hit and sink shot
    const hitResult = processShot(state, 0, 0)
    expect(hitResult.hit).toBe(true)
    expect(hitResult.sunk).toBe(true)
    expect(hitResult.sunkShip?.name).toBe('patrol')
    expect(hitResult.nextState.grid[0][0]).toBe('sunk')
  })
})
