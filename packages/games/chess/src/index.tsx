import React from 'react'
import type { GameMetadata } from './types'

function ChessIcon() {
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
      {/* Sketched Chess Knight silhouette */}
      <path
        d="M17 19c-1 0-3-1-3-3 0-3 3-5 2-9-1.5 0-3.5 1-4.5 2.5C10.5 8 9 9 7.5 10c-.5.5-.5 1.5 0 2 .5.5 1.5.5 2 0 1-1 2-1 2.5-.5-1 1.5-2.5 3-2 5 .5 1.5 2 2.5 4 2.5h3z"
        fill="currentColor"
        stroke="currentColor"
      />
      <circle cx="11.5" cy="8.5" r="0.75" fill="var(--bg)" stroke="none" />
      <path d="M6 21h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'chess',
  name: {
    en: 'Chess',
    pl: 'Szachy',
  },
  description: {
    en: 'Classic 8×8 strategy. Checkmate opponent with tactical moves and castling.',
    pl: 'Królewska gra strategiczna 8×8. Zamatuj króla przeciwnika.',
  },
  icon: <ChessIcon />,
  tags: {
    en: ['classic', '2 players', 'vs computer', 'strategy'],
    pl: ['klasyczna', '2 graczy', 'vs komputer', 'strategia'],
  },
  minPlayers: 1,
  maxPlayers: 2,
}

export { Chess as GameComponent } from './Chess'
