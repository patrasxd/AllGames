import type { Conflict, Move, Point, Rope, RopeEnd } from '../types'
import { distance, distanceToSegment, intersectionPoint, segmentsIntersect } from './geometry'

export function cloneRopes(ropes: Rope[]): Rope[] {
  return ropes.map((r) => ({ ...r }))
}

export interface Segment {
  id: number
  a: Point
  b: Point
}

/** Conflicts between ropes drawn as free segments (used for the live preview while a rope end is dragged). */
export function findSegmentConflicts(segments: Segment[]): Conflict[] {
  const conflicts: Conflict[] = []
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const point = intersectionPoint(segments[i].a, segments[i].b, segments[j].a, segments[j].b)
      if (point) {
        const [a, b] =
          segments[i].id < segments[j].id ? [segments[i].id, segments[j].id] : [segments[j].id, segments[i].id]
        conflicts.push({ a, b, point })
      }
    }
  }
  return conflicts
}

/** All pairs of ropes that cross, touch or overlap, with the point where they meet. */
export function findConflicts(slots: Point[], ropes: Rope[]): Conflict[] {
  return findSegmentConflicts(ropes.map((r) => ({ id: r.id, a: slots[r.a], b: slots[r.b] })))
}

/** Cheaper than `findConflicts` when only a yes/no answer is needed. */
export function hasConflict(slots: Point[], ropes: Rope[]): boolean {
  for (let i = 0; i < ropes.length; i++) {
    for (let j = i + 1; j < ropes.length; j++) {
      if (segmentsIntersect(slots[ropes[i].a], slots[ropes[i].b], slots[ropes[j].a], slots[ropes[j].b])) return true
    }
  }
  return false
}

export function countConflicts(slots: Point[], ropes: Rope[]): number {
  let count = 0
  for (let i = 0; i < ropes.length; i++) {
    for (let j = i + 1; j < ropes.length; j++) {
      if (segmentsIntersect(slots[ropes[i].a], slots[ropes[i].b], slots[ropes[j].a], slots[ropes[j].b])) count++
    }
  }
  return count
}

export function isSolved(slots: Point[], ropes: Rope[]): boolean {
  return !hasConflict(slots, ropes)
}

export function conflictingRopeIds(conflicts: Conflict[]): Set<number> {
  const ids = new Set<number>()
  for (const c of conflicts) {
    ids.add(c.a)
    ids.add(c.b)
  }
  return ids
}

export function occupiedSlots(ropes: Rope[]): Set<number> {
  const set = new Set<number>()
  for (const r of ropes) {
    set.add(r.a)
    set.add(r.b)
  }
  return set
}

export function emptySlots(ropes: Rope[], count: number): number[] {
  const occupied = occupiedSlots(ropes)
  const empty: number[] = []
  for (let i = 0; i < count; i++) if (!occupied.has(i)) empty.push(i)
  return empty
}

/** The rope end sitting in a slot, if any. */
export function endAt(ropes: Rope[], slot: number): { ropeId: number; end: RopeEnd } | null {
  for (const r of ropes) {
    if (r.a === slot) return { ropeId: r.id, end: 'a' }
    if (r.b === slot) return { ropeId: r.id, end: 'b' }
  }
  return null
}

/**
 * Moves one end of a rope to an empty slot. Returns the new rope list, or `null` when the move is not
 * allowed (unknown rope, slot out of range, slot already occupied, or the end is already there).
 */
export function moveEnd(ropes: Rope[], ropeId: number, end: RopeEnd, to: number, count: number): Rope[] | null {
  if (!Number.isInteger(to) || to < 0 || to >= count) return null
  const rope = ropes.find((r) => r.id === ropeId)
  if (!rope) return null
  if (occupiedSlots(ropes).has(to)) return null
  return ropes.map((r) => (r.id === ropeId ? { ...r, [end]: to } : r))
}

/** Applies a list of moves in order, stopping (and returning `null`) at the first illegal one. */
export function applyMoves(ropes: Rope[], moves: Move[], count: number): Rope[] | null {
  let current = ropes
  for (const m of moves) {
    const next = moveEnd(current, m.ropeId, m.end, m.to, count)
    if (!next) return null
    current = next
  }
  return current
}

/**
 * Whether any rope runs through (or sits on) a peg belonging to another rope. Such positions can never
 * occur in play: moves that would create one are refused.
 */
export function hasPegCollision(slots: Point[], ropes: Rope[], clearance: number): boolean {
  for (const rope of ropes) {
    const a = slots[rope.a]
    const b = slots[rope.b]
    for (const other of ropes) {
      if (other.id === rope.id) continue
      if (distanceToSegment(slots[other.a], a, b) < clearance) return true
      if (distanceToSegment(slots[other.b], a, b) < clearance) return true
    }
  }
  return false
}

/**
 * Ropes lie in layers: a rope with a higher id lies on top of one with a lower id. A rope end can only be
 * picked up when it is not buried: walking from its peg along the rope, the first rope that crosses it must
 * lie underneath (or there must be no crossing at all). So the order in which ropes are moved matters.
 */
export function isEndFree(slots: Point[], ropes: Rope[], ropeId: number, end: RopeEnd): boolean {
  const rope = ropes.find((r) => r.id === ropeId)
  if (!rope) return false
  const from = slots[rope[end]]
  const to = slots[rope[end === 'a' ? 'b' : 'a']]

  let nearest = Infinity
  let strongest = -1 // highest layer among the ropes crossing at that nearest point
  for (const other of ropes) {
    if (other.id === rope.id) continue
    const point = intersectionPoint(from, to, slots[other.a], slots[other.b])
    if (!point) continue
    const t = distance(from, point)
    if (t < nearest - 1e-6) {
      nearest = t
      strongest = other.id
    } else if (Math.abs(t - nearest) <= 1e-6) {
      strongest = Math.max(strongest, other.id)
    }
  }
  return strongest < rope.id
}

/**
 * Moves a rope end to an empty slot, ignoring the layers: only refuses a move that would leave a rope
 * running through another rope's peg, or a peg landing on another rope. Used to build levels.
 */
export function moveEndClear(
  slots: Point[],
  clearance: number,
  ropes: Rope[],
  ropeId: number,
  end: RopeEnd,
  to: number,
): Rope[] | null {
  const next = moveEnd(ropes, ropeId, end, to, slots.length)
  if (!next || hasPegCollision(slots, next, clearance)) return null
  return next
}

/**
 * The move rule of the game. Like `moveEnd`, but the end must not be buried under another rope
 * (`isEndFree`), and the move must not run a rope through another rope's peg. Ropes may still cross each
 * other: untangling them is the whole game.
 */
export function tryMoveEnd(
  slots: Point[],
  clearance: number,
  ropes: Rope[],
  ropeId: number,
  end: RopeEnd,
  to: number,
): Rope[] | null {
  if (!isEndFree(slots, ropes, ropeId, end)) return null
  return moveEndClear(slots, clearance, ropes, ropeId, end, to)
}
