import React from 'react'
import type { GameMetadata } from './types'
import { Game2048 } from './Game2048'

function Tile2048Icon() {
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
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      <text
        x="7.5"
        y="9.5"
        fontSize="6"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
      >
        2
      </text>
      <text
        x="16.5"
        y="9.5"
        fontSize="6"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
      >
        0
      </text>
      <text
        x="7.5"
        y="18.5"
        fontSize="6"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
      >
        4
      </text>
      <text
        x="16.5"
        y="18.5"
        fontSize="6"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
      >
        8
      </text>
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: '2048',
  name: '2048',
  description: {
    en: 'Slide matching tiles together and reach the 2048 tile.',
    pl: 'Łącz kafelki o tych samych liczbach, aby zdobyć 2048.',
  },
  icon: <Tile2048Icon />,
  tags: {
    en: ['1 player', 'logic', 'numbers'],
    pl: ['1 gracz', 'logiczna', 'liczby'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}

export { Game2048, Game2048 as GameComponent }
export default Game2048
