import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { CrystalMatch } from '../CrystalMatch'

describe('CrystalMatch Component Integration', () => {
  it('renders BoardLayout with goals, grid, and @all/ui Buttons', () => {
    render(<CrystalMatch locale="en" />)

    // Should render Restart button (from @all/ui Button)
    const restartBtn = screen.getByRole('button', { name: /Restart/i })
    expect(restartBtn).toBeInTheDocument()

    // Should render How to Play button on controls
    const howToPlayBtn = document.getElementById('cm-how-to-play-btn')
    expect(howToPlayBtn).toBeInTheDocument()

    // Goals bar should be rendered in HUD
    const goalsBar = document.querySelector('.cm-goals-bar')
    expect(goalsBar).toBeInTheDocument()

    // Crystal board grid should be rendered
    const board = document.querySelector('.cm-board-grid')
    expect(board).toBeInTheDocument()

    // Click How to Play button
    if (howToPlayBtn) {
      fireEvent.click(howToPlayBtn)
    }

    // OK button inside rules modal should be visible
    const okBtn = screen.getByRole('button', { name: /OK/i })
    expect(okBtn).toBeInTheDocument()

    // Click OK to close modal
    fireEvent.click(okBtn)
    expect(screen.queryByText(/Rules/i)).not.toBeInTheDocument()
  })
})
