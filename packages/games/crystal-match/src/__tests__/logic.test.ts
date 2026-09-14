import { describe, it, expect } from 'vitest'
import { generateLevel, createInitialBoard, hasPossibleMoves, findFirstValidMove } from '../logic/generator'
import { findMatches } from '../logic/engine'
import type { Tile } from '../types'

describe('Crystal Match logic', () => {
  it('generates level 1 with valid 8x8 config and goals', () => {
    const config = generateLevel(1)
    expect(config.rows).toBe(8)
    expect(config.cols).toBe(8)
    expect(config.maxMoves).toBeGreaterThan(15)
    expect(config.goals.length).toBeGreaterThan(0)
  })

  it('creates an initial board with no immediate matches and at least one possible move', () => {
    const config = generateLevel(1)
    const board = createInitialBoard(config)
    expect(board.length).toBe(8)
    expect(board[0].length).toBe(8)

    // Initial board must have zero pre-existing matches
    const matches = findMatches(board)
    expect(matches.matchedCoords.length).toBe(0)

    // Initial board must have valid moves available for the player
    expect(hasPossibleMoves(board)).toBe(true)
    const firstMove = findFirstValidMove(board)
    expect(firstMove).not.toBeNull()
  })

  it('detects horizontal 3-in-a-row matches', () => {
    // 3x3 board with row 0 containing ruby-ruby-ruby
    const board: Tile[][] = [
      [
        { id: '1', gem: 'ruby', special: 'none', obstacle: 'none' },
        { id: '2', gem: 'ruby', special: 'none', obstacle: 'none' },
        { id: '3', gem: 'ruby', special: 'none', obstacle: 'none' },
      ],
      [
        { id: '4', gem: 'emerald', special: 'none', obstacle: 'none' },
        { id: '5', gem: 'sapphire', special: 'none', obstacle: 'none' },
        { id: '6', gem: 'emerald', special: 'none', obstacle: 'none' },
      ],
      [
        { id: '7', gem: 'sapphire', special: 'none', obstacle: 'none' },
        { id: '8', gem: 'emerald', special: 'none', obstacle: 'none' },
        { id: '9', gem: 'sapphire', special: 'none', obstacle: 'none' },
      ],
    ]

    const result = findMatches(board)
    expect(result.matchedCoords.length).toBe(3)
    expect(result.totalGemsCleared).toBe(3)
    expect(result.gemsClearedByType.ruby).toBe(3)
  })

  it('detects vertical 3-in-a-row matches', () => {
    const board: Tile[][] = [
      [
        { id: '1', gem: 'topaz', special: 'none', obstacle: 'none' },
        { id: '2', gem: 'emerald', special: 'none', obstacle: 'none' },
        { id: '3', gem: 'ruby', special: 'none', obstacle: 'none' },
      ],
      [
        { id: '4', gem: 'topaz', special: 'none', obstacle: 'none' },
        { id: '5', gem: 'sapphire', special: 'none', obstacle: 'none' },
        { id: '6', gem: 'emerald', special: 'none', obstacle: 'none' },
      ],
      [
        { id: '7', gem: 'topaz', special: 'none', obstacle: 'none' },
        { id: '8', gem: 'amethyst', special: 'none', obstacle: 'none' },
        { id: '9', gem: 'ruby', special: 'none', obstacle: 'none' },
      ],
    ]

    const result = findMatches(board)
    expect(result.matchedCoords.length).toBe(3)
    expect(result.gemsClearedByType.topaz).toBe(3)
  })
})
