import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Battleship } from '../Battleship'

describe('Battleship component integration', () => {
  it('renders mode selection and transitions to placement then battle', async () => {
    render(<Battleship locale="en" />)

    // Initially shows mode select options
    const vsComputerBtn = document.getElementById('mode-opt-ai')
    expect(vsComputerBtn).toBeInTheDocument()

    // Select VS Computer
    fireEvent.click(vsComputerBtn)

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

    // Check that BoardLayout rendered wide layout
    const boardLayout = document.querySelector('.all-board-layout--wide')
    expect(boardLayout).toBeInTheDocument()
  })
})
