import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  Tile,
  LevelConfig,
  LevelGoal,
  GameStatus,
  Particle,
  ComboPopup,
  PlayerProgress,
  GemType,
  SwapAnimation,
} from '../types'
import { generateLevel, createInitialBoard, hasPossibleMoves, findFirstValidMove } from '../logic/generator'
import {
  findMatches,
  handleSpecialCombination,
  applyGravityAndRefill,
  reshuffleBoard,
} from '../logic/engine'

const SAVE_KEY = 'allgames:crystal-match:progress'

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
  return {
    unlockedLevel: 1,
    levelStars: {},
    levelHighScores: {},
    totalScore: 0,
  }
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

export function useCrystalMatch(options?: { isEink?: boolean }) {
  const [progress, setProgress] = useState<PlayerProgress>(loadSavedProgress)
  const [level, setLevel] = useState<number>(() => loadSavedProgress().unlockedLevel)
  const [config, setConfig] = useState<LevelConfig>(() => generateLevel(level))

  const [board, setBoard] = useState<Tile[][]>(() => createInitialBoard(config))
  const [movesLeft, setMovesLeft] = useState<number>(config.maxMoves)
  const [score, setScore] = useState<number>(0)
  const [goals, setGoals] = useState<LevelGoal[]>(config.goals)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')

  const [swapAnimation, setSwapAnimation] = useState<SwapAnimation | null>(null)

  const [combo, setCombo] = useState<number>(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [comboPopups, setComboPopups] = useState<ComboPopup[]>([])
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)
  const [isLevelIntroOpen, setIsLevelIntroOpen] = useState(true)
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false)
  const [hintCoords, setHintCoords] = useState<{ r1: number; c1: number; r2: number; c2: number } | null>(null)

  const isProcessingRef = useRef(false)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize level
  const initLevel = useCallback((lvl: number) => {
    const newConfig = generateLevel(lvl)
    const newBoard = createInitialBoard(newConfig)

    setLevel(lvl)
    setConfig(newConfig)
    setBoard(newBoard)
    setMovesLeft(newConfig.maxMoves)
    setScore(0)
    setGoals(newConfig.goals.map(g => ({ ...g, current: 0 })))
    setGameStatus('playing')
    setSwapAnimation(null)
    setCombo(0)
    setParticles([])
    setComboPopups([])
    setIsLevelIntroOpen(true)
    setHintCoords(null)
  }, [])

  // Auto-find hint after 3.5s of inactivity
  const scheduleHint = useCallback((currentBoard: Tile[][]) => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    hintTimerRef.current = setTimeout(() => {
      const move = findFirstValidMove(currentBoard)
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

  // Spawn gentle, subtle particle effect
  const spawnParticles = useCallback((coords: { row: number; col: number }[], currentBoard: Tile[][]) => {
    if (options?.isEink) return
    const newParticles: Particle[] = []
    coords.forEach(({ row, col }) => {
      const gem = currentBoard[row]?.[col]?.gem
      const color = gem ? GEM_COLORS[gem] : '#f59e0b'
      for (let i = 0; i < 3; i++) {
        newParticles.push({
          id: `p-${Date.now()}-${Math.random()}`,
          x: (col / 8) * 100 + 6.25 + (Math.random() * 4 - 2),
          y: (row / 8) * 100 + 6.25 + (Math.random() * 4 - 2),
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          color,
          size: Math.random() * 3 + 2,
          alpha: 1,
          life: 16,
        })
      }
    })
    setParticles(prev => [...prev.slice(-20), ...newParticles])
  }, [options?.isEink])

  // Spawn combo message
  const triggerComboPopup = useCallback((comboCount: number, row: number, col: number) => {
    if (comboCount < 2) return
    const texts = ['Sweet!', 'Tasty!', 'Delicious!', 'Crystal Master!']
    const text = texts[Math.min(texts.length - 1, comboCount - 2)]
    const newPopup: ComboPopup = {
      id: `combo-${Date.now()}`,
      text: `${text} x${comboCount}`,
      x: (col / 8) * 100 + 5,
      y: (row / 8) * 100 + 5,
    }
    setComboPopups(prev => [...prev.slice(-2), newPopup])
    setTimeout(() => {
      setComboPopups(prev => prev.filter(p => p.id !== newPopup.id))
    }, 1400)
  }, [])

  // Particle life tick
  useEffect(() => {
    if (particles.length === 0) return
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: p.life / 16,
            life: p.life - 1,
          }))
          .filter(p => p.life > 0)
      )
    }, 35)
    return () => clearInterval(interval)
  }, [particles.length])

  // Check goal completion
  const checkGoalsCompleted = useCallback((currentGoals: LevelGoal[], currentScore: number): boolean => {
    return currentGoals.every(g => {
      if (g.type === 'score') return currentScore >= g.target
      return g.current >= g.target
    })
  }, [])

  // Cascade resolution loop with calm, smooth pacing
  const runCascade = useCallback(
    async (
      initialBoard: Tile[][],
      initialScore: number,
      initialGoals: LevelGoal[],
      initialMoves: number
    ) => {
      let currentBoard = initialBoard
      let currentScore = initialScore
      let currentGoals = initialGoals
      let cascadeCount = 0

      while (true) {
        const matchResult = findMatches(currentBoard)
        if (matchResult.matchedCoords.length === 0) break

        cascadeCount++
        setCombo(cascadeCount)

        // Spawn subtle particles and combo popup
        spawnParticles(matchResult.matchedCoords, currentBoard)
        if (matchResult.matchedCoords[0] && cascadeCount >= 2) {
          triggerComboPopup(cascadeCount, matchResult.matchedCoords[0].row, matchResult.matchedCoords[0].col)
        }

        // Score update with controlled multiplier
        const scoreGain = Math.round(matchResult.scoreEarned * (1 + (cascadeCount - 1) * 0.25))
        currentScore += scoreGain
        setScore(currentScore)

        // Update goals
        currentGoals = currentGoals.map(g => {
          if (g.type === 'score') {
            return { ...g, current: currentScore }
          }
          if (g.type === 'ice') {
            return { ...g, current: Math.min(g.target, g.current + matchResult.clearedObstacles.length) }
          }
          if (g.type === 'gems' && g.gemType) {
            const cleared = matchResult.gemsClearedByType[g.gemType] || 0
            return { ...g, current: Math.min(g.target, g.current + cleared) }
          }
          return g
        })
        setGoals(currentGoals)

        // Highlight matched tiles for smooth fade
        const clearedBoard = currentBoard.map((row, r) =>
          row.map((tile, c) => {
            const isMatched = matchResult.matchedCoords.some(coord => coord.row === r && coord.col === c)
            const isObstacleCleared = matchResult.clearedObstacles.some(coord => coord.row === r && coord.col === c)
            let nextObstacle = tile.obstacle
            if (isObstacleCleared) {
              if (tile.obstacle === 'double-ice') nextObstacle = 'ice'
              else if (tile.obstacle === 'ice' || tile.obstacle === 'stone') nextObstacle = 'none'
            }
            return {
              ...tile,
              gem: isMatched ? null : tile.gem,
              special: isMatched ? 'none' : tile.special,
              obstacle: nextObstacle,
              isMatched,
            }
          })
        )
        setBoard(clearedBoard)

        // Smooth match dissolve delay
        await new Promise(r => setTimeout(r, 260))

        // Apply gravity & refill
        const { nextBoard } = applyGravityAndRefill(clearedBoard, config, matchResult.specialSpawns)
        currentBoard = nextBoard
        setBoard(currentBoard)

        // Smooth fall glide delay
        await new Promise(r => setTimeout(r, 280))
      }

      // Check win / loss status
      const isWon = checkGoalsCompleted(currentGoals, currentScore)
      if (isWon) {
        setGameStatus('won')
        let stars = 1
        if (currentScore >= config.starThresholds[2]) stars = 3
        else if (currentScore >= config.starThresholds[1]) stars = 2

        setProgress(prev => {
          const nextProg: PlayerProgress = {
            unlockedLevel: Math.max(prev.unlockedLevel, level + 1),
            levelStars: { ...prev.levelStars, [level]: Math.max(prev.levelStars[level] || 0, stars) },
            levelHighScores: {
              ...prev.levelHighScores,
              [level]: Math.max(prev.levelHighScores[level] || 0, currentScore),
            },
            totalScore: prev.totalScore + currentScore,
          }
          saveProgress(nextProg)
          return nextProg
        })
      } else if (initialMoves <= 0) {
        setGameStatus('lost')
      } else {
        if (!hasPossibleMoves(currentBoard)) {
          const reshuffled = reshuffleBoard(currentBoard, config)
          setBoard(reshuffled)
        }
        setGameStatus('playing')
      }

      isProcessingRef.current = false
    },
    [config, level, checkGoalsCompleted, spawnParticles, triggerComboPopup]
  )

  // Swap action with smooth slide and revert animation
  const handleSwap = useCallback(
    async (r1: number, c1: number, r2: number, c2: number) => {
      if (gameStatus !== 'playing' || isProcessingRef.current || movesLeft <= 0) return
      if (board[r1][c1].obstacle === 'stone' || board[r2][c2].obstacle === 'stone') return
      if (board[r1][c1].obstacle === 'empty' || board[r2][c2].obstacle === 'empty') return

      isProcessingRef.current = true
      setGameStatus('animating')
      setHintCoords(null)

      // Start visual slide animation
      setSwapAnimation({ r1, c1, r2, c2, phase: 'sliding' })
      await new Promise(r => setTimeout(r, 205))

      // Check special combination
      const specialCombo = handleSpecialCombination(board, r1, c1, r2, c2)
      if (specialCombo) {
        const nextMoves = movesLeft - 1
        setMovesLeft(nextMoves)

        const swappedBoard = board.map(row => row.map(tile => ({ ...tile })))
        const tempGem = swappedBoard[r1][c1].gem
        const tempSpecial = swappedBoard[r1][c1].special
        swappedBoard[r1][c1].gem = swappedBoard[r2][c2].gem
        swappedBoard[r1][c1].special = swappedBoard[r2][c2].special
        swappedBoard[r2][c2].gem = tempGem
        swappedBoard[r2][c2].special = tempSpecial

        setSwapAnimation(null)
        setBoard(swappedBoard)

        runCascade(swappedBoard, score, goals, nextMoves)
        return
      }

      // Check if swap produces matches
      const swappedBoard = board.map(row => row.map(tile => ({ ...tile })))
      const tempGem = swappedBoard[r1][c1].gem
      const tempSpecial = swappedBoard[r1][c1].special
      swappedBoard[r1][c1].gem = swappedBoard[r2][c2].gem
      swappedBoard[r1][c1].special = swappedBoard[r2][c2].special
      swappedBoard[r2][c2].gem = tempGem
      swappedBoard[r2][c2].special = tempSpecial

      const matchResult = findMatches(swappedBoard)
      if (matchResult.matchedCoords.length === 0) {
        // Invalid swap -> smoothly slide back!
        setSwapAnimation({ r1, c1, r2, c2, phase: 'reverting' })
        await new Promise(r => setTimeout(r, 205))
        setSwapAnimation(null)
        setGameStatus('playing')
        isProcessingRef.current = false
        return
      }

      // Valid match: instantly settle swapped board with no reverse transition
      const nextMoves = movesLeft - 1
      setMovesLeft(nextMoves)
      setSwapAnimation(null)
      setBoard(swappedBoard)

      runCascade(swappedBoard, score, goals, nextMoves)
    },
    [board, gameStatus, movesLeft, score, goals, runCascade]
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
    [initLevel]
  )

  const resetAllProgress = useCallback(() => {
    const empty: PlayerProgress = {
      unlockedLevel: 1,
      levelStars: {},
      levelHighScores: {},
      totalScore: 0,
    }
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
    particles,
    comboPopups,
    progress,
    isLevelModalOpen,
    setIsLevelModalOpen,
    isLevelIntroOpen,
    setIsLevelIntroOpen,
    isHowToPlayOpen,
    setIsHowToPlayOpen,
    hintCoords,
    swapAnimation,
    handleSwap,
    nextLevel,
    restartLevel,
    selectLevel,
    resetAllProgress,
  }
}
