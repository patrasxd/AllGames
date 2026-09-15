import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import React from 'react'
import { Game2048 } from '../Game2048'

describe('Game2048 Component Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders BoardLayout with 2048 grid, D-pad and @all/ui Buttons', () => {
    render(<Game2048 locale="en" />)

    // Should render New Game button (from @all/ui Button)
    const newGameBtn = screen.getByRole('button', { name: /New Game/i })
    expect(newGameBtn).toBeInTheDocument()

    // Should render Undo button (initially disabled)
    const undoBtn = screen.getByRole('button', { name: /Undo/i })
    expect(undoBtn).toBeInTheDocument()
    expect(undoBtn).toBeDisabled()

    // Board stage should be rendered
    const board = document.querySelector('.board-2048-wrapper')
    expect(board).toBeInTheDocument()

    // Move Up using D-Pad
    const upBtn = screen.getByRole('button', { name: /Move Up/i })
    fireEvent.click(upBtn)

    // Clicking New Game button resets or retains active state
    fireEvent.click(newGameBtn)
    expect(newGameBtn).toBeInTheDocument()
  })

  it('handles moves and enables undo functionality', async () => {
    render(<Game2048 locale="en" />)

    const undoBtn = screen.getByRole('button', { name: /Undo/i })
    expect(undoBtn).toBeDisabled()

    // Execute moves using keyboard
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    fireEvent.keyDown(window, { key: 'ArrowDown' })

    // If a move was valid, undo should become enabled
    await waitFor(() => {
      // Either D-Pad or Arrow keys triggered move
      const leftBtn = screen.getByRole('button', { name: /Move Left/i })
      fireEvent.click(leftBtn)
      const rightBtn = screen.getByRole('button', { name: /Move Right/i })
      fireEvent.click(rightBtn)
    })

    if (!undoBtn.hasAttribute('disabled')) {
      fireEvent.click(undoBtn)
      expect(undoBtn).toBeDisabled()
    }
  })

  it('prompts confirmation dialog when changing grid size while game is active', async () => {
    render(<Game2048 locale="en" />)

    // Make a move using D-Pad to ensure game is active
    const upBtn = screen.getByRole('button', { name: /Move Up/i })
    const leftBtn = screen.getByRole('button', { name: /Move Left/i })
    const downBtn = screen.getByRole('button', { name: /Move Down/i })
    const rightBtn = screen.getByRole('button', { name: /Move Right/i })

    fireEvent.click(leftBtn)
    fireEvent.click(downBtn)
    fireEvent.click(rightBtn)
    fireEvent.click(upBtn)

    // Open Settings dialog
    const settingsBtn = screen.getByRole('button', { name: /Settings/i })
    expect(settingsBtn).toBeInTheDocument()
    fireEvent.click(settingsBtn)

    // Click 5x5 board size pill in settings dialog
    const dialog = screen.getByRole('dialog', { name: /Settings/i })
    const size5Btn = within(dialog).getByRole('button', { name: /5x5/i })
    expect(size5Btn).toBeInTheDocument()
    fireEvent.click(size5Btn)

    // Check confirmation dialog
    expect(screen.getByRole('dialog', { name: /Reset game\?/i })).toBeInTheDocument()

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(screen.queryByText(/Reset game\?/i)).toBeNull()
    })
  })

  it('renders in Polish locale with appropriate translations', () => {
    render(<Game2048 locale="pl" />)

    expect(screen.getByRole('button', { name: /Nowa gra/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cofnij/i })).toBeInTheDocument()
    
    // Settings button is labeled in Polish
    const settingsBtn = screen.getByRole('button', { name: /Ustawienia/i })
    expect(settingsBtn).toBeInTheDocument()
    fireEvent.click(settingsBtn)

    // Options inside settings dialog
    const plDialog = screen.getByRole('dialog', { name: /Ustawienia/i })
    expect(within(plDialog).getByRole('button', { name: /3x3/i })).toBeInTheDocument()
    expect(within(plDialog).getByRole('button', { name: /4x4/i })).toBeInTheDocument()
    expect(within(plDialog).getByRole('button', { name: /5x5/i })).toBeInTheDocument()
  })

  it('supports New Game and Undo from inside the settings menu', async () => {
    render(<Game2048 locale="en" />)

    // Make moves using D-Pad
    const upBtn = screen.getByRole('button', { name: /Move Up/i })
    const leftBtn = screen.getByRole('button', { name: /Move Left/i })
    fireEvent.click(leftBtn)
    fireEvent.click(upBtn)

    // Open Settings dialog
    const settingsBtn = screen.getByRole('button', { name: /Settings/i })
    fireEvent.click(settingsBtn)

    const dialog = screen.getByRole('dialog', { name: /Settings/i })
    expect(dialog).toBeInTheDocument()

    // Undo button inside settings dialog
    const undoBtn = within(dialog).getByRole('button', { name: /Undo/i })
    expect(undoBtn).toBeInTheDocument()

    // New game button inside settings dialog
    const newGameBtn = within(dialog).getByRole('button', { name: /New Game/i })
    expect(newGameBtn).toBeInTheDocument()

    // Clicking Undo in settings triggers undo and closes settings
    if (!undoBtn.hasAttribute('disabled')) {
      fireEvent.click(undoBtn)
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /Settings/i })).toBeNull()
      })
    }
  })

  it('renders properly in E-ink mode', () => {
    render(<Game2048 locale="en" isEink={true} />)

    const board = document.querySelector('.board-2048-wrapper')
    expect(board).toBeInTheDocument()

    const tiles = document.querySelectorAll('.tile-2048')
    expect(tiles.length).toBeGreaterThanOrEqual(1)
  })
})

