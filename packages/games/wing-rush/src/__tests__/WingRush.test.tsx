import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { FlappyBird } from '../FlappyBird'

describe('WingRush Component Integration', () => {
  it('renders FullBleedLayout and canvas stage with ready state prompt', () => {
    render(<FlappyBird locale="en" />)

    // FullBleedLayout root should be present
    expect(document.querySelector('.all-fullbleed-layout')).toBeInTheDocument()

    // Canvas should be rendered
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()

    // Ready prompt should be visible
    expect(screen.getByText(/Tap or Space to Flap/i)).toBeInTheDocument()

    // Clicking restart button
    const restartBtn = screen.getByRole('button', { name: /Restart/i })
    expect(restartBtn).toBeInTheDocument()
    fireEvent.click(restartBtn)
  })
})
