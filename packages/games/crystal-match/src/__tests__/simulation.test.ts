import { describe, it, expect } from 'vitest'
import { generateLevel, createInitialBoard, createPRNG } from '../logic/generator'
import {
  findMatches,
  findValidMoves,
  evaluateSwap,
  swapTiles,
  clearMatched,
  applyGravityAndRefill,
  reshuffleBoard,
  hasValidMove,
  cascadeScore,
  updateGoals,
  goalsMet,
} from '../logic/engine'
import type { Tile } from '../types'

/** Plays a level with a simple bot using the very same engine functions as the game. */
export function simulateLevel(lvl: number, run = 0) {
  const config = generateLevel(lvl)
  const rand = createPRNG(lvl * 1000 + run + 1) // fully deterministic: same level + run, same game
  const [star1, star2, star3] = config.starThresholds

  let board = createInitialBoard(config)
  let movesLeft = config.maxMoves
  let score = 0
  let goals = config.goals.map((g) => ({ ...g, current: 0 }))

  function cascade(start: Tile[][], first: ReturnType<typeof findMatches>): Tile[][] {
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
    // Goal-aware greedy bot: prefers moves that advance the open goals, then score.
    const open = goals.filter((g) => g.type !== 'score' && g.current < g.target)
    let bestValue = -1
    let move: { r1: number; c1: number; r2: number; c2: number } | null = null
    for (const cand of findValidMoves(board)) {
      let value = cand.result.scoreEarned
      for (const g of open) {
        if (g.type === 'ice') value += cand.result.iceCleared * 400
        if (g.type === 'gems' && g.gemType) value += (cand.result.gemsClearedByType[g.gemType] || 0) * 90
      }
      if (value > bestValue) {
        bestValue = value
        move = cand.move
      }
    }
    if (!move) break
    const { r1, c1, r2, c2 } = move
    const first = evaluateSwap(board, r1, c1, r2, c2)!
    movesLeft--
    board = cascade(swapTiles(board, r1, c1, r2, c2), first)
  }

  const won = goalsMet(goals, score)
  const finalScore = won ? score + movesLeft * 60 : score
  let stars = 0
  if (won) stars = finalScore >= star3 ? 3 : finalScore >= star2 ? 2 : 1
  return { won, stars, finalScore, movesLeft, maxMoves: config.maxMoves, star1, star2, star3, goals, score }
}

describe('Crystal Match level calibration (bot plays with the real engine)', () => {
  it('early levels are winnable and 2-3 stars are reachable', () => {
    let wins = 0
    let multiStar = 0
    let total = 0
    for (let lvl = 1; lvl <= 5; lvl++) {
      for (let run = 0; run < 10; run++) {
        const r = simulateLevel(lvl, run)
        total++
        if (r.won) wins++
        if (r.stars >= 2) multiStar++
      }
    }
    console.log(`levels 1-5: won ${wins}/${total}, 2+ stars ${multiStar}/${total}`)
    expect(wins).toBeGreaterThan(total * 0.5)
    expect(multiStar).toBeGreaterThan(5)
  })

  it('later levels stay winnable (no impossible goals)', () => {
    // A greedy bot is a much weaker player than a person, so "at least a few wins" is a
    // floor for fairness, not a difficulty target.
    for (const lvl of [10, 20, 30, 45, 60]) {
      let wins = 0
      for (let run = 0; run < 12; run++) if (simulateLevel(lvl, run).won) wins++
      console.log(`level ${lvl}: bot won ${wins}/12`)
      expect(wins).toBeGreaterThan(0)
    }
  })
})
