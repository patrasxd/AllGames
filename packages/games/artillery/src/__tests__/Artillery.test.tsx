import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { Artillery } from '../Artillery'

describe('Artillery Component Integration', () => {
  it('renders mode selection options on startup', () => {
    render(<Artillery locale="en" />)

    expect(screen.getByText('Choose game mode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /computer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Two players/i })).toBeInTheDocument()
  })

  it('enters 2 Players mode and renders BoardLayout, canvas, on-game HUD, and controls', async () => {
    const setIsActive = vi.fn()
    const setHeader = vi.fn()

    render(<Artillery locale="en" setIsActive={setIsActive} setHeader={setHeader} />)

    // Select 2 Players mode
    const twoPlayersBtn = screen.getByRole('button', { name: /Two players/i })
    fireEvent.click(twoPlayersBtn)

    // Verify game canvas and layout
    await waitFor(() => {
      expect(document.querySelector('.all-fullbleed-layout')).toBeInTheDocument()
      expect(document.querySelector('canvas')).toBeInTheDocument()
    })

    // On-game HUD inside canvas frame: Turn indicator and wind
    expect(screen.getByText(/Your turn/i)).toBeInTheDocument()
    expect(screen.getByText(/Wind/i)).toBeInTheDocument()

    // Controls: Angle display and buttons, Circular Fire button
    expect(screen.getByText('45°')).toBeInTheDocument()
    expect(document.getElementById('artillery-angle-dec-btn')).toBeInTheDocument()
    expect(document.getElementById('artillery-angle-inc-btn')).toBeInTheDocument()
    expect(document.getElementById('artillery-fire-btn')).toBeInTheDocument()

    // Bottom Bar (in same row)
    expect(screen.getByRole('button', { name: /New game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Change mode/i })).toBeInTheDocument()

    // Shell isActive contract check
    expect(setIsActive).toHaveBeenCalledWith(true)
    expect(setHeader).toHaveBeenCalled()
  })

  it('allows adjusting angle with [-] and [+] buttons and holding to fire', async () => {
    render(<Artillery locale="en" />)

    // Enter 2P mode
    fireEvent.click(screen.getByRole('button', { name: /Two players/i }))
    await waitFor(() => expect(document.getElementById('artillery-fire-btn')).toBeInTheDocument())

    // Adjust Angle using [+]
    const incBtn = document.getElementById('artillery-angle-inc-btn') as HTMLButtonElement
    fireEvent.pointerDown(incBtn)
    fireEvent.pointerUp(incBtn)
    expect(screen.getByText('46°')).toBeInTheDocument()

    // Adjust Angle using [-]
    const decBtn = document.getElementById('artillery-angle-dec-btn') as HTMLButtonElement
    fireEvent.pointerDown(decBtn)
    fireEvent.pointerUp(decBtn)
    expect(screen.getByText('45°')).toBeInTheDocument()

    // Trigger Fire with circular fire button
    const fireBtn = document.getElementById('artillery-fire-btn') as HTMLButtonElement
    fireEvent.pointerDown(fireBtn)
    fireEvent.pointerUp(fireBtn)

    // Projectile should be launched and button disabled
    await waitFor(() => {
      expect(fireBtn).toBeDisabled()
    })
  })

  it('prompts ConfirmDialog when clicking Change mode during active battle', async () => {
    render(<Artillery locale="en" />)

    fireEvent.click(screen.getByRole('button', { name: /Two players/i }))
    await waitFor(() => expect(document.getElementById('artillery-fire-btn')).toBeInTheDocument())

    // Click Change mode
    const changeModeBtn = document.getElementById('artillery-change-mode-btn') as HTMLButtonElement
    fireEvent.click(changeModeBtn)

    // Confirm dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Leave Active Battle?')).toBeInTheDocument()
    })

    // Cancel leaves game running
    const cancelBtn = document.getElementById('artillery-cancel-reset-btn') as HTMLButtonElement
    fireEvent.click(cancelBtn)
    expect(document.getElementById('artillery-fire-btn')).toBeInTheDocument()
  })

  it('renders in Polish locale with appropriate translations', async () => {
    render(<Artillery locale="pl" />)

    expect(screen.getByText('Wybierz tryb gry')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dwóch graczy/i })).toBeInTheDocument()

    // Start 2P game
    fireEvent.click(screen.getByRole('button', { name: /dwóch graczy/i }))
    await waitFor(() => {
      expect(document.getElementById('artillery-fire-btn')).toBeInTheDocument()
    })

    expect(screen.getByText(/Twoja tura/i)).toBeInTheDocument()
    expect(screen.getByText(/Wiatr/i)).toBeInTheDocument()
    expect(screen.getByText('45°')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nowa gra/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Zmień tryb/i })).toBeInTheDocument()
  })

  it('supports checking enemy position with scout button', async () => {
    render(<Artillery locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /Two players/i }))
    await waitFor(() => expect(document.getElementById('artillery-scout-btn')).toBeInTheDocument())

    const scoutBtn = document.getElementById('artillery-scout-btn') as HTMLButtonElement
    expect(scoutBtn).toBeInTheDocument()
    expect(scoutBtn).not.toBeDisabled()

    // Clicking triggers scouting mode
    fireEvent.click(scoutBtn)
    expect(scoutBtn.classList.contains('artillery-scout-btn--active')).toBe(true)
  })

  it('renders correctly with light theme and e-ink theme dock classes', async () => {
    // 1. Light theme
    const { rerender } = render(<Artillery locale="en" theme="light" />)
    fireEvent.click(screen.getByRole('button', { name: /Two players/i }))
    await waitFor(() => expect(document.querySelector('.artillery-canvas-bottom-dock--light')).toBeInTheDocument())

    // 2. E-Ink Light
    rerender(<Artillery locale="en" isEink={true} theme="light" />)
    expect(document.querySelector('.artillery-canvas-bottom-dock--eink-light')).toBeInTheDocument()

    // 3. E-Ink Dark
    rerender(<Artillery locale="en" isEink={true} theme="dark" />)
    expect(document.querySelector('.artillery-canvas-bottom-dock--eink-dark')).toBeInTheDocument()
  })
})

