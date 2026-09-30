import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import React from 'react'
import { BubbleShooter } from '../BubbleShooter'

describe('BubbleShooter Component Integration', () => {
  it('renders FullBleedLayout, canvas stage, and the ready-state start overlay', async () => {
    render(<BubbleShooter locale="en" />)

    expect(document.querySelector('.all-fullbleed-layout')).toBeInTheDocument()

    // Footer holds both aim controls and meta-game controls, matching the Artillery convention.
    // Aim controls (.bs-aim-row) sit above the meta row (.bs-meta-row) inside the same ControlsBar.
    const footer = document.querySelector('.all-fullbleed-layout__footer')
    expect(footer).toBeInTheDocument()
    expect(footer?.querySelector('.all-pill-group')).toBeInTheDocument()
    expect(footer?.querySelector('.bs-aim-row')).toBeInTheDocument()
    expect(footer?.querySelector('.bs-meta-row')).toBeInTheDocument()

    // Canvas wrapper is clean — no overlay buttons covering the shooter anymore.
    const canvasWrapper = document.querySelector('.bs-canvas-wrapper')
    expect(canvasWrapper).toBeInTheDocument()
    expect(canvasWrapper?.querySelector('.bs-touch-dock')).not.toBeInTheDocument()
    expect(document.querySelector('canvas')).toBeInTheDocument()

    const startBtn = screen.getByRole('button', { name: /^Start$/i })
    expect(startBtn).toBeInTheDocument()
    expect(screen.getAllByText(/Bubble Shooter/i).length).toBeGreaterThan(0)

    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()

    fireEvent.click(startBtn)
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Start$/i })).not.toBeInTheDocument())
  })


  it('does not ask for confirmation before any shot has been fired', async () => {
    const setIsActive = vi.fn()
    render(<BubbleShooter locale="en" setIsActive={setIsActive} />)
    fireEvent.click(screen.getByRole('button', { name: /^Start$/i }))
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Start$/i })).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /new game/i }))
    expect(screen.queryByText(/start a new game\?/i)).not.toBeInTheDocument()
    expect(setIsActive).toHaveBeenLastCalledWith(false)
  })

  it('asks before discarding a running game (new game and difficulty change) and reports it as active', async () => {
    const setIsActive = vi.fn()
    render(<BubbleShooter locale="en" setIsActive={setIsActive} />)
    fireEvent.click(screen.getByRole('button', { name: /^Start$/i }))
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Start$/i })).not.toBeInTheDocument())

    // Fire one shot and wait for it to land: the game now has progress worth protecting.
    const fire = screen.getByRole('button', { name: /^Fire$/i })
    fireEvent.click(fire)
    await waitFor(() => expect(fire).toBeEnabled(), { timeout: 5000 })
    await waitFor(() => expect(setIsActive).toHaveBeenLastCalledWith(true))

    fireEvent.click(screen.getByRole('button', { name: /new game/i }))
    expect(await screen.findByText(/start a new game\?/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    await waitFor(() => expect(screen.queryByText(/start a new game\?/i)).not.toBeInTheDocument())
    expect(setIsActive).toHaveBeenLastCalledWith(true)

    fireEvent.click(screen.getByRole('button', { name: /^easy$/i }))
    expect(await screen.findByText(/changing the difficulty/i)).toBeInTheDocument()

    // Confirming starts a fresh game, so it is no longer worth a warning.
    fireEvent.click(document.getElementById('bubble-shooter-confirm-btn') as HTMLElement)
    await waitFor(() => expect(setIsActive).toHaveBeenLastCalledWith(false))
  })
})
