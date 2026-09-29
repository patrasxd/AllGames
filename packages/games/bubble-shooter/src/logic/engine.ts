import type { BubbleColor, Cell, Grid, ShotBubble, Difficulty, DifficultyConfig, PopResult } from '../types'

export const RADIUS = 16
export const COLS = 10
export const ROWS = 20
/** Row index at (or beyond) which a settled bubble ends the game. */
export const DANGER_ROW = 15

export const VIRTUAL_WIDTH = 2 * COLS * RADIUS
export const VIRTUAL_HEIGHT = 530
export const SHOOTER_Y = VIRTUAL_HEIGHT - 34
export const ROW_HEIGHT = RADIUS * Math.sqrt(3)

/** Aim angle is measured from straight up; the shooter cannot point sideways or down. */
export const MAX_AIM_ANGLE = (72 * Math.PI) / 180

export function clampAngle(angle: number): number {
  return Math.min(MAX_AIM_ANGLE, Math.max(-MAX_AIM_ANGLE, angle))
}

/** Aim angle (from straight up) for a pointer position in virtual canvas coordinates. */
export function aimAngleFromPoint(x: number, y: number): number {
  const dx = x - VIRTUAL_WIDTH / 2
  const dy = SHOOTER_Y - y
  return clampAngle(Math.atan2(dx, Math.max(1, dy)))
}

export const PALETTE: BubbleColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']

export const POINTS_PER_MATCHED_BUBBLE = 10
export const POINTS_PER_FLOATING_BUBBLE = 15

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { initialRows: 4, colorCount: 4, shotsPerNewRow: 8, shotSpeed: 9.5 },
  normal: { initialRows: 5, colorCount: 5, shotsPerNewRow: 6, shotSpeed: 10.5 },
  hard: { initialRows: 6, colorCount: 6, shotsPerNewRow: 5, shotSpeed: 11.5 },
}

/**
 * Rows alternate between "flush" and "offset" (shifted half a bubble right, one column shorter).
 * `parity` says which kind row 0 is; inserting a row at the top flips it, so every existing
 * bubble keeps its exact screen position and neighbours.
 */
export function isOffsetRow(row: number, parity = 0): boolean {
  return (row + parity) % 2 === 1
}

/** Whether (row, col) is a real slot in the hex grid — offset rows have one fewer column. */
export function cellExists(row: number, col: number, parity = 0): boolean {
  if (row < 0 || row >= ROWS || col < 0) return false
  return isOffsetRow(row, parity) ? col < COLS - 1 : col < COLS
}

export function cellX(row: number, col: number, parity = 0): number {
  return RADIUS + col * 2 * RADIUS + (isOffsetRow(row, parity) ? RADIUS : 0)
}

export function cellY(row: number): number {
  return RADIUS + row * ROW_HEIGHT
}

export function createEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice())
}

function key(row: number, col: number): string {
  return `${row},${col}`
}

/** Neighbor offsets for a hex grid laid out with alternating-offset ("odd-r") rows. */
export function getNeighbors(row: number, col: number, parity = 0): [number, number][] {
  const evenRowOffsets: [number, number][] = [
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 0],
    [1, -1],
    [1, 0],
  ]
  const oddRowOffsets: [number, number][] = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [-1, 1],
    [1, 0],
    [1, 1],
  ]
  const offsets = isOffsetRow(row, parity) ? oddRowOffsets : evenRowOffsets
  return offsets.map(([dr, dc]): [number, number] => [row + dr, col + dc]).filter(([r, c]) => cellExists(r, c, parity))
}

export function randomColor(active: BubbleColor[]): BubbleColor {
  return active[Math.floor(Math.random() * active.length)]
}

export function generateInitialGrid(initialRows: number, colorCount: number): Grid {
  const grid = createEmptyGrid()
  const colors = PALETTE.slice(0, colorCount)
  for (let row = 0; row < initialRows; row++) {
    for (let col = 0; col < COLS; col++) {
      if (cellExists(row, col)) {
        grid[row][col] = randomColor(colors)
      }
    }
  }
  return grid
}

export function activeColors(grid: Grid): BubbleColor[] {
  const found = new Set<BubbleColor>()
  for (const row of grid) {
    for (const cell of row) {
      if (cell) found.add(cell)
    }
  }
  return found.size > 0 ? Array.from(found) : PALETTE.slice(0, 3)
}

/** BFS over same-colored, orthogonally-connected bubbles starting at (row, col). */
export function findConnectedGroup(grid: Grid, row: number, col: number, parity = 0): Set<string> {
  const color = grid[row]?.[col]
  const visited = new Set<string>()
  if (!color) return visited

  const queue: [number, number][] = [[row, col]]
  visited.add(key(row, col))

  while (queue.length > 0) {
    const [r, c] = queue.shift()!
    for (const [nr, nc] of getNeighbors(r, c, parity)) {
      const k = key(nr, nc)
      if (visited.has(k)) continue
      if (grid[nr][nc] === color) {
        visited.add(k)
        queue.push([nr, nc])
      }
    }
  }
  return visited
}

/** Any filled bubble not connected — directly or through a chain of neighbors — to the ceiling row. */
export function findFloatingCells(grid: Grid, parity = 0): Set<string> {
  const anchored = new Set<string>()
  const queue: [number, number][] = []

  for (let col = 0; col < COLS; col++) {
    if (grid[0][col]) {
      queue.push([0, col])
      anchored.add(key(0, col))
    }
  }

  while (queue.length > 0) {
    const [r, c] = queue.shift()!
    for (const [nr, nc] of getNeighbors(r, c, parity)) {
      const k = key(nr, nc)
      if (anchored.has(k)) continue
      if (grid[nr][nc]) {
        anchored.add(k)
        queue.push([nr, nc])
      }
    }
  }

  const floating = new Set<string>()
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col] && !anchored.has(key(row, col))) {
        floating.add(key(row, col))
      }
    }
  }
  return floating
}

export function removeCells(grid: Grid, cells: Set<string>): Grid {
  const next = cloneGrid(grid)
  for (const k of cells) {
    const [r, c] = k.split(',').map(Number)
    next[r][c] = null
  }
  return next
}

/** Settles a bubble at (row, col), then resolves matches and floating bubbles it triggers. */
export function settleBubble(
  grid: Grid,
  row: number,
  col: number,
  color: BubbleColor,
  parity = 0,
): { grid: Grid; result: PopResult } {
  let next = cloneGrid(grid)
  next[row][col] = color

  const group = findConnectedGroup(next, row, col, parity)
  let matched: string[] = []
  if (group.size >= 3) {
    matched = Array.from(group)
    next = removeCells(next, group)
  }

  const floatingSet = findFloatingCells(next, parity)
  const floating = Array.from(floatingSet)
  if (floating.length > 0) {
    next = removeCells(next, floatingSet)
  }

  return { grid: next, result: { matched, floating } }
}

export function isBoardCleared(grid: Grid): boolean {
  return grid.every((row) => row.every((cell) => cell === null))
}

export function isGameOver(grid: Grid): boolean {
  for (let row = DANGER_ROW; row < ROWS; row++) {
    if (grid[row].some((cell) => cell !== null)) return true
  }
  return false
}

/**
 * Shifts every row down by one and inserts a fresh row at the ceiling. The row parity flips so existing
 * bubbles keep their screen position and adjacency; the caller must store the returned parity.
 */
export function insertRowAtTop(grid: Grid, colorCount: number, parity = 0): { grid: Grid; parity: number } {
  const nextParity = 1 - parity
  const colors = PALETTE.slice(0, colorCount)
  const newRow = Array<Cell>(COLS)
    .fill(null)
    .map((_, col) => (cellExists(0, col, nextParity) ? randomColor(colors) : null))
  return { grid: [newRow, ...grid.slice(0, ROWS - 1)], parity: nextParity }
}

export function createShotBubble(color: BubbleColor): ShotBubble {
  return { x: VIRTUAL_WIDTH / 2, y: SHOOTER_Y, vx: 0, vy: 0, color, radius: RADIUS }
}

export function launchShotBubble(bubble: ShotBubble, angle: number, speed: number): ShotBubble {
  return { ...bubble, vx: Math.sin(angle) * speed, vy: -Math.cos(angle) * speed }
}

/** Advances the flying bubble by dt frames, bouncing off the side walls. */
export function stepShotBubble(bubble: ShotBubble, dt: number): ShotBubble {
  let x = bubble.x + bubble.vx * dt
  const y = bubble.y + bubble.vy * dt
  let vx = bubble.vx

  if (x - bubble.radius < 0) {
    x = bubble.radius
    vx = -vx
  } else if (x + bubble.radius > VIRTUAL_WIDTH) {
    x = VIRTUAL_WIDTH - bubble.radius
    vx = -vx
  }

  return { ...bubble, x, y, vx }
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x1 - x2, y1 - y2)
}

/** Finds the empty grid slot closest to (x, y). */
export function nearestEmptyCell(grid: Grid, x: number, y: number, parity = 0): { row: number; col: number } | null {
  let best: { row: number; col: number } | null = null
  let bestDist = Infinity

  const approxRow = Math.max(0, Math.round((y - RADIUS) / ROW_HEIGHT))
  const rowSpan = 2

  for (let row = Math.max(0, approxRow - rowSpan); row <= Math.min(ROWS - 1, approxRow + rowSpan); row++) {
    for (let col = 0; col < COLS; col++) {
      if (!cellExists(row, col, parity) || grid[row][col] !== null) continue
      const d = distance(x, y, cellX(row, col, parity), cellY(row))
      if (d < bestDist) {
        bestDist = d
        best = { row, col }
      }
    }
  }
  return best
}

/** The empty slot next to (row, col) that is closest to (x, y) — where a bubble that hit it should attach. */
function nearestEmptyNeighbor(grid: Grid, row: number, col: number, x: number, y: number, parity: number) {
  let best: { row: number; col: number } | null = null
  let bestDist = Infinity
  for (const [r, c] of getNeighbors(row, col, parity)) {
    if (grid[r][c] !== null) continue
    const d = distance(x, y, cellX(r, c, parity), cellY(r))
    if (d < bestDist) {
      bestDist = d
      best = { row: r, col: c }
    }
  }
  return best
}

/**
 * Checks whether the flying bubble has reached the ceiling or touched a settled bubble.
 * Returns the empty grid slot it should snap into, or null if it's still flying free.
 */
export function findLandingCell(bubble: ShotBubble, grid: Grid, parity = 0): { row: number; col: number } | null {
  if (bubble.y - bubble.radius <= 0) {
    return nearestEmptyCell(grid, bubble.x, RADIUS, parity)
  }

  const approxRow = Math.max(0, Math.round((bubble.y - RADIUS) / ROW_HEIGHT))
  for (let row = Math.max(0, approxRow - 2); row <= Math.min(ROWS - 1, approxRow + 2); row++) {
    for (let col = 0; col < COLS; col++) {
      if (!cellExists(row, col, parity) || grid[row][col] === null) continue
      const d = distance(bubble.x, bubble.y, cellX(row, col, parity), cellY(row))
      if (d <= bubble.radius * 2 * 0.96) {
        // Attach next to the bubble we actually hit, so the new bubble is always connected to it.
        return (
          nearestEmptyNeighbor(grid, row, col, bubble.x, bubble.y, parity) ??
          nearestEmptyCell(grid, bubble.x, bubble.y, parity)
        )
      }
    }
  }
  return null
}
