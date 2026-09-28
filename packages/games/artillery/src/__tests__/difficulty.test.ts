import { describe, it, expect } from 'vitest'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TANK_SPAWN_INSET,
  WIND_LEVELS,
  createInitialTanks,
  generateTerrain,
  generateWind,
} from '../logic'
import type { DifficultyLevel } from '../types'

const LEVELS: DifficultyLevel[] = ['easy', 'medium', 'hard']

describe('Artillery difficulty: wind', () => {
  const sample = (difficulty: DifficultyLevel) =>
    Array.from({ length: 2000 }, () => generateWind(Math.random, difficulty))

  it('easy is always calm', () => {
    expect(new Set(sample('easy'))).toEqual(new Set([0]))
  })

  it('medium only rolls -1, 0 or +1, and uses all three', () => {
    expect(new Set(sample('medium'))).toEqual(new Set([-1, 0, 1]))
  })

  it('hard rolls the full -3..+3 range', () => {
    expect(new Set(sample('hard'))).toEqual(new Set([-3, -2, -1, 0, 1, 2, 3]))
  })

  it('defaults to the original full range', () => {
    expect(WIND_LEVELS.hard).toEqual([-3, -2, -1, 0, 1, 2, 3])
    const seen = new Set(Array.from({ length: 2000 }, () => generateWind()))
    expect(seen.size).toBe(7)
  })
})

describe('Artillery difficulty: tank distance', () => {
  const gap = (difficulty: DifficultyLevel, seed: number) => {
    const terrain = generateTerrain(CANVAS_WIDTH, CANVAS_HEIGHT, seed)
    const tanks = createInitialTanks(terrain, Math.random, difficulty)
    return tanks.p2.x - tanks.p1.x
  }

  it('spawns tanks inside the zone for the chosen difficulty, on their own side', () => {
    for (const difficulty of LEVELS) {
      const { min, max } = TANK_SPAWN_INSET[difficulty]
      for (let seed = 1; seed <= 40; seed++) {
        const terrain = generateTerrain(CANVAS_WIDTH, CANVAS_HEIGHT, seed)
        const tanks = createInitialTanks(terrain, Math.random, difficulty)
        expect(tanks.p1.x).toBeGreaterThanOrEqual(min)
        expect(tanks.p1.x).toBeLessThanOrEqual(max)
        expect(tanks.p2.x).toBeGreaterThanOrEqual(CANVAS_WIDTH - max)
        expect(tanks.p2.x).toBeLessThanOrEqual(CANVAS_WIDTH - min)
      }
    }
  })

  it('puts tanks progressively farther apart: easy < medium < hard', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const easy = gap('easy', seed)
      const medium = gap('medium', seed)
      const hard = gap('hard', seed)
      expect(easy).toBeLessThan(medium)
      expect(medium).toBeLessThan(hard)
    }
  })

  it('keeps hard identical to the original layout (100-280 px from each edge)', () => {
    expect(TANK_SPAWN_INSET.hard).toEqual({ min: 100, max: 280 })
    const terrain = generateTerrain(1000, 600, 42)
    const tanks = createInitialTanks(terrain)
    expect(tanks.p1.x).toBeLessThan(300)
    expect(tanks.p2.x).toBeGreaterThan(700)
  })
})
