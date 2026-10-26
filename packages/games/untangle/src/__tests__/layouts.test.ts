import { describe, it, expect } from 'vitest'
import {
  BOARD_SIZE,
  buildSlots,
  diamondLayout,
  gridLayout,
  hexLayout,
  pegRadius,
  ringLayout,
  ringRadii,
  scatterLayout,
  slotCount,
  slotSpacing,
  triangleLayout,
  twinLayout,
} from '../logic/layouts'
import { CAMPAIGN_LEVELS, getLevelConfig } from '../logic/levels'

const shapes = [
  { name: 'rectangular grid', layout: gridLayout(4, 3), count: 12 },
  { name: 'ring', layout: ringLayout(13), count: 13 },
  { name: 'diamond', layout: diamondLayout(2), count: 13 },
  { name: 'big diamond', layout: diamondLayout(3), count: 25 },
  { name: 'triangle', layout: triangleLayout(5), count: 15 },
  { name: 'hexagon', layout: hexLayout(2), count: 19 },
  { name: 'twin rings', layout: twinLayout(12, 6), count: 19 },
  { name: 'scatter', layout: scatterLayout(14, 3), count: 14 },
]

describe('board shapes', () => {
  for (const { name, layout, count } of shapes) {
    it(`${name}: has the expected number of holes, all distinct and inside the board`, () => {
      const slots = buildSlots(layout)
      expect(slots).toHaveLength(count)
      expect(slotCount(layout)).toBe(count)
      expect(layout.count).toBe(count)
      for (const p of slots) {
        expect(p.x).toBeGreaterThan(0)
        expect(p.x).toBeLessThan(BOARD_SIZE)
        expect(p.y).toBeGreaterThan(0)
        expect(p.y).toBeLessThan(BOARD_SIZE)
      }
      expect(new Set(slots.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`)).size).toBe(count)
    })

    it(`${name}: pegs fit with room to spare`, () => {
      expect(pegRadius(layout) * 2).toBeLessThan(slotSpacing(layout))
      // Big enough to tap on a phone (the board is about 350 px wide, so 100 units = 350 px).
      expect(pegRadius(layout)).toBeGreaterThan(3.5)
    })
  }

  it('scatter boards are deterministic and differ with the seed', () => {
    expect(buildSlots(scatterLayout(14, 3))).toEqual(buildSlots(scatterLayout(14, 3)))
    expect(buildSlots(scatterLayout(14, 3))).not.toEqual(buildSlots(scatterLayout(14, 4)))
  })

  it('ring-like boards ask for rails behind the holes', () => {
    expect(ringRadii(ringLayout(10))).toHaveLength(1)
    expect(ringRadii(twinLayout(12, 6))).toHaveLength(2)
    expect(ringRadii(gridLayout(3))).toHaveLength(0)
  })

  it('the campaign uses a good variety of shapes', () => {
    const kinds = new Set<string>()
    for (let level = 1; level <= CAMPAIGN_LEVELS; level++) kinds.add(getLevelConfig(level).layout.kind)
    expect(kinds).toEqual(new Set(['grid', 'ring', 'diamond', 'triangle', 'hex', 'twin', 'scatter']))
  })

  it('does not show the same board for many levels in a row', () => {
    let run = 1
    let longest = 1
    let previous = ''
    for (let level = 1; level <= CAMPAIGN_LEVELS; level++) {
      const { layout } = getLevelConfig(level)
      const id = `${layout.kind}${layout.cols}${layout.rows}${layout.count}${layout.seed ?? ''}`
      run = id === previous ? run + 1 : 1
      longest = Math.max(longest, run)
      previous = id
    }
    expect(longest).toBeLessThanOrEqual(8)
  })
})
