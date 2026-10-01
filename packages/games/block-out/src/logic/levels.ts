import type { LevelConfig } from '../types'
import { LEVELS_DATA } from './levelsData'
import { generateProceduralLevel } from './generator'

export const BASE_MAX_LEVEL = 200
export const MAX_LEVEL = 200

export function getLevelConfig(levelIndex: number): LevelConfig {
  const clamped = Math.max(1, levelIndex)
  if (clamped <= LEVELS_DATA.length) {
    const found = LEVELS_DATA[clamped - 1]
    if (found) {
      return {
        ...found,
        blocks: found.blocks.map((b) => ({ ...b })),
      }
    }
  }

  return generateProceduralLevel(clamped)
}
