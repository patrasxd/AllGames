import { describe, it, expect } from 'vitest'
import { intersectionPoint, segmentsIntersect } from '../logic/geometry'

const P = (x: number, y: number) => ({ x, y })

describe('segmentsIntersect', () => {
  it('detects a proper crossing', () => {
    expect(segmentsIntersect(P(0, 0), P(10, 10), P(0, 10), P(10, 0))).toBe(true)
  })

  it('returns false for separate segments', () => {
    expect(segmentsIntersect(P(0, 0), P(10, 0), P(0, 5), P(10, 5))).toBe(false)
    expect(segmentsIntersect(P(0, 0), P(4, 4), P(6, 6), P(10, 10))).toBe(false)
  })

  it('treats an end resting on another rope as a tangle', () => {
    expect(segmentsIntersect(P(0, 0), P(10, 0), P(5, 0), P(5, 8))).toBe(true)
  })

  it('treats overlapping collinear ropes as a tangle', () => {
    expect(segmentsIntersect(P(0, 0), P(6, 0), P(4, 0), P(10, 0))).toBe(true)
  })

  it('does not flag collinear ropes that are only in line', () => {
    expect(segmentsIntersect(P(0, 0), P(4, 0), P(6, 0), P(10, 0))).toBe(false)
  })
})

describe('intersectionPoint', () => {
  it('returns the crossing point', () => {
    const p = intersectionPoint(P(0, 0), P(10, 10), P(0, 10), P(10, 0))
    expect(p?.x).toBeCloseTo(5)
    expect(p?.y).toBeCloseTo(5)
  })

  it('returns null for apart segments', () => {
    expect(intersectionPoint(P(0, 0), P(1, 0), P(0, 5), P(1, 5))).toBeNull()
  })

  it('returns a contact point for collinear overlap', () => {
    const p = intersectionPoint(P(0, 0), P(6, 0), P(4, 0), P(10, 0))
    expect(p).not.toBeNull()
    expect(p?.y).toBeCloseTo(0)
  })
})
