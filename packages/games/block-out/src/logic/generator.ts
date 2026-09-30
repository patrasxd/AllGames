import type { Block, LevelConfig } from '../types'
import { getBlockSlideBounds, isWon, TARGET_ROW, TARGET_EXIT_COL } from './engine'
import { getLevelConfig } from './levels'
import { solveBFS, encodeState } from './solver'

export function createPRNG(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Backward solver & generator.
 * To generate arbitrary levels beyond the precomputed 100 or for dynamic seeds.
 */
export function generateLevel(levelIndex: number): LevelConfig {
  return getLevelConfig(levelIndex)
}
