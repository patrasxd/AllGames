import { describe, it, expect } from 'vitest'
import { getLevelConfig, MAX_LEVEL } from '../logic/levels'
import { getOccupiedGrid } from '../logic/engine'
import { isSolvable } from '../logic/solver'

describe('Block Out 100 levels simulation & verification', () => {
  it('all 100 levels have valid placements with zero block overlaps', () => {
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

  it('every level served, 1 through 100, is verified solvable by the BFS solver', () => {
    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
      const cfg = getLevelConfig(lvl)
      const solvable = isSolvable(cfg.blocks, 15000)
      expect(solvable, `Level ${lvl} must be solvable`).toBe(true)
    }
  })
})
