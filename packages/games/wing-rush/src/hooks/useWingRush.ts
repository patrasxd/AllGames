import { useState, useEffect, useRef, useCallback } from 'react'
import type { Bird, Pipe, Particle, Difficulty, GameStatus, HighScores } from '../types'
import {
  createInitialBird,
  createPipe,
  checkCollisions,
  createFlapParticles,
  updateParticles,
  stepBirdPhysics,
  stepPipePosition,
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

export function useWingRush() {
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
  const changeDifficulty = useCallback(
    (diff: Difficulty) => {
      setDifficulty(diff)
      resetGame()
    },
    [resetGame],
  )

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

  // Main Game Loop with delta-time correction
  useEffect(() => {
    let animationFrameId: number
    let lastTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - lastTime
      lastTime = now

      // Normalize delta time to 60fps base (16.667ms per frame = dt 1.0)
      // Clamp between 0.1 and 3.0 to prevent large physics jumps on tab blur/resume
      const dt = Math.min(Math.max(elapsed / (1000 / 60), 0.1), 3.0)

      const { gameStatus: curStatus, difficulty: curDiff } = stateRef.current
      const config = DIFFICULTY_CONFIGS[curDiff]

      if (curStatus === 'ready') {
        // Gentle bobbing hover scaled by dt
        stateRef.current.bobAngle += 0.05 * dt
        stateRef.current.bird.y = createInitialBird().y + Math.sin(stateRef.current.bobAngle) * 8
        stateRef.current.bird.vy = 0
        stateRef.current.bird.angle = 0
        stateRef.current.bird.wingPhase += 0.08 * dt
        setBird({ ...stateRef.current.bird })
      } else if (curStatus === 'playing') {
        // 1. Physics update with dt scaling
        const currentBird = stepBirdPhysics(stateRef.current.bird, config, dt)
        stateRef.current.bird = currentBird

        // 2. Pipe generation scaled by dt
        stateRef.current.pipeCounter += dt
        if (stateRef.current.pipeCounter >= config.pipeInterval) {
          stateRef.current.pipeCounter = 0
          const newPipe = createPipe(stateRef.current.nextPipeId++, curDiff)
          stateRef.current.pipes.push(newPipe)
        }

        // 3. Move pipes with dt scaling & check scoring
        let currentScore = stateRef.current.score
        const updatedPipes: Pipe[] = []

        for (const pipe of stateRef.current.pipes) {
          const movedPipe = stepPipePosition(pipe, config, dt)
          const nextX = movedPipe.x

          // Score when passing bird center
          if (!movedPipe.passed && nextX + movedPipe.width < BIRD_X) {
            movedPipe.passed = true
            currentScore++
            stateRef.current.score = currentScore
            setScore(currentScore)
          }

          // Keep active pipes
          if (nextX + movedPipe.width > -20) {
            updatedPipes.push(movedPipe)
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
