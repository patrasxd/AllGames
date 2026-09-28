import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBubbleShooter } from '../hooks/useBubbleShooter'

describe('useBubbleShooter', () => {
  it('ignores shots until the game is started', () => {
    const { result } = renderHook(() => useBubbleShooter())
    act(() => result.current.shoot(0))
    expect(result.current.viewRef.current.shot).toBeNull()
    expect(result.current.gameStatus).toBe('ready')
  })

  it('lands a shot and emits an animation event', async () => {
    const { result } = renderHook(() => useBubbleShooter())
    const seqBefore = result.current.viewRef.current.event?.seq ?? 0

    act(() => result.current.startGame())
    expect(result.current.gameStatus).toBe('aiming')

    act(() => result.current.shoot(0))
    expect(result.current.gameStatus).toBe('shooting')

    await waitFor(() => expect(result.current.gameStatus).not.toBe('shooting'), { timeout: 5000 })

    const event = result.current.viewRef.current.event
    expect(event?.kind).toBe('shot')
    expect(event?.seq).toBeGreaterThan(seqBefore)
    expect(event?.landed).toBeDefined()
    expect(result.current.viewRef.current.shot).toBeNull()
  })

  it('"New game" starts a fresh board straight in aiming mode', () => {
    const { result } = renderHook(() => useBubbleShooter())
    act(() => result.current.startGame())
    const oldEventSeq = result.current.viewRef.current.event?.seq ?? 0

    act(() => result.current.resetGame())
    expect(result.current.gameStatus).toBe('aiming')
    expect(result.current.score).toBe(0)
    expect(result.current.viewRef.current.event?.kind).toBe('reset')
    expect(result.current.viewRef.current.event?.seq).toBeGreaterThan(oldEventSeq)
  })
})

describe('useBubbleShooter isGameActive', () => {
  it('is false before the first shot, true mid-game, and false again after a new game', async () => {
    const { result } = renderHook(() => useBubbleShooter())
    expect(result.current.isGameActive).toBe(false)

    act(() => result.current.startGame())
    // Nothing to lose yet: no shot has been resolved.
    expect(result.current.isGameActive).toBe(false)

    act(() => result.current.shoot(0))
    await waitFor(() => expect(result.current.gameStatus).not.toBe('shooting'), { timeout: 5000 })
    if (result.current.gameStatus === 'aiming') expect(result.current.isGameActive).toBe(true)

    act(() => result.current.resetGame())
    expect(result.current.isGameActive).toBe(false)
  })
})
