import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUntangle, starsFor } from '../hooks/useUntangle'
import { countConflicts, emptySlots, tryMoveEnd } from '../logic/engine'
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

  it('refuses to pick up an end that is buried under another rope', () => {
    const { result } = renderHook(() => useUntangle())
    const buried = result.current.ropes
      .flatMap((r) => (['a', 'b'] as const).map((end) => ({ r, end })))
      .find((x) => !result.current.canGrab(x.r.id, x.end))
    expect(buried).toBeDefined()
    const target = emptySlots(result.current.ropes, result.current.slots.length)[0]
    let ok = true
    act(() => {
      ok = result.current.moveEnd(buried!.r.id, buried!.end, target)
    })
    expect(ok).toBe(false)
    expect(result.current.moves).toBe(0)
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
})
