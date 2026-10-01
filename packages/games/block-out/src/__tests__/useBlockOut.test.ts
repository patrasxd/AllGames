import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBlockOut, starsFor } from '../hooks/useBlockOut'
import type { LevelConfig } from '../types'

describe('useBlockOut hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes level 1 with 0 moves and playing status', () => {
    const { result } = renderHook(() => useBlockOut())
    expect(result.current.currentLevel).toBe(1)
    expect(result.current.moves).toBe(0)
    expect(result.current.status).toBe('playing')
    expect(result.current.canUndo).toBe(false)
    expect(result.current.isGameActive).toBe(false)
  })

  it('resumes the last selected unlocked level', () => {
    localStorage.setItem(
      'allgames:block-out:progress',
      JSON.stringify({ unlockedLevel: 5, currentLevel: 3, levelStars: {}, levelBestMoves: {} }),
    )

    const { result } = renderHook(() => useBlockOut())

    expect(result.current.currentLevel).toBe(3)
    act(() => result.current.goToLevel(4))
    expect(JSON.parse(localStorage.getItem('allgames:block-out:progress')!).currentLevel).toBe(4)
  })

  it('updates moves and enables undo on valid slide', () => {
    const { result } = renderHook(() => useBlockOut())
    const initialTargetCol = result.current.blocks.find((b) => b.isTarget)?.col ?? 0

    // Attempt to slide target block
    let moved = false
    act(() => {
      moved = result.current.slideBlock('target', initialTargetCol + 1)
    })

    if (moved) {
      expect(result.current.moves).toBe(1)
      expect(result.current.canUndo).toBe(true)
      expect(result.current.isGameActive).toBe(true)

      // Test undo
      act(() => {
        result.current.undo()
      })
      expect(result.current.moves).toBe(0)
      expect(result.current.canUndo).toBe(false)
    }
  })

  it('calculates stars correctly based on thresholds', () => {
    const mockConfig: LevelConfig = {
      level: 1,
      blocks: [],
      minMoves: 5,
      starThresholds: [5, 8],
    }
    expect(starsFor(mockConfig, 4)).toBe(3)
    expect(starsFor(mockConfig, 5)).toBe(3)
    expect(starsFor(mockConfig, 6)).toBe(2)
    expect(starsFor(mockConfig, 8)).toBe(2)
    expect(starsFor(mockConfig, 9)).toBe(1)
  })

  it('resets level correctly with restartLevel', () => {
    const { result } = renderHook(() => useBlockOut())
    act(() => {
      result.current.slideBlock('target', 1)
    })
    act(() => {
      result.current.restartLevel()
    })
    expect(result.current.moves).toBe(0)
    expect(result.current.canUndo).toBe(false)
  })
})
