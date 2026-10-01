import { describe, it, expect } from 'vitest'
import { COMBINE_DISTANCE, ITEM_SIZE, findCombineTarget, toWorkspacePoint } from '../geometry'

describe('findCombineTarget', () => {
  const items = [
    { uid: 1, x: 0, y: 0 },
    { uid: 2, x: 100, y: 100 },
  ]

  it('finds the nearest card within combining distance', () => {
    expect(findCombineTarget(items, 10, 10)?.uid).toBe(1)
    expect(findCombineTarget(items, 95, 105)?.uid).toBe(2)
  })

  it('returns null when every card is too far away', () => {
    expect(findCombineTarget(items, 50 + COMBINE_DISTANCE, 300)).toBeNull()
  })

  it('can ignore the card being dragged', () => {
    expect(findCombineTarget(items, 0, 0, 1)).toBeNull()
  })
})

describe('toWorkspacePoint', () => {
  const rect = { left: 20, top: 40, width: 400, height: 300 }

  it('centres a card on the pointer, relative to the workspace', () => {
    const p = toWorkspacePoint(rect, 220, 190)
    expect(p).toEqual({ inside: true, x: 200 - ITEM_SIZE / 2, y: 150 - ITEM_SIZE / 2 })
  })

  it('keeps the card inside the workspace near the edges', () => {
    expect(toWorkspacePoint(rect, 21, 41)).toMatchObject({ x: 0, y: 0, inside: true })
    const far = toWorkspacePoint(rect, 419, 339)
    expect(far.x).toBe(400 - ITEM_SIZE)
    expect(far.y).toBe(300 - ITEM_SIZE)
  })

  it('reports a pointer outside the workspace', () => {
    expect(toWorkspacePoint(rect, 10, 10).inside).toBe(false)
    expect(toWorkspacePoint(rect, 500, 100).inside).toBe(false)
  })

  it('never counts as inside a workspace with no size', () => {
    expect(toWorkspacePoint({ left: 0, top: 0, width: 0, height: 0 }, 0, 0).inside).toBe(false)
  })
})
