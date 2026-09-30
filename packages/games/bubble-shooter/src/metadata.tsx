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

function BubbleIcon() {
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
      <circle cx="9" cy="10" r="6" />
      <circle cx="17.5" cy="16" r="3.2" />
      <circle cx="7" cy="19" r="1.6" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'bubble-shooter',
  name: {
    en: 'Bubble Shooter',
    pl: 'Bubble Shooter',
  },
  description: {
    en: 'Aim, bounce off the walls, and match 3+ colored bubbles before they reach the bottom.',
    pl: 'Celuj, odbijaj się od ścian i łącz 3 lub więcej baniek w tym samym kolorze, zanim dotrą do dołu.',
  },
  icon: <BubbleIcon />,
  tags: {
    en: ['arcade', 'puzzle'],
    pl: ['zręcznościowa', 'logiczna'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}
