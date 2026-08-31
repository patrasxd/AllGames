import React from 'react'
import type { GameMetadata } from './types'
import { Minesweeper } from './Minesweeper'

function BombIcon() {
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
      {/* Bomb body */}
      <circle cx="11" cy="13" r="7" />
      <path d="M11 9a4 4 0 0 0-4 4" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      {/* Cap */}
      <path d="M9.5 6.5h3v1h-3z" fill="currentColor" />
      {/* Fuse */}
      <path d="M12.5 6.5c1-1.5 3-1.5 4-0.5s2 2 3.5 1.5" />
      {/* Spark */}
      <path d="M20 5l2-1M21 8l2 1M18 4l-1-2" strokeWidth="1.5" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'minesweeper',
  name: {
    en: 'Minesweeper',
    pl: 'Saper',
  },
  description: {
    en: 'Classic minefield puzzle. Uncover safe squares and flag mines.',
    pl: 'Klasyczna gra logiczna. Odkrywaj bezpieczne pola i oznaczaj miny.',
  },
  icon: <BombIcon />,
  tags: {
    en: ['classic', '1 player', 'logic'],
    pl: ['klasyczna', '1 gracz', 'logiczna'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}

export { Minesweeper, Minesweeper as GameComponent }
export default Minesweeper
