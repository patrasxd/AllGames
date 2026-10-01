import { describe, it, expect } from 'vitest'
import { createPRNG, generateLevel as generateBoard } from '../logic/engine'
import { isSolvable } from '../logic/solver'
import { generateLevel } from '../logic/generator'

describe('Ball Sort generation is always solvable', () => {
  it('raw scramble construction holds across colors/capacities/empty-tube counts/seeds (search-verified)', () => {
    for (let numColors = 2; numColors <= 6; numColors++) {
      for (const capacity of [4, 5]) {
        for (const numEmptyTubes of [1, 2]) {
          for (let seed = 1; seed <= 4; seed++) {
            const rand = createPRNG(seed * 7919 + numColors * 131 + capacity * 17 + numEmptyTubes)
            const shuffleSteps = 40
            const { tubes } = generateBoard(numColors, capacity, numEmptyTubes, shuffleSteps, rand)
            expect(isSolvable(tubes, capacity)).toBe(true)
          }
        }
      }
    }
  })

  it('holds for harder boards near the top of the difficulty curve', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const rand = createPRNG(seed * 9973)
      const { tubes } = generateBoard(8, 6, 1, 220, rand)
      expect(isSolvable(tubes, 6)).toBe(true)
    }
  })

  it('every level actually served by generateLevel(), 1 through 100, is verified solvable', () => {
    for (let level = 1; level <= 100; level++) {
      const { config, tubes } = generateLevel(level)
      expect(isSolvable(tubes, config.capacity)).toBe(true)
    }
  }, 30000)

  it('is deterministic: the same level number always produces the same board', () => {
    for (const level of [1, 15, 16, 36, 50, 100, 185, 200]) {
      const a = generateLevel(level)
      const b = generateLevel(level)
      expect(a.tubes).toEqual(b.tubes)
      expect(a.config).toEqual(b.config)
    }
  })

  it('never loses or duplicates balls: every color has exactly `capacity` balls in play', () => {
    for (const level of [1, 10, 20, 40, 60, 100, 150, 200]) {
      const { config, tubes } = generateLevel(level)
      const counts: Record<string, number> = {}
      for (const tube of tubes) for (const color of tube) counts[color] = (counts[color] ?? 0) + 1
      expect(Object.keys(counts).length).toBe(config.numColors)
      for (const count of Object.values(counts)) expect(count).toBe(config.capacity)
    }
  })

  it('difficulty ramps up with level: more colors, and empty tubes decrease for master levels', () => {
    expect(generateLevel(1).config.numColors).toBe(3)
    expect(generateLevel(30).config.numColors).toBe(4)
    expect(generateLevel(60).config.numColors).toBe(5)
    expect(generateLevel(100).config.numColors).toBe(6)
    expect(generateLevel(140).config.numColors).toBe(7)
    expect(generateLevel(170).config.numColors).toBe(8)
    expect(generateLevel(1).config.numEmptyTubes).toBe(2)
    expect(generateLevel(190).config.numEmptyTubes).toBe(1)
  })
})
