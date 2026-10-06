import type { LevelConfig } from '../types'
import { CAMPAIGN_LEVELS, LEVELS_DATA } from './levelsData'

/**
 * Levels beyond the campaign. They are not generated at play time: searching for a genuinely hard
 * 6x6 board takes far longer than a phone should spend while a level loads. Instead the game cycles
 * through a pool of pre-verified boards (see scripts/generate-levels.mjs) that are all at least as
 * hard as the end of the campaign, so level 201 is never easier than level 200.
 */
export function generateProceduralLevel(levelIndex: number): LevelConfig {
  const poolSize = LEVELS_DATA.length - CAMPAIGN_LEVELS
  const offset = (((levelIndex - CAMPAIGN_LEVELS - 1) % poolSize) + poolSize) % poolSize
  const entry = LEVELS_DATA[CAMPAIGN_LEVELS + offset]
  return {
    level: levelIndex,
    blocks: entry.blocks.map((b) => ({ ...b })),
    minMoves: entry.minMoves,
    starThresholds: [...entry.starThresholds],
  }
}
