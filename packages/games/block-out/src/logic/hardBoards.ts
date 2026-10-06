/**
 * Hard-board generator for Block Out.
 *
 * Instead of scattering blocks and hoping the result is hard, we start from a *won* position
 * (target block against the exit), enumerate every position reachable from it, and compute the
 * exact minimum number of moves back to a win for each of them with a multi-source BFS. Slides
 * are reversible, so that distance is also the optimal solution length when the player starts there.
 * Then we simply pick a start position whose optimal length is the one the level curve asks for.
 *
 * This file is deliberately self-contained (no runtime imports) so that the offline level script
 * can run it directly with `node` as well as the app.
 */

export const SIZE = 6
export const TARGET_ROW = 2
export const WIN_COL = 4

export interface RawBlock {
  /** 'h' slides along columns, 'v' along rows. */
  orientation: 'h' | 'v'
  length: 2 | 3
  /** Fixed coordinate: row for 'h' blocks, column for 'v' blocks. */
  fixed: number
  /** Position of the first cell along the sliding axis at the won position. */
  pos: number
}

export type PRNG = () => number

export function createPRNG(seed: number): PRNG {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Random board with the target (block 0) already at the exit. Returns null if it can't place `count` blocks. */
export function randomWonBoard(rand: PRNG, count: number): RawBlock[] | null {
  const blocks: RawBlock[] = [{ orientation: 'h', length: 2, fixed: TARGET_ROW, pos: WIN_COL }]
  const occupied = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false))
  occupied[TARGET_ROW][WIN_COL] = true
  occupied[TARGET_ROW][WIN_COL + 1] = true

  for (let attempt = 0; attempt < 120 && blocks.length < count; attempt++) {
    const orientation: 'h' | 'v' = rand() < 0.5 ? 'h' : 'v'
    const length: 2 | 3 = rand() < 0.62 ? 2 : 3
    const fixed = Math.floor(rand() * SIZE)
    const pos = Math.floor(rand() * (SIZE - length + 1))
    // The target's row is only ever crossed by vertical blocks; horizontal blocks there would just wall it in.
    if (orientation === 'h' && fixed === TARGET_ROW) continue
    let ok = true
    for (let i = 0; i < length && ok; i++) {
      const r = orientation === 'h' ? fixed : pos + i
      const c = orientation === 'h' ? pos + i : fixed
      if (occupied[r][c]) ok = false
    }
    if (!ok) continue
    for (let i = 0; i < length; i++) {
      const r = orientation === 'h' ? fixed : pos + i
      const c = orientation === 'h' ? pos + i : fixed
      occupied[r][c] = true
    }
    blocks.push({ orientation, length, fixed, pos })
  }
  return blocks.length >= count ? blocks : null
}

function encode(pos: number[]): number {
  let key = 0
  for (let i = 0; i < pos.length; i++) key = key * SIZE + pos[i]
  return key
}

function fillGrid(blocks: RawBlock[], pos: number[], grid: Int8Array): void {
  grid.fill(-1)
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    for (let k = 0; k < b.length; k++) {
      const r = b.orientation === 'h' ? b.fixed : pos[i] + k
      const c = b.orientation === 'h' ? pos[i] + k : b.fixed
      grid[r * SIZE + c] = i
    }
  }
}

/** Calls `visit` with every position reachable from `pos` by sliding one block any distance. */
function forEachNeighbour(blocks: RawBlock[], pos: number[], grid: Int8Array, visit: (next: number[]) => void): void {
  fillGrid(blocks, pos, grid)
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    for (const dir of [-1, 1]) {
      for (let step = 1; step < SIZE; step++) {
        const p = pos[i] + dir * step
        if (p < 0 || p + b.length > SIZE) break
        const edge = dir < 0 ? p : p + b.length - 1
        const cell = b.orientation === 'h' ? grid[b.fixed * SIZE + edge] : grid[edge * SIZE + b.fixed]
        if (cell !== -1) break
        const next = pos.slice()
        next[i] = p
        visit(next)
      }
    }
  }
}

export interface Component {
  blocks: RawBlock[]
  /** All positions reachable from the won position, as arrays of per-block sliding coordinates. */
  states: number[][]
  /** Optimal number of moves to win from each state (0 for every state with the target at the exit). */
  dist: Int16Array
}

/** Enumerates the board's whole component and computes exact distances to a win. Null if it exceeds maxStates. */
export function exploreComponent(blocks: RawBlock[], maxStates: number): Component | null {
  const start = blocks.map((b) => b.pos)
  const grid = new Int8Array(SIZE * SIZE)
  const index = new Map<number, number>([[encode(start), 0]])
  const states: number[][] = [start]

  for (let head = 0; head < states.length; head++) {
    let overflow = false
    forEachNeighbour(blocks, states[head], grid, (next) => {
      const key = encode(next)
      if (index.has(key)) return
      if (states.length >= maxStates) {
        overflow = true
        return
      }
      index.set(key, states.length)
      states.push(next)
    })
    if (overflow) return null
  }

  const dist = new Int16Array(states.length).fill(-1)
  const queue: number[] = []
  for (let s = 0; s < states.length; s++) {
    if (states[s][0] >= WIN_COL) {
      dist[s] = 0
      queue.push(s)
    }
  }
  for (let head = 0; head < queue.length; head++) {
    const s = queue[head]
    forEachNeighbour(blocks, states[s], grid, (next) => {
      const n = index.get(encode(next))!
      if (dist[n] !== -1) return
      dist[n] = dist[s] + 1
      queue.push(n)
    })
  }
  return { blocks, states, dist }
}

export interface PickedBoard {
  blocks: Array<{
    id: string
    orientation: 'h' | 'v'
    length: 2 | 3
    row: number
    col: number
    isTarget?: boolean
  }>
  minMoves: number
}

/** Turns one state of a component into the app's block list (target first, ids target / b1 / b2 ...). */
export function toBlocks(component: Component, stateIndex: number): PickedBoard['blocks'] {
  const state = component.states[stateIndex]
  return component.blocks.map((b, i) => {
    const row = b.orientation === 'h' ? b.fixed : state[i]
    const col = b.orientation === 'h' ? state[i] : b.fixed
    return i === 0
      ? { id: 'target', orientation: b.orientation, length: b.length, row, col, isTarget: true }
      : { id: `b${i}`, orientation: b.orientation, length: b.length, row, col }
  })
}

export interface FindOptions {
  /** Inclusive range of optimal move counts we are happy with. */
  min: number
  max: number
  /** Number of blocks (target included) to try. */
  blockCount: number
  maxStates?: number
  maxAttempts?: number
}

/**
 * Searches seeded random boards until one has a start position (target in the leftmost column)
 * whose optimal solution length lies in [min, max]. Among all such positions of the first board
 * that has any, picks one at random. If no board hits the range, returns the hardest one found
 * as long as it reaches at least `min - slack`.
 */
export function findBoard(seed: number, opts: FindOptions): PickedBoard | null {
  const rand = createPRNG(seed)
  const maxStates = opts.maxStates ?? 60000
  const maxAttempts = opts.maxAttempts ?? 400
  let best: { component: Component; state: number; d: number } | null = null

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const blocks = randomWonBoard(rand, opts.blockCount)
    if (!blocks) continue
    const component = exploreComponent(blocks, maxStates)
    if (!component) continue

    const inRange: number[] = []
    for (let s = 0; s < component.states.length; s++) {
      if (component.states[s][0] !== 0) continue // keep the classic look: target starts at the left edge
      const d = component.dist[s]
      if (d < 0) continue
      if (d >= opts.min && d <= opts.max) inRange.push(s)
      if (!best || d > best.d) best = { component, state: s, d }
    }
    if (inRange.length > 0) {
      const state = inRange[Math.floor(rand() * inRange.length)]
      return { blocks: toBlocks(component, state), minMoves: component.dist[state] }
    }
  }
  return best ? { blocks: toBlocks(best.component, best.state), minMoves: best.d } : null
}

/** Replaces one non-target block with a different random one. Null if no free spot was found. */
export function mutateBoard(blocks: RawBlock[], rand: PRNG): RawBlock[] | null {
  const next = blocks.map((b) => ({ ...b }))
  const i = 1 + Math.floor(rand() * (next.length - 1))
  const occupied = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false))
  next.forEach((b, j) => {
    if (j === i) return
    for (let k = 0; k < b.length; k++) {
      const r = b.orientation === 'h' ? b.fixed : b.pos + k
      const c = b.orientation === 'h' ? b.pos + k : b.fixed
      occupied[r][c] = true
    }
  })
  for (let t = 0; t < 30; t++) {
    const orientation: 'h' | 'v' = rand() < 0.5 ? 'h' : 'v'
    const length: 2 | 3 = rand() < 0.62 ? 2 : 3
    const fixed = Math.floor(rand() * SIZE)
    const pos = Math.floor(rand() * (SIZE - length + 1))
    if (orientation === 'h' && fixed === TARGET_ROW) continue
    let ok = true
    for (let k = 0; k < length && ok; k++) {
      const r = orientation === 'h' ? fixed : pos + k
      const c = orientation === 'h' ? pos + k : fixed
      if (occupied[r][c]) ok = false
    }
    if (!ok) continue
    next[i] = { orientation, length, fixed, pos }
    return next
  }
  return null
}

/** Longest optimal solution among the component's start positions (target at the left edge). */
export function hardestStart(component: Component): number {
  let max = 0
  for (let s = 0; s < component.states.length; s++) {
    if (component.states[s][0] === 0 && component.dist[s] > max) max = component.dist[s]
  }
  return max
}

/**
 * Hill-climbs a random board: keeps swapping one block for another and keeps the change whenever the
 * hardest start position of the board does not get easier. Stops early at `goal`.
 */
export function climbBoard(
  seed: number,
  blockCount: number,
  evals: number,
  goal: number,
  maxStates = 30000,
): { blocks: RawBlock[]; hardest: number } | null {
  const rand = createPRNG(seed)
  let current: { blocks: RawBlock[]; hardest: number } | null = null
  for (let i = 0; i < 200 && !current; i++) {
    const blocks = randomWonBoard(rand, blockCount)
    const component = blocks && exploreComponent(blocks, maxStates)
    if (blocks && component) current = { blocks, hardest: hardestStart(component) }
  }
  if (!current) return null
  for (let i = 0; i < evals && current.hardest < goal; i++) {
    const blocks = mutateBoard(current.blocks, rand)
    const component = blocks && exploreComponent(blocks, maxStates)
    if (!blocks || !component) continue
    const hardest = hardestStart(component)
    if (hardest >= current.hardest) current = { blocks, hardest }
  }
  return current
}
