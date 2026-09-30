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

  it('renders tubes in a single row when tube count < 8', () => {
    // 5 tubes: 1 row
    const tubes5: Tube[] = [['red'], ['blue'], ['green'], ['red'], []]
    const { container: c5 } = render(<TubesBoard tubes={tubes5} capacity={4} selected={null} onSelect={() => {}} />)
    const rows5 = c5.querySelectorAll('.bs-tubes-row')
    expect(rows5).toHaveLength(1)
    expect(rows5[0].querySelectorAll('.bs-tube')).toHaveLength(5)

    // 7 tubes: 1 row
    const tubes7: Tube[] = Array.from({ length: 7 }, () => ['red'])
    const { container: c7 } = render(<TubesBoard tubes={tubes7} capacity={4} selected={null} onSelect={() => {}} />)
    const rows7 = c7.querySelectorAll('.bs-tubes-row')
    expect(rows7).toHaveLength(1)
    expect(rows7[0].querySelectorAll('.bs-tube')).toHaveLength(7)
  })

  it('splits tubes into two balanced symmetrical rows from 8 tubes upwards', () => {
    // 8 tubes: 4 top, 4 bottom
    const tubes8: Tube[] = Array.from({ length: 8 }, () => ['red'])
    const { container: c8 } = render(<TubesBoard tubes={tubes8} capacity={4} selected={null} onSelect={() => {}} />)
    const rows8 = c8.querySelectorAll('.bs-tubes-row')
    expect(rows8).toHaveLength(2)
    expect(rows8[0].querySelectorAll('.bs-tube')).toHaveLength(4)
    expect(rows8[1].querySelectorAll('.bs-tube')).toHaveLength(4)

    // 9 tubes: 5 top, 4 bottom
    const tubes9: Tube[] = Array.from({ length: 9 }, () => ['red'])
    const { container: c9 } = render(<TubesBoard tubes={tubes9} capacity={4} selected={null} onSelect={() => {}} />)
    const rows9 = c9.querySelectorAll('.bs-tubes-row')
    expect(rows9).toHaveLength(2)
    expect(rows9[0].querySelectorAll('.bs-tube')).toHaveLength(5)
    expect(rows9[1].querySelectorAll('.bs-tube')).toHaveLength(4)
  })
})
