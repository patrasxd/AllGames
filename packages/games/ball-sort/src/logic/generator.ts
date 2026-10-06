import type { LevelConfig, Tube } from '../types'
import type { PrecomputedLevel } from './levelsDataTypes'
import { CAMPAIGN_LEVELS, LEVELS_DATA } from './levelsData'

export interface GeneratedLevel {
  config: LevelConfig
  tubes: Tube[]
}

/** First level that uses hidden colors, and the tiers it ramps through (see LevelConfig.visibleBelowTop). */
export const HIDDEN_FROM_LEVEL = 150

/** How many balls under the top run stay visible: 2 from level 150, 1 from 166, none from 186. */
export function visibleBelowTopFor(level: number): number | undefined {
  if (level < HIDDEN_FROM_LEVEL) return undefined
  if (level <= 165) return 2
  if (level <= 185) return 1
  return 0
}

/**
 * Levels beyond the campaign. Finding a genuinely hard 8-color board takes seconds of search, which a
 * phone should not spend while a level loads, so the game cycles through a pool of pre-verified boards
 * (see scripts/generate-levels.mjs) that are as hard as the end of the campaign, hidden colors included.
 */
export function generateProceduralLevel(levelIndex: number): GeneratedLevel {
  const poolSize = LEVELS_DATA.length - CAMPAIGN_LEVELS
  const offset = (((levelIndex - CAMPAIGN_LEVELS - 1) % poolSize) + poolSize) % poolSize
  return withLevel(LEVELS_DATA[CAMPAIGN_LEVELS + offset], levelIndex)
}

function withLevel(pre: PrecomputedLevel, level: number): GeneratedLevel {
  const visibleBelowTop = visibleBelowTopFor(level)
  return {
    config: {
      ...pre.config,
      level,
      colors: [...pre.config.colors],
      starThresholds: [...pre.config.starThresholds],
      ...(visibleBelowTop !== undefined ? { visibleBelowTop } : {}),
    },
    tubes: pre.tubes.map((t) => [...t]),
  }
}

/**
 * Returns level data for a given level number.
 * Levels 1 to 200 are the pre-computed campaign; later levels cycle through a pre-computed pool.
 * Everything served is verified solvable by the test suite.
 */
export function generateLevel(levelIndex: number): GeneratedLevel {
  const clamped = Math.max(1, levelIndex)
  if (clamped <= CAMPAIGN_LEVELS) return withLevel(LEVELS_DATA[clamped - 1], clamped)
  return generateProceduralLevel(clamped)
}
