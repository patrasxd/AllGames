import type { Point } from '../types'

const EPS = 1e-7

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

function orient(o: Point, a: Point, b: Point): -1 | 0 | 1 {
  const c = cross(o, a, b)
  if (Math.abs(c) < EPS) return 0
  return c > 0 ? 1 : -1
}

/** Whether `r` lies inside the bounding box of `p`-`q` (only meaningful when the three are collinear). */
function inBox(p: Point, q: Point, r: Point): boolean {
  return (
    r.x >= Math.min(p.x, q.x) - EPS &&
    r.x <= Math.max(p.x, q.x) + EPS &&
    r.y >= Math.min(p.y, q.y) - EPS &&
    r.y <= Math.max(p.y, q.y) + EPS
  )
}

/**
 * Whether segments p1-p2 and p3-p4 share any point. Touching counts: a rope whose end lies on another rope,
 * or two collinear ropes that overlap, are as tangled as two ropes that cross.
 */
export function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const o1 = orient(p1, p2, p3)
  const o2 = orient(p1, p2, p4)
  const o3 = orient(p3, p4, p1)
  const o4 = orient(p3, p4, p2)

  if (o1 !== o2 && o3 !== o4) return true
  if (o1 === 0 && inBox(p1, p2, p3)) return true
  if (o2 === 0 && inBox(p1, p2, p4)) return true
  if (o3 === 0 && inBox(p3, p4, p1)) return true
  if (o4 === 0 && inBox(p3, p4, p2)) return true
  return false
}

/** A representative meeting point of two segments, or `null` when they are apart. */
export function intersectionPoint(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  if (!segmentsIntersect(p1, p2, p3, p4)) return null

  const d1 = { x: p2.x - p1.x, y: p2.y - p1.y }
  const d2 = { x: p4.x - p3.x, y: p4.y - p3.y }
  const denom = d1.x * d2.y - d1.y * d2.x

  if (Math.abs(denom) > EPS) {
    const t = ((p3.x - p1.x) * d2.y - (p3.y - p1.y) * d2.x) / denom
    return { x: p1.x + t * d1.x, y: p1.y + t * d1.y }
  }

  // Parallel and touching: collinear overlap, so one of the endpoints is the meeting point.
  if (inBox(p1, p2, p3)) return p3
  if (inBox(p1, p2, p4)) return p4
  if (inBox(p3, p4, p1)) return p1
  if (inBox(p3, p4, p2)) return p2
  return null
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Shortest distance from point `p` to the segment `a`-`b`. */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return distance(p, a)
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq))
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy })
}

/** Shortest distance between two segments (0 when they cross or touch). */
export function segmentDistance(a: Point, b: Point, c: Point, d: Point): number {
  if (segmentsIntersect(a, b, c, d)) return 0
  return Math.min(
    distanceToSegment(a, c, d),
    distanceToSegment(b, c, d),
    distanceToSegment(c, a, b),
    distanceToSegment(d, a, b),
  )
}
