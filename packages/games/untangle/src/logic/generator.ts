import type { LayoutSpec, Move, Point, Rope } from '../types'
import { buildSlots, ropeClearance, slotCount } from './layouts'
import { countConflicts, emptySlots, hasPegCollision, moveEndClear, pathBlocked } from './engine'
import { segmentsIntersect } from './geometry'

/** Small deterministic PRNG (mulberry32): the same seed always gives the same level. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A random perfect matching of points in convex position (the ring) whose chords never cross. */
function nonCrossingMatching(list: number[], rand: () => number): [number, number][] {
  if (list.length === 0) return []
  const partners: number[] = []
  for (let j = 1; j < list.length; j += 2) partners.push(j)
  const j = partners[Math.floor(rand() * partners.length)]
  return [
    [list[0], list[j]],
    ...nonCrossingMatching(list.slice(1, j), rand),
    ...nonCrossingMatching(list.slice(j + 1), rand),
  ]
}

function greedyGridPairs(
  slots: Point[],
  ropeCount: number,
  clearance: number,
  rand: () => number,
): [number, number][] | null {
  const n = slots.length
  const asRopes = (pairs: [number, number][]) => pairs.map(([a, b], id) => ({ id, a, b }))
  for (let attempt = 0; attempt < 80; attempt++) {
    const pairs: [number, number][] = []
    for (let tries = 0; tries < 400 && pairs.length < ropeCount; tries++) {
      const a = Math.floor(rand() * n)
      const b = Math.floor(rand() * n)
      if (a === b) continue
      if (!pairs.every(([c, d]) => !segmentsIntersect(slots[a], slots[b], slots[c], slots[d]))) continue
      // The new rope must not run through anyone's peg, and its pegs must not sit on anyone's rope.
      if (!hasPegCollision(slots, asRopes([...pairs, [a, b]]), clearance)) pairs.push([a, b])
    }
    if (pairs.length === ropeCount) return pairs
  }
  return null
}

/** Fallback for any shape: the shortest ropes first, each between two free slots that nothing else is in the way of. */
function nearestPairs(slots: Point[], ropeCount: number, clearance: number): [number, number][] {
  const candidates: { a: number; b: number; d: number }[] = []
  for (let a = 0; a < slots.length; a++) {
    for (let b = a + 1; b < slots.length; b++) {
      candidates.push({ a, b, d: Math.hypot(slots[a].x - slots[b].x, slots[a].y - slots[b].y) })
    }
  }
  candidates.sort((x, y) => x.d - y.d)

  const pairs: [number, number][] = []
  const used = new Set<number>()
  for (const c of candidates) {
    if (pairs.length >= ropeCount) break
    if (used.has(c.a) || used.has(c.b)) continue
    const trial = [...pairs, [c.a, c.b] as [number, number]].map(([a, b], id) => ({ id, a, b }))
    if (hasPegCollision(slots, trial, clearance)) continue
    pairs.push([c.a, c.b])
    used.add(c.a)
    used.add(c.b)
  }
  return pairs
}

/** Short ropes between neighbouring ring slots: always tangle-free and clear of every other peg. */
function ringNeighbourPairs(count: number, ropeCount: number): [number, number][] {
  const pairs: [number, number][] = []
  for (let i = 0; i + 1 < count && pairs.length < ropeCount; i += 2) pairs.push([i, i + 1])
  return pairs
}

/** A tangle-free arrangement of `ropeCount` ropes on the layout, with no rope running through a peg. */
export function generateSolved(layout: LayoutSpec, ropeCount: number, rand: () => number): Rope[] {
  const slots = buildSlots(layout)
  const clearance = ropeClearance(layout)
  const asRopes = (pairs: [number, number][]) => pairs.map(([a, b], id) => ({ id, a, b }))
  let pairs: [number, number][] | null = null

  if (layout.kind === 'ring') {
    for (let attempt = 0; attempt < 400 && !pairs; attempt++) {
      const chosen = shuffle(
        Array.from({ length: slots.length }, (_, i) => i),
        rand,
      )
        .slice(0, ropeCount * 2)
        .sort((x, y) => x - y)
      const candidate = nonCrossingMatching(chosen, rand)
      if (!hasPegCollision(slots, asRopes(candidate), clearance)) pairs = candidate
    }
    pairs ??= ringNeighbourPairs(slots.length, ropeCount)
  } else {
    pairs = greedyGridPairs(slots, ropeCount, clearance, rand) ?? nearestPairs(slots, ropeCount, clearance)
  }

  return asRopes(pairs)
}

export interface GeneratedLevel {
  /** The tangled starting position. */
  ropes: Rope[]
  /** A known way back to a solved board (not necessarily the shortest). */
  solution: Move[]
}

/**
 * Builds a solvable level: start from a tangle-free board and scramble it with `scrambleMoves` moves, each
 * picked from a few random candidates to favour the one that tangles the ropes most. A scramble move is only
 * accepted if undoing it is a legal move under the layer rule (the peg's way back crosses no rope above it), so playing the scramble backwards is a real
 * solution and every level is solvable by construction.
 */
export function generateLevel(
  layout: LayoutSpec,
  ropeCount: number,
  scrambleMoves: number,
  minConflicts: number,
  seed: number,
): GeneratedLevel {
  const slots = buildSlots(layout)
  const count = slotCount(layout)
  const clearance = ropeClearance(layout)
  let best: (GeneratedLevel & { conflicts: number }) | null = null

  for (let attempt = 0; attempt < 60; attempt++) {
    const rand = createRng(seed + attempt * 104729)
    let ropes = generateSolved(layout, ropeCount, rand)
    const solution: Move[] = []
    let previous: { ropeId: number; end: 'a' | 'b'; from: number } | null = null

    for (let step = 0; step < scrambleMoves; step++) {
      const empty = emptySlots(ropes, count)
      if (empty.length === 0) break
      let pick: { ropes: Rope[]; ropeId: number; end: 'a' | 'b'; from: number; to: number; score: number } | null = null

      for (let c = 0; c < 8; c++) {
        const rope = ropes[Math.floor(rand() * ropes.length)]
        const end: 'a' | 'b' = rand() < 0.5 ? 'a' : 'b'
        const to = empty[Math.floor(rand() * empty.length)]
        if (previous && previous.ropeId === rope.id && previous.end === end && previous.from === to) continue
        const next = moveEndClear(slots, clearance, ropes, rope.id, end, to)
        if (!next) continue
        // The way back must be playable: dragging the peg back must not have to cross a rope lying above it.
        if (pathBlocked(slots, clearance, next, rope.id, slots[to], slots[rope[end]])) continue
        const score = countConflicts(slots, next) + rand() * 0.5
        if (!pick || score > pick.score) pick = { ropes: next, ropeId: rope.id, end, from: rope[end], to, score }
      }

      if (!pick) continue
      solution.unshift({ ropeId: pick.ropeId, end: pick.end, from: pick.to, to: pick.from })
      previous = { ropeId: pick.ropeId, end: pick.end, from: pick.from }
      ropes = pick.ropes
    }

    const conflicts = countConflicts(slots, ropes)
    if (conflicts >= minConflicts && solution.length > 0) return { ropes, solution }
    if (conflicts > 0 && solution.length > 0 && (!best || conflicts > best.conflicts)) {
      best = { ropes, solution, conflicts }
    }
  }

  if (best) return { ropes: best.ropes, solution: best.solution }
  throw new Error('Could not generate an untangle level')
}
