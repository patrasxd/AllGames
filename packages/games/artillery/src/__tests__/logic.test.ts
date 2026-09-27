import { describe, it, expect } from 'vitest'
import {
  generateTerrain,
  carveCrater,
  createInitialTanks,
  moveTank,
  calculateBlastDamage,
  calculateAiShot,
  checkWinner,
  getMuzzlePosition,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../logic'

describe('Artillery pure logic', () => {
  it('generates valid terrain within canvas bounds with proper spawn plateaus', () => {
    const terrain = generateTerrain(CANVAS_WIDTH, CANVAS_HEIGHT, 42)
    expect(terrain.width).toBe(CANVAS_WIDTH)
    expect(terrain.height).toBe(CANVAS_HEIGHT)
    expect(terrain.heights.length).toBe(CANVAS_WIDTH)

    for (let x = 0; x < terrain.width; x++) {
      expect(terrain.heights[x]).toBeGreaterThanOrEqual(140)
      expect(terrain.heights[x]).toBeLessThanOrEqual(CANVAS_HEIGHT - 40)
    }

    // Check P1 and P2 spawn regions have smooth ground
    const p1HeightDiff = Math.abs(terrain.heights[150] - terrain.heights[170])
    expect(p1HeightDiff).toBeLessThan(35)
  })

  it('carves a circular crater into terrain upon explosion', () => {
    const terrain = generateTerrain(1000, 600, 42)
    const impactX = 500
    const originalGroundY = terrain.heights[impactX]
    const blastRadius = 35

    const updatedTerrain = carveCrater(terrain, impactX, originalGroundY, blastRadius)

    // Center crater ground level should be lower (higher Y coordinate)
    expect(updatedTerrain.heights[impactX]).toBeGreaterThan(originalGroundY)
    expect(updatedTerrain.heights[impactX]).toBeCloseTo(originalGroundY + blastRadius, 0)

    // Points far away from the blast should remain unaltered
    expect(updatedTerrain.heights[100]).toBe(terrain.heights[100])
    expect(updatedTerrain.heights[900]).toBe(terrain.heights[900])
  })

  it('safeguards crater depth from underground cy penetration', () => {
    const terrain = generateTerrain(1000, 600, 42)
    const impactX = 500
    const originalGroundY = terrain.heights[impactX]
    const blastRadius = 35
    // Pass underground cy 150px below surface
    const undergroundCy = originalGroundY + 150

    const updatedTerrain = carveCrater(terrain, impactX, undergroundCy, blastRadius)

    // Crater floor should be capped at surface + blastRadius, never undergroundCy + blastRadius
    expect(updatedTerrain.heights[impactX]).toBeCloseTo(originalGroundY + blastRadius, 0)
    expect(updatedTerrain.heights[impactX]).toBeLessThan(undergroundCy)
  })

  it('initializes tanks with full HP, fuel, and default ammo', () => {
    const terrain = generateTerrain(1000, 600, 42)
    const tanks = createInitialTanks(terrain)

    expect(tanks.p1.hp).toBe(100)
    expect(tanks.p1.fuel).toBe(60)
    expect(tanks.p1.x).toBeLessThan(300)
    expect(tanks.p1.ammo.standard).toBe(Infinity)
    expect(tanks.p1.ammo.mortar).toBeGreaterThan(0)

    expect(tanks.p2.hp).toBe(100)
    expect(tanks.p2.fuel).toBe(60)
    expect(tanks.p2.x).toBeGreaterThan(700)
  })

  it('moves tank along terrain and consumes fuel', () => {
    const terrain = generateTerrain(1000, 600, 42)
    const tanks = createInitialTanks(terrain)
    const initialFuel = tanks.p1.fuel
    const initialX = tanks.p1.x

    const movedTank = moveTank(tanks.p1, 1, terrain)
    expect(movedTank.x).toBeGreaterThan(initialX)
    expect(movedTank.fuel).toBeLessThan(initialFuel)
    expect(movedTank.y).toBe(terrain.heights[Math.round(movedTank.x)])
  })

  it('calculates direct and splash blast damage correctly', () => {
    const terrain = generateTerrain(1000, 600, 42)
    const tanks = createInitialTanks(terrain)

    // Direct hit
    const direct = calculateBlastDamage({ x: tanks.p2.x, y: tanks.p2.y - 8 }, 35, 50, tanks.p2)
    expect(direct.damage).toBe(50)
    expect(direct.isDirect).toBe(true)

    // Splash hit 25px away
    const splash = calculateBlastDamage({ x: tanks.p2.x + 25, y: tanks.p2.y - 8 }, 35, 50, tanks.p2)
    expect(splash.damage).toBeGreaterThan(0)
    expect(splash.damage).toBeLessThan(50)
    expect(splash.isDirect).toBe(false)

    // Complete miss 150px away
    const miss = calculateBlastDamage({ x: tanks.p2.x + 150, y: tanks.p2.y - 8 }, 35, 50, tanks.p2)
    expect(miss.damage).toBe(0)
  })

  it('calculates cannon muzzle position for both players', () => {
    const terrain = generateTerrain(1000, 600, 42)
    const tanks = createInitialTanks(terrain)

    const p1Muzzle = getMuzzlePosition(tanks.p1)
    // P1 aims rightwards: muzzle.x > tank.x
    expect(p1Muzzle.x).toBeGreaterThan(tanks.p1.x)
    expect(p1Muzzle.y).toBeLessThan(tanks.p1.y)

    const p2Muzzle = getMuzzlePosition(tanks.p2)
    // P2 aims leftwards: muzzle.x < tank.x
    expect(p2Muzzle.x).toBeLessThan(tanks.p2.x)
    expect(p2Muzzle.y).toBeLessThan(tanks.p2.y)
  })

  it('AI generates valid aiming parameters', () => {
    const terrain = generateTerrain(1000, 600, 42)
    const tanks = createInitialTanks(terrain)

    const aiShot = calculateAiShot(tanks.p2, tanks.p1, terrain, 2, 'medium', () => 0.5)
    expect(aiShot.angle).toBeGreaterThanOrEqual(15)
    expect(aiShot.angle).toBeLessThanOrEqual(85)
    expect(aiShot.power).toBeGreaterThanOrEqual(20)
    expect(aiShot.power).toBeLessThanOrEqual(100)
    expect(['standard', 'mortar', 'cluster', 'bouncy']).toContain(aiShot.weapon)
  })

  it('accurately evaluates match winner and draw', () => {
    const terrain = generateTerrain(1000, 600, 42)
    const tanks = createInitialTanks(terrain)

    expect(checkWinner(tanks)).toBeNull()

    // P2 defeated
    const p1WonTanks = {
      ...tanks,
      p2: { ...tanks.p2, hp: 0 },
    }
    expect(checkWinner(p1WonTanks)).toBe('p1')

    // P1 defeated
    const p2WonTanks = {
      ...tanks,
      p1: { ...tanks.p1, hp: 0 },
    }
    expect(checkWinner(p2WonTanks)).toBe('p2')

    // Both dead
    const drawTanks = {
      p1: { ...tanks.p1, hp: 0 },
      p2: { ...tanks.p2, hp: 0 },
    }
    expect(checkWinner(drawTanks)).toBe('draw')
  })

  it('safely handles terrain impact and crater carving beyond player flanks and board edges', () => {
    const terrain = generateTerrain(CANVAS_WIDTH, CANVAS_HEIGHT, 42)
    const rightEdgeY = terrain.heights[CANVAS_WIDTH - 1]
    const leftEdgeY = terrain.heights[0]

    // Impacts beyond the right flank (e.g. overshooting P2 at x = CANVAS_WIDTH + 150)
    const updatedRight = carveCrater(terrain, CANVAS_WIDTH + 150, rightEdgeY, 40)
    expect(updatedRight.heights.length).toBe(CANVAS_WIDTH)

    // Impacts beyond the left flank (e.g. overshooting P1 at x = -150)
    const updatedLeft = carveCrater(terrain, -150, leftEdgeY, 40)
    expect(updatedLeft.heights.length).toBe(CANVAS_WIDTH)
  })
})
