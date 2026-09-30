import type { Block, Move } from '../types'
import { getBlockSlideBounds, isWon, TARGET_ROW, TARGET_EXIT_COL } from './engine'

export function encodeState(blocks: Block[]): string {
  // Canonical string key based on sorted block IDs and coordinates
  return blocks
    .map((b) => `${b.id}:${b.row},${b.col}`)
    .sort()
    .join('|')
}

export interface SolverResult {
  minMoves: number
  path: Move[]
}

/**
 * Breadth-First Search (BFS) solver.
 * Finds the shortest sequence of block slides to navigate the target block to the exit.
 */
export function solveBFS(initialBlocks: Block[], maxNodes = 60000): SolverResult | null {
  if (isWon(initialBlocks)) {
    return { minMoves: 0, path: [] }
  }

  const target = initialBlocks.find((b) => b.isTarget)
  if (!target || target.row !== TARGET_ROW) return null

  const visited = new Set<string>()
  const startKey = encodeState(initialBlocks)
  visited.add(startKey)

  interface QueueNode {
    blocks: Block[]
    path: Move[]
  }

  const queue: QueueNode[] = [{ blocks: initialBlocks, path: [] }]
  let head = 0

  while (head < queue.length && head < maxNodes) {
    const { blocks, path } = queue[head++]

    for (const b of blocks) {
      const bounds = getBlockSlideBounds(blocks, b.id)
      if (!bounds) continue

      for (let pos = bounds.min; pos <= bounds.max; pos++) {
        if (pos === bounds.current) continue

        const toRow = b.orientation === 'v' ? pos : b.row
        const toCol = b.orientation === 'h' ? pos : b.col
        const move: Move = {
          blockId: b.id,
          fromRow: b.row,
          fromCol: b.col,
          toRow,
          toCol,
        }

        const nextBlocks = blocks.map((item) => (item.id === b.id ? { ...item, row: toRow, col: toCol } : item))

        // Check if winning move
        if (b.isTarget && toRow === TARGET_ROW && toCol >= TARGET_EXIT_COL) {
          return {
            minMoves: path.length + 1,
            path: [...path, move],
          }
        }

        const key = encodeState(nextBlocks)
        if (!visited.has(key)) {
          visited.add(key)
          queue.push({
            blocks: nextBlocks,
            path: [...path, move],
          })
        }
      }
    }
  }

  return null
}

export function isSolvable(blocks: Block[], maxNodes?: number): boolean {
  return solveBFS(blocks, maxNodes) !== null
}

export function findSolution(blocks: Block[], maxNodes?: number): Move[] | null {
  const result = solveBFS(blocks, maxNodes)
  return result ? result.path : null
}
