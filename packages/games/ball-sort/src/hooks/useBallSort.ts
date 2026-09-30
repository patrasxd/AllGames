import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { LevelConfig, Move, PlayerProgress, Tube } from '../types'
import { generateLevel } from '../logic/generator'
import { canPour, isSolved, pour } from '../logic/engine'

const SAVE_KEY = 'allgames:ball-sort:progress'
const MAX_LEVEL = 100

function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        unlockedLevel: typeof parsed.unlockedLevel === 'number' ? parsed.unlockedLevel : 1,
        levelStars: parsed.levelStars && typeof parsed.levelStars === 'object' ? parsed.levelStars : {},
        levelBestMoves: parsed.levelBestMoves && typeof parsed.levelBestMoves === 'object' ? parsed.levelBestMoves : {},
      }
    }
  } catch {
    // ignore
  }
  return { unlockedLevel: 1, levelStars: {}, levelBestMoves: {} }
}

function saveProgress(progress: PlayerProgress) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress))
  } catch {
    // ignore
  }
}

function starsFor(config: LevelConfig, moves: number): number {
  if (moves <= config.starThresholds[0]) return 3
  if (moves <= config.starThresholds[1]) return 2
  return 1
}

interface HistoryEntry {
  tubes: Tube[]
}

export function useBallSort() {
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [levelData, setLevelData] = useState(() => generateLevel(1))
  const [tubes, setTubes] = useState<Tube[]>(() => levelData.tubes)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [status, setStatus] = useState<'playing' | 'won'>('playing')
  const [isNewBest, setIsNewBest] = useState(false)
  const [lastMove, setLastMove] = useState<Move | null>(null)
  const lastMoveClearRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const config = levelData.config

  const clearLastMove = useCallback(() => {
    if (lastMoveClearRef.current) clearTimeout(lastMoveClearRef.current)
    lastMoveClearRef.current = setTimeout(() => setLastMove(null), 1000)
  }, [])

  const loadLevel = useCallback((level: number) => {
    const data = generateLevel(level)
    setLevelData(data)
    setCurrentLevel(level)
    setTubes(data.tubes)
    setHistory([])
    setSelected(null)
    setMoves(0)
    setStatus('playing')
    setIsNewBest(false)
    setLastMove(null)
  }, [])

  useEffect(() => {
    loadLevel(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => { if (lastMoveClearRef.current) clearTimeout(lastMoveClearRef.current) }, [])

  const restartLevel = useCallback(() => {
    loadLevel(currentLevel)
  }, [currentLevel, loadLevel])

  const goToLevel = useCallback(
    (level: number) => {
      if (level < 1 || level > MAX_LEVEL) return
      if (level > progress.unlockedLevel) return
      loadLevel(level)
    },
    [progress.unlockedLevel, loadLevel],
  )

  const selectTube = useCallback(
    (index: number) => {
      if (status !== 'playing') return

      if (selected === null) {
        if (tubes[index].length > 0) setSelected(index)
        return
      }
      if (selected === index) {
        setSelected(null)
        return
      }
      if (!canPour(tubes, selected, index, config.capacity)) {
        // Tapping a tube you can't pour onto re-targets the selection to that tube instead
        // (if it has something to pick up), rather than doing nothing.
        setSelected(tubes[index].length > 0 ? index : null)
        return
      }

      const result = pour(tubes, selected, index, config.capacity)
      if (!result) return

      setHistory((h) => [...h, { tubes }])
      setTubes(result.tubes)
      setSelected(null)
      setMoves((m) => m + 1)
      setLastMove(result.move)
      clearLastMove()

      if (isSolved(result.tubes)) {
        const finalMoves = moves + 1
        const stars = starsFor(config, finalMoves)
        setStatus('won')
        setProgress((prev) => {
          const prevBest = prev.levelBestMoves[currentLevel]
          const improved = prevBest === undefined || finalMoves < prevBest
          const next: PlayerProgress = {
            unlockedLevel: Math.max(prev.unlockedLevel, Math.min(MAX_LEVEL, currentLevel + 1)),
            levelStars: { ...prev.levelStars, [currentLevel]: Math.max(prev.levelStars[currentLevel] ?? 0, stars) },
            levelBestMoves: improved ? { ...prev.levelBestMoves, [currentLevel]: finalMoves } : prev.levelBestMoves,
          }
          saveProgress(next)
          if (improved) setIsNewBest(true)
          return next
        })
      }
    },
    [selected, tubes, config, status, moves, currentLevel, clearLastMove],
  )

  const undo = useCallback(() => {
    if (status !== 'playing' || history.length === 0) return
    const last = history[history.length - 1]
    setTubes(last.tubes)
    setHistory((h) => h.slice(0, -1))
    setMoves((m) => Math.max(0, m - 1))
    setSelected(null)
    setLastMove(null)
  }, [history, status])

  const nextLevel = useCallback(() => {
    if (currentLevel < MAX_LEVEL) loadLevel(currentLevel + 1)
  }, [currentLevel, loadLevel])

  const isGameActive = useMemo(() => status === 'playing' && moves > 0, [status, moves])

  return {
    currentLevel,
    maxLevel: MAX_LEVEL,
    config,
    tubes,
    selected,
    moves,
    status,
    isNewBest,
    progress,
    isGameActive,
    lastMove,
    canUndo: history.length > 0,
    selectTube,
    undo,
    restartLevel,
    nextLevel,
    goToLevel,
  }
}

