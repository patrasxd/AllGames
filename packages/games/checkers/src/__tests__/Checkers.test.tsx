import { describe, it, expect, vi } from 'vitest'
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

  it('handles 2-Player turn move flow: select piece and move to valid destination', async () => {
    render(<Checkers locale="en" />)

    fireEvent.click(screen.getByRole('button', { name: /2 Players/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    // In initial board, white piece exists at (row 5, col 0) [square id: checkers-sq-5-0]
    const whiteSquare = document.getElementById('checkers-sq-5-0') as HTMLButtonElement
    expect(whiteSquare).toBeInTheDocument()
    expect(whiteSquare.querySelector('.checkers-piece--white')).toBeInTheDocument()

    // Click on white piece to select it
    fireEvent.click(whiteSquare)

    // Destination (row 4, col 1) should now be a target square with dot
    const targetSquare = document.getElementById('checkers-sq-4-1') as HTMLButtonElement
    expect(targetSquare).toBeInTheDocument()
    expect(targetSquare.classList.contains('checkers-square--target')).toBe(true)

    // Click target square to execute move
    fireEvent.click(targetSquare)

    // Piece should now be at (4, 1) and (5, 0) should be empty
    expect(targetSquare.querySelector('.checkers-piece--white')).toBeInTheDocument()
    expect(whiteSquare.querySelector('.checkers-piece--white')).toBeNull()

    // Turn should now be Black's turn
    expect(screen.getByText(/Black's turn/i)).toBeInTheDocument()
  })

  it('handles vs Computer mode and difficulty confirmation modal when game is active', async () => {
    render(<Checkers locale="en" />)

    // Select vs Computer mode
    const vsCompBtn = screen.getByRole('button', { name: /vs Computer/i })
    fireEvent.click(vsCompBtn)

    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    // Difficulty pill group should be present
    expect(screen.getByRole('group', { name: /Difficulty/i })).toBeInTheDocument()
    const hardDiffBtn = screen.getByRole('button', { name: /Hard/i })
    expect(hardDiffBtn).toBeInTheDocument()

    // Make a move to activate game
    const whiteSquare = document.getElementById('checkers-sq-5-0') as HTMLButtonElement
    fireEvent.click(whiteSquare)

    const targetSquare = document.getElementById('checkers-sq-4-1') as HTMLButtonElement
    fireEvent.click(targetSquare)

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
    expect(targetSquare.querySelector('.checkers-piece--white')).toBeInTheDocument()
  })

  it('renders in Polish locale with appropriate translations', async () => {
    render(<Checkers locale="pl" />)

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
    render(<Checkers locale="en" isEink={true} />)

    fireEvent.click(screen.getByRole('button', { name: /2 Players/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    const whiteSquare = document.getElementById('checkers-sq-5-0') as HTMLButtonElement
    expect(whiteSquare.querySelector('.checkers-piece--white')).toBeInTheDocument()
  })
})
