import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BlockOut } from '../BlockOut'

describe('BlockOut component', () => {
  it('renders the board with blocks and controls on first load', () => {
    render(<BlockOut locale="en" />)

    expect(document.querySelector('.bo-board')).toBeInTheDocument()
    expect(document.querySelectorAll('.bo-block').length).toBeGreaterThan(0)
    expect(document.querySelector('.bo-exit-hole')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /how to play/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /levels/i })).toBeInTheDocument()
  })

  it('opens and closes the how-to-play dialog via controls button', async () => {
    render(<BlockOut locale="en" />)
    const howToPlayBtn = screen.getByRole('button', { name: /how to play/i })
    fireEvent.click(howToPlayBtn)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/slide the horizontal and vertical blocks/i)).toBeInTheDocument()

    const okBtn = screen.getByRole('button', { name: /^ok$/i })
    fireEvent.click(okBtn)

    await waitFor(() => {
      expect(screen.queryByText(/slide the horizontal and vertical blocks/i)).not.toBeInTheDocument()
    })
  })

  it('opens and closes the level-select modal', async () => {
    render(<BlockOut locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /levels/i }))
    expect(await screen.findByText(/choose level/i)).toBeInTheDocument()

    const level1 = screen.getByRole('button', { name: /^Level 1(,|$)/i })
    expect(level1).not.toBeDisabled()
  })

  it('projects stats into shell header and cleans up on unmount', () => {
    const setHeader = vi.fn()
    const { unmount } = render(<BlockOut locale="en" setHeader={setHeader} />)

    expect(setHeader).toHaveBeenCalled()
    unmount()
    expect(setHeader).toHaveBeenCalledWith(null)
  })
})
