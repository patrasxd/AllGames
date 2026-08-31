import React from 'react'
import type { GameMetadata } from './types'
import { Memory } from './Memory'

function MemoryCardsIcon() {
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
      {/* Back card */}
      <rect x="2" y="5" width="12" height="15" rx="2" strokeDasharray="2 2" />
      {/* Front card */}
      <rect x="9" y="3" width="13" height="17" rx="2" fill="var(--surface)" />
      {/* Star symbol inside front card */}
      <polygon
        points="15.5 7 16.7 9.8 19.5 10.2 17.5 12.2 18 15 15.5 13.7 13 15 13.5 12.2 11.5 10.2 14.3 9.8 15.5 7"
        strokeWidth="1.2"
      />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'memory',
  name: {
    en: 'Memory',
    pl: 'Pary / Memory',
  },
  description: {
    en: 'Flip cards and match all identical sketched symbol pairs.',
    pl: 'Odkrywaj karty i dopasowuj identyczne pary rysowanych symboli.',
  },
  icon: <MemoryCardsIcon />,
  tags: {
    en: ['1 player', '2 players', 'logic', 'classic'],
    pl: ['1 gracz', '2 graczy', 'logiczna', 'klasyczna'],
  },
  minPlayers: 1,
  maxPlayers: 2,
}

export { Memory, Memory as GameComponent }
export default Memory
