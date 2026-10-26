import type { Point, Rope } from '../types'
import { hasConflict, hasPegCollision, isEndFree } from './engine'

/** Search budget: boards bigger than this are left to the generator's own upper bound. */
export const MAX_SOLVER_STATES = 25_000
export const MAX_SOLVER_SLOTS = 12

/** Ropes have layers, so which rope sits where matters: the key follows the ropes in id order. */
function stateKey(pairs: number[][]): string {
  return pairs.map(([a, b]) => (a < b ? a * 64 + b : b * 64 + a)).join(',')
}

/**
 * Breadth-first search for the fewest moves that untangle the ropes, using the real move rules. Returns `null` when the board
 * is too big for the budget or no solution was found within it. With a `clearance`, moves that would run a rope
 * through another rope's peg are not allowed, exactly as in play.
 */
export function solveMinMoves(
  slots: Point[],
  ropes: Rope[],
  maxStates = MAX_SOLVER_STATES,
  maxDepth = Infinity,
  clearance = 0,
): number | null {
  if (slots.length > MAX_SOLVER_SLOTS) return null

  const toRopes = (pairs: number[][]): Rope[] => pairs.map(([a, b], id) => ({ id, a, b }))
  const start = ropes.map((r) => [r.a, r.b])
  if (!hasConflict(slots, toRopes(start))) return 0

  const seen = new Set<string>([stateKey(start)])
  let frontier: number[][][] = [start]

  for (let depth = 1; frontier.length > 0 && depth <= maxDepth; depth++) {
    const next: number[][][] = []
    for (const state of frontier) {
      const parent = toRopes(state)
      const occupied = new Set<number>()
      for (const [a, b] of state) {
        occupied.add(a)
        occupied.add(b)
      }
      const empty: number[] = []
      for (let s = 0; s < slots.length; s++) if (!occupied.has(s)) empty.push(s)

      for (let r = 0; r < state.length; r++) {
        for (let end = 0; end < 2; end++) {
          if (!isEndFree(slots, parent, r, end === 0 ? 'a' : 'b')) continue
          for (const target of empty) {
            const child = state.map((pair) => pair.slice())
            child[r][end] = target
            const key = stateKey(child)
            if (seen.has(key)) continue
            if (clearance > 0 && hasPegCollision(slots, toRopes(child), clearance)) continue
            if (!hasConflict(slots, toRopes(child))) return depth
            seen.add(key)
            if (seen.size > maxStates) return null
            next.push(child)
          }
        }
      }
    }
    frontier = next
  }
  return null
}
