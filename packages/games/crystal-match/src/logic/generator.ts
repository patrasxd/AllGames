import type { GemType, LevelConfig, LevelGoal, ObstacleType, Tile } from '../types'
import { fillWithoutMatches, findValidMoves, newGemId } from './engine'

const ALL_GEMS: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'amber']

// Seeded PRNG for deterministic level generation
export function createPRNG(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateLevel(levelIndex: number): LevelConfig {
  const rand = createPRNG(levelIndex * 997 + 1013)

  const rows = 8
  const cols = 8

  // Color count curve
  let colorCount = 4
  if (levelIndex >= 4) colorCount = 5
  if (levelIndex >= 12) colorCount = 6
  const gemColors = ALL_GEMS.slice(0, colorCount)

  const goals: LevelGoal[] = []
  const initialObstacles: { row: number; col: number; obstacle: ObstacleType }[] = []

  let maxMoves = Math.max(23, Math.min(30, 26 - Math.floor(levelIndex / 20) + Math.floor(rand() * 4)))
  // Ramps up to level 12 (as before), then keeps growing slowly instead of flat-lining.
  let targetScore = levelIndex <= 12 ? 1800 + (levelIndex - 1) * 220 : Math.min(6500, 4200 + (levelIndex - 12) * 35)

  if (levelIndex === 1) {
    // Level 1: Tutorial Level - Collect specific gems and score (cannot be won in 1 move)
    maxMoves = 22
    targetScore = 1800
    goals.push({ type: 'gems', target: 12, current: 0, gemType: 'ruby' })
    goals.push({ type: 'gems', target: 12, current: 0, gemType: 'sapphire' })
    goals.push({ type: 'score', target: targetScore, current: 0 })
  } else if (levelIndex === 2) {
    // Level 2: Diamond Cutout Corners
    maxMoves = 22
    targetScore = 2000
    // Corner cutouts (empty holes)
    initialObstacles.push({ row: 0, col: 0, obstacle: 'empty' })
    initialObstacles.push({ row: 0, col: 7, obstacle: 'empty' })
    initialObstacles.push({ row: 7, col: 0, obstacle: 'empty' })
    initialObstacles.push({ row: 7, col: 7, obstacle: 'empty' })

    goals.push({ type: 'gems', target: 14, current: 0, gemType: 'emerald' })
    goals.push({ type: 'gems', target: 14, current: 0, gemType: 'topaz' })
    goals.push({ type: 'score', target: targetScore, current: 0 })
  } else if (levelIndex === 3) {
    // Level 3: Introduction to Ice
    maxMoves = 22
    targetScore = 2200
    // 8 Ice tiles in a checkerboard diamond. Frozen gems cannot be swapped, so the ice is
    // spread out: every ice cell has free neighbours to build a match with.
    for (const [r, c] of [
      [2, 2],
      [2, 4],
      [3, 3],
      [3, 5],
      [4, 2],
      [4, 4],
      [5, 3],
      [5, 5],
    ]) {
      initialObstacles.push({ row: r, col: c, obstacle: 'ice' })
    }
    goals.push({ type: 'ice', target: 6, current: 0 })
    goals.push({ type: 'score', target: targetScore, current: 0 })
  } else if (levelIndex === 4) {
    // Level 4: Introduction to Stone Walls
    maxMoves = 22
    targetScore = 2400
    // 4 stone blocks in center
    initialObstacles.push({ row: 3, col: 3, obstacle: 'stone' })
    initialObstacles.push({ row: 3, col: 4, obstacle: 'stone' })
    initialObstacles.push({ row: 4, col: 3, obstacle: 'stone' })
    initialObstacles.push({ row: 4, col: 4, obstacle: 'stone' })

    goals.push({ type: 'gems', target: 16, current: 0, gemType: 'amethyst' })
    goals.push({ type: 'score', target: targetScore, current: 0 })
  } else {
    // Level 5+: Procedural Board Shapes and Obstacles
    const shapeType = levelIndex % 5
    if (shapeType === 0) {
      // Donut center hole
      initialObstacles.push({ row: 3, col: 3, obstacle: 'empty' })
      initialObstacles.push({ row: 3, col: 4, obstacle: 'empty' })
      initialObstacles.push({ row: 4, col: 3, obstacle: 'empty' })
      initialObstacles.push({ row: 4, col: 4, obstacle: 'empty' })
    } else if (shapeType === 1) {
      // Hourglass corners
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          initialObstacles.push({ row: i, col: j, obstacle: 'empty' })
          initialObstacles.push({ row: i, col: 7 - j, obstacle: 'empty' })
          initialObstacles.push({ row: 7 - i, col: j, obstacle: 'empty' })
          initialObstacles.push({ row: 7 - i, col: 7 - j, obstacle: 'empty' })
        }
      }
    } else if (shapeType === 2) {
      // Notched top edge
      initialObstacles.push({ row: 0, col: 3, obstacle: 'empty' })
      initialObstacles.push({ row: 0, col: 4, obstacle: 'empty' })
    } else if (shapeType === 3) {
      // Side pockets
      initialObstacles.push({ row: 3, col: 0, obstacle: 'empty' })
      initialObstacles.push({ row: 4, col: 0, obstacle: 'empty' })
      initialObstacles.push({ row: 3, col: 7, obstacle: 'empty' })
      initialObstacles.push({ row: 4, col: 7, obstacle: 'empty' })
    }

    // Place Ice & Stones
    const iceCount = Math.min(22, 6 + Math.floor(levelIndex * 0.8))
    const stoneCount = Math.min(8, Math.floor(levelIndex / 4))
    const placed = new Set<string>()
    initialObstacles.forEach((o) => placed.add(`${o.row}-${o.col}`))

    // Frozen gems cannot be swapped, so ice cells must not touch each other (a line made only of
    // frozen gems could never be built by the player).
    const iceCells = new Set<string>()
    const touchesIce = (r: number, c: number) =>
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dr, dc]) => iceCells.has(`${r + dr}-${c + dc}`))

    let addedIce = 0
    let doubleCount = 0
    let attempts = 0
    while (addedIce < iceCount && attempts++ < 600) {
      const r = Math.floor(rand() * rows)
      const c = Math.floor(rand() * cols)
      const key = `${r}-${c}`
      if (!placed.has(key) && !touchesIce(r, c)) {
        placed.add(key)
        iceCells.add(key)
        const isDouble = levelIndex >= 10 && rand() > (levelIndex >= 30 ? 0.6 : 0.75)
        initialObstacles.push({ row: r, col: c, obstacle: isDouble ? 'double-ice' : 'ice' })
        if (isDouble) doubleCount++
        addedIce++
      }
    }

    let addedStones = 0
    while (addedStones < stoneCount && placed.size < 50) {
      const r = Math.floor(rand() * (rows - 2)) + 1
      const c = Math.floor(rand() * (cols - 2)) + 1
      const key = `${r}-${c}`
      if (!placed.has(key)) {
        placed.add(key)
        initialObstacles.push({ row: r, col: c, obstacle: 'stone' })
        addedStones++
      }
    }

    // Ice-heavy boards spend moves on cells that are hard to reach (double ice needs two hits),
    // so they get a few extra moves and a lower points bar. Keeps a level's total work fair.
    maxMoves = Math.min(32, maxMoves + Math.floor(addedIce / 8) + Math.floor(doubleCount / 5))
    targetScore = Math.round((targetScore * (1 - Math.min(0.2, doubleCount * 0.02))) / 10) * 10

    const primaryGem = gemColors[Math.floor(rand() * gemColors.length)]
    if (addedIce > 0) {
      // Not every ice cell is required: frozen gems can't be swapped, so leftovers in awkward spots
      // would otherwise decide the level by luck.
      goals.push({ type: 'ice', target: Math.min(14, Math.ceil(addedIce * 0.65)), current: 0 })
    } else {
      goals.push({ type: 'gems', target: 12 + Math.floor(levelIndex * 0.7), current: 0, gemType: primaryGem })
    }
    goals.push({ type: 'score', target: targetScore, current: 0 })
  }

  const star1 = targetScore
  const star2 = Math.round(targetScore * 1.3)
  const star3 = Math.round(targetScore * 1.65)

  return {
    level: levelIndex,
    rows,
    cols,
    maxMoves,
    gemColors,
    goals,
    starThresholds: [star1, star2, star3],
    seed: levelIndex * 7919 + 17,
    initialObstacles,
  }
}

// Generate the starting board: no existing matches, at least one valid move.
// Seeded, so a level always starts the same way (restarts replay the same puzzle).
export function createInitialBoard(config: LevelConfig, rand?: () => number): Tile[][] {
  const { rows, cols, gemColors, initialObstacles } = config
  const random = rand ?? createPRNG(config.seed ?? Math.floor(Math.random() * 2147483646) + 1)
  const obstacleMap = new Map<string, ObstacleType>()
  initialObstacles?.forEach((o) => obstacleMap.set(`${o.row}-${o.col}`, o.obstacle))

  const board: Tile[][] = []
  for (let r = 0; r < rows; r++) {
    const row: Tile[] = []
    for (let c = 0; c < cols; c++) {
      row.push({
        id: newGemId('g'),
        row: r,
        col: c,
        gem: null,
        special: 'none',
        obstacle: obstacleMap.get(`${r}-${c}`) || 'none',
      })
    }
    board.push(row)
  }

  for (let attempt = 0; attempt < 200; attempt++) {
    fillWithoutMatches(board, gemColors, random)
    if (findValidMoves(board).length > 0) break
  }
  return board
}

// Hint / bot helpers (real moves only: a swap must create a match or fire a special combo).
export function findFirstValidMove(board: Tile[][]): { r1: number; c1: number; r2: number; c2: number } | null {
  return findValidMoves(board)[0]?.move ?? null
}

export function hasPossibleMoves(board: Tile[][]): boolean {
  return findValidMoves(board).length > 0
}
