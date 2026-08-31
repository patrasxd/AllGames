import { useState, useEffect, useCallback, useRef } from 'react'
import type { SudokuDifficulty, SudokuBoard, GameStatus } from '../types'
import { createInitialBoard } from '../generator'

const DIFFICULTY_KEY = 'allgames:sudoku:difficulty'
const BEST_TIME_KEY_PREFIX = 'allgames:sudoku:best-time:'

function loadDifficulty(): SudokuDifficulty {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY)
    if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw
    return 'easy'
  } catch {
    return 'easy'
  }
}

function saveDifficulty(diff: SudokuDifficulty) {
  try {
    localStorage.setItem(DIFFICULTY_KEY, diff)
  } catch {
    // Storage unavailable
  }
}

function loadBestTime(diff: SudokuDifficulty): number | null {
  try {
    const raw = localStorage.getItem(`${BEST_TIME_KEY_PREFIX}${diff}`)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

function saveBestTime(diff: SudokuDifficulty, time: number) {
  try {
    localStorage.setItem(`${BEST_TIME_KEY_PREFIX}${diff}`, String(time))
  } catch {
    // Storage unavailable
  }
}

interface MoveHistory {
  row: number
  col: number
  prevValue: number | null
  prevNotes: Set<number>
  prevError: boolean
}

export function useSudoku(options?: { isEink?: boolean }) {
  const [difficulty, setDifficultyState] = useState<SudokuDifficulty>(loadDifficulty)
  const [board, setBoard] = useState<SudokuBoard>(() => createInitialBoard(difficulty))
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [pencilMode, setPencilMode] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(() => loadBestTime(difficulty))

  const historyRef = useRef<MoveHistory[]>([])
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
    (newDiff?: SudokuDifficulty) => {
      const diffToUse = newDiff ?? difficulty
      setBoard(createInitialBoard(diffToUse))
      setSelectedCell(null)
      setPencilMode(false)
      setMistakes(0)
      setElapsedSeconds(0)
      setGameStatus('playing')
      historyRef.current = []
      setBestTime(loadBestTime(diffToUse))
    },
    [difficulty]
  )

  const setDifficulty = useCallback(
    (d: SudokuDifficulty) => {
      setDifficultyState(d)
      saveDifficulty(d)
      resetGame(d)
    },
    [resetGame]
  )

  const checkWinCondition = (currentBoard: SudokuBoard): boolean => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = currentBoard[r][c]
        if (cell.value === null || cell.value !== cell.solution) {
          return false
        }
      }
    }
    return true
  }

  const handleInputNumber = useCallback(
    (num: number) => {
      if (gameStatus !== 'playing' || !selectedCell) return

      const [r, c] = selectedCell
      const targetCell = board[r][c]
      if (targetCell.isInitial) return

      if (pencilMode) {
        // Toggle note
        setBoard(prev => {
          const next = prev.map(row => row.map(cell => ({ ...cell, notes: new Set(cell.notes) })))
          const notes = next[r][c].notes
          if (notes.has(num)) {
            notes.delete(num)
          } else {
            notes.add(num)
          }
          return next
        })
        return
      }

      // Input main value
      const isCorrect = num === targetCell.solution

      // Save history for undo
      historyRef.current.push({
        row: r,
        col: c,
        prevValue: targetCell.value,
        prevNotes: new Set(targetCell.notes),
        prevError: targetCell.isError,
      })

      const newBoard = board.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (rowIdx === r && colIdx === c) {
            return {
              ...cell,
              value: num,
              isError: !isCorrect,
              notes: new Set<number>(),
            }
          }
          return cell
        })
      )

      setBoard(newBoard)

      if (!isCorrect) {
        const nextMistakes = mistakes + 1
        setMistakes(nextMistakes)
        if (nextMistakes >= 3) {
          setGameStatus('lost')
        }
      } else {
        if (checkWinCondition(newBoard)) {
          setGameStatus('won')
          setElapsedSeconds(time => {
            const currentBest = loadBestTime(difficulty)
            if (currentBest === null || time < currentBest) {
              saveBestTime(difficulty, time)
              setBestTime(time)
            }
            return time
          })
        }
      }
    },
    [gameStatus, selectedCell, board, pencilMode, mistakes, difficulty]
  )

  const handleErase = useCallback(() => {
    if (gameStatus !== 'playing' || !selectedCell) return

    const [r, c] = selectedCell
    const targetCell = board[r][c]
    if (targetCell.isInitial || (targetCell.value === null && targetCell.notes.size === 0)) return

    historyRef.current.push({
      row: r,
      col: c,
      prevValue: targetCell.value,
      prevNotes: new Set(targetCell.notes),
      prevError: targetCell.isError,
    })

    setBoard(prev =>
      prev.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (rowIdx === r && colIdx === c) {
            return {
              ...cell,
              value: null,
              isError: false,
              notes: new Set<number>(),
            }
          }
          return cell
        })
      )
    )
  }, [gameStatus, selectedCell, board])

  const handleUndo = useCallback(() => {
    if (gameStatus !== 'playing' || historyRef.current.length === 0) return

    const lastMove = historyRef.current.pop()!
    setBoard(prev =>
      prev.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (rowIdx === lastMove.row && colIdx === lastMove.col) {
            return {
              ...cell,
              value: lastMove.prevValue,
              notes: lastMove.prevNotes,
              isError: lastMove.prevError,
            }
          }
          return cell
        })
      )
    )
    setSelectedCell([lastMove.row, lastMove.col])
  }, [gameStatus])

  const resetBest = useCallback(() => {
    try {
      localStorage.removeItem(`${BEST_TIME_KEY_PREFIX}${difficulty}`)
      setBestTime(null)
    } catch {
      // Storage unavailable
    }
  }, [difficulty])

  // Keyboard navigation & inputs
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        handleInputNumber(Number(e.key))
        return
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        handleErase()
        return
      }

      if (e.key === 'n' || e.key === 'N' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setPencilMode(p => !p)
        return
      }

      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleUndo()
        return
      }

      // Arrow navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(e.key)) {
        e.preventDefault()
        setSelectedCell(prev => {
          const [r, c] = prev ?? [0, 0]
          switch (e.key) {
            case 'ArrowUp':
            case 'w':
              return [Math.max(0, r - 1), c]
            case 'ArrowDown':
            case 's':
              return [Math.min(8, r + 1), c]
            case 'ArrowLeft':
            case 'a':
              return [r, Math.max(0, c - 1)]
            case 'ArrowRight':
            case 'd':
              return [r, Math.min(8, c + 1)]
            default:
              return [r, c]
          }
        })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleInputNumber, handleErase, handleUndo])

  return {
    board,
    difficulty,
    selectedCell,
    pencilMode,
    mistakes,
    gameStatus,
    elapsedSeconds,
    bestTime,
    setSelectedCell,
    setPencilMode,
    handleInputNumber,
    handleErase,
    handleUndo,
    resetGame,
    setDifficulty,
    resetBest,
  }
}
