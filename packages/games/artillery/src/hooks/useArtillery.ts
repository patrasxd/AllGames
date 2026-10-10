import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  PlayerId,
  GameMode,
  DifficultyLevel,
  WeaponType,
  Tank,
  TerrainData,
  Projectile,
  Explosion,
  Particle,
  FloatingText,
  ArtilleryStats,
  GamePhase,
} from '../types'
import {
  generateTerrain,
  generateWind,
  createInitialTanks,
  createProjectile,
  carveCrater,
  calculateBlastDamage,
  settleTanksOnTerrain,
  moveTank,
  calculateAiShot,
  checkWinner,
  GRAVITY,
  WIND_FACTOR,
  WEAPON_DEFINITIONS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../logic'

const STATS_STORAGE_KEY = 'allgames:artillery:stats'

function loadSavedStats(): ArtilleryStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        p1Wins: typeof parsed.p1Wins === 'number' ? parsed.p1Wins : 0,
        p2Wins: typeof parsed.p2Wins === 'number' ? parsed.p2Wins : 0,
        draws: typeof parsed.draws === 'number' ? parsed.draws : 0,
        roundsPlayed: typeof parsed.roundsPlayed === 'number' ? parsed.roundsPlayed : 0,
      }
    }
  } catch {
    // ignore
  }
  return { p1Wins: 0, p2Wins: 0, draws: 0, roundsPlayed: 0 }
}

function saveStats(stats: ArtilleryStats) {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

export function useArtillery({ isEink = false }: { isEink?: boolean } = {}) {
  const [mode, setMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [phase, setPhase] = useState<GamePhase>('aiming')
  const [currentTurn, setCurrentTurn] = useState<PlayerId>('p1')
  const [wind, setWind] = useState<number>(() => generateWind(Math.random, 'medium'))
  const [winner, setWinner] = useState<PlayerId | 'draw' | null>(null)
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false)
  const [stats, setStats] = useState<ArtilleryStats>(loadSavedStats)
  const [screenShake, setScreenShake] = useState<number>(0)
  const screenShakeRef = useRef<number>(0)
  const [matchId, setMatchId] = useState<number>(1)

  // Dynamic visual states
  const [terrain, setTerrain] = useState<TerrainData>(() => generateTerrain())
  const [tanks, setTanks] = useState<Record<PlayerId, Tank>>(() => createInitialTanks(generateTerrain()))
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [explosions, setExplosions] = useState<Explosion[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])

  // Engine refs to maintain sync during requestAnimationFrame
  const engineRef = useRef({
    phase: 'aiming' as GamePhase,
    currentTurn: 'p1' as PlayerId,
    mode: 'ai' as GameMode,
    difficulty: 'medium' as DifficultyLevel,
    wind: 0,
    terrain: generateTerrain(),
    tanks: createInitialTanks(generateTerrain()),
    projectiles: [] as Projectile[],
    explosions: [] as Explosion[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    particleIdCounter: 1,
    floatingIdCounter: 1,
  })

  // Synchronize refs with state
  useEffect(() => {
    engineRef.current.phase = phase
    engineRef.current.currentTurn = currentTurn
    engineRef.current.mode = mode
    engineRef.current.difficulty = difficulty
    engineRef.current.wind = wind
  }, [phase, currentTurn, mode, difficulty, wind])

  // Reset / Initialize match
  const startMatch = useCallback(
    (newMode = mode, newDiff = difficulty) => {
      const newTerrain = generateTerrain()
      const newTanks = createInitialTanks(newTerrain, Math.random, newDiff)
      const newWind = generateWind(Math.random, newDiff)

      engineRef.current.terrain = newTerrain
      engineRef.current.tanks = newTanks
      engineRef.current.wind = newWind
      engineRef.current.phase = 'aiming'
      engineRef.current.currentTurn = 'p1'
      engineRef.current.mode = newMode
      engineRef.current.difficulty = newDiff
      engineRef.current.projectiles = []
      engineRef.current.explosions = []
      engineRef.current.particles = []
      engineRef.current.floatingTexts = []

      setMode(newMode)
      setDifficulty(newDiff)
      setTerrain(newTerrain)
      setTanks(newTanks)
      setWind(newWind)
      setPhase('aiming')
      setCurrentTurn('p1')
      setWinner(null)
      setIsAiThinking(false)
      setProjectiles([])
      setExplosions([])
      setParticles([])
      setFloatingTexts([])
      screenShakeRef.current = 0
      setScreenShake(0)
      setMatchId((prev) => prev + 1)
    },
    [mode, difficulty],
  )

  // Tank adjustment controls
  const setAngle = useCallback((angle: number) => {
    if (engineRef.current.phase !== 'aiming') return
    const turn = engineRef.current.currentTurn
    const clamped = Math.max(0, Math.min(90, Math.round(angle)))

    engineRef.current.tanks = {
      ...engineRef.current.tanks,
      [turn]: {
        ...engineRef.current.tanks[turn],
        angle: clamped,
      },
    }
    setTanks({ ...engineRef.current.tanks })
  }, [])

  const setPower = useCallback((power: number) => {
    if (engineRef.current.phase !== 'aiming') return
    const turn = engineRef.current.currentTurn
    const clamped = Math.max(10, Math.min(100, Math.round(power)))

    engineRef.current.tanks = {
      ...engineRef.current.tanks,
      [turn]: {
        ...engineRef.current.tanks[turn],
        power: clamped,
      },
    }
    setTanks({ ...engineRef.current.tanks })
  }, [])

  const setSelectedWeapon = useCallback((weapon: WeaponType) => {
    if (engineRef.current.phase !== 'aiming') return
    const turn = engineRef.current.currentTurn
    const tank = engineRef.current.tanks[turn]
    if (tank.ammo[weapon] <= 0) return

    engineRef.current.tanks = {
      ...engineRef.current.tanks,
      [turn]: {
        ...tank,
        selectedWeapon: weapon,
      },
    }
    setTanks({ ...engineRef.current.tanks })
  }, [])

  const moveCurrentTank = useCallback((direction: -1 | 1) => {
    if (engineRef.current.phase !== 'aiming') return
    const turn = engineRef.current.currentTurn
    const currentTank = engineRef.current.tanks[turn]

    const updated = moveTank(currentTank, direction, engineRef.current.terrain)
    if (updated.x !== currentTank.x) {
      engineRef.current.tanks = {
        ...engineRef.current.tanks,
        [turn]: updated,
      }
      setTanks({ ...engineRef.current.tanks })
    }
  }, [])

  // Fire current tank with optional power override
  const fire = useCallback((overridePower?: number) => {
    const { phase: curPhase, currentTurn: turn, tanks: curTanks } = engineRef.current
    if (curPhase !== 'aiming') return

    let tank = curTanks[turn]
    if (overridePower !== undefined) {
      const clampedPower = Math.max(10, Math.min(100, overridePower))
      tank = { ...tank, power: clampedPower }
      engineRef.current.tanks[turn] = tank
    }
    const weapon = tank.selectedWeapon

    if (tank.ammo[weapon] <= 0) return

    // Decrement ammo if finite
    const updatedAmmo = { ...tank.ammo }
    if (weapon !== 'standard') {
      updatedAmmo[weapon] = Math.max(0, updatedAmmo[weapon] - 1)
    }

    // Fall back to standard if weapon ammo depleted
    const nextWeapon = updatedAmmo[weapon] <= 0 ? 'standard' : weapon

    engineRef.current.tanks = {
      ...curTanks,
      [turn]: {
        ...tank,
        ammo: updatedAmmo,
        selectedWeapon: nextWeapon,
      },
    }
    setTanks({ ...engineRef.current.tanks })

    // Create projectile and launch
    const projectile = createProjectile(engineRef.current.tanks[turn], engineRef.current.terrain)
    engineRef.current.projectiles = [projectile]
    setProjectiles([projectile])

    engineRef.current.phase = 'firing'
    setPhase('firing')
    setIsAiThinking(false)
  }, [])

  // Handle AI Turn trigger with clear, readable pacing
  useEffect(() => {
    if (phase !== 'aiming') return
    if (mode === 'ai' && currentTurn === 'p2') {
      setIsAiThinking(true)
      let aimInterval: ReturnType<typeof setInterval> | null = null
      let fireTimer: ReturnType<typeof setTimeout> | null = null

      // Step 1: 700ms thinking delay
      const calculateTimer = setTimeout(() => {
        const { tanks: curTanks, terrain: curTerr, wind: curWind, difficulty: curDiff } = engineRef.current
        const aiTank = curTanks.p2
        const targetTank = curTanks.p1

        const decision = calculateAiShot(aiTank, targetTank, curTerr, curWind, curDiff)

        // Step 2: Animate barrel aiming to target angle
        const startAngle = aiTank.angle
        const targetAngle = decision.angle
        const angleDiff = targetAngle - startAngle
        const steps = 8
        let stepCount = 0

        aimInterval = setInterval(() => {
          stepCount++
          const progress = stepCount / steps
          const newAngle = Math.round(startAngle + angleDiff * progress)

          engineRef.current.tanks = {
            ...engineRef.current.tanks,
            p2: {
              ...engineRef.current.tanks.p2,
              angle: newAngle,
              power: decision.power,
              selectedWeapon: decision.weapon,
            },
          }
          setTanks({ ...engineRef.current.tanks })

          if (stepCount >= steps) {
            if (aimInterval) clearInterval(aimInterval)
            // Step 3: Brief locked-on pause (350ms) before firing
            fireTimer = setTimeout(() => {
              fire()
            }, 350)
          }
        }, 30)
      }, 700)

      return () => {
        clearTimeout(calculateTimer)
        if (aimInterval) clearInterval(aimInterval)
        if (fireTimer) clearTimeout(fireTimer)
      }
    }
  }, [phase, mode, currentTurn, fire])

  // Spawn visual explosion helper
  const triggerExplosionAt = useCallback(
    (x: number, y: number, radius: number, weaponColor: string, baseDamage: number) => {
      if (!isEink) {
        const shakeVal = Math.min(18, radius * 0.28)
        screenShakeRef.current = shakeVal
        setScreenShake(shakeVal)
      }

      // 1. Explosion wave
      const expId = `exp_${Date.now()}_${Math.random()}`
      const newExp: Explosion = {
        id: expId,
        x,
        y,
        radius: 0,
        maxRadius: radius,
        progress: 0,
        color: weaponColor,
      }
      engineRef.current.explosions.push(newExp)

      // 2. Carve crater in terrain
      engineRef.current.terrain = carveCrater(engineRef.current.terrain, x, y, radius)
      setTerrain({ ...engineRef.current.terrain })

      // 3. Settle tanks
      engineRef.current.tanks = settleTanksOnTerrain(engineRef.current.tanks, engineRef.current.terrain)

      // 4. Damage calculations
      const updatedTanks = { ...engineRef.current.tanks }

      ;(['p1', 'p2'] as PlayerId[]).forEach((pid) => {
        const t = updatedTanks[pid]
        const { damage } = calculateBlastDamage({ x, y }, radius, baseDamage, t)

        if (damage > 0) {
          const newHp = Math.max(0, t.hp - damage)
          updatedTanks[pid] = { ...t, hp: newHp }

          // Floating combat damage text (Worms style: bold red text floating up)
          const text = `-${damage}`
          engineRef.current.floatingTexts.push({
            id: engineRef.current.floatingIdCounter++,
            x: t.x,
            y: t.y - 65,
            text,
            color: '#ef4444',
            alpha: 1,
            vy: -1.6,
          })
        }
      })

      engineRef.current.tanks = updatedTanks
      setTanks({ ...updatedTanks })

      // 5. Spawn blast debris & smoke particles
      const particleCount = Math.floor(radius * 0.7)
      for (let i = 0; i < particleCount; i++) {
        const pAngle = Math.random() * Math.PI * 2
        const pSpeed = (Math.random() * 4 + 1) * (radius / 25)
        engineRef.current.particles.push({
          id: engineRef.current.particleIdCounter++,
          x: x + (Math.random() - 0.5) * (radius * 0.4),
          y: y + (Math.random() - 0.5) * (radius * 0.4),
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed - 2,
          size: Math.random() * 4 + 2,
          life: 0,
          maxLife: 20 + Math.random() * 25,
          color: Math.random() > 0.4 ? weaponColor : '#fbbf24',
        })
      }
    },
    [],
  )

  // Simulation loop (requestAnimationFrame) with dt scaling
  useEffect(() => {
    let animId: number
    let lastTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - lastTime
      lastTime = now

      // Clamped delta-time (60fps baseline, dt in seconds)
      const dt = Math.min(Math.max(elapsed / 1000, 0.005), 0.05)

      // Screen shake decay (only updates React state when completely settled)
      if (screenShakeRef.current > 0) {
        const nextShake = screenShakeRef.current > 0.2 ? screenShakeRef.current * 0.88 : 0
        screenShakeRef.current = nextShake
        if (nextShake === 0) {
          setScreenShake(0)
        }
      }

      // 1. Update Projectiles with Continuous Sub-step Raymarching Collision
      if (engineRef.current.projectiles.length > 0) {
        const remainingProjectiles: Projectile[] = []

        for (const proj of engineRef.current.projectiles) {
          const prevX = proj.x
          const prevY = proj.y

          // Physics velocity update
          proj.vx += engineRef.current.wind * WIND_FACTOR * dt
          proj.vy += GRAVITY * dt

          const stepDx = proj.vx * dt
          const stepDy = proj.vy * dt
          const stepDist = Math.hypot(stepDx, stepDy)

          // Subdivide fast trajectory into 3.5px micro-steps to prevent tunneling through hills
          const subSteps = Math.max(1, Math.ceil(stepDist / 3.5))
          let hasDetonated = false
          let impactX = 0
          let impactY = 0

          for (let s = 1; s <= subSteps; s++) {
            const fraction = s / subSteps
            const curX = prevX + stepDx * fraction
            const curY = prevY + stepDy * fraction

            // 1. Direct tank collision check at current trajectory sub-step
            let hitTank = false
            for (const pid of ['p1', 'p2'] as PlayerId[]) {
              const t = engineRef.current.tanks[pid]
              if (Math.hypot(curX - t.x, curY - (t.y - 8)) <= 16) {
                hitTank = true
                impactX = curX
                impactY = curY
                break
              }
            }

            if (hitTank) {
              hasDetonated = true
              break
            }

            // 2. Terrain collision check across the entire battlefield and extended landscape
            const clampedCol = Math.max(0, Math.min(CANVAS_WIDTH - 1, Math.round(curX)))
            const groundY = engineRef.current.terrain.heights[clampedCol] ?? CANVAS_HEIGHT
            if (curY >= groundY) {
              hasDetonated = true
              impactX = Math.round(curX)
              // Detonate exactly on the terrain surface so craters are never gouged deep underground
              impactY = groundY
              break
            }
          }

          if (hasDetonated) {
            // Position projectile precisely at impact site for visual explosion origin
            proj.x = impactX
            proj.y = impactY
            proj.trail.push({ x: impactX, y: impactY, alpha: 1 })

            const weaponInfo = WEAPON_DEFINITIONS[proj.weapon]
            triggerExplosionAt(impactX, impactY, proj.blastRadius, weaponInfo.color, proj.damage)
          } else {
            // Advance projectile to final uncollided position
            proj.x += stepDx
            proj.y += stepDy

            // Append to smoke trail
            proj.trail.push({ x: proj.x, y: proj.y, alpha: 1 })
            if (proj.trail.length > 20) {
              proj.trail.shift()
            }

            // Cluster bomb splitting: splits near apex / descent into 3 bomblets
            const curCol = Math.max(0, Math.min(CANVAS_WIDTH - 1, Math.round(proj.x)))
            const curGroundY = engineRef.current.terrain.heights[curCol] ?? CANVAS_HEIGHT
            if (proj.weapon === 'cluster' && !proj.split && proj.vy > 30 && proj.y < curGroundY - 60) {
              proj.split = true
              // Spawn burst particles at split point
              for (let k = 0; k < 12; k++) {
                const angle = Math.random() * Math.PI * 2
                const spd = 30 + Math.random() * 60
                engineRef.current.particles.push({
                  id: engineRef.current.particleIdCounter++,
                  x: proj.x,
                  y: proj.y,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  size: 2.4,
                  life: 0,
                  maxLife: 0.5,
                  color: '#c084fc',
                })
              }

              // Create 3 submunitions: left, center, right
              const leftSub: Projectile = {
                id: `${proj.id}_sub1`,
                owner: proj.owner,
                x: proj.x - 3,
                y: proj.y,
                vx: proj.vx - 48,
                vy: proj.vy - 12,
                weapon: 'cluster',
                blastRadius: 28,
                damage: 30,
                bouncesLeft: 0,
                trail: [{ x: proj.x, y: proj.y, alpha: 1 }],
                split: true,
                isSubmunition: true,
              }
              const midSub: Projectile = {
                id: `${proj.id}_sub2`,
                owner: proj.owner,
                x: proj.x,
                y: proj.y,
                vx: proj.vx,
                vy: proj.vy,
                weapon: 'cluster',
                blastRadius: 28,
                damage: 30,
                bouncesLeft: 0,
                trail: [{ x: proj.x, y: proj.y, alpha: 1 }],
                split: true,
                isSubmunition: true,
              }
              const rightSub: Projectile = {
                id: `${proj.id}_sub3`,
                owner: proj.owner,
                x: proj.x + 3,
                y: proj.y,
                vx: proj.vx + 48,
                vy: proj.vy - 12,
                weapon: 'cluster',
                blastRadius: 28,
                damage: 30,
                bouncesLeft: 0,
                trail: [{ x: proj.x, y: proj.y, alpha: 1 }],
                split: true,
                isSubmunition: true,
              }

              remainingProjectiles.push(leftSub, midSub, rightSub)
              continue
            }

            // Projectiles flying far beyond outer boundaries vanish into the distance
            const isOutOfBounds = proj.x < -1000 || proj.x >= CANVAS_WIDTH + 1000 || proj.y >= CANVAS_HEIGHT + 300

            if (!isOutOfBounds) {
              remainingProjectiles.push(proj)
            }
          }
        }

        const hadProjectilesBefore = engineRef.current.projectiles.length > 0
        engineRef.current.projectiles = remainingProjectiles
        if (hadProjectilesBefore && remainingProjectiles.length === 0) {
          setProjectiles([])
        }
      }

      // 2. Update Explosions
      if (engineRef.current.explosions.length > 0) {
        const remainingExp: Explosion[] = []
        for (const exp of engineRef.current.explosions) {
          exp.progress += dt * 2.5
          exp.radius = exp.maxRadius * Math.sin(Math.min(Math.PI * 0.5, exp.progress * Math.PI * 0.5))

          if (exp.progress < 1.0) {
            remainingExp.push(exp)
          }
        }
        const hadExpBefore = engineRef.current.explosions.length > 0
        engineRef.current.explosions = remainingExp
        if (hadExpBefore && remainingExp.length === 0) {
          setExplosions([])
        }
      }

      // 3. Update Particles in engine ref
      if (engineRef.current.particles.length > 0) {
        const remainingParticles: Particle[] = []
        for (const p of engineRef.current.particles) {
          p.x += p.vx * dt * 45
          p.y += p.vy * dt * 45
          p.vy += GRAVITY * 0.3 * dt
          p.life += dt * 45

          if (p.life < p.maxLife) {
            remainingParticles.push(p)
          }
        }
        engineRef.current.particles = remainingParticles
      }

      // 4. Update Floating Texts
      if (engineRef.current.floatingTexts.length > 0) {
        const remainingTexts: FloatingText[] = []
        for (const ft of engineRef.current.floatingTexts) {
          ft.y += ft.vy * dt * 45
          ft.alpha -= dt * 0.8
          if (ft.alpha > 0) {
            remainingTexts.push(ft)
          }
        }
        const hadTextsBefore = engineRef.current.floatingTexts.length > 0
        engineRef.current.floatingTexts = remainingTexts
        if (hadTextsBefore && remainingTexts.length === 0) {
          setFloatingTexts([])
        }
      }

      // 5. Check if turn has finished resolving
      if (
        engineRef.current.phase === 'firing' &&
        engineRef.current.projectiles.length === 0 &&
        engineRef.current.explosions.length === 0
      ) {
        engineRef.current.phase = 'resolving'
        setPhase('resolving')

        setTimeout(() => {
          const matchWinner = checkWinner(engineRef.current.tanks)

          if (matchWinner) {
            // Match finished
            engineRef.current.phase = 'game_over'
            setPhase('game_over')
            setWinner(matchWinner)

            setStats((prev) => {
              const updated = {
                p1Wins: matchWinner === 'p1' ? prev.p1Wins + 1 : prev.p1Wins,
                p2Wins: matchWinner === 'p2' ? prev.p2Wins + 1 : prev.p2Wins,
                draws: matchWinner === 'draw' ? prev.draws + 1 : prev.draws,
                roundsPlayed: prev.roundsPlayed + 1,
              }
              saveStats(updated)
              return updated
            })
          } else {
            // Next turn
            const nextTurn = engineRef.current.currentTurn === 'p1' ? 'p2' : 'p1'
            const newWind = generateWind(Math.random, engineRef.current.difficulty)

            // Replenish fuel
            engineRef.current.tanks = {
              ...engineRef.current.tanks,
              [nextTurn]: {
                ...engineRef.current.tanks[nextTurn],
                fuel: engineRef.current.tanks[nextTurn].maxFuel,
              },
            }
            engineRef.current.currentTurn = nextTurn
            engineRef.current.wind = newWind
            engineRef.current.phase = 'aiming'

            setTanks({ ...engineRef.current.tanks })
            setCurrentTurn(nextTurn)
            setWind(newWind)
            setPhase('aiming')
          }
        }, 1150)
      }

      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [triggerExplosionAt])

  const resetStats = useCallback(() => {
    const empty: ArtilleryStats = { p1Wins: 0, p2Wins: 0, draws: 0, roundsPlayed: 0 }
    setStats(empty)
    saveStats(empty)
  }, [])

  const changeDifficulty = useCallback((diff: DifficultyLevel) => {
    setDifficulty(diff)
    engineRef.current.difficulty = diff
  }, [])

  return {
    matchId,
    mode,
    difficulty,
    setDifficulty: changeDifficulty,
    phase,
    currentTurn,
    wind,
    winner,
    tanks,
    terrain,
    projectiles,
    explosions,
    particles,
    floatingTexts,
    stats,
    isAiThinking,
    screenShake,
    screenShakeRef,
    engineRef,
    setAngle,
    setPower,
    setSelectedWeapon,
    moveCurrentTank,
    fire,
    startMatch,
    resetStats,
  }
}
