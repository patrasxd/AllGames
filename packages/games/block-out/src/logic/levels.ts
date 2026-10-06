import type { LevelConfig } from '../types'
import { CAMPAIGN_LEVELS, LEVELS_DATA } from './levelsData'
import { generateProceduralLevel } from './generator'

export const BASE_MAX_LEVEL = CAMPAIGN_LEVELS
export const MAX_LEVEL = CAMPAIGN_LEVELS

export function getLevelConfig(levelIndex: number): LevelConfig {
  const clamped = Math.max(1, levelIndex)
  if (clamped <= CAMPAIGN_LEVELS) {
    const found = LEVELS_DATA[clamped - 1]
    return {
      ...found,
      blocks: found.blocks.map((b) => ({ ...b })),
      starThresholds: [...found.starThresholds],
    }
  }

  return generateProceduralLevel(clamped)
}
