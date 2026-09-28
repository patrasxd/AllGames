import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { AimControls } from '../components/AimControls'

const labels = { fire: 'Fire', left: 'Aim left', right: 'Aim right' }

describe('AimControls', () => {
  it('fires on tap and is disabled when not aiming', () => {
    const onFire = vi.fn()
    const { rerender } = render(<AimControls disabled={false} labels={labels} onNudge={vi.fn()} onFire={onFire} />)
    fireEvent.click(screen.getByRole('button', { name: 'Fire' }))
    expect(onFire).toHaveBeenCalledTimes(1)

    rerender(<AimControls disabled labels={labels} onNudge={vi.fn()} onFire={onFire} />)
    expect(screen.getByRole('button', { name: 'Fire' })).toBeDisabled()
  })

  it('keeps sweeping the aim while an arrow is held, and stops on release', () => {
    vi.useFakeTimers()
    const onNudge = vi.fn()
    render(<AimControls disabled={false} labels={labels} onNudge={onNudge} onFire={vi.fn()} />)
    const left = screen.getByRole('button', { name: 'Aim left' })

    fireEvent.pointerDown(left)
    expect(onNudge).toHaveBeenLastCalledWith(-1, expect.any(Number))
    const afterPress = onNudge.mock.calls.length

    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(onNudge.mock.calls.length).toBeGreaterThan(afterPress)

    fireEvent.pointerUp(left)
    const afterRelease = onNudge.mock.calls.length
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onNudge.mock.calls.length).toBe(afterRelease)
    vi.useRealTimers()
  })
})
