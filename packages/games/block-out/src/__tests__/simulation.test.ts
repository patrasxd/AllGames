import { describe, it, expect } from 'vitest'
import { getLevelConfig, MAX_LEVEL } from '../logic/levels'
import { getOccupiedGrid } from '../logic/engine'
import { isSolvable, solveBFS } from '../logic/solver'

describe('Block Out 200 levels simulation & verification', () => {
  it('all 200 levels have valid placements with zero block overlaps', () => {
    expect(MAX_LEVEL).toBe(200)

    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
      const cfg = getLevelConfig(lvl)
      expect(cfg.level).toBe(lvl)
      expect(cfg.blocks.length).toBeGreaterThanOrEqual(4)

      const target = cfg.blocks.find((b) => b.isTarget)
      expect(target).toBeDefined()
      expect(target?.row).toBe(2)
      expect(target?.orientation).toBe('h')
      expect(target?.length).toBe(2)

      const grid = getOccupiedGrid(cfg.blocks)
      expect(grid).not.toBeNull()
    }
  })

  it('every level served, 1 through 200, is verified solvable by the BFS solver', () => {
    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
      const cfg = getLevelConfig(lvl)
      const solvable = isSolvable(cfg.blocks, 15000)
      expect(solvable, `Level ${lvl} must be solvable`).toBe(true)
    }
  }, 30000)

  it('procedurally generates solvable levels for 201+', () => {
    const cfg201 = getLevelConfig(201)
    expect(cfg201.level).toBe(201)
    expect(getOccupiedGrid(cfg201.blocks)).not.toBeNull()
    const res201 = solveBFS(cfg201.blocks, 15000)
    expect(res201).not.toBeNull()
    expect(res201!.minMoves).toBeGreaterThanOrEqual(8)
  })
})
