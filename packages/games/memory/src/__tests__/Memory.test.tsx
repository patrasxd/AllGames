import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { Memory } from '../Memory'

describe('Memory Component Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders mode selection and navigates into 1P game with BoardLayout, status, and ControlsBar', async () => {
    render(<Memory locale="en" />)

    // Mode select should show 1 Player and 2 Players
    const singlePlayerBtn = screen.getByRole('button', { name: /1 Player/i })
    const twoPlayersBtn = screen.getByRole('button', { name: /2 Players/i })
    expect(singlePlayerBtn).toBeInTheDocument()
    expect(twoPlayersBtn).toBeInTheDocument()

    // Select 1 Player mode
    fireEvent.click(singlePlayerBtn)

    // Wait for transition to complete and New Game button to appear (from @all/ui Button)
    const newGameBtn = await waitFor(() => screen.getByRole('button', { name: /New Game/i }))
    expect(newGameBtn).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Change Mode/i })).toBeInTheDocument()

    // Status bar should show initial 1P state
    expect(screen.getByText(/Find matching pairs/i)).toBeInTheDocument()
    expect(screen.getByText(/Pairs: 0 \/ 8/i)).toBeInTheDocument()

    // Cards should be rendered in the board (medium = 16 cards)
    const cards = document.querySelectorAll('.memory-card')
    expect(cards.length).toBe(16)

    // Clicking a card flips it
    fireEvent.click(cards[0])
    expect(cards[0]).toHaveClass('memory-card--flipped')
  })

  it('handles difficulty changes and prompts confirmation dialog when game is active', async () => {
    render(<Memory locale="en" />)

    fireEvent.click(screen.getByRole('button', { name: /1 Player/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    // Difficulty pill group should be present
    expect(screen.getByRole('group', { name: /Difficulty/i })).toBeInTheDocument()
    const easyBtn = screen.getByRole('button', { name: /Easy/i })
    const hardBtn = screen.getByRole('button', { name: /Hard/i })

    // Change to Easy before making moves (should change immediately without dialog)
    fireEvent.click(easyBtn)
    expect(document.querySelectorAll('.memory-card').length).toBe(12)
    expect(screen.getByText(/Pairs: 0 \/ 6/i)).toBeInTheDocument()

    // Make a move by flipping a card to activate game
    const cards = document.querySelectorAll('.memory-card')
    fireEvent.click(cards[0])
    expect(cards[0]).toHaveClass('memory-card--flipped')

    // Click Hard while game is active — confirmation modal should pop up
    fireEvent.click(hardBtn)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Reset game\?/i)).toBeInTheDocument()
    })

    // Click Cancel — dialog closes, board stays Easy
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    expect(document.querySelectorAll('.memory-card').length).toBe(12)

    // Click Hard again and Confirm
    fireEvent.click(hardBtn)
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    const confirmBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    expect(document.querySelectorAll('.memory-card').length).toBe(24)
    expect(screen.getByText(/Pairs: 0 \/ 12/i)).toBeInTheDocument()
  })

  it('prompts confirmation dialog when clicking Change Mode during an active game', async () => {
    render(<Memory locale="en" />)

    fireEvent.click(screen.getByRole('button', { name: /1 Player/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /Change Mode/i })).toBeInTheDocument())

    // Activate game
    const cards = document.querySelectorAll('.memory-card')
    fireEvent.click(cards[0])

    // Click Change Mode
    fireEvent.click(screen.getByRole('button', { name: /Change Mode/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/Reset game\?/i)).toBeInTheDocument()
    })

    // Confirm navigation back to mode select
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /1 Player/i })).toBeInTheDocument()
    })
  })

  it('handles 2-Player mode turns, matching, and score tracking', async () => {
    const setHeader = vi.fn()
    render(<Memory locale="en" isEink={true} setHeader={setHeader} />)

    // Select 2 Players mode
    fireEvent.click(screen.getByRole('button', { name: /2 Players/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    // Initial status should be Player 1's turn
    expect(screen.getByText(/Player 1's turn/i)).toBeInTheDocument()

    // Find two cards with different symbols and two cards with matching symbols
    const cardEls = Array.from(document.querySelectorAll('.memory-card')) as HTMLElement[]
    const symbolMap = new Map<string, HTMLElement[]>()

    for (const el of cardEls) {
      const sym = el.getAttribute('data-symbol') || ''
      if (!symbolMap.has(sym)) symbolMap.set(sym, [])
      symbolMap.get(sym)!.push(el)
    }

    const symbols = Array.from(symbolMap.keys())
    const matchPair = symbolMap.get(symbols[0])!
    const mismatchCard = symbolMap.get(symbols[1])![0]

    // P1 flips a mismatch: matchPair[0] and mismatchCard
    fireEvent.click(matchPair[0])
    fireEvent.click(mismatchCard)

    // Wait for mismatch evaluation timeout (with isEink it is 450ms)
    await waitFor(
      () => {
        expect(screen.getByText(/Player 2's turn/i)).toBeInTheDocument()
      },
      { timeout: 1500 },
    )

    // P2 flips the matching pair: matchPair[0] and matchPair[1]
    fireEvent.click(matchPair[0])
    fireEvent.click(matchPair[1])

    // Wait for match evaluation timeout (with isEink it is 100ms)
    await waitFor(
      () => {
        expect(matchPair[0]).toHaveClass('memory-card--matched')
        expect(matchPair[1]).toHaveClass('memory-card--matched')
      },
      { timeout: 1000 },
    )

    expect(screen.getByText(/Pairs: 1 \/ 8/i)).toBeInTheDocument()
  })

  it('completes all pairs and renders GameResultOverlay with retry action', async () => {
    render(<Memory locale="en" isEink={true} />)

    // Choose 1 Player
    fireEvent.click(screen.getByRole('button', { name: /1 Player/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument())

    // Switch to Easy (6 pairs) for fast completion
    fireEvent.click(screen.getByRole('button', { name: /Easy/i }))

    // Group cards by symbol
    const cardEls = Array.from(document.querySelectorAll('.memory-card')) as HTMLElement[]
    const symbolMap = new Map<string, HTMLElement[]>()

    for (const el of cardEls) {
      const sym = el.getAttribute('data-symbol') || ''
      if (!symbolMap.has(sym)) symbolMap.set(sym, [])
      symbolMap.get(sym)!.push(el)
    }

    // Match each pair sequentially (with isEink=true, match timeout is 100ms)
    for (const [_, pair] of symbolMap.entries()) {
      fireEvent.click(pair[0])
      fireEvent.click(pair[1])
      await waitFor(
        () => {
          expect(pair[0]).toHaveClass('memory-card--matched')
        },
        { timeout: 1000 },
      )
    }

    // All pairs matched! GameResultOverlay should be visible with play again button
    await waitFor(
      () => {
        expect(document.getElementById('memory-play-again-btn')).toBeInTheDocument()
      },
      { timeout: 1500 },
    )

    expect(screen.getAllByText(/You won!/i).length).toBeGreaterThanOrEqual(1)
    const playAgainBtn = document.getElementById('memory-play-again-btn')!
    expect(playAgainBtn).toBeInTheDocument()

    // Clicking New Game on overlay resets game
    fireEvent.click(playAgainBtn)
    expect(screen.getByText(/Pairs: 0 \/ 6/i)).toBeInTheDocument()
  })

  it('renders in Polish locale with appropriate translations', async () => {
    render(<Memory locale="pl" />)

    // Polish mode buttons
    expect(screen.getByRole('button', { name: /1 Gracz/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /2 Graczy/i })).toBeInTheDocument()

    // Select 1 Gracz
    fireEvent.click(screen.getByRole('button', { name: /1 Gracz/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Nowa gra/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Zmień tryb/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/Znajdź pasujące pary/i)).toBeInTheDocument()
    expect(screen.getByText(/Pary: 0 \/ 8/i)).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Trudność/i })).toBeInTheDocument()
  })
})
