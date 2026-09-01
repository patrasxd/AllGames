import React from 'react'
import type { GameComponentProps } from './types'
import { FlappyBird } from './FlappyBird'

export interface GameMetadata {
  slug: string
  name: { en: string; pl: string }
  description: { en: string; pl: string }
  icon: React.ReactNode
  tags: { en: string[]; pl: string[] }
  minPlayers: 1 | 2
  maxPlayers: 1 | 2
}

function BirdIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block' }}
    >
      <ellipse cx="10" cy="12" rx="7" ry="5" />
      <path d="M17 12l5-2-5 2" />
      <path d="M7 11c0-2 2-4 5-3" />
      <circle cx="13" cy="10" r="1" fill="currentColor" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'wing-rush',
  name: {
    en: 'Wing Rush',
    pl: 'Wing Rush',
  },
  description: {
    en: 'Minimalist physics arcade. Tap to flap wings, navigate through architectural gates, and set high scores.',
    pl: 'Minimalistyczna gra zręcznościowa. Wzbijaj się w powietrze, omijaj filary i pobijaj rekordy.',
  },
  icon: <BirdIcon />,
  tags: {
    en: ['arcade', 'skill', 'endless'],
    pl: ['zręcznościowa', 'refleks', 'nieskończona'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}

export { FlappyBird, FlappyBird as GameComponent }
export default FlappyBird
