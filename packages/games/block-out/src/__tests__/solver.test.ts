import { describe, it, expect } from 'vitest'
import { solveBFS, isSolvable, findSolution, encodeState } from '../logic/solver'
import { moveBlock, isWon } from '../logic/engine'
import type { Block } from '../types'

describe('Block Out BFS solver', () => {
  const simplePuzzle: Block[] = [
    { id: 'target', orientation: 'h', length: 2, row: 2, col: 1, isTarget: true },
    { id: 'v1', orientation: 'v', length: 2, row: 1, col: 3 },
    { id: 'v2', orientation: 'v', length: 3, row: 2, col: 4 },
  ]

  it('encodes state canonically and deterministically', () => {
    const key1 = encodeState(simplePuzzle)
    const reversed = [...simplePuzzle].reverse()
    const key2 = encodeState(reversed)
    expect(key1).toBe(key2)
  })

  it('solves simple puzzle and returns minimal move count and path', () => {
    const result = solveBFS(simplePuzzle)
    expect(result).not.toBeNull()
    expect(result?.minMoves).toBeGreaterThan(0)
    expect(result?.path.length).toBe(result?.minMoves)

    // Replay the path with the real engine to verify it actually wins!
    let current = simplePuzzle
    for (const move of result!.path) {
      const step = moveBlock(current, move.blockId, move.toCol !== move.fromCol ? move.toCol : move.toRow)
      expect(step).not.toBeNull()
      current = step!.blocks
    }

    expect(isWon(current)).toBe(true)
  })

  it('correctly identifies unsolvable blocked state', () => {
    // Target trapped with completely blocked walls that cannot move
    const blocked: Block[] = [
      { id: 'target', orientation: 'h', length: 2, row: 2, col: 0, isTarget: true },
      // Horizontal block blocking target completely
      { id: 'v1', orientation: 'v', length: 3, row: 0, col: 2 },
      { id: 'v2', orientation: 'v', length: 3, row: 3, col: 2 },
    ]
    expect(isSolvable(blocked, 1000)).toBe(false)
  })

  it('findSolution returns move sequence or null', () => {
    const path = findSolution(simplePuzzle)
    expect(path).not.toBeNull()
    expect(Array.isArray(path)).toBe(true)
  })
})
