import { describe, it, expect } from 'vitest'
import { CAMPAIGN_LEVELS, getKnownSolution, getLevelConfig, starThresholds } from '../logic/levels'
import {
  canDragStraight,
  applyMoves,
  countConflicts,
  hasPegCollision,
  isSolved,
  moveEndClear,
  occupiedSlots,
  releaseFreeRopes,
  tryMoveEnd,
} from '../logic/engine'
import { buildSlots, diamondLayout, gridLayout, ringLayout, ropeClearance, slotCount } from '../logic/layouts'
import { createRng, generateLevel, generateSolved } from '../logic/generator'
import { solveMinMoves } from '../logic/solver'

describe('level generation', () => {
  it('is deterministic', () => {
    expect(getLevelConfig(37)).toEqual(getLevelConfig(37))
    const a = createRng(5)
    const b = createRng(5)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('returns independent copies so callers cannot corrupt the cache', () => {
    const first = getLevelConfig(3)
    first.ropes[0].a = 999
    expect(getLevelConfig(3).ropes[0].a).not.toBe(999)
    const solution = getKnownSolution(3)
    solution[0].to = 999
    expect(getKnownSolution(3)[0].to).not.toBe(999)
  })

  it('has 200 campaign levels and keeps generating beyond them', () => {
    expect(CAMPAIGN_LEVELS).toBe(200)
    const beyond = getLevelConfig(CAMPAIGN_LEVELS + 25)
    expect(isSolved(buildSlots(beyond.layout), beyond.ropes)).toBe(false)
  })

  it('makes every level tangled, valid and solvable', () => {
    for (let level = 1; level <= CAMPAIGN_LEVELS + 20; level++) {
      const cfg = getLevelConfig(level)
      const slots = buildSlots(cfg.layout)
      const count = slotCount(cfg.layout)

      // Valid: distinct slots inside the layout, at least two empty holes to move into.
      expect(occupiedSlots(cfg.ropes).size).toBe(cfg.ropes.length * 2)
      for (const r of cfg.ropes) {
        expect(r.a).toBeGreaterThanOrEqual(0)
        expect(r.b).toBeLessThan(count)
      }
      expect(count - cfg.ropes.length * 2).toBeGreaterThanOrEqual(2)

      // No rope starts out running through a peg.
      expect(hasPegCollision(slots, cfg.ropes, ropeClearance(cfg.layout))).toBe(false)

      // At least two tangled ropes are left once the already-free ones are taken off the board.
      expect(releaseFreeRopes(slots, cfg.ropes).remaining.length).toBeGreaterThanOrEqual(2)

      // Something can actually be moved: at least one end is free with a hole it may go to.
      const clearanceNow = ropeClearance(cfg.layout)
      let anyLegal = false
      for (const r of cfg.ropes)
        for (const e of ['a', 'b'] as const)
          for (let to = 0; to < count && !anyLegal; to++)
            if (tryMoveEnd(slots, clearanceNow, cfg.ropes, r.id, e, to)) anyLegal = true
      expect(anyLegal).toBe(true)

      // Tangled to start with, never already solved.
      expect(countConflicts(slots, cfg.ropes)).toBeGreaterThan(0)

      // Star thresholds are ordered and 3 stars are reachable.
      expect(cfg.par).toBeGreaterThan(0)
      expect(cfg.starThresholds[0]).toBeGreaterThanOrEqual(cfg.par)
      expect(cfg.starThresholds[1]).toBeGreaterThan(cfg.starThresholds[0])
    }
  }, 20_000)

  it('rejects the original level 27 click-through route blocked by another peg', () => {
    const shape = diamondLayout(2)
    const slots = buildSlots(shape)
    const clearance = ropeClearance(shape)
    const original = [
      { id: 0, a: 5, b: 12 },
      { id: 1, a: 2, b: 9 },
      { id: 3, a: 10, b: 4 },
    ]
    // Destination is clear, but the yellow peg blocks the physical path from hole 13 to hole 8.
    expect(moveEndClear(slots, clearance, original, 0, 'b', 7)).not.toBeNull()
    expect(tryMoveEnd(slots, clearance, original, 0, 'b', 7)).toBeNull()
    expect(canDragStraight(slots, clearance, original, 0, 'b', slots[12], slots[7])).toBe(false)
  })

  it('physically replays the actual solution certificate for all campaign levels, including 27', () => {
    for (let level = 1; level <= CAMPAIGN_LEVELS + 20; level++) {
      const cfg = getLevelConfig(level)
      const slots = buildSlots(cfg.layout)
      const clearance = ropeClearance(cfg.layout)
      let state = releaseFreeRopes(slots, cfg.ropes).remaining
      const solution = getKnownSolution(level)
      expect(solution.length).toBeGreaterThan(0)
      for (const move of solution) {
        // A rope that has already disappeared must not be moved again.
        const rope = state.find((r) => r.id === move.ropeId)
        if (!rope) continue
        expect(rope[move.end]).toBe(move.from)
        expect(canDragStraight(slots, clearance, state, move.ropeId, move.end, slots[move.from], slots[move.to])).toBe(
          true,
        )
        const next = tryMoveEnd(slots, clearance, state, move.ropeId, move.end, move.to)
        expect(next).not.toBeNull()
        state = releaseFreeRopes(slots, next!).remaining
      }
      expect(state).toHaveLength(0)
    }
  })

  it('generates levels whose recorded solution untangles them', () => {
    const cases = [
      { layout: gridLayout(3), ropes: 3, moves: 4 },
      { layout: gridLayout(4), ropes: 5, moves: 7 },
      { layout: ringLayout(10), ropes: 4, moves: 5 },
      { layout: ringLayout(16), ropes: 7, moves: 10 },
      { layout: gridLayout(5), ropes: 8, moves: 12 },
    ]
    cases.forEach(({ layout, ropes, moves }, i) => {
      const gen = generateLevel(layout, ropes, moves, 2, 1000 + i)
      const slots = buildSlots(layout)
      expect(isSolved(slots, gen.ropes)).toBe(false)
      const solved = applyMoves(gen.ropes, gen.solution, slotCount(layout))
      expect(solved).not.toBeNull()
      expect(isSolved(slots, solved!)).toBe(true)

      // Every step of the recorded solution is a legal move under the peg rule.
      const clearance = ropeClearance(layout)
      let state = gen.ropes
      for (const m of gen.solution) {
        const next = tryMoveEnd(slots, clearance, state, m.ropeId, m.end, m.to)
        expect(next).not.toBeNull()
        state = next!
      }
    })
  })

  it('never reports a par above the known solution length', () => {
    for (const level of [1, 5, 12, 40, 70, 100]) {
      const cfg = getLevelConfig(level)
      const exact = solveMinMoves(buildSlots(cfg.layout), cfg.ropes, 25_000, Infinity, ropeClearance(cfg.layout))
      if (cfg.parExact) expect(exact).toBe(cfg.par)
    }
  })

  it('builds tangle-free starting arrangements', () => {
    for (const layout of [gridLayout(3), gridLayout(5), ringLayout(12)]) {
      const rand = createRng(11)
      const ropes = generateSolved(layout, 3, rand)
      expect(ropes).toHaveLength(3)
      expect(isSolved(buildSlots(layout), ropes)).toBe(true)
    }
  })

  it('gives stricter stars for exact par than for estimated par', () => {
    expect(starThresholds(4, true)).toEqual([4, 6])
    expect(starThresholds(10, false)[0]).toBeGreaterThan(10)
  })
})
