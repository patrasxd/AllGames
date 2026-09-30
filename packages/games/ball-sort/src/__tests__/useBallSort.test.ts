import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBallSort } from '../hooks/useBallSort'
import { findSolution } from '../logic/solver'

beforeEach(() => {
  localStorage.clear()
})

describe('useBallSort', () => {
  it('loads level 1 on mount, unsolved, with zero moves', () => {
    const { result } = renderHook(() => useBallSort())
    expect(result.current.currentLevel).toBe(1)
    expect(result.current.status).toBe('playing')
    expect(result.current.moves).toBe(0)
    expect(result.current.tubes.length).toBeGreaterThan(0)
  })

  it('selecting an empty tube does nothing; selecting a non-empty tube selects it', () => {
    const { result } = renderHook(() => useBallSort())
    const emptyIndex = result.current.tubes.findIndex((t) => t.length === 0)
    act(() => result.current.selectTube(emptyIndex))
    expect(result.current.selected).toBeNull()

    const filledIndex = result.current.tubes.findIndex((t) => t.length > 0)
    act(() => result.current.selectTube(filledIndex))
    expect(result.current.selected).toBe(filledIndex)
  })

  it('tapping the same tube twice deselects it', () => {
    const { result } = renderHook(() => useBallSort())
    const filledIndex = result.current.tubes.findIndex((t) => t.length > 0)
    act(() => result.current.selectTube(filledIndex))
    act(() => result.current.selectTube(filledIndex))
    expect(result.current.selected).toBeNull()
  })

  it('pouring onto a legal target moves balls, counts a move, and undo reverses it exactly', () => {
    const { result } = renderHook(() => useBallSort())
    const { tubes, config } = result.current
    let from = -1
    let to = -1
    outer: for (let i = 0; i < tubes.length; i++) {
      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue
        const top = tubes[i][tubes[i].length - 1]
        if (!top) continue
        const destTop = tubes[j][tubes[j].length - 1]
        if (tubes[j].length < config.capacity && (tubes[j].length === 0 || destTop === top)) {
          from = i
          to = j
          break outer
        }
      }
    }
    expect(from).toBeGreaterThanOrEqual(0)

    const before = tubes.map((t) => t.slice())
    act(() => result.current.selectTube(from))
    act(() => result.current.selectTube(to))

    expect(result.current.moves).toBe(1)
    expect(result.current.selected).toBeNull()
    expect(result.current.canUndo).toBe(true)
    expect(result.current.tubes).not.toEqual(before)

    act(() => result.current.undo())
    expect(result.current.moves).toBe(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.tubes).toEqual(before)
  })

  it('tapping a tube that cannot receive the current selection retargets instead of no-op', () => {
    const { result } = renderHook(() => useBallSort())
    const { tubes, config } = result.current
    // Find any two non-empty tubes with different top colors and no room/mismatch (a blocked pour).
    let a = -1
    let b = -1
    for (let i = 0; i < tubes.length && a < 0; i++) {
      for (let j = 0; j < tubes.length; j++) {
        if (i === j || tubes[j].length === 0) continue
        const topI = tubes[i][tubes[i].length - 1]
        const topJ = tubes[j][tubes[j].length - 1]
        if (topI && topJ && topI !== topJ) {
          a = i
          b = j
          break
        }
      }
    }
    if (a < 0) return // board happened not to have a mismatched pair; nothing to assert
    act(() => result.current.selectTube(a))
    act(() => result.current.selectTube(b))
    expect(result.current.selected).toBe(b)
    expect(result.current.moves).toBe(0)
    void config
  })

  it('goToLevel refuses locked levels and accepts unlocked ones', () => {
    const { result } = renderHook(() => useBallSort())
    act(() => result.current.goToLevel(5))
    expect(result.current.currentLevel).toBe(1) // level 5 is locked initially

    act(() => result.current.goToLevel(1))
    expect(result.current.currentLevel).toBe(1)
  })

  it('restartLevel regenerates the exact same starting board and resets moves/history', () => {
    const { result } = renderHook(() => useBallSort())
    const initial = result.current.tubes.map((t) => t.slice())
    const from = result.current.tubes.findIndex((t) => t.length > 0)
    const to = result.current.tubes.findIndex((t, i) => i !== from && t.length === 0)
    act(() => result.current.selectTube(from))
    act(() => result.current.selectTube(to))
    expect(result.current.moves).toBe(1)

    act(() => result.current.restartLevel())
    expect(result.current.moves).toBe(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.tubes).toEqual(initial)
  })

  it('winning a level marks it won, unlocks the next one, awards stars, and persists to localStorage', () => {
    const { result } = renderHook(() => useBallSort())
    const { tubes, config } = result.current
    const solution = findSolution(tubes, config.capacity)
    expect(solution).not.toBeNull()

    for (const { from, to } of solution!) {
      act(() => result.current.selectTube(from))
      act(() => result.current.selectTube(to))
    }

    expect(result.current.status).toBe('won')
    expect(result.current.progress.unlockedLevel).toBeGreaterThanOrEqual(2)
    expect(result.current.progress.levelStars[1]).toBeGreaterThanOrEqual(1)
    expect(result.current.progress.levelBestMoves[1]).toBe(solution!.length)

    const saved = JSON.parse(localStorage.getItem('allgames:ball-sort:progress')!)
    expect(saved.unlockedLevel).toBeGreaterThanOrEqual(2)

    act(() => result.current.goToLevel(2))
    expect(result.current.currentLevel).toBe(2)
  })
})
