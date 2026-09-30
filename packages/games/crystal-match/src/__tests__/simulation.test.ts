import { describe, it, expect } from 'vitest'
import { createPRNG, generateLevel } from '../logic/generator'
import { simulateLevel as simulateConfig } from '../logic/solver'

/** Uses the production simulator with varied deterministic refill streams for calibration. */
export function simulateLevel(lvl: number, run = 0) {
  const config = generateLevel(lvl)
  return simulateConfig(config, createPRNG(lvl * 1000 + run + 1))
}

describe('Crystal Match level calibration (bot plays with the real engine)', () => {
  it('early levels are winnable and 2-3 stars are reachable', () => {
    let wins = 0
    let multiStar = 0
    let total = 0
    for (let lvl = 1; lvl <= 5; lvl++) {
      for (let run = 0; run < 10; run++) {
        const r = simulateLevel(lvl, run)
        total++
        if (r.won) wins++
        if (r.stars >= 2) multiStar++
      }
    }
    console.log(`levels 1-5: won ${wins}/${total}, 2+ stars ${multiStar}/${total}`)
    expect(wins).toBeGreaterThan(total * 0.5)
    expect(multiStar).toBeGreaterThan(5)
  })

  it('later levels stay winnable (no impossible goals)', () => {
    // A greedy bot is a much weaker player than a person, so "at least a few wins" is a
    // floor for fairness, not a difficulty target.
    for (const lvl of [10, 20, 30, 45, 60]) {
      let wins = 0
      for (let run = 0; run < 12; run++) if (simulateLevel(lvl, run).won) wins++
      console.log(`level ${lvl}: bot won ${wins}/12`)
      expect(wins).toBeGreaterThan(0)
    }
  })
})
