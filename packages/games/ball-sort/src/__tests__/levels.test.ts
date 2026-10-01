import { describe, it, expect } from 'vitest'
import { LEVELS_DATA } from '../logic/levelsData'
import { generateLevel } from '../logic/generator'
import { findSolution } from '../logic/solver'
import { isSolved } from '../logic/engine'

describe('Ball Sort 200 Levels & Procedural Engine', () => {
  it('has 200 precomputed levels with valid configurations', () => {
    expect(LEVELS_DATA).toHaveLength(200)

    for (let i = 0; i < LEVELS_DATA.length; i++) {
      const lvl = LEVELS_DATA[i]
      expect(lvl.config.level).toBe(i + 1)
      expect(lvl.config.capacity).toBe(4)

      const emptyCount = lvl.tubes.filter((t) => t.length === 0).length
      expect(emptyCount).toBe(lvl.config.numEmptyTubes)

      // All non-empty tubes must be full
      for (const tube of lvl.tubes) {
        if (tube.length > 0) {
          expect(tube.length).toBe(lvl.config.capacity)
          // No tube is already 100% solved at the start
          expect(new Set(tube).size).toBeGreaterThan(1)
        }
      }

      // Starts unsolved
      expect(isSolved(lvl.tubes)).toBe(false)
    }
  })

  it('guarantees early and mid levels have 2 empty tubes and master levels have 1', () => {
    // Levels 1-185 have 2 empty tubes
    for (let i = 1; i <= 185; i++) {
      const lvl = generateLevel(i)
      expect(lvl.config.numEmptyTubes).toBe(2)
      expect(lvl.tubes.filter((t) => t.length === 0)).toHaveLength(2)
    }

    // Levels 186-200 have 1 empty tube
    for (let i = 186; i <= 200; i++) {
      const lvl = generateLevel(i)
      expect(lvl.config.numEmptyTubes).toBe(1)
      expect(lvl.tubes.filter((t) => t.length === 0)).toHaveLength(1)
    }
  })

  it('verifies solutions for key levels across the campaign (including 1, 50, 68, 100, 185, 200)', () => {
    const testLevels = [1, 15, 30, 50, 68, 80, 100, 150, 185, 190, 200]
    for (const lvlNum of testLevels) {
      const lvl = generateLevel(lvlNum)
      const sol = findSolution(lvl.tubes, lvl.config.capacity, { maxNodes: 45000 })
      expect(sol).not.toBeNull()
      expect(sol!.length).toBeGreaterThan(0)
    }
  })

  it('procedurally generates solvable levels for 201+', () => {
    const lvl201 = generateLevel(201)
    expect(lvl201.config.level).toBe(201)
    expect(lvl201.config.numColors).toBe(8)
    expect(lvl201.config.numEmptyTubes).toBe(2)
    const sol201 = findSolution(lvl201.tubes, lvl201.config.capacity, { maxNodes: 45000 })
    expect(sol201).not.toBeNull()

    const lvl205 = generateLevel(205) // Boss level with 1 empty tube
    expect(lvl205.config.level).toBe(205)
    expect(lvl205.config.numEmptyTubes).toBe(1)
    const sol205 = findSolution(lvl205.tubes, lvl205.config.capacity, { maxNodes: 45000 })
    expect(sol205).not.toBeNull()
  })
})
