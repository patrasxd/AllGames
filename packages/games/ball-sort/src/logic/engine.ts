import type { BallColor, Move, Tube } from '../types'

export const PALETTE: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'charcoal', 'cream']

/** Seeded PRNG (Park-Miller LCG) for deterministic level generation — same construction as Crystal Match's. */
export function createPRNG(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pickInt(rand: () => number, maxExclusive: number): number {
  return Math.floor(rand() * maxExclusive)
}

export function topRun(tube: Tube): { color: BallColor; length: number } | null {
  if (tube.length === 0) return null
  const color = tube[tube.length - 1]
  let length = 1
  while (length < tube.length && tube[tube.length - 1 - length] === color) length++
  return { color, length }
}

/**
 * Which balls of a tube (bottom to top) the player can see. With `visibleBelowTop` undefined all of
 * them; otherwise the top run (same-color balls reveal nothing extra) plus that many balls under it.
 */
export function ballVisibility(tube: Tube, visibleBelowTop?: number): boolean[] {
  if (visibleBelowTop === undefined) return tube.map(() => true)
  const firstVisible = tube.length - (topRun(tube)?.length ?? 0) - visibleBelowTop
  return tube.map((_, i) => i >= firstVisible)
}

export function isTubeSolved(tube: Tube): boolean {
  return tube.length === 0 || topRun(tube)!.length === tube.length
}

/** Every color fully gathered in exactly one tube (or the tube set is entirely empty). */
export function isSolved(tubes: Tube[]): boolean {
  const seenColors = new Set<BallColor>()
  for (const tube of tubes) {
    if (tube.length === 0) continue
    if (!isTubeSolved(tube)) return false
    const color = tube[0]
    if (seenColors.has(color)) return false // this color is split across two tubes — not solved
    seenColors.add(color)
  }
  return true
}

/**
 * Whether pouring the top run of `from` onto `to` is legal: `to` must be empty or already
 * topped with the same color, and must have room for at least one ball of the run.
 */
export function canPour(tubes: Tube[], from: number, to: number, capacity: number): boolean {
  if (from === to) return false
  const source = tubes[from]
  const run = topRun(source)
  if (!run) return false
  const dest = tubes[to]
  if (dest.length >= capacity) return false
  const destTop = dest.length > 0 ? dest[dest.length - 1] : null
  return destTop === null || destTop === run.color
}

/** Pours as many balls as fit: the whole top run, capped by the destination's remaining room. */
export function pour(tubes: Tube[], from: number, to: number, capacity: number): { tubes: Tube[]; move: Move } | null {
  if (!canPour(tubes, from, to, capacity)) return null
  const run = topRun(tubes[from])!
  const room = capacity - tubes[to].length
  const count = Math.min(run.length, room)

  const next = tubes.map((t) => t.slice())
  const moved = next[from].splice(next[from].length - count, count)
  next[to].push(...moved)

  return { tubes: next, move: { from, to, count, color: run.color } }
}

/**
 * Generates a level by scrambling backward from a solved board, then hands the board to the
 * player already scrambled — the player plays it forward. See the long comment below for why
 * this specific scrambling rule is what guarantees the result is always solvable.
 */
export interface GeneratedLevel {
  tubes: Tube[]
  parMoves: number
  /** Single-ball scramble moves, in the order performed. Replaying them in reverse (as `to → from`
   * pours) is the actual solve path — used by tests to independently verify solvability. */
  moves: { from: number; to: number }[]
}

export function generateLevel(
  numColors: number,
  capacity: number,
  numEmptyTubes: number,
  shuffleSteps: number,
  rand: () => number,
): GeneratedLevel {
  const colors = PALETTE.slice(0, numColors)
  const tubes: Tube[] = colors.map((c) => Array<BallColor>(capacity).fill(c))
  for (let i = 0; i < numEmptyTubes; i++) tubes.push([])

  const moves: { from: number; to: number }[] = []

  /*
   * Correctness of this generator:
   *
   * A forward (solving) pour is legal only when the destination's top matches the run being
   * poured, or the destination is empty. Because of that one-sided rule, randomly applying
   * *forward* moves starting from a solved board can never mix colors — every tube stays
   * monochrome forever, since two different colors are never allowed to touch. So scrambling
   * has to use a different rule, chosen so its exact reverse is always a legal forward pour.
   *
   * The scramble step below moves a single ball from the top of `from` to any tube `to` with
   * room (no color match required on `to` — that's what actually lets colors interleave). The
   * only constraint is on `from`: it may only give up its top ball if doing so exposes either
   * nothing (the tube is now empty) or the *same* color underneath. That guarantees the ball
   * we just placed on `to` can always be poured straight back onto `from` later — `from`'s
   * exposed top is empty-or-same-color by construction, which is exactly the forward-pour
   * legality rule. Replaying every scramble step in reverse order (each becoming a `to → from`
   * pour) is therefore always a valid, complete solve — regardless of how the steps interleave,
   * by a simple induction on undoing them last-to-first.
   */
  let performed = 0
  for (let attempt = 0; attempt < shuffleSteps * 6 && performed < shuffleSteps; attempt++) {
    const from = pickInt(rand, tubes.length)
    const source = tubes[from]
    if (source.length === 0) continue
    const exposedBelow = source.length > 1 ? source[source.length - 2] : null
    const topColor = source[source.length - 1]
    const safeToRemove = exposedBelow === null || exposedBelow === topColor
    if (!safeToRemove) continue

    const to = pickInt(rand, tubes.length)
    if (to === from) continue
    if (tubes[to].length >= capacity) continue

    tubes[to] = [...tubes[to], source.pop()!]
    moves.push({ from, to })
    performed++
  }

  return { tubes, parMoves: performed, moves }
}
