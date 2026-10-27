import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { GameStatus, LevelConfig, Move, PlayerProgress, Point, Rope, RopeEnd, VanishingRope } from '../types'
import { getLevelConfig, MAX_LEVEL } from '../logic/levels'
import { cloneRopes, findConflicts, pathBlocked, releaseFreeRopes, tryMoveEnd } from '../logic/engine'
import { buildSlots, ropeClearance } from '../logic/layouts'
import { safeGetItem, safeSetJSON } from '@allgames/ui'
import { motionAllowed, VANISH_MS } from '../components/motion'

const SAVE_KEY = 'allgames:untangle:progress'

function loadProgress(): PlayerProgress {
  try {
    const raw = safeGetItem(SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const unlockedLevel =
        Number.isInteger(parsed.unlockedLevel) && parsed.unlockedLevel >= 1 ? parsed.unlockedLevel : 1
      return {
        unlockedLevel,
        currentLevel:
          Number.isInteger(parsed.currentLevel) && parsed.currentLevel >= 1 && parsed.currentLevel <= unlockedLevel
            ? parsed.currentLevel
            : unlockedLevel,
        levelStars: parsed.levelStars && typeof parsed.levelStars === 'object' ? parsed.levelStars : {},
        levelBestMoves: parsed.levelBestMoves && typeof parsed.levelBestMoves === 'object' ? parsed.levelBestMoves : {},
      }
    }
  } catch {
    // ignore corrupt data
  }
  return { unlockedLevel: 1, levelStars: {}, levelBestMoves: {} }
}

function saveProgress(progress: PlayerProgress) {
  safeSetJSON(SAVE_KEY, progress)
}

export function starsFor(config: Pick<LevelConfig, 'starThresholds'>, moves: number): number {
  if (moves <= config.starThresholds[0]) return 3
  if (moves <= config.starThresholds[1]) return 2
  return 1
}

/** Ropes that cross nothing are not on the board: only the tangled ones are in play. */
function startingRopes(level: number): Rope[] {
  const config = getLevelConfig(level)
  return releaseFreeRopes(buildSlots(config.layout), cloneRopes(config.ropes)).remaining
}

export function useUntangle({ animate = true }: { animate?: boolean } = {}) {
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress)
  const [currentLevel, setCurrentLevel] = useState(() => progress.currentLevel ?? progress.unlockedLevel)
  const config = useMemo(() => getLevelConfig(currentLevel), [currentLevel])
  const slots: Point[] = useMemo(() => buildSlots(config.layout), [config.layout])
  const clearance = useMemo(() => ropeClearance(config.layout), [config.layout])

  const [ropes, setRopes] = useState<Rope[]>(() => startingRopes(currentLevel))
  const [history, setHistory] = useState<Rope[][]>([])
  const [moves, setMoves] = useState(0)
  const [status, setStatus] = useState<GameStatus>('playing')
  const [isNewBest, setIsNewBest] = useState(false)
  const [vanishing, setVanishing] = useState<VanishingRope[]>([])
  // The result screen waits for the last rope to finish vanishing.
  const [resultReady, setResultReady] = useState(false)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const conflicts = useMemo(() => findConflicts(slots, ropes), [slots, ropes])

  useEffect(() => {
    saveProgress({ ...progress, currentLevel })
  }, [progress, currentLevel])

  const loadLevel = useCallback(
    (level: number) => {
      clearTimers()
      setCurrentLevel(level)
      setRopes(startingRopes(level))
      setHistory([])
      setMoves(0)
      setStatus('playing')
      setIsNewBest(false)
      setVanishing([])
      setResultReady(false)
    },
    [clearTimers],
  )

  const restartLevel = useCallback(() => loadLevel(currentLevel), [currentLevel, loadLevel])

  const goToLevel = useCallback(
    (level: number) => {
      if (level < 1 || level > progress.unlockedLevel) return
      loadLevel(level)
    },
    [progress.unlockedLevel, loadLevel],
  )

  const nextLevel = useCallback(() => loadLevel(currentLevel + 1), [currentLevel, loadLevel])

  /** Moves one rope end to an empty slot. `dragged` means the peg was carried there by hand. Returns whether the move was legal. */
  const moveEnd = useCallback(
    (ropeId: number, end: RopeEnd, to: number, dragged = false): boolean => {
      if (status !== 'playing') return false
      // A dragged peg was already kept from crossing ropes above it along its whole way; a tap is checked here.
      const next = tryMoveEnd(slots, clearance, ropes, ropeId, end, to, { checkPath: !dragged })
      if (!next) return false

      // Ropes that no longer cross anything are untangled: they leave the board.
      const { remaining, freed } = releaseFreeRopes(slots, next)
      const playAnimation = animate && motionAllowed()

      setHistory((prev) => [...prev, ropes])
      setRopes(remaining)
      const nextMoves = moves + 1
      setMoves(nextMoves)

      if (freed.length > 0 && playAnimation) {
        const start = performance.now()
        setVanishing((prev) => [...prev, ...freed.map((rope) => ({ rope, start }))])
        const done = window.setTimeout(() => {
          setVanishing((prev) => prev.filter((v) => v.start !== start))
        }, VANISH_MS + 80)
        timersRef.current.push(done)
      }

      if (remaining.length === 0) {
        if (playAnimation) {
          timersRef.current.push(window.setTimeout(() => setResultReady(true), VANISH_MS + 250))
        } else {
          setResultReady(true)
        }
        setStatus('won')
        const stars = starsFor(config, nextMoves)
        const prevBest = progress.levelBestMoves[currentLevel]
        const isBetter = prevBest === undefined || nextMoves < prevBest
        setIsNewBest(isBetter)

        setProgress((prev) => {
          const updated: PlayerProgress = {
            unlockedLevel: Math.max(prev.unlockedLevel, currentLevel + 1),
            levelStars: {
              ...prev.levelStars,
              [currentLevel]: Math.max(prev.levelStars[currentLevel] ?? 0, stars),
            },
            levelBestMoves: {
              ...prev.levelBestMoves,
              [currentLevel]: isBetter ? nextMoves : prevBest,
            },
          }
          saveProgress({ ...updated, currentLevel })
          return updated
        })
      }
      return true
    },
    [status, ropes, clearance, moves, slots, config, progress, currentLevel, animate],
  )

  /**
   * Whether a rope end may be put in a slot: it must be empty, no rope may end up running through a peg, and
   * the peg must not have to cross a rope lying above its own. `from` is where the peg is (it defaults to its hole).
   */
  const canMove = useCallback(
    (ropeId: number, end: RopeEnd, to: number, from?: Point): boolean => {
      const rope = ropes.find((r) => r.id === ropeId)
      if (!rope || tryMoveEnd(slots, clearance, ropes, ropeId, end, to, { checkPath: false }) === null) return false
      return !pathBlocked(slots, clearance, ropes, ropeId, from ?? slots[rope[end]], slots[to])
    },
    [slots, clearance, ropes],
  )

  const undo = useCallback(() => {
    if (history.length === 0 || status !== 'playing') return
    clearTimers()
    setVanishing([])
    setRopes(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
    setMoves((m) => Math.max(0, m - 1))
  }, [history, status, clearTimers])

  const isGameActive = moves > 0 && status === 'playing'
  const canUndo = history.length > 0 && status === 'playing'

  return {
    currentLevel,
    maxLevel: Math.max(MAX_LEVEL, progress.unlockedLevel),
    config,
    slots,
    clearance,
    ropes,
    conflicts,
    moves,
    status,
    isNewBest,
    vanishing,
    resultReady,
    progress,
    isGameActive,
    canUndo,
    moveEnd,
    canMove,
    undo,
    restartLevel,
    nextLevel,
    goToLevel,
  }
}

export type { Move, VanishingRope }
