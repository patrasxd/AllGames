import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { Chess } from '../Chess'

describe('Chess Component Integration', () => {
  it('renders mode selection and navigates into game with BoardLayout and Buttons', async () => {
    render(<Chess locale="en" />)

    // Mode select should show 2 players option
    const twoPlayersBtn = screen.getByRole('button', { name: /2 Players/i })
    expect(twoPlayersBtn).toBeInTheDocument()

    // Select 2 Players mode
    fireEvent.click(twoPlayersBtn)

    // Wait for transition to complete and New Game button to appear
    const newGameBtn = await waitFor(() => screen.getByRole('button', { name: /New Game/i }))
    expect(newGameBtn).toBeInTheDocument()

    // BoardLayout with chess grid should be rendered
    const squares = document.querySelectorAll('.chess-square')
    expect(squares.length).toBe(64)

    // Clicking square selects it
    fireEvent.click(squares[52]) // e2 white pawn
    expect(squares[52]).toHaveClass('chess-square--selected')

    // Clicking New Game button resets or keeps ready state
    fireEvent.click(newGameBtn)
    expect(newGameBtn).toBeInTheDocument()
  })
})
