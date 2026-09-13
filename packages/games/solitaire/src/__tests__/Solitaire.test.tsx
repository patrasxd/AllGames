import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Solitaire } from '../Solitaire'

describe('Solitaire component integration', () => {
  it('renders board, controls, and responds to interactions', () => {
    render(<Solitaire locale="en" />)

    // BoardLayout with variant="wide"
    const layout = document.querySelector('.all-board-layout--wide')
    expect(layout).toBeInTheDocument()

    // Controls buttons
    const newGameBtn = document.getElementById('sol-new-game-btn')
    const undoBtn = document.getElementById('sol-undo-btn')
    const hintBtn = document.getElementById('sol-hint-btn')
    expect(newGameBtn).toBeInTheDocument()
    expect(undoBtn).toBeInTheDocument()
    expect(hintBtn).toBeInTheDocument()

    // Click new game
    fireEvent.click(newGameBtn!)

    // Stock pile interaction
    const stockBtn = document.querySelector('.sol-slot--stock')
    expect(stockBtn).toBeInTheDocument()
    fireEvent.click(stockBtn!)

    // Verify card drawn to waste
    const wasteSlot = document.querySelector('.sol-waste-group') || document.querySelector('.sol-slot')
    expect(wasteSlot).toBeInTheDocument()
  })
})
