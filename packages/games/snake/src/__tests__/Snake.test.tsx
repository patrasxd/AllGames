import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

  it('allows switching map modes and speed modes via PillGroups', () => {
    render(<Snake locale="en" />)

    // Check Map options
    const obstaclesBtn = screen.getByRole('button', { name: /Obstacles/i })
    expect(obstaclesBtn).toBeInTheDocument()
    act(() => {
      fireEvent.click(obstaclesBtn)
    })

    // Check Speed options
    const fastBtn = screen.getByRole('button', { name: /Fast/i })
    expect(fastBtn).toBeInTheDocument()
    act(() => {
      fireEvent.click(fastBtn)
    })
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
    const restartBtn = screen.getByRole('button', { name: /Play again/i })
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

  it('renders correctly with isEink={true}', () => {
    const { container } = render(<Snake locale="en" isEink={true} />)
    const board = container.querySelector('.snake-board-wrapper')
    expect(board).toBeInTheDocument()
  })
})

