import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Sudoku } from '../Sudoku'

describe('Sudoku Component Integration', () => {
  it('renders BoardLayout with 9x9 sudoku grid, numpad and @all/ui Buttons', () => {
    render(<Sudoku locale="en" />)

    // Should render New Game button (from @all/ui Button)
    const newGameBtn = screen.getByRole('button', { name: /New Game/i })
    expect(newGameBtn).toBeInTheDocument()

    // 81 cells should be present in the board
    const cells = document.querySelectorAll('.sdk-cell')
    expect(cells.length).toBe(81)

    // Select first cell
    fireEvent.click(cells[0])
    expect(cells[0]).toHaveClass('sdk-cell--selected')

    // Click New Game
    fireEvent.click(newGameBtn)
    expect(newGameBtn).toBeInTheDocument()
  })
})
