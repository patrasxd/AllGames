import type { GemType, SpecialType, Tile, LevelConfig, LevelGoal, ObstacleType } from '../types'

/**
 * Pure game rules for Crystal Match. Nothing in here touches React or timers,
 * so the hook, the tests and the level simulator all run the exact same code.
 *
 * Model
 *  - Every cell has a STATIC obstacle layer (ice under the gem, stone, hole).
 *    Gems move; obstacles never do.
 *  - Every gem has a stable `id` that moves with it. The renderer uses it to
 *    animate swaps, falls and refills instead of teleporting content.
 *  - Holes and stones hold no gems. Gems fall through the playable cells of a
 *    column only, so nothing can ever hide inside a blocked cell.
 */

export interface Coord {
  row: number
  col: number
}

export interface Move {
  r1: number
  c1: number
  r2: number
  c2: number
}

export interface SpecialSpawn extends Coord {
  special: SpecialType
  gem: GemType
}

export interface ObstacleChange extends Coord {
  from: ObstacleType
  to: ObstacleType
}

export interface MatchResult {
  matchedCoords: Coord[]
  specialSpawns: SpecialSpawn[]
  /** Ice damaged / cleared and stones broken by this step. */
  obstacleChanges: ObstacleChange[]
  /** Ice cells that became fully clear (double ice needs two hits). Drives the ice goal. */
  iceCleared: number
  gemsClearedByType: Record<GemType, number>
  totalGemsCleared: number
  scoreEarned: number
}

const emptyGemCounts = (): Record<GemType, number> => ({
  ruby: 0,
  sapphire: 0,
  emerald: 0,
  topaz: 0,
  amethyst: 0,
  amber: 0,
})

let idCounter = 0
/** Unique id for a freshly created gem. */
export function newGemId(prefix = 'g'): string {
  idCounter += 1
  return `${prefix}${idCounter}`
}

const key = (r: number, c: number) => `${r}-${c}`
const parseKey = (k: string): Coord => {
  const [row, col] = k.split('-').map(Number)
  return { row, col }
}

export function isBlocked(tile: Tile): boolean {
  return tile.obstacle === 'empty' || tile.obstacle === 'stone'
}

/**
 * A gem standing on ice is frozen: it cannot be swapped (neither dragged nor swapped into).
 * It can still be matched, and that is how the ice breaks.
 */
export function isIceLocked(tile: Tile): boolean {
  return tile.obstacle === 'ice' || tile.obstacle === 'double-ice'
}

const cloneBoard = (board: Tile[][]): Tile[][] => board.map(row => row.map(tile => ({ ...tile })))

// ─── Swapping ────────────────────────────────────────────────────────────────

/** Swap the gems (identity, colour, special) of two cells. Obstacles stay put. */
export function swapTiles(board: Tile[][], r1: number, c1: number, r2: number, c2: number): Tile[][] {
  const next = cloneBoard(board)
  const a = next[r1][c1]
  const b = next[r2][c2]
  ;[a.id, b.id] = [b.id, a.id]
  ;[a.gem, b.gem] = [b.gem, a.gem]
  ;[a.special, b.special] = [b.special, a.special]
  return next
}

// ─── Resolving a set of cleared cells ────────────────────────────────────────

/**
 * Expands a seed of cleared cells with chain reactions (a cleared special fires
 * too), then works out obstacle damage, goal counters and score.
 */
function buildResult(
  board: Tile[][],
  seed: Iterable<string>,
  specialSpawns: SpecialSpawn[],
  bonus = 0
): MatchResult {
  const rows = board.length
  const cols = board[0].length
  const cleared = new Set<string>()
  const queue: string[] = []

  const add = (r: number, c: number) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return
    const tile = board[r][c]
    if (isBlocked(tile) || !tile.gem) return
    const k = key(r, c)
    if (cleared.has(k)) return
    cleared.add(k)
    queue.push(k)
  }

  for (const k of seed) {
    const { row, col } = parseKey(k)
    add(row, col)
  }

  while (queue.length > 0) {
    const { row: r, col: c } = parseKey(queue.shift()!)
    const tile = board[r][c]
    switch (tile.special) {
      case 'line-h':
        for (let cc = 0; cc < cols; cc++) add(r, cc)
        break
      case 'line-v':
        for (let rr = 0; rr < rows; rr++) add(rr, c)
        break
      case 'bomb':
        for (let rr = r - 1; rr <= r + 1; rr++) for (let cc = c - 1; cc <= c + 1; cc++) add(rr, cc)
        break
      case 'prism':
        for (let rr = 0; rr < rows; rr++) {
          for (let cc = 0; cc < cols; cc++) if (board[rr][cc].gem === tile.gem) add(rr, cc)
        }
        break
      default:
        break
    }
  }

  const matchedCoords = [...cleared].map(parseKey)
  const gemsClearedByType = emptyGemCounts()
  for (const { row, col } of matchedCoords) {
    const gem = board[row][col].gem
    if (gem) gemsClearedByType[gem] += 1
  }

  // Ice sits UNDER the gem: it only reacts when the gem on that very cell is
  // cleared. Stones are blockers: they crack when something next to them clears.
  const changes = new Map<string, ObstacleChange>()
  let iceCleared = 0
  for (const { row, col } of matchedCoords) {
    const o = board[row][col].obstacle
    if (o === 'double-ice') {
      changes.set(key(row, col), { row, col, from: o, to: 'ice' })
    } else if (o === 'ice') {
      changes.set(key(row, col), { row, col, from: o, to: 'none' })
      iceCleared += 1
    }
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = row + dr
      const nc = col + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (board[nr][nc].obstacle === 'stone') {
        changes.set(key(nr, nc), { row: nr, col: nc, from: 'stone', to: 'none' })
      }
    }
  }

  // One special per cell; prism beats bomb beats line.
  const rank: Record<SpecialType, number> = { none: 0, 'line-h': 1, 'line-v': 1, bomb: 2, prism: 3 }
  const best = new Map<string, SpecialSpawn>()
  for (const s of specialSpawns) {
    const k = key(s.row, s.col)
    const prev = best.get(k)
    if (!prev || rank[s.special] > rank[prev.special]) best.set(k, s)
  }
  const spawns = [...best.values()]

  return {
    matchedCoords,
    specialSpawns: spawns,
    obstacleChanges: [...changes.values()],
    iceCleared,
    gemsClearedByType,
    totalGemsCleared: matchedCoords.length,
    scoreEarned: matchedCoords.length * 30 + (spawns.length > 0 ? 80 : 0) + bonus,
  }
}

// ─── Natural matches ─────────────────────────────────────────────────────────

/** Finds every 3+ run on the board and resolves it, including specials and chains. */
export function findMatches(board: Tile[][]): MatchResult {
  const rows = board.length
  const cols = board[0].length

  const horizontal: { row: number; cols: number[]; gem: GemType }[] = []
  const vertical: { col: number; rows: number[]; gem: GemType }[] = []

  for (let r = 0; r < rows; r++) {
    let run = 1
    for (let c = 0; c < cols; c++) {
      const current = board[r][c].gem
      const next = c + 1 < cols ? board[r][c + 1].gem : null
      if (current && next && current === next) {
        run++
      } else {
        if (run >= 3 && current) {
          const list: number[] = []
          for (let i = c - run + 1; i <= c; i++) list.push(i)
          horizontal.push({ row: r, cols: list, gem: current })
        }
        run = 1
      }
    }
  }

  for (let c = 0; c < cols; c++) {
    let run = 1
    for (let r = 0; r < rows; r++) {
      const current = board[r][c].gem
      const next = r + 1 < rows ? board[r + 1][c].gem : null
      if (current && next && current === next) {
        run++
      } else {
        if (run >= 3 && current) {
          const list: number[] = []
          for (let i = r - run + 1; i <= r; i++) list.push(i)
          vertical.push({ col: c, rows: list, gem: current })
        }
        run = 1
      }
    }
  }

  const seed = new Set<string>()
  const spawns: SpecialSpawn[] = []

  for (const h of horizontal) {
    h.cols.forEach(c => seed.add(key(h.row, c)))
    if (h.cols.length >= 5) {
      spawns.push({ row: h.row, col: h.cols[Math.floor(h.cols.length / 2)], special: 'prism', gem: h.gem })
    } else if (h.cols.length === 4) {
      spawns.push({ row: h.row, col: h.cols[1], special: 'line-v', gem: h.gem })
    }
  }
  for (const v of vertical) {
    v.rows.forEach(r => seed.add(key(r, v.col)))
    if (v.rows.length >= 5) {
      spawns.push({ row: v.rows[Math.floor(v.rows.length / 2)], col: v.col, special: 'prism', gem: v.gem })
    } else if (v.rows.length === 4) {
      spawns.push({ row: v.rows[1], col: v.col, special: 'line-h', gem: v.gem })
    }
  }
  // T / L shapes: a horizontal and a vertical run of one colour crossing each other.
  for (const h of horizontal) {
    for (const v of vertical) {
      if (h.gem === v.gem && h.cols.includes(v.col) && v.rows.includes(h.row)) {
        spawns.push({ row: h.row, col: v.col, special: 'bomb', gem: h.gem })
      }
    }
  }

  if (seed.size === 0) return buildResult(board, [], [])
  return buildResult(board, seed, spawns)
}

// ─── Special + special swaps ─────────────────────────────────────────────────

/**
 * Result of swapping two gems when at least one is a special that fires on a
 * swap. Evaluated on the board BEFORE the swap; areas are centred on (r2, c2),
 * the cell the dragged gem lands on. Returns null when the swap is not a combo.
 *
 *   prism + prism   clears the board
 *   prism + gem     clears every gem of that colour
 *   prism + special turns every gem of that colour into that special, then fires them
 *   bomb  + bomb    5x5 blast
 *   line  + line    a full row and column
 *   line  + bomb    a 3-wide row and column
 */
export function findCombo(board: Tile[][], r1: number, c1: number, r2: number, c2: number): MatchResult | null {
  const a = board[r1][c1]
  const b = board[r2][c2]
  if (!a.gem || !b.gem || isBlocked(a) || isBlocked(b) || isIceLocked(a) || isIceLocked(b)) return null

  const rows = board.length
  const cols = board[0].length
  const sa = a.special
  const sb = b.special
  if (sa === 'none' && sb === 'none') return null

  const work = cloneBoard(board)
  const seed = new Set<string>()
  const eachPlayable = (fn: (r: number, c: number) => void) => {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (work[r][c].gem && !isBlocked(work[r][c])) fn(r, c)
  }

  if (sa === 'prism' || sb === 'prism') {
    const prismIsA = sa === 'prism'
    const [pr, pc] = prismIsA ? [r1, c1] : [r2, c2]
    const [or, oc] = prismIsA ? [r2, c2] : [r1, c1]
    const other = work[or][oc]

    // The swapped-in prism acts through this combo only, never as its own colour blast.
    work[pr][pc].special = 'none'
    seed.add(key(pr, pc))
    seed.add(key(or, oc))

    if (other.special === 'prism') {
      work[or][oc].special = 'none'
      eachPlayable((r, c) => seed.add(key(r, c)))
      return buildResult(work, seed, [], 500)
    }

    const colour = other.gem
    if (other.special === 'none') {
      eachPlayable((r, c) => {
        if (work[r][c].gem === colour) seed.add(key(r, c))
      })
      return buildResult(work, seed, [], 200)
    }

    eachPlayable((r, c) => {
      if (work[r][c].gem === colour) {
        work[r][c].special = other.special
        seed.add(key(r, c))
      }
    })
    return buildResult(work, seed, [], 400)
  }

  if (sa === 'none' || sb === 'none') return null // a lone special needs a real match

  const isLine = (s: SpecialType) => s === 'line-h' || s === 'line-v'
  const addRow = (r: number) => {
    for (let c = 0; c < cols; c++) seed.add(key(r, c))
  }
  const addCol = (c: number) => {
    for (let r = 0; r < rows; r++) seed.add(key(r, c))
  }

  if (sa === 'bomb' && sb === 'bomb') {
    for (let r = r2 - 2; r <= r2 + 2; r++) for (let c = c2 - 2; c <= c2 + 2; c++) seed.add(key(r, c))
    return buildResult(work, seed, [], 250)
  }
  if (isLine(sa) && isLine(sb)) {
    addRow(r2)
    addCol(c2)
    return buildResult(work, seed, [], 200)
  }
  // line + bomb
  for (let d = -1; d <= 1; d++) {
    if (r2 + d >= 0 && r2 + d < rows) addRow(r2 + d)
    if (c2 + d >= 0 && c2 + d < cols) addCol(c2 + d)
  }
  return buildResult(work, seed, [], 300)
}

// ─── Valid moves ─────────────────────────────────────────────────────────────

/** A swap is playable only if it fires a combo or creates a real match. */
export function evaluateSwap(board: Tile[][], r1: number, c1: number, r2: number, c2: number): MatchResult | null {
  const a = board[r1][c1]
  const b = board[r2][c2]
  if (!a.gem || !b.gem || isBlocked(a) || isBlocked(b) || isIceLocked(a) || isIceLocked(b)) return null
  const combo = findCombo(board, r1, c1, r2, c2)
  if (combo && combo.matchedCoords.length > 0) return combo
  const result = findMatches(swapTiles(board, r1, c1, r2, c2))
  return result.matchedCoords.length > 0 ? result : null
}

export function findValidMoves(board: Tile[][]): { move: Move; result: MatchResult }[] {
  const rows = board.length
  const cols = board[0].length
  const out: { move: Move; result: MatchResult }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const r2 = r + dr
        const c2 = c + dc
        if (r2 >= rows || c2 >= cols) continue
        const result = evaluateSwap(board, r, c, r2, c2)
        if (result) out.push({ move: { r1: r, c1: c, r2, c2 }, result })
      }
    }
  }
  return out
}

export function hasValidMove(board: Tile[][]): boolean {
  return findValidMoves(board).length > 0
}

/** The move that clears the most, for hints. */
export function findBestMove(board: Tile[][]): Move | null {
  let best: { move: Move; result: MatchResult } | null = null
  for (const candidate of findValidMoves(board)) {
    if (!best || candidate.result.scoreEarned > best.result.scoreEarned) best = candidate
  }
  return best?.move ?? null
}

// ─── Applying a step to the board ────────────────────────────────────────────

/**
 * Removes the cleared gems, applies obstacle damage and drops freshly made
 * special gems into place. Cells stay where they are; only gems disappear.
 */
export function clearMatched(board: Tile[][], result: MatchResult): Tile[][] {
  const next = cloneBoard(board)
  for (const { row, col } of result.matchedCoords) {
    next[row][col].gem = null
    next[row][col].special = 'none'
  }
  for (const change of result.obstacleChanges) {
    next[change.row][change.col].obstacle = change.to
  }
  for (const spawn of result.specialSpawns) {
    const cell = next[spawn.row][spawn.col]
    cell.id = newGemId('s')
    cell.gem = spawn.gem
    cell.special = spawn.special
    cell.spawnPop = true
  }
  return next
}

/**
 * Gems fall straight down through the playable cells of each column (holes and
 * stones are skipped, never filled) and new gems enter from above.
 */
export function applyGravityAndRefill(
  board: Tile[][],
  config: Pick<LevelConfig, 'gemColors'>,
  rand: () => number = Math.random
): { nextBoard: Tile[][]; newTileCount: number } {
  const rows = board.length
  const cols = board[0].length
  const next: Tile[][] = board.map(row => row.map((tile): Tile => ({ ...tile, spawnDrop: undefined, spawnPop: undefined })))
  let newTileCount = 0

  for (let c = 0; c < cols; c++) {
    const playable: number[] = [] // rows, bottom to top
    for (let r = rows - 1; r >= 0; r--) if (!isBlocked(next[r][c])) playable.push(r)

    const survivors = playable
      .map(r => next[r][c])
      .filter(tile => tile.gem !== null)
      .map(tile => ({ id: tile.id, gem: tile.gem, special: tile.special, pop: false }))

    playable.forEach((r, i) => {
      const cell = next[r][c]
      if (i < survivors.length) {
        cell.id = survivors[i].id
        cell.gem = survivors[i].gem
        cell.special = survivors[i].special
      } else {
        const k = i - survivors.length
        cell.id = newGemId('g')
        cell.gem = config.gemColors[Math.floor(rand() * config.gemColors.length)]
        cell.special = 'none'
        cell.spawnDrop = r + 1 + k
        newTileCount++
      }
    })
  }

  return { nextBoard: next, newTileCount }
}

// ─── Board construction & shuffling ──────────────────────────────────────────

/** Fills every playable cell with a gem, never creating a match on the way. Mutates `board`. */
export function fillWithoutMatches(board: Tile[][], gemColors: GemType[], rand: () => number = Math.random): void {
  const rows = board.length
  const cols = board[0].length
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = board[r][c]
      if (isBlocked(tile)) {
        tile.gem = null
        tile.special = 'none'
        continue
      }
      const forbidden = new Set<GemType>()
      if (c >= 2 && board[r][c - 1].gem && board[r][c - 1].gem === board[r][c - 2].gem) forbidden.add(board[r][c - 1].gem!)
      if (r >= 2 && board[r - 1][c].gem && board[r - 1][c].gem === board[r - 2][c].gem) forbidden.add(board[r - 1][c].gem!)
      const options = gemColors.filter(g => !forbidden.has(g))
      const pool = options.length > 0 ? options : gemColors
      tile.gem = pool[Math.floor(rand() * pool.length)]
      tile.special = 'none'
    }
  }
}

/**
 * Shuffles the gems already on the board (identities move with them, so the
 * renderer animates it) until there is no match and at least one valid move.
 */
export function reshuffleBoard(board: Tile[][], config: Pick<LevelConfig, 'gemColors'>, rand: () => number = Math.random): Tile[][] {
  const rows = board.length
  const cols = board[0].length
  const cells: Coord[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!isBlocked(board[r][c])) cells.push({ row: r, col: c })
  const items = cells.map(({ row, col }) => ({ id: board[row][col].id, gem: board[row][col].gem, special: board[row][col].special }))

  const build = () => {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    const candidate = cloneBoard(board)
    cells.forEach(({ row, col }, i) => {
      candidate[row][col].id = items[i].id
      candidate[row][col].gem = items[i].gem
      candidate[row][col].special = items[i].special
    })
    return candidate
  }

  for (let attempt = 0; attempt < 60; attempt++) {
    const candidate = build()
    if (findMatches(candidate).matchedCoords.length === 0 && hasValidMove(candidate)) return candidate
  }

  // Extremely unlikely: fall back to a fresh colour layout that is guaranteed match-free.
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = build()
    fillWithoutMatches(candidate, config.gemColors, rand)
    if (hasValidMove(candidate)) return candidate
  }
  return build()
}

// ─── Goals & score ───────────────────────────────────────────────────────────

export function cascadeScore(result: MatchResult, cascadeCount: number): number {
  return Math.round(result.scoreEarned * (1 + (cascadeCount - 1) * 0.25))
}

export function updateGoals(goals: LevelGoal[], result: MatchResult, score: number): LevelGoal[] {
  return goals.map(goal => {
    if (goal.type === 'score') return { ...goal, current: score }
    if (goal.type === 'ice') return { ...goal, current: Math.min(goal.target, goal.current + result.iceCleared) }
    if (goal.type === 'gems' && goal.gemType) {
      return { ...goal, current: Math.min(goal.target, goal.current + (result.gemsClearedByType[goal.gemType] || 0)) }
    }
    return goal
  })
}

export function goalsMet(goals: LevelGoal[], score: number): boolean {
  return goals.every(goal => (goal.type === 'score' ? score >= goal.target : goal.current >= goal.target))
}
