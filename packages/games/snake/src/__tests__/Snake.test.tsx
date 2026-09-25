import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, within } from '@testing-library/react'
import React from 'react'
import { Snake } from '../Snake'

describe('Snake Component Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('renders BoardLayout with start button, board SVG, and controls', () => {
    render(<Snake locale="en" />)

    // Should render start button
    const startBtn = screen.getByRole('button', { name: /^start$/i })
    expect(startBtn).toBeInTheDocument()

    // SVG Board should be rendered inside BoardLayout
    const board = document.querySelector('.snake-board-wrapper')
    expect(board).toBeInTheDocument()

    // Clicking start button starts game
    fireEvent.click(startBtn)

    // Should transition to pause button
    const pauseBtn = screen.getByRole('button', { name: /Pause/i })
    expect(pauseBtn).toBeInTheDocument()
  })

  it('pauses and resumes the game through controls bar', () => {
    render(<Snake locale="en" />)

    // Start game
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    })
    const pauseBtn = screen.getByRole('button', { name: /Pause/i })
    expect(pauseBtn).toBeInTheDocument()

    // Pause game
    act(() => {
      fireEvent.click(pauseBtn)
    })

    // Resume button should appear
    const resumeBtns = screen.getAllByRole('button', { name: /Resume/i })
    expect(resumeBtns.length).toBeGreaterThan(0)

    // Resume game
    act(() => {
      fireEvent.click(resumeBtns[0])
    })
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument()
  })

  it('supports D-pad direction controls', () => {
    render(<Snake locale="en" />)

    // Start game
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    })

    const upBtn = screen.getByRole('button', { name: /Move Up/i })
    const downBtn = screen.getByRole('button', { name: /Move Down/i })
    const leftBtn = screen.getByRole('button', { name: /Move Left/i })
    const rightBtn = screen.getByRole('button', { name: /Move Right/i })

    expect(upBtn).toBeInTheDocument()
    expect(downBtn).toBeInTheDocument()
    expect(leftBtn).toBeInTheDocument()
    expect(rightBtn).toBeInTheDocument()

    // Press Up
    act(() => {
      fireEvent.click(upBtn)
    })
    // Press Left
    act(() => {
      fireEvent.click(leftBtn)
    })
  })

  it('allows switching map modes and speed modes via Settings dialog', () => {
    render(<Snake locale="en" />)

    // Open settings dialog
    const settingsBtn = screen.getByRole('button', { name: /Settings/i })
    expect(settingsBtn).toBeInTheDocument()
    act(() => {
      fireEvent.click(settingsBtn)
    })

    // Check Map options inside settings
    const dialog = screen.getByRole('dialog', { name: /Settings/i })
    const obstaclesBtn = within(dialog).getByRole('button', { name: /Obstacles/i })
    expect(obstaclesBtn).toBeInTheDocument()
    act(() => {
      fireEvent.click(obstaclesBtn)
    })

    // Check Speed options inside settings
    const fastBtn = within(dialog).getByRole('button', { name: /Fast/i })
    expect(fastBtn).toBeInTheDocument()
    act(() => {
      fireEvent.click(fastBtn)
    })

    // Close settings dialog
    const closeBtn = within(dialog).getByRole('button', { name: /Close dialog/i })
    act(() => {
      fireEvent.click(closeBtn)
    })

    // Reopen settings dialog and verify selections persisted
    act(() => {
      fireEvent.click(settingsBtn)
    })
    const reopenedDialog = screen.getByRole('dialog', { name: /Settings/i })
    expect(within(reopenedDialog).getByRole('button', { name: /Obstacles/i })).toHaveAttribute('aria-pressed', 'true')
    expect(within(reopenedDialog).getByRole('button', { name: /Fast/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('displays GameResultOverlay when snake collides with wall', () => {
    render(<Snake locale="en" />)

    // Start game
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    })

    // Advance timers so snake moves right and hits the right wall (gridSize 20)
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // GameResultOverlay modal dialog should be displayed with Game Over
    const gameOverDialog = screen.getByRole('dialog')
    expect(gameOverDialog).toBeInTheDocument()
    expect(screen.getByText(/Game Over/i)).toBeInTheDocument()

    // Play again button restarts game
    const restartBtn = within(gameOverDialog).getByRole('button', { name: /Play again/i })
    expect(restartBtn).toBeInTheDocument()
    act(() => {
      fireEvent.click(restartBtn)
    })

    // Should return to PLAYING state with Pause button
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument()
  })

  it('renders Polish translations when locale is "pl"', () => {
    render(<Snake locale="pl" />)

    // Title and start button
    expect(screen.getByText('Wąż')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()

    // Start game
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    })
    expect(screen.getByRole('button', { name: 'Pauza' })).toBeInTheDocument()

    // D-pad Polish aria labels
    expect(screen.getByRole('button', { name: 'W górę' })).toBeInTheDocument()
  })

  it('notifies shell with setIsActive and prompts confirmation when changing map mode while active', () => {
    const setIsActive = vi.fn()
    render(<Snake locale="en" setIsActive={setIsActive} />)

    // Initially inactive
    expect(setIsActive).toHaveBeenLastCalledWith(false)

    // Start game -> active
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    })
    expect(setIsActive).toHaveBeenLastCalledWith(true)

    // Open settings drawer
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    act(() => {
      fireEvent.click(settingsBtn)
    })

    // Try to switch map mode to 'Obstacles'
    const settingsDialog = screen.getByRole('dialog', { name: /Settings/i })
    const obstaclesBtn = within(settingsDialog).getByRole('button', { name: /^obstacles$/i })
    act(() => {
      fireEvent.click(obstaclesBtn)
    })

    // ConfirmDialog should be displayed
    const confirmDialog = screen.getByRole('dialog', { name: /Start new game\?/i })
    expect(confirmDialog).toBeInTheDocument()
    expect(within(confirmDialog).getByText(/Start new game\?/i)).toBeInTheDocument()

    // Clicking cancel keeps game state
    const cancelBtn = within(confirmDialog).getByRole('button', { name: /cancel/i })
    act(() => {
      fireEvent.click(cancelBtn)
    })
    expect(screen.queryByText(/Start new game\?/i)).toBeNull()
  })

  it('allows dismissing GameResultOverlay to view the board', () => {
    render(<Snake locale="en" />)

    // Start game
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    })

    // Advance timers until collision occurs
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Full overlay dialog is displayed
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Click close button
    const closeBtn = screen.getByRole('button', { name: /Close dialog/i })
    act(() => {
      fireEvent.click(closeBtn)
    })

    // Dialog is dismissed, board is fully visible
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders correctly with isEink={true}', () => {
    const { container } = render(<Snake locale="en" isEink={true} />)
    const board = container.querySelector('.snake-board-wrapper')
    expect(board).toBeInTheDocument()
  })
})
