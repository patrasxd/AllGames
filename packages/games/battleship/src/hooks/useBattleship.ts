import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  BattleshipDifficulty,
  BattleshipMode,
  PlayerGridState,
  GamePhase,
  PlacedShip,
} from '../types'
import { autoPlaceFleet, processShot, createEmptyGrid } from '../logic'
import { getAIMove } from '../ai'

const DIFFICULTY_KEY = 'allgames:battleship:difficulty'
const MODE_KEY = 'allgames:battleship:mode'
const BEST_SHOTS_KEY_PREFIX = 'allgames:battleship:best:'

function loadDifficulty(): BattleshipDifficulty {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY)
    if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw
    return 'medium'
  } catch {
    return 'medium'
  }
}

function saveDifficulty(diff: BattleshipDifficulty) {
  try {
    localStorage.setItem(DIFFICULTY_KEY, diff)
  } catch {
    // Storage unavailable
  }
}

function loadMode(): BattleshipMode {
  try {
    const raw = localStorage.getItem(MODE_KEY)
    if (raw === 'ai' || raw === '2p') return raw
    return 'ai'
  } catch {
    return 'ai'
  }
}

function saveMode(mode: BattleshipMode) {
  try {
    localStorage.setItem(MODE_KEY, mode)
  } catch {
    // Storage unavailable
  }
}

function loadBestShots(diff: BattleshipDifficulty): number | null {
  try {
    const raw = localStorage.getItem(`${BEST_SHOTS_KEY_PREFIX}${diff}`)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

function saveBestShots(diff: BattleshipDifficulty, shots: number) {
  try {
    localStorage.setItem(`${BEST_SHOTS_KEY_PREFIX}${diff}`, String(shots))
  } catch {
    // Storage unavailable
  }
}

function createEmptyPlayerState(): PlayerGridState {
  return {
    ships: [],
    grid: createEmptyGrid(),
    shotsReceived: 0,
  }
}

export function useBattleship(options?: { isEink?: boolean }) {
  const isEink = options?.isEink ?? false

  const [mode, setModeState] = useState<BattleshipMode>(loadMode)
  const [difficulty, setDifficultyState] = useState<BattleshipDifficulty>(loadDifficulty)
  const [phase, setPhase] = useState<GamePhase>('mode-select')

  // Placement state
  const [p1State, setP1State] = useState<PlayerGridState>(createEmptyPlayerState)
  const [p2State, setP2State] = useState<PlayerGridState>(createEmptyPlayerState)
  const [activePlacementPlayer, setActivePlacementPlayer] = useState<'p1' | 'p2'>('p1')

  // Battle state
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1')
  const [winner, setWinner] = useState<'p1' | 'p2' | null>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastShotInfo, setLastShotInfo] = useState<{ hit: boolean; sunkShip: PlacedShip | null } | null>(null)

  const [p1Shots, setP1Shots] = useState(0)
  const [p1Hits, setP1Hits] = useState(0)
  const [bestShots, setBestShots] = useState<number | null>(() => loadBestShots(difficulty))

  const aiTimerRef = useRef<number | null>(null)

  const resetGame = useCallback(
    (newDiff?: BattleshipDifficulty, newMode?: BattleshipMode) => {
      const diffToUse = newDiff ?? difficulty
      const modeToUse = newMode ?? mode

      const autoP1 = autoPlaceFleet()
      setP1State({ ships: autoP1.ships, grid: autoP1.grid, shotsReceived: 0 })

      if (modeToUse === 'ai') {
        const autoP2 = autoPlaceFleet()
        setP2State({ ships: autoP2.ships, grid: autoP2.grid, shotsReceived: 0 })
      } else {
        setP2State(createEmptyPlayerState())
      }

      setActivePlacementPlayer('p1')
      setPhase('placement')
      setCurrentTurn('p1')
      setWinner(null)
      setIsAIThinking(false)
      setLastShotInfo(null)
      setP1Shots(0)
      setP1Hits(0)
      setBestShots(loadBestShots(diffToUse))

      if (aiTimerRef.current !== null) {
        clearTimeout(aiTimerRef.current)
        aiTimerRef.current = null
      }
    },
    [difficulty, mode]
  )

  const setDifficulty = useCallback(
    (d: BattleshipDifficulty) => {
      setDifficultyState(d)
      saveDifficulty(d)
      resetGame(d, mode)
    },
    [mode, resetGame]
  )

  const changeMode = useCallback(
    (m: BattleshipMode) => {
      setModeState(m)
      saveMode(m)
      resetGame(difficulty, m)
    },
    [difficulty, resetGame]
  )

  const autoDeployCurrent = useCallback(() => {
    const { ships, grid } = autoPlaceFleet()
    if (activePlacementPlayer === 'p1') {
      setP1State({ ships, grid, shotsReceived: 0 })
    } else {
      setP2State({ ships, grid, shotsReceived: 0 })
    }
  }, [activePlacementPlayer])

  const clearCurrent = useCallback(() => {
    if (activePlacementPlayer === 'p1') {
      setP1State(createEmptyPlayerState())
    } else {
      setP2State(createEmptyPlayerState())
    }
  }, [activePlacementPlayer])

  const confirmPlacementAndStart = useCallback(() => {
    if (mode === '2p' && activePlacementPlayer === 'p1') {
      const autoP2 = autoPlaceFleet()
      setP2State({ ships: autoP2.ships, grid: autoP2.grid, shotsReceived: 0 })
      setActivePlacementPlayer('p2')
      return
    }

    setPhase('battle')
  }, [mode, activePlacementPlayer])

  // AI turn execution
  const executeAIMove = useCallback(() => {
    if (winner !== null) return

    setIsAIThinking(true)
    const delay = isEink ? 150 : 650

    aiTimerRef.current = window.setTimeout(() => {
      setP1State(prevP1 => {
        const [ar, ac] = getAIMove(prevP1.grid, difficulty)
        const shotResult = processShot(prevP1, ar, ac)

        if (shotResult.nextState.ships.every(s => s.isSunk)) {
          setWinner('p2')
          setIsAIThinking(false)
          return shotResult.nextState
        }

        setIsAIThinking(false)

        if (shotResult.hit) {
          // AI shoots again on hit
          setTimeout(() => executeAIMove(), isEink ? 150 : 500)
        } else {
          setCurrentTurn('p1')
        }

        return shotResult.nextState
      })
    }, delay)
  }, [winner, difficulty, isEink])

  const handleFire = useCallback(
    (row: number, col: number) => {
      if (phase !== 'battle' || winner !== null || isAIThinking) return

      const targetState = currentTurn === 'p1' ? p2State : p1State
      const cell = targetState.grid[row][col]
      if (cell === 'hit' || cell === 'miss' || cell === 'sunk') return

      const shotResult = processShot(targetState, row, col)
      setLastShotInfo({ hit: shotResult.hit, sunkShip: shotResult.sunkShip })

      if (currentTurn === 'p1') {
        setP2State(shotResult.nextState)
        setP1Shots(s => s + 1)
        if (shotResult.hit) setP1Hits(h => h + 1)

        // Check if player 1 won
        if (shotResult.nextState.ships.every(s => s.isSunk)) {
          setWinner('p1')

          if (mode === 'ai') {
            const finalShots = p1Shots + 1
            const currentBest = loadBestShots(difficulty)
            if (currentBest === null || finalShots < currentBest) {
              saveBestShots(difficulty, finalShots)
              setBestShots(finalShots)
            }
          }
          return
        }

        if (!shotResult.hit) {
          if (mode === 'ai') {
            setCurrentTurn('p2')
            setTimeout(() => executeAIMove(), 300)
          } else {
            setCurrentTurn('p2')
          }
        }
      } else {
        // Player 2 (Human in 2P mode)
        setP1State(shotResult.nextState)

        if (shotResult.nextState.ships.every(s => s.isSunk)) {
          setWinner('p2')
          return
        }

        if (!shotResult.hit) {
          setCurrentTurn('p1')
        }
      }
    },
    [phase, winner, isAIThinking, currentTurn, p1State, p2State, mode, p1Shots, difficulty, executeAIMove]
  )

  const resetBest = useCallback(() => {
    try {
      localStorage.removeItem(`${BEST_SHOTS_KEY_PREFIX}${difficulty}`)
      setBestShots(null)
    } catch {
      // Storage unavailable
    }
  }, [difficulty])

  return {
    mode,
    difficulty,
    phase,
    p1State,
    p2State,
    activePlacementPlayer,
    currentTurn,
    winner,
    isAIThinking,
    lastShotInfo,
    p1Shots,
    p1Hits,
    bestShots,
    setPhase,
    setDifficulty,
    changeMode,
    autoDeployCurrent,
    clearCurrent,
    confirmPlacementAndStart,
    handleFire,
    resetGame,
    resetBest,
  }
}
