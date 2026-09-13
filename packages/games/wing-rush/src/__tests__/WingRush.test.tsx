import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { FlappyBird } from '../FlappyBird'

describe('WingRush Component Integration', () => {
  it('renders FullBleedLayout and canvas stage with ready state prompt', () => {
    render(<FlappyBird locale="en" />)

    // FullBleedLayout root should be present
    expect(document.querySelector('.all-fullbleed-layout')).toBeInTheDocument()

    // Controls footer should be present with difficulty selector and restart button
    const footer = document.querySelector('.all-fullbleed-layout__footer')
    expect(footer).toBeInTheDocument()
    expect(footer?.querySelector('#fb-restart-btn')).toBeInTheDocument()
    expect(footer?.querySelector('.all-pill-group')).toBeInTheDocument()

    // Canvas should be rendered within edge-to-edge wrapper
    const canvasWrapper = document.querySelector('.fb-canvas-wrapper')
    expect(canvasWrapper).toBeInTheDocument()
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
