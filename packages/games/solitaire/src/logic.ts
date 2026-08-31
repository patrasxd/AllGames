import type { CardData, SolitaireState, DrawMode, CardLocation } from './types'
import { createDeck, shuffleDeck } from './cards'

export function dealNewGame(drawMode: DrawMode = 1): SolitaireState {
  const deck = shuffleDeck(createDeck())
  const tableau: CardData[][] = Array.from({ length: 7 }, () => [])

  let cardIndex = 0
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[cardIndex++]
      card.faceUp = row === col
      tableau[col].push(card)
    }
  }

  const stock = deck.slice(cardIndex).map(c => ({ ...c, faceUp: false }))

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    drawMode,
    moves: 0,
    score: 0,
    isWon: false,
  }
}

export function canMoveToFoundation(card: CardData, foundation: CardData[]): boolean {
  if (foundation.length === 0) {
    return card.rank === 1
  }
  const top = foundation[foundation.length - 1]
  return card.suit === top.suit && card.rank === top.rank + 1
}

export function canMoveToTableau(movingFirstCard: CardData, tableauPile: CardData[]): boolean {
  if (tableauPile.length === 0) {
    return movingFirstCard.rank === 13 // Only Kings on empty columns
  }
  const top = tableauPile[tableauPile.length - 1]
  if (!top.faceUp) return false
  return movingFirstCard.color !== top.color && movingFirstCard.rank === top.rank - 1
}

export function checkWinCondition(foundations: CardData[][]): boolean {
  return foundations.every(f => f.length === 13)
}

export function isEligibleForAutoComplete(state: SolitaireState): boolean {
  if (state.stock.length > 0 || state.waste.length > 0) return false
  for (const pile of state.tableau) {
    for (const card of pile) {
      if (!card.faceUp) return false
    }
  }
  return true
}

export function findAutoFoundationMove(state: SolitaireState): {
  from: CardLocation
  foundationIndex: number
} | null {
  // Check waste top
  if (state.waste.length > 0) {
    const topWaste = state.waste[state.waste.length - 1]
    for (let f = 0; f < 4; f++) {
      if (canMoveToFoundation(topWaste, state.foundations[f])) {
        return {
          from: { type: 'waste', cardIndex: state.waste.length - 1 },
          foundationIndex: f,
        }
      }
    }
  }

  // Check tableau tops
  for (let t = 0; t < 7; t++) {
    const pile = state.tableau[t]
    if (pile.length > 0) {
      const topTableau = pile[pile.length - 1]
      if (topTableau.faceUp) {
        for (let f = 0; f < 4; f++) {
          if (canMoveToFoundation(topTableau, state.foundations[f])) {
            return {
              from: { type: 'tableau', pileIndex: t, cardIndex: pile.length - 1 },
              foundationIndex: f,
            }
          }
        }
      }
    }
  }

  return null
}

export function findHintMove(state: SolitaireState): {
  from: CardLocation
  to: CardLocation
} | null {
  // 1. Check foundation moves first
  const foundMove = findAutoFoundationMove(state)
  if (foundMove) {
    return {
      from: foundMove.from,
      to: { type: 'foundation', pileIndex: foundMove.foundationIndex },
    }
  }

  // 2. Check tableau-to-tableau moves
  for (let fromT = 0; fromT < 7; fromT++) {
    const fromPile = state.tableau[fromT]
    for (let idx = 0; idx < fromPile.length; idx++) {
      const card = fromPile[idx]
      if (card.faceUp) {
        // Check if moving this card/sub-stack to another tableau pile is valid
        for (let toT = 0; toT < 7; toT++) {
          if (fromT === toT) continue
          const toPile = state.tableau[toT]

          // Avoid useless King moves between empty columns
          if (card.rank === 13 && idx === 0 && toPile.length === 0) continue

          if (canMoveToTableau(card, toPile)) {
            return {
              from: { type: 'tableau', pileIndex: fromT, cardIndex: idx },
              to: { type: 'tableau', pileIndex: toT },
            }
          }
        }
      }
    }
  }

  // 3. Check waste-to-tableau
  if (state.waste.length > 0) {
    const wasteCard = state.waste[state.waste.length - 1]
    for (let toT = 0; toT < 7; toT++) {
      const toPile = state.tableau[toT]
      if (canMoveToTableau(wasteCard, toPile)) {
        return {
          from: { type: 'waste', cardIndex: state.waste.length - 1 },
          to: { type: 'tableau', pileIndex: toT },
        }
      }
    }
  }

  return null
}
