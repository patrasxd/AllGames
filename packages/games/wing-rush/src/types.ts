import type React from 'react'

export type Locale = 'en' | 'pl'

export type Difficulty = 'easy' | 'normal' | 'hard'

export type GameStatus = 'ready' | 'playing' | 'gameover'

export interface Bird {
  x: number
  y: number
  vy: number
  angle: number
  radius: number
  wingPhase: number
}

export interface Pipe {
  id: number
  x: number
  topHeight: number
  bottomY: number
  width: number
  passed: boolean
}

export interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  size: number
  color: string
}

export interface DifficultyConfig {
  gravity: number
  jumpForce: number
  pipeSpeed: number
  pipeGap: number
  pipeInterval: number
}

export interface HighScores {
  easy: number
  normal: number
  hard: number
}

export interface GameComponentProps {
  setHeader?: (content: React.ReactNode) => void
  locale?: Locale
  isEink?: boolean
  theme?: 'dark' | 'light'
}
