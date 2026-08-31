import React from 'react'
import type { GameMetadata } from './types'
import { Solitaire } from './Solitaire'

function SolitaireIcon() {
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
      {/* Outer Card */}
      <rect x="4" y="2" width="16" height="20" rx="2.5" />
      {/* Spade Symbol */}
      <path
        d="M12 7c-1.8 3-4.5 4.5-4.5 7.5a3 3 0 0 0 4.2 2.75V19h1.6v-1.75a3 3 0 0 0 4.2-2.75c0-3-2.7-4.5-4.5-7.5z"
        fill="currentColor"
        stroke="none"
      />
      {/* Corner 'A' */}
      <text
        x="6.5"
        y="6"
        fontSize="3.8"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
      >
        A
      </text>
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'solitaire',
  name: {
    en: 'Solitaire',
    pl: 'Pasjans',
  },
  description: {
    en: 'Classic Klondike card solitaire. Build all 4 foundations from Ace to King.',
    pl: 'Klasyczny pasjans Klondike. Ułóż 4 stosy bazowe od Asa do Króla.',
  },
  icon: <SolitaireIcon />,
  tags: {
    en: ['1 player', 'cards', 'classic', 'logic'],
    pl: ['1 gracz', 'karty', 'klasyczna', 'logiczna'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}

export { Solitaire, Solitaire as GameComponent }
export default Solitaire
