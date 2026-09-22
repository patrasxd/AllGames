import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SeaBattle } from '../SeaBattle'

describe('SeaBattle component integration', () => {
  it('renders mode selection and transitions to placement then battle', async () => {
    render(<SeaBattle locale="en" />)

    // Initially shows mode select options
    const vsComputerBtn = document.getElementById('mode-opt-ai')
    expect(vsComputerBtn).toBeInTheDocument()

    // Select VS Computer
    fireEvent.click(vsComputerBtn!)

    // Placement phase should be active
    await waitFor(() => {
      expect(screen.getByText(/Deploy your fleet/i)).toBeInTheDocument()
    })

    // Auto deploy ships
    const autoDeployBtn = document.getElementById('bs-auto-btn')
    expect(autoDeployBtn).toBeInTheDocument()
    fireEvent.click(autoDeployBtn!)

    // Start battle
    const startBattleBtn = document.getElementById('bs-start-btn')
    expect(startBattleBtn).toBeInTheDocument()
    expect(startBattleBtn).not.toBeDisabled()
    fireEvent.click(startBattleBtn!)

    // Now in battle phase: @all/ui controls should be rendered
    await waitFor(() => {
      const newGameBtn = document.getElementById('bs-new-game-btn')
      expect(newGameBtn).toBeInTheDocument()
    })

    // Check that BoardLayout rendered fluid layout
    const boardLayout = document.querySelector('.all-board-layout--fluid')
    expect(boardLayout).toBeInTheDocument()
  })

  it('notifies shell with setIsActive(true) as soon as battle is active', async () => {
    const setIsActive = vi.fn()
    render(<SeaBattle locale="en" setIsActive={setIsActive} />)

    fireEvent.click(document.getElementById('mode-opt-ai')!)

    await waitFor(() => {
      expect(document.getElementById('bs-auto-btn')).toBeInTheDocument()
    })

    fireEvent.click(document.getElementById('bs-auto-btn')!)
    fireEvent.click(document.getElementById('bs-start-btn')!)

    await waitFor(() => {
      expect(setIsActive).toHaveBeenCalledWith(true)
    })
  })

  it('allows firing on enemy grid and updating battle stats', async () => {
    render(<SeaBattle locale="en" />)

    // Select VS Computer
    fireEvent.click(document.getElementById('mode-opt-ai')!)

    await waitFor(() => {
      expect(document.getElementById('bs-auto-btn')).toBeInTheDocument()
    })

    // Deploy & Start
    fireEvent.click(document.getElementById('bs-auto-btn')!)
    fireEvent.click(document.getElementById('bs-start-btn')!)

    await waitFor(() => {
      expect(document.getElementById('bs-new-game-btn')).toBeInTheDocument()
    })

    // Interactive enemy cells should exist
    const interactiveCells = document.querySelectorAll('.bs-cell--interactive')
    expect(interactiveCells.length).toBeGreaterThan(0)

    // Click an interactive cell to fire
    fireEvent.click(interactiveCells[0])

    // Cell should now have hit or miss marker
    await waitFor(() => {
      const marker = interactiveCells[0].querySelector('.bs-marker')
      expect(marker).toBeInTheDocument()
    })
  })

  it('shows confirmation dialog when starting new game during active battle', async () => {
    render(<SeaBattle locale="en" />)

    fireEvent.click(document.getElementById('mode-opt-ai')!)

    await waitFor(() => {
      expect(document.getElementById('bs-auto-btn')).toBeInTheDocument()
    })

    fireEvent.click(document.getElementById('bs-auto-btn')!)
    fireEvent.click(document.getElementById('bs-start-btn')!)

    await waitFor(() => {
      expect(document.getElementById('bs-new-game-btn')).toBeInTheDocument()
    })

    // Fire one shot to make battle active
    const interactiveCells = document.querySelectorAll('.bs-cell--interactive')
    fireEvent.click(interactiveCells[0])

    await waitFor(() => {
      expect(interactiveCells[0].querySelector('.bs-marker')).toBeInTheDocument()
    })

    // Click new game button
    fireEvent.click(document.getElementById('bs-new-game-btn')!)

    // Confirm dialog should appear
    await waitFor(() => {
      expect(document.getElementById('bs-modal-confirm')).toBeInTheDocument()
      expect(document.getElementById('bs-modal-cancel')).toBeInTheDocument()
    })

    // Cancel dismissal
    fireEvent.click(document.getElementById('bs-modal-cancel')!)

    await waitFor(() => {
      expect(document.getElementById('bs-modal-confirm')).not.toBeInTheDocument()
    })
  })

  it('supports 2-player duel mode', async () => {
    render(<SeaBattle locale="en" />)

    const twoPlayersBtn = document.getElementById('mode-opt-2p')
    expect(twoPlayersBtn).toBeInTheDocument()
    fireEvent.click(twoPlayersBtn!)

    await waitFor(() => {
      expect(screen.getByText(/Deploy your fleet/i)).toBeInTheDocument()
    })

    // Auto deploy Player 1 ships
    fireEvent.click(document.getElementById('bs-auto-btn')!)
    fireEvent.click(document.getElementById('bs-start-btn')!)

    // Handoff to Player 2
    await waitFor(() => {
      expect(screen.getByText(/Pass device to/i)).toBeInTheDocument()
    })
  })

  it('renders cleanly with isEink={true}', () => {
    const { container } = render(<SeaBattle isEink={true} locale="en" />)
    expect(container.querySelector('.bs-root')).toBeInTheDocument()
  })
})
