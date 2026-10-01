import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { CrystalMatch } from '../CrystalMatch'

describe('CrystalMatch Component Integration', () => {
  it('resumes the last selected unlocked level', () => {
    const key = 'allgames:crystal-match:progress'
    const previous = localStorage.getItem(key)
    localStorage.setItem(
      key,
      JSON.stringify({
        unlockedLevel: 5,
        currentLevel: 3,
        levelStars: {},
        levelHighScores: {},
        totalScore: 0,
        campaignSeed: 123,
      }),
    )

    render(<CrystalMatch locale="en" />)

    expect(screen.getByText(/Level 3/i)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(key)!).currentLevel).toBe(3)
    localStorage.removeItem(key)
    if (previous !== null) localStorage.setItem(key, previous)
  })

  it('persists the campaign seed so future levels stay stable across visits', () => {
    const key = 'allgames:crystal-match:progress'
    const previous = localStorage.getItem(key)
    localStorage.removeItem(key)

    const firstRender = render(<CrystalMatch locale="en" />)
    const firstSeed = JSON.parse(localStorage.getItem(key) || '{}').campaignSeed
    firstRender.unmount()

    render(<CrystalMatch locale="en" />)
    const secondSeed = JSON.parse(localStorage.getItem(key) || '{}').campaignSeed

    expect(Number.isInteger(firstSeed)).toBe(true)
    expect(secondSeed).toBe(firstSeed)
    localStorage.removeItem(key)
    if (previous !== null) localStorage.setItem(key, previous)
  })

  it('renders BoardLayout with goals, grid, ControlsBar, and handles Dialog modals', async () => {
    render(<CrystalMatch locale="en" />)

    // Initially, the Level Intro Dialog should be open
    expect(screen.getByText(/Level 1/i)).toBeInTheDocument()
    const startLevelBtn = screen.getByRole('button', { name: /Play Level/i })
    expect(startLevelBtn).toBeInTheDocument()

    // Dismiss Level Intro Dialog
    fireEvent.click(startLevelBtn)

    // Should render Restart button with icon
    const restartBtn = screen.getByRole('button', { name: /Restart/i })
    expect(restartBtn).toBeInTheDocument()

    // Should render How to Play button
    const howToPlayBtn = document.getElementById('cm-how-to-play-btn') as HTMLElement
    expect(howToPlayBtn).toBeInTheDocument()

    // Goals bar should be rendered in HUD
    const goalsBar = document.querySelector('.cm-goals-bar')
    expect(goalsBar).toBeInTheDocument()

    // Crystal board grid should be rendered
    const board = document.querySelector('.cm-board-grid')
    expect(board).toBeInTheDocument()

    // ControlsBar should be rendered with all buttons
    const controlsBar = document.querySelector('.cm-controls-bar')
    expect(controlsBar).toBeInTheDocument()

    // Open How to Play modal
    fireEvent.click(howToPlayBtn)
    expect(screen.getByText(/How to Play Crystal Match/i)).toBeInTheDocument()

    // Close How to Play modal via OK button
    const okBtn = screen.getByRole('button', { name: /OK/i })
    expect(okBtn).toBeInTheDocument()
    fireEvent.click(okBtn)

    // Open Level Select modal
    const levelsBtn = screen.getByRole('button', { name: /Levels/i })
    fireEvent.click(levelsBtn)

    // Level select modal should show level cards
    const levelCards = document.querySelectorAll('.cm-level-card')
    expect(levelCards.length).toBeGreaterThan(0)
    expect(screen.getByText('1')).toBeInTheDocument()

    // Close Level Select modal
    const closeDialogBtn = screen.getByRole('button', { name: /Close dialog/i })
    fireEvent.click(closeDialogBtn)
    expect(screen.queryByText(/Select Level/i)).not.toBeInTheDocument()
  })

  it('renders in Polish locale with appropriate labels', () => {
    render(<CrystalMatch locale="pl" />)

    // Level Intro Dialog in Polish
    expect(screen.getByText(/Poziom 1/i)).toBeInTheDocument()
    const startBtn = screen.getByRole('button', { name: /Graj/i })
    fireEvent.click(startBtn)

    expect(document.getElementById('cm-how-to-play-btn')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Poziomy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Restart/i })).toBeInTheDocument()
  })
})
