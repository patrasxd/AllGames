import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { Checkers } from '../Checkers'

describe('Checkers Component Integration', () => {
  it('renders mode selection and navigates into game with BoardLayout and Buttons', async () => {
    render(<Checkers locale="en" />)

    // Mode select should show 2 players option
    const twoPlayersBtn = screen.getByRole('button', { name: /2 Players/i })
    expect(twoPlayersBtn).toBeInTheDocument()

    // Select 2 Players mode
    fireEvent.click(twoPlayersBtn)

    // Wait for transition to complete and New Game button to appear (from @all/ui Button)
    const newGameBtn = await waitFor(() => screen.getByRole('button', { name: /New Game/i }))
    expect(newGameBtn).toBeInTheDocument()

    // BoardLayout with 64 checkers squares should be rendered
    const squares = document.querySelectorAll('.checkers-square')
    expect(squares.length).toBe(64)

    // Click New Game
    fireEvent.click(newGameBtn)
    expect(newGameBtn).toBeInTheDocument()
  })
})
