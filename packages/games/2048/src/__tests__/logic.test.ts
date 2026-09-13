import { describe, it, expect } from 'vitest'
import {
  createInitialTiles,
  getEmptyPositions,
  moveTiles,
} from '../logic'

describe('2048 logic', () => {
  it('creates 2 initial tiles for a 4x4 grid', () => {
    const tiles = createInitialTiles(4)
    expect(tiles.length).toBe(2)
    for (const t of tiles) {
      expect([2, 4]).toContain(t.value)
      expect(t.row).toBeGreaterThanOrEqual(0)
      expect(t.row).toBeLessThan(4)
      expect(t.col).toBeGreaterThanOrEqual(0)
      expect(t.col).toBeLessThan(4)
    }
  })

  it('calculates empty positions accurately', () => {
    const tiles = [
      { id: '1', value: 2, row: 0, col: 0 },
      { id: '2', value: 4, row: 1, col: 1 },
    ]
    const empty = getEmptyPositions(tiles, 3)
    expect(empty.length).toBe(3 * 3 - 2)
  })

  it('merges identical adjacent tiles on move', () => {
    const tiles = [
      { id: '1', value: 2, row: 0, col: 0 },
      { id: '2', value: 2, row: 0, col: 1 },
    ]
    const result = moveTiles(tiles, 'left', 4)
    expect(result.moved).toBe(true)
    expect(result.scoreGained).toBe(4)

    // Merged tile should have value 4 at row 0, col 0
    const activeTiles = result.tiles.filter(t => !t.mergedInto)
    expect(activeTiles.length).toBe(1)
    expect(activeTiles[0].value).toBe(4)
    expect(activeTiles[0].row).toBe(0)
    expect(activeTiles[0].col).toBe(0)
  })
})
