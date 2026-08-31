import React from 'react'
import type { GameMetadata } from './types'

function PixelSnakeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <rect x="1" y="11" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="5" y="11" width="2" height="2" />
      <rect x="5" y="9" width="2" height="2" />
      <rect x="5" y="7" width="2" height="2" />
      <rect x="7" y="7" width="2" height="2" />
      <rect x="9" y="7" width="2" height="2" />
      <rect x="9" y="5" width="2" height="2" />
      <rect x="11" y="5" width="2" height="2" />
      <rect x="14" y="5" width="1.8" height="1.8" fill="var(--text-muted)" />
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'snake',
  name: {
    en: 'Snake',
    pl: 'Wąż',
  },
  description: {
    en: 'Eat food, grow longer, and avoid walls or obstacles.',
    pl: 'Zbieraj punkty, rośnij i unikaj uderzeń w ściany oraz przeszkody.',
  },
  icon: <PixelSnakeIcon />,
  tags: {
    en: ['classic', 'arcade', '1 player'],
    pl: ['klasyczna', 'arcade', '1 gracz'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}

export { Snake as GameComponent } from './Snake'
