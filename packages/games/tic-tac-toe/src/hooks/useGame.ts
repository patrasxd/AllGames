import { useState, useEffect, useCallback, useRef } from 'react'
import type { Board, Player, GameMode, DifficultyLevel } from '../logic'
import { checkWinner, isDraw, getBestMove } from '../logic'

export interface Stats {
  X: number
  O: number
  draw: number
}

const EMPTY_BOARD: Board = Array(9).fill(null)
const AI_STATS_KEY = 'allgames:tic-tac-toe:stats-ai'
const SETTINGS_KEY = 'allgames:tic-tac-toe:settings'
const DIFFICULTY_KEY = 'allgames:tic-tac-toe:difficulty'

function loadAIStats(): Stats {
  try {
    const raw = localStorage.getItem(AI_STATS_KEY)
    return raw ? JSON.parse(raw) : { X: 0, O: 0, draw: 0 }
  } catch { return { X: 0, O: 0, draw: 0 } }
}

function saveAIStats(stats: Stats) {
  try {
    localStorage.setItem(AI_STATS_KEY, JSON.stringify(stats))
  } catch {
    // Storage unavailable
  }
}

function loadMode(): GameMode {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.mode ?? '2p'
  } catch { return '2p' }
}

function saveMode(mode: GameMode) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode }))
  } catch {
    // Storage unavailable
  }
}

function loadDifficulty(): DifficultyLevel {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY)
    if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw
    return 'medium'
  } catch {
    return 'medium'
  }
}

function saveDifficulty(diff: DifficultyLevel) {
  try {
    localStorage.setItem(DIFFICULTY_KEY, diff)
  } catch {
    // Storage unavailable
  }
}

export function useGame(options?: { isEink?: boolean }) {
  const isEink = options?.isEink ?? false
  const [board, setBoard] = useState<Board>([...EMPTY_BOARD])
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [winResult, setWinResult] = useState<{ winner: Player; line: [number, number, number] } | null>(null)
  const [gameIsDraw, setGameIsDraw] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [mode, setMode] = useState<GameMode>(loadMode)
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>(loadDifficulty)

  // AI mode: persistent stats (localStorage)
  const [aiStats, setAIStats] = useState<Stats>(loadAIStats)

  // 2P mode: session-only stats
  const [sessionStats, setSessionStats] = useState<Stats>({ X: 0, O: 0, draw: 0 })

  const aiPendingRef = useRef(false)
  const difficultyRef = useRef<DifficultyLevel>(difficulty)
  difficultyRef.current = difficulty

  const gameOver = winResult !== null || gameIsDraw

  // Active stats based on mode
  const stats = mode === 'ai' ? aiStats : sessionStats

  const resetGame = useCallback(() => {
    aiPendingRef.current = false
    setBoard([...EMPTY_BOARD])
    setCurrentPlayer('X')
    setWinResult(null)
    setGameIsDraw(false)
    setIsAIThinking(false)
  }, [])

  const setDifficulty = useCallback((d: DifficultyLevel) => {
    setDifficultyState(d)
    saveDifficulty(d)
    resetGame()
  }, [resetGame])

  const recordWin = useCallback((winner: Player) => {
    if (mode === 'ai') {
      setAIStats(s => {
        const updated = { ...s, [winner]: s[winner] + 1 }
        saveAIStats(updated)
        return updated
      })
    } else {
      setSessionStats(s => ({ ...s, [winner]: s[winner] + 1 }))
    }
  }, [mode])

  const recordDraw = useCallback(() => {
    if (mode === 'ai') {
      setAIStats(s => {
        const updated = { ...s, draw: s.draw + 1 }
        saveAIStats(updated)
        return updated
      })
    } else {
      setSessionStats(s => ({ ...s, draw: s.draw + 1 }))
    }
  }, [mode])

  // AI move effect
  useEffect(() => {
    if (mode !== 'ai' || currentPlayer !== 'O' || gameOver) return
    if (aiPendingRef.current) return

    aiPendingRef.current = true
    setIsAIThinking(true)

    const delay = isEink ? 450 : 400 + Math.random() * 250

    const timer = setTimeout(() => {
      setBoard(prev => {
        const newBoard = [...prev] as Board
        const move = getBestMove([...newBoard], difficultyRef.current)
        if (move === -1) return prev
        newBoard[move] = 'O'

        const result = checkWinner(newBoard)
        if (result) {
          setWinResult(result)
          recordWin('O')
        } else if (isDraw(newBoard)) {
          setGameIsDraw(true)
          recordDraw()
        } else {
          setCurrentPlayer('X')
        }
        return newBoard
      })
      aiPendingRef.current = false
      setIsAIThinking(false)
    }, delay)

    return () => {
      clearTimeout(timer)
      aiPendingRef.current = false
      setIsAIThinking(false)
    }
  }, [currentPlayer, mode, gameOver, isEink, recordWin, recordDraw])

  const makeMove = useCallback((index: number) => {
    if (board[index] !== null || gameOver || isAIThinking) return
    if (mode === 'ai' && currentPlayer === 'O') return

    const newBoard = [...board] as Board
    newBoard[index] = currentPlayer

    const result = checkWinner(newBoard)
    if (result) {
      setBoard(newBoard)
      setWinResult(result)
      recordWin(currentPlayer)
      return
    }

    if (isDraw(newBoard)) {
      setBoard(newBoard)
      setGameIsDraw(true)
      recordDraw()
      return
    }

    setBoard(newBoard)
    setCurrentPlayer(prev => (prev === 'X' ? 'O' : 'X'))
  }, [board, currentPlayer, gameOver, isAIThinking, mode, recordWin, recordDraw])

  const changeMode = useCallback((newMode: GameMode) => {
    aiPendingRef.current = false
    setMode(newMode)
    saveMode(newMode)
    setBoard([...EMPTY_BOARD])
    setCurrentPlayer('X')
    setWinResult(null)
    setGameIsDraw(false)
    setIsAIThinking(false)
    setSessionStats({ X: 0, O: 0, draw: 0 })
  }, [])

  const resetStats = useCallback(() => {
    if (mode === 'ai') {
      const cleared = { X: 0, O: 0, draw: 0 }
      setAIStats(cleared)
      saveAIStats(cleared)
    } else {
      setSessionStats({ X: 0, O: 0, draw: 0 })
    }
  }, [mode])

  return {
    board,
    currentPlayer,
    winner: winResult?.winner ?? null,
    winningLine: winResult?.line ?? null,
    isDraw: gameIsDraw,
    gameOver,
    isAIThinking,
    stats,
    mode,
    difficulty,
    makeMove,
    resetGame,
    changeMode,
    setDifficulty,
    resetStats,
  }
}
