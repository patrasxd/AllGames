import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { generateLevel, createInitialBoard } from '../logic/generator'

// The dialogs are pure UI over the hook's state, so the hook is replaced with a fixed state
// and each test just picks the situation it wants to look at.
const state = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))

vi.mock('../hooks/useCrystalMatch', () => ({
  useCrystalMatch: () => state.current,
}))

import { CrystalMatch } from '../CrystalMatch'

function hookState(level: number, overrides: Record<string, unknown> = {}) {
  const config = generateLevel(level)
  return {
    level,
    config,
    board: createInitialBoard(config),
    movesLeft: config.maxMoves,
    score: 0,
    goals: config.goals.map(g => ({ ...g, current: 0 })),
    gameStatus: 'playing',
    bursts: [],
    comboPopups: [],
    progress: { unlockedLevel: level, levelStars: {}, levelHighScores: {}, totalScore: 0 },
    isLevelModalOpen: false,
    setIsLevelModalOpen: vi.fn(),
    isLevelIntroOpen: false,
    setIsLevelIntroOpen: vi.fn(),
    isHowToPlayOpen: false,
    setIsHowToPlayOpen: vi.fn(),
    hintCoords: null,
    handleSwap: vi.fn(),
    nextLevel: vi.fn(),
    restartLevel: vi.fn(),
    selectLevel: vi.fn(),
    resetAllProgress: vi.fn(),
    ...overrides,
  }
}

describe('level intro dialog', () => {
  beforeEach(() => {
    state.current = hookState(2, { isLevelIntroOpen: true })
  })

  it('shows the move limit once, not on every goal', () => {
    render(<CrystalMatch locale="en" />)
    const goalCount = (state.current.goals as unknown[]).length
    expect(goalCount).toBeGreaterThan(1)
    expect(screen.getAllByTestId('cm-intro-moves')).toHaveLength(1)
    expect(document.querySelectorAll('.cm-intro-goal-card')).toHaveLength(goalCount + 1)
    // no goal row carries its own "22 moves" any more
    expect(screen.queryByText(/\d+\s+moves/i)).toBeNull()
  })

  it("shows the level's real move limit", () => {
    render(<CrystalMatch locale="en" />)
    const limit = (state.current.config as { maxMoves: number }).maxMoves
    expect(screen.getByTestId('cm-intro-moves').textContent).toContain(String(limit))
  })

  it('looks like the goal rows: same card, and it has an icon like they do', () => {
    render(<CrystalMatch locale="en" />)
    const moves = screen.getByTestId('cm-intro-moves')
    expect(moves.className).toBe('cm-intro-goal-card')
    expect(moves.querySelector('svg')).not.toBeNull()
    const goalCards = [...document.querySelectorAll('.cm-intro-goal-card')].filter(c => c !== moves)
    for (const card of goalCards) expect(card.querySelector('svg')).not.toBeNull()
  })
})

describe('victory dialog', () => {
  const won = (score: number) => {
    state.current = hookState(2, { gameStatus: 'won', score, movesLeft: 15 })
    return (state.current.config as { starThresholds: [number, number, number] }).starThresholds
  }

  it('has no "targets" box once all three stars are earned', () => {
    const [, , star3] = won(99999)
    render(<CrystalMatch locale="en" />)
    expect(screen.queryByText(/targets/i)).toBeNull()
    expect(screen.queryByText(/next ★/i)).toBeNull()
    expect(screen.queryByText(String(star3))).toBeNull()
    expect(screen.getByText('Moves left')).toBeInTheDocument()
  })

  it('with 1 star it shows the score that earns the 2nd star', () => {
    const [star1, star2] = won(0)
    void star1
    // score below star2 -> 1 star
    state.current = hookState(2, { gameStatus: 'won', score: star2 - 1 })
    render(<CrystalMatch locale="en" />)
    expect(screen.getByText(/Next ★/i)).toBeInTheDocument()
    expect(screen.getByText(String(star2))).toBeInTheDocument()
  })

  it('with 2 stars it shows the score that earns the 3rd star', () => {
    const [, star2, star3] = won(0)
    state.current = hookState(2, { gameStatus: 'won', score: star2 })
    render(<CrystalMatch locale="en" />)
    expect(screen.getByText(String(star3))).toBeInTheDocument()
  })

  it('is translated', () => {
    const [, star2] = won(0)
    state.current = hookState(2, { gameStatus: 'won', score: star2 - 1 })
    render(<CrystalMatch locale="pl" />)
    expect(screen.getByText(/Kolejna ★/i)).toBeInTheDocument()
    expect(screen.getByText('Pozostałe ruchy')).toBeInTheDocument()
  })
})
