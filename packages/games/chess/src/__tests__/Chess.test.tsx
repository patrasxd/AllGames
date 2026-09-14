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

    // Clicking New Game button resets or keeps ready state
    fireEvent.click(newGameBtn)
    expect(newGameBtn).toBeInTheDocument()
  })

  it('handles 2-Player turn move flow: select piece and move to valid destination', async () => {
    render(<Chess locale="en" />)

    fireEvent.click(screen.getByRole('button', { name: /2 Players/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    // Initial white pawn at row 6, col 4 (e2)
    const e2Square = document.getElementById('chess-sq-6-4') as HTMLButtonElement
    expect(e2Square).toBeInTheDocument()
    expect(e2Square.querySelector('svg')).toBeInTheDocument()

    // Click on e2 to select it
    fireEvent.click(e2Square)
    expect(e2Square.classList.contains('chess-square--selected')).toBe(true)

    // e4 (row 4, col 4) should be a valid target square
    const e4Square = document.getElementById('chess-sq-4-4') as HTMLButtonElement
    expect(e4Square).toBeInTheDocument()
    expect(e4Square.classList.contains('chess-square--target')).toBe(true)

    // Click e4 to execute move
    fireEvent.click(e4Square)

    // Pawn should now be at e4, and e2 should be empty
    expect(e4Square.querySelector('svg')).toBeInTheDocument()
    expect(e2Square.querySelector('svg')).toBeNull()

    // Turn should now be Black's turn
    expect(screen.getByText(/Black's turn/i)).toBeInTheDocument()
  })

  it('handles vs Computer mode and difficulty confirmation modal when game is active', async () => {
    render(<Chess locale="en" />)

    // Select vs Computer mode
    const vsCompBtn = screen.getByRole('button', { name: /vs Computer/i })
    fireEvent.click(vsCompBtn)

    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    // Difficulty pill group should be present
    expect(screen.getByRole('group', { name: /Difficulty/i })).toBeInTheDocument()
    const hardDiffBtn = screen.getByRole('button', { name: /Hard/i })
    expect(hardDiffBtn).toBeInTheDocument()

    // Make a move to activate game (e2 to e4)
    const e2Square = document.getElementById('chess-sq-6-4') as HTMLButtonElement
    fireEvent.click(e2Square)

    const e4Square = document.getElementById('chess-sq-4-4') as HTMLButtonElement
    fireEvent.click(e4Square)

    // Click 'Hard' difficulty pill while game is active
    fireEvent.click(hardDiffBtn)

    // Confirmation dialog should open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Reset game\?/i)).toBeInTheDocument()
    })

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtn)

    // Dialog should be dismissed and moved piece remains
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    expect(e4Square.querySelector('svg')).toBeInTheDocument()
  })

  it('renders in Polish locale with appropriate translations', async () => {
    render(<Chess locale="pl" />)

    // Mode select in Polish
    const twoPlayersPl = screen.getByRole('button', { name: /2 graczy/i })
    expect(twoPlayersPl).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vs Komputer/i })).toBeInTheDocument()

    fireEvent.click(twoPlayersPl)
    await waitFor(() => expect(screen.getByRole('button', { name: /Nowa gra/i })).toBeInTheDocument())

    expect(screen.getByRole('button', { name: /Zmień tryb/i })).toBeInTheDocument()
    expect(screen.getByText(/Ruch: Białe/i)).toBeInTheDocument()
  })

  it('renders properly in E-ink mode', async () => {
    render(<Chess locale="en" isEink={true} />)

    fireEvent.click(screen.getByRole('button', { name: /2 Players/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    const e2Square = document.getElementById('chess-sq-6-4') as HTMLButtonElement
    expect(e2Square.querySelector('svg')).toBeInTheDocument()
  })
})
