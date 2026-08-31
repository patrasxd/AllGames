import { useState, useEffect, useCallback, useRef } from 'react'
import type { GridSize, TileData, Direction, Game2048Status } from '../types'
import {
  createInitialTiles,
  createRandomTile,
  moveTiles,
  hasMovesAvailable,
  hasReached2048,
} from '../logic'

const GRID_SIZE_KEY = 'allgames:2048:grid-size'
const BEST_SCORE_KEY_PREFIX = 'allgames:2048:best-score:'

function loadGridSize(): GridSize {
  try {
    const raw = localStorage.getItem(GRID_SIZE_KEY)
    if (raw === '3' || raw === '4' || raw === '5') {
      return Number(raw) as GridSize
    }
    return 4
  } catch {
    return 4
  }
}

function saveGridSize(size: GridSize) {
  try {
    localStorage.setItem(GRID_SIZE_KEY, String(size))
  } catch {
    // Storage unavailable
  }
}

function loadBestScore(size: GridSize): number {
  try {
    const raw = localStorage.getItem(`${BEST_SCORE_KEY_PREFIX}${size}`)
    return raw ? Number(raw) : 0
  } catch {
    return 0
  }
}

function saveBestScore(size: GridSize, score: number) {
  try {
    localStorage.setItem(`${BEST_SCORE_KEY_PREFIX}${size}`, String(score))
  } catch {
    // Storage unavailable
  }
}

interface HistoryState {
  tiles: TileData[]
  score: number
}

export function use2048(options?: { isEink?: boolean }) {
  const [gridSize, setGridSizeState] = useState<GridSize>(loadGridSize)
  const [tiles, setTiles] = useState<TileData[]>(() => createInitialTiles(gridSize))
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState<number>(() => loadBestScore(gridSize))
  const [gameStatus, setGameStatus] = useState<Game2048Status>('playing')
  const [hasDismissedWin, setHasDismissedWin] = useState(false)

  const [history, setHistory] = useState<HistoryState | null>(null)

  const isMovingRef = useRef(false)

  const resetGame = useCallback(
    (newSize?: GridSize) => {
      const sizeToUse = newSize ?? gridSize
      setTiles(createInitialTiles(sizeToUse))
      setScore(0)
      setGameStatus('playing')
      setHasDismissedWin(false)
      setHistory(null)
      setBestScore(loadBestScore(sizeToUse))
      isMovingRef.current = false
    },
    [gridSize]
  )

  const setGridSize = useCallback(
    (size: GridSize) => {
      setGridSizeState(size)
      saveGridSize(size)
      resetGame(size)
    },
    [resetGame]
  )

  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameStatus === 'lost' || isMovingRef.current) return

      const { tiles: nextTiles, scoreGained, moved } = moveTiles(tiles, direction, gridSize)
      if (!moved) return

      isMovingRef.current = true

      // Save previous state for undo
      setHistory({ tiles, score })

      const newScore = score + scoreGained
      setScore(newScore)

      if (newScore > bestScore) {
        setBestScore(newScore)
        saveBestScore(gridSize, newScore)
      }

      // Add new random tile
      const newTile = createRandomTile(nextTiles, gridSize)
      const finalTiles = newTile ? [...nextTiles, newTile] : nextTiles
      setTiles(finalTiles)

      // Check win
      if (!hasDismissedWin && hasReached2048(finalTiles)) {
        setGameStatus('won')
      } else if (!hasMovesAvailable(finalTiles, gridSize)) {
        setGameStatus('lost')
      }

      setTimeout(() => {
        isMovingRef.current = false
      }, 100)
    },
    [tiles, score, bestScore, gridSize, gameStatus, hasDismissedWin]
  )

  const undoMove = useCallback(() => {
    if (!history) return
    setTiles(history.tiles)
    setScore(history.score)
    setHistory(null)
    setGameStatus('playing')
  }, [history])

  const dismissWin = useCallback(() => {
    setHasDismissedWin(true)
    setGameStatus('playing')
  }, [])

  const resetBestScore = useCallback(() => {
    try {
      localStorage.removeItem(`${BEST_SCORE_KEY_PREFIX}${gridSize}`)
      setBestScore(0)
    } catch {
      // Storage unavailable
    }
  }, [gridSize])

  // Keyboard navigation listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          handleMove('up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          handleMove('down')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          handleMove('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          handleMove('right')
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleMove])

  return {
    tiles,
    gridSize,
    score,
    bestScore,
    gameStatus,
    canUndo: history !== null,
    handleMove,
    undoMove,
    resetGame,
    setGridSize,
    dismissWin,
    resetBestScore,
  }
}
