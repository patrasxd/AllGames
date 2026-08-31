import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  MinesweeperDifficulty,
  MinesweeperBoardState,
  GameStatus,
  TouchInteractionMode,
} from '../types'
import {
  DIFFICULTY_CONFIGS,
  createEmptyBoard,
  populateMines,
  revealCell,
  toggleFlag,
  chordReveal,
  countFlags,
} from '../logic'

const DIFFICULTY_KEY = 'allgames:minesweeper:difficulty'
const BEST_TIME_KEY_PREFIX = 'allgames:minesweeper:best-time:'

function loadSavedDifficulty(): MinesweeperDifficulty {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY)
    if (raw === 'beginner' || raw === 'intermediate' || raw === 'expert') {
      return raw
    }
    return 'beginner'
  } catch {
    return 'beginner'
  }
}

function saveDifficulty(diff: MinesweeperDifficulty) {
  try {
    localStorage.setItem(DIFFICULTY_KEY, diff)
  } catch {
    // Storage unavailable
  }
}

function loadBestTime(diff: MinesweeperDifficulty): number | null {
  try {
    const raw = localStorage.getItem(`${BEST_TIME_KEY_PREFIX}${diff}`)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

function saveBestTime(diff: MinesweeperDifficulty, timeSeconds: number) {
  try {
    localStorage.setItem(`${BEST_TIME_KEY_PREFIX}${diff}`, String(timeSeconds))
  } catch {
    // Storage unavailable
  }
}

export function useMinesweeper(options?: { isEink?: boolean }) {
  const [difficulty, setDifficultyState] = useState<MinesweeperDifficulty>(loadSavedDifficulty)
  const config = DIFFICULTY_CONFIGS[difficulty]

  const [board, setBoard] = useState<MinesweeperBoardState>(() =>
    createEmptyBoard(config.rows, config.cols)
  )
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isFaceShocked, setIsFaceShocked] = useState(false)
  const [touchMode, setTouchMode] = useState<TouchInteractionMode>('reveal')

  const [bestTime, setBestTime] = useState<number | null>(() => loadBestTime(difficulty))

  const isInitializedRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  const flagsCount = countFlags(board)
  const remainingMines = Math.max(0, config.mines - flagsCount)

  // Timer interval effect
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

  // Reset Game
  const resetGame = useCallback(
    (newDiff?: MinesweeperDifficulty) => {
      const diffToUse = newDiff ?? difficulty
      const newConfig = DIFFICULTY_CONFIGS[diffToUse]

      isInitializedRef.current = false
      setBoard(createEmptyBoard(newConfig.rows, newConfig.cols))
      setGameStatus('idle')
      setElapsedSeconds(0)
      setIsFaceShocked(false)
      setBestTime(loadBestTime(diffToUse))
    },
    [difficulty]
  )

  const setDifficulty = useCallback(
    (d: MinesweeperDifficulty) => {
      setDifficultyState(d)
      saveDifficulty(d)
      resetGame(d)
    },
    [resetGame]
  )

  // Primary Action (Left click / tap)
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameStatus === 'won' || gameStatus === 'lost') return

      const cell = board[row][col]

      // If mobile mode is 'flag', toggle flag instead
      if (touchMode === 'flag') {
        if (!cell.isRevealed) {
          setBoard(prev => toggleFlag(prev, row, col))
        }
        return
      }

      if (cell.isFlagged) return

      let activeBoard = board

      // Safe first click generation
      if (!isInitializedRef.current) {
        activeBoard = populateMines(board, row, col, config.mines)
        isInitializedRef.current = true
        setGameStatus('playing')
      }

      // If already revealed with numbers, perform chord reveal
      if (cell.isRevealed) {
        if (cell.neighborMines > 0) {
          const res = chordReveal(activeBoard, row, col)
          setBoard(res.nextBoard)
          if (res.status === 'lost') {
            setGameStatus('lost')
          } else if (res.status === 'won') {
            setGameStatus('won')
            setElapsedSeconds(currentSec => {
              const currentBest = loadBestTime(difficulty)
              if (currentBest === null || currentSec < currentBest) {
                saveBestTime(difficulty, currentSec)
                setBestTime(currentSec)
              }
              return currentSec
            })
          }
        }
        return
      }

      const res = revealCell(activeBoard, row, col)
      setBoard(res.nextBoard)

      if (res.status === 'lost') {
        setGameStatus('lost')
      } else if (res.status === 'won') {
        setGameStatus('won')
        setElapsedSeconds(currentSec => {
          const currentBest = loadBestTime(difficulty)
          if (currentBest === null || currentSec < currentBest) {
            saveBestTime(difficulty, currentSec)
            setBestTime(currentSec)
          }
          return currentSec
        })
      }
    },
    [board, gameStatus, touchMode, config.mines, difficulty]
  )

  // Right Click (Flagging)
  const handleCellContextMenu = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault()
      if (gameStatus === 'won' || gameStatus === 'lost') return
      const cell = board[row][col]
      if (cell.isRevealed) return

      setBoard(prev => toggleFlag(prev, row, col))
    },
    [board, gameStatus]
  )

  const handleCellMouseDown = useCallback(() => {
    if (gameStatus !== 'won' && gameStatus !== 'lost') {
      setIsFaceShocked(true)
    }
  }, [gameStatus])

  const handleCellMouseUp = useCallback(() => {
    setIsFaceShocked(false)
  }, [])

  const resetBestTime = useCallback(() => {
    try {
      localStorage.removeItem(`${BEST_TIME_KEY_PREFIX}${difficulty}`)
      setBestTime(null)
    } catch {
      // Storage unavailable
    }
  }, [difficulty])

  return {
    board,
    difficulty,
    config,
    gameStatus,
    elapsedSeconds,
    remainingMines,
    bestTime,
    isFaceShocked,
    touchMode,
    setTouchMode,
    handleCellClick,
    handleCellContextMenu,
    handleCellMouseDown,
    handleCellMouseUp,
    resetGame,
    setDifficulty,
    resetBestTime,
  }
}
