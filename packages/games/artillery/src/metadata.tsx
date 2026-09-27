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

function ArtilleryIcon() {
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
      aria-hidden="true"
    >
      {/* Tank body & tracks */}
      <rect x="2" y="15" width="20" height="5" rx="2.5" />
      <circle cx="6" cy="17.5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="17.5" r="1.2" fill="currentColor" />
      <circle cx="18" cy="17.5" r="1.2" fill="currentColor" />
      {/* Turret dome */}
      <path d="M7 15a5 5 0 0 1 10 0" />
      {/* Aimed cannon barrel */}
      <path d="M14 12l6-4" strokeWidth="2.2" />
      {/* Muzzle blast spark */}
      <circle cx="21" cy="7" r="1" fill="currentColor" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'artillery',
  name: {
    en: 'Artillery Duel',
    pl: 'Pojedynek Artylerii',
  },
  description: {
    en: 'Classic turn-based artillery duel with destructible hills, shifting wind, ballistic trajectory physics, and explosive arsenal.',
    pl: 'Klasyczny turowy pojedynek artyleryjski ze zniszczalnym terenem, zmiennym wiatrem, fizyką balistyczną i wybuchowym arsenałem.',
  },
  icon: <ArtilleryIcon />,
  tags: {
    en: ['vs computer', '2 players', 'physics'],
    pl: ['vs komputer', '2 graczy', 'fizyka'],
  },
  minPlayers: 1,
  maxPlayers: 2,
}
