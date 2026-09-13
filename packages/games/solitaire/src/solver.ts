import type { CardData, SolitaireState } from './types'
import { canMoveToFoundation, canMoveToTableau } from './logic'

/**
 * Lightweight Klondike solvability checker.
 *
 * Uses bounded iterative DFS with:
 * - Aggressive move pruning (prefer foundation moves, avoid useless King swaps)
 * - Compact state hash for cycle detection
 * - Hard cap on expanded nodes to guarantee <100 ms even for hard deals
 *
 * Returns true if a winning path was found within the budget.
 * Returns false if budget exhausted — treat as "unknown/unsolvable" and re-deal.
 */

const MAX_NODES = 5000

type State = SolitaireState

function stateKey(s: State): string {
  const fKey = s.foundations.map(f => f.length).join(',')
  const tKey = s.tableau
    .map(pile =>
      pile.map(c => (c.faceUp ? `${c.suit[0]}${c.rank}` : 'X')).join('')
    )
    .join('|')
  const wTop = s.waste.length > 0 ? s.waste[s.waste.length - 1].id : '-'
  return `${fKey}:${wTop}:${tKey}`
}

function cloneState(s: State): State {
  return {
    stock: s.stock.map(c => ({ ...c })),
    waste: s.waste.map(c => ({ ...c })),
    foundations: s.foundations.map(f => f.map(c => ({ ...c }))),
    tableau: s.tableau.map(p => p.map(c => ({ ...c }))),
    drawMode: s.drawMode,
    moves: s.moves,
    score: s.score,
    isWon: s.isWon,
  }
}

function expand(s: State): State[] {
  const successors: State[] = []

  // 1. Foundation moves — always highest priority
  if (s.waste.length > 0) {
    const card = s.waste[s.waste.length - 1]
    for (let f = 0; f < 4; f++) {
      if (canMoveToFoundation(card, s.foundations[f])) {
        const ns = cloneState(s)
        ns.foundations[f].push(ns.waste.pop()!)
        successors.push(ns)
      }
    }
  }
  for (let t = 0; t < 7; t++) {
    const pile = s.tableau[t]
    if (pile.length === 0) continue
    const card = pile[pile.length - 1]
    if (!card.faceUp) continue
    for (let f = 0; f < 4; f++) {
      if (canMoveToFoundation(card, s.foundations[f])) {
        const ns = cloneState(s)
        ns.tableau[t].pop()
        ns.foundations[f].push({ ...card })
        if (ns.tableau[t].length > 0) {
          ns.tableau[t][ns.tableau[t].length - 1].faceUp = true
        }
        successors.push(ns)
      }
    }
  }

  // 2. Tableau-to-tableau moves
  for (let from = 0; from < 7; from++) {
    const fromPile = s.tableau[from]
    let firstFaceUp = -1
    for (let i = 0; i < fromPile.length; i++) {
      if (fromPile[i].faceUp) { firstFaceUp = i; break }
    }
    if (firstFaceUp === -1) continue

    for (let idx = firstFaceUp; idx < fromPile.length; idx++) {
      const card = fromPile[idx]
      for (let to = 0; to < 7; to++) {
        if (from === to) continue
        const toPile = s.tableau[to]
        if (card.rank === 13 && idx === 0 && toPile.length === 0) {
          const emptyCount = s.tableau.filter(p => p.length === 0).length
          if (emptyCount > 1) continue
        }
        if (canMoveToTableau(card, toPile)) {
          const ns = cloneState(s)
          const moved = ns.tableau[from].splice(idx)
          ns.tableau[to].push(...moved)
          if (ns.tableau[from].length > 0) {
            ns.tableau[from][ns.tableau[from].length - 1].faceUp = true
          }
          successors.push(ns)
        }
      }
    }
  }

  // 3. Draw from stock / recycle
  if (s.stock.length > 0) {
    const ns = cloneState(s)
    const draw = Math.min(ns.drawMode, ns.stock.length)
    for (let i = 0; i < draw; i++) {
      const card = ns.stock.pop()!
      card.faceUp = true
      ns.waste.push(card)
    }
    successors.push(ns)
  } else if (s.waste.length > 0) {
    const ns = cloneState(s)
    ns.stock = ns.waste.reverse().map(c => ({ ...c, faceUp: false }))
    ns.waste = []
    successors.push(ns)
  }

  // 4. Waste to tableau
  if (s.waste.length > 0) {
    const card = s.waste[s.waste.length - 1]
    for (let to = 0; to < 7; to++) {
      if (canMoveToTableau(card, s.tableau[to])) {
        const ns = cloneState(s)
        const moved = ns.waste.pop()!
        ns.tableau[to].push(moved)
        successors.push(ns)
      }
    }
  }

  return successors
}

function isWon(s: State): boolean {
  return s.foundations.every(f => f.length === 13)
}

export function isSolvable(initialState: State): boolean {
  const stack: State[] = [cloneState(initialState)]
  const visited = new Set<string>()
  visited.add(stateKey(initialState))
  let nodes = 0

  while (stack.length > 0 && nodes < MAX_NODES) {
    const current = stack.pop()!
    nodes++

    if (isWon(current)) return true

    for (const ns of expand(current)) {
      const key = stateKey(ns)
      if (!visited.has(key)) {
        visited.add(key)
        stack.push(ns)
      }
    }
  }

  return false
}
