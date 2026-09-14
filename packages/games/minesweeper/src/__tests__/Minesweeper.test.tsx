import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { Minesweeper } from '../Minesweeper'

describe('Minesweeper Component Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders BoardLayout with statusbar, grid and difficulty pills', () => {
    render(<Minesweeper locale="en" />)

    // Statusbar face button
    const faceBtn = document.getElementById('ms-face-btn')
    expect(faceBtn).toBeInTheDocument()

    // 81 cells in beginner 9x9 grid
    const cells = document.querySelectorAll('.ms-cell')
    expect(cells.length).toBe(81)

    // Dig touch mode button
    const digBtn = document.getElementById('ms-touch-dig')
    expect(digBtn).toBeInTheDocument()

    // Flag touch mode button
    const flagBtn = document.getElementById('ms-touch-flag')
    expect(flagBtn).toBeInTheDocument()

    // Clicking a cell reveals it and starts the game
    fireEvent.click(cells[0])
    expect(cells[0]).toHaveClass('ms-cell--revealed')

    // Clicking face button resets board
    if (faceBtn) {
      fireEvent.click(faceBtn)
    }
  })

  it('handles touch mode switching between dig and flag', () => {
    render(<Minesweeper locale="en" />)

    const flagBtn = document.getElementById('ms-touch-flag') as HTMLButtonElement
    const digBtn = document.getElementById('ms-touch-dig') as HTMLButtonElement

    expect(digBtn.classList.contains('ms-touch-btn--active')).toBe(true)

    // Switch to flag mode
    fireEvent.click(flagBtn)
    expect(flagBtn.classList.contains('ms-touch-btn--active')).toBe(true)

    // In flag mode, tapping a cell flags it instead of revealing
    const cells = document.querySelectorAll('.ms-cell')
    fireEvent.click(cells[5])
    expect(cells[5].querySelector('.ms-cell-flag')).toBeInTheDocument()

    // Switch back to dig mode
    fireEvent.click(digBtn)
    expect(digBtn.classList.contains('ms-touch-btn--active')).toBe(true)
  })

  it('prompts confirmation dialog when changing difficulty while game is active', async () => {
    render(<Minesweeper locale="en" />)

    const intermediateBtn = screen.getByRole('button', { name: /Intermediate/i })
    expect(intermediateBtn).toBeInTheDocument()

    // Click first cell to make game active
    const cells = document.querySelectorAll('.ms-cell')
    fireEvent.click(cells[0])

    // Click Intermediate difficulty pill
    fireEvent.click(intermediateBtn)

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Reset game\?/i)).toBeInTheDocument()
    })

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    // Now click Intermediate again and confirm
    fireEvent.click(intermediateBtn)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const confirmBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(confirmBtn)

    // Board should now be 16x16 (256 cells)
    await waitFor(() => {
      const newCells = document.querySelectorAll('.ms-cell')
      expect(newCells.length).toBe(256)
    })
  })

  it('renders in Polish locale with appropriate translations', () => {
    render(<Minesweeper locale="pl" />)

    // Difficulty buttons in Polish
    expect(screen.getByRole('button', { name: /Łatwy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Średni/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Trudny/i })).toBeInTheDocument()

    // Touch actions in Polish
    expect(screen.getByText(/Odkrywaj/i)).toBeInTheDocument()
    expect(screen.getByText(/Stawiaj flagi/i)).toBeInTheDocument()
  })

  it('renders properly in E-ink mode', () => {
    render(<Minesweeper locale="en" isEink={true} />)

    const cells = document.querySelectorAll('.ms-cell')
    expect(cells.length).toBe(81)

    // Cell click works in E-Ink mode
    fireEvent.click(cells[0])
    expect(cells[0]).toHaveClass('ms-cell--revealed')
  })
})
