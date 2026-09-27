import type { TerrainData, Tank, PlayerId, WeaponType, WeaponInfo, DifficultyLevel, Projectile } from './types'

export const CANVAS_WIDTH = 1800
export const CANVAS_HEIGHT = 650

export const GRAVITY = 220 // pixels / sec^2
export const WIND_FACTOR = 50 // horizontal acceleration multiplier per wind level (-3 to +3)

export const WEAPON_DEFINITIONS: Record<WeaponType, WeaponInfo> = {
  standard: {
    id: 'standard',
    nameKey: 'weapons.standard.name',
    descKey: 'weapons.standard.desc',
    damage: 40,
    blastRadius: 36,
    speedMultiplier: 8.5,
    initialAmmo: Infinity,
    color: '#38bdf8', // bright cyan
  },
  mortar: {
    id: 'mortar',
    nameKey: 'weapons.mortar.name',
    descKey: 'weapons.mortar.desc',
    damage: 65,
    blastRadius: 58,
    speedMultiplier: 8.2,
    initialAmmo: 3,
    color: '#f97316', // bright orange
  },
  cluster: {
    id: 'cluster',
    nameKey: 'weapons.cluster.name',
    descKey: 'weapons.cluster.desc',
    damage: 32, // per bomblet (x3)
    blastRadius: 30,
    speedMultiplier: 8.4,
    initialAmmo: 2,
    color: '#a855f7', // purple
  },
  bouncy: {
    id: 'bouncy',
    nameKey: 'weapons.bouncy.name',
    descKey: 'weapons.bouncy.desc',
    damage: 48,
    blastRadius: 38,
    speedMultiplier: 8.6,
    initialAmmo: 2,
    color: '#22c55e', // neon green
  },
}

/** Pseudo-random generator with optional seed for deterministic tests */
export function pseudoRandom(seed?: number): () => number {
  if (seed === undefined) return Math.random
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Generates rugged alpine mountains, dramatic peaks, gorges, and safe plateau spawn zones */
export function generateTerrain(width = CANVAS_WIDTH, height = CANVAS_HEIGHT, seed?: number): TerrainData {
  const rand = pseudoRandom(seed)
  const heights = new Array<number>(width)

  const profile = Math.floor(rand() * 3)

  const baseLine = height * 0.54
  // Alpine multi-harmonic mountain waveform for rugged peaks and deep valleys
  const freq1 = (Math.PI * 3.8) / (width * (0.85 + rand() * 0.3))
  const freq2 = (Math.PI * 8.2) / (width * (0.85 + rand() * 0.3))
  const freq3 = (Math.PI * 14.5) / (width * (0.85 + rand() * 0.3))

  const amp1 = 105 + rand() * 32 // grand mountain massif
  const amp2 = 46 + rand() * 22  // secondary ridges
  const amp3 = 18 + rand() * 10  // rugged crags

  const phase1 = rand() * Math.PI * 2
  const phase2 = rand() * Math.PI * 2
  const phase3 = rand() * Math.PI * 2

  // Central tactical feature (Towering peak citadel or deep mountain pass)
  let centerFeature = 0
  if (profile === 0) {
    centerFeature = -(110 + rand() * 45) // majestic central peak
  } else if (profile === 1) {
    centerFeature = 85 + rand() * 35 // mountain valley pass
  } else {
    centerFeature = (rand() - 0.5) * 85
  }

  for (let x = 0; x < width; x++) {
    const nx = x / width
    const centerDip = Math.exp(-Math.pow((nx - 0.5) / 0.26, 2)) * centerFeature

    const y =
      baseLine +
      Math.sin(x * freq1 + phase1) * amp1 +
      Math.cos(x * freq2 + phase2) * amp2 +
      Math.sin(x * freq3 + phase3) * amp3 +
      centerDip

    // Clamp inside canvas boundary, keeping generous sky for projectile flight
    heights[x] = Math.max(140, Math.min(height - 45, y))
  }

  return { width, height, heights }
}

/** Generates random horizontal wind level between -3 and +3 (0 = calm, 1 = light, 2 = moderate, 3 = strong) */
export function generateWind(rand = Math.random): number {
  const levels = [-3, -2, -1, 0, 1, 2, 3]
  return levels[Math.floor(rand() * levels.length)]
}

/** Carves a circular crater into the terrain with smooth edges */
export function carveCrater(terrain: TerrainData, cx: number, cy: number, radius: number): TerrainData {
  const newHeights = [...terrain.heights]
  const clampedCx = Math.max(0, Math.min(terrain.width - 1, Math.round(cx)))
  const surfaceY = terrain.heights[clampedCx]
  // Never carve deeper than the terrain surface level
  const effectiveCy = Math.min(cy, surfaceY)

  const startX = Math.max(0, Math.floor(cx - radius * 1.1))
  const endX = Math.min(terrain.width - 1, Math.ceil(cx + radius * 1.1))

  for (let x = startX; x <= endX; x++) {
    const dx = Math.abs(x - cx)
    if (dx <= radius) {
      const dy = Math.sqrt(radius * radius - dx * dx)
      const craterFloor = effectiveCy + dy
      if (craterFloor > newHeights[x]) {
        newHeights[x] = Math.min(terrain.height - 10, craterFloor)
      }
    }
  }

  // Smoothing pass to eliminate sharp single-pixel stair steps
  for (let pass = 0; pass < 2; pass++) {
    for (let x = Math.max(1, startX); x < Math.min(terrain.width - 1, endX); x++) {
      newHeights[x] = (newHeights[x - 1] + newHeights[x] * 2 + newHeights[x + 1]) / 4
    }
  }

  return {
    ...terrain,
    heights: newHeights,
  }
}

/** Initialize starting tanks with wide separation across stable opposite flank plateaus */
export function createInitialTanks(terrain: TerrainData, rand = Math.random): Record<PlayerId, Tank> {
  // Search the entire flank zones for the best stable, flat plateau
  let bestP1X = 160
  let minSlopeP1 = 999
  const p1Min = 100
  const p1Max = 280

  // Find the top candidates with minimal slope
  const p1Candidates: number[] = []
  for (let x = p1Min; x <= p1Max; x++) {
    const slope = Math.abs(terrain.heights[Math.min(terrain.width - 1, x + 8)] - terrain.heights[Math.max(0, x - 8)])
    if (slope < minSlopeP1) {
      minSlopeP1 = slope
      bestP1X = x
    }
  }
  for (let x = p1Min; x <= p1Max; x++) {
    const slope = Math.abs(terrain.heights[Math.min(terrain.width - 1, x + 8)] - terrain.heights[Math.max(0, x - 8)])
    if (slope <= minSlopeP1 + 1.2) {
      p1Candidates.push(x)
    }
  }
  const chosenP1X = p1Candidates.length > 0 ? p1Candidates[Math.floor(rand() * p1Candidates.length)] : bestP1X

  let bestP2X = terrain.width - 160
  let minSlopeP2 = 999
  const p2Min = terrain.width - 280
  const p2Max = terrain.width - 100

  const p2Candidates: number[] = []
  for (let x = p2Min; x <= p2Max; x++) {
    const slope = Math.abs(terrain.heights[Math.min(terrain.width - 1, x + 8)] - terrain.heights[Math.max(0, x - 8)])
    if (slope < minSlopeP2) {
      minSlopeP2 = slope
      bestP2X = x
    }
  }
  for (let x = p2Min; x <= p2Max; x++) {
    const slope = Math.abs(terrain.heights[Math.min(terrain.width - 1, x + 8)] - terrain.heights[Math.max(0, x - 8)])
    if (slope <= minSlopeP2 + 1.2) {
      p2Candidates.push(x)
    }
  }
  const chosenP2X = p2Candidates.length > 0 ? p2Candidates[Math.floor(rand() * p2Candidates.length)] : bestP2X

  const p1X = chosenP1X
  const p2X = chosenP2X

  const p1Y = terrain.heights[p1X]
  const p2Y = terrain.heights[p2X]

  return {
    p1: {
      id: 'p1',
      x: p1X,
      y: p1Y,
      angle: 45,
      power: 60,
      hp: 100,
      maxHp: 100,
      fuel: 60,
      maxFuel: 60,
      selectedWeapon: 'standard',
      ammo: {
        standard: Infinity,
        mortar: WEAPON_DEFINITIONS.mortar.initialAmmo,
        cluster: WEAPON_DEFINITIONS.cluster.initialAmmo,
        bouncy: WEAPON_DEFINITIONS.bouncy.initialAmmo,
      },
    },
    p2: {
      id: 'p2',
      x: p2X,
      y: p2Y,
      angle: 45,
      power: 60,
      hp: 100,
      maxHp: 100,
      fuel: 60,
      maxFuel: 60,
      selectedWeapon: 'standard',
      ammo: {
        standard: Infinity,
        mortar: WEAPON_DEFINITIONS.mortar.initialAmmo,
        cluster: WEAPON_DEFINITIONS.cluster.initialAmmo,
        bouncy: WEAPON_DEFINITIONS.bouncy.initialAmmo,
      },
    },
  }
}

export const BARREL_LENGTH = 32
export const TURRET_HUB_OFFSET = 23

/** Computes slope angle of the terrain underneath the tank */
export function getTankSlopeAngle(tank: Tank, terrain?: TerrainData): number {
  if (!terrain || !terrain.heights) return 0
  const sampleDist = 12
  const leftX = Math.max(0, Math.floor(tank.x - sampleDist))
  const rightX = Math.min(terrain.width - 1, Math.floor(tank.x + sampleDist))
  const dy = terrain.heights[rightX] - terrain.heights[leftX]
  const dx = rightX - leftX
  return Math.atan2(dy, dx)
}

/** Computes the barrel tip coordinates taking terrain slope into account */
export function getMuzzlePosition(tank: Tank, terrain?: TerrainData): { x: number; y: number } {
  const barrelLength = BARREL_LENGTH
  const rad = (tank.angle * Math.PI) / 180
  const isP1 = tank.id === 'p1'
  const slopeAngle = getTankSlopeAngle(tank, terrain)

  // Pivot hub position rotated along slope (turret center is TURRET_HUB_OFFSET px above base)
  const hubWorldX = tank.x + Math.sin(slopeAngle) * TURRET_HUB_OFFSET
  const hubWorldY = tank.y - Math.cos(slopeAngle) * TURRET_HUB_OFFSET

  const dirX = isP1 ? Math.cos(rad) : -Math.cos(rad)
  const dirY = -Math.sin(rad)

  return {
    x: hubWorldX + dirX * barrelLength,
    y: hubWorldY + dirY * barrelLength,
  }
}

/** Computes initial projectile velocity */
export function getInitialVelocity(tank: Tank, weapon: WeaponType): { vx: number; vy: number } {
  const weaponInfo = WEAPON_DEFINITIONS[weapon]
  const speed = tank.power * weaponInfo.speedMultiplier
  const rad = (tank.angle * Math.PI) / 180

  if (tank.id === 'p1') {
    return {
      vx: Math.cos(rad) * speed,
      vy: -Math.sin(rad) * speed,
    }
  } else {
    return {
      vx: -Math.cos(rad) * speed,
      vy: -Math.sin(rad) * speed,
    }
  }
}

/** Creates a projectile from a firing tank */
export function createProjectile(tank: Tank, terrain?: TerrainData): Projectile {
  const weapon = tank.selectedWeapon
  const weaponInfo = WEAPON_DEFINITIONS[weapon]
  const muzzle = getMuzzlePosition(tank, terrain)
  const vel = getInitialVelocity(tank, weapon)

  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    owner: tank.id,
    x: muzzle.x,
    y: muzzle.y,
    vx: vel.vx,
    vy: vel.vy,
    weapon,
    blastRadius: weaponInfo.blastRadius,
    damage: weaponInfo.damage,
    bouncesLeft: weapon === 'bouncy' ? 1 : 0,
    trail: [{ x: muzzle.x, y: muzzle.y, alpha: 1 }],
  }
}

/** Calculates explosion blast damage against a tank */
export function calculateBlastDamage(
  epicenter: { x: number; y: number },
  blastRadius: number,
  baseDamage: number,
  tank: Tank,
): { damage: number; isDirect: boolean } {
  const tankCenter = { x: tank.x, y: tank.y - 8 }
  const dist = Math.hypot(epicenter.x - tankCenter.x, epicenter.y - tankCenter.y)

  // Direct hit radius (tank hitbox is approx 18px radius)
  if (dist <= 18) {
    return { damage: baseDamage, isDirect: true }
  }

  // Splash radius
  const maxHitDist = blastRadius + 16
  if (dist <= maxHitDist) {
    const splashFactor = Math.max(0.15, 1 - dist / maxHitDist)
    const damage = Math.round(baseDamage * splashFactor)
    return { damage, isDirect: false }
  }

  return { damage: 0, isDirect: false }
}

/** Moves a tank along terrain surface using fuel */
export function moveTank(tank: Tank, direction: -1 | 1, terrain: TerrainData): Tank {
  if (tank.fuel <= 0) return tank

  const step = 4
  const fuelCost = 2
  if (tank.fuel < fuelCost) return tank

  let newX = tank.x + direction * step
  // Boundary constraints based on player sides
  if (tank.id === 'p1') {
    newX = Math.max(30, Math.min(460, newX))
  } else {
    newX = Math.max(540, Math.min(terrain.width - 30, newX))
  }

  const newY = terrain.heights[Math.round(newX)]
  return {
    ...tank,
    x: newX,
    y: newY,
    fuel: Math.max(0, tank.fuel - fuelCost),
  }
}

/** Gravity settles tanks onto newly excavated terrain craters */
export function settleTanksOnTerrain(tanks: Record<PlayerId, Tank>, terrain: TerrainData): Record<PlayerId, Tank> {
  const p1Ground = terrain.heights[Math.round(tanks.p1.x)]
  const p2Ground = terrain.heights[Math.round(tanks.p2.x)]

  return {
    p1: {
      ...tanks.p1,
      y: Math.max(tanks.p1.y, p1Ground),
    },
    p2: {
      ...tanks.p2,
      y: Math.max(tanks.p2.y, p2Ground),
    },
  }
}

/** Pure AI trajectory solver with difficulty variance */
export function calculateAiShot(
  aiTank: Tank,
  targetTank: Tank,
  terrain: TerrainData,
  wind: number,
  difficulty: DifficultyLevel,
  rand = Math.random,
): { angle: number; power: number; weapon: WeaponType } {
  // Single standard shell for both player and AI (pure minimalist ballistic duel)
  const weapon: WeaponType = 'standard'

  // Simulated ballistic solver to find best angle & power
  let bestAngle = 45
  let bestPower = 60
  let bestError = Infinity

  const weaponInfo = WEAPON_DEFINITIONS[weapon]
  const targetX = targetTank.x
  const targetY = targetTank.y - 8

  // Sample angles from 25 to 75 deg
  for (let testAngle = 25; testAngle <= 75; testAngle += 3) {
    const rad = (testAngle * Math.PI) / 180
    // Try powers from 35 to 100
    for (let testPower = 35; testPower <= 100; testPower += 3) {
      const speed = testPower * weaponInfo.speedMultiplier
      // AI tank (p2) fires leftwards
      const vx0 = -Math.cos(rad) * speed
      const vy0 = -Math.sin(rad) * speed

      let sx = aiTank.x - 20
      let sy = aiTank.y - 12
      let vx = vx0
      let vy = vy0

      // Step simulation across expanded battlefield
      const simDt = 0.04
      let hitGround = false

      for (let step = 0; step < 260; step++) {
        sx += vx * simDt
        sy += vy * simDt
        vy += GRAVITY * simDt
        vx += wind * WIND_FACTOR * simDt

        if (sx <= 0 || sx >= terrain.width) break
        const groundY = terrain.heights[Math.round(sx)]
        if (sy >= groundY) {
          hitGround = true
          break
        }
      }

      if (hitGround) {
        const error = Math.hypot(sx - targetX, sy - targetY)
        if (error < bestError) {
          bestError = error
          bestAngle = testAngle
          bestPower = testPower
        }
      }
    }
  }

  // Apply difficulty-based inaccuracy
  let angleJitter = 0
  let powerJitter = 0

  if (difficulty === 'easy') {
    angleJitter = (rand() - 0.5) * 16 // +/- 8 deg
    powerJitter = (rand() - 0.5) * 24 // +/- 12 power
  } else if (difficulty === 'medium') {
    angleJitter = (rand() - 0.5) * 6 // +/- 3 deg
    powerJitter = (rand() - 0.5) * 8 // +/- 4 power
  } else {
    // Hard: very accurate sniper
    angleJitter = (rand() - 0.5) * 2 // +/- 1 deg
    powerJitter = (rand() - 0.5) * 2 // +/- 1 power
  }

  const finalAngle = Math.max(15, Math.min(85, Math.round(bestAngle + angleJitter)))
  const finalPower = Math.max(20, Math.min(100, Math.round(bestPower + powerJitter)))

  return {
    angle: finalAngle,
    power: finalPower,
    weapon,
  }
}

/** Check if game has reached a win/draw state */
export function checkWinner(tanks: Record<PlayerId, Tank>): PlayerId | 'draw' | null {
  const p1Dead = tanks.p1.hp <= 0
  const p2Dead = tanks.p2.hp <= 0

  if (p1Dead && p2Dead) return 'draw'
  if (p2Dead) return 'p1'
  if (p1Dead) return 'p2'
  return null
}
