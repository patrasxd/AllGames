import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { TicTacToe } from '../TicTacToe'

describe('TicTacToe Component Integration', () => {
  it('renders mode selection and navigates into game with BoardLayout and Buttons', async () => {
    render(<TicTacToe locale="en" />)

    // Mode select should show Two players option (aria-label: Two players game mode)
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

    // Click second cell (O move in 2P)
    fireEvent.click(cells[1])
    expect(cells[1].querySelector('svg')).toBeInTheDocument()

    // Click New Game
    fireEvent.click(newGameBtn)
    expect(cells[0].querySelector('svg')).toBeNull()
    expect(cells[1].querySelector('svg')).toBeNull()
  })

  it('handles 2-Player game win detection and status update', async () => {
    render(<TicTacToe locale="en" />)

    fireEvent.click(screen.getByRole('button', { name: /Two players/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    const cells = screen.getAllByRole('button', { name: /cell \d/i })

    // X wins across top row:
    // X (0), O (3), X (1), O (4), X (2)
    fireEvent.click(cells[0]) // X
    fireEvent.click(cells[3]) // O
    fireEvent.click(cells[1]) // X
    fireEvent.click(cells[4]) // O
    fireEvent.click(cells[2]) // X (wins)

    expect(screen.getByText(/Player X won/i)).toBeInTheDocument()
    expect(screen.getByText(/game over/i)).toBeInTheDocument()

    // Further clicks should be disabled
    fireEvent.click(cells[5])
    expect(cells[5].querySelector('svg')).toBeNull()
  })

  it('handles vs Computer mode and difficulty confirmation modal when game is active', async () => {
    render(<TicTacToe locale="en" />)

    fireEvent.click(screen.getByRole('button', { name: /Play against computer/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    const cells = screen.getAllByRole('button', { name: /cell \d/i })

    // Make a move to activate game
    fireEvent.click(cells[0])

    // Click 'Hard' difficulty pill
    const hardDiffBtn = screen.getByRole('button', { name: /Hard/i })
    fireEvent.click(hardDiffBtn)

    // Confirmation dialog should open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Reset game\?/i)).toBeInTheDocument()
    })

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtn)

    // Dialog should be dismissed and game remains
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    expect(cells[0].querySelector('svg')).toBeInTheDocument()
  })

  it('renders in Polish locale with appropriate translations', async () => {
    render(<TicTacToe locale="pl" />)

    // Mode select in Polish (accessible via aria-labels)
    const twoPlayersPl = screen.getByRole('button', { name: /Tryb dla dwóch graczy/i })
    expect(twoPlayersPl).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tryb gry z komputerem/i })).toBeInTheDocument()

    fireEvent.click(twoPlayersPl)
    await waitFor(() => expect(screen.getByRole('button', { name: /Nowa gra/i })).toBeInTheDocument())

    expect(screen.getByRole('button', { name: /Zmień tryb/i })).toBeInTheDocument()
  })

  it('renders properly in E-ink mode', async () => {
    render(<TicTacToe locale="en" isEink={true} />)

    fireEvent.click(screen.getByRole('button', { name: /Two players/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    const cells = screen.getAllByRole('button', { name: /cell \d/i })
    fireEvent.click(cells[0])

    // In E-ink mode, SVG line should exist without motion animation
    const svg = cells[0].querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
