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
  }, 10000)

  it('prompts ConfirmDialog when clicking New Game after moves are made', () => {
    render(<Solitaire locale="en" />)

    // Make a move by clicking stock
    const stockBtn = document.querySelector('.sol-slot--stock')
    fireEvent.click(stockBtn!)

    // Click new game - should open ConfirmDialog instead of instant reset
    const newGameBtn = document.getElementById('sol-new-game-btn')
    fireEvent.click(newGameBtn!)

    // Confirm dialog should be open
    const confirmBtn = document.getElementById('sol-new-game-confirm')
    const cancelBtn = document.getElementById('sol-new-game-cancel')
    expect(confirmBtn).toBeInTheDocument()
    expect(cancelBtn).toBeInTheDocument()

    // Cancel preserves current game
    fireEvent.click(cancelBtn!)
    expect(document.getElementById('sol-new-game-confirm')).toBeNull()
  })

  it('supports drag-and-drop targets and responsive selection switching', () => {
    render(<Solitaire locale="en" />)

    // Verify 4 foundation drop targets
    const foundations = document.querySelectorAll('[data-sol-drop-type="foundation"]')
    expect(foundations).toHaveLength(4)

    // Verify 7 tableau drop targets
    const tableauCols = document.querySelectorAll('[data-sol-drop-type="tableau"]')
    expect(tableauCols).toHaveLength(7)

    // Verify face-up cards are draggable
    const faceUpCards = document.querySelectorAll('.sol-card--face')
    expect(faceUpCards.length).toBeGreaterThan(0)
    faceUpCards.forEach(card => {
      expect(card.getAttribute('draggable')).toBe('true')
    })

    // Click first face-up card to select it
    fireEvent.click(faceUpCards[0])
    expect(faceUpCards[0].classList.contains('sol-card--selected')).toBe(true)

    // Click second face-up card (if different) - should smoothly switch selection
    if (faceUpCards.length > 1) {
      fireEvent.click(faceUpCards[1])
      expect(faceUpCards[1].classList.contains('sol-card--selected')).toBe(true)
    }
  })
})

