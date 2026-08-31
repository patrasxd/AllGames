import type { ShipDef, PlacedShip, Orientation, CellState, PlayerGridState } from './types'

export const STANDARD_FLEET: ShipDef[] = [
  { id: 'ship-4-1', name: 'battleship', size: 4 },
  { id: 'ship-3-1', name: 'cruiser', size: 3 },
  { id: 'ship-3-2', name: 'cruiser', size: 3 },
  { id: 'ship-2-1', name: 'destroyer', size: 2 },
  { id: 'ship-2-2', name: 'destroyer', size: 2 },
  { id: 'ship-2-3', name: 'destroyer', size: 2 },
  { id: 'ship-1-1', name: 'patrol', size: 1 },
  { id: 'ship-1-2', name: 'patrol', size: 1 },
  { id: 'ship-1-3', name: 'patrol', size: 1 },
  { id: 'ship-1-4', name: 'patrol', size: 1 },
]

export function createEmptyGrid(): CellState[][] {
  return Array.from({ length: 10 }, () => Array(10).fill('empty'))
}

export function canPlaceShip(
  grid: CellState[][],
  row: number,
  col: number,
  size: number,
  orientation: Orientation
): boolean {
  for (let i = 0; i < size; i++) {
    const r = orientation === 'horizontal' ? row : row + i
    const c = orientation === 'horizontal' ? col + i : col

    if (r < 0 || r >= 10 || c < 0 || c >= 10) return false

    // Check surrounding 3x3 buffer (including diagonals)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
          if (grid[nr][nc] === 'ship') return false
        }
      }
    }
  }

  return true
}

export function autoPlaceFleet(): { ships: PlacedShip[]; grid: CellState[][] } {
  let success = false
  let ships: PlacedShip[] = []
  let grid: CellState[][] = createEmptyGrid()

  while (!success) {
    grid = createEmptyGrid()
    ships = []
    let placedAll = true

    for (const def of STANDARD_FLEET) {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 150) {
        attempts++
        const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical'
        const r = Math.floor(Math.random() * 10)
        const c = Math.floor(Math.random() * 10)

        if (canPlaceShip(grid, r, c, def.size, orientation)) {
          const coords: [number, number][] = []
          for (let i = 0; i < def.size; i++) {
            const cr = orientation === 'horizontal' ? r : r + i
            const cc = orientation === 'horizontal' ? c + i : c
            grid[cr][cc] = 'ship'
            coords.push([cr, cc])
          }

          ships.push({
            id: def.id,
            name: def.name,
            size: def.size,
            row: r,
            col: c,
            orientation,
            hits: 0,
            isSunk: false,
            coords,
          })
          placed = true
        }
      }

      if (!placed) {
        placedAll = false
        break
      }
    }

    if (placedAll) {
      success = true
    }
  }

  return { ships, grid }
}

export interface ShotResult {
  hit: boolean
  sunk: boolean
  sunkShip: PlacedShip | null
  nextState: PlayerGridState
}

export function processShot(
  state: PlayerGridState,
  row: number,
  col: number
): ShotResult {
  const currentCell = state.grid[row][col]
  if (currentCell === 'hit' || currentCell === 'miss' || currentCell === 'sunk') {
    return { hit: false, sunk: false, sunkShip: null, nextState: state }
  }

  const nextGrid = state.grid.map(r => [...r])
  let hit = false
  let sunk = false
  let sunkShip: PlacedShip | null = null

  const nextShips = state.ships.map(ship => {
    const isCoordinate = ship.coords.some(([r, c]) => r === row && c === col)
    if (isCoordinate) {
      hit = true
      const nextHits = ship.hits + 1
      const isNowSunk = nextHits >= ship.size
      if (isNowSunk) {
        sunk = true
        sunkShip = { ...ship, hits: nextHits, isSunk: true }
      }
      return { ...ship, hits: nextHits, isSunk: isNowSunk }
    }
    return ship
  })

  if (hit) {
    nextGrid[row][col] = 'hit'

    if (sunk && sunkShip) {
      // Mark all coordinates of sunk ship as 'sunk'
      for (const [sr, sc] of (sunkShip as PlacedShip).coords) {
        nextGrid[sr][sc] = 'sunk'
      }

      // Mark surrounding buffer around sunk ship as 'miss'
      for (const [sr, sc] of (sunkShip as PlacedShip).coords) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = sr + dr
            const nc = sc + dc
            if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
              if (nextGrid[nr][nc] === 'empty') {
                nextGrid[nr][nc] = 'miss'
              }
            }
          }
        }
      }
    }
  } else {
    nextGrid[row][col] = 'miss'
  }

  return {
    hit,
    sunk,
    sunkShip,
    nextState: {
      ships: nextShips,
      grid: nextGrid,
      shotsReceived: state.shotsReceived + 1,
    },
  }
}
