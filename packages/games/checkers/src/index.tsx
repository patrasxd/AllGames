import React from 'react'
import type { GameMetadata } from './types'

function CheckersIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeDasharray="1.5 1.5" fill="none" />
      <circle cx="16" cy="16" r="6" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3" fill="var(--bg)" stroke="none" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'checkers',
  name: {
    en: 'Checkers',
    pl: 'Warcaby',
  },
  description: {
    en: 'Classic 8×8 draughts with jumps, king crowns, and tactical captures.',
    pl: 'Klasyczne warcaby 8×8 ze zbijaniem pionków i tworzeniem damek.',
  },
  icon: <CheckersIcon />,
  tags: {
    en: ['classic', '2 players', 'vs computer'],
    pl: ['klasyczna', '2 graczy', 'vs komputer'],
  },
  minPlayers: 1,
  maxPlayers: 2,
}

export { Checkers as GameComponent } from './Checkers'
