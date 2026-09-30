import type { LevelConfig } from '../types'
import { LEVELS_DATA } from './levelsData'

export const MAX_LEVEL = 100

export function getLevelConfig(levelIndex: number): LevelConfig {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, levelIndex))
  const found = LEVELS_DATA.find((l) => l.level === clamped)
  if (found) {
    return {
      ...found,
      blocks: found.blocks.map((b) => ({ ...b })),
    }
  }
  // Safe fallback if not found
  return {
    level: clamped,
    blocks: [
      { id: 'target', orientation: 'h', length: 2, row: 2, col: 0, isTarget: true },
      { id: 'b1', orientation: 'v', length: 2, row: 1, col: 2 },
      { id: 'b2', orientation: 'v', length: 3, row: 2, col: 3 },
      { id: 'b3', orientation: 'h', length: 2, row: 0, col: 3 },
      { id: 'b4', orientation: 'h', length: 3, row: 4, col: 0 },
      { id: 'b5', orientation: 'v', length: 2, row: 4, col: 4 },
    ],
    minMoves: 4,
    starThresholds: [4, 6],
  }
}
