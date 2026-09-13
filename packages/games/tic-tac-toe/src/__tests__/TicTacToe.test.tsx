import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { TicTacToe } from '../TicTacToe'

describe('TicTacToe Component Integration', () => {
  it('renders mode selection and navigates into game with BoardLayout and Buttons', async () => {
    render(<TicTacToe locale="en" />)

    // Mode select should show Two players option
    const twoPlayersBtn = screen.getByRole('button', { name: /Two players/i })
    expect(twoPlayersBtn).toBeInTheDocument()

    // Select 2 Players mode
    fireEvent.click(twoPlayersBtn)

    // Wait for transition to complete and New Game button to appear
    const newGameBtn = await waitFor(() => screen.getByRole('button', { name: /New Game/i }))
    expect(newGameBtn).toBeInTheDocument()

    // 3x3 board cells should be rendered
    const cells = screen.getAllByRole('button', { name: /cell \d/i })
    expect(cells.length).toBe(9)

    // Click first cell (X move)
    fireEvent.click(cells[0])
    expect(cells[0].querySelector('svg')).toBeInTheDocument()

    // Click New Game
    fireEvent.click(newGameBtn)
    expect(cells[0].querySelector('svg')).toBeNull()
  })
})
