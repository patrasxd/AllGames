import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { Sudoku } from '../Sudoku'

describe('Sudoku Component Integration', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('renders BoardLayout with 9x9 sudoku grid, numpad and @all/ui Buttons', () => {
    render(<Sudoku locale="en" />)

    // New Game button in controls bar
    const newGameBtn = screen.getByRole('button', { name: /New Game/i })
    expect(newGameBtn).toBeInTheDocument()

    // Difficulty pill group
    expect(screen.getByRole('group', { name: /Difficulty/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Easy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Medium/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hard/i })).toBeInTheDocument()

    // 81 cells should be present in the board
    const cells = document.querySelectorAll('.sdk-cell')
    expect(cells.length).toBe(81)

    // Numpad tools
    expect(document.getElementById('sdk-tool-undo')).toBeInTheDocument()
    expect(document.getElementById('sdk-tool-erase')).toBeInTheDocument()
    expect(document.getElementById('sdk-tool-pencil')).toBeInTheDocument()

    // Digits 1 to 9
    for (let d = 1; d <= 9; d++) {
      expect(document.getElementById(`sdk-num-${d}`)).toBeInTheDocument()
    }
  })

  it('supports cell selection and keyboard navigation with roving tabindex', () => {
    render(<Sudoku locale="en" />)

    const cells = document.querySelectorAll('.sdk-cell')
    expect(cells.length).toBe(81)

    // First cell has tabIndex 0 initially
    expect(cells[0]).toHaveAttribute('tabindex', '0')

    // Click to select cell 0
    fireEvent.click(cells[0])
    expect(cells[0]).toHaveClass('sdk-cell--selected')
    expect(cells[0]).toHaveAttribute('aria-selected', 'true')

    // Navigate right with ArrowRight
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(cells[1]).toHaveClass('sdk-cell--selected')
    expect(cells[1]).toHaveAttribute('tabindex', '0')

    // Navigate down with ArrowDown
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(cells[10]).toHaveClass('sdk-cell--selected') // row 1, col 1
  })

  it('supports number input, erase, and pencil note mode with undo', () => {
    render(<Sudoku locale="en" />)

    // Find an empty cell that is not initial clue
    const cells = Array.from(document.querySelectorAll('.sdk-cell'))
    const emptyCellIndex = cells.findIndex((c) => !c.classList.contains('sdk-cell--initial'))
    expect(emptyCellIndex).toBeGreaterThanOrEqual(0)

    const targetCell = cells[emptyCellIndex]

    // Undo should initially be disabled
    const undoBtn = document.getElementById('sdk-tool-undo') as HTMLButtonElement
    expect(undoBtn).toBeDisabled()

    // Select the cell
    fireEvent.click(targetCell)
    expect(targetCell).toHaveClass('sdk-cell--selected')

    // Toggle pencil mode
    const pencilBtn = document.getElementById('sdk-tool-pencil') as HTMLButtonElement
    fireEvent.click(pencilBtn)
    expect(pencilBtn).toHaveAttribute('aria-pressed', 'true')

    // Add note 7
    const num7Btn = document.getElementById('sdk-num-7') as HTMLButtonElement
    fireEvent.click(num7Btn)

    // Verify note is rendered in cell
    expect(targetCell.querySelector('.sdk-cell-note')).toBeInTheDocument()
    expect(undoBtn).not.toBeDisabled()

    // Undo the note
    fireEvent.click(undoBtn)

    // Note should be undone
    expect(targetCell.querySelector('.sdk-cell-note')).toBeNull()

    // Turn off pencil mode
    fireEvent.click(pencilBtn)
    expect(pencilBtn).toHaveAttribute('aria-pressed', 'false')

    // Input digit via numpad button
    const num4Btn = document.getElementById('sdk-num-4') as HTMLButtonElement
    fireEvent.click(num4Btn)

    // Value or error should be set
    const valElem = targetCell.querySelector('.sdk-cell-val')
    expect(valElem).toBeInTheDocument()
    expect(valElem?.textContent).toBe('4')

    // Erase the value
    const eraseBtn = document.getElementById('sdk-tool-erase') as HTMLButtonElement
    fireEvent.click(eraseBtn)
    expect(targetCell.querySelector('.sdk-cell-val')).toBeNull()
  })

  it('prompts ConfirmDialog when clicking New Game or changing difficulty during active game', async () => {
    render(<Sudoku locale="en" />)

    // Enter a number in an empty cell to activate the game
    const cells = Array.from(document.querySelectorAll('.sdk-cell'))
    const emptyCell = cells.find((c) => !c.classList.contains('sdk-cell--initial'))!
    fireEvent.click(emptyCell)
    fireEvent.click(document.getElementById('sdk-num-4')!)

    // Changing difficulty when game is active prompts confirmation dialog
    const hardDiffBtn = screen.getByRole('button', { name: /Hard/i })
    fireEvent.click(hardDiffBtn)

    // Dialog should be open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Reset game\?/i)).toBeInTheDocument()
    })

    // Click Cancel
    const cancelBtn = document.getElementById('sdk-modal-cancel') as HTMLButtonElement
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    // Click New Game button -> should prompt dialog
    const newGameBtn = document.getElementById('sdk-new-game-btn') as HTMLButtonElement
    fireEvent.click(newGameBtn)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Click Confirm
    const confirmBtn = document.getElementById('sdk-modal-confirm') as HTMLButtonElement
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('handles mistakes limit (3 mistakes) and renders GameResultOverlay', async () => {
    render(<Sudoku locale="en" />)

    const cells = Array.from(document.querySelectorAll('.sdk-cell'))
    const emptyCells = cells.filter((c) => !c.classList.contains('sdk-cell--initial'))
    expect(emptyCells.length).toBeGreaterThanOrEqual(3)

    // Trigger 3 mistakes on distinct empty cells
    for (let i = 0; i < 3; i++) {
      fireEvent.click(emptyCells[i])
      for (let num = 1; num <= 9; num++) {
        fireEvent.click(document.getElementById(`sdk-num-${num}`)!)
        if (emptyCells[i].classList.contains('sdk-cell--error')) {
          break
        }
      }
    }

    // After 3 errors, GameResultOverlay should be visible with retry button
    await waitFor(() => {
      expect(document.getElementById('sdk-retry-btn')).toBeInTheDocument()
      expect(screen.getByText(/Game over/i)).toBeInTheDocument()
    })
  })

  it('renders in Polish locale with appropriate translations', () => {
    render(<Sudoku locale="pl" />)

    expect(screen.getByRole('button', { name: /Nowa gra/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Trudność/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Łatwy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Średni/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Trudny/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /Cofnij/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Gumka/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Notatki/i })).toBeInTheDocument()
  })

  it('renders properly in E-Ink mode without errors', () => {
    const { container } = render(<Sudoku isEink={true} locale="en" />)
    expect(container).toBeInTheDocument()

    const cells = document.querySelectorAll('.sdk-cell')
    expect(cells.length).toBe(81)
  })
})
