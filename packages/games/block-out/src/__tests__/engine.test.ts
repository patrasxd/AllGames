import { describe, it, expect } from 'vitest'
import { createEmptyGrid, getOccupiedGrid, getBlockSlideBounds, moveBlock, isWon } from '../logic/engine'
import type { Block } from '../types'

describe('Block Out engine', () => {
  it('creates empty 6x6 grid', () => {
    const grid = createEmptyGrid()
    expect(grid).toHaveLength(6)
    expect(grid[0]).toHaveLength(6)
    expect(grid.every((row) => row.every((c) => c === null))).toBe(true)
  })

  it('detects out of bounds and overlaps in getOccupiedGrid', () => {
    const validBlocks: Block[] = [
      { id: 'target', orientation: 'h', length: 2, row: 2, col: 0, isTarget: true },
      { id: 'b1', orientation: 'v', length: 3, row: 0, col: 2 },
    ]
    expect(getOccupiedGrid(validBlocks)).not.toBeNull()

    const overlapping: Block[] = [
      { id: 'target', orientation: 'h', length: 2, row: 2, col: 0, isTarget: true },
      { id: 'b1', orientation: 'v', length: 3, row: 1, col: 1 }, // overlaps at (2, 1)
    ]
    expect(getOccupiedGrid(overlapping)).toBeNull()

    const outOfBounds: Block[] = [
      { id: 'target', orientation: 'h', length: 2, row: 2, col: 5, isTarget: true }, // col 5 + 2 = 7 > 6
    ]
    expect(getOccupiedGrid(outOfBounds)).toBeNull()
  })

  it('calculates slide bounds correctly for horizontal and vertical blocks', () => {
    const blocks: Block[] = [
      // target on row 2, cols 1..2
      { id: 'target', orientation: 'h', length: 2, row: 2, col: 1, isTarget: true },
      // obstacle at row 2, col 4
      { id: 'b1', orientation: 'v', length: 2, row: 2, col: 4 },
    ]

    const targetBounds = getBlockSlideBounds(blocks, 'target')
    expect(targetBounds).toEqual({ min: 0, max: 2, current: 1 })

    const vBounds = getBlockSlideBounds(blocks, 'b1')
    expect(vBounds).toEqual({ min: 0, max: 4, current: 2 })
  })

  it('moves blocks along valid axis and respects obstacles', () => {
    const blocks: Block[] = [
      { id: 'target', orientation: 'h', length: 2, row: 2, col: 0, isTarget: true },
      { id: 'b1', orientation: 'v', length: 2, row: 1, col: 3 },
    ]

    // Move target right to col 1
    const res = moveBlock(blocks, 'target', 1)
    expect(res).not.toBeNull()
    expect(res?.blocks.find((b) => b.id === 'target')?.col).toBe(1)
    expect(res?.move).toEqual({
      blockId: 'target',
      fromRow: 2,
      fromCol: 0,
      toRow: 2,
      toCol: 1,
    })

    // Target cannot jump over b1 at col 3 (max is col 1 since length is 2)
    const invalidRes = moveBlock(blocks, 'target', 4)
    expect(invalidRes?.blocks.find((b) => b.id === 'target')?.col).toBe(1) // clamped to max legal
  })

  it('correctly evaluates isWon condition', () => {
    const notWon: Block[] = [{ id: 'target', orientation: 'h', length: 2, row: 2, col: 2, isTarget: true }]
    expect(isWon(notWon)).toBe(false)

    const won: Block[] = [{ id: 'target', orientation: 'h', length: 2, row: 2, col: 4, isTarget: true }]
    expect(isWon(won)).toBe(true)
  })
})
