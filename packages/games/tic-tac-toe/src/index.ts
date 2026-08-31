import type { GameMetadata } from './types'

export const metadata: GameMetadata = {
  slug: 'tic-tac-toe',
  name: {
    en: 'Tic-Tac-Toe',
    pl: 'Kółko i krzyżyk',
  },
  description: {
    en: 'Classic 3×3 game for 2 players or vs computer.',
    pl: 'Klasyczna gra 3×3 dla 2 graczy lub z komputerem.',
  },
  icon: '✕',
  tags: {
    en: ['classic', '2 players', 'vs computer'],
    pl: ['klasyczna', '2 graczy', 'vs komputer'],
  },
  minPlayers: 1,
  maxPlayers: 2,
}

export { TicTacToe as GameComponent } from './TicTacToe'
