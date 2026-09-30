import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Block, LevelConfig, PlayerProgress } from '../types'
import { getLevelConfig, MAX_LEVEL } from '../logic/levels'
import { moveBlock as engineMoveBlock, isWon } from '../logic/engine'

const SAVE_KEY = 'allgames:block-out:progress'

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

export function starsFor(config: LevelConfig, moves: number): number {
  if (moves <= config.starThresholds[0]) return 3
  if (moves <= config.starThresholds[1]) return 2
  return 1
}

interface HistoryEntry {
  blocks: Block[]
}

export function useBlockOut() {
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress)
  const [currentLevel, setCurrentLevel] = useState(1)
  const config = useMemo(() => getLevelConfig(currentLevel), [currentLevel])
  const [blocks, setBlocks] = useState<Block[]>(() => config.blocks.map((b) => ({ ...b })))
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [moves, setMoves] = useState(0)
  const [status, setStatus] = useState<'playing' | 'won'>('playing')
  const [isNewBest, setIsNewBest] = useState(false)

  const loadLevel = useCallback((level: number) => {
    const nextCfg = getLevelConfig(level)
    setCurrentLevel(level)
    setBlocks(nextCfg.blocks.map((b) => ({ ...b })))
    setHistory([])
    setSelectedBlockId(null)
    setMoves(0)
    setStatus('playing')
    setIsNewBest(false)
  }, [])

  useEffect(() => {
    loadLevel(1)
  }, [loadLevel])

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

  const slideBlock = useCallback(
    (blockId: string, newPos: number): boolean => {
      if (status !== 'playing') return false

      const result = engineMoveBlock(blocks, blockId, newPos)
      if (!result) return false

      setHistory((prev) => [...prev, { blocks }])
      setBlocks(result.blocks)
      const nextMoves = moves + 1
      setMoves(nextMoves)

      if (isWon(result.blocks)) {
        setStatus('won')
        const stars = starsFor(config, nextMoves)
        const prevBest = progress.levelBestMoves[currentLevel]
        const isBetter = prevBest === undefined || nextMoves < prevBest
        setIsNewBest(isBetter)

        setProgress((prev) => {
          const next: PlayerProgress = {
            unlockedLevel: Math.max(prev.unlockedLevel, Math.min(MAX_LEVEL, currentLevel + 1)),
            levelStars: {
              ...prev.levelStars,
              [currentLevel]: Math.max(prev.levelStars[currentLevel] ?? 0, stars),
            },
            levelBestMoves: {
              ...prev.levelBestMoves,
              [currentLevel]: isBetter ? nextMoves : prevBest,
            },
          }
          saveProgress(next)
          return next
        })
      }

      return true
    },
    [blocks, status, moves, config, progress, currentLevel],
  )

  const undo = useCallback(() => {
    if (history.length === 0 || status !== 'playing') return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setBlocks(prev.blocks)
    setMoves((m) => Math.max(0, m - 1))
  }, [history, status])

  const nextLevel = useCallback(() => {
    if (currentLevel < MAX_LEVEL) {
      loadLevel(currentLevel + 1)
    }
  }, [currentLevel, loadLevel])

  const isGameActive = moves > 0 && status === 'playing'
  const canUndo = history.length > 0 && status === 'playing'

  return {
    currentLevel,
    maxLevel: MAX_LEVEL,
    config,
    blocks,
    moves,
    status,
    isNewBest,
    progress,
    isGameActive,
    canUndo,
    selectedBlockId,
    selectBlock: setSelectedBlockId,
    slideBlock,
    undo,
    restartLevel,
    nextLevel,
    goToLevel,
  }
}
