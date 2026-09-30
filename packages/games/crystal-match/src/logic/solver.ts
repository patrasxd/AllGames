import type { LevelConfig, LevelGoal, Tile } from '../types'
import { createInitialBoard, createPRNG, createRefillPRNG, generateLevel } from './generator'
import {
  applyGravityAndRefill,
  cascadeScore,
  clearMatched,
  findMatches,
  findValidMoves,
  goalsMet,
  hasValidMove,
  reshuffleBoard,
  swapTiles,
  updateGoals,
} from './engine'

export interface LevelSimulation {
  won: boolean
  stars: number
  finalScore: number
  movesLeft: number
  maxMoves: number
  star1: number
  star2: number
  star3: number
  goals: LevelGoal[]
  score: number
}

/** Plays with a deterministic goal-aware greedy bot using the same rules and refill stream as the game. */
export function simulateLevel(config: LevelConfig, rand = createRefillPRNG(config)): LevelSimulation {
  const [star1, star2, star3] = config.starThresholds
  let board = createInitialBoard(config)
  let movesLeft = config.maxMoves
  let score = 0
  let goals = config.goals.map((goal) => ({ ...goal, current: 0 }))

  function resolveCascade(start: Tile[][], first: ReturnType<typeof findMatches>): Tile[][] {
    let current = start
    let result = first
    let step = 0
    while (result.matchedCoords.length > 0) {
      step++
      score += cascadeScore(result, step)
      goals = updateGoals(goals, result, score)
      current = applyGravityAndRefill(clearMatched(current, result), config, rand).nextBoard
      result = findMatches(current)
    }
    return current
  }

  while (movesLeft > 0 && !goalsMet(goals, score)) {
    if (!hasValidMove(board)) board = reshuffleBoard(board, config, rand)
    const openGoals = goals.filter((goal) => goal.type !== 'score' && goal.current < goal.target)
    let bestValue = -1
    let bestMove: ReturnType<typeof findValidMoves>[number] | null = null

    for (const candidate of findValidMoves(board)) {
      let value = candidate.result.scoreEarned
      for (const goal of openGoals) {
        if (goal.type === 'ice') value += candidate.result.iceCleared * 400
        if (goal.type === 'gems' && goal.gemType) {
          value += (candidate.result.gemsClearedByType[goal.gemType] || 0) * 90
        }
      }
      if (value > bestValue) {
        bestValue = value
        bestMove = candidate
      }
    }

    if (!bestMove) break
    movesLeft--
    board = resolveCascade(
      swapTiles(board, bestMove.move.r1, bestMove.move.c1, bestMove.move.r2, bestMove.move.c2),
      bestMove.result,
    )
  }

  const won = goalsMet(goals, score)
  const finalScore = won ? score + movesLeft * 60 : score
  const stars = won ? (finalScore >= star3 ? 3 : finalScore >= star2 ? 2 : 1) : 0
  return { won, stars, finalScore, movesLeft, maxMoves: config.maxMoves, star1, star2, star3, goals, score }
}

const generatedLevels = new Map<string, LevelConfig>()
const MAX_SEED_ATTEMPTS = 20

/** Returns a seeded post-100 level only after the real game simulation finds a winning route. */
export function generateSolvableLevel(level: number, campaignSeed: number): LevelConfig {
  if (level <= 100) return generateLevel(level)

  const cacheKey = `${campaignSeed}:${level}`
  const cached = generatedLevels.get(cacheKey)
  if (cached) return cached

  const seedStream = createPRNG(campaignSeed + level * 104729)
  let lastSeed = campaignSeed

  for (let attempt = 0; attempt < MAX_SEED_ATTEMPTS; attempt++) {
    lastSeed = Math.floor(seedStream() * 2147483646) + 1
    const candidate = generateLevel(level, lastSeed)
    if (simulateLevel(candidate).won) {
      generatedLevels.set(cacheKey, candidate)
      return candidate
    }
  }

  const base = generateLevel(level, lastSeed)
  const fallback: LevelConfig = {
    ...base,
    maxMoves: Math.max(22, base.maxMoves),
    gemColors: ['ruby', 'sapphire', 'emerald', 'topaz'],
    goals: [{ type: 'score', target: 90, current: 0 }],
    starThresholds: [90, 270, 450],
    initialObstacles: [],
  }

  if (!simulateLevel(fallback).won) {
    throw new Error(`Could not generate a playable level ${level}`)
  }

  generatedLevels.set(cacheKey, fallback)
  return fallback
}