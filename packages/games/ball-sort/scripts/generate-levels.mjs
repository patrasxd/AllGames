/**
 * Regenerates src/logic/levelsData.ts for Ball Sort.
 *
 *   node scripts/generate-levels.mjs
 *
 * The tube/color layout per level (3 colors up to 8, then fewer empty tubes) is unchanged. What is new
 * is how a board is chosen: for each level we shuffle K candidate boards, measure how many moves each
 * needs, and keep the hardest. K grows with the level, so difficulty rises inside every tier too, and
 * every fifth level draws fewer candidates and acts as a breather. Boards with 5 colors or fewer are
 * measured exactly (BFS = the true minimum number of pours); bigger boards use the same beam search
 * as src/logic/solver.ts, which gives a good upper bound.
 *
 * The pour rules below mirror src/logic/engine.ts. The unit tests re-verify every level that ships
 * with the real engine and solver, so any drift between the two would be caught there.
 */
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const PALETTE = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'charcoal', 'cream']
const CAPACITY = 4
const CAMPAIGN_LEVELS = 200
const POOL_LEVELS = 100 // endless pool: levels 201+ cycle through these (see generator.ts)
const LEVEL_COUNT = CAMPAIGN_LEVELS + POOL_LEVELS

// [firstLevel, lastLevel, colors, emptyTubes]
const TIERS = [
  [1, 15, 3, 2],
  [16, 45, 4, 2],
  [46, 80, 5, 2],
  [81, 120, 6, 2],
  [121, 160, 7, 2],
  [161, 185, 8, 2],
  [186, 192, 7, 1],
  [193, 200, 8, 1],
  [201, 300, 8, 1],
]

function createPRNG(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const topRun = (tube) => {
  if (!tube.length) return null
  const color = tube[tube.length - 1]
  let length = 1
  while (length < tube.length && tube[tube.length - 1 - length] === color) length++
  return { color, length }
}
const isTubeSolved = (tube) => tube.length === 0 || topRun(tube).length === tube.length
function isSolved(tubes) {
  const seen = new Set()
  for (const tube of tubes) {
    if (!tube.length) continue
    if (!isTubeSolved(tube) || seen.has(tube[0])) return false
    seen.add(tube[0])
  }
  return true
}
function* pours(tubes) {
  for (let from = 0; from < tubes.length; from++) {
    const run = topRun(tubes[from])
    if (!run) continue
    for (let to = 0; to < tubes.length; to++) {
      if (from === to) continue
      const dest = tubes[to]
      if (dest.length >= CAPACITY) continue
      if (dest.length && dest[dest.length - 1] !== run.color) continue
      const count = Math.min(run.length, CAPACITY - dest.length)
      const next = tubes.map((t) => t.slice())
      next[to].push(...next[from].splice(next[from].length - count, count))
      yield next
    }
  }
}
// Tubes are interchangeable, so sort them to collapse symmetric states.
const keyOf = (tubes) =>
  tubes
    .map((t) => t.join('.'))
    .sort()
    .join('|')

/** Exact minimum number of pours (BFS), or null once more than maxStates states were visited. */
function optimalLength(tubes, maxStates) {
  if (isSolved(tubes)) return 0
  const seen = new Set([keyOf(tubes)])
  let frontier = [tubes]
  for (let depth = 1; frontier.length; depth++) {
    const next = []
    for (const state of frontier) {
      for (const child of pours(state)) {
        const key = keyOf(child)
        if (seen.has(key)) continue
        seen.add(key)
        if (isSolved(child)) return depth
        next.push(child)
        if (seen.size > maxStates) return null
      }
    }
    frontier = next
  }
  return null
}

function heuristic(tubes) {
  const byColor = new Map()
  tubes.forEach((tube, i) => {
    for (const color of tube) {
      if (!byColor.has(color)) byColor.set(color, new Set())
      byColor.get(color).add(i)
    }
  })
  let cost = 0
  for (const set of byColor.values()) cost += set.size - 1
  return cost
}

/** Same beam search as src/logic/solver.ts; returns the number of pours it found, or null. */
function beamLength(tubes, maxNodes) {
  if (isSolved(tubes)) return 0
  const seen = new Set([keyOf(tubes)])
  let frontier = [{ tubes, depth: 0 }]
  let expanded = 0
  const score = (n) => heuristic(n.tubes) + n.depth * 0.15
  while (frontier.length && expanded < maxNodes) {
    frontier.sort((a, b) => score(a) - score(b))
    const next = []
    for (const node of frontier) {
      if (expanded >= maxNodes) break
      expanded++
      for (const child of pours(node.tubes)) {
        const key = keyOf(child)
        if (seen.has(key)) continue
        seen.add(key)
        if (isSolved(child)) return node.depth + 1
        next.push({ tubes: child, depth: node.depth + 1 })
      }
    }
    next.sort((a, b) => score(a) - score(b))
    frontier = next.slice(0, 400)
  }
  return null
}

function measure(tubes, colors) {
  if (colors <= 5) {
    const exact = optimalLength(tubes, 400000)
    if (exact !== null) return exact
  }
  return beamLength(tubes, 12000)
}

function candidateBoard(rand, colors, empties) {
  const balls = []
  for (let c = 0; c < colors; c++) for (let i = 0; i < CAPACITY; i++) balls.push(PALETTE[c])
  for (let i = balls.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[balls[i], balls[j]] = [balls[j], balls[i]]
  }
  const tubes = []
  for (let i = 0; i < colors; i++) tubes.push(balls.slice(i * CAPACITY, (i + 1) * CAPACITY))
  // A tube that already holds one color would be a free tube to the player: reroll those.
  if (tubes.some((t) => new Set(t).size === 1)) return null
  for (let i = 0; i < empties; i++) tubes.push([])
  return tubes
}

function candidatesFor(level, colors) {
  const base = Math.min(40, 4 + Math.floor(level / 4))
  const cap = colors >= 6 ? 8 : 40 // bigger boards are slower to measure
  const k = Math.min(cap, level % 5 === 0 ? Math.max(2, Math.floor(base / 3)) : base)
  return k
}

const log = (...a) => console.error(...a)
const levels = []
for (let level = 1; level <= LEVEL_COUNT; level++) {
  const [, , colors, tierEmpties] = TIERS.find(([a, b]) => level >= a && level <= b)
  const empties = level > CAMPAIGN_LEVELS && level % 5 === 0 ? 2 : tierEmpties // pool breathers get a second empty tube
  const wanted = candidatesFor(level, colors)
  let best = null
  let evaluated = 0
  for (let attempt = 0; evaluated < wanted && attempt < wanted * 20; attempt++) {
    const seed = level * 10007 + attempt * 7919 + 31
    const tubes = candidateBoard(createPRNG(seed), colors, empties)
    if (!tubes) continue
    const length = measure(tubes, colors)
    if (length === null) continue // unsolved within budget: skip rather than risk an unsolvable level
    evaluated++
    if (!best || length > best.length) best = { tubes, length, seed }
  }
  if (!best) throw new Error(`no solvable board found for level ${level}`)
  const par = best.length
  levels.push({
    config: {
      level,
      numColors: colors,
      capacity: CAPACITY,
      numEmptyTubes: empties,
      colors: PALETTE.slice(0, colors),
      parMoves: par,
      starThresholds: [Math.round(par * 1.15), Math.round(par * 1.5)],
      seed: best.seed,
    },
    tubes: best.tubes,
  })
  if (level % 10 === 0)
    log(`level ${level}/${LEVEL_COUNT} (${colors} colors, best of ${evaluated}: ${best.length} pours)`)
}

const outPath = fileURLToPath(new URL('../src/logic/levelsData.ts', import.meta.url))
fs.writeFileSync(
  outPath,
  `// Generated by scripts/generate-levels.mjs - do not edit by hand.\n` +
    `// Levels 1-${CAMPAIGN_LEVELS}: campaign. Levels ${CAMPAIGN_LEVELS + 1}-${LEVEL_COUNT}: endless pool (see generator.ts).\n` +
    `// \`parMoves\` is the length of the shortest solution the generator found.\n` +
    `import type { PrecomputedLevel } from './levelsDataTypes'\n\n` +
    `export const CAMPAIGN_LEVELS = ${CAMPAIGN_LEVELS}\n\n` +
    `export const LEVELS_DATA: PrecomputedLevel[] = ${JSON.stringify(levels, null, 2)}\n`,
)
log('wrote', outPath)
