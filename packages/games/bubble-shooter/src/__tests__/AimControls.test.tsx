import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('nudges by one step per arrow tap', () => {
    const onNudge = vi.fn()
    render(<AimControls disabled={false} labels={labels} onNudge={onNudge} onFire={vi.fn()} />)
    const right = screen.getByRole('button', { name: 'Aim right' })

    fireEvent.click(right)
    expect(onNudge).toHaveBeenCalledTimes(1)
    expect(onNudge).toHaveBeenLastCalledWith(1)
    fireEvent.click(right)
    expect(onNudge).toHaveBeenCalledTimes(2)
    expect(onNudge).toHaveBeenLastCalledWith(1)
  })

  it('keeps pointer events on the control dock from reaching the game canvas', () => {
    const onCanvasPointerDown = vi.fn()
    const onCanvasPointerMove = vi.fn()
    render(
      <div onPointerDown={onCanvasPointerDown} onPointerMove={onCanvasPointerMove}>
        <AimControls disabled={false} labels={labels} onNudge={vi.fn()} onFire={vi.fn()} />
      </div>,
    )

    const right = screen.getByRole('button', { name: 'Aim right' })
    fireEvent.pointerDown(right)
    fireEvent.pointerMove(right)

    expect(onCanvasPointerDown).not.toHaveBeenCalled()
    expect(onCanvasPointerMove).not.toHaveBeenCalled()
  })
})
