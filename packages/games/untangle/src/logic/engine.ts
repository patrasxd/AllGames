import type { Conflict, Move, Point, Rope, RopeEnd } from '../types'
import { ROPE_PEG_PADDING } from './layouts'
import { distance, distanceToSegment, intersectionPoint, segmentDistance, segmentsIntersect } from './geometry'

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
 * Ropes lie in layers: a rope with a higher id lies on top of one with a lower id. A held rope end can slide
 * over the ropes beneath its own rope, but never across a rope that lies on top of it. So this says whether
 * dragging the end of rope `ropeId` along the straight path `from` -> `to` would run into a rope above it.
 */
export function pathBlocked(
  slots: Point[],
  clearance: number,
  ropes: Rope[],
  ropeId: number,
  from: Point,
  to: Point,
): boolean {
  for (const other of ropes) {
    if (other.id <= ropeId) continue
    if (segmentDistance(from, to, slots[other.a], slots[other.b]) < clearance) return true
  }
  return false
}

/**
 * The same continuous collision rules as pointer dragging. A held peg cannot run into another peg,
 * swing its rope through another peg, or cross a rope above its own layer. Ropes below it are passable.
 * Sampling at most one board unit apart matches the live board and prevents click-to-move teleporting.
 */
export function constrainHeldPoint(
  slots: Point[],
  ropes: Rope[],
  pegR: number,
  clearance: number,
  ropeId: number,
  end: RopeEnd,
  previous: Point,
  target: Point,
): Point {
  const rope = ropes.find((r) => r.id === ropeId)
  if (!rope) return previous
  const fixed = slots[end === 'a' ? rope.b : rope.a]
  const obstacles = ropes.filter((r) => r.id !== ropeId).flatMap((r) => [slots[r.a], slots[r.b]])
  const walls = ropes.filter((r) => r.id > ropeId)
  const free = (q: Point) =>
    obstacles.every((o) => distance(o, q) >= pegR * 2 && distanceToSegment(o, fixed, q) >= clearance) &&
    walls.every((w) => distanceToSegment(q, slots[w.a], slots[w.b]) >= clearance)
  const steps = Math.max(1, Math.ceil(distance(previous, target)))
  let held = previous
  for (let i = 1; i <= steps; i++) {
    const q = {
      x: previous.x + ((target.x - previous.x) * i) / steps,
      y: previous.y + ((target.y - previous.y) * i) / steps,
    }
    if (!free(q)) break
    held = q
  }
  return held
}

/** Checks a straight drag; curved pointer routes remain possible with constrainHeldPoint. */
export function canDragStraight(
  slots: Point[],
  clearance: number,
  ropes: Rope[],
  ropeId: number,
  end: RopeEnd,
  from: Point,
  to: Point,
): boolean {
  const held = constrainHeldPoint(
    slots,
    ropes,
    Math.max(0, clearance - ROPE_PEG_PADDING),
    clearance,
    ropeId,
    end,
    from,
    to,
  )
  return distance(held, to) < 0.001
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
 * The move rule of the game. The final position must be clear, and a click must be possible as a physical
 * straight drag (not a teleport). A dragged peg can take a curved route checked step by step by the board.
 * `checkPath: false` is only for an already-validated pointer path or a provisional destination check.
 */
export function tryMoveEnd(
  slots: Point[],
  clearance: number,
  ropes: Rope[],
  ropeId: number,
  end: RopeEnd,
  to: number,
  options: { checkPath?: boolean } = {},
): Rope[] | null {
  const rope = ropes.find((r) => r.id === ropeId)
  if (!rope) return null
  const next = moveEndClear(slots, clearance, ropes, ropeId, end, to)
  if (!next) return null
  if (
    options.checkPath !== false &&
    clearance > 0 &&
    !canDragStraight(slots, clearance, ropes, ropeId, end, slots[rope[end]], slots[to])
  )
    return null
  return next
}

/**
 * Ropes that no longer cross any other rope are untangled: they are taken off the board. Returns the ropes
 * that stay and the ones that were released. Ids are kept, so layers do not change.
 */
export function releaseFreeRopes(slots: Point[], ropes: Rope[]): { remaining: Rope[]; freed: Rope[] } {
  const tangled = conflictingRopeIds(findConflicts(slots, ropes))
  return {
    remaining: ropes.filter((r) => tangled.has(r.id)),
    freed: ropes.filter((r) => !tangled.has(r.id)),
  }
}
