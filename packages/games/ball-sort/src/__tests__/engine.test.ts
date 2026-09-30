import { describe, it, expect } from 'vitest'
import { canPour, createPRNG, isSolved, isTubeSolved, pour, topRun } from '../logic/engine'
import type { Tube } from '../types'

describe('Ball Sort pour rules', () => {
  it('allows pouring onto an empty tube', () => {
    const tubes: Tube[] = [['red', 'red'], []]
    expect(canPour(tubes, 0, 1, 4)).toBe(true)
  })

  it('allows pouring onto a tube topped with the same color', () => {
    const tubes: Tube[] = [
      ['blue', 'red'],
      ['green', 'red'],
    ]
    expect(canPour(tubes, 0, 1, 4)).toBe(true)
  })

  it('blocks pouring onto a tube topped with a different color', () => {
    const tubes: Tube[] = [['red', 'red'], ['blue']]
    expect(canPour(tubes, 0, 1, 4)).toBe(false)
  })

  it('blocks pouring from an empty tube', () => {
    const tubes: Tube[] = [[], ['red']]
    expect(canPour(tubes, 0, 1, 4)).toBe(false)
  })

  it('blocks pouring into a full tube', () => {
    const tubes: Tube[] = [['red'], ['blue', 'blue', 'blue', 'blue']]
    expect(canPour(tubes, 0, 1, 4)).toBe(false)
  })

  it('blocks pouring a tube onto itself', () => {
    const tubes: Tube[] = [['red', 'red']]
    expect(canPour(tubes, 0, 0, 4)).toBe(false)
  })

  it('moves the whole top run when there is room for all of it', () => {
    const tubes: Tube[] = [['blue', 'red', 'red'], []]
    const result = pour(tubes, 0, 1, 4)
    expect(result?.move).toEqual({ from: 0, to: 1, count: 2, color: 'red' })
    expect(result?.tubes[0]).toEqual(['blue'])
    expect(result?.tubes[1]).toEqual(['red', 'red'])
  })

  it('caps the poured amount to the destination\u2019s remaining room', () => {
    const tubes: Tube[] = [
      ['red', 'red', 'red'],
      ['blue', 'red'],
    ]
    const result = pour(tubes, 0, 1, 4)
    // Destination has room for 2 more; source offers a run of 3 reds — only 2 should move.
    expect(result?.move.count).toBe(2)
    expect(result?.tubes[0]).toEqual(['red'])
    expect(result?.tubes[1]).toEqual(['blue', 'red', 'red', 'red'])
  })

  it('does not mutate the input tubes array', () => {
    const tubes: Tube[] = [['red', 'red'], []]
    const before = JSON.stringify(tubes)
    pour(tubes, 0, 1, 4)
    expect(JSON.stringify(tubes)).toBe(before)
  })

  it('returns null for an illegal pour instead of throwing', () => {
    const tubes: Tube[] = [['red'], ['blue']]
    expect(pour(tubes, 0, 1, 4)).toBeNull()
  })
})

describe('Ball Sort topRun', () => {
  it('reports the top run length and color', () => {
    expect(topRun(['blue', 'red', 'red', 'red'])).toEqual({ color: 'red', length: 3 })
  })

  it('returns null for an empty tube', () => {
    expect(topRun([])).toBeNull()
  })
})

describe('Ball Sort win detection', () => {
  it('treats an empty tube as solved', () => {
    expect(isTubeSolved([])).toBe(true)
  })

  it('treats a single-color tube as solved regardless of fill level', () => {
    expect(isTubeSolved(['red', 'red'])).toBe(true)
  })

  it('treats a mixed tube as unsolved', () => {
    expect(isTubeSolved(['red', 'blue'])).toBe(false)
  })

  it('is solved only when every color is fully gathered in its own tube', () => {
    expect(isSolved([['red', 'red'], ['blue', 'blue'], []])).toBe(true)
  })

  it('is not solved if a color is split across two tubes, even if each is internally uniform', () => {
    expect(isSolved([['red', 'red'], ['red', 'red'], []])).toBe(false)
  })

  it('is not solved while any tube is mixed', () => {
    expect(
      isSolved([
        ['red', 'blue'],
        ['red', 'blue'],
      ]),
    ).toBe(false)
  })
})

describe('Ball Sort seeded PRNG', () => {
  it('is deterministic for a given seed', () => {
    const a = createPRNG(12345)
    const b = createPRNG(12345)
    const seqA = Array.from({ length: 20 }, () => a())
    const seqB = Array.from({ length: 20 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces values in [0, 1)', () => {
    const rand = createPRNG(42)
    for (let i = 0; i < 500; i++) {
      const v = rand()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('differs between seeds', () => {
    const a = createPRNG(1)
    const b = createPRNG(2)
    expect(a()).not.toBe(b())
  })
})
