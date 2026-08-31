import type { GridSize, TileData, Direction } from './types'

let nextTileId = 1

export function generateTileId(): string {
  return `tile-${nextTileId++}`
}

export function createInitialTiles(size: GridSize): TileData[] {
  const t1 = createRandomTile([], size)
  const t2 = createRandomTile(t1 ? [t1] : [], size)
  return [t1, t2].filter(Boolean) as TileData[]
}

export function getEmptyPositions(tiles: TileData[], size: GridSize): [number, number][] {
  const occupied = new Set(tiles.map(t => `${t.row},${t.col}`))
  const empty: [number, number][] = []

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!occupied.has(`${r},${c}`)) {
        empty.push([r, c])
      }
    }
  }

  return empty
}

export function createRandomTile(existingTiles: TileData[], size: GridSize): TileData | null {
  const empty = getEmptyPositions(existingTiles, size)
  if (empty.length === 0) return null

  const [row, col] = empty[Math.floor(Math.random() * empty.length)]
  const value = Math.random() < 0.9 ? 2 : 4

  return {
    id: generateTileId(),
    value,
    row,
    col,
    isNew: true,
  }
}

interface MoveResult {
  tiles: TileData[]
  scoreGained: number
  moved: boolean
}

export function moveTiles(tiles: TileData[], direction: Direction, size: GridSize): MoveResult {
  // Build a 2D grid matrix of current tiles
  const grid: (TileData | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  )

  for (const t of tiles) {
    grid[t.row][t.col] = { ...t, isNew: false, mergedInto: undefined }
  }

  let scoreGained = 0
  let moved = false
  const updatedTiles: TileData[] = []

  const isHorizontal = direction === 'left' || direction === 'right'
  const isForward = direction === 'right' || direction === 'down'

  for (let i = 0; i < size; i++) {
    // Extract current line
    const line: (TileData | null)[] = []
    for (let j = 0; j < size; j++) {
      const r = isHorizontal ? i : j
      const c = isHorizontal ? j : i
      line.push(grid[r][c])
    }

    if (isForward) {
      line.reverse()
    }

    // Filter non-null tiles
    const nonNull = line.filter(Boolean) as TileData[]
    const mergedLine: TileData[] = []

    let skip = false
    for (let k = 0; k < nonNull.length; k++) {
      if (skip) {
        skip = false
        continue
      }

      const current = nonNull[k]
      const next = nonNull[k + 1]

      if (next && current.value === next.value) {
        // Merge tiles
        const mergedValue = current.value * 2
        scoreGained += mergedValue
        mergedLine.push({
          id: generateTileId(),
          value: mergedValue,
          row: 0,
          col: 0,
        })
        skip = true
      } else {
        mergedLine.push(current)
      }
    }

    // Assign new coordinates in line
    for (let pos = 0; pos < size; pos++) {
      const newTile = mergedLine[pos] ?? null
      const actualPos = isForward ? size - 1 - pos : pos
      const r = isHorizontal ? i : actualPos
      const c = isHorizontal ? actualPos : i

      const originalTile = isHorizontal ? grid[i][actualPos] : grid[actualPos][i]

      if (newTile) {
        if (newTile.row !== r || newTile.col !== c || (originalTile && originalTile.value !== newTile.value)) {
          moved = true
        }
        updatedTiles.push({
          ...newTile,
          row: r,
          col: c,
        })
      } else if (originalTile !== null) {
        moved = true
      }
    }
  }

  return {
    tiles: updatedTiles,
    scoreGained,
    moved,
  }
}

export function hasMovesAvailable(tiles: TileData[], size: GridSize): boolean {
  if (tiles.length < size * size) return true

  const grid: (number | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  )

  for (const t of tiles) {
    grid[t.row][t.col] = t.value
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r][c]
      if (val === null) return true

      // Check right neighbor
      if (c + 1 < size && grid[r][c + 1] === val) return true
      // Check down neighbor
      if (r + 1 < size && grid[r + 1][c] === val) return true
    }
  }

  return false
}

export function hasReached2048(tiles: TileData[]): boolean {
  return tiles.some(t => t.value >= 2048)
}
