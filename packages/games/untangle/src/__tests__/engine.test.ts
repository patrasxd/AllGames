import { describe, it, expect } from 'vitest'
import {
  applyMoves,
  conflictingRopeIds,
  emptySlots,
  endAt,
  findConflicts,
  findSegmentConflicts,
  hasPegCollision,
  pathBlocked,
  releaseFreeRopes,
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
    // Rope 1 lies on top, so nothing above it can block it: only the peg rule is tested here.
    const ropes: Rope[] = [
      { id: 0, a: 1, b: 7 },
      { id: 1, a: 0, b: 6 },
    ]
    // Moving rope 1's end to slot 2 would run it along the top row through rope 0's peg in slot 1.
    expect(tryMoveEnd(gridSlots, clearance, ropes, 1, 'b', 2)).toBeNull()
    // The plain move is still geometrically fine, only the peg rule refuses it.
    expect(moveEnd(ropes, 1, 'b', 2, 9)).not.toBeNull()
    // Rope 1 to the opposite corner is fine.
    expect(tryMoveEnd(gridSlots, clearance, ropes, 1, 'b', 8)).not.toBeNull()
    // Occupied targets stay illegal.
    expect(tryMoveEnd(gridSlots, clearance, ropes, 1, 'b', 7)).toBeNull()
  })
})

describe('layers: dragging a peg across ropes', () => {
  // The 3x3 board; slots are numbered 1-9 in the comments (row by row), indices 0-8 in the code.
  // Higher rope id = lies on top.
  const clearance = ropeClearance(grid)
  const at = (n: number) => n - 1

  // Red (lowest) 3-8, blue 1-9, green (top) 2-6.
  const crossing: Rope[] = [
    { id: 0, a: at(3), b: at(8) },
    { id: 1, a: at(1), b: at(9) },
    { id: 2, a: at(2), b: at(6) },
  ]
  // Red (lowest) 6-7, blue 3-8, green (top) 2-9.
  const tangle: Rope[] = [
    { id: 0, a: at(6), b: at(7) },
    { id: 1, a: at(3), b: at(8) },
    { id: 2, a: at(2), b: at(9) },
  ]
  const move = (ropes: Rope[], id: number, end: 'a' | 'b', to: number) =>
    tryMoveEnd(gridSlots, clearance, ropes, id, end, at(to))

  it('lets the lowest rope move along the edge: 8 -> 7 and 8 -> 4', () => {
    expect(move(crossing, 0, 'b', 7)).not.toBeNull()
    expect(move(crossing, 0, 'b', 4)).not.toBeNull()
  })

  it('lets red go 7 -> 4 and 7 -> 1, but not 6 -> 5 across the ropes above it', () => {
    expect(move(tangle, 0, 'b', 4)).not.toBeNull()
    expect(move(tangle, 0, 'b', 1)).not.toBeNull()
    expect(move(tangle, 0, 'a', 5)).toBeNull()
  })

  it('never blocks the rope on top: nothing lies above it', () => {
    expect(move(tangle, 2, 'a', 1)).not.toBeNull()
    expect(move(tangle, 2, 'b', 5)).not.toBeNull()
  })

  it('refuses to drag a peg across a rope above it, but allows crossing a rope beneath it', () => {
    // Green runs across the middle row; a blue peg wants to go from the bottom middle to the top middle.
    const green = { id: 2, a: at(4), b: at(6) }
    const blueBelow: Rope[] = [{ id: 1, a: at(1), b: at(8) }, green]
    expect(move(blueBelow, 1, 'b', 2)).toBeNull()
    // The same shapes with the layers swapped: now the moving rope is the top one.
    const blueOnTop: Rope[] = [
      { id: 1, a: at(4), b: at(6) },
      { id: 2, a: at(1), b: at(8) },
    ]
    expect(move(blueOnTop, 2, 'b', 2)).not.toBeNull()
  })

  it('judges the straight path with pathBlocked', () => {
    const from = gridSlots[at(8)]
    const to = gridSlots[at(2)]
    expect(pathBlocked(gridSlots, clearance, [{ id: 0, a: at(4), b: at(6) }], 5, from, to)).toBe(false) // no rope above
    expect(pathBlocked(gridSlots, clearance, [{ id: 7, a: at(4), b: at(6) }], 5, from, to)).toBe(true)
    expect(pathBlocked(gridSlots, clearance, [{ id: 7, a: at(7), b: at(9) }], 5, from, gridSlots[at(7)])).toBe(true)
  })

  it('can skip the straight-path test for a peg that was dragged around an obstacle', () => {
    expect(tryMoveEnd(gridSlots, clearance, tangle, 0, 'a', at(5), { checkPath: false })).not.toBeNull()
  })
})

describe('untangled ropes leave the board', () => {
  it('releases ropes that cross nothing and keeps the tangled ones, with their ids', () => {
    // Ropes 0 and 1 cross; rope 2 runs along the bottom row, clear of both.
    const ropes: Rope[] = [
      { id: 0, a: 0, b: 5 },
      { id: 1, a: 2, b: 3 },
      { id: 2, a: 6, b: 8 },
    ]
    const { remaining, freed } = releaseFreeRopes(gridSlots, ropes)
    expect(remaining.map((r) => r.id)).toEqual([0, 1])
    expect(freed.map((r) => r.id)).toEqual([2])
  })

  it('releases everything once nothing crosses', () => {
    const ropes: Rope[] = [
      { id: 0, a: 0, b: 2 },
      { id: 1, a: 3, b: 5 },
    ]
    const { remaining, freed } = releaseFreeRopes(gridSlots, ropes)
    expect(remaining).toHaveLength(0)
    expect(freed).toHaveLength(2)
  })

  it('keeps a pair of crossing ropes together', () => {
    const ropes: Rope[] = [
      { id: 0, a: 0, b: 8 },
      { id: 1, a: 2, b: 6 },
    ]
    expect(releaseFreeRopes(gridSlots, ropes).freed).toHaveLength(0)
  })
})
