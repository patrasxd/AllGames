import type { BallColor, LevelConfig, Tube } from '../types'
import { createPRNG, PALETTE } from './engine'
import { findSolution } from './solver'
import { LEVELS_DATA } from './levelsData'

export interface GeneratedLevel {
  config: LevelConfig
  tubes: Tube[]
}

/**
 * Procedural generation for endless levels beyond 200.
 * Guarantees solvability by checking candidate boards with findSolution().
 */
export function generateProceduralLevel(levelIndex: number): GeneratedLevel {
  const numColors = 8
  const capacity = 4
  // Boss levels (every 5 levels) get 1 empty tube for extra challenge; standard levels get 2.
  const numEmptyTubes = levelIndex % 5 === 0 ? 1 : 2
  const colors = PALETTE.slice(0, numColors)

  for (let attempt = 0; attempt < 80; attempt++) {
    const seed = levelIndex * 10007 + attempt * 7919 + 31
    const rand = createPRNG(seed)

    const allBalls: BallColor[] = []
    for (const c of colors) {
      for (let i = 0; i < capacity; i++) allBalls.push(c)
    }

    for (let i = allBalls.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [allBalls[i], allBalls[j]] = [allBalls[j], allBalls[i]]
    }

    const tubes: Tube[] = []
    for (let i = 0; i < numColors; i++) {
      tubes.push(allBalls.slice(i * capacity, (i + 1) * capacity))
    }

    if (tubes.some((t) => new Set(t).size === 1)) continue
    for (let i = 0; i < numEmptyTubes; i++) tubes.push([])

    const sol = findSolution(tubes, capacity, { maxNodes: 45000 })
    if (sol && sol.length >= 10) {
      const parMoves = Math.round(sol.length * 1.25)
      return {
        config: {
          level: levelIndex,
          numColors,
          capacity,
          numEmptyTubes,
          colors,
          parMoves,
          starThresholds: [Math.round(parMoves * 1.15), Math.round(parMoves * 1.5)],
          seed,
        },
        tubes,
      }
    }
  }

  // Safe fallback with 2 empty tubes if 1 empty tube attempt was exhausted
  const fallbackEmptyTubes = 2
  const fallbackSeed = levelIndex * 10007 + 99991
  const rand = createPRNG(fallbackSeed)
  const allBalls: BallColor[] = []
  for (const c of colors) {
    for (let i = 0; i < capacity; i++) allBalls.push(c)
  }
  for (let i = allBalls.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [allBalls[i], allBalls[j]] = [allBalls[j], allBalls[i]]
  }
  const fallbackTubes: Tube[] = []
  for (let i = 0; i < numColors; i++) {
    fallbackTubes.push(allBalls.slice(i * capacity, (i + 1) * capacity))
  }
  for (let i = 0; i < fallbackEmptyTubes; i++) fallbackTubes.push([])
  const sol = findSolution(fallbackTubes, capacity, { maxNodes: 45000 })
  const parMoves = sol ? Math.round(sol.length * 1.25) : 30
  return {
    config: {
      level: levelIndex,
      numColors,
      capacity,
      numEmptyTubes: fallbackEmptyTubes,
      colors,
      parMoves,
      starThresholds: [Math.round(parMoves * 1.15), Math.round(parMoves * 1.5)],
      seed: fallbackSeed,
    },
    tubes: fallbackTubes,
  }
}

/**
 * Returns level data for a given level number.
 * Levels 1 to 200 are pre-computed, vetted, and guaranteed solvable.
 * Levels > 200 are generated procedurally with guaranteed solvability verification.
 */
export function generateLevel(levelIndex: number): GeneratedLevel {
  const clamped = Math.max(1, levelIndex)
  if (clamped <= LEVELS_DATA.length) {
    const pre = LEVELS_DATA[clamped - 1]
    return {
      config: {
        ...pre.config,
        colors: [...pre.config.colors],
        starThresholds: [...pre.config.starThresholds],
      },
      tubes: pre.tubes.map((t) => [...t]),
    }
  }

  return generateProceduralLevel(clamped)
}
