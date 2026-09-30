import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { TubesBoard } from '../components/TubesBoard'
import type { Tube } from '../types'

type WithAnimate = { animate?: unknown }

describe('TubesBoard', () => {
  afterEach(() => {
    delete (HTMLElement.prototype as WithAnimate).animate
  })

  it('renders a single selection indicator for the selected tube only', () => {
    const tubes: Tube[] = [['red', 'blue'], ['blue', 'red', 'red'], []]
    const { container } = render(<TubesBoard tubes={tubes} capacity={4} selected={0} onSelect={() => {}} />)
    expect(container.querySelectorAll('.bs-tube-bounce-indicator')).toHaveLength(1)
    expect(container.querySelectorAll('.bs-tube--selected')).toHaveLength(1)
  })

  it('animates every poured ball into the destination tube', () => {
    const animate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation)
    ;(HTMLElement.prototype as WithAnimate).animate = animate

    // Tubes already reflect the result of moving 2 red balls from tube 1 to tube 2.
    const after: Tube[] = [['red', 'blue'], ['blue'], ['red', 'red']]
    render(
      <TubesBoard
        tubes={after}
        capacity={4}
        selected={null}
        onSelect={() => {}}
        lastMove={{ from: 1, to: 2, count: 2, color: 'red' }}
      />,
    )
    expect(animate).toHaveBeenCalledTimes(2)
  })

  it('skips the animation in e-ink mode', () => {
    const animate = vi.fn()
    ;(HTMLElement.prototype as WithAnimate).animate = animate
    render(
      <TubesBoard
        tubes={[['red'], ['red'], []]}
        capacity={4}
        selected={null}
        onSelect={() => {}}
        isEink
        lastMove={{ from: 2, to: 1, count: 1, color: 'red' }}
      />,
    )
    expect(animate).not.toHaveBeenCalled()
  })
})
