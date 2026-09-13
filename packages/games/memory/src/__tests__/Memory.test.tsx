import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { Memory } from '../Memory'

describe('Memory Component Integration', () => {
  it('renders mode selection and navigates into game with BoardLayout and Buttons', async () => {
    render(<Memory locale="en" />)

    // Mode select should show 1 Player and 2 Players
    const singlePlayerBtn = screen.getByRole('button', { name: /1 Player/i })
    expect(singlePlayerBtn).toBeInTheDocument()

    // Select 1 Player mode
    fireEvent.click(singlePlayerBtn)

    // Wait for transition to complete and New Game button to appear (from @all/ui Button)
    const newGameBtn = await waitFor(() => screen.getByRole('button', { name: /New Game/i }))
    expect(newGameBtn).toBeInTheDocument()

    // Cards should be rendered in the board
    const cards = document.querySelectorAll('.memory-card')
    expect(cards.length).toBeGreaterThan(0)

    // Clicking card flips it
    fireEvent.click(cards[0])
    expect(cards[0]).toHaveClass('memory-card--flipped')

    // Click New Game
    fireEvent.click(newGameBtn)
    expect(newGameBtn).toBeInTheDocument()
  })
})
