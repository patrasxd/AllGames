import type { Tube } from '../types'
import { canPour, isSolved, pour, topRun } from './engine'

function stateKey(tubes: Tube[]): string {
  return tubes.map((t) => t.join('.')).join('|')
}

/** Lower is more promising: counts, for each color, how many different tubes it's spread across
 * beyond the one it needs (0 once every color is fully gathered). Cheap and a decent guide. */
function heuristic(tubes: Tube[]): number {
  const tubesByColor = new Map<string, Set<number>>()
  tubes.forEach((tube, i) => {
    for (const color of tube) {
      if (!tubesByColor.has(color)) tubesByColor.set(color, new Set())
      tubesByColor.get(color)!.add(i)
    }
  })
  let cost = 0
  for (const tubeSet of tubesByColor.values()) cost += tubeSet.size - 1
  return cost
}

export interface SolveOptions {
  maxNodes?: number
}

interface SearchNode {
  tubes: Tube[]
  depth: number
  path: { from: number; to: number }[]
}

function nodeScore(node: SearchNode): number {
  return heuristic(node.tubes) + node.depth * 0.15
}

function search(tubes: Tube[], capacity: number, maxNodes: number): { from: number; to: number }[] | null {
  if (isSolved(tubes)) return []

  const visited = new Set<string>([stateKey(tubes)])
  let frontier: SearchNode[] = [{ tubes, depth: 0, path: [] }]
  let expanded = 0

  while (frontier.length > 0 && expanded < maxNodes) {
    frontier.sort((a, b) => nodeScore(a) - nodeScore(b))
    const next: SearchNode[] = []

    for (const node of frontier) {
      if (expanded >= maxNodes) break
      expanded++

      for (let from = 0; from < node.tubes.length; from++) {
        if (!topRun(node.tubes[from])) continue
        for (let to = 0; to < node.tubes.length; to++) {
          if (!canPour(node.tubes, from, to, capacity)) continue
          const result = pour(node.tubes, from, to, capacity)!
          const key = stateKey(result.tubes)
          if (visited.has(key)) continue
          visited.add(key)
          const path = [...node.path, { from, to }]
          if (isSolved(result.tubes)) return path
          next.push({ tubes: result.tubes, depth: node.depth + 1, path })
        }
      }
    }

    next.sort((a, b) => nodeScore(a) - nodeScore(b))
    frontier = next.slice(0, 400)
  }

  return null
}

/**
 * Best-first search over the real pour()/canPour() move graph — the exact mechanic the player
 * uses. Not exhaustive (bounded by maxNodes), but with the heuristic above it finds a solution
 * for these boards almost immediately when one exists; returns false only once the budget is
 * exhausted, which for a genuinely-solvable board practically never happens within the budget
 * used here.
 */
export function isSolvable(tubes: Tube[], capacity: number, options: SolveOptions = {}): boolean {
  return search(tubes, capacity, options.maxNodes ?? 60000) !== null
}

/** Same search as isSolvable, but returns an actual solving move sequence (or null). Used by
 * tests to drive a real playthrough rather than just asserting a solution exists. */
export function findSolution(
  tubes: Tube[],
  capacity: number,
  options: SolveOptions = {},
): { from: number; to: number }[] | null {
  return search(tubes, capacity, options.maxNodes ?? 60000)
}
