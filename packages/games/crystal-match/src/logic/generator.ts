import type { GemType, LevelConfig, LevelGoal, ObstacleType, Tile } from '../types'

const ALL_GEMS: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'amber']

// Seeded PRNG for deterministic level generation
function createPRNG(seed: number) {
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

  let maxMoves = Math.max(18, Math.min(30, 26 - Math.floor(levelIndex / 8) + Math.floor(rand() * 4)))
  let targetScore = 2000 + levelIndex * 450

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
    targetScore = 2400
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
    maxMoves = 20
    targetScore = 2500
    // 8 Ice tiles in the middle
    for (let r = 2; r <= 5; r++) {
      for (let c = 3; c <= 4; c++) {
        initialObstacles.push({ row: r, col: c, obstacle: 'ice' })
      }
    }
    goals.push({ type: 'ice', target: 8, current: 0 })
    goals.push({ type: 'gems', target: 15, current: 0, gemType: 'ruby' })
  } else if (levelIndex === 4) {
    // Level 4: Introduction to Stone Walls
    maxMoves = 22
    targetScore = 2800
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
    }

    // Place Ice & Stones
    const iceCount = Math.min(24, 6 + Math.floor(levelIndex * 0.9))
    const stoneCount = Math.min(6, Math.floor(levelIndex / 4))
    const placed = new Set<string>()
    initialObstacles.forEach(o => placed.add(`${o.row}-${o.col}`))

    let addedIce = 0
    while (addedIce < iceCount && placed.size < 50) {
      const r = Math.floor(rand() * rows)
      const c = Math.floor(rand() * cols)
      const key = `${r}-${c}`
      if (!placed.has(key)) {
        placed.add(key)
        const isDouble = levelIndex >= 10 && rand() > 0.5
        initialObstacles.push({ row: r, col: c, obstacle: isDouble ? 'double-ice' : 'ice' })
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

    const primaryGem = gemColors[Math.floor(rand() * gemColors.length)]
    if (addedIce > 0) {
      goals.push({ type: 'ice', target: addedIce, current: 0 })
    }
    goals.push({ type: 'gems', target: 15 + Math.floor(levelIndex * 0.8), current: 0, gemType: primaryGem })
    goals.push({ type: 'score', target: targetScore, current: 0 })
  }

  const star1 = targetScore
  const star2 = Math.round(targetScore * 1.5)
  const star3 = Math.round(targetScore * 2.1)

  return {
    level: levelIndex,
    rows,
    cols,
    maxMoves,
    gemColors,
    goals,
    starThresholds: [star1, star2, star3],
    initialObstacles,
  }
}

// Generate an initial board with NO existing matches and at least 2 valid moves
export function createInitialBoard(config: LevelConfig): Tile[][] {
  const { rows, cols, gemColors, initialObstacles } = config
  const obstacleMap = new Map<string, ObstacleType>()
  initialObstacles?.forEach(o => obstacleMap.set(`${o.row}-${o.col}`, o.obstacle))

  let board: Tile[][] = []
  let attempts = 0

  do {
    board = []
    for (let r = 0; r < rows; r++) {
      const row: Tile[] = []
      for (let c = 0; c < cols; c++) {
        const forbidden: GemType[] = []
        // Avoid 3 horizontal
        if (c >= 2 && row[c - 1].gem && row[c - 2].gem && row[c - 1].gem === row[c - 2].gem) {
          forbidden.push(row[c - 1].gem!)
        }
        // Avoid 3 vertical
        if (r >= 2 && board[r - 1][c].gem && board[r - 2][c].gem && board[r - 1][c].gem === board[r - 2][c].gem) {
          forbidden.push(board[r - 1][c].gem!)
        }

        const validGems = gemColors.filter(g => !forbidden.includes(g))
        const gem = validGems.length > 0
          ? validGems[Math.floor(Math.random() * validGems.length)]
          : gemColors[Math.floor(Math.random() * gemColors.length)]

        const obstacle = obstacleMap.get(`${r}-${c}`) || 'none'
        const isSolidOrEmpty = obstacle === 'empty' || obstacle === 'stone'

        row.push({
          id: `tile-${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
          row: r,
          col: c,
          gem: isSolidOrEmpty ? null : gem,
          special: 'none',
          obstacle,
        })
      }
      board.push(row)
    }
    attempts++
  } while (attempts < 15 && !hasPossibleMoves(board));

  return board
}

// Find first valid move on the board for hints / tutorial
export function findFirstValidMove(board: Tile[][]): { r1: number; c1: number; r2: number; c2: number } | null {
  const rows = board.length
  const cols = board[0].length

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const current = board[r][c]
      if (!current.gem || current.obstacle === 'stone' || current.obstacle === 'empty') continue

      if (current.special === 'prism') {
        if (c + 1 < cols && board[r][c + 1].gem) return { r1: r, c1: c, r2: r, c2: c + 1 }
        if (r + 1 < rows && board[r + 1][c].gem) return { r1: r, c1: c, r2: r + 1, c2: c }
      }

      if (c + 1 < cols && checkSwapProducesMatch(board, r, c, r, c + 1)) {
        return { r1: r, c1: c, r2: r, c2: c + 1 }
      }
      if (r + 1 < rows && checkSwapProducesMatch(board, r, c, r + 1, c)) {
        return { r1: r, c1: c, r2: r + 1, c2: c }
      }
    }
  }
  return null
}

// Check if any valid match-3 move exists on the board
export function hasPossibleMoves(board: Tile[][]): boolean {
  return findFirstValidMove(board) !== null
}

function checkSwapProducesMatch(
  board: Tile[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number
): boolean {
  const g1 = board[r1][c1].gem
  const g2 = board[r2][c2].gem
  if (!g1 || !g2 || g1 === g2) return false

  // Either tile is special
  if (board[r1][c1].special !== 'none' || board[r2][c2].special !== 'none') {
    return true
  }

  // Check matches at (r1, c1) with g2
  if (isMatchAt(board, r1, c1, g2, r2, c2)) return true
  // Check matches at (r2, c2) with g1
  if (isMatchAt(board, r2, c2, g1, r1, c1)) return true

  return false
}

function isMatchAt(
  board: Tile[][],
  r: number,
  c: number,
  gem: GemType,
  ignoreR: number,
  ignoreC: number
): boolean {
  const rows = board.length
  const cols = board[0].length

  const getGem = (row: number, col: number): GemType | null => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return null
    if (row === ignoreR && col === ignoreC) return null
    if (row === r && col === c) return gem
    return board[row][col].gem
  }

  // Horizontal count
  let hCount = 1
  let col = c - 1
  while (getGem(r, col) === gem) { hCount++; col--; }
  col = c + 1
  while (getGem(r, col) === gem) { hCount++; col++; }
  if (hCount >= 3) return true

  // Vertical count
  let vCount = 1
  let row = r - 1
  while (getGem(row, c) === gem) { vCount++; row--; }
  row = r + 1
  while (getGem(row, c) === gem) { vCount++; row++; }
  if (vCount >= 3) return true

  return false
}
