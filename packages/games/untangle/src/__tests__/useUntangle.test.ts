import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { VANISH_MS } from '../components/motion'
import { getLevelConfig } from '../logic/levels'
import { buildSlots, ropeClearance } from '../logic/layouts'
import { useUntangle, starsFor } from '../hooks/useUntangle'
import { countConflicts, emptySlots, releaseFreeRopes, tryMoveEnd } from '../logic/engine'
import type { Point, Rope } from '../types'

const KEY = 'allgames:untangle:progress'

/** Breadth-first search over legal moves for a way to untangle a small board. */
function findWin(slots: Point[], clearance: number, start: Rope[]) {
  const key = (r: Rope[]) => r.map((x) => `${x.a}-${x.b}`).join('|')
  const seen = new Set([key(start)])
  let frontier: { ropes: Rope[]; path: { id: number; end: 'a' | 'b'; to: number }[] }[] = [{ ropes: start, path: [] }]
  for (let depth = 0; depth < 8 && frontier.length; depth++) {
    const next: typeof frontier = []
    for (const node of frontier) {
      for (const rope of node.ropes) {
        for (const end of ['a', 'b'] as const) {
          for (const to of emptySlots(node.ropes, slots.length)) {
            const moved = tryMoveEnd(slots, clearance, node.ropes, rope.id, end, to)
            if (!moved || seen.has(key(moved))) continue
            seen.add(key(moved))
            const path = [...node.path, { id: rope.id, end, to }]
            if (countConflicts(slots, moved) === 0) return path
            next.push({ ropes: moved, path })
          }
        }
      }
    }
    frontier = next
  }
  return null
}

/** The first legal move on the board. */
function firstLegalMove(slots: Point[], clearance: number, ropes: Rope[]) {
  for (const rope of ropes)
    for (const end of ['a', 'b'] as const)
      for (const to of emptySlots(ropes, slots.length))
        if (tryMoveEnd(slots, clearance, ropes, rope.id, end, to)) return { id: rope.id, end, to }
  return null
}

describe('useUntangle hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts level 1 with no moves, tangles present and playing status', () => {
    const { result } = renderHook(() => useUntangle())
    expect(result.current.currentLevel).toBe(1)
    expect(result.current.moves).toBe(0)
    expect(result.current.status).toBe('playing')
    expect(result.current.conflicts.length).toBeGreaterThan(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.isGameActive).toBe(false)
  })

  it('moves a rope end to an empty slot, enables undo and marks the game active', () => {
    const { result } = renderHook(() => useUntangle())
    const move = firstLegalMove(result.current.slots, result.current.clearance, result.current.ropes)!
    const before = result.current.ropes.find((r) => r.id === move.id)![move.end]

    let ok = false
    act(() => {
      ok = result.current.moveEnd(move.id, move.end, move.to)
    })
    expect(ok).toBe(true)
    expect(result.current.ropes.find((r) => r.id === move.id)![move.end]).toBe(move.to)
    expect(result.current.moves).toBe(1)
    expect(result.current.canUndo).toBe(true)

    act(() => result.current.undo())
    expect(result.current.ropes.find((r) => r.id === move.id)![move.end]).toBe(before)
    expect(result.current.moves).toBe(0)
    expect(result.current.canUndo).toBe(false)
  })

  it('agrees with the engine about which moves are allowed', () => {
    const { result } = renderHook(() => useUntangle())
    const { slots, clearance, ropes } = result.current
    for (const rope of ropes) {
      for (const end of ['a', 'b'] as const) {
        for (let to = 0; to < slots.length; to++) {
          expect(result.current.canMove(rope.id, end, to)).toBe(
            tryMoveEnd(slots, clearance, ropes, rope.id, end, to) !== null,
          )
        }
      }
    }
  })

  it('treats a dragged move as already checked along its way', () => {
    const { result } = renderHook(() => useUntangle())
    const { slots, clearance, ropes } = result.current
    // Find a hole the rope may reach only by being carried around (not along the straight line).
    let around: { id: number; end: 'a' | 'b'; to: number } | null = null
    for (const rope of ropes)
      for (const end of ['a', 'b'] as const)
        for (let to = 0; to < slots.length; to++)
          if (
            !around &&
            tryMoveEnd(slots, clearance, ropes, rope.id, end, to) === null &&
            tryMoveEnd(slots, clearance, ropes, rope.id, end, to, { checkPath: false }) !== null
          )
            around = { id: rope.id, end, to }
    if (!around) return // level 1 may not have such a hole; the engine tests cover it
    let tapped = true
    act(() => {
      tapped = result.current.moveEnd(around!.id, around!.end, around!.to)
    })
    expect(tapped).toBe(false)
    let dragged = false
    act(() => {
      dragged = result.current.moveEnd(around!.id, around!.end, around!.to, true)
    })
    expect(dragged).toBe(true)
  })

  it('rejects moves onto occupied slots', () => {
    const { result } = renderHook(() => useUntangle())
    const [r0, r1] = result.current.ropes
    let ok = true
    act(() => {
      ok = result.current.moveEnd(r0.id, 'a', r1.a)
    })
    expect(ok).toBe(false)
    expect(result.current.moves).toBe(0)
  })

  it('wins, saves stars and unlocks the next level when the ropes are untangled', () => {
    const { result } = renderHook(() => useUntangle())

    const plan = findWin(result.current.slots, result.current.clearance, result.current.ropes)!
    expect(plan).not.toBeNull()
    for (const step of plan) {
      act(() => {
        result.current.moveEnd(step.id, step.end, step.to)
      })
    }

    expect(result.current.status).toBe('won')
    expect(result.current.conflicts).toHaveLength(0)
    expect(result.current.progress.unlockedLevel).toBe(2)
    expect(result.current.progress.levelStars[1]).toBeGreaterThanOrEqual(1)
    expect(result.current.progress.levelBestMoves[1]).toBe(result.current.moves)
    expect(JSON.parse(localStorage.getItem(KEY)!).unlockedLevel).toBe(2)

    // A finished level accepts no further moves.
    let ok = true
    act(() => {
      ok = result.current.moveEnd(0, 'a', 0)
    })
    expect(ok).toBe(false)

    act(() => result.current.nextLevel())
    expect(result.current.currentLevel).toBe(2)
    expect(result.current.status).toBe('playing')
  })

  it('resumes the last selected unlocked level and ignores locked ones', () => {
    localStorage.setItem(KEY, JSON.stringify({ unlockedLevel: 5, currentLevel: 3, levelStars: {}, levelBestMoves: {} }))
    const { result } = renderHook(() => useUntangle())
    expect(result.current.currentLevel).toBe(3)

    act(() => result.current.goToLevel(9))
    expect(result.current.currentLevel).toBe(3)

    act(() => result.current.goToLevel(4))
    expect(result.current.currentLevel).toBe(4)
    expect(JSON.parse(localStorage.getItem(KEY)!).currentLevel).toBe(4)
  })

  it('survives corrupt saved data', () => {
    localStorage.setItem(KEY, '{not json')
    const { result } = renderHook(() => useUntangle())
    expect(result.current.currentLevel).toBe(1)
  })

  it('restarts a level back to its starting position', () => {
    const { result } = renderHook(() => useUntangle())
    const start = result.current.ropes
    const move = firstLegalMove(result.current.slots, result.current.clearance, start)!
    act(() => {
      result.current.moveEnd(move.id, move.end, move.to)
    })
    act(() => result.current.restartLevel())
    expect(result.current.moves).toBe(0)
    expect(result.current.ropes).toEqual(start)
  })

  it('awards stars from the thresholds', () => {
    const cfg = { starThresholds: [5, 8] as [number, number] }
    expect(starsFor(cfg, 4)).toBe(3)
    expect(starsFor(cfg, 5)).toBe(3)
    expect(starsFor(cfg, 6)).toBe(2)
    expect(starsFor(cfg, 8)).toBe(2)
    expect(starsFor(cfg, 9)).toBe(1)
  })

  it('takes ropes off the board once they cross nothing, and brings them back on undo', () => {
    // Find a level where one legal move frees a rope without finishing the level.
    let found: { level: number; id: number; end: 'a' | 'b'; to: number; before: number } | null = null
    for (let level = 1; level <= 60 && !found; level++) {
      const cfg = getLevelConfig(level)
      const slots = buildSlots(cfg.layout)
      const clearance = ropeClearance(cfg.layout)
      const start = releaseFreeRopes(slots, cfg.ropes).remaining
      for (const rope of start)
        for (const end of ['a', 'b'] as const)
          for (const to of emptySlots(start, slots.length)) {
            const moved = tryMoveEnd(slots, clearance, start, rope.id, end, to)
            if (!moved || found) continue
            const { remaining, freed } = releaseFreeRopes(slots, moved)
            if (freed.length > 0 && remaining.length > 0) found = { level, id: rope.id, end, to, before: start.length }
          }
    }
    expect(found).not.toBeNull()
    const f = found!

    localStorage.setItem(
      KEY,
      JSON.stringify({ unlockedLevel: f.level, currentLevel: f.level, levelStars: {}, levelBestMoves: {} }),
    )
    const { result } = renderHook(() => useUntangle())
    expect(result.current.currentLevel).toBe(f.level)
    const startRopes = result.current.ropes
    expect(startRopes).toHaveLength(f.before)

    act(() => {
      result.current.moveEnd(f.id, f.end, f.to)
    })
    expect(result.current.ropes.length).toBeLessThan(f.before)
    expect(result.current.status).toBe('playing')
    // The freed rope's holes are free again.
    const used = new Set(result.current.ropes.flatMap((r) => [r.a, r.b]))
    expect(used.size).toBe(result.current.ropes.length * 2)

    act(() => result.current.undo())
    expect(result.current.ropes).toEqual(startRopes)
  })

  it('does not put already-free ropes on the board when a level opens', () => {
    for (let level = 1; level <= 80; level++) {
      const cfg = getLevelConfig(level)
      localStorage.setItem(
        KEY,
        JSON.stringify({ unlockedLevel: level, currentLevel: level, levelStars: {}, levelBestMoves: {} }),
      )
      const { result, unmount } = renderHook(() => useUntangle())
      const slots = buildSlots(cfg.layout)
      expect(releaseFreeRopes(slots, result.current.ropes).freed).toHaveLength(0)
      expect(result.current.ropes.length).toBeGreaterThanOrEqual(2)
      unmount()
    }
  })
})

describe('useUntangle vanishing animation', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }))
    if (typeof requestAnimationFrame !== 'function') vi.stubGlobal('requestAnimationFrame', () => 0)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows freed ropes unravelling and holds the result screen until they are gone', () => {
    const { result } = renderHook(() => useUntangle())
    const plan = findWin(result.current.slots, result.current.clearance, result.current.ropes)!
    for (const step of plan) {
      act(() => {
        result.current.moveEnd(step.id, step.end, step.to)
      })
    }
    expect(result.current.status).toBe('won')
    expect(result.current.ropes).toHaveLength(0)
    expect(result.current.vanishing.length).toBeGreaterThan(0)
    expect(result.current.resultReady).toBe(false)

    act(() => {
      vi.advanceTimersByTime(VANISH_MS + 400)
    })
    expect(result.current.resultReady).toBe(true)
    expect(result.current.vanishing).toHaveLength(0)
  })

  it('skips the animation when it is switched off (e-ink)', () => {
    const { result } = renderHook(() => useUntangle({ animate: false }))
    const plan = findWin(result.current.slots, result.current.clearance, result.current.ropes)!
    for (const step of plan) {
      act(() => {
        result.current.moveEnd(step.id, step.end, step.to)
      })
    }
    expect(result.current.status).toBe('won')
    expect(result.current.vanishing).toHaveLength(0)
    expect(result.current.resultReady).toBe(true)
  })
})
