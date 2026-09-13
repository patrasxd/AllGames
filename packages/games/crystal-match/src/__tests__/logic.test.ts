import { describe, it, expect } from 'vitest'
import { generateLevel } from '../logic/generator'
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

  it('detects horizontal 3-in-a-row matches', () => {
    // 3x3 board with row 0 containing ruby-ruby-ruby
    const board: Tile[][] = [
      [
        { id: '1', gem: 'ruby', special: null, obstacle: null },
        { id: '2', gem: 'ruby', special: null, obstacle: null },
        { id: '3', gem: 'ruby', special: null, obstacle: null },
      ],
      [
        { id: '4', gem: 'emerald', special: null, obstacle: null },
        { id: '5', gem: 'sapphire', special: null, obstacle: null },
        { id: '6', gem: 'emerald', special: null, obstacle: null },
      ],
      [
        { id: '7', gem: 'sapphire', special: null, obstacle: null },
        { id: '8', gem: 'emerald', special: null, obstacle: null },
        { id: '9', gem: 'sapphire', special: null, obstacle: null },
      ],
    ]

    const result = findMatches(board)
    expect(result.matchedCoords.length).toBe(3)
    expect(result.totalGemsCleared).toBe(3)
    expect(result.gemsClearedByType.ruby).toBe(3)
  })
})
