import { useState, useEffect, useRef, useCallback } from 'react'
import type { Bird, Pipe, Particle, Difficulty, GameStatus, HighScores } from '../types'
import {
  createInitialBird,
  createPipe,
  checkCollisions,
  createFlapParticles,
  updateParticles,
  DIFFICULTY_CONFIGS,
  BIRD_X,
} from '../logic/engine'

const SAVE_KEY = 'allgames:wing-rush:highscores'

function loadSavedHighScores(): HighScores {
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

export function useFlappyBird() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready')
  const [score, setScore] = useState<number>(0)
  const [highScores, setHighScores] = useState<HighScores>(loadSavedHighScores)
  const [isNewBest, setIsNewBest] = useState<boolean>(false)
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false)

  const [bird, setBird] = useState<Bird>(createInitialBird)
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [particles, setParticles] = useState<Particle[]>([])

  // Engine refs to prevent stale state in requestAnimationFrame
  const stateRef = useRef({
    gameStatus: 'ready' as GameStatus,
    difficulty: 'normal' as Difficulty,
    score: 0,
    bird: createInitialBird(),
    pipes: [] as Pipe[],
    particles: [] as Particle[],
    pipeCounter: 0,
    nextPipeId: 1,
    bobAngle: 0,
  })

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current.difficulty = difficulty
  }, [difficulty])

  useEffect(() => {
    stateRef.current.gameStatus = gameStatus
  }, [gameStatus])

  // Reset Game
  const resetGame = useCallback(() => {
    const freshBird = createInitialBird()
    stateRef.current.bird = freshBird
    stateRef.current.pipes = []
    stateRef.current.particles = []
    stateRef.current.score = 0
    stateRef.current.pipeCounter = 0
    stateRef.current.nextPipeId = 1
    stateRef.current.gameStatus = 'ready'
    stateRef.current.bobAngle = 0

    setBird(freshBird)
    setPipes([])
    setParticles([])
    setScore(0)
    setIsNewBest(false)
    setGameStatus('ready')
  }, [])

  // Change difficulty
  const changeDifficulty = useCallback((diff: Difficulty) => {
    setDifficulty(diff)
    resetGame()
  }, [resetGame])

  // Flap Action
  const flap = useCallback(() => {
    const { gameStatus: curStatus, difficulty: curDiff } = stateRef.current
    if (curStatus === 'gameover') return

    const config = DIFFICULTY_CONFIGS[curDiff]

    if (curStatus === 'ready') {
      stateRef.current.gameStatus = 'playing'
      setGameStatus('playing')
    }

    // Apply jump impulse
    stateRef.current.bird.vy = config.jumpForce
    stateRef.current.bird.angle = -Math.PI / 5

    // Spawn vapor particles
    const newParticles = createFlapParticles(stateRef.current.bird.x, stateRef.current.bird.y)
    stateRef.current.particles = [...stateRef.current.particles, ...newParticles]
  }, [])

  // Main 60fps Game Loop
  useEffect(() => {
    let animationFrameId: number

    const tick = () => {
      const { gameStatus: curStatus, difficulty: curDiff } = stateRef.current
      const config = DIFFICULTY_CONFIGS[curDiff]

      if (curStatus === 'ready') {
        // Gentle bobbing hover
        stateRef.current.bobAngle += 0.05
        stateRef.current.bird.y = createInitialBird().y + Math.sin(stateRef.current.bobAngle) * 8
        stateRef.current.bird.vy = 0
        stateRef.current.bird.angle = 0
        stateRef.current.bird.wingPhase += 0.08
        setBird({ ...stateRef.current.bird })
      } else if (curStatus === 'playing') {
        const currentBird = stateRef.current.bird

        // 1. Physics update
        currentBird.vy += config.gravity
        currentBird.y += currentBird.vy
        currentBird.angle = Math.min(Math.PI / 2.8, Math.max(-Math.PI / 5, currentBird.vy * 0.08))
        currentBird.wingPhase += currentBird.vy < 0 ? 0.35 : 0.12

        // 2. Pipe generation
        stateRef.current.pipeCounter++
        if (stateRef.current.pipeCounter >= config.pipeInterval) {
          stateRef.current.pipeCounter = 0
          const newPipe = createPipe(stateRef.current.nextPipeId++, curDiff)
          stateRef.current.pipes.push(newPipe)
        }

        // 3. Move pipes & check scoring
        let currentScore = stateRef.current.score
        const updatedPipes: Pipe[] = []

        for (const pipe of stateRef.current.pipes) {
          const nextX = pipe.x - config.pipeSpeed

          // Score when passing bird center
          if (!pipe.passed && nextX + pipe.width < BIRD_X) {
            pipe.passed = true
            currentScore++
            stateRef.current.score = currentScore
            setScore(currentScore)
          }

          // Keep active pipes
          if (nextX + pipe.width > -20) {
            updatedPipes.push({ ...pipe, x: nextX })
          }
        }
        stateRef.current.pipes = updatedPipes

        // 4. Update particles
        stateRef.current.particles = updateParticles(stateRef.current.particles)

        // 5. Check Collisions
        const isCrashed = checkCollisions(currentBird, updatedPipes)
        if (isCrashed) {
          stateRef.current.gameStatus = 'gameover'
          setGameStatus('gameover')

          // Update High Score
          const curBest = highScores[curDiff] || 0
          if (currentScore > curBest) {
            const nextHighScores = { ...highScores, [curDiff]: currentScore }
            setHighScores(nextHighScores)
            saveHighScores(nextHighScores)
            setIsNewBest(true)
          }
        }

        // Update React rendering states
        setBird({ ...currentBird })
        setPipes([...updatedPipes])
        setParticles([...stateRef.current.particles])
      }

      animationFrameId = requestAnimationFrame(tick)
    }

    animationFrameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrameId)
  }, [highScores])

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        flap()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flap])

  return {
    difficulty,
    gameStatus,
    score,
    bestScore: highScores[difficulty] || 0,
    isNewBest,
    isRulesOpen,
    setIsRulesOpen,
    bird,
    pipes,
    particles,
    flap,
    resetGame,
    changeDifficulty,
  }
}
