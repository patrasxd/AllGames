import React from 'react'

export interface GameMetadata {
  slug: string
  name: { en: string; pl: string }
  description: { en: string; pl: string }
  icon: React.ReactNode
  tags: { en: string[]; pl: string[] }
  minPlayers: 1 | 2
  maxPlayers: 1 | 2
}

function FlaskIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="14" r="5" />
      <circle cx="17" cy="10" r="4" />
      <path d="M13.5 12.2 12 13" />
      <path d="M17 3v3" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'alchemy',
  name: {
    en: 'Alchemy',
    pl: 'Alchemia',
  },
  description: {
    en: 'Combine water, fire, earth and air into 300+ elements. Drag, mix, search your collection and discover everything.',
    pl: 'Łącz wodę, ogień, ziemię i powietrze w ponad 300 elementów. Przeciągaj, mieszaj, przeglądaj kolekcję i odkryj wszystko.',
  },
  icon: <FlaskIcon />,
  tags: {
    en: ['1 player', 'puzzle', 'sandbox'],
    pl: ['1 gracz', 'logiczna', 'piaskownica'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}
