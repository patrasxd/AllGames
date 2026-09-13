import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Game2048 } from '../Game2048'

describe('Game2048 Component Integration', () => {
  it('renders BoardLayout with 2048 grid, D-pad and @all/ui Buttons', () => {
    render(<Game2048 locale="en" />)

    // Should render New Game button (from @all/ui Button)
    const newGameBtn = screen.getByRole('button', { name: /New Game/i })
    expect(newGameBtn).toBeInTheDocument()

    // Should render Undo button
    const undoBtn = screen.getByRole('button', { name: /Undo/i })
    expect(undoBtn).toBeInTheDocument()

    // Board stage should be rendered
    const board = document.querySelector('.board-2048-wrapper')
    expect(board).toBeInTheDocument()

    // Move Up using D-Pad
    const upBtn = screen.getByRole('button', { name: /Move Up/i })
    fireEvent.click(upBtn)

    // Clicking New Game button
    fireEvent.click(newGameBtn)
    expect(newGameBtn).toBeInTheDocument()
  })
})
