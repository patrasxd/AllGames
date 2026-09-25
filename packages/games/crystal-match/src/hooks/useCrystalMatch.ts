import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  Tile,
  LevelConfig,
  LevelGoal,
  GameStatus,
  Burst,
  ComboPopup,
  PlayerProgress,
  GemType,
  Locale,
} from '../types'
import { generateLevel, createInitialBoard } from '../logic/generator'
import {
  findMatches,
  findBestMove,
  evaluateSwap,
  swapTiles,
  clearMatched,
  applyGravityAndRefill,
  reshuffleBoard,
  hasValidMove,
  isIceLocked,
  cascadeScore,
  updateGoals,
  goalsMet,
  type MatchResult,
} from '../logic/engine'
import { crystalMatchTranslations } from '../i18n'

const SAVE_KEY = 'allgames:crystal-match:progress'

// Animation pacing (ms). Movement itself is a spring in CrystalBoard; these only
// decide how long the logic waits so the player can follow each step.
const SWAP_MS = 190
const CLEAR_MS = 190
const FALL_MS = 340

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function loadSavedProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed.unlockedLevel === 'number') {
        return {
          unlockedLevel: parsed.unlockedLevel || 1,
          levelStars: parsed.levelStars || {},
          levelHighScores: parsed.levelHighScores || {},
          totalScore: parsed.totalScore || 0,
        }
      }
    }
  } catch {
    // storage error
  }
  return { unlockedLevel: 1, levelStars: {}, levelHighScores: {}, totalScore: 0 }
}

function saveProgress(progress: PlayerProgress) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress))
  } catch {
    // storage unavailable
  }
}

const GEM_COLORS: Record<GemType, string> = {
  ruby: '#ef4444',
  sapphire: '#3b82f6',
  emerald: '#10b981',
  topaz: '#f59e0b',
  amethyst: '#a855f7',
  amber: '#f97316',
}

let burstCounter = 0

export function useCrystalMatch(options?: { isEink?: boolean; locale?: Locale }) {
  const isEink = options?.isEink ?? false
  const t = crystalMatchTranslations[options?.locale ?? 'en'] || crystalMatchTranslations.en

  const [progress, setProgress] = useState<PlayerProgress>(loadSavedProgress)
  const [level, setLevel] = useState<number>(() => loadSavedProgress().unlockedLevel)
  const [config, setConfig] = useState<LevelConfig>(() => generateLevel(level))

  const [board, setBoard] = useState<Tile[][]>(() => createInitialBoard(config))
  const [movesLeft, setMovesLeft] = useState<number>(config.maxMoves)
  const [score, setScore] = useState<number>(0)
  const [goals, setGoals] = useState<LevelGoal[]>(config.goals)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')

  const [combo, setCombo] = useState<number>(0)
  const [bursts, setBursts] = useState<Burst[]>([])
  const [comboPopups, setComboPopups] = useState<ComboPopup[]>([])
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)
  const [isLevelIntroOpen, setIsLevelIntroOpen] = useState(true)
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false)
  const [hintCoords, setHintCoords] = useState<{ r1: number; c1: number; r2: number; c2: number } | null>(null)

  const isProcessingRef = useRef(false)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const aliveRef = useRef(true)
  // Bumped whenever a level is (re)started so a cascade still running for the old
  // level cannot write into the new one.
  const runIdRef = useRef(0)

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
    }
  }, [])

  const initLevel = useCallback((lvl: number) => {
    runIdRef.current += 1
    isProcessingRef.current = false
    const newConfig = generateLevel(lvl)
    setLevel(lvl)
    setConfig(newConfig)
    setBoard(createInitialBoard(newConfig))
    setMovesLeft(newConfig.maxMoves)
    setScore(0)
    setGoals(newConfig.goals.map((g) => ({ ...g, current: 0 })))
    setGameStatus('playing')
    setCombo(0)
    setBursts([])
    setComboPopups([])
    setIsLevelIntroOpen(true)
    setHintCoords(null)
  }, [])

  // Show a hint after 3.5s without input
  const scheduleHint = useCallback((currentBoard: Tile[][]) => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    hintTimerRef.current = setTimeout(() => {
      const move = findBestMove(currentBoard)
      if (move) setHintCoords(move)
    }, 3500)
  }, [])

  useEffect(() => {
    if (gameStatus === 'playing' && !isLevelIntroOpen) {
      scheduleHint(board)
    } else {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
      setHintCoords(null)
    }
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [board, gameStatus, isLevelIntroOpen, scheduleHint])

  // One-shot sparkles: the elements animate themselves, we only add and later drop them
  const spawnBursts = useCallback(
    (result: MatchResult, currentBoard: Tile[][]) => {
      if (isEink) return
      const created: Burst[] = result.matchedCoords.slice(0, 16).map(({ row, col }) => {
        const gem = currentBoard[row]?.[col]?.gem
        burstCounter += 1
        return { id: `b${burstCounter}`, row, col, color: gem ? GEM_COLORS[gem] : GEM_COLORS.topaz }
      })
      setBursts((prev) => [...prev.slice(-24), ...created])
      const ids = new Set(created.map((b) => b.id))
      setTimeout(() => {
        if (aliveRef.current) setBursts((prev) => prev.filter((b) => !ids.has(b.id)))
      }, 520)
    },
    [isEink],
  )

  const triggerComboPopup = useCallback(
    (comboCount: number, row: number, col: number) => {
      if (comboCount < 2) return
      const words = t.comboWords
      const word = words[Math.min(words.length - 1, comboCount - 2)]
      const popup: ComboPopup = {
        id: `combo-${Date.now()}-${comboCount}`,
        text: `${word} x${comboCount}`,
        x: (col / config.cols) * 100 + 5,
        y: (row / config.rows) * 100 + 5,
      }
      setComboPopups((prev) => [...prev.slice(-2), popup])
      setTimeout(() => {
        if (aliveRef.current) setComboPopups((prev) => prev.filter((p) => p.id !== popup.id))
      }, 1400)
    },
    [t, config.cols, config.rows],
  )

  /** Resolves matches, gravity and refills until the board is stable, then decides win / loss. */
  const runCascade = useCallback(
    async (
      startBoard: Tile[][],
      startScore: number,
      startGoals: LevelGoal[],
      movesAfter: number,
      first: MatchResult,
      runId: number,
    ) => {
      const stale = () => !aliveRef.current || runIdRef.current !== runId

      let currentBoard = startBoard
      let currentScore = startScore
      let currentGoals = startGoals
      let result = first
      let step = 0

      while (result.matchedCoords.length > 0) {
        step++
        setCombo(step)
        spawnBursts(result, currentBoard)
        if (step >= 2) triggerComboPopup(step, result.matchedCoords[0].row, result.matchedCoords[0].col)

        currentScore += cascadeScore(result, step)
        currentGoals = updateGoals(currentGoals, result, currentScore)
        setScore(currentScore)
        setGoals(currentGoals)

        // Gems vanish (exit animation); ice and stones update in place, they never move
        const cleared = clearMatched(currentBoard, result)
        setBoard(cleared)
        await wait(CLEAR_MS)
        if (stale()) return

        // Everything above falls; new gems drop in from the top
        currentBoard = applyGravityAndRefill(cleared, config).nextBoard
        setBoard(currentBoard)
        await wait(FALL_MS)
        if (stale()) return

        result = findMatches(currentBoard)
      }

      if (goalsMet(currentGoals, currentScore)) {
        setGameStatus('won')
        // Award bonus for remaining moves to reward efficient play
        const totalLevelScore = currentScore + movesAfter * 60
        setScore(totalLevelScore)

        let stars = 1
        if (totalLevelScore >= config.starThresholds[2]) stars = 3
        else if (totalLevelScore >= config.starThresholds[1]) stars = 2

        setProgress((prev) => {
          const next: PlayerProgress = {
            unlockedLevel: Math.max(prev.unlockedLevel, level + 1),
            levelStars: { ...prev.levelStars, [level]: Math.max(prev.levelStars[level] || 0, stars) },
            levelHighScores: {
              ...prev.levelHighScores,
              [level]: Math.max(prev.levelHighScores[level] || 0, totalLevelScore),
            },
            totalScore: prev.totalScore + totalLevelScore,
          }
          saveProgress(next)
          return next
        })
      } else if (movesAfter <= 0) {
        setGameStatus('lost')
      } else {
        if (!hasValidMove(currentBoard)) {
          // Nothing playable: shuffle the same gems (they glide to their new cells)
          currentBoard = reshuffleBoard(currentBoard, config)
          setBoard(currentBoard)
          await wait(FALL_MS)
          if (stale()) return
        }
        setGameStatus('playing')
      }

      if (!stale()) isProcessingRef.current = false
    },
    [config, level, spawnBursts, triggerComboPopup],
  )

  /**
   * A swap is played out visibly: the two gems slide over each other. If it does
   * nothing they slide back, otherwise the cascade takes over from the swapped board.
   */
  const handleSwap = useCallback(
    async (r1: number, c1: number, r2: number, c2: number) => {
      if (gameStatus !== 'playing' || isProcessingRef.current || movesLeft <= 0) return
      const a = board[r1][c1]
      const b = board[r2][c2]
      if (a.obstacle === 'stone' || b.obstacle === 'stone' || a.obstacle === 'empty' || b.obstacle === 'empty') return
      if (!a.gem || !b.gem) return
      if (isIceLocked(a) || isIceLocked(b)) return // frozen gems do not move

      isProcessingRef.current = true
      const runId = runIdRef.current
      setGameStatus('animating')
      setHintCoords(null)

      const swapped = swapTiles(board, r1, c1, r2, c2)
      setBoard(swapped)
      await wait(SWAP_MS)
      if (!aliveRef.current || runIdRef.current !== runId) return

      const outcome = evaluateSwap(board, r1, c1, r2, c2)
      if (!outcome) {
        // Nothing happens: slide back and keep the move
        setBoard(board)
        await wait(SWAP_MS)
        if (!aliveRef.current || runIdRef.current !== runId) return
        setGameStatus('playing')
        isProcessingRef.current = false
        return
      }

      const nextMoves = movesLeft - 1
      setMovesLeft(nextMoves)
      runCascade(swapped, score, goals, nextMoves, outcome, runId)
    },
    [board, gameStatus, movesLeft, score, goals, runCascade],
  )

  const nextLevel = useCallback(() => {
    initLevel(level + 1)
  }, [level, initLevel])

  const restartLevel = useCallback(() => {
    initLevel(level)
  }, [level, initLevel])

  const selectLevel = useCallback(
    (lvl: number) => {
      initLevel(lvl)
      setIsLevelModalOpen(false)
    },
    [initLevel],
  )

  const resetAllProgress = useCallback(() => {
    const empty: PlayerProgress = { unlockedLevel: 1, levelStars: {}, levelHighScores: {}, totalScore: 0 }
    saveProgress(empty)
    setProgress(empty)
    initLevel(1)
  }, [initLevel])

  return {
    level,
    config,
    board,
    movesLeft,
    score,
    goals,
    gameStatus,
    combo,
    bursts,
    comboPopups,
    progress,
    isLevelModalOpen,
    setIsLevelModalOpen,
    isLevelIntroOpen,
    setIsLevelIntroOpen,
    isHowToPlayOpen,
    setIsHowToPlayOpen,
    hintCoords,
    handleSwap,
    nextLevel,
    restartLevel,
    selectLevel,
    resetAllProgress,
  }
}
