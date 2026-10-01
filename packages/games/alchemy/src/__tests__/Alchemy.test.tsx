import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { Alchemy } from '../Alchemy'

/** An element's button in the list panel (the same name can also be on the table). */
function chip(name: string): HTMLElement {
  const panel = document.querySelector('.al-inventory') as HTMLElement
  return within(panel).getByText(name).closest('button') as HTMLElement
}

function tapItem(name: string, index = 0) {
  const el = screen.getAllByRole('button', { name })[index]
  fireEvent.pointerDown(el, { clientX: 0, clientY: 0, pointerId: 1 })
  fireEvent.pointerUp(el, { clientX: 0, clientY: 0, pointerId: 1 })
}

describe('Alchemy component', () => {
  beforeEach(() => localStorage.clear())

  it('shows the four basic elements and the intro overlay on first load', () => {
    render(<Alchemy locale="en" />)
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
    for (const name of ['Water', 'Fire', 'Earth', 'Air']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('renders element names in Polish', () => {
    render(<Alchemy locale="pl" />)
    expect(screen.getByText('Woda')).toBeInTheDocument()
    expect(screen.getByText('Ogień')).toBeInTheDocument()
  })

  it('tapping an element in the list puts it on the table', () => {
    render(<Alchemy locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    fireEvent.click(screen.getByText('Water'))
    expect(document.querySelectorAll('.al-item')).toHaveLength(1)
  })

  it('mixing water and fire on the table creates steam and adds it to the list', () => {
    render(<Alchemy locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    fireEvent.click(screen.getByText('Water'))
    fireEvent.click(screen.getByText('Fire'))
    expect(document.querySelectorAll('.al-item')).toHaveLength(2)

    tapItem('Water')
    tapItem('Fire')

    expect(document.querySelectorAll('.al-item')).toHaveLength(1)
    expect(document.querySelector('.al-item')).toHaveAttribute('aria-label', 'Steam')
    // Steam is now in the element list too.
    expect(document.querySelectorAll('.al-chip')).toHaveLength(5)
  })

  it('Clear empties the table and Reset asks for confirmation', async () => {
    render(<Alchemy locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    fireEvent.click(screen.getByText('Earth'))
    fireEvent.click(screen.getByRole('button', { name: /^clear$/i }))
    expect(document.querySelectorAll('.al-item')).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }))
    expect(await screen.findByText(/reset progress\?/i)).toBeInTheDocument()
  })

  it('the collection tab shows undiscovered elements as locked placeholders', () => {
    render(<Alchemy locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(document.querySelectorAll('.al-chip--locked')).toHaveLength(0)

    fireEvent.click(screen.getByRole('tab', { name: 'Collection' }))
    const locked = document.querySelectorAll('.al-chip--locked')
    expect(locked.length).toBeGreaterThan(300)
    expect(screen.queryByText('Robot')).not.toBeInTheDocument()
    expect(screen.getAllByText('???').length).toBe(locked.length)

    fireEvent.click(screen.getByRole('tab', { name: 'Elements' }))
    expect(document.querySelectorAll('.al-chip--locked')).toHaveLength(0)
  })

  it('search narrows the element list and shows a message when nothing matches', () => {
    render(<Alchemy locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    const search = screen.getByRole('searchbox')

    fireEvent.change(search, { target: { value: 'fir' } })
    expect(document.querySelectorAll('.al-chip')).toHaveLength(1)
    expect(screen.getByText('Fire')).toBeInTheDocument()

    fireEvent.change(search, { target: { value: 'zzz' } })
    expect(screen.getByText('Nothing found')).toBeInTheDocument()
  })

  it('category chips filter the collection and show found/total counts', () => {
    render(<Alchemy locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    fireEvent.click(screen.getByRole('tab', { name: 'Collection' }))

    const animals = screen.getByRole('button', { name: /Animals/ })
    expect(animals).toHaveTextContent(/0\/\d+/)
    fireEvent.click(animals)
    expect(document.querySelectorAll('.al-chip').length).toBeLessThan(60)
    expect(document.querySelectorAll('.al-chip--locked').length).toBe(document.querySelectorAll('.al-chip').length)
  })

  describe('dragging an element from the list', () => {
    // jsdom has no layout, so give the table a size: 400x300 at the top-left of the viewport.
    const mockTable = () => {
      const table = document.querySelector('.al-workspace') as HTMLElement
      table.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 400,
          bottom: 300,
          width: 400,
          height: 300,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect
    }
    const mouse = (type: 'down' | 'move' | 'up', target: Element | Window, x: number, y: number) => {
      const init = { clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', button: 0, bubbles: true }
      fireEvent(target, new PointerEvent(`pointer${type}`, init))
    }

    const start = () => {
      render(<Alchemy locale="en" />)
      fireEvent.click(screen.getByRole('button', { name: /start/i }))
      mockTable()
    }

    afterEach(() => {
      vi.useRealTimers()
      document.querySelectorAll('.al-ghost').forEach((n) => n.remove())
    })

    it('drops the element where the pointer is released on the table', () => {
      start()
      mouse('down', chip('Water'), 5, 400)
      mouse('move', window, 100, 200)
      expect(document.querySelector('.al-ghost')).toBeInTheDocument()
      mouse('up', window, 200, 150)

      expect(document.querySelector('.al-ghost')).not.toBeInTheDocument()
      const items = document.querySelectorAll('.al-item')
      expect(items).toHaveLength(1)
      expect((items[0] as HTMLElement).style.transform).toBe(`translate(${200 - 36}px, ${150 - 36}px)`)

      // The click that follows the drag must not add a second copy.
      fireEvent.click(chip('Water'))
      expect(document.querySelectorAll('.al-item')).toHaveLength(1)
    })

    it('mixes with the card it is dropped on', () => {
      start()
      fireEvent.click(chip('Fire'))
      const fire = document.querySelector('.al-item') as HTMLElement
      const [, tx, ty] = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(fire.style.transform)!.map(Number)

      mouse('down', chip('Water'), 5, 400)
      mouse('move', window, tx + 36, ty + 36)
      expect(document.querySelector('.al-item--hover')).toBeInTheDocument()
      mouse('up', window, tx + 36, ty + 36)

      expect(document.querySelectorAll('.al-item')).toHaveLength(1)
      expect(document.querySelector('.al-item')).toHaveAttribute('aria-label', 'Steam')
    })

    it('does nothing when released outside the table', () => {
      start()
      mouse('down', chip('Earth'), 5, 400)
      mouse('move', window, 50, 380)
      mouse('up', window, 50, 380)
      expect(document.querySelectorAll('.al-item')).toHaveLength(0)
    })

    it('a plain click still adds the element', () => {
      start()
      mouse('down', chip('Air'), 5, 400)
      mouse('up', window, 5, 400)
      fireEvent.click(chip('Air'))
      expect(document.querySelectorAll('.al-item')).toHaveLength(1)
    })

    it('on touch, a quick swipe scrolls the list instead of dragging', () => {
      vi.useFakeTimers()
      start()
      const touch = (type: 'down' | 'move' | 'up', target: Element | Window, x: number, y: number) =>
        fireEvent(
          target,
          new PointerEvent(`pointer${type}`, {
            clientX: x,
            clientY: y,
            pointerId: 2,
            pointerType: 'touch',
            bubbles: true,
          }),
        )
      touch('down', chip('Water'), 5, 400)
      touch('move', window, 5, 340)
      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(document.querySelector('.al-ghost')).not.toBeInTheDocument()
      touch('up', window, 200, 150)
      expect(document.querySelectorAll('.al-item')).toHaveLength(0)
    })

    it('on touch, holding an element for a moment lets you drag it', () => {
      vi.useFakeTimers()
      start()
      const touch = (type: 'down' | 'move' | 'up', target: Element | Window, x: number, y: number) =>
        fireEvent(
          target,
          new PointerEvent(`pointer${type}`, {
            clientX: x,
            clientY: y,
            pointerId: 2,
            pointerType: 'touch',
            bubbles: true,
          }),
        )
      touch('down', chip('Water'), 5, 400)
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(document.querySelector('.al-ghost')).toBeInTheDocument()
      touch('move', window, 150, 120)
      touch('up', window, 150, 120)
      expect(document.querySelectorAll('.al-item')).toHaveLength(1)
    })
  })

  it('a mix that does not work shows no animation at all', () => {
    render(<Alchemy locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    fireEvent.click(chip('Fire'))
    fireEvent.click(chip('Fire'))
    tapItem('Fire', 0)
    tapItem('Fire', 1)

    expect(document.querySelectorAll('.al-item')).toHaveLength(2)
    const classes = Array.from(document.querySelectorAll('.al-item')).map((n) => n.className)
    expect(classes.join(' ')).not.toMatch(/fail|shake|new/)
  })

  it('a mix that works plays the discovery animation on the new card', () => {
    render(<Alchemy locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    fireEvent.click(chip('Water'))
    fireEvent.click(chip('Fire'))
    tapItem('Water')
    tapItem('Fire')
    expect(document.querySelector('.al-item--new')).toBeInTheDocument()
  })
})
