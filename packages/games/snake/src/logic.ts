import type { Direction, Point, SpeedMode, MapMode } from './types'

export const SPEED_INTERVALS: Record<SpeedMode, number> = {
  relaxed: 160,
  normal: 110,
  fast: 75,
}

// 4 symmetrical obstacle hurdle blocks for the 'obstacles' map mode
export const OBSTACLES_LIST: Point[] = [
  // Top-left hurdle
  { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
  { x: 4, y: 5 }, { x: 4, y: 6 },

  // Top-right hurdle
  { x: 13, y: 4 }, { x: 14, y: 4 }, { x: 15, y: 4 },
  { x: 15, y: 5 }, { x: 15, y: 6 },

  // Bottom-left hurdle
  { x: 4, y: 15 }, { x: 5, y: 15 }, { x: 6, y: 15 },
  { x: 4, y: 14 }, { x: 4, y: 13 },

  // Bottom-right hurdle
  { x: 13, y: 15 }, { x: 14, y: 15 }, { x: 15, y: 15 },
  { x: 15, y: 14 }, { x: 15, y: 13 },
]

export const MAP_CONFIGS: Record<MapMode, { gridSize: number; obstacles: Point[] }> = {
  classic: { gridSize: 20, obstacles: [] },
  obstacles: { gridSize: 20, obstacles: OBSTACLES_LIST },
  big: { gridSize: 28, obstacles: [] },
}

export function getInitialSnake(gridSize = 20): Point[] {
  const mid = Math.floor(gridSize / 2)
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ]
}

export const INITIAL_DIRECTION: Direction = 'RIGHT'

export function isOppositeDirection(d1: Direction, d2: Direction): boolean {
  return (
    (d1 === 'UP' && d2 === 'DOWN') ||
    (d1 === 'DOWN' && d2 === 'UP') ||
    (d1 === 'LEFT' && d2 === 'RIGHT') ||
    (d1 === 'RIGHT' && d2 === 'LEFT')
  )
}

export function getNextHead(head: Point, direction: Direction): Point {
  switch (direction) {
    case 'UP':
      return { x: head.x, y: head.y - 1 }
    case 'DOWN':
      return { x: head.x, y: head.y + 1 }
    case 'LEFT':
      return { x: head.x - 1, y: head.y }
    case 'RIGHT':
      return { x: head.x + 1, y: head.y }
  }
}

export function checkWallCollision(point: Point, gridSize: number): boolean {
  return point.x < 0 || point.x >= gridSize || point.y < 0 || point.y >= gridSize
}

export function checkSelfCollision(head: Point, body: Point[]): boolean {
  return body.some(segment => segment.x === head.x && segment.y === head.y)
}

export function checkObstacleCollision(head: Point, obstacles: Point[]): boolean {
  return obstacles.some(obs => obs.x === head.x && obs.y === head.y)
}

export function spawnFood(snake: Point[], obstacles: Point[] = [], gridSize = 20): Point {
  const occupied = new Set<string>()
  snake.forEach(p => occupied.add(`${p.x},${p.y}`))
  obstacles.forEach(p => occupied.add(`${p.x},${p.y}`))

  const available: Point[] = []

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y })
      }
    }
  }

  if (available.length === 0) {
    return { x: 0, y: 0 }
  }

  const randomIndex = Math.floor(Math.random() * available.length)
  return available[randomIndex]
}
