import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Snake } from '../Snake'

describe('Snake Component Integration', () => {
  it('renders BoardLayout with start button and controls', () => {
    render(<Snake locale="en" />)

    // Should render start button (from @all/ui Button)
    const startBtn = screen.getByRole('button', { name: /^start$/i })
    expect(startBtn).toBeInTheDocument()

    // SVG Board should be rendered inside BoardLayout
    const board = document.querySelector('.snake-board-wrapper')
    expect(board).toBeInTheDocument()

    // Clicking start button starts game
    fireEvent.click(startBtn)

    // Should transition to pause button
    const pauseBtn = screen.getByRole('button', { name: /Pause/i })
    expect(pauseBtn).toBeInTheDocument()
  })
})
