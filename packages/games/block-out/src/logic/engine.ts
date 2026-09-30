import type { Block, Move } from '../types'

export const GRID_SIZE = 6
export const TARGET_ROW = 2
export const TARGET_EXIT_COL = 4 // In a 6x6 grid, a 2-length block at col 4 occupies cols 4 and 5 (the exit edge)

export type Grid = (string | null)[][]

export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
}

/** Places all blocks on a 6x6 grid. Returns null if any block is out of bounds or overlaps. */
export function getOccupiedGrid(blocks: Block[], excludeBlockId?: string): Grid | null {
  const grid = createEmptyGrid()
  for (const b of blocks) {
    if (excludeBlockId && b.id === excludeBlockId) continue
    for (let i = 0; i < b.length; i++) {
      const r = b.orientation === 'v' ? b.row + i : b.row
      const c = b.orientation === 'h' ? b.col + i : b.col
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return null
      if (grid[r][c] !== null) return null
      grid[r][c] = b.id
    }
  }
  return grid
}

/** Calculates the min and max legal coordinate (row or col) that a block can slide to. */
export function getBlockSlideBounds(
  blocks: Block[],
  blockId: string,
): { min: number; max: number; current: number } | null {
  const block = blocks.find((b) => b.id === blockId)
  if (!block) return null

  const grid = getOccupiedGrid(blocks, blockId)
  if (!grid) return null

  if (block.orientation === 'h') {
    let minCol = block.col
    while (minCol > 0 && grid[block.row][minCol - 1] === null) {
      minCol--
    }

    let maxCol = block.col
    while (maxCol + block.length < GRID_SIZE && grid[block.row][maxCol + block.length] === null) {
      maxCol++
    }

    return { min: minCol, max: maxCol, current: block.col }
  } else {
    let minRow = block.row
    while (minRow > 0 && grid[minRow - 1][block.col] === null) {
      minRow--
    }

    let maxRow = block.row
    while (maxRow + block.length < GRID_SIZE && grid[maxRow + block.length][block.col] === null) {
      maxRow++
    }

    return { min: minRow, max: maxRow, current: block.row }
  }
}

/** Slides a block to a new position along its axis if valid and unobstructed. */
export function moveBlock(blocks: Block[], blockId: string, newPos: number): { blocks: Block[]; move: Move } | null {
  const bounds = getBlockSlideBounds(blocks, blockId)
  if (!bounds) return null

  const clampedPos = Math.max(bounds.min, Math.min(bounds.max, Math.round(newPos)))
  if (clampedPos === bounds.current) return null

  const block = blocks.find((b) => b.id === blockId)!
  const fromRow = block.row
  const fromCol = block.col
  const toRow = block.orientation === 'v' ? clampedPos : block.row
  const toCol = block.orientation === 'h' ? clampedPos : block.col

  const nextBlocks = blocks.map((b) => {
    if (b.id !== blockId) return b
    return { ...b, row: toRow, col: toCol }
  })

  return {
    blocks: nextBlocks,
    move: { blockId, fromRow, fromCol, toRow, toCol },
  }
}

/** Checks whether the primary target block has reached the exit column (col 4 on row 2). */
export function isWon(blocks: Block[]): boolean {
  const target = blocks.find((b) => b.isTarget)
  if (!target) return false
  return target.row === TARGET_ROW && target.col >= TARGET_EXIT_COL
}

export function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map((b) => ({ ...b }))
}
