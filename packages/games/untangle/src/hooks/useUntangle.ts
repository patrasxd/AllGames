import { useState, useEffect, useCallback, useMemo } from 'react'
import type { GameStatus, LevelConfig, Move, PlayerProgress, Point, Rope, RopeEnd } from '../types'
import { getLevelConfig, MAX_LEVEL } from '../logic/levels'
import { cloneRopes, findConflicts, isEndFree, tryMoveEnd } from '../logic/engine'
import { buildSlots, ropeClearance } from '../logic/layouts'
import { safeGetItem, safeSetJSON } from '@allgames/ui'

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

export function useUntangle() {
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress)
  const [currentLevel, setCurrentLevel] = useState(() => progress.currentLevel ?? progress.unlockedLevel)
  const config = useMemo(() => getLevelConfig(currentLevel), [currentLevel])
  const slots: Point[] = useMemo(() => buildSlots(config.layout), [config.layout])
  const clearance = useMemo(() => ropeClearance(config.layout), [config.layout])

  const [ropes, setRopes] = useState<Rope[]>(() => cloneRopes(config.ropes))
  const [history, setHistory] = useState<Rope[][]>([])
  const [moves, setMoves] = useState(0)
  const [status, setStatus] = useState<GameStatus>('playing')
  const [isNewBest, setIsNewBest] = useState(false)

  const conflicts = useMemo(() => findConflicts(slots, ropes), [slots, ropes])

  useEffect(() => {
    saveProgress({ ...progress, currentLevel })
  }, [progress, currentLevel])

  const loadLevel = useCallback((level: number) => {
    const next = getLevelConfig(level)
    setCurrentLevel(level)
    setRopes(cloneRopes(next.ropes))
    setHistory([])
    setMoves(0)
    setStatus('playing')
    setIsNewBest(false)
  }, [])

  const restartLevel = useCallback(() => loadLevel(currentLevel), [currentLevel, loadLevel])

  const goToLevel = useCallback(
    (level: number) => {
      if (level < 1 || level > progress.unlockedLevel) return
      loadLevel(level)
    },
    [progress.unlockedLevel, loadLevel],
  )

  const nextLevel = useCallback(() => loadLevel(currentLevel + 1), [currentLevel, loadLevel])

  /** Moves one rope end to an empty slot. Returns whether the move was legal. */
  const moveEnd = useCallback(
    (ropeId: number, end: RopeEnd, to: number): boolean => {
      if (status !== 'playing') return false
      const next = tryMoveEnd(slots, clearance, ropes, ropeId, end, to)
      if (!next) return false

      setHistory((prev) => [...prev, ropes])
      setRopes(next)
      const nextMoves = moves + 1
      setMoves(nextMoves)

      if (findConflicts(slots, next).length === 0) {
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
    [status, ropes, clearance, moves, slots, config, progress, currentLevel],
  )

  /** Whether a rope end may be moved to a slot: it must be empty, and no rope may end up running through a peg. */
  const canMove = useCallback(
    (ropeId: number, end: RopeEnd, to: number): boolean =>
      tryMoveEnd(slots, clearance, ropes, ropeId, end, to) !== null,
    [slots, clearance, ropes],
  )

  /** Whether a rope end can be picked up: it must not be buried under another rope. */
  const canGrab = useCallback(
    (ropeId: number, end: RopeEnd): boolean => isEndFree(slots, ropes, ropeId, end),
    [slots, ropes],
  )

  const undo = useCallback(() => {
    if (history.length === 0 || status !== 'playing') return
    setRopes(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
    setMoves((m) => Math.max(0, m - 1))
  }, [history, status])

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
    progress,
    isGameActive,
    canUndo,
    moveEnd,
    canMove,
    canGrab,
    undo,
    restartLevel,
    nextLevel,
    goToLevel,
  }
}

export type { Move }
