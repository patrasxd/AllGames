import { useState, useEffect, useCallback, useRef } from 'react'
import type { Direction, Point, GameStatus, SpeedMode, MapMode } from '../types'
import {
  MAP_CONFIGS,
  SPEED_INTERVALS,
  INITIAL_DIRECTION,
  getInitialSnake,
  isOppositeDirection,
  getNextHead,
  checkWallCollision,
  checkSelfCollision,
  checkObstacleCollision,
  spawnFood,
} from '../logic'

const MAP_KEY = 'allgames:snake:map'
const SPEED_KEY = 'allgames:snake:speed'

function getHighScoreKey(map: MapMode): string {
  return `allgames:snake:high-score:${map}`
}

function loadHighScore(map: MapMode): number {
  try {
    const raw = localStorage.getItem(getHighScoreKey(map))
    return raw ? parseInt(raw, 10) || 0 : 0
  } catch {
    return 0
  }
}

function saveHighScore(map: MapMode, score: number) {
  try {
    localStorage.setItem(getHighScoreKey(map), score.toString())
  } catch {
    // Storage unavailable
  }
}

function loadMapMode(): MapMode {
  try {
    const raw = localStorage.getItem(MAP_KEY)
    if (raw === 'classic' || raw === 'obstacles' || raw === 'big') return raw
    return 'classic'
  } catch {
    return 'classic'
  }
}

function saveMapMode(map: MapMode) {
  try {
    localStorage.setItem(MAP_KEY, map)
  } catch {
    // Storage unavailable
  }
}

function loadSpeed(): SpeedMode {
  try {
    const raw = localStorage.getItem(SPEED_KEY)
    if (raw === 'relaxed' || raw === 'normal' || raw === 'fast') return raw
    return 'normal'
  } catch {
    return 'normal'
  }
}

function saveSpeed(speed: SpeedMode) {
  try {
    localStorage.setItem(SPEED_KEY, speed)
  } catch {
    // Storage unavailable
  }
}

export function useSnake(options?: { isEink?: boolean }) {
  const isEink = options?.isEink ?? false

  const [mapMode, setMapModeState] = useState<MapMode>(loadMapMode)
  const mapConfig = MAP_CONFIGS[mapMode]

  const [snake, setSnake] = useState<Point[]>(() => getInitialSnake(mapConfig.gridSize))
  const [food, setFood] = useState<Point>(() =>
    spawnFood(getInitialSnake(mapConfig.gridSize), mapConfig.obstacles, mapConfig.gridSize)
  )
  const [status, setStatus] = useState<GameStatus>('IDLE')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState<number>(() => loadHighScore(mapMode))
  const [speed, setSpeedState] = useState<SpeedMode>(isEink ? 'relaxed' : loadSpeed)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  const directionRef = useRef<Direction>(INITIAL_DIRECTION)
  const nextDirectionRef = useRef<Direction>(INITIAL_DIRECTION)
  const statusRef = useRef<GameStatus>(status)
  statusRef.current = status
  const snakeRef = useRef<Point[]>(snake)
  snakeRef.current = snake
  const foodRef = useRef<Point>(food)
  foodRef.current = food
  const scoreRef = useRef(score)
  scoreRef.current = score
  const mapModeRef = useRef<MapMode>(mapMode)
  mapModeRef.current = mapMode

  const setSpeed = useCallback((s: SpeedMode) => {
    setSpeedState(s)
    saveSpeed(s)
  }, [])

  const setMapMode = useCallback((m: MapMode) => {
    setMapModeState(m)
    saveMapMode(m)
    const cfg = MAP_CONFIGS[m]
    const initial = getInitialSnake(cfg.gridSize)
    setSnake(initial)
    setFood(spawnFood(initial, cfg.obstacles, cfg.gridSize))
    directionRef.current = INITIAL_DIRECTION
    nextDirectionRef.current = INITIAL_DIRECTION
    setScore(0)
    setHighScore(loadHighScore(m))
    setIsNewHighScore(false)
    setStatus('IDLE')
  }, [])

  const changeDirection = useCallback((newDir: Direction) => {
    if (statusRef.current !== 'PLAYING') {
      if (statusRef.current === 'IDLE' || statusRef.current === 'PAUSED') {
        setStatus('PLAYING')
      }
    }

    if (!isOppositeDirection(directionRef.current, newDir)) {
      nextDirectionRef.current = newDir
    }
  }, [])

  const startGame = useCallback(() => {
    const cfg = MAP_CONFIGS[mapModeRef.current]
    const initial = getInitialSnake(cfg.gridSize)
    setSnake(initial)
    setFood(spawnFood(initial, cfg.obstacles, cfg.gridSize))
    directionRef.current = INITIAL_DIRECTION
    nextDirectionRef.current = INITIAL_DIRECTION
    setScore(0)
    setIsNewHighScore(false)
    setStatus('PLAYING')
  }, [])

  const pauseGame = useCallback(() => {
    if (statusRef.current === 'PLAYING') setStatus('PAUSED')
  }, [])

  const resumeGame = useCallback(() => {
    if (statusRef.current === 'PAUSED') setStatus('PLAYING')
  }, [])

  const resetHighScore = useCallback(() => {
    setHighScore(0)
    saveHighScore(mapMode, 0)
  }, [mapMode])

  // Game Loop Tick
  useEffect(() => {
    if (status !== 'PLAYING') return

    const baseInterval = SPEED_INTERVALS[speed]
    const intervalMs = isEink ? Math.max(baseInterval, 180) : baseInterval

    const timer = setInterval(() => {
      const currentSnake = snakeRef.current
      const currentFood = foodRef.current
      const currentMap = mapModeRef.current
      const cfg = MAP_CONFIGS[currentMap]
      const dir = nextDirectionRef.current
      directionRef.current = dir

      const head = currentSnake[0]
      const newHead = getNextHead(head, dir)

      // Wall collision
      if (checkWallCollision(newHead, cfg.gridSize)) {
        setStatus('GAME_OVER')
        return
      }

      // Obstacle collision
      if (checkObstacleCollision(newHead, cfg.obstacles)) {
        setStatus('GAME_OVER')
        return
      }

      // Self collision
      const isEating = newHead.x === currentFood.x && newHead.y === currentFood.y
      const bodyToCheck = isEating ? currentSnake : currentSnake.slice(0, -1)
      if (checkSelfCollision(newHead, bodyToCheck)) {
        setStatus('GAME_OVER')
        return
      }

      if (isEating) {
        const nextSnake = [newHead, ...currentSnake]
        const nextScore = scoreRef.current + 10
        const nextFood = spawnFood(nextSnake, cfg.obstacles, cfg.gridSize)

        setSnake(nextSnake)
        setFood(nextFood)
        setScore(nextScore)

        if (nextScore > highScore) {
          setHighScore(nextScore)
          saveHighScore(currentMap, nextScore)
          setIsNewHighScore(true)
        }
      } else {
        const nextSnake = [newHead, ...currentSnake.slice(0, -1)]
        setSnake(nextSnake)
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [status, speed, isEink, highScore])

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          changeDirection('UP')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          changeDirection('DOWN')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          changeDirection('LEFT')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          changeDirection('RIGHT')
          break
        case ' ':
          e.preventDefault()
          if (statusRef.current === 'PLAYING') pauseGame()
          else if (statusRef.current === 'PAUSED') resumeGame()
          else if (statusRef.current === 'IDLE' || statusRef.current === 'GAME_OVER') startGame()
          break
        case 'Escape':
          if (statusRef.current === 'PLAYING') pauseGame()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [changeDirection, pauseGame, resumeGame, startGame])

  return {
    snake,
    food,
    obstacles: mapConfig.obstacles,
    gridSize: mapConfig.gridSize,
    mapMode,
    direction: directionRef.current,
    status,
    score,
    highScore,
    speed,
    isNewHighScore,
    startGame,
    pauseGame,
    resumeGame,
    changeDirection,
    setSpeed,
    setMapMode,
    resetHighScore,
  }
}
