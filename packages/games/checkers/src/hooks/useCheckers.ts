import { useState, useEffect, useCallback, useRef } from 'react'
import type { BoardState, PlayerColor, Position, Move, GameMode, CheckersDifficulty } from '../types'
import {
  createInitialBoard,
  cloneBoard,
  getAllLegalMoves,
  getJumpsForPiece,
  applyMove,
  countPieces,
  getBestAIMove,
} from '../logic'

export interface CheckersStats {
  white: number
  black: number
  draw: number
}

const AI_STATS_KEY = 'allgames:checkers:stats-ai'
const SETTINGS_KEY = 'allgames:checkers:settings'
const DIFFICULTY_KEY = 'allgames:checkers:difficulty'

function loadAIStats(): CheckersStats {
  try {
    const raw = localStorage.getItem(AI_STATS_KEY)
    return raw ? JSON.parse(raw) : { white: 0, black: 0, draw: 0 }
  } catch {
    return { white: 0, black: 0, draw: 0 }
  }
}

function saveAIStats(stats: CheckersStats) {
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
  } catch {
    return '2p'
  }
}

function saveMode(mode: GameMode) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode }))
  } catch {
    // Storage unavailable
  }
}

function loadDifficulty(): CheckersDifficulty {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY)
    if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw
    return 'medium'
  } catch {
    return 'medium'
  }
}

function saveDifficulty(diff: CheckersDifficulty) {
  try {
    localStorage.setItem(DIFFICULTY_KEY, diff)
  } catch {
    // Storage unavailable
  }
}

export function useCheckers(options?: { isEink?: boolean }) {
  const isEink = options?.isEink ?? false

  const [board, setBoard] = useState<BoardState>(createInitialBoard)
  const [turn, setTurn] = useState<PlayerColor>('white')
  const [selectedPos, setSelectedPos] = useState<Position | null>(null)
  const [multiJumpPiece, setMultiJumpPiece] = useState<Position | null>(null)
  const [winner, setWinner] = useState<PlayerColor | 'draw' | null>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [mode, setMode] = useState<GameMode>(loadMode)
  const [difficulty, setDifficultyState] = useState<CheckersDifficulty>(loadDifficulty)

  const [aiStats, setAIStats] = useState<CheckersStats>(loadAIStats)
  const [sessionStats, setSessionStats] = useState<CheckersStats>({ white: 0, black: 0, draw: 0 })

  const stats = mode === 'ai' ? aiStats : sessionStats
  const aiPendingRef = useRef(false)
  const difficultyRef = useRef<CheckersDifficulty>(difficulty)
  difficultyRef.current = difficulty

  const resetGame = useCallback(() => {
    aiPendingRef.current = false
    setBoard(createInitialBoard())
    setTurn('white')
    setSelectedPos(null)
    setMultiJumpPiece(null)
    setWinner(null)
    setIsAIThinking(false)
  }, [])

  const setDifficulty = useCallback((d: CheckersDifficulty) => {
    setDifficultyState(d)
    saveDifficulty(d)
    resetGame()
  }, [resetGame])

  // Compute all current legal moves for active player
  const legalMoves = getAllLegalMoves(board, turn)
  const hasJumps = legalMoves.some(m => !!m.captured)

  // Valid moves for currently selected square
  const validMovesForSelected: Move[] = selectedPos
    ? legalMoves.filter(m => m.from.row === selectedPos.row && m.from.col === selectedPos.col)
    : []

  const recordWin = useCallback(
    (w: PlayerColor | 'draw') => {
      if (mode === 'ai') {
        setAIStats(s => {
          const updated = { ...s, [w]: s[w] + 1 }
          saveAIStats(updated)
          return updated
        })
      } else {
        setSessionStats(s => ({ ...s, [w]: s[w] + 1 }))
      }
    },
    [mode]
  )

  // AI Move calculation effect
  useEffect(() => {
    if (mode !== 'ai' || turn !== 'black' || winner !== null) return
    if (aiPendingRef.current) return

    aiPendingRef.current = true
    setIsAIThinking(true)

    const delay = isEink ? 450 : 500 + Math.random() * 300

    const timer = setTimeout(() => {
      setBoard(prevBoard => {
        const nextBoard = cloneBoard(prevBoard)
        const bestMove = getBestAIMove(nextBoard, difficultyRef.current)

        if (!bestMove) {
          setWinner('white')
          recordWin('white')
          return prevBoard
        }

        const { promoted } = applyMove(nextBoard, bestMove)

        // Check for multi-jump chain for computer
        if (bestMove.captured && !promoted) {
          const chainJumps = getJumpsForPiece(nextBoard, bestMove.to)
          if (chainJumps.length > 0) {
            // Apply second jump
            applyMove(nextBoard, chainJumps[0])
          }
        }

        // Check if white has remaining moves
        const nextWhiteMoves = getAllLegalMoves(nextBoard, 'white')
        if (nextWhiteMoves.length === 0) {
          setWinner('black')
          recordWin('black')
        } else {
          setTurn('white')
        }

        return nextBoard
      })

      aiPendingRef.current = false
      setIsAIThinking(false)
    }, delay)

    return () => {
      clearTimeout(timer)
      aiPendingRef.current = false
      setIsAIThinking(false)
    }
  }, [mode, turn, winner, isEink, recordWin])

  // Select or Move click handler
  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (winner !== null || isAIThinking) return
      if (mode === 'ai' && turn === 'black') return

      const piece = board[row][col]

      // If clicked on an available move destination
      if (selectedPos) {
        const matchingMove = validMovesForSelected.find(
          m => m.to.row === row && m.to.col === col
        )

        if (matchingMove) {
          const nextBoard = cloneBoard(board)
          const { promoted } = applyMove(nextBoard, matchingMove)

          // Check consecutive jump chain
          if (matchingMove.captured && !promoted) {
            const consecutiveJumps = getJumpsForPiece(nextBoard, matchingMove.to)
            if (consecutiveJumps.length > 0) {
              setBoard(nextBoard)
              setSelectedPos(matchingMove.to)
              setMultiJumpPiece(matchingMove.to)
              return
            }
          }

          setBoard(nextBoard)
          setSelectedPos(null)
          setMultiJumpPiece(null)

          const nextPlayer: PlayerColor = turn === 'white' ? 'black' : 'white'
          const opponentMoves = getAllLegalMoves(nextBoard, nextPlayer)

          if (opponentMoves.length === 0) {
            setWinner(turn)
            recordWin(turn)
          } else {
            setTurn(nextPlayer)
          }
          return
        }
      }

      // Cannot switch piece if mid multi-jump
      if (multiJumpPiece) return

      // Select piece of current player color
      if (piece && piece.color === turn) {
        const pieceJumps = getJumpsForPiece(board, { row, col })
        if (hasJumps && pieceJumps.length === 0) return

        setSelectedPos({ row, col })
      } else {
        setSelectedPos(null)
      }
    },
    [board, turn, winner, isAIThinking, mode, selectedPos, validMovesForSelected, hasJumps, multiJumpPiece, recordWin]
  )

  const changeMode = useCallback((newMode: GameMode) => {
    aiPendingRef.current = false
    setMode(newMode)
    saveMode(newMode)
    setBoard(createInitialBoard())
    setTurn('white')
    setSelectedPos(null)
    setMultiJumpPiece(null)
    setWinner(null)
    setIsAIThinking(false)
    setSessionStats({ white: 0, black: 0, draw: 0 })
  }, [])

  const resetStats = useCallback(() => {
    if (mode === 'ai') {
      const cleared = { white: 0, black: 0, draw: 0 }
      setAIStats(cleared)
      saveAIStats(cleared)
    } else {
      setSessionStats({ white: 0, black: 0, draw: 0 })
    }
  }, [mode])

  return {
    board,
    turn,
    selectedPos,
    validMovesForSelected,
    hasJumps,
    winner,
    isAIThinking,
    stats,
    mode,
    difficulty,
    piecesCount: countPieces(board),
    handleSquareClick,
    resetGame,
    changeMode,
    setDifficulty,
    resetStats,
  }
}
