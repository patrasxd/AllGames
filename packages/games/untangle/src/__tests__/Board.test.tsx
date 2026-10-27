import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Board } from '../components/Board'
import { untangleTranslations } from '../i18n'
import { buildSlots, gridLayout } from '../logic/layouts'

const layout = gridLayout(3)
const slots = buildSlots(layout)
const t = untangleTranslations.en

const baseProps = {
  layout,
  slots,
  ropes: [],
  clearance: 10,
  canMove: () => false,
  onMove: () => false,
  t,
}

describe('Board: untangled ropes', () => {
  it('draws nothing extra when no rope is vanishing', () => {
    const { container } = render(<Board {...baseProps} />)
    expect(container.querySelector('.ut-rope--ghost')).toBeNull()
    expect(container.querySelector('.ut-ghost-peg')).toBeNull()
  })

  it('draws a vanishing rope with a burst and sparks at both of its pegs', () => {
    const { container } = render(
      <Board {...baseProps} vanishing={[{ rope: { id: 2, a: 0, b: 8 }, start: performance.now() }]} />,
    )
    expect(container.querySelectorAll('.ut-rope--ghost')).toHaveLength(1)
    expect(container.querySelectorAll('.ut-ghost-peg')).toHaveLength(2)
    expect(container.querySelectorAll('.ut-burst')).toHaveLength(2)
    expect(container.querySelectorAll('.ut-spark')).toHaveLength(12)
  })

  it('pulls the rope in towards its middle as the animation goes on', () => {
    const early = render(
      <Board {...baseProps} vanishing={[{ rope: { id: 0, a: 0, b: 8 }, start: performance.now() }]} />,
    )
    const earlyLine = early.container.querySelector('.ut-rope--ghost .ut-rope-body')!
    const earlyLength = Math.hypot(
      Number(earlyLine.getAttribute('x2')) - Number(earlyLine.getAttribute('x1')),
      Number(earlyLine.getAttribute('y2')) - Number(earlyLine.getAttribute('y1')),
    )
    early.unmount()

    const late = render(
      <Board {...baseProps} vanishing={[{ rope: { id: 0, a: 0, b: 8 }, start: performance.now() - 600 }]} />,
    )
    const lateLine = late.container.querySelector('.ut-rope--ghost .ut-rope-body')!
    const lateLength = Math.hypot(
      Number(lateLine.getAttribute('x2')) - Number(lateLine.getAttribute('x1')),
      Number(lateLine.getAttribute('y2')) - Number(lateLine.getAttribute('y1')),
    )
    expect(lateLength).toBeLessThan(earlyLength)
  })
})
