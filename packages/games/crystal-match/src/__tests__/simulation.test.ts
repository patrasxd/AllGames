import { describe, it, expect } from 'vitest'
import { generateLevel, createInitialBoard, findFirstValidMove, hasPossibleMoves, reshuffleBoard } from '../logic/generator'
import { findMatches, applyGravityAndRefill, handleSpecialCombination } from '../logic/engine'
import type { Tile, LevelGoal } from '../types'

function simulateLevel(lvl: number): {
  finalScore: number
  targetScore: number
  star1: number
  star2: number
  star3: number
  starsWon: number
  movesUsed: number
  movesLeft: number
  maxMoves: number
  goalsCompleted: boolean
} {
  const config = generateLevel(lvl)
  const star1 = config.starThresholds[0]
  const star2 = config.starThresholds[1]
  const star3 = config.starThresholds[2]

  let board = createInitialBoard(config)
  let movesLeft = config.maxMoves
  let score = 0
  let goals = config.goals.map(g => ({ ...g, current: 0 }))

  function checkGoalsCompleted(currentGoals: LevelGoal[], currentScore: number): boolean {
    return currentGoals.every(g => {
      if (g.type === 'score') return currentScore >= g.target
      return g.current >= g.target
    })
  }

  function runCascade(initialBoard: Tile[][]) {
    let currentBoard = initialBoard
    let cascadeCount = 0

    while (true) {
      const matchResult = findMatches(currentBoard)
      if (matchResult.matchedCoords.length === 0) break

      cascadeCount++
      const scoreGain = Math.round(matchResult.scoreEarned * (1 + (cascadeCount - 1) * 0.25))
      score += scoreGain

      goals = goals.map(g => {
        if (g.type === 'score') return { ...g, current: score }
        if (g.type === 'ice') {
          return { ...g, current: Math.min(g.target, g.current + matchResult.clearedObstacles.length) }
        }
        if (g.type === 'gems' && g.gemType) {
          const cleared = matchResult.gemsClearedByType[g.gemType] || 0
          return { ...g, current: Math.min(g.target, g.current + cleared) }
        }
        return g
      })

      const clearedBoard = currentBoard.map((row, r) =>
        row.map((tile, c) => {
          const isMatched = matchResult.matchedCoords.some(coord => coord.row === r && coord.col === c)
          const isObstacleCleared = matchResult.clearedObstacles.some(coord => coord.row === r && coord.col === c)
          let nextObstacle = tile.obstacle
          if (isObstacleCleared) {
            if (tile.obstacle === 'double-ice') nextObstacle = 'ice'
            else if (tile.obstacle === 'ice' || tile.obstacle === 'stone') nextObstacle = 'none'
          }
          return {
            ...tile,
            gem: isMatched ? null : tile.gem,
            special: isMatched ? 'none' : tile.special,
            obstacle: nextObstacle,
            isMatched,
          }
        })
      )

      const { nextBoard } = applyGravityAndRefill(clearedBoard, config, matchResult.specialSpawns)
      currentBoard = nextBoard
    }

    return currentBoard
  }

  while (movesLeft > 0 && !checkGoalsCompleted(goals, score)) {
    if (!hasPossibleMoves(board)) {
      board = reshuffleBoard(board, config)
    }

    const move = findFirstValidMove(board)
    if (!move) {
      board = reshuffleBoard(board, config)
      continue
    }

    const { r1, c1, r2, c2 } = move
    movesLeft--

    // Perform swap
    const specialCombo = handleSpecialCombination(board, r1, c1, r2, c2)
    const swappedBoard = board.map(row => row.map(tile => ({ ...tile })))
    const tempGem = swappedBoard[r1][c1].gem
    const tempSpecial = swappedBoard[r1][c1].special
    swappedBoard[r1][c1].gem = swappedBoard[r2][c2].gem
    swappedBoard[r1][c1].special = swappedBoard[r2][c2].special
    swappedBoard[r2][c2].gem = tempGem
    swappedBoard[r2][c2].special = tempSpecial
    board = runCascade(swappedBoard)
  }

  const goalsCompleted = checkGoalsCompleted(goals, score)
  let finalScore = score
  if (goalsCompleted) {
    // Moves bonus (+60 pts per move remaining)
    finalScore += movesLeft * 60
  }

  let starsWon = 0
  if (goalsCompleted) {
    if (finalScore >= star3) starsWon = 3
    else if (finalScore >= star2) starsWon = 2
    else starsWon = 1
  }

  return {
    finalScore,
    targetScore: star1,
    star1,
    star2,
    star3,
    starsWon,
    movesUsed: config.maxMoves - movesLeft,
    movesLeft,
    maxMoves: config.maxMoves,
    goalsCompleted,
  }
}

describe('Crystal Match Star Rating Verification', () => {
  it('verifies 2-star and 3-star ratings are achievable through normal play', () => {
    console.log('\n=== REAL CALIBRATED CODE SIMULATION (Levels 1 to 5, 20 runs each) ===\n')

    let total2or3Stars = 0
    let totalWins = 0

    for (let lvl = 1; lvl <= 5; lvl++) {
      const runs = []
      for (let run = 0; run < 20; run++) {
        runs.push(simulateLevel(lvl))
      }
      const avgScore = Math.round(runs.reduce((s, r) => s + r.finalScore, 0) / runs.length)
      const minScore = Math.min(...runs.map(r => r.finalScore))
      const maxScore = Math.max(...runs.map(r => r.finalScore))
      const starsArr = runs.map(r => r.starsWon)
      const star1Counts = starsArr.filter(s => s === 1).length
      const star2Counts = starsArr.filter(s => s === 2).length
      const star3Counts = starsArr.filter(s => s === 3).length
      const winCount = starsArr.filter(s => s > 0).length

      totalWins += winCount
      total2or3Stars += star2Counts + star3Counts

      console.log(
        `Lvl ${lvl}: Score Range [${minScore}-${maxScore}], Avg: ${avgScore} | Thresholds: 1★=${runs[0].star1}, 2★=${runs[0].star2}, 3★=${runs[0].star3} | Wins: ${winCount}/20 (1★:${star1Counts}, 2★:${star2Counts}, 3★:${star3Counts})`
      )
    }

    // Verify that across levels 1-5, players can achieve 2 and 3 stars
    expect(total2or3Stars).toBeGreaterThan(15)
  })
})
