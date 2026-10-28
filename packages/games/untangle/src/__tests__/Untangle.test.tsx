import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Untangle } from '../Untangle'
import { getLevelConfig } from '../logic/levels'
import { buildSlots, pegRadius, ropeClearance } from '../logic/layouts'
import { distanceToSegment } from '../logic/geometry'
import { emptySlots, moveEnd, tryMoveEnd } from '../logic/engine'
import type { RopeEnd } from '../types'

/** Level 1's first rope end / hole pair that is a legal move, or a pair refused because a rope would hit a peg. */
function level1Moves() {
  const cfg = getLevelConfig(1)
  const slots = buildSlots(cfg.layout)
  const clearance = ropeClearance(cfg.layout)
  let legal: { ropeId: number; end: RopeEnd; slot: number } | undefined
  let blocked: { ropeId: number; end: RopeEnd; slot: number } | undefined
  for (const rope of cfg.ropes) {
    for (const end of ['a', 'b'] as RopeEnd[]) {
      for (const slot of emptySlots(cfg.ropes, slots.length)) {
        // Refused by the rules even though the hole is empty.
        const geometric = moveEnd(cfg.ropes, rope.id, end, slot, slots.length)
        const ok = tryMoveEnd(slots, clearance, cfg.ropes, rope.id, end, slot)
        // The straight drag path must also be clear: a held peg stops before a rope would hit another peg.
        const fixed = slots[end === 'a' ? rope.b : rope.a]
        const from = slots[rope[end]]
        const to = slots[slot]
        const others = cfg.ropes.filter((r) => r.id !== rope.id).flatMap((r) => [slots[r.a], slots[r.b]])
        const walls = cfg.ropes.filter((r) => r.id > rope.id)
        const pathClear = Array.from({ length: 41 }, (_, i) => i / 40).every((t) => {
          const q = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }
          return (
            others.every(
              (o) =>
                Math.hypot(o.x - q.x, o.y - q.y) >= pegRadius(cfg.layout) * 2 &&
                distanceToSegment(o, fixed, q) >= clearance,
            ) && walls.every((w) => distanceToSegment(q, slots[w.a], slots[w.b]) >= clearance)
          )
        })
        if (ok && pathClear && !legal) legal = { ropeId: rope.id, end, slot }
        if (geometric && !ok && !blocked) blocked = { ropeId: rope.id, end, slot }
      }
    }
  }
  return { slots, legal: legal!, blocked }
}

const pegFor = (ropeId: number, end: RopeEnd) =>
  document.querySelector<SVGGElement>(`.ut-peg[data-rope="${ropeId}"][data-end="${end}"]`)!
const holeFor = (slot: number) => document.querySelector<SVGGElement>(`.ut-slot[data-slot="${slot}"]`)!
const mockBoardRect = () => {
  const svg = document.querySelector('svg.ut-svg') as SVGSVGElement
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
}

/** jsdom has no PointerEvent, so build one by hand with the fields the game reads. */
function firePointer(
  target: EventTarget,
  type: string,
  props: { pointerId: number; clientX: number; clientY: number },
) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, { button: 0, pointerType: 'touch', ...props })
  act(() => {
    target.dispatchEvent(event)
  })
}

function pegs() {
  return Array.from(document.querySelectorAll<SVGGElement>('.ut-peg'))
}
function holes() {
  return Array.from(document.querySelectorAll<SVGGElement>('.ut-slot'))
}

describe('Untangle component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the board, ropes, pegs and controls on first load', () => {
    render(<Untangle locale="en" />)

    expect(document.querySelector('.ut-board')).toBeInTheDocument()
    expect(document.querySelectorAll('.ut-rope')).toHaveLength(3)
    expect(pegs()).toHaveLength(6)
    expect(holes()).toHaveLength(3)

    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /how to play/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /levels/i })).toBeInTheDocument()
  })

  it('draws no crossing markers: the crossings themselves show which rope is on top', () => {
    render(<Untangle locale="en" />)
    expect(document.querySelector('.ut-conflict')).toBeNull()
  })

  it('renders Polish labels', () => {
    render(<Untangle locale="pl" />)
    expect(screen.getByRole('button', { name: /cofnij/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /jak grać/i })).toBeInTheDocument()
  })

  it('moves a rope end by tapping a peg and then an empty hole', () => {
    const setIsActive = vi.fn()
    render(<Untangle locale="en" setIsActive={setIsActive} />)

    const { legal } = level1Moves()
    const peg = pegFor(legal.ropeId, legal.end)
    const before = peg.getAttribute('data-slot')
    fireEvent.click(peg)
    expect(peg).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(holeFor(legal.slot))

    const moved = document.querySelector<SVGGElement>(
      `.ut-peg[data-rope="${peg.getAttribute('data-rope')}"][data-end="${peg.getAttribute('data-end')}"]`,
    )!
    expect(moved.getAttribute('data-slot')).not.toBe(before)
    expect(screen.getByRole('button', { name: /undo/i })).toBeEnabled()
    expect(setIsActive).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(
      document
        .querySelector<SVGGElement>(
          `.ut-peg[data-rope="${peg.getAttribute('data-rope')}"][data-end="${peg.getAttribute('data-end')}"]`,
        )!
        .getAttribute('data-slot'),
    ).toBe(before)
  })

  it('supports keyboard selection and placement', () => {
    render(<Untangle locale="en" />)
    const { legal } = level1Moves()
    const peg = pegFor(legal.ropeId, legal.end)
    fireEvent.keyDown(peg, { key: 'Enter' })
    expect(peg).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(peg, { key: ' ' })
    expect(peg).toHaveAttribute('aria-pressed', 'false')

    fireEvent.keyDown(pegFor(legal.ropeId, legal.end), { key: 'Enter' })
    fireEvent.keyDown(holeFor(legal.slot), { key: 'Enter' })
    expect(screen.getByRole('button', { name: /undo/i })).toBeEnabled()
  })

  it('moves a rope end by dragging it onto an empty hole', () => {
    render(<Untangle locale="en" />)
    mockBoardRect()
    const { slots, legal } = level1Moves()

    // Slot centres are in board units, which equal client pixels with the mocked 100x100 rect.
    const from = slots[Number(pegFor(legal.ropeId, legal.end).getAttribute('data-slot'))]
    const to = slots[legal.slot]

    firePointer(pegFor(legal.ropeId, legal.end), 'pointerdown', { pointerId: 1, clientX: from.x, clientY: from.y })
    firePointer(window, 'pointermove', { pointerId: 1, clientX: to.x, clientY: to.y })
    expect(document.querySelector('.ut-peg--dragging')).not.toBeNull()
    firePointer(window, 'pointerup', { pointerId: 1, clientX: to.x, clientY: to.y })

    expect(pegFor(legal.ropeId, legal.end).getAttribute('data-slot')).toBe(String(legal.slot))
    expect(screen.getByRole('button', { name: /undo/i })).toBeEnabled()
    expect(document.querySelector('.ut-peg--dragging')).toBeNull()
  })

  it('does not highlight any holes while a rope end is dragged', () => {
    render(<Untangle locale="en" />)
    mockBoardRect()
    const { slots, legal } = level1Moves()
    const from = slots[Number(pegFor(legal.ropeId, legal.end).getAttribute('data-slot'))]
    const to = slots[legal.slot]

    firePointer(pegFor(legal.ropeId, legal.end), 'pointerdown', { pointerId: 3, clientX: from.x, clientY: from.y })
    expect(document.querySelector('.ut-board--dragging')).toBeNull()
    firePointer(window, 'pointermove', { pointerId: 3, clientX: to.x, clientY: to.y })

    expect(document.querySelector('.ut-board--dragging')).not.toBeNull()
    // The holes are never highlighted: that would only hint at some of the places the peg may go.
    expect(document.querySelector('.ut-slot--target, .ut-slot--armed, .ut-slot--blocked')).toBeNull()

    firePointer(window, 'pointerup', { pointerId: 3, clientX: to.x, clientY: to.y })
    expect(document.querySelector('.ut-board--dragging')).toBeNull()
  })

  it('refuses a drop where the rope would run through a peg', () => {
    render(<Untangle locale="en" />)
    mockBoardRect()
    const { slots, blocked } = level1Moves()
    expect(blocked).toBeDefined()
    const b = blocked!
    const slotBefore = pegFor(b.ropeId, b.end).getAttribute('data-slot')
    const from = slots[Number(slotBefore)]
    const to = slots[b.slot]

    firePointer(pegFor(b.ropeId, b.end), 'pointerdown', { pointerId: 4, clientX: from.x, clientY: from.y })
    firePointer(window, 'pointermove', { pointerId: 4, clientX: to.x, clientY: to.y })
    expect(document.querySelector('.ut-slot--blocked, .ut-slot--target')).toBeNull()
    firePointer(window, 'pointerup', { pointerId: 4, clientX: to.x, clientY: to.y })

    expect(pegFor(b.ropeId, b.end).getAttribute('data-slot')).toBe(slotBefore)
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
  })

  it('stops a held rope end before it would drag its rope through another peg', () => {
    render(<Untangle locale="en" />)
    mockBoardRect()
    const cfg = getLevelConfig(1)
    const slots = buildSlots(cfg.layout)
    const clearance = ropeClearance(cfg.layout)
    const rope = cfg.ropes[0]
    const end: RopeEnd = 'a'
    const fixed = slots[end === 'a' ? rope.b : rope.a]
    const startSlot = slots[rope[end]]
    const others = cfg.ropes.filter((r) => r.id !== rope.id).flatMap((r) => [slots[r.a], slots[r.b]])

    // Aim straight at another peg, then past it: the held peg must never end up on the far side of it.
    const victim = others.reduce((best, o) =>
      Math.hypot(o.x - startSlot.x, o.y - startSlot.y) < Math.hypot(best.x - startSlot.x, best.y - startSlot.y)
        ? o
        : best,
    )
    const beyond = { x: victim.x + (victim.x - fixed.x) * 0.5, y: victim.y + (victim.y - fixed.y) * 0.5 }

    firePointer(pegFor(rope.id, end), 'pointerdown', { pointerId: 5, clientX: startSlot.x, clientY: startSlot.y })
    firePointer(window, 'pointermove', { pointerId: 5, clientX: beyond.x, clientY: beyond.y })

    const held = /translate\(([\d.]+) ([\d.]+)\)/.exec(pegFor(rope.id, end).getAttribute('transform')!)!
    const heldPoint = { x: Number(held[1]), y: Number(held[2]) }
    for (const o of others) {
      // The rope from its fixed end to the held peg never comes closer to any peg than the clearance.
      const dx = heldPoint.x - fixed.x
      const dy = heldPoint.y - fixed.y
      const len2 = dx * dx + dy * dy
      const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((o.x - fixed.x) * dx + (o.y - fixed.y) * dy) / len2))
      expect(Math.hypot(o.x - (fixed.x + t * dx), o.y - (fixed.y + t * dy))).toBeGreaterThanOrEqual(clearance - 0.01)
    }
    firePointer(window, 'pointerup', { pointerId: 5, clientX: beyond.x, clientY: beyond.y })
  })

  it('marks the board as won once the ropes are untangled', () => {
    const { container } = render(<Untangle locale="en" />)
    expect(container.querySelector('.ut-board--won')).toBeNull()
  })

  it('snaps a dragged rope end back when released away from any empty hole', () => {
    render(<Untangle locale="en" />)
    const svg = document.querySelector('svg.ut-svg') as SVGSVGElement
    svg.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect

    const peg = pegs()[0]
    const slot = peg.getAttribute('data-slot')
    firePointer(peg, 'pointerdown', { pointerId: 2, clientX: 50, clientY: 50 })
    firePointer(window, 'pointermove', { pointerId: 2, clientX: 50, clientY: 3 })
    firePointer(window, 'pointerup', { pointerId: 2, clientX: 50, clientY: 3 })

    expect(pegs()[0].getAttribute('data-slot')).toBe(slot)
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
  })

  it('opens and closes the how-to-play dialog', async () => {
    render(<Untangle locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /how to play/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/every rope joins two pegs/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^ok$/i }))
    await waitFor(() => {
      expect(screen.queryByText(/every rope joins two pegs/i)).not.toBeInTheDocument()
    })
  })

  it('opens the level-select modal with level 1 available and level 2 locked', async () => {
    render(<Untangle locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /levels/i }))
    expect(await screen.findByText(/choose level/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Level 1(,|$)/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /^Level 2, locked/i })).toBeDisabled()
  })

  it('asks for confirmation before restarting a level in progress', async () => {
    render(<Untangle locale="en" />)
    const { legal } = level1Moves()
    fireEvent.click(pegFor(legal.ropeId, legal.end))
    fireEvent.click(holeFor(legal.slot))

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(await screen.findByText(/start over/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^restart$/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled())
  })

  it('projects stats into the shell header and cleans up on unmount', () => {
    const setHeader = vi.fn()
    const { unmount } = render(<Untangle locale="en" setHeader={setHeader} />)
    expect(setHeader).toHaveBeenCalled()
    unmount()
    expect(setHeader).toHaveBeenLastCalledWith(null)
  })

  it('resets the shell active flag on unmount', () => {
    const setIsActive = vi.fn()
    const { unmount } = render(<Untangle locale="en" setIsActive={setIsActive} />)
    unmount()
    expect(setIsActive).toHaveBeenLastCalledWith(false)
  })

  it('shows rope numbers instead of relying on colour in e-ink mode', () => {
    render(<Untangle locale="en" isEink />)
    expect(document.querySelectorAll('.ut-peg-number')).toHaveLength(6)
  })

  it('does not show rope numbers in colour themes', () => {
    render(<Untangle locale="en" isEink={false} />)
    expect(document.querySelectorAll('.ut-peg-number')).toHaveLength(0)
  })
})
