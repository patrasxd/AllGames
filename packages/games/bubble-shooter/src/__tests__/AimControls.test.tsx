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

  it('renders in a plain footer row (bs-aim-row), not a floating canvas overlay', () => {
    render(<AimControls disabled={false} labels={labels} onNudge={vi.fn()} onFire={vi.fn()} />)
    const row = document.querySelector('.bs-aim-row')
    expect(row).toBeInTheDocument()
    // Must not be the old position:absolute dock — it should be a plain div, not bs-touch-dock
    expect(document.querySelector('.bs-touch-dock')).not.toBeInTheDocument()
  })
})
