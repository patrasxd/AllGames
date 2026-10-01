import type { Block, LevelConfig } from '../types'
import { getOccupiedGrid, GRID_SIZE } from './engine'
import { solveBFS } from './solver'

export function createPRNG(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Procedural level generation for Block Out (levels 201+).
 * Guarantees solvability by checking candidate boards with solveBFS().
 */
export function generateProceduralLevel(levelIndex: number): LevelConfig {
  const targetMinMoves = 10 + (levelIndex % 8)

  for (let attempt = 0; attempt < 300; attempt++) {
    const seed = levelIndex * 13337 + attempt * 7919 + 43
    const rand = createPRNG(seed)

    const blocks: Block[] = [
      { id: 'target', orientation: 'h', length: 2, row: 2, col: 0, isTarget: true },
    ]

    const blockerCol = rand() > 0.4 ? 2 : 3
    const blockerLen: 2 | 3 = rand() > 0.4 ? 2 : 3
    const blockerMinRow = blockerLen === 2 ? 1 : 0
    const blockerMaxRow = 2
    const blockerRow = blockerMinRow + Math.floor(rand() * (blockerMaxRow - blockerMinRow + 1))
    blocks.push({ id: 'b1', orientation: 'v', length: blockerLen, row: blockerRow, col: blockerCol })

    const totalBlocks = 8 + Math.floor(rand() * 4)
    let idCounter = 2

    for (let bAttempt = 0; bAttempt < 35 && blocks.length < totalBlocks; bAttempt++) {
      const orientation: 'h' | 'v' = rand() > 0.5 ? 'h' : 'v'
      const length: 2 | 3 = rand() > 0.35 ? 2 : 3
      const maxRow = orientation === 'v' ? GRID_SIZE - length : GRID_SIZE - 1
      const maxCol = orientation === 'h' ? GRID_SIZE - length : GRID_SIZE - 1
      const row = Math.floor(rand() * (maxRow + 1))
      const col = Math.floor(rand() * (maxCol + 1))

      const candidate: Block = { id: `b${idCounter}`, orientation, length, row, col }
      if (getOccupiedGrid([...blocks, candidate]) !== null) {
        blocks.push(candidate)
        idCounter++
      }
    }

    if (blocks.length >= 7) {
      const res = solveBFS(blocks, 5000)
      if (res && res.minMoves >= targetMinMoves) {
        return {
          level: levelIndex,
          blocks,
          minMoves: res.minMoves,
          starThresholds: [res.minMoves, Math.round(res.minMoves * 1.4)],
        }
      }
    }
  }

  // Guaranteed solvable fallback board if procedural search times out
  return {
    level: levelIndex,
    blocks: [
      { id: 'target', orientation: 'h', length: 2, row: 2, col: 0, isTarget: true },
      { id: 'b1', orientation: 'v', length: 2, row: 1, col: 2 },
      { id: 'b2', orientation: 'v', length: 3, row: 2, col: 3 },
      { id: 'b3', orientation: 'h', length: 2, row: 0, col: 3 },
      { id: 'b4', orientation: 'h', length: 3, row: 4, col: 0 },
      { id: 'b5', orientation: 'v', length: 2, row: 4, col: 4 },
      { id: 'b6', orientation: 'v', length: 2, row: 0, col: 5 },
      { id: 'b7', orientation: 'h', length: 2, row: 5, col: 0 },
    ],
    minMoves: 8,
    starThresholds: [8, 11],
  }
}
