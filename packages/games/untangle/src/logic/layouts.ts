import type { LayoutSpec, Point } from '../types'

export const BOARD_SIZE = 100
const PADDING = 15
/** Padding for the lattice shapes, which have more holes to squeeze in. */
const FIT_PADDING = 11
const RING_RADIUS = 37
const OUTER_RING_RADIUS = 38
const INNER_RING_RADIUS = 20
const SQRT3_2 = Math.sqrt(3) / 2

// ─── Layout constructors ────────────────────────────────────

export function gridLayout(cols: number, rows = cols): LayoutSpec {
  return { kind: 'grid', cols, rows, count: cols * rows }
}

export function ringLayout(count: number): LayoutSpec {
  return { kind: 'ring', cols: 0, rows: 0, count }
}

/** A diamond-shaped lattice: every grid point whose Manhattan distance from the centre is at most `radius`. */
export function diamondLayout(radius: number): LayoutSpec {
  return { kind: 'diamond', cols: radius, rows: 0, count: 2 * radius * (radius + 1) + 1 }
}

/** A triangle of `rows` rows (1, 2, 3 ... holes) on a hexagonal lattice. */
export function triangleLayout(rows: number): LayoutSpec {
  return { kind: 'triangle', cols: 0, rows, count: (rows * (rows + 1)) / 2 }
}

/** A hexagon of the given radius on a hexagonal lattice (radius 2 has 19 holes). */
export function hexLayout(radius: number): LayoutSpec {
  return { kind: 'hex', cols: radius, rows: 0, count: 3 * radius * (radius + 1) + 1 }
}

/** Two concentric rings (`outer` and `inner` holes) with one hole in the middle. */
export function twinLayout(outer: number, inner: number): LayoutSpec {
  return { kind: 'twin', cols: 0, rows: inner, count: outer + inner + 1 }
}

/** `count` holes at random positions (the same `seed` always gives the same board). */
export function scatterLayout(count: number, seed: number): LayoutSpec {
  return { kind: 'scatter', cols: 0, rows: 0, count, seed }
}

// ─── Slot positions ─────────────────────────────────────────

/** Scales and centres a set of points so that the whole shape fits the board with some padding. */
function fit(points: Point[]): Point[] {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const extent = Math.max(maxX - minX, maxY - minY)
  const scale = extent > 0 ? (BOARD_SIZE - 2 * FIT_PADDING) / extent : 1
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return points.map((p) => ({ x: BOARD_SIZE / 2 + (p.x - cx) * scale, y: BOARD_SIZE / 2 + (p.y - cy) * scale }))
}

function ringPoints(count: number, radius: number, offset = 0): Point[] {
  const c = BOARD_SIZE / 2
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + offset + (2 * Math.PI * i) / count
    return { x: c + radius * Math.cos(angle), y: c + radius * Math.sin(angle) }
  })
}

/** Small deterministic PRNG so a scatter layout is the same on every device. */
function mulberry(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function scatterPoints(count: number, seed: number): Point[] {
  const rand = mulberry(seed * 2654435761 + 97)
  const lo = PADDING
  const span = BOARD_SIZE - 2 * PADDING
  // Aim for evenly spread holes: no two closer than a fraction of the average spacing, relaxed if needed.
  let minDist = 0.85 * Math.sqrt((span * span) / count)

  for (let round = 0; round < 12; round++) {
    const points: Point[] = []
    for (let tries = 0; tries < 4000 && points.length < count; tries++) {
      const p = { x: lo + rand() * span, y: lo + rand() * span }
      if (points.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= minDist)) points.push(p)
    }
    if (points.length === count) return points.sort((a, b) => a.y - b.y || a.x - b.x)
    minDist *= 0.92
  }
  // Practically unreachable: fall back to a plain grid-like fill so a board always exists.
  const side = Math.ceil(Math.sqrt(count))
  return Array.from({ length: count }, (_, i) => ({
    x: lo + ((i % side) / Math.max(1, side - 1)) * span,
    y: lo + (Math.floor(i / side) / Math.max(1, side - 1)) * span,
  }))
}

const slotCache = new Map<string, Point[]>()

/**
 * Slot positions in board coordinates (0..100). Do not mutate the result: boards are cached.
 * Grid slots are row-major; ring slots run clockwise from the top; other shapes are listed row by row.
 */
export function buildSlots(layout: LayoutSpec): Point[] {
  const key = `${layout.kind}:${layout.cols}:${layout.rows}:${layout.count}:${layout.seed ?? ''}`
  const cached = slotCache.get(key)
  if (cached) return cached

  let slots: Point[]
  switch (layout.kind) {
    case 'ring':
      slots = ringPoints(layout.count, RING_RADIUS)
      break
    case 'twin': {
      const outer = layout.count - layout.rows - 1
      slots = [
        ...ringPoints(outer, OUTER_RING_RADIUS),
        ...ringPoints(layout.rows, INNER_RING_RADIUS, Math.PI / layout.rows),
        { x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 },
      ]
      break
    }
    case 'diamond': {
      const r = layout.cols
      const raw: Point[] = []
      for (let j = -r; j <= r; j++)
        for (let i = -r; i <= r; i++) if (Math.abs(i) + Math.abs(j) <= r) raw.push({ x: i, y: j })
      slots = fit(raw)
      break
    }
    case 'triangle': {
      const raw: Point[] = []
      for (let row = 0; row < layout.rows; row++) {
        for (let j = 0; j <= row; j++) raw.push({ x: j - row / 2, y: row * SQRT3_2 })
      }
      slots = fit(raw)
      break
    }
    case 'hex': {
      const r = layout.cols
      const raw: Point[] = []
      for (let q = -r; q <= r; q++) {
        for (let s = -r; s <= r; s++) {
          if (Math.abs(q + s) <= r) raw.push({ x: q + s / 2, y: s * SQRT3_2 })
        }
      }
      slots = fit(raw.sort((a, b) => a.y - b.y || a.x - b.x))
      break
    }
    case 'scatter':
      slots = scatterPoints(layout.count, layout.seed ?? 0)
      break
    case 'grid':
    default: {
      const span = BOARD_SIZE - 2 * PADDING
      const steps = Math.max(layout.cols, layout.rows) - 1
      const step = steps > 0 ? span / steps : 0
      const width = step * (layout.cols - 1)
      const height = step * (layout.rows - 1)
      const left = (BOARD_SIZE - width) / 2
      const top = (BOARD_SIZE - height) / 2
      slots = []
      for (let r = 0; r < layout.rows; r++) {
        for (let c = 0; c < layout.cols; c++) slots.push({ x: left + c * step, y: top + r * step })
      }
    }
  }

  slotCache.set(key, slots)
  return slots
}

export function slotCount(layout: LayoutSpec): number {
  return buildSlots(layout).length
}

const spacingCache = new Map<string, number>()

/** Distance between the two closest slots; used to size pegs and touch targets. */
export function slotSpacing(layout: LayoutSpec): number {
  const key = `${layout.kind}:${layout.cols}:${layout.rows}:${layout.count}:${layout.seed ?? ''}`
  const cached = spacingCache.get(key)
  if (cached !== undefined) return cached
  const slots = buildSlots(layout)
  let min = Infinity
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      min = Math.min(min, Math.hypot(slots[i].x - slots[j].x, slots[i].y - slots[j].y))
    }
  }
  const spacing = Number.isFinite(min) ? min : BOARD_SIZE
  spacingCache.set(key, spacing)
  return spacing
}

export function pegRadius(layout: LayoutSpec): number {
  return Math.min(7.5, slotSpacing(layout) * 0.31)
}

/** Radii of the circular "rails" drawn behind ring-shaped boards. */
export function ringRadii(layout: LayoutSpec): number[] {
  if (layout.kind === 'ring') return [RING_RADIUS]
  if (layout.kind === 'twin') return [OUTER_RING_RADIUS, INNER_RING_RADIUS]
  return []
}

/**
 * How close a rope may run to a peg's centre before it counts as passing through it: the peg's radius plus
 * (about) the rope's half width. Ropes may never be that close to a peg that belongs to another rope.
 */
export function ropeClearance(layout: LayoutSpec): number {
  return pegRadius(layout) + 2
}
