import React from 'react'
import type { GameMetadata } from './types'
import { CrystalMatch } from './CrystalMatch'

function CrystalIcon() {
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
      <polygon points="6 3 18 3 22 9 12 22 2 9 6 3" />
      <line x1="12" y1="22" x2="12" y2="9" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <line x1="6" y1="3" x2="12" y2="9" />
      <line x1="18" y1="3" x2="12" y2="9" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'crystal-match',
  name: {
    en: 'Crystal Match',
    pl: 'Crystal Match',
  },
  description: {
    en: 'Match-3 puzzle saga. Swap crystals, trigger cascading combos, and clear infinite levels.',
    pl: 'Układanka typu Match-3. Łącz kryształy, twórz potężne kombinacje i pokonuj kolejne poziomy.',
  },
  icon: <CrystalIcon />,
  tags: {
    en: ['match-3', 'puzzle', 'endless'],
    pl: ['match-3', 'logiczna', 'nieskończona'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}

export { CrystalMatch, CrystalMatch as GameComponent }
export default CrystalMatch
