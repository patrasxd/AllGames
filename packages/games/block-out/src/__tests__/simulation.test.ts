import { describe, it, expect } from 'vitest'
import { getLevelConfig, MAX_LEVEL } from '../logic/levels'
import { LEVELS_DATA } from '../logic/levelsData'
import { getOccupiedGrid } from '../logic/engine'
import { solveBFS } from '../logic/solver'

/** Smallest optimal solution length each band of the campaign is allowed to contain. */
const BAND_FLOORS: Array<[number, number, number]> = [
  [1, 10, 3],
  [11, 40, 6],
  [41, 100, 8],
  [101, 150, 12],
  [151, 200, 16],
]

const average = (levels: number[]) => levels.reduce((sum, lvl) => sum + getLevelConfig(lvl).minMoves, 0) / levels.length
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

describe('Block Out 200 levels simulation & verification', () => {
  it('all 200 levels have valid placements with zero block overlaps', () => {
    expect(MAX_LEVEL).toBe(200)

    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
      const cfg = getLevelConfig(lvl)
      expect(cfg.level).toBe(lvl)
      expect(cfg.blocks.length).toBeGreaterThanOrEqual(7)

      const target = cfg.blocks.find((b) => b.isTarget)
      expect(target).toBeDefined()
      expect(target?.row).toBe(2)
      expect(target?.orientation).toBe('h')
      expect(target?.length).toBe(2)

      const grid = getOccupiedGrid(cfg.blocks)
      expect(grid).not.toBeNull()
    }
  })

  it('the stored minMoves is the exact optimum (BFS) for a spread of levels, so every one is solvable', () => {
    const sampled = [...range(1, 200).filter((lvl) => lvl % 8 === 0), 1, 3, 199, 200, 201, 250, 300]
    for (const lvl of sampled) {
      const cfg = getLevelConfig(lvl)
      const result = solveBFS(cfg.blocks, 120000)
      expect(result, `Level ${lvl} must be solvable`).not.toBeNull()
      expect(result!.minMoves, `Level ${lvl} minMoves`).toBe(cfg.minMoves)
    }
  }, 120000)

  it('difficulty follows the curve: no band contains a level easier than its floor', () => {
    for (const [from, to, floor] of BAND_FLOORS) {
      for (let lvl = from; lvl <= to; lvl++) {
        expect(getLevelConfig(lvl).minMoves, `Level ${lvl}`).toBeGreaterThanOrEqual(floor)
      }
    }
  })

  it('regression: from level 40 on there are no boards that fall in a handful of moves', () => {
    for (let lvl = 40; lvl <= 200; lvl++) {
      expect(getLevelConfig(lvl).minMoves, `Level ${lvl}`).toBeGreaterThanOrEqual(7)
    }
  })

  it('gets harder over the campaign (band averages strictly increase)', () => {
    const averages = BAND_FLOORS.map(([from, to]) => average(range(from, to)))
    for (let i = 1; i < averages.length; i++) expect(averages[i]).toBeGreaterThan(averages[i - 1])
    expect(averages[averages.length - 1]).toBeGreaterThanOrEqual(18)
  })

  it('levels 201+ cycle through a pool at least as hard as the end of the campaign', () => {
    const poolSize = LEVELS_DATA.length - MAX_LEVEL
    expect(poolSize).toBeGreaterThanOrEqual(100)
    const lastCampaignAverage = average(range(181, 200))

    const cfg201 = getLevelConfig(201)
    expect(cfg201.level).toBe(201)
    expect(getOccupiedGrid(cfg201.blocks)).not.toBeNull()
    for (const lvl of range(201, 200 + poolSize)) {
      expect(getLevelConfig(lvl).minMoves, `Level ${lvl}`).toBeGreaterThanOrEqual(20)
    }
    expect(average(range(201, 200 + poolSize))).toBeGreaterThan(lastCampaignAverage)

    // Past the pool it wraps around but keeps the requested level number.
    const wrapped = getLevelConfig(201 + poolSize)
    expect(wrapped.level).toBe(201 + poolSize)
    expect(wrapped.blocks).toEqual(cfg201.blocks)
  })
})
