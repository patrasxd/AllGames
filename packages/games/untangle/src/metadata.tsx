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

function UntangleIcon() {
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
      aria-hidden="true"
    >
      {/* Two ropes crossing in the middle */}
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
      {/* Pegs at the rope ends */}
      <circle cx="5" cy="5" r="2.2" fill="currentColor" fillOpacity="0.25" />
      <circle cx="19" cy="5" r="2.2" fill="currentColor" fillOpacity="0.25" />
      <circle cx="5" cy="19" r="2.2" fill="currentColor" fillOpacity="0.25" />
      <circle cx="19" cy="19" r="2.2" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'untangle',
  name: {
    en: 'Untangle',
    pl: 'Rozplątaj',
  },
  description: {
    en: 'Untangle the ropes by moving their ends to empty pegs, in the right order. Seven board shapes, 200+ levels, star ratings, undo.',
    pl: 'Rozplątuj liny, przenosząc ich końce na wolne kołki we właściwej kolejności. Siedem kształtów plansz, ponad 200 poziomów, gwiazdki.',
  },
  icon: <UntangleIcon />,
  tags: {
    en: ['puzzle', 'logic', 'levels'],
    pl: ['logiczna', 'łamigłówka', 'poziomy'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}
