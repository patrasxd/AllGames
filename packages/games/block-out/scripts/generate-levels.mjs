/**
 * Regenerates src/logic/levelsData.ts for Block Out.
 *
 *   node --experimental-strip-types scripts/generate-levels.mjs   (Node 22.18+ strips types by default)
 *
 * Every level is a board whose *exact* optimal solution length (computed by exhaustive BFS in
 * hardBoards.ts) matches the difficulty curve below. Levels 1-200 are the campaign; levels 201-300
 * are an "endless" pool the game cycles through for level 201 and beyond.
 * The whole run is deterministic and takes a few minutes.
 */
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { climbBoard, createPRNG, exploreComponent, findBoard, toBlocks } from '../src/logic/hardBoards.ts'

const CAMPAIGN = 200
const POOL = 100
const BANK_SIZE = 90
const MAX_REUSE = 6

// [firstLevel, lastLevel, minMovesAtFirst, minMovesAtLast]
export const BANDS = [
  [1, 10, 3, 6],
  [11, 40, 6, 10],
  [41, 100, 8, 15],
  [101, 150, 12, 20],
  [151, 200, 16, 25],
]

export function targetMoves(level, rand) {
  if (level > CAMPAIGN) {
    const base = 21 + Math.floor(((level - CAMPAIGN - 1) / POOL) * 8)
    return base + Math.floor(rand() * 3) - 1
  }
  const [a, b, lo, hi] = BANDS.find(([from, to]) => level >= from && level <= to)
  const base = Math.round(lo + ((hi - lo) * (level - a)) / (b - a))
  let d = base + Math.floor(rand() * 3) - 1
  if (level % 5 === 0) d -= 2 // every fifth level is a breather
  return Math.max(lo, Math.min(hi, d))
}

function blockCountFor(level) {
  return Math.min(11, 7 + Math.floor(level / 30))
}

const log = (...a) => console.error(...a)
const rand = createPRNG(2026)

// 1. Plan the curve.
const targets = []
for (let level = 1; level <= CAMPAIGN + POOL; level++) targets.push(targetMoves(level, rand))

// 2. Bank of hill-climbed boards for the hard levels.
const HARD_FROM = 11
const needHard = targets.filter((d) => d >= HARD_FROM).length
log(`levels needing a climbed board: ${needHard}; bank size ${BANK_SIZE}`)
// Climbing is the slow part (minutes). Set BANK_CACHE=/some/file.json to reuse it between runs.
const cachePath = process.env.BANK_CACHE
let boards = cachePath && fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : null
if (!boards) {
  boards = []
  for (let i = 0; i < BANK_SIZE; i++) {
    const goal = 18 + (i % 14) // spread of ceilings so we have boards for every distance
    const board = climbBoard(9000 + i * 31, 9 + (i % 4), 170, goal)
    if (board) boards.push(board)
    if (i % 10 === 9) log(`bank ${i + 1}/${BANK_SIZE}, best so far ${Math.max(...boards.map((b) => b.hardest))}`)
  }
  if (cachePath) fs.writeFileSync(cachePath, JSON.stringify(boards))
}
const bank = boards.map((board) => ({ ...board, uses: 0, used: new Set() }))

// 3. Assign boards to levels.
const levels = []
for (let level = 1; level <= CAMPAIGN + POOL; level++) {
  const d = targets[level - 1]
  let picked = null
  if (d < HARD_FROM) {
    picked = findBoard(level * 7919 + 5, { min: d, max: d, blockCount: blockCountFor(level), maxAttempts: 600 })
  } else {
    const candidates = bank
      .filter((b) => b.uses < MAX_REUSE && !b.used.has(d) && b.hardest >= d)
      .sort((x, y) => x.uses - y.uses || x.hardest - y.hardest)
    for (const entry of candidates) {
      const component = exploreComponent(entry.blocks, 30000)
      const options = []
      for (let s = 0; s < component.states.length; s++) {
        if (component.states[s][0] === 0 && component.dist[s] === d) options.push(s)
      }
      if (options.length === 0) continue
      const s = options[Math.floor(rand() * options.length)]
      picked = { blocks: toBlocks(component, s), minMoves: d }
      entry.uses++
      entry.used.add(d)
      break
    }
  }
  if (!picked && d >= HARD_FROM) {
    // Second chance: accept a slightly easier distance, but never drop below the pool floor of 20.
    const floor = Math.max(HARD_FROM, level > CAMPAIGN ? 20 : d - 3)
    const fallbacks = bank
      .filter((b) => b.uses < MAX_REUSE * 2 && b.hardest >= floor)
      .sort((x, y) => x.uses - y.uses || y.hardest - x.hardest)
    for (const entry of fallbacks) {
      const component = exploreComponent(entry.blocks, 30000)
      const options = []
      for (let s = 0; s < component.states.length; s++) {
        const dist = component.dist[s]
        if (component.states[s][0] === 0 && dist >= Math.max(floor, d - 3) && dist <= d) options.push(s)
      }
      if (options.length === 0) continue
      const s = options[Math.floor(rand() * options.length)]
      picked = { blocks: toBlocks(component, s), minMoves: component.dist[s] }
      entry.uses++
      break
    }
  }
  if (!picked) {
    log(`WARNING level ${level}: no board for ${d} moves, using the closest one`)
    picked = findBoard(level * 104729, { min: d, max: d + 3, blockCount: 10, maxAttempts: 800 })
  }
  levels.push({
    level,
    blocks: picked.blocks,
    minMoves: picked.minMoves,
    starThresholds: [picked.minMoves, Math.round(picked.minMoves * 1.4)],
  })
  if (level % 25 === 0) log(`assigned ${level}/${CAMPAIGN + POOL}`)
}

const outPath = fileURLToPath(new URL('../src/logic/levelsData.ts', import.meta.url))
const toTs = (list) => JSON.stringify(list, null, 2)
fs.writeFileSync(
  outPath,
  `// Generated by scripts/generate-levels.mjs - do not edit by hand.\n` +
    `// Levels 1-${CAMPAIGN}: campaign. Levels ${CAMPAIGN + 1}-${CAMPAIGN + POOL}: endless pool (see generator.ts).\n` +
    `// \`minMoves\` is the exact optimal solution length, verified by exhaustive BFS.\n` +
    `import type { LevelConfig } from '../types'\n\n` +
    `export const CAMPAIGN_LEVELS = ${CAMPAIGN}\n\n` +
    `export const LEVELS_DATA: LevelConfig[] = ${toTs(levels)}\n`,
)
log('wrote', outPath)
