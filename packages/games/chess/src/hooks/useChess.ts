import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  ChessBoardState,
  PieceColor,
  SquareCoord,
  ChessMove,
  ChessGameMode,
  ChessDifficulty,
  PieceType,
} from '../types'
import {
  createInitialChessBoard,
  cloneChessBoard,
  getLegalMoves,
  applyChessMove,
  isKingInCheck,
  getBestChessAIMove,
} from '../logic'

export interface ChessStats {
  white: number
  black: number
  draw: number
}

const AI_STATS_KEY = 'allgames:chess:stats-ai'
const SETTINGS_KEY = 'allgames:chess:settings'
const DIFFICULTY_KEY = 'allgames:chess:difficulty'

function loadAIStats(): ChessStats {
  try {
    const raw = localStorage.getItem(AI_STATS_KEY)
    return raw ? JSON.parse(raw) : { white: 0, black: 0, draw: 0 }
  } catch {
    return { white: 0, black: 0, draw: 0 }
  }
}

function saveAIStats(stats: ChessStats) {
  try {
    localStorage.setItem(AI_STATS_KEY, JSON.stringify(stats))
  } catch {
    // Storage unavailable
  }
}

function loadMode(): ChessGameMode {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.mode ?? '2p'
  } catch {
    return '2p'
  }
}

function saveMode(mode: ChessGameMode) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode }))
  } catch {
    // Storage unavailable
  }
}

function loadDifficulty(): ChessDifficulty {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY)
    if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw
    return 'medium'
  } catch {
    return 'medium'
  }
}

function saveDifficulty(diff: ChessDifficulty) {
  try {
    localStorage.setItem(DIFFICULTY_KEY, diff)
  } catch {
    // Storage unavailable
  }
}

export function useChess(options?: { isEink?: boolean }) {
  const isEink = options?.isEink ?? false

  const [board, setBoard] = useState<ChessBoardState>(createInitialChessBoard)
  const [turn, setTurn] = useState<PieceColor>('white')
  const [selectedCoord, setSelectedCoord] = useState<SquareCoord | null>(null)
  const [enPassantTarget, setEnPassantTarget] = useState<SquareCoord | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<{ move: ChessMove } | null>(null)

  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null)
  const [isCheckmate, setIsCheckmate] = useState(false)
  const [isStalemate, setIsStalemate] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [mode, setMode] = useState<ChessGameMode>(loadMode)
  const [difficulty, setDifficultyState] = useState<ChessDifficulty>(loadDifficulty)

  const [aiStats, setAIStats] = useState<ChessStats>(loadAIStats)
  const [sessionStats, setSessionStats] = useState<ChessStats>({ white: 0, black: 0, draw: 0 })

  const stats = mode === 'ai' ? aiStats : sessionStats
  const aiPendingRef = useRef(false)
  const difficultyRef = useRef<ChessDifficulty>(difficulty)
  difficultyRef.current = difficulty

  const resetGame = useCallback(() => {
    aiPendingRef.current = false
    setBoard(createInitialChessBoard())
    setTurn('white')
    setSelectedCoord(null)
    setEnPassantTarget(null)
    setPendingPromotion(null)
    setWinner(null)
    setIsCheckmate(false)
    setIsStalemate(false)
    setIsAIThinking(false)
  }, [])

  const setDifficulty = useCallback((d: ChessDifficulty) => {
    setDifficultyState(d)
    saveDifficulty(d)
    resetGame()
  }, [resetGame])

  // King check status
  const inCheck: PieceColor | null = isKingInCheck(board, turn) ? turn : null

  // Legal moves for currently active player
  const legalMoves = getLegalMoves(board, turn, enPassantTarget)

  // Valid moves for currently selected square
  const validMovesForSelected: ChessMove[] = selectedCoord
    ? legalMoves.filter(m => m.from.row === selectedCoord.row && m.from.col === selectedCoord.col)
    : []

  const recordWin = useCallback(
    (w: PieceColor | 'draw') => {
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

  // Execute a completed move and update board & game state
  const executeMove = useCallback(
    (move: ChessMove) => {
      const nextBoard = cloneChessBoard(board)
      applyChessMove(nextBoard, move)

      // Update En Passant target
      let nextEnPassant: SquareCoord | null = null
      if (move.piece.type === 'pawn' && Math.abs(move.to.row - move.from.row) === 2) {
        nextEnPassant = {
          row: (move.from.row + move.to.row) / 2,
          col: move.from.col,
        }
      }

      setBoard(nextBoard)
      setSelectedCoord(null)
      setPendingPromotion(null)
      setEnPassantTarget(nextEnPassant)

      const nextPlayer: PieceColor = turn === 'white' ? 'black' : 'white'
      const nextLegalMoves = getLegalMoves(nextBoard, nextPlayer, nextEnPassant)

      if (nextLegalMoves.length === 0) {
        if (isKingInCheck(nextBoard, nextPlayer)) {
          setWinner(turn)
          setIsCheckmate(true)
          recordWin(turn)
        } else {
          setWinner('draw')
          setIsStalemate(true)
          recordWin('draw')
        }
      } else {
        setTurn(nextPlayer)
      }
    },
    [board, turn, recordWin]
  )

  // AI Move calculation effect
  useEffect(() => {
    if (mode !== 'ai' || turn !== 'black' || winner !== null) return
    if (aiPendingRef.current) return

    aiPendingRef.current = true
    setIsAIThinking(true)

    const delay = isEink ? 450 : 550 + Math.random() * 300

    const timer = setTimeout(() => {
      const bestMove = getBestChessAIMove(board, enPassantTarget, difficultyRef.current)

      if (!bestMove) {
        if (isKingInCheck(board, 'black')) {
          setWinner('white')
          setIsCheckmate(true)
          recordWin('white')
        } else {
          setWinner('draw')
          setIsStalemate(true)
          recordWin('draw')
        }
      } else {
        executeMove(bestMove)
      }

      aiPendingRef.current = false
      setIsAIThinking(false)
    }, delay)

    return () => {
      clearTimeout(timer)
      aiPendingRef.current = false
      setIsAIThinking(false)
    }
  }, [mode, turn, winner, board, enPassantTarget, isEink, executeMove, recordWin])

  // Handle Square Click
  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (winner !== null || isAIThinking || pendingPromotion) return
      if (mode === 'ai' && turn === 'black') return

      const piece = board[row][col]

      // If clicking on a valid destination square
      if (selectedCoord) {
        const matchingMove = validMovesForSelected.find(
          m => m.to.row === row && m.to.col === col
        )

        if (matchingMove) {
          // Check if move requires pawn promotion choice
          const isPawn = matchingMove.piece.type === 'pawn'
          const reachesEnd = matchingMove.to.row === 0 || matchingMove.to.row === 7
          if (isPawn && reachesEnd) {
            setPendingPromotion({ move: matchingMove })
            return
          }

          executeMove(matchingMove)
          return
        }
      }

      // Select piece of current player color
      if (piece && piece.color === turn) {
        setSelectedCoord({ row, col })
      } else {
        setSelectedCoord(null)
      }
    },
    [winner, isAIThinking, pendingPromotion, mode, turn, board, selectedCoord, validMovesForSelected, executeMove]
  )

  const choosePromotion = useCallback(
    (promotionType: PieceType) => {
      if (!pendingPromotion) return
      const move: ChessMove = {
        ...pendingPromotion.move,
        promotion: promotionType,
      }
      executeMove(move)
    },
    [pendingPromotion, executeMove]
  )

  const changeMode = useCallback((newMode: ChessGameMode) => {
    aiPendingRef.current = false
    setMode(newMode)
    saveMode(newMode)
    setBoard(createInitialChessBoard())
    setTurn('white')
    setSelectedCoord(null)
    setEnPassantTarget(null)
    setPendingPromotion(null)
    setWinner(null)
    setIsCheckmate(false)
    setIsStalemate(false)
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
    selectedCoord,
    validMovesForSelected,
    inCheck,
    winner,
    isCheckmate,
    isStalemate,
    isAIThinking,
    pendingPromotion,
    stats,
    mode,
    difficulty,
    handleSquareClick,
    choosePromotion,
    resetGame,
    changeMode,
    setDifficulty,
    resetStats,
  }
}
