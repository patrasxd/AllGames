import type { BattleshipDifficulty, CellState } from './types'

export function getAIMove(
  grid: CellState[][],
  difficulty: BattleshipDifficulty
): [number, number] {
  const unrevealed: [number, number][] = []
  const activeHits: [number, number][] = []

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = grid[r][c]
      if (cell === 'empty' || cell === 'ship') {
        unrevealed.push([r, c])
      } else if (cell === 'hit') {
        activeHits.push([r, c])
      }
    }
  }

  if (unrevealed.length === 0) return [0, 0]

  if (difficulty === 'easy' || activeHits.length === 0) {
    // Check parity for Hard difficulty
    if (difficulty === 'hard') {
      const parityCells = unrevealed.filter(([r, c]) => (r + c) % 2 === 0)
      if (parityCells.length > 0) {
        return parityCells[Math.floor(Math.random() * parityCells.length)]
      }
    }
    return unrevealed[Math.floor(Math.random() * unrevealed.length)]
  }

  // Target Mode (Medium & Hard): We have unsunk hits!
  if (activeHits.length >= 2 && difficulty === 'hard') {
    // Check if hits are aligned in a line
    const isHorizontal = activeHits.every(([r]) => r === activeHits[0][0])
    const isVertical = activeHits.every(([, c]) => c === activeHits[0][1])

    if (isHorizontal) {
      const row = activeHits[0][0]
      const cols = activeHits.map(([, c]) => c).sort((a, b) => a - b)
      const minCol = cols[0]
      const maxCol = cols[cols.length - 1]

      const candidates: [number, number][] = []
      if (minCol > 0 && (grid[row][minCol - 1] === 'empty' || grid[row][minCol - 1] === 'ship')) {
        candidates.push([row, minCol - 1])
      }
      if (maxCol < 9 && (grid[row][maxCol + 1] === 'empty' || grid[row][maxCol + 1] === 'ship')) {
        candidates.push([row, maxCol + 1])
      }

      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)]
      }
    } else if (isVertical) {
      const col = activeHits[0][1]
      const rows = activeHits.map(([r]) => r).sort((a, b) => a - b)
      const minRow = rows[0]
      const maxRow = rows[rows.length - 1]

      const candidates: [number, number][] = []
      if (minRow > 0 && (grid[minRow - 1][col] === 'empty' || grid[minRow - 1][col] === 'ship')) {
        candidates.push([minRow - 1, col])
      }
      if (maxRow < 9 && (grid[maxRow + 1][col] === 'empty' || grid[maxRow + 1][col] === 'ship')) {
        candidates.push([maxRow + 1, col])
      }

      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)]
      }
    }
  }

  // Standard Target Mode: Adjacent neighbors of any hit
  const adjacentCandidates: [number, number][] = []
  const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  for (const [hr, hc] of activeHits) {
    for (const [dr, dc] of deltas) {
      const nr = hr + dr
      const nc = hc + dc
      if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
        if (grid[nr][nc] === 'empty' || grid[nr][nc] === 'ship') {
          if (!adjacentCandidates.some(([cr, cc]) => cr === nr && cc === nc)) {
            adjacentCandidates.push([nr, nc])
          }
        }
      }
    }
  }

  if (adjacentCandidates.length > 0) {
    return adjacentCandidates[Math.floor(Math.random() * adjacentCandidates.length)]
  }

  return unrevealed[Math.floor(Math.random() * unrevealed.length)]
}
