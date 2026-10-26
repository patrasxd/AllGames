import type { LayoutSpec, LevelConfig } from '../types'
import { generateLevel } from './generator'
import {
  buildSlots,
  diamondLayout,
  gridLayout,
  hexLayout,
  ringLayout,
  ropeClearance,
  scatterLayout,
  triangleLayout,
  twinLayout,
} from './layouts'
import { cloneRopes } from './engine'
import { MAX_SOLVER_STATES, solveMinMoves } from './solver'

export const CAMPAIGN_LEVELS = 200
export const BASE_MAX_LEVEL = CAMPAIGN_LEVELS
export const MAX_LEVEL = CAMPAIGN_LEVELS

interface Tier {
  from: number
  to: number
  /** A fixed board, or one that depends on the level (random scatter boards differ every level). */
  layout: LayoutSpec | ((level: number) => LayoutSpec)
  ropes: number
  /** Scramble length at the first and last level of the tier. */
  movesFrom: number
  movesTo: number
  minConflicts: number
}

const scatter = (count: number) => (level: number) => scatterLayout(count, level)

/**
 * Difficulty ramp. Board shapes rotate every few levels so no two stages feel alike, while ropes and scramble
 * length keep growing. The last tier keeps going past level 200.
 */
const TIERS: Tier[] = [
  { from: 1, to: 8, layout: gridLayout(3), ropes: 3, movesFrom: 2, movesTo: 3, minConflicts: 1 },
  { from: 9, to: 16, layout: gridLayout(4, 3), ropes: 3, movesFrom: 3, movesTo: 4, minConflicts: 1 },
  { from: 17, to: 24, layout: ringLayout(10), ropes: 4, movesFrom: 3, movesTo: 5, minConflicts: 2 },
  { from: 25, to: 32, layout: diamondLayout(2), ropes: 4, movesFrom: 4, movesTo: 6, minConflicts: 2 },
  { from: 33, to: 40, layout: gridLayout(4), ropes: 5, movesFrom: 4, movesTo: 6, minConflicts: 2 },
  { from: 41, to: 48, layout: triangleLayout(5), ropes: 5, movesFrom: 5, movesTo: 6, minConflicts: 2 },
  { from: 49, to: 56, layout: hexLayout(2), ropes: 6, movesFrom: 5, movesTo: 7, minConflicts: 2 },
  { from: 57, to: 64, layout: ringLayout(13), ropes: 5, movesFrom: 5, movesTo: 7, minConflicts: 3 },
  { from: 65, to: 72, layout: gridLayout(5, 4), ropes: 6, movesFrom: 6, movesTo: 8, minConflicts: 3 },
  { from: 73, to: 80, layout: twinLayout(12, 6), ropes: 6, movesFrom: 6, movesTo: 8, minConflicts: 3 },
  { from: 81, to: 88, layout: scatter(14), ropes: 5, movesFrom: 6, movesTo: 8, minConflicts: 3 },
  { from: 89, to: 96, layout: triangleLayout(6), ropes: 7, movesFrom: 7, movesTo: 9, minConflicts: 3 },
  { from: 97, to: 104, layout: diamondLayout(3), ropes: 8, movesFrom: 7, movesTo: 9, minConflicts: 3 },
  { from: 105, to: 112, layout: hexLayout(2), ropes: 7, movesFrom: 8, movesTo: 10, minConflicts: 3 },
  { from: 113, to: 120, layout: gridLayout(4), ropes: 6, movesFrom: 8, movesTo: 10, minConflicts: 3 },
  { from: 121, to: 128, layout: twinLayout(14, 7), ropes: 8, movesFrom: 8, movesTo: 10, minConflicts: 3 },
  { from: 129, to: 136, layout: scatter(18), ropes: 7, movesFrom: 9, movesTo: 11, minConflicts: 3 },
  { from: 137, to: 144, layout: ringLayout(14), ropes: 6, movesFrom: 9, movesTo: 11, minConflicts: 3 },
  { from: 145, to: 152, layout: gridLayout(5), ropes: 8, movesFrom: 9, movesTo: 12, minConflicts: 4 },
  { from: 153, to: 160, layout: triangleLayout(7), ropes: 8, movesFrom: 10, movesTo: 12, minConflicts: 4 },
  { from: 161, to: 168, layout: ringLayout(16), ropes: 7, movesFrom: 10, movesTo: 12, minConflicts: 4 },
  { from: 169, to: 176, layout: twinLayout(16, 8), ropes: 9, movesFrom: 10, movesTo: 13, minConflicts: 4 },
  { from: 177, to: 184, layout: scatter(22), ropes: 9, movesFrom: 11, movesTo: 13, minConflicts: 4 },
  { from: 185, to: 192, layout: diamondLayout(3), ropes: 9, movesFrom: 11, movesTo: 13, minConflicts: 4 },
  { from: 193, to: 240, layout: gridLayout(5), ropes: 9, movesFrom: 12, movesTo: 15, minConflicts: 4 },
]

function tierFor(level: number): Tier {
  return TIERS.find((t) => level >= t.from && level <= t.to) ?? TIERS[TIERS.length - 1]
}

export function starThresholds(par: number, exact: boolean): [number, number] {
  if (exact) return [par, par + Math.max(2, Math.ceil(par / 2))]
  // The par of a big board is only an upper bound, so be a little more forgiving.
  return [Math.ceil(par * 1.25), Math.ceil(par * 1.75) + 1]
}

const cache = new Map<number, LevelConfig>()

function buildLevel(level: number): LevelConfig {
  const tier = tierFor(level)
  const span = tier.to - tier.from
  const progress = span > 0 ? Math.min(1, Math.max(0, (level - tier.from) / span)) : 1
  const scrambleMoves = Math.round(tier.movesFrom + (tier.movesTo - tier.movesFrom) * progress)

  const layout = typeof tier.layout === 'function' ? tier.layout(level) : tier.layout
  const slots = buildSlots(layout)
  const clearance = ropeClearance(layout)
  const wanted = Math.ceil(scrambleMoves * 0.8)

  // On small boards the optimum can be computed, so try a few seeds and keep the hardest level: random
  // scrambles are often undone by a much shorter shortcut.
  let chosen = generateLevel(layout, tier.ropes, scrambleMoves, tier.minConflicts, level * 7919 + 13)
  let exact = solveMinMoves(slots, chosen.ropes, MAX_SOLVER_STATES, chosen.solution.length, clearance)
  for (let attempt = 1; attempt <= 24 && exact !== null && exact < wanted; attempt++) {
    const candidate = generateLevel(
      layout,
      tier.ropes,
      scrambleMoves,
      tier.minConflicts,
      level * 7919 + 13 + attempt * 6007,
    )
    const candidateExact = solveMinMoves(
      slots,
      candidate.ropes,
      MAX_SOLVER_STATES,
      candidate.solution.length,
      clearance,
    )
    if (candidateExact !== null && candidateExact > exact) {
      chosen = candidate
      exact = candidateExact
    }
  }
  const generated = chosen
  const par = exact ?? generated.solution.length

  return {
    level,
    layout,
    ropes: generated.ropes,
    par,
    parExact: exact !== null,
    starThresholds: starThresholds(par, exact !== null),
  }
}

/** Levels are generated from their number alone, so they are identical on every device. */
export function getLevelConfig(levelIndex: number): LevelConfig {
  const level = Math.max(1, Math.floor(levelIndex))
  let config = cache.get(level)
  if (!config) {
    config = buildLevel(level)
    cache.set(level, config)
  }
  return {
    ...config,
    ropes: cloneRopes(config.ropes),
    layout: { ...config.layout },
    starThresholds: [...config.starThresholds],
  }
}
