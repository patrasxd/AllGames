import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { WingRush } from '../WingRush'

describe('WingRush Component Integration', () => {
  it('renders FullBleedLayout and canvas stage with ready state prompt', () => {
    render(<WingRush locale="en" />)

    // FullBleedLayout root should be present
    expect(document.querySelector('.all-fullbleed-layout')).toBeInTheDocument()

    // Controls footer should be present with difficulty selector and no restart button
    const footer = document.querySelector('.all-fullbleed-layout__footer')
    expect(footer).toBeInTheDocument()
    expect(footer?.querySelector('#wr-restart-btn')).toBeNull()
    expect(footer?.querySelector('.all-pill-group')).toBeInTheDocument()

    // Canvas should be rendered within edge-to-edge wrapper
    const canvasWrapper = document.querySelector('.wr-canvas-wrapper')
    expect(canvasWrapper).toBeInTheDocument()
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()

    // Start overlay card should be visible with Start button
    const startBtn = screen.getByRole('button', { name: /^Start$/i })
    expect(startBtn).toBeInTheDocument()
    expect(screen.getByText(/Wing Rush/i)).toBeInTheDocument()

    // Clicking start button begins play
    fireEvent.click(startBtn)
  })
})
