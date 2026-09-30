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

function BlockOutIcon() {
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
      {/* Outer board frame with right-side exit gap */}
      <path d="M21 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5" />
      {/* Vertical obstacle block */}
      <rect x="6" y="5.5" width="4.5" height="13" rx="1.5" />
      {/* Primary sliding block escaping through the exit */}
      <rect x="12" y="9.5" width="10" height="5" rx="1.5" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'block-out',
  name: {
    en: 'Block Out',
    pl: 'Block Out',
  },
  description: {
    en: 'Slide blocks to clear a path and guide the primary block to freedom. 100 levels, star ratings.',
    pl: 'Przesuwaj klocki, by utorować drogę i wyprowadzić główny klocek na wolność. 100 poziomów, gwiazdki.',
  },
  icon: <BlockOutIcon />,
  tags: {
    en: ['puzzle', 'logic', 'levels'],
    pl: ['logiczna', 'łamigłówka', 'poziomy'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}
