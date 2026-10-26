import { describe, it, expect } from 'vitest'
import {
  applyMoves,
  conflictingRopeIds,
  emptySlots,
  endAt,
  findConflicts,
  findSegmentConflicts,
  hasPegCollision,
  isEndFree,
  moveEndClear,
  tryMoveEnd,
  isSolved,
  moveEnd,
  occupiedSlots,
} from '../logic/engine'
import { buildSlots, gridLayout, pegRadius, ringLayout, ropeClearance, slotCount, slotSpacing } from '../logic/layouts'
import { solveMinMoves } from '../logic/solver'
import type { Rope } from '../types'

const grid = gridLayout(3)
const gridSlots = buildSlots(grid)

describe('layouts', () => {
  it('builds row-major grids inside the board', () => {
    expect(gridSlots).toHaveLength(9)
    expect(gridSlots[0].x).toBeLessThan(gridSlots[1].x)
    expect(gridSlots[0].y).toBeLessThan(gridSlots[3].y)
    for (const p of gridSlots) {
      expect(p.x).toBeGreaterThan(0)
      expect(p.x).toBeLessThan(100)
    }
  })

  it('places ring slots clockwise from the top at equal distance from the centre', () => {
    const slots = buildSlots(ringLayout(12))
    expect(slotCount(ringLayout(12))).toBe(12)
    expect(slots[0].x).toBeCloseTo(50)
    expect(slots[0].y).toBeLessThan(50)
    expect(slots[3].x).toBeGreaterThan(50)
    const radius = 50 - slots[0].y
    for (const p of slots) expect(Math.hypot(p.x - 50, p.y - 50)).toBeCloseTo(radius)
  })

  it('keeps pegs smaller than the gap between slots', () => {
    for (const layout of [gridLayout(3), gridLayout(5), ringLayout(16)]) {
      expect(pegRadius(layout) * 2).toBeLessThan(slotSpacing(layout))
    }
  })
})

describe('conflicts', () => {
  // slots: 0 1 2 / 3 4 5 / 6 7 8
  const crossed: Rope[] = [
    { id: 0, a: 0, b: 8 },
    { id: 1, a: 2, b: 6 },
  ]

  it('finds crossing ropes and where they meet', () => {
    const conflicts = findConflicts(gridSlots, crossed)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({ a: 0, b: 1 })
    expect(conflicts[0].point.x).toBeCloseTo(50)
    expect(conflictingRopeIds(conflicts)).toEqual(new Set([0, 1]))
    expect(isSolved(gridSlots, crossed)).toBe(false)
  })

  it('accepts ropes that do not meet', () => {
    expect(
      isSolved(gridSlots, [
        { id: 0, a: 0, b: 2 },
        { id: 1, a: 3, b: 5 },
      ]),
    ).toBe(true)
  })

  it('counts a rope passing through another rope end as a tangle', () => {
    // Rope 0 runs along the top row through slot 1, where rope 1 has an end.
    const ropes: Rope[] = [
      { id: 0, a: 0, b: 2 },
      { id: 1, a: 1, b: 4 },
    ]
    expect(isSolved(gridSlots, ropes)).toBe(false)
  })
})

describe('live conflicts for free segments', () => {
  it('detects a rope end dragged across another rope', () => {
    const conflicts = findSegmentConflicts([
      { id: 0, a: { x: 0, y: 0 }, b: { x: 10, y: 0 } },
      { id: 1, a: { x: 5, y: -5 }, b: { x: 5, y: 5 } },
      { id: 2, a: { x: 0, y: 20 }, b: { x: 10, y: 20 } },
    ])
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({ a: 0, b: 1 })
  })

  it("flags a rope running straight through another rope's peg", () => {
    const conflicts = findSegmentConflicts([
      { id: 0, a: { x: 0, y: 0 }, b: { x: 10, y: 0 } },
      { id: 1, a: { x: 5, y: 0 }, b: { x: 5, y: 8 } },
    ])
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].point).toEqual({ x: 5, y: 0 })
  })
})

describe('moves', () => {
  const ropes: Rope[] = [
    { id: 0, a: 0, b: 8 },
    { id: 1, a: 2, b: 6 },
  ]

  it('tracks occupied and empty slots', () => {
    expect(occupiedSlots(ropes)).toEqual(new Set([0, 8, 2, 6]))
    expect(emptySlots(ropes, 9)).toEqual([1, 3, 4, 5, 7])
    expect(endAt(ropes, 2)).toEqual({ ropeId: 1, end: 'a' })
    expect(endAt(ropes, 4)).toBeNull()
  })

  it('moves a rope end to an empty slot without mutating the input', () => {
    const next = moveEnd(ropes, 1, 'a', 5, 9)
    expect(next).not.toBeNull()
    expect(next![1]).toEqual({ id: 1, a: 5, b: 6 })
    expect(ropes[1].a).toBe(2)
  })

  it('rejects occupied, out-of-range and unknown targets', () => {
    expect(moveEnd(ropes, 1, 'a', 8, 9)).toBeNull()
    expect(moveEnd(ropes, 1, 'a', 2, 9)).toBeNull()
    expect(moveEnd(ropes, 1, 'a', 9, 9)).toBeNull()
    expect(moveEnd(ropes, 1, 'a', -1, 9)).toBeNull()
    expect(moveEnd(ropes, 7, 'a', 4, 9)).toBeNull()
  })

  it('applies a move list and stops at an illegal move', () => {
    expect(applyMoves(ropes, [{ ropeId: 1, end: 'a', from: 2, to: 5 }], 9)).not.toBeNull()
    expect(
      applyMoves(
        ropes,
        [
          { ropeId: 1, end: 'a', from: 2, to: 5 },
          { ropeId: 0, end: 'a', from: 0, to: 5 },
        ],
        9,
      ),
    ).toBeNull()
  })
})

describe('solver', () => {
  it('returns 0 for a solved board', () => {
    expect(
      solveMinMoves(gridSlots, [
        { id: 0, a: 0, b: 2 },
        { id: 1, a: 3, b: 5 },
      ]),
    ).toBe(0)
  })

  it('finds the fewest moves for a simple tangle', () => {
    const ropes: Rope[] = [
      { id: 0, a: 0, b: 8 },
      { id: 1, a: 2, b: 6 },
    ]
    const result = solveMinMoves(gridSlots, ropes)
    expect(result).not.toBeNull()
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(2)
  })

  it('gives up on boards that are too large for the budget', () => {
    const big = buildSlots(gridLayout(5))
    expect(
      solveMinMoves(big, [
        { id: 0, a: 0, b: 24 },
        { id: 1, a: 4, b: 20 },
      ]),
    ).toBeNull()
  })
})

describe('ropes and pegs', () => {
  // 3x3 slots:  0 1 2 / 3 4 5 / 6 7 8
  const clearance = ropeClearance(grid)

  it("detects a rope running through another rope's peg", () => {
    const ropes: Rope[] = [
      { id: 0, a: 0, b: 2 }, // along the top row, straight through slot 1
      { id: 1, a: 1, b: 7 },
    ]
    expect(hasPegCollision(gridSlots, ropes, clearance)).toBe(true)
  })

  it('detects a peg sitting on another rope', () => {
    expect(
      hasPegCollision(
        gridSlots,
        [
          { id: 0, a: 0, b: 8 }, // diagonal through slot 4
          { id: 1, a: 4, b: 5 },
        ],
        clearance,
      ),
    ).toBe(true)
  })

  it('allows ropes that cross each other without touching any peg', () => {
    expect(
      hasPegCollision(
        gridSlots,
        [
          { id: 0, a: 0, b: 5 },
          { id: 1, a: 2, b: 3 },
        ],
        clearance,
      ),
    ).toBe(false)
  })

  it('refuses a move that would run a rope through a peg, but allows others', () => {
    const ropes: Rope[] = [
      { id: 0, a: 0, b: 6 },
      { id: 1, a: 1, b: 7 },
    ]
    // Rope 0 would run 0 -> 8 along... via the diagonal through slot 4, which is empty: fine.
    expect(tryMoveEnd(gridSlots, clearance, ropes, 0, 'b', 8)).not.toBeNull()
    // Moving rope 0's end to slot 2 would run it along the top row through rope 1's peg in slot 1.
    expect(tryMoveEnd(gridSlots, clearance, ropes, 0, 'b', 2)).toBeNull()
    // The plain move is still geometrically fine, only the peg rule refuses it.
    expect(moveEnd(ropes, 0, 'b', 2, 9)).not.toBeNull()
    // Occupied targets stay illegal.
    expect(tryMoveEnd(gridSlots, clearance, ropes, 0, 'b', 7)).toBeNull()
  })
})

describe('layers: buried ends', () => {
  // 3x3 slots: 0 1 2 / 3 4 5 / 6 7 8. Higher rope id lies on top.
  const clearance = ropeClearance(grid)
  // Three ropes in an X-like tangle: rope 0 (0-8 diagonal) is crossed by rope 1 (2-6) and rope 2 (3-5).
  const ropes: Rope[] = [
    { id: 0, a: 0, b: 8 },
    { id: 1, a: 2, b: 6 },
  ]

  it('frees every end of a rope that nothing crosses', () => {
    const apart: Rope[] = [
      { id: 0, a: 0, b: 2 },
      { id: 1, a: 3, b: 5 },
    ]
    for (const r of apart)
      for (const end of ['a', 'b'] as const) expect(isEndFree(gridSlots, apart, r.id, end)).toBe(true)
  })

  it('lets the rope on top move, but buries the end under it', () => {
    // The two diagonals cross in the middle; rope 1 lies on top of rope 0.
    expect(isEndFree(gridSlots, ropes, 1, 'a')).toBe(true)
    expect(isEndFree(gridSlots, ropes, 1, 'b')).toBe(true)
    expect(isEndFree(gridSlots, ropes, 0, 'a')).toBe(false)
    expect(isEndFree(gridSlots, ropes, 0, 'b')).toBe(false)
  })

  it('judges each end by the first rope met when walking away from it', () => {
    // Rope 1 (1 -> 7, vertical) is crossed first by rope 2 (below it), then by rope 3 (above it) coming from slot 1.
    const stack: Rope[] = [
      { id: 0, a: 0, b: 8 }, // diagonal; crosses the vertical rope in the middle at (4)
      { id: 1, a: 1, b: 7 },
      { id: 2, a: 3, b: 5 },
    ]
    // Rope 1 end at slot 7 meets rope 0 (the diagonal) first? Both cross at the centre: rope 2 and rope 0 are
    // at the same point, so the strongest (rope 2) decides, and rope 2 is above rope 1 -> buried from both sides.
    expect(isEndFree(gridSlots, stack, 1, 'a')).toBe(false)
    expect(isEndFree(gridSlots, stack, 1, 'b')).toBe(false)
    // Rope 2 is on top of everything, so both of its ends are free.
    expect(isEndFree(gridSlots, stack, 2, 'a')).toBe(true)
    expect(isEndFree(gridSlots, stack, 2, 'b')).toBe(true)
  })

  it('refuses to move a buried end even to a perfectly good hole', () => {
    expect(moveEndClear(gridSlots, clearance, ropes, 0, 'a', 1)).not.toBeNull()
    expect(tryMoveEnd(gridSlots, clearance, ropes, 0, 'a', 1)).toBeNull()
    expect(tryMoveEnd(gridSlots, clearance, ropes, 1, 'a', 1)).not.toBeNull()
  })

  it('treats an unknown rope as not free', () => {
    expect(isEndFree(gridSlots, ropes, 9, 'a')).toBe(false)
  })
})
