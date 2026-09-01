import type { Bird, Pipe, Particle, Difficulty, DifficultyConfig } from '../types'

export const VIRTUAL_WIDTH = 380
export const VIRTUAL_HEIGHT = 540
export const FLOOR_HEIGHT = 44
export const BIRD_X = 90
export const BIRD_RADIUS = 13
export const PIPE_WIDTH = 54

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    gravity: 0.36,
    jumpForce: -6.8,
    pipeSpeed: 1.8,
    pipeGap: 146,
    pipeInterval: 130,
  },
  normal: {
    gravity: 0.42,
    jumpForce: -7.6,
    pipeSpeed: 2.2,
    pipeGap: 124,
    pipeInterval: 105,
  },
  hard: {
    gravity: 0.48,
    jumpForce: -8.2,
    pipeSpeed: 2.7,
    pipeGap: 104,
    pipeInterval: 90,
  },
}

export function createInitialBird(): Bird {
  return {
    x: BIRD_X,
    y: VIRTUAL_HEIGHT / 2 - 30,
    vy: 0,
    angle: 0,
    radius: BIRD_RADIUS,
    wingPhase: 0,
  }
}

export function createPipe(id: number, difficulty: Difficulty): Pipe {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const playHeight = VIRTUAL_HEIGHT - FLOOR_HEIGHT
  const minTop = 60
  const maxTop = playHeight - config.pipeGap - 60
  const topHeight = Math.floor(minTop + Math.random() * (maxTop - minTop))
  const bottomY = topHeight + config.pipeGap

  return {
    id,
    x: VIRTUAL_WIDTH + 20,
    topHeight,
    bottomY,
    width: PIPE_WIDTH,
    passed: false,
  }
}

// Circle to Box collision helper
function circleIntersectsRect(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  const closestX = Math.max(rx, Math.min(cx, rx + rw))
  const closestY = Math.max(ry, Math.min(cy, ry + rh))
  const dx = cx - closestX
  const dy = cy - closestY
  return dx * dx + dy * dy <= r * r
}

// Check intersection with bird's composite body + beak hitbox
function birdIntersectsRect(
  bird: Bird,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  // 1. Main body circle (radius 12.5)
  if (circleIntersectsRect(bird.x, bird.y, 12.5, rx, ry, rw, rh)) {
    return true
  }
  // 2. Front beak/head circle offset in direction of flight angle
  const frontX = bird.x + Math.cos(bird.angle) * 7.5
  const frontY = bird.y + Math.sin(bird.angle) * 7.5
  if (circleIntersectsRect(frontX, frontY, 7.5, rx, ry, rw, rh)) {
    return true
  }
  return false
}

export function checkCollisions(bird: Bird, pipes: Pipe[]): boolean {
  // Floor collision (bird bottom touches floor)
  if (bird.y + bird.radius >= VIRTUAL_HEIGHT - FLOOR_HEIGHT) {
    return true
  }
  // Ceiling collision (bird top touches ceiling)
  if (bird.y - bird.radius <= 0) {
    return true
  }

  const capMargin = 3
  const capH = 16

  // Check pipes with accurate cap and body bounds
  for (const pipe of pipes) {
    const pipeRight = pipe.x + pipe.width + capMargin
    const pipeLeft = pipe.x - capMargin

    // Fast broadphase
    if (pipeRight < bird.x - 20 || pipeLeft > bird.x + 20) {
      continue
    }

    // Top pipe body & cap
    if (birdIntersectsRect(bird, pipe.x, 0, pipe.width, pipe.topHeight)) {
      return true
    }
    if (birdIntersectsRect(bird, pipe.x - capMargin, pipe.topHeight - capH, pipe.width + capMargin * 2, capH)) {
      return true
    }

    // Bottom pipe body & cap
    const bottomHeight = VIRTUAL_HEIGHT - FLOOR_HEIGHT - pipe.bottomY
    if (birdIntersectsRect(bird, pipe.x, pipe.bottomY, pipe.width, bottomHeight)) {
      return true
    }
    if (birdIntersectsRect(bird, pipe.x - capMargin, pipe.bottomY, pipe.width + capMargin * 2, capH)) {
      return true
    }
  }

  return false
}

export function createFlapParticles(x: number, y: number): Particle[] {
  const count = 4
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      id: Math.random(),
      x: x - 8 + (Math.random() * 4 - 2),
      y: y + 4 + (Math.random() * 4 - 2),
      vx: -(1 + Math.random() * 1.5),
      vy: 0.5 + Math.random() * 1.2,
      alpha: 0.7,
      size: 2.5 + Math.random() * 2,
      color: '#94a3b8',
    })
  }
  return particles
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      alpha: p.alpha - 0.035,
      size: Math.max(0.5, p.size - 0.08),
    }))
    .filter(p => p.alpha > 0.05)
}
