import { describe, it, expect } from 'vitest'
import { createInitialBird, stepBirdPhysics, stepPipePosition, DIFFICULTY_CONFIGS } from '../logic/engine'
import type { Pipe } from '../types'

describe('Wing Rush Delta-Time Physics Scaling', () => {
  const config = DIFFICULTY_CONFIGS.normal

  it('scales bird velocity and position proportionally to elapsed time (dt)', () => {
    const bird = createInitialBird()

    // 1 frame at 60fps (dt = 1.0)
    const step1 = stepBirdPhysics(bird, config, 1.0)
    expect(step1.vy).toBeCloseTo(config.gravity, 5)
    expect(step1.y).toBeCloseTo(bird.y + config.gravity, 5)

    // 1 frame at 30fps (dt = 2.0)
    const step2 = stepBirdPhysics(bird, config, 2.0)
    expect(step2.vy).toBeCloseTo(config.gravity * 2, 5)
    // vy = 0 + g*2, y = y0 + vy * 2 = y0 + 2*g*2 = y0 + 4*g
    expect(step2.y).toBeCloseTo(bird.y + config.gravity * 2 * 2, 5)

    // Half frame at 120fps (dt = 0.5)
    const stepHalf = stepBirdPhysics(bird, config, 0.5)
    expect(stepHalf.vy).toBeCloseTo(config.gravity * 0.5, 5)
    expect(stepHalf.y).toBeCloseTo(bird.y + config.gravity * 0.5 * 0.5, 5)

    // Verify velocity change is directly proportional to dt
    expect(step2.vy / step1.vy).toBeCloseTo(2.0, 5)
    expect(stepHalf.vy / step1.vy).toBeCloseTo(0.5, 5)
  })

  it('scales pipe displacement proportionally to elapsed time (dt)', () => {
    const pipe: Pipe = {
      id: 1,
      x: 300,
      topHeight: 100,
      bottomY: 224,
      width: 54,
      passed: false,
    }

    const moved1 = stepPipePosition(pipe, config, 1.0)
    const moved2 = stepPipePosition(pipe, config, 2.0)
    const movedHalf = stepPipePosition(pipe, config, 0.5)

    const deltaX1 = pipe.x - moved1.x
    const deltaX2 = pipe.x - moved2.x
    const deltaXHalf = pipe.x - movedHalf.x

    expect(deltaX1).toBeCloseTo(config.pipeSpeed, 5)
    expect(deltaX2).toBeCloseTo(config.pipeSpeed * 2.0, 5)
    expect(deltaXHalf).toBeCloseTo(config.pipeSpeed * 0.5, 5)

    expect(deltaX2 / deltaX1).toBeCloseTo(2.0, 5)
    expect(deltaXHalf / deltaX1).toBeCloseTo(0.5, 5)
  })
})
