import { describe, it, expect } from 'vitest'
import {
  createInitialTiles,
  getEmptyPositions,
  createRandomTile,
  moveTiles,
  hasMovesAvailable,
  hasReached2048,
} from '../logic'
import type { TileData } from '../types'

describe('2048 logic unit tests', () => {
  it('creates 2 initial tiles across 3x3, 4x4, and 5x5 grids with valid positions and values', () => {
    for (const size of [3, 4, 5] as const) {
      const tiles = createInitialTiles(size)
      expect(tiles.length).toBe(2)
      for (const t of tiles) {
        expect([2, 4]).toContain(t.value)
        expect(t.row).toBeGreaterThanOrEqual(0)
        expect(t.row).toBeLessThan(size)
        expect(t.col).toBeGreaterThanOrEqual(0)
        expect(t.col).toBeLessThan(size)
      }
    }
  })

  it('calculates empty positions accurately', () => {
    const tiles: TileData[] = [
      { id: '1', value: 2, row: 0, col: 0 },
      { id: '2', value: 4, row: 1, col: 1 },
    ]
    const empty = getEmptyPositions(tiles, 3)
    expect(empty.length).toBe(3 * 3 - 2)
    expect(empty).not.toContainEqual([0, 0])
    expect(empty).not.toContainEqual([1, 1])
  })

  it('creates random tiles with valid values or returns null when board is full', () => {
    const emptyBoardTiles: TileData[] = []
    const newTile = createRandomTile(emptyBoardTiles, 3)
    expect(newTile).not.toBeNull()
    expect([2, 4]).toContain(newTile?.value)

    // Full 3x3 board
    const fullBoardTiles: TileData[] = []
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        fullBoardTiles.push({ id: `t-${r}-${c}`, value: 2, row: r, col: c })
      }
    }
    expect(createRandomTile(fullBoardTiles, 3)).toBeNull()
  })

  it('merges identical adjacent tiles and calculates score correctly across directions', () => {
    // Left merge
    const tilesLeft: TileData[] = [
      { id: '1', value: 2, row: 0, col: 0 },
      { id: '2', value: 2, row: 0, col: 1 },
    ]
    const resLeft = moveTiles(tilesLeft, 'left', 4)
    expect(resLeft.moved).toBe(true)
    expect(resLeft.scoreGained).toBe(4)
    expect(resLeft.tiles.length).toBe(1)
    expect(resLeft.tiles[0].value).toBe(4)
    expect(resLeft.tiles[0].row).toBe(0)
    expect(resLeft.tiles[0].col).toBe(0)

    // Down merge
    const tilesDown: TileData[] = [
      { id: '1', value: 4, row: 0, col: 2 },
      { id: '2', value: 4, row: 2, col: 2 },
    ]
    const resDown = moveTiles(tilesDown, 'down', 4)
    expect(resDown.moved).toBe(true)
    expect(resDown.scoreGained).toBe(8)
    expect(resDown.tiles.length).toBe(1)
    expect(resDown.tiles[0].value).toBe(8)
    expect(resDown.tiles[0].row).toBe(3)
    expect(resDown.tiles[0].col).toBe(2)
  })

  it('merges consecutive pairs without cascade merging in a single move', () => {
    // [2, 2, 2, 2] moving left should become [4, 4], NOT [8]
    const tiles: TileData[] = [
      { id: '1', value: 2, row: 0, col: 0 },
      { id: '2', value: 2, row: 0, col: 1 },
      { id: '3', value: 2, row: 0, col: 2 },
      { id: '4', value: 2, row: 0, col: 3 },
    ]
    const res = moveTiles(tiles, 'left', 4)
    expect(res.moved).toBe(true)
    expect(res.scoreGained).toBe(8)
    expect(res.tiles.length).toBe(2)
    expect(res.tiles[0].value).toBe(4)
    expect(res.tiles[0].col).toBe(0)
    expect(res.tiles[1].value).toBe(4)
    expect(res.tiles[1].col).toBe(1)
  })

  it('slides tiles without merging when adjacent values differ', () => {
    const tiles: TileData[] = [
      { id: '1', value: 2, row: 0, col: 0 },
      { id: '2', value: 4, row: 0, col: 3 },
    ]
    const res = moveTiles(tiles, 'left', 4)
    expect(res.moved).toBe(true)
    expect(res.scoreGained).toBe(0)
    expect(res.tiles.length).toBe(2)
    expect(res.tiles.find(t => t.value === 2)?.col).toBe(0)
    expect(res.tiles.find(t => t.value === 4)?.col).toBe(1)
  })

  it('evaluates hasMovesAvailable correctly', () => {
    // Empty spots available
    const openTiles: TileData[] = [{ id: '1', value: 2, row: 0, col: 0 }]
    expect(hasMovesAvailable(openTiles, 3)).toBe(true)

    // Full board with adjacent matching pair
    const matchedTiles: TileData[] = [
      { id: '1', value: 2, row: 0, col: 0 },
      { id: '2', value: 2, row: 0, col: 1 },
      { id: '3', value: 4, row: 1, col: 0 },
      { id: '4', value: 8, row: 1, col: 1 },
    ]
    expect(hasMovesAvailable(matchedTiles, 2)).toBe(true)

    // Full board with NO matching adjacent pairs
    const lockedTiles: TileData[] = [
      { id: '1', value: 2, row: 0, col: 0 },
      { id: '2', value: 4, row: 0, col: 1 },
      { id: '3', value: 8, row: 1, col: 0 },
      { id: '4', value: 16, row: 1, col: 1 },
    ]
    expect(hasMovesAvailable(lockedTiles, 2)).toBe(false)
  })

  it('detects reaching 2048 tile', () => {
    expect(hasReached2048([{ id: '1', value: 1024, row: 0, col: 0 }])).toBe(false)
    expect(hasReached2048([{ id: '1', value: 2048, row: 0, col: 0 }])).toBe(true)
    expect(hasReached2048([{ id: '1', value: 4096, row: 0, col: 0 }])).toBe(true)
  })
})
