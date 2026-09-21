import { describe, it, expect } from 'vitest'
import { generateLevel, createInitialBoard } from '../logic/generator'
import {
  findMatches,
  findCombo,
  evaluateSwap,
  findValidMoves,
  hasValidMove,
  swapTiles,
  clearMatched,
  applyGravityAndRefill,
  reshuffleBoard,
  updateGoals,
  isBlocked,
  isIceLocked,
} from '../logic/engine'
import type { GemType, SpecialType, Tile, ObstacleType } from '../types'

const GEMS: Record<string, GemType> = {
  R: 'ruby',
  S: 'sapphire',
  E: 'emerald',
  T: 'topaz',
  A: 'amethyst',
  M: 'amber',
}
const SPECIALS: Record<string, SpecialType> = { h: 'line-h', v: 'line-v', b: 'bomb', p: 'prism' }
const OBSTACLES: Record<string, ObstacleType> = { i: 'ice', d: 'double-ice' }

let uid = 0
/** Layout tokens: gem letter + optional modifier (R:i ice, R:d double ice, R:h line-h, R:b bomb, R:p prism), '.' hole, '#' stone. */
function board(layout: string[]): Tile[][] {
  return layout.map((line, r) =>
    line.trim().split(/\s+/).map((token, c): Tile => {
      const base = { id: `t${++uid}`, row: r, col: c }
      if (token === '.') return { ...base, gem: null, special: 'none', obstacle: 'empty' }
      if (token === '#') return { ...base, gem: null, special: 'none', obstacle: 'stone' }
      const [g, mod] = token.split(':')
      return {
        ...base,
        gem: GEMS[g],
        special: mod && SPECIALS[mod] ? SPECIALS[mod] : 'none',
        obstacle: mod && OBSTACLES[mod] ? OBSTACLES[mod] : 'none',
      }
    })
  )
}

/** 8x8 with no matches at all, so a test only sees what it plants. */
function calmBoard(): Tile[][] {
  const letters = ['R', 'S', 'E', 'T']
  return board(Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => letters[(r * 2 + c) % 4]).join(' ')))
}

describe('gravity and refill', () => {
  it('never puts gems into holes or stones (old bug: they were filled after the first fall)', () => {
    for (const lvl of [2, 4]) {
      const config = generateLevel(lvl)
      const b = createInitialBoard(config)
      const hit = b.map(row => row.map(t => ({ ...t })))
      for (let c = 0; c < 8; c++) if (!isBlocked(hit[5][c])) hit[5][c].gem = null
      const { nextBoard } = applyGravityAndRefill(hit, config)
      for (const row of nextBoard) {
        for (const t of row) {
          if (isBlocked(t)) expect(t.gem).toBeNull()
          else expect(t.gem).not.toBeNull()
        }
      }
    }
  })

  it('drops gems through the playable cells of a column, past a stone', () => {
    const b = board(['R S', 'E S', '# S', 'T S'])
    b[3][0].gem = null // the bottom gem in column 0 disappears
    const { nextBoard } = applyGravityAndRefill(b, { gemColors: ['ruby'] }, () => 0)
    expect(nextBoard[3][0].gem).toBe('emerald') // the gem from above the stone lands at the bottom
    expect(nextBoard[2][0].gem).toBeNull() // stone stays empty
    expect(nextBoard[1][0].gem).toBe('ruby') // the top gem shifted down one
    expect(nextBoard[0][0].gem).toBe('ruby') // and a fresh gem entered at the top
  })

  it('gem ids travel with the gems and stay unique (this is what makes animation possible)', () => {
    const b = calmBoard()
    const idOfTop = b[0][3].id
    b[7][3].gem = null
    const { nextBoard } = applyGravityAndRefill(b, { gemColors: ['ruby', 'sapphire'] })
    expect(nextBoard[1][3].id).toBe(idOfTop)
    const ids = nextBoard.flat().filter(t => t.gem).map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(nextBoard[0][3].spawnDrop).toBeGreaterThan(0)
  })
})

describe('ice stays put', () => {
  it('a match on an ice cell clears it; ice next to the match is untouched', () => {
    const b = calmBoard()
    for (const c of [0, 1, 2]) b[0][c].gem = 'ruby'
    b[0][1].obstacle = 'ice'
    b[1][1].obstacle = 'ice' // beside the match, must survive
    const r = findMatches(b)
    expect(r.iceCleared).toBe(1)
    const cleared = clearMatched(b, r)
    expect(cleared[0][1].obstacle).toBe('none')
    expect(cleared[1][1].obstacle).toBe('ice')
  })

  it('double ice needs two hits and only then counts toward the ice goal', () => {
    const b = calmBoard()
    for (const c of [0, 1, 2]) b[0][c].gem = 'ruby'
    b[0][1].obstacle = 'double-ice'
    const first = findMatches(b)
    expect(first.iceCleared).toBe(0)
    const afterFirst = clearMatched(b, first)
    expect(afterFirst[0][1].obstacle).toBe('ice')
    expect(updateGoals([{ type: 'ice', target: 5, current: 0 }], first, 0)[0].current).toBe(0)
  })

  it('breaking a stone is not counted as clearing ice', () => {
    const b = calmBoard()
    for (const c of [0, 1, 2]) b[0][c].gem = 'ruby'
    b[1][1].gem = null
    b[1][1].obstacle = 'stone'
    const r = findMatches(b)
    expect(r.obstacleChanges.some(o => o.from === 'stone')).toBe(true)
    expect(r.iceCleared).toBe(0)
  })

  it('swapTiles never carries ice along with a gem (ice belongs to the cell)', () => {
    const b = calmBoard()
    b[2][2].obstacle = 'ice'
    const swapped = swapTiles(b, 2, 2, 2, 3)
    expect(swapped[2][2].obstacle).toBe('ice')
    expect(swapped[2][3].obstacle).toBe('none')
    expect(swapped[2][2].id).toBe(b[2][3].id)
  })
})

describe('gems on ice are frozen', () => {
  /** row 0 = R R S R ... : swapping (0,2) with (0,3) would line up three rubies. */
  const withPlantedMove = () => {
    const b = calmBoard()
    b[0][0].gem = 'ruby'
    b[0][1].gem = 'ruby'
    b[0][2].gem = 'sapphire'
    b[0][3].gem = 'ruby'
    return b
  }

  it('a normal swap that makes a match is a valid move', () => {
    expect(evaluateSwap(withPlantedMove(), 0, 2, 0, 3)).not.toBeNull()
  })

  it('cannot be swapped, even when the swap would make a match', () => {
    const dragged = withPlantedMove()
    dragged[0][3].obstacle = 'ice'
    expect(evaluateSwap(dragged, 0, 2, 0, 3)).toBeNull()

    const target = withPlantedMove()
    target[0][2].obstacle = 'double-ice'
    expect(evaluateSwap(target, 0, 2, 0, 3)).toBeNull()
    expect(isIceLocked(target[0][2])).toBe(true)
  })

  it('special combos cannot use a frozen gem either', () => {
    const b = calmBoard()
    b[3][3].special = 'prism'
    b[3][3].obstacle = 'ice'
    expect(findCombo(b, 3, 3, 3, 4)).toBeNull()
    expect(evaluateSwap(b, 3, 3, 3, 4)).toBeNull()
  })

  it('no valid move (and so no hint) ever touches an ice cell', () => {
    for (const lvl of [12, 20, 30]) {
      const b = createInitialBoard(generateLevel(lvl))
      for (const { move } of findValidMoves(b)) {
        expect(isIceLocked(b[move.r1][move.c1])).toBe(false)
        expect(isIceLocked(b[move.r2][move.c2])).toBe(false)
      }
    }
  })

  it('but a frozen gem can still be matched, which breaks its ice', () => {
    const b = calmBoard()
    b[0][0].gem = 'ruby'
    b[0][1].gem = 'ruby'
    b[0][1].obstacle = 'ice' // frozen ruby in the middle of the line
    b[0][2].gem = 'sapphire'
    b[1][2].gem = 'ruby'
    // moving free gems only: (0,2) <-> (1,2) drops a ruby next to the frozen one
    const outcome = evaluateSwap(b, 0, 2, 1, 2)
    expect(outcome).not.toBeNull()
    expect(outcome!.iceCleared).toBe(1)
    expect(outcome!.matchedCoords.some(c => c.row === 0 && c.col === 1)).toBe(true)
  })
})

describe('special gems', () => {
  it('prism + gem really clears that colour (old bug: the combo was computed but never applied)', () => {
    const b = calmBoard()
    b[3][3].gem = 'ruby'
    b[3][3].special = 'prism'
    const target = b[3][4].gem!
    const outcome = evaluateSwap(b, 3, 3, 3, 4)
    expect(outcome).not.toBeNull()
    const expected = b.flat().filter(t => t.gem === target).length
    expect(outcome!.gemsClearedByType[target]).toBe(expected)
    const swapped = swapTiles(b, 3, 3, 3, 4)
    const cleared = clearMatched(swapped, outcome!)
    expect(cleared.flat().filter(t => t.gem === target).length).toBe(0)
  })

  it('prism + prism clears the board, bomb + bomb is 5x5, line + line is a cross', () => {
    const p = calmBoard()
    p[3][3].special = 'prism'
    p[3][4].special = 'prism'
    expect(findCombo(p, 3, 3, 3, 4)!.totalGemsCleared).toBe(64)

    const bb = calmBoard()
    bb[3][3].special = 'bomb'
    bb[3][4].special = 'bomb'
    expect(findCombo(bb, 3, 3, 3, 4)!.totalGemsCleared).toBeGreaterThanOrEqual(25)

    const ll = calmBoard()
    ll[3][3].special = 'line-h'
    ll[3][4].special = 'line-v'
    expect(findCombo(ll, 3, 3, 3, 4)!.totalGemsCleared).toBe(15) // 8 + 8 - 1
  })

  it('chain reactions: a line that crosses a bomb sets the bomb off', () => {
    const b = calmBoard()
    for (const c of [0, 1, 2]) b[0][c].gem = 'ruby'
    b[0][2].special = 'line-h' // matched, clears row 0
    b[0][6].special = 'bomb' // sits in that row, should explode 3x3
    const r = findMatches(b)
    const has = (row: number, col: number) => r.matchedCoords.some(c => c.row === row && c.col === col)
    expect(has(0, 7)).toBe(true)
    expect(has(1, 6)).toBe(true) // bomb blast, not part of the row
    expect(has(1, 7)).toBe(true)
  })

  it('a lone special swapped with a plain gem is not a move unless it makes a match', () => {
    const b = calmBoard()
    b[0][0].special = 'line-h'
    expect(evaluateSwap(b, 0, 0, 0, 1)).toBeNull()
  })
})

describe('valid moves and hints', () => {
  it('every move returned really does something', () => {
    const b = createInitialBoard(generateLevel(7))
    const moves = findValidMoves(b)
    expect(moves.length).toBeGreaterThan(0)
    for (const { move, result } of moves) {
      expect(result.matchedCoords.length).toBeGreaterThan(0)
      expect(evaluateSwap(b, move.r1, move.c1, move.r2, move.c2)).not.toBeNull()
    }
  })

  it('a special gem alone does not hide a dead board (no soft-lock) and reshuffle recovers', () => {
    const dead = board(['R S E T', 'E T R S', 'R S E T', 'E T R S'])
    expect(hasValidMove(dead)).toBe(false)
    dead[0][0].special = 'line-h'
    expect(hasValidMove(dead)).toBe(false)
    const fixed = reshuffleBoard(dead, { gemColors: ['ruby', 'sapphire', 'emerald', 'topaz'] })
    expect(findMatches(fixed).matchedCoords.length).toBe(0)
    expect(hasValidMove(fixed)).toBe(true)
    expect(new Set(fixed.flat().map(t => t.id)).size).toBe(16) // same gems, just moved
  })
})

describe('levels', () => {
  it('start boards are deterministic, match-free, playable, and never hold gems in blocked cells', () => {
    for (let lvl = 1; lvl <= 60; lvl++) {
      const config = generateLevel(lvl)
      const a = createInitialBoard(config)
      const b = createInitialBoard(config)
      const sig = (x: Tile[][]) => x.map(row => row.map(t => t.gem ?? '-').join(',')).join('|')
      expect(sig(a)).toBe(sig(b))
      expect(findMatches(a).matchedCoords.length).toBe(0)
      expect(hasValidMove(a)).toBe(true)
      for (const t of a.flat()) if (isBlocked(t)) expect(t.gem).toBeNull()
    }
  })

  it('difficulty keeps growing after level 12 instead of flat-lining', () => {
    const score = (l: number) => generateLevel(l).goals.find(g => g.type === 'score')!.target
    expect(score(30)).toBeGreaterThan(score(12))
    expect(score(50)).toBeGreaterThan(score(30))
  })
})
