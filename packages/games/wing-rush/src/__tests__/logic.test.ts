import { describe, it, expect } from 'vitest'
import {
  createInitialBird,
  createPipe,
  checkCollisions,
  VIRTUAL_HEIGHT,
  FLOOR_HEIGHT,
  BIRD_RADIUS,
} from '../logic/engine'

describe('Wing Rush Physics & Engine Logic', () => {
  it('creates initial bird at standard virtual coordinates', () => {
    const bird = createInitialBird()
    expect(bird.x).toBe(90)
    expect(bird.vy).toBe(0)
    expect(bird.radius).toBe(BIRD_RADIUS)
    expect(bird.y).toBeLessThan(VIRTUAL_HEIGHT)
  })

  it('generates pipes with proper gap according to difficulty', () => {
    const easyPipe = createPipe(1, 'easy')
    const hardPipe = createPipe(2, 'hard')

    expect(easyPipe.bottomY - easyPipe.topHeight).toBe(146) // easy gap
    expect(hardPipe.bottomY - hardPipe.topHeight).toBe(104) // hard gap
  })

  it('detects floor collision', () => {
    const bird = createInitialBird()
    bird.y = VIRTUAL_HEIGHT - FLOOR_HEIGHT // at or below floor
    expect(checkCollisions(bird, [])).toBe(true)
  })

  it('does not detect collision in open air without pipes', () => {
    const bird = createInitialBird()
    expect(checkCollisions(bird, [])).toBe(false)
  })
})
