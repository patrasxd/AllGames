import { useState, useEffect, useCallback, useRef } from 'react'
import type { SolitaireState, DrawMode, CardLocation, CardData } from '../types'
import {
  dealNewGame,
  canMoveToFoundation,
  canMoveToTableau,
  checkWinCondition,
  isEligibleForAutoComplete,
  findAutoFoundationMove,
  findHintMove,
} from '../logic'

const DRAW_MODE_KEY = 'allgames:solitaire:draw-mode'
const BEST_SCORE_KEY = 'allgames:solitaire:best-score'

function loadDrawMode(): DrawMode {
  try {
    const raw = localStorage.getItem(DRAW_MODE_KEY)
    return raw === '3' ? 3 : 1
  } catch {
    return 1
  }
}

function saveDrawMode(mode: DrawMode) {
  try {
    localStorage.setItem(DRAW_MODE_KEY, String(mode))
  } catch {
    // Storage unavailable
  }
}

function loadBestScore(): number | null {
  try {
    const raw = localStorage.getItem(BEST_SCORE_KEY)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

function saveBestScore(score: number) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score))
  } catch {
    // Storage unavailable
  }
}

function cloneState(state: SolitaireState): SolitaireState {
  return {
    stock: state.stock.map(c => ({ ...c })),
    waste: state.waste.map(c => ({ ...c })),
    foundations: state.foundations.map(pile => pile.map(c => ({ ...c }))),
    tableau: state.tableau.map(pile => pile.map(c => ({ ...c }))),
    drawMode: state.drawMode,
    moves: state.moves,
    score: state.score,
    isWon: state.isWon,
  }
}

export function useSolitaire(options?: { isEink?: boolean }) {
  const isEink = options?.isEink ?? false

  const [drawMode, setDrawModeState] = useState<DrawMode>(loadDrawMode)
  const [state, setState] = useState<SolitaireState>(() => dealNewGame(drawMode))
  const [selectedLocation, setSelectedLocation] = useState<CardLocation | null>(null)
  const [hint, setHint] = useState<{ from: CardLocation; to: CardLocation } | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [bestScore, setBestScore] = useState<number | null>(loadBestScore)

  const historyRef = useRef<SolitaireState[]>([])
  const timerRef = useRef<number | null>(null)

  // Timer
  useEffect(() => {
    if (!state.isWon && (state.moves > 0 || state.waste.length > 0)) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(s => s + 1)
      }, 1000)
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state.isWon, state.moves, state.waste.length])

  const resetGame = useCallback(
    (newMode?: DrawMode) => {
      const mode = newMode ?? drawMode
      setState(dealNewGame(mode))
      setSelectedLocation(null)
      setHint(null)
      setElapsedSeconds(0)
      historyRef.current = []
      setBestScore(loadBestScore())
    },
    [drawMode]
  )

  const setDrawMode = useCallback(
    (m: DrawMode) => {
      setDrawModeState(m)
      saveDrawMode(m)
      resetGame(m)
    },
    [resetGame]
  )

  const pushHistory = (currentState: SolitaireState) => {
    historyRef.current.push(cloneState(currentState))
    if (historyRef.current.length > 50) {
      historyRef.current.shift()
    }
  }

  // Draw from stock to waste (or recycle waste to stock)
  const handleStockClick = useCallback(() => {
    if (state.isWon) return
    setHint(null)
    setSelectedLocation(null)
    pushHistory(state)

    setState(prev => {
      const next = cloneState(prev)

      if (next.stock.length === 0) {
        // Recycle waste to stock
        if (next.waste.length === 0) return prev
        next.stock = next.waste.reverse().map(c => ({ ...c, faceUp: false }))
        next.waste = []
        next.moves += 1
        next.score = Math.max(0, next.score - 20) // Recycle penalty
      } else {
        // Draw cards
        const count = Math.min(next.drawMode, next.stock.length)
        const drawn = next.stock.splice(next.stock.length - count, count).reverse()
        for (const card of drawn) {
          card.faceUp = true
          next.waste.push(card)
        }
        next.moves += 1
      }

      return next
    })
  }, [state])

  // Try move to foundation (via double click or auto-move)
  const handleAutoMoveToFoundation = useCallback(
    (loc: CardLocation) => {
      if (state.isWon) return

      let cardToMove: CardData | null = null
      if (loc.type === 'waste') {
        if (state.waste.length > 0) {
          cardToMove = state.waste[state.waste.length - 1]
        }
      } else if (loc.type === 'tableau' && loc.pileIndex !== undefined && loc.cardIndex !== undefined) {
        const pile = state.tableau[loc.pileIndex]
        if (loc.cardIndex === pile.length - 1) {
          cardToMove = pile[pile.length - 1]
        }
      }

      if (!cardToMove || !cardToMove.faceUp) return

      // Find eligible foundation
      for (let f = 0; f < 4; f++) {
        if (canMoveToFoundation(cardToMove, state.foundations[f])) {
          setHint(null)
          setSelectedLocation(null)
          pushHistory(state)

          setState(prev => {
            const next = cloneState(prev)
            if (loc.type === 'waste') {
              const c = next.waste.pop()!
              next.foundations[f].push(c)
              next.score += 10
            } else if (loc.type === 'tableau' && loc.pileIndex !== undefined) {
              const pile = next.tableau[loc.pileIndex]
              const c = pile.pop()!
              if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
                pile[pile.length - 1].faceUp = true
                next.score += 5 // Reveal face down card bonus
              }
              next.foundations[f].push(c)
              next.score += 10
            }

            next.moves += 1
            if (checkWinCondition(next.foundations)) {
              next.isWon = true
              const finalScore = next.score
              const currentBest = loadBestScore()
              if (currentBest === null || finalScore > currentBest) {
                saveBestScore(finalScore)
                setBestScore(finalScore)
              }
            }
            return next
          })
          return
        }
      }
    },
    [state]
  )

  // Handle manual move (from selectedLocation to target)
  const handleMove = useCallback(
    (from: CardLocation, to: CardLocation) => {
      if (state.isWon) return

      let movingCards: CardData[] = []

      // Get moving cards
      if (from.type === 'waste') {
        if (state.waste.length === 0) return
        movingCards = [state.waste[state.waste.length - 1]]
      } else if (from.type === 'foundation' && from.pileIndex !== undefined) {
        const fPile = state.foundations[from.pileIndex]
        if (fPile.length === 0) return
        movingCards = [fPile[fPile.length - 1]]
      } else if (from.type === 'tableau' && from.pileIndex !== undefined && from.cardIndex !== undefined) {
        const tPile = state.tableau[from.pileIndex]
        movingCards = tPile.slice(from.cardIndex)
      }

      if (movingCards.length === 0 || !movingCards[0].faceUp) return

      // Validate destination
      let isValid = false
      if (to.type === 'foundation' && to.pileIndex !== undefined) {
        if (movingCards.length === 1) {
          isValid = canMoveToFoundation(movingCards[0], state.foundations[to.pileIndex])
        }
      } else if (to.type === 'tableau' && to.pileIndex !== undefined) {
        isValid = canMoveToTableau(movingCards[0], state.tableau[to.pileIndex])
      }

      if (!isValid) {
        setSelectedLocation(null)
        return
      }

      // Execute move
      setHint(null)
      setSelectedLocation(null)
      pushHistory(state)

      setState(prev => {
        const next = cloneState(prev)

        // Remove from source
        if (from.type === 'waste') {
          next.waste.pop()
        } else if (from.type === 'foundation' && from.pileIndex !== undefined) {
          next.foundations[from.pileIndex].pop()
          next.score = Math.max(0, next.score - 15) // Removing from foundation penalty
        } else if (from.type === 'tableau' && from.pileIndex !== undefined && from.cardIndex !== undefined) {
          const pile = next.tableau[from.pileIndex]
          pile.splice(from.cardIndex, movingCards.length)
          if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
            pile[pile.length - 1].faceUp = true
            next.score += 5
          }
        }

        // Add to destination
        if (to.type === 'foundation' && to.pileIndex !== undefined) {
          next.foundations[to.pileIndex].push(movingCards[0])
          next.score += 10
        } else if (to.type === 'tableau' && to.pileIndex !== undefined) {
          next.tableau[to.pileIndex].push(...movingCards)
          if (from.type === 'waste') next.score += 5
        }

        next.moves += 1
        if (checkWinCondition(next.foundations)) {
          next.isWon = true
          const finalScore = next.score
          const currentBest = loadBestScore()
          if (currentBest === null || finalScore > currentBest) {
            saveBestScore(finalScore)
            setBestScore(finalScore)
          }
        }

        return next
      })
    },
    [state]
  )

  // Card click / selection handler
  const handleCardClick = useCallback(
    (loc: CardLocation) => {
      if (state.isWon) return
      setHint(null)

      if (!selectedLocation) {
        // Select this card if valid
        if (loc.type === 'waste' && state.waste.length > 0) {
          setSelectedLocation(loc)
        } else if (loc.type === 'foundation' && loc.pileIndex !== undefined) {
          if (state.foundations[loc.pileIndex].length > 0) {
            setSelectedLocation(loc)
          }
        } else if (loc.type === 'tableau' && loc.pileIndex !== undefined && loc.cardIndex !== undefined) {
          const card = state.tableau[loc.pileIndex][loc.cardIndex]
          if (card && card.faceUp) {
            setSelectedLocation(loc)
          }
        }
      } else {
        // If clicking the exact same card, deselect
        if (
          selectedLocation.type === loc.type &&
          selectedLocation.pileIndex === loc.pileIndex &&
          selectedLocation.cardIndex === loc.cardIndex
        ) {
          setSelectedLocation(null)
          return
        }

        // Try moving from selected to this target
        handleMove(selectedLocation, loc)
      }
    },
    [state, selectedLocation, handleMove]
  )

  // Undo move
  const handleUndo = useCallback(() => {
    if (state.isWon || historyRef.current.length === 0) return
    const prev = historyRef.current.pop()!
    setState(prev)
    setSelectedLocation(null)
    setHint(null)
  }, [state.isWon])

  // Hint
  const handleHint = useCallback(() => {
    if (state.isWon) return
    const hintMove = findHintMove(state)
    if (hintMove) {
      setHint(hintMove)
      setSelectedLocation(hintMove.from)
    }
  }, [state])

  // Auto-Finish (fly cards to foundation)
  const handleAutoComplete = useCallback(() => {
    if (!isEligibleForAutoComplete(state) || state.isWon) return

    const interval = window.setInterval(() => {
      setState(curr => {
        const found = findAutoFoundationMove(curr)
        if (!found) {
          clearInterval(interval)
          return curr
        }

        const next = cloneState(curr)
        if (found.from.type === 'tableau' && found.from.pileIndex !== undefined) {
          const c = next.tableau[found.from.pileIndex].pop()!
          next.foundations[found.foundationIndex].push(c)
        }
        next.moves += 1
        next.score += 10

        if (checkWinCondition(next.foundations)) {
          next.isWon = true
          clearInterval(interval)
          const finalScore = next.score
          const currentBest = loadBestScore()
          if (currentBest === null || finalScore > currentBest) {
            saveBestScore(finalScore)
            setBestScore(finalScore)
          }
        }
        return next
      })
    }, isEink ? 50 : 120)
  }, [state, isEink])

  const resetBest = useCallback(() => {
    try {
      localStorage.removeItem(BEST_SCORE_KEY)
      setBestScore(null)
    } catch {
      // Storage unavailable
    }
  }, [])

  return {
    state,
    drawMode,
    selectedLocation,
    hint,
    elapsedSeconds,
    bestScore,
    isEligibleForAutoFinish: isEligibleForAutoComplete(state),
    handleStockClick,
    handleCardClick,
    handleAutoMoveToFoundation,
    handleMove,
    handleUndo,
    handleHint,
    handleAutoComplete,
    resetGame,
    setDrawMode,
    resetBest,
  }
}
