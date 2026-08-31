import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  MemoryDifficulty,
  MemoryGameMode,
  CardData,
  BestScoreRecord,
} from '../types'
import { createDeck, DIFFICULTY_PAIR_COUNTS } from '../logic'

const DIFFICULTY_KEY = 'allgames:memory:difficulty'
const MODE_KEY = 'allgames:memory:mode'
const BEST_SCORE_KEY_PREFIX = 'allgames:memory:best:'

function loadSavedDifficulty(): MemoryDifficulty {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY)
    if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw
    return 'medium'
  } catch {
    return 'medium'
  }
}

function saveDifficulty(diff: MemoryDifficulty) {
  try {
    localStorage.setItem(DIFFICULTY_KEY, diff)
  } catch {
    // Storage unavailable
  }
}

function loadSavedMode(): MemoryGameMode {
  try {
    const raw = localStorage.getItem(MODE_KEY)
    if (raw === '1p' || raw === '2p') return raw
    return '1p'
  } catch {
    return '1p'
  }
}

function saveMode(mode: MemoryGameMode) {
  try {
    localStorage.setItem(MODE_KEY, mode)
  } catch {
    // Storage unavailable
  }
}

function loadBestScore(diff: MemoryDifficulty): BestScoreRecord | null {
  try {
    const raw = localStorage.getItem(`${BEST_SCORE_KEY_PREFIX}${diff}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveBestScore(diff: MemoryDifficulty, record: BestScoreRecord) {
  try {
    localStorage.setItem(`${BEST_SCORE_KEY_PREFIX}${diff}`, JSON.stringify(record))
  } catch {
    // Storage unavailable
  }
}

export function useMemory(options?: { isEink?: boolean }) {
  const isEink = options?.isEink ?? false

  const [difficulty, setDifficultyState] = useState<MemoryDifficulty>(loadSavedDifficulty)
  const [mode, setModeState] = useState<MemoryGameMode>(loadSavedMode)

  const [cards, setCards] = useState<CardData[]>(() => createDeck(difficulty))
  const [flippedIds, setFlippedIds] = useState<string[]>([])
  const [isEvaluating, setIsEvaluating] = useState(false)

  const [moves, setMoves] = useState(0)
  const [matchedPairsCount, setMatchedPairsCount] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'ended'>('idle')

  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1')
  const [scores, setScores] = useState({ p1: 0, p2: 0 })

  const [bestScore, setBestScore] = useState<BestScoreRecord | null>(() => loadBestScore(difficulty))

  const totalPairs = DIFFICULTY_PAIR_COUNTS[difficulty]
  const timerRef = useRef<number | null>(null)

  // Timer effect
  useEffect(() => {
    if (gameStatus === 'playing') {
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
  }, [gameStatus])

  const resetGame = useCallback(
    (newDiff?: MemoryDifficulty, newMode?: MemoryGameMode) => {
      const diffToUse = newDiff ?? difficulty
      const modeToUse = newMode ?? mode

      setCards(createDeck(diffToUse))
      setFlippedIds([])
      setIsEvaluating(false)
      setMoves(0)
      setMatchedPairsCount(0)
      setElapsedSeconds(0)
      setGameStatus('idle')
      setCurrentTurn('p1')
      setScores({ p1: 0, p2: 0 })
      setBestScore(loadBestScore(diffToUse))
    },
    [difficulty, mode]
  )

  const setDifficulty = useCallback(
    (d: MemoryDifficulty) => {
      setDifficultyState(d)
      saveDifficulty(d)
      resetGame(d, mode)
    },
    [mode, resetGame]
  )

  const changeMode = useCallback(
    (m: MemoryGameMode) => {
      setModeState(m)
      saveMode(m)
      resetGame(difficulty, m)
    },
    [difficulty, resetGame]
  )

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (gameStatus === 'ended' || isEvaluating) return

      const card = cards.find(c => c.id === cardId)
      if (!card || card.isFlipped || card.isMatched) return

      // Start timer on first card click
      if (gameStatus === 'idle') {
        setGameStatus('playing')
      }

      if (flippedIds.length === 0) {
        // First card flipped
        setCards(prev =>
          prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
        )
        setFlippedIds([cardId])
      } else if (flippedIds.length === 1) {
        // Second card flipped
        const firstCardId = flippedIds[0]
        const firstCard = cards.find(c => c.id === firstCardId)!

        const isMatch = firstCard.symbolId === card.symbolId

        setCards(prev =>
          prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
        )
        setFlippedIds([firstCardId, cardId])
        setMoves(m => m + 1)

        if (isMatch) {
          // Matched!
          setTimeout(() => {
            setCards(prev =>
              prev.map(c =>
                c.id === firstCardId || c.id === cardId
                  ? { ...c, isMatched: true }
                  : c
              )
            )
            setFlippedIds([])

            const nextMatchedCount = matchedPairsCount + 1
            setMatchedPairsCount(nextMatchedCount)

            if (mode === '2p') {
              setScores(prev => ({
                ...prev,
                [currentTurn]: prev[currentTurn] + 1,
              }))
            }

            // Check if all pairs matched
            if (nextMatchedCount === totalPairs) {
              setGameStatus('ended')

              if (mode === '1p') {
                setElapsedSeconds(time => {
                  const finalMoves = moves + 1
                  const currentBest = loadBestScore(difficulty)
                  const isNewBest =
                    currentBest === null ||
                    finalMoves < currentBest.moves ||
                    (finalMoves === currentBest.moves && time < currentBest.time)

                  if (isNewBest) {
                    const record = { moves: finalMoves, time }
                    saveBestScore(difficulty, record)
                    setBestScore(record)
                  }
                  return time
                })
              }
            }
          }, isEink ? 100 : 350)
        } else {
          // Mismatch — wait to let player memorize, then flip back
          setIsEvaluating(true)
          setTimeout(() => {
            setCards(prev =>
              prev.map(c =>
                c.id === firstCardId || c.id === cardId
                  ? { ...c, isFlipped: false }
                  : c
              )
            )
            setFlippedIds([])
            setIsEvaluating(false)

            if (mode === '2p') {
              setCurrentTurn(prev => (prev === 'p1' ? 'p2' : 'p1'))
            }
          }, isEink ? 450 : 850)
        }
      }
    },
    [cards, flippedIds, gameStatus, isEvaluating, matchedPairsCount, mode, currentTurn, totalPairs, moves, difficulty, isEink]
  )

  const resetBest = useCallback(() => {
    try {
      localStorage.removeItem(`${BEST_SCORE_KEY_PREFIX}${difficulty}`)
      setBestScore(null)
    } catch {
      // Storage unavailable
    }
  }, [difficulty])

  return {
    cards,
    difficulty,
    mode,
    moves,
    matchedPairsCount,
    totalPairs,
    elapsedSeconds,
    currentTurn,
    scores,
    gameStatus,
    bestScore,
    handleCardClick,
    resetGame,
    setDifficulty,
    changeMode,
    resetBest,
  }
}
