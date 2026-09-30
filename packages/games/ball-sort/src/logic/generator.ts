import type { LevelConfig, Tube } from '../types'
import { createPRNG, generateLevel as generateBoard, PALETTE } from './engine'
import { isSolvable } from './solver'

export interface GeneratedLevel {
  config: LevelConfig
  tubes: Tube[]
}

function buildConfig(
  levelIndex: number,
  numColors: number,
  capacity: number,
  numEmptyTubes: number,
  parMoves: number,
  seed: number,
): LevelConfig {
  return {
    level: levelIndex,
    numColors,
    capacity,
    numEmptyTubes,
    colors: PALETTE.slice(0, numColors),
    parMoves,
    starThresholds: [Math.round(parMoves * 1.15), Math.round(parMoves * 1.6)],
    seed,
  }
}

/** Builds the config + starting board for a given level number. Same level number always
 * produces the same board (seeded), so "Level 47" means the same puzzle for everyone.
 *
 * The scramble construction (see engine.ts) is built to always be solvable, but it's scrambled
 * with single-ball moves while the real game only ever pours a whole matching top run at once —
 * so as a belt-and-braces check, every candidate board is independently verified solvable with
 * the actual player move graph before being handed out. On the rare board that doesn't check
 * out, generation retries with a different seed derived from the same level number, so results
 * stay deterministic per level while never shipping an unsolvable one. */
export function generateLevel(levelIndex: number): GeneratedLevel {
  let numColors = 3 + Math.floor((levelIndex - 1) / 3)
  numColors = Math.min(PALETTE.length, numColors)

  let capacity = 4
  if (levelIndex >= 16) capacity = 5
  if (levelIndex >= 36) capacity = 6

  // One empty tube is enough to always be solvable; two is friendlier while colors are few.
  const numEmptyTubes = numColors <= 5 ? 2 : 1

  const maxAttempts = 6
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const seed = levelIndex * 997 + 1013 + attempt * 104729
    const rand = createPRNG(seed)
    const shuffleSteps = Math.min(220, 18 + levelIndex * 4 + Math.floor(rand() * 6))
    const board = generateBoard(numColors, capacity, numEmptyTubes, shuffleSteps, rand)

    if (isSolvable(board.tubes, capacity)) {
      const parMoves = Math.max(board.parMoves, numColors)
      return { config: buildConfig(levelIndex, numColors, capacity, numEmptyTubes, parMoves, seed), tubes: board.tubes }
    }
  }

  // Extremely unlikely to be reached (see engine.ts's construction), but if every retry above
  // somehow failed verification, fall back to a much gentler, near-certainly-solvable board
  // (an extra empty tube, lighter scramble) rather than ever shipping an unverified level.
  const fallbackEmptyTubes = numEmptyTubes + 1
  const fallbackSeed = levelIndex * 997 + 1013 + maxAttempts * 104729
  const fallbackRand = createPRNG(fallbackSeed)
  const fallbackShuffle = Math.max(numColors * 3, 15)
  const fallbackBoard = generateBoard(numColors, capacity, fallbackEmptyTubes, fallbackShuffle, fallbackRand)

  if (!isSolvable(fallbackBoard.tubes, capacity)) {
    throw new Error(`Ball Sort: could not generate a verified-solvable level ${levelIndex} after all fallbacks`)
  }

  const parMoves = Math.max(fallbackBoard.parMoves, numColors)
  return {
    config: buildConfig(levelIndex, numColors, capacity, fallbackEmptyTubes, parMoves, fallbackSeed),
    tubes: fallbackBoard.tubes,
  }
}
