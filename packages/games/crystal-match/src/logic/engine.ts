import type { GemType, SpecialType, Tile, LevelConfig, ObstacleType } from '../types'

export interface MatchResult {
  matchedCoords: { row: number; col: number }[]
  specialSpawns: { row: number; col: number; special: SpecialType; gem: GemType }[]
  clearedObstacles: { row: number; col: number }[]
  gemsClearedByType: Record<GemType, number>
  totalGemsCleared: number
  scoreEarned: number
}

export function findMatches(board: Tile[][]): MatchResult {
  const rows = board.length
  const cols = board[0].length

  const horizontalMatches: { row: number; cols: number[]; gem: GemType }[] = []
  const verticalMatches: { col: number; rows: number[]; gem: GemType }[] = []

  // Check horizontal
  for (let r = 0; r < rows; r++) {
    let matchLen = 1
    for (let c = 0; c < cols; c++) {
      const current = board[r][c].gem
      const next = c + 1 < cols ? board[r][c + 1].gem : null

      if (current && next && current === next) {
        matchLen++
      } else {
        if (matchLen >= 3 && current) {
          const colIndices: number[] = []
          for (let i = c - matchLen + 1; i <= c; i++) {
            colIndices.push(i)
          }
          horizontalMatches.push({ row: r, cols: colIndices, gem: current })
        }
        matchLen = 1
      }
    }
  }

  // Check vertical
  for (let c = 0; c < cols; c++) {
    let matchLen = 1
    for (let r = 0; r < rows; r++) {
      const current = board[r][c].gem
      const next = r + 1 < rows ? board[r + 1][c].gem : null

      if (current && next && current === next) {
        matchLen++
      } else {
        if (matchLen >= 3 && current) {
          const rowIndices: number[] = []
          for (let i = r - matchLen + 1; i <= r; i++) {
            rowIndices.push(i)
          }
          verticalMatches.push({ col: c, rows: rowIndices, gem: current })
        }
        matchLen = 1
      }
    }
  }

  const matchedSet = new Set<string>()
  const specialSpawns: { row: number; col: number; special: SpecialType; gem: GemType }[] = []
  const gemsClearedByType: Record<GemType, number> = {
    ruby: 0,
    sapphire: 0,
    emerald: 0,
    topaz: 0,
    amethyst: 0,
    amber: 0,
  }

  // Detect T / L shapes (intersection between H and V of same color)
  for (const h of horizontalMatches) {
    for (const v of verticalMatches) {
      if (h.gem === v.gem && h.cols.includes(v.col) && v.rows.includes(h.row)) {
        // Intersection point
        specialSpawns.push({ row: h.row, col: v.col, special: 'bomb', gem: h.gem })
      }
    }
  }

  // Detect Match-5 (Prism) and Match-4 (Line)
  for (const h of horizontalMatches) {
    h.cols.forEach(c => matchedSet.add(`${h.row}-${c}`))
    if (h.cols.length >= 5) {
      const midCol = h.cols[Math.floor(h.cols.length / 2)]
      specialSpawns.push({ row: h.row, col: midCol, special: 'prism', gem: h.gem })
    } else if (h.cols.length === 4) {
      const midCol = h.cols[1]
      specialSpawns.push({ row: h.row, col: midCol, special: 'line-v', gem: h.gem })
    }
  }

  for (const v of verticalMatches) {
    v.rows.forEach(r => matchedSet.add(`${r}-${v.col}`))
    if (v.rows.length >= 5) {
      const midRow = v.rows[Math.floor(v.rows.length / 2)]
      specialSpawns.push({ row: midRow, col: v.col, special: 'prism', gem: v.gem })
    } else if (v.rows.length === 4) {
      const midRow = v.rows[1]
      specialSpawns.push({ row: midRow, col: v.col, special: 'line-h', gem: v.gem })
    }
  }

  // Special tile activations
  const matchedCoords: { row: number; col: number }[] = []
  const clearedObstaclesSet = new Set<string>()

  matchedSet.forEach(coord => {
    const [r, c] = coord.split('-').map(Number)
    matchedCoords.push({ row: r, col: c })
    const tile = board[r][c]
    if (tile.gem) {
      gemsClearedByType[tile.gem] = (gemsClearedByType[tile.gem] || 0) + 1
    }

    // Direct obstacle on matched tile
    if (tile.obstacle === 'ice' || tile.obstacle === 'double-ice') {
      clearedObstaclesSet.add(`${r}-${c}`)
    }

    // Adjacent obstacles (ice, double-ice, stones)
    const neighbors = [
      { r: r - 1, c },
      { r: r + 1, c },
      { r, c: c - 1 },
      { r, c: c + 1 },
    ]
    neighbors.forEach(n => {
      if (n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols) {
        const neighborTile = board[n.r][n.c]
        if (
          neighborTile.obstacle === 'ice' ||
          neighborTile.obstacle === 'double-ice' ||
          neighborTile.obstacle === 'stone'
        ) {
          clearedObstaclesSet.add(`${n.r}-${n.c}`)
        }
      }
    })
  })

  // Handle special gem explosions if triggered
  const expandedMatched = new Set<string>(matchedSet)
  matchedCoords.forEach(({ row: r, col: c }) => {
    const tile = board[r][c]
    if (tile.special === 'line-h') {
      for (let col = 0; col < cols; col++) {
        if (board[r][col].obstacle !== 'empty') {
          expandedMatched.add(`${r}-${col}`)
        }
      }
    } else if (tile.special === 'line-v') {
      for (let row = 0; row < rows; row++) {
        if (board[row][c].obstacle !== 'empty') {
          expandedMatched.add(`${row}-${c}`)
        }
      }
    } else if (tile.special === 'bomb') {
      for (let row = Math.max(0, r - 1); row <= Math.min(rows - 1, r + 1); row++) {
        for (let col = Math.max(0, c - 1); col <= Math.min(cols - 1, c + 1); col++) {
          if (board[row][col].obstacle !== 'empty') {
            expandedMatched.add(`${row}-${col}`)
          }
        }
      }
    }
  })

  const finalCoords: { row: number; col: number }[] = []
  expandedMatched.forEach(coord => {
    const [r, c] = coord.split('-').map(Number)
    if (board[r][c].obstacle !== 'empty') {
      finalCoords.push({ row: r, col: c })
    }
  })

  const clearedObstacles: { row: number; col: number }[] = []
  clearedObstaclesSet.forEach(coord => {
    const [r, c] = coord.split('-').map(Number)
    clearedObstacles.push({ row: r, col: c })
  })

  const totalGemsCleared = finalCoords.length
  const scoreEarned = totalGemsCleared * 30 + (specialSpawns.length > 0 ? 80 : 0)

  return {
    matchedCoords: finalCoords,
    specialSpawns,
    clearedObstacles,
    gemsClearedByType,
    totalGemsCleared,
    scoreEarned,
  }
}

// Special swap combinations (e.g. Prism + Gem, Bomb + Bomb)
export function handleSpecialCombination(
  board: Tile[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number
): { matchedCoords: { row: number; col: number }[]; score: number } | null {
  const t1 = board[r1][c1]
  const t2 = board[r2][c2]
  const rows = board.length
  const cols = board[0].length

  const matchedSet = new Set<string>()

  // Prism + Prism = Clear entire board
  if (t1.special === 'prism' && t2.special === 'prism') {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        matchedSet.add(`${r}-${c}`)
      }
    }
    return {
      matchedCoords: Array.from(matchedSet).map(s => {
        const [r, c] = s.split('-').map(Number)
        return { row: r, col: c }
      }),
      score: rows * cols * 100,
    }
  }

  // Prism + Normal Gem = Clear all gems of that color
  if (t1.special === 'prism' || t2.special === 'prism') {
    const targetGem = t1.special === 'prism' ? t2.gem : t1.gem
    matchedSet.add(`${r1}-${c1}`)
    matchedSet.add(`${r2}-${c2}`)
    if (targetGem) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c].gem === targetGem) {
            matchedSet.add(`${r}-${c}`)
          }
        }
      }
    }
    return {
      matchedCoords: Array.from(matchedSet).map(s => {
        const [r, c] = s.split('-').map(Number)
        return { row: r, col: c }
      }),
      score: matchedSet.size * 80,
    }
  }

  // Bomb + Bomb = 5x5 explosion
  if (t1.special === 'bomb' && t2.special === 'bomb') {
    for (let r = Math.max(0, r1 - 2); r <= Math.min(rows - 1, r1 + 2); r++) {
      for (let c = Math.max(0, c1 - 2); c <= Math.min(cols - 1, c1 + 2); c++) {
        matchedSet.add(`${r}-${c}`)
      }
    }
    return {
      matchedCoords: Array.from(matchedSet).map(s => {
        const [r, c] = s.split('-').map(Number)
        return { row: r, col: c }
      }),
      score: matchedSet.size * 90,
    }
  }

  return null
}

// Apply gravity and refill empty tiles from top
export function applyGravityAndRefill(
  board: Tile[][],
  config: LevelConfig,
  specialSpawns: { row: number; col: number; special: SpecialType; gem: GemType }[] = []
): { nextBoard: Tile[][]; newTileCount: number } {
  const rows = board.length
  const cols = board[0].length
  const { gemColors } = config

  // Create deep copy
  const nextBoard: Tile[][] = board.map(row => row.map(tile => ({ ...tile })))

  // Apply special spawns first before drop
  specialSpawns.forEach(spawn => {
    if (spawn.row >= 0 && spawn.row < rows && spawn.col >= 0 && spawn.col < cols) {
      nextBoard[spawn.row][spawn.col].gem = spawn.gem
      nextBoard[spawn.row][spawn.col].special = spawn.special
    }
  })

  let newTileCount = 0

  // Column by column gravity
  for (let c = 0; c < cols; c++) {
    // Collect non-empty gems from bottom to top
    const gemsInCol: { gem: GemType; special: SpecialType }[] = []
    for (let r = rows - 1; r >= 0; r--) {
      if (nextBoard[r][c].gem !== null) {
        gemsInCol.push({
          gem: nextBoard[r][c].gem!,
          special: nextBoard[r][c].special,
        })
      }
    }

    // Write back gems from bottom to top
    let gemIdx = 0
    for (let r = rows - 1; r >= 0; r--) {
      if (gemIdx < gemsInCol.length) {
        nextBoard[r][c].gem = gemsInCol[gemIdx].gem
        nextBoard[r][c].special = gemsInCol[gemIdx].special
        gemIdx++
      } else {
        // Refill from top with new random gem
        const newGem = gemColors[Math.floor(Math.random() * gemColors.length)]
        nextBoard[r][c].gem = newGem
        nextBoard[r][c].special = 'none'
        nextBoard[r][c].id = `tile-${r}-${c}-${Math.random().toString(36).substring(2, 7)}`
        newTileCount++
      }
    }
  }

  return { nextBoard, newTileCount }
}

// Reshuffle all tiles on the board if no valid moves exist
export function reshuffleBoard(board: Tile[][], config: LevelConfig): Tile[][] {
  const rows = board.length
  const cols = board[0].length

  const allGems: { gem: GemType; special: SpecialType }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].gem) {
        allGems.push({ gem: board[r][c].gem!, special: board[r][c].special })
      }
    }
  }

  // Shuffle array
  for (let i = allGems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allGems[i], allGems[j]] = [allGems[j], allGems[i]]
  }

  const nextBoard: Tile[][] = board.map(row => row.map(tile => ({ ...tile })))
  let idx = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx < allGems.length) {
        nextBoard[r][c].gem = allGems[idx].gem
        nextBoard[r][c].special = allGems[idx].special
        idx++
      }
    }
  }

  return nextBoard
}
