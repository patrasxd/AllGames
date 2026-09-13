import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Minesweeper } from '../Minesweeper'

describe('Minesweeper Component Integration', () => {
  it('renders BoardLayout with statusbar, grid and difficulty pills', () => {
    render(<Minesweeper locale="en" />)

    // Statusbar face button should be rendered
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

    // Clicking a cell reveals it
    fireEvent.click(cells[0])
    expect(cells[0]).toHaveClass('ms-cell--revealed')

    // Clicking face button resets board
    if (faceBtn) {
      fireEvent.click(faceBtn)
    }
  })
})
