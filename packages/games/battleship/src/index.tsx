import React from 'react'
import type { GameMetadata } from './types'
import { Battleship } from './Battleship'

function BattleshipIcon() {
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
      {/* Radar circle */}
      <circle cx="12" cy="12" r="9.5" strokeDasharray="3 3" />
      {/* Crosshair lines */}
      <line x1="12" y1="2.5" x2="12" y2="21.5" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      <line x1="2.5" y1="12" x2="21.5" y2="12" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      {/* Battleship silhouette */}
      <path d="M4 14l2 3h12l2-3H4z" fill="var(--surface)" />
      <path d="M8 14v-3h4v3M10 11V8h2v3" />
      {/* Gun turrets */}
      <line x1="5.5" y1="14" x2="3.5" y2="12" strokeWidth="1.5" />
      <line x1="18.5" y1="14" x2="20.5" y2="12" strokeWidth="1.5" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'battleship',
  name: {
    en: 'Battleship',
    pl: 'Statki',
  },
  description: {
    en: 'Deploy your fleet and sink all enemy ships on the radar.',
    pl: 'Rozmieść swoją flotę i zatop wszystkie okręty wroga.',
  },
  icon: <BattleshipIcon />,
  tags: {
    en: ['1 player', '2 players', 'strategy', 'classic'],
    pl: ['1 gracz', '2 graczy', 'strategiczna', 'klasyczna'],
  },
  minPlayers: 1,
  maxPlayers: 2,
}

export { Battleship, Battleship as GameComponent }
export default Battleship
