import { useState, useEffect, useRef, useCallback } from 'react'
import type { Difficulty, GameStatus, Grid, BubbleColor, BubbleView, HighScores, PopCell, ShotBubble } from '../types'
import {
  DIFFICULTY_CONFIGS,
  aimAngleFromPoint,
  clampAngle,
  generateInitialGrid,
  activeColors,
  randomColor,
  cloneGrid,
  createShotBubble,
  launchShotBubble,
  stepShotBubble,
  findLandingCell,
  settleBubble,
  isBoardCleared,
  isGameOver,
  insertRowAtTop,
  POINTS_PER_MATCHED_BUBBLE,
  POINTS_PER_FLOATING_BUBBLE,
} from '../logic/engine'

const SAVE_KEY = 'allgames:bubble-shooter:highscores'
/** How long the end-of-game overlay waits so the final pop animation stays visible. */
const END_OVERLAY_DELAY_MS = 800

function loadHighScores(): HighScores {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        easy: typeof parsed.easy === 'number' ? parsed.easy : 0,
        normal: typeof parsed.normal === 'number' ? parsed.normal : 0,
        hard: typeof parsed.hard === 'number' ? parsed.hard : 0,
      }
    }
  } catch {
    // ignore
  }
  return { easy: 0, normal: 0, hard: 0 }
}

function saveHighScores(scores: HighScores) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(scores))
  } catch {
    // ignore
  }
}

function createView(diff: Difficulty, seq: number, status: GameStatus): BubbleView {
  const config = DIFFICULTY_CONFIGS[diff]
  const grid = generateInitialGrid(config.initialRows, config.colorCount)
  const colors = activeColors(grid)
  return {
    grid,
    shot: null,
    event: { seq, kind: 'reset', parity: 0, matched: [], floating: [], gained: 0, rowInserted: false },
    currentColor: randomColor(colors),
    nextColor: randomColor(colors),
    aimAngle: 0,
    status,
    shotsUntilNewRow: config.shotsPerNewRow,
    shotsPerNewRow: config.shotsPerNewRow,
    rowParity: 0,
  }
}

function keysToCells(keys: string[], source: Grid): PopCell[] {
  return keys.map((k) => {
    const [row, col] = k.split(',').map(Number)
    return { row, col, color: source[row][col] as BubbleColor }
  })
}

export function useBubbleShooter() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready')
  const [score, setScore] = useState(0)
  const [highScores, setHighScores] = useState<HighScores>(loadHighScores)
  const [isNewBest, setIsNewBest] = useState(false)
  // Shots resolved in the current game; 0 again once it has ended. Drives the "leave this game?" prompts.
  const [shotsFired, setShotsFired] = useState(0)
  const [initialView] = useState(() => createView('normal', 0, 'ready'))

  const viewRef = useRef<BubbleView>(initialView)
  const difficultyRef = useRef<Difficulty>('normal')
  const scoreRef = useRef(0)
  const highScoresRef = useRef<HighScores>(highScores)
  const seqRef = useRef(0)
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    highScoresRef.current = highScores
  }, [highScores])

  const setStatus = useCallback((status: GameStatus) => {
    viewRef.current.status = status
    setGameStatus(status)
  }, [])

  const clearEndTimer = useCallback(() => {
    if (endTimerRef.current) {
      clearTimeout(endTimerRef.current)
      endTimerRef.current = null
    }
  }, [])

  useEffect(() => clearEndTimer, [clearEndTimer])

  const startNewGame = useCallback(
    (diff: Difficulty, status: GameStatus) => {
      clearEndTimer()
      seqRef.current += 1
      difficultyRef.current = diff
      scoreRef.current = 0
      viewRef.current = createView(diff, seqRef.current, status)
      setDifficulty(diff)
      setGameStatus(status)
      setScore(0)
      setIsNewBest(false)
      setShotsFired(0)
    },
    [clearEndTimer],
  )

  /** "New game" / "Play again": skip the intro overlay and go straight to aiming. */
  const resetGame = useCallback(() => {
    startNewGame(difficultyRef.current, 'aiming')
  }, [startNewGame])

  const changeDifficulty = useCallback(
    (diff: Difficulty) => {
      const stillOnIntro = viewRef.current.status === 'ready'
      startNewGame(diff, stillOnIntro ? 'ready' : 'aiming')
    },
    [startNewGame],
  )

  const startGame = useCallback(() => {
    if (viewRef.current.status === 'ready') setStatus('aiming')
  }, [setStatus])

  const aimAt = useCallback((x: number, y: number) => {
    viewRef.current.aimAngle = aimAngleFromPoint(x, y)
  }, [])

  const nudgeAim = useCallback((direction: -1 | 1, step = 0.06) => {
    viewRef.current.aimAngle = clampAngle(viewRef.current.aimAngle + direction * step)
  }, [])

  const shoot = useCallback(
    (angle?: number) => {
      const v = viewRef.current
      if (v.status !== 'aiming') return
      if (typeof angle === 'number') v.aimAngle = clampAngle(angle)
      const config = DIFFICULTY_CONFIGS[difficultyRef.current]
      v.shot = launchShotBubble(createShotBubble(v.currentColor), v.aimAngle, config.shotSpeed)
      setStatus('shooting')
    },
    [setStatus],
  )

  const resolveLanding = useCallback(
    (bubble: ShotBubble, landing: { row: number; col: number }) => {
      const v = viewRef.current
      const config = DIFFICULTY_CONFIGS[difficultyRef.current]

      const withBubble = cloneGrid(v.grid)
      withBubble[landing.row][landing.col] = bubble.color

      const { grid: settled, result } = settleBubble(v.grid, landing.row, landing.col, bubble.color, v.rowParity)
      const matched = keysToCells(result.matched, withBubble)
      const floating = keysToCells(result.floating, withBubble)
      const gained = matched.length * POINTS_PER_MATCHED_BUBBLE + floating.length * POINTS_PER_FLOATING_BUBBLE

      const parityBefore = v.rowParity
      let parity = parityBefore
      let grid = settled
      let shots = v.shotsUntilNewRow
      let rowInserted = false
      let outcome: 'won' | 'lost' | null = null

      if (isBoardCleared(grid)) {
        outcome = 'won'
      } else if (isGameOver(grid)) {
        outcome = 'lost'
      } else {
        shots -= 1
        if (shots <= 0) {
          const inserted = insertRowAtTop(grid, config.colorCount, parity)
          grid = inserted.grid
          parity = inserted.parity
          shots = config.shotsPerNewRow
          rowInserted = true
          if (isGameOver(grid)) outcome = 'lost'
        }
      }

      const colors = activeColors(grid)
      v.grid = grid
      v.rowParity = parity
      v.shot = null
      v.shotsUntilNewRow = shots
      v.currentColor = colors.includes(v.nextColor) ? v.nextColor : randomColor(colors)
      v.nextColor = randomColor(colors)
      seqRef.current += 1
      v.event = {
        seq: seqRef.current,
        kind: 'shot',
        parity: parityBefore,
        landed: { row: landing.row, col: landing.col, color: bubble.color, fromX: bubble.x, fromY: bubble.y },
        matched,
        floating,
        gained,
        rowInserted,
      }

      if (gained > 0) {
        scoreRef.current += gained
        setScore(scoreRef.current)
      }

      if (!outcome) {
        setShotsFired((n) => n + 1)
        setStatus('aiming')
        return
      }
      setShotsFired(0)

      // Save the best score and hold the overlay back briefly so the last pop animation is visible.
      const diff = difficultyRef.current
      const finalScore = scoreRef.current
      if (finalScore > (highScoresRef.current[diff] || 0)) {
        const next = { ...highScoresRef.current, [diff]: finalScore }
        highScoresRef.current = next
        saveHighScores(next)
        setHighScores(next)
        setIsNewBest(true)
      }
      const finalOutcome = outcome
      endTimerRef.current = setTimeout(() => {
        endTimerRef.current = null
        setStatus(finalOutcome)
      }, END_OVERLAY_DELAY_MS)
    },
    [setStatus],
  )

  // Physics loop: only runs while a bubble is in flight. Sub-steps keep collisions accurate at high speed.
  useEffect(() => {
    if (gameStatus !== 'shooting') return

    let animationFrameId: number
    let lastTime = performance.now()

    const tick = (now: number) => {
      const v = viewRef.current
      const flying = v.shot
      if (!flying) return

      const dt = Math.min(Math.max((now - lastTime) / (1000 / 60), 0.1), 2.5)
      lastTime = now

      const steps = Math.max(1, Math.ceil((Math.hypot(flying.vx, flying.vy) * dt) / 6))
      let bubble = flying
      for (let i = 0; i < steps; i++) {
        bubble = stepShotBubble(bubble, dt / steps)
        const landing = findLandingCell(bubble, v.grid, v.rowParity)
        if (landing) {
          resolveLanding(bubble, landing)
          return
        }
      }

      v.shot = bubble
      animationFrameId = requestAnimationFrame(tick)
    }

    animationFrameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrameId)
  }, [gameStatus, resolveLanding])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        nudgeAim(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nudgeAim(1)
      } else if (e.key === ' ') {
        e.preventDefault()
        shoot()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nudgeAim, shoot])

  const isGameActive = (gameStatus === 'aiming' || gameStatus === 'shooting') && shotsFired > 0

  return {
    viewRef,
    isGameActive,
    difficulty,
    gameStatus,
    score,
    bestScore: highScores[difficulty] || 0,
    isNewBest,
    aimAt,
    nudgeAim,
    shoot,
    startGame,
    resetGame,
    changeDifficulty,
  }
}
