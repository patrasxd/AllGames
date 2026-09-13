import { describe, it, expect } from 'vitest'
import { getInitialSnake, isOppositeDirection, getNextHead, MAP_CONFIGS } from '../logic'

describe('Snake Game Logic', () => {
  it('creates initial 3-segment snake in the middle of grid', () => {
    const snake = getInitialSnake(20)
    expect(snake).toHaveLength(3)
    expect(snake[0]).toEqual({ x: 10, y: 10 })
    expect(snake[1]).toEqual({ x: 9, y: 10 })
    expect(snake[2]).toEqual({ x: 8, y: 10 })
  })

  it('correctly identifies opposite directions to prevent 180-degree self-collision', () => {
    expect(isOppositeDirection('UP', 'DOWN')).toBe(true)
    expect(isOppositeDirection('DOWN', 'UP')).toBe(true)
    expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true)
    expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true)
    expect(isOppositeDirection('UP', 'LEFT')).toBe(false)
  })

  it('computes next head position given movement direction', () => {
    const head = { x: 5, y: 5 }
    expect(getNextHead(head, 'UP')).toEqual({ x: 5, y: 4 })
    expect(getNextHead(head, 'DOWN')).toEqual({ x: 5, y: 6 })
    expect(getNextHead(head, 'LEFT')).toEqual({ x: 4, y: 5 })
    expect(getNextHead(head, 'RIGHT')).toEqual({ x: 6, y: 5 })
  })

  it('provides map configurations', () => {
    expect(MAP_CONFIGS.classic.gridSize).toBe(20)
    expect(MAP_CONFIGS.classic.obstacles).toHaveLength(0)
    expect(MAP_CONFIGS.obstacles.obstacles.length).toBeGreaterThan(0)
  })
})
