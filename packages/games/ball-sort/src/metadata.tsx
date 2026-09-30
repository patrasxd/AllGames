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

function TubeIcon() {
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
      <path d="M9 2h6" />
      <path d="M10 2v6.5L5.5 17a3 3 0 0 0 2.7 4.3h7.6a3 3 0 0 0 2.7-4.3L14 8.5V2" />
      <path d="M7.2 15h9.6" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'ball-sort',
  name: {
    en: 'Ball Sort',
    pl: 'Ball Sort',
  },
  description: {
    en: 'Pour colors between tubes until every one holds a single color. 100+ levels, star ratings.',
    pl: 'Przelewaj kolory między probówkami, aż każda będzie jednolita. Ponad 100 poziomów, gwiazdki za wynik.',
  },
  icon: <TubeIcon />,
  tags: {
    en: ['puzzle', 'levels'],
    pl: ['logiczna', 'poziomy'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}
