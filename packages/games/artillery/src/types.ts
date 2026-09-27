import type React from 'react'

export type Locale = 'en' | 'pl'
export type GameTheme = 'dark' | 'light' | 'e-ink-light' | 'e-ink-dark'

export type GameMode = 'ai' | '2p'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type PlayerId = 'p1' | 'p2'

export type WeaponType = 'standard' | 'mortar' | 'cluster' | 'bouncy'

export interface WeaponInfo {
  id: WeaponType
  nameKey: string
  descKey: string
  damage: number
  blastRadius: number
  speedMultiplier: number
  initialAmmo: number
  color: string
}

export interface Tank {
  id: PlayerId
  x: number
  y: number
  angle: number // 0 to 90 degrees elevation
  power: number // 10 to 100 percent
  hp: number
  maxHp: number
  fuel: number
  maxFuel: number
  selectedWeapon: WeaponType
  ammo: Record<WeaponType, number>
}

export interface Projectile {
  id: string
  owner: PlayerId
  x: number
  y: number
  vx: number
  vy: number
  weapon: WeaponType
  blastRadius: number
  damage: number
  bouncesLeft: number
  trail: Array<{ x: number; y: number; alpha: number }>
}

export interface Explosion {
  id: string
  x: number
  y: number
  radius: number
  maxRadius: number
  progress: number // 0 to 1
  color: string
}

export interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
}

export interface FloatingText {
  id: number
  x: number
  y: number
  text: string
  color: string
  alpha: number
  vy: number
}

export interface TerrainData {
  width: number
  height: number
  heights: number[] // heights[x] = Y coordinate of the surface (0 at top, height at bottom)
}

export type GamePhase = 'aiming' | 'firing' | 'resolving' | 'game_over'

export interface ArtilleryState {
  mode: GameMode
  difficulty: DifficultyLevel
  phase: GamePhase
  currentTurn: PlayerId
  wind: number // horizontal wind level (-3 to +3, 0 = calm)
  winner: PlayerId | 'draw' | null
  tanks: Record<PlayerId, Tank>
  projectiles: Projectile[]
  explosions: Explosion[]
  particles: Particle[]
  floatingTexts: FloatingText[]
  terrain: TerrainData
  turnCount: number
  isAiThinking: boolean
}

export interface ArtilleryStats {
  p1Wins: number
  p2Wins: number
  draws: number
  roundsPlayed: number
}

export interface GameComponentProps {
  locale?: Locale
  theme?: GameTheme
  isEink?: boolean
  setHeader?: (content: React.ReactNode) => void
  setIsActive?: (active: boolean) => void
}
