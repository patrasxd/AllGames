import { describe, it, expect } from 'vitest'
import {
  createEmptyGrid,
  createShotBubble,
  launchShotBubble,
  stepShotBubble,
  findLandingCell,
  getNeighbors,
  cellX,
  cellY,
  VIRTUAL_WIDTH,
  RADIUS,
} from '../logic/engine'

describe('Bubble Shooter shot physics', () => {
  it('launches straight up when aim angle is zero', () => {
    const bubble = launchShotBubble(createShotBubble('red'), 0, 10)
    expect(bubble.vx).toBeCloseTo(0, 5)
    expect(bubble.vy).toBeCloseTo(-10, 5)
  })

  it('splits velocity between axes for an angled shot', () => {
    const angle = Math.PI / 4
    const bubble = launchShotBubble(createShotBubble('blue'), angle, 10)
    expect(bubble.vx).toBeGreaterThan(0)
    expect(bubble.vy).toBeLessThan(0)
    // Speed magnitude is preserved regardless of angle.
    expect(Math.hypot(bubble.vx, bubble.vy)).toBeCloseTo(10, 5)
  })

  it('bounces off the left wall and reverses horizontal velocity', () => {
    const bubble = { x: RADIUS + 2, y: 300, vx: -8, vy: -5, color: 'green' as const, radius: RADIUS }
    const stepped = stepShotBubble(bubble, 3)
    expect(stepped.x).toBe(RADIUS)
    expect(stepped.vx).toBe(8)
  })

  it('bounces off the right wall and reverses horizontal velocity', () => {
    const bubble = { x: VIRTUAL_WIDTH - RADIUS - 2, y: 300, vx: 8, vy: -5, color: 'yellow' as const, radius: RADIUS }
    const stepped = stepShotBubble(bubble, 3)
    expect(stepped.x).toBe(VIRTUAL_WIDTH - RADIUS)
    expect(stepped.vx).toBe(-8)
  })

  it('moves in a straight line with no walls in the way', () => {
    const bubble = { x: VIRTUAL_WIDTH / 2, y: 300, vx: 2, vy: -6, color: 'purple' as const, radius: RADIUS }
    const stepped = stepShotBubble(bubble, 1)
    expect(stepped.x).toBeCloseTo(VIRTUAL_WIDTH / 2 + 2, 5)
    expect(stepped.y).toBeCloseTo(294, 5)
    expect(stepped.vx).toBe(2)
  })
})

describe('Bubble Shooter landing', () => {
  it('attaches a bubble next to the one it hit, never to an unrelated empty slot', () => {
    const grid = createEmptyGrid()
    grid[0][3] = 'red'
    // A bubble touching (0,3) from below-right must land in a slot adjacent to (0,3).
    const bubble = {
      x: cellX(0, 3) + RADIUS,
      y: cellY(0) + RADIUS * 1.6,
      vx: 0,
      vy: -8,
      color: 'blue' as const,
      radius: RADIUS,
    }
    const landing = findLandingCell(bubble, grid)
    expect(landing).not.toBeNull()
    const neighbours = getNeighbors(0, 3).map(([r, c]) => `${r},${c}`)
    expect(neighbours).toContain(`${landing!.row},${landing!.col}`)
  })
})
