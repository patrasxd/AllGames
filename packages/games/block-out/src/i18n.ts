import type { Locale } from './types'

export interface BlockOutTranslations {
  gameTitle: string
  level: (n: number) => string
  moves: string
  best: string
  minMoves: string
  undo: string
  reset: string
  levels: string
  howToPlayTitle: string
  howToPlayBody: string
  confirmTitle: string
  confirmRestartDesc: string
  confirmBtn: string
  cancelBtn: string
  wonTitle: string
  wonSub: string
  nextLevel: string
  chooseLevel: string
  levelLocked: string
  levelStars: (n: number) => string
}

export const blockOutTranslations: Record<Locale, BlockOutTranslations> = {
  en: {
    gameTitle: 'Block Out',
    level: (n) => `Level ${n}`,
    moves: 'Moves',
    best: 'Best',
    minMoves: 'Target',
    undo: 'Undo',
    reset: 'Reset',
    levels: 'Levels',
    howToPlayTitle: 'How to play',
    howToPlayBody:
      'Slide the horizontal and vertical blocks to clear a path for the red block. Guide the red block to the exit on the right edge of the board to win each level.',
    confirmTitle: 'Start over?',
    confirmRestartDesc: 'This level is in progress. Restarting will discard your current moves.',
    confirmBtn: 'Restart',
    cancelBtn: 'Cancel',
    wonTitle: 'Escaped!',
    wonSub: 'The red block reached freedom.',
    nextLevel: 'Next level',
    chooseLevel: 'Choose level',
    levelLocked: 'locked',
    levelStars: (n) => `${n} stars`,
  },
  pl: {
    gameTitle: 'Block Out',
    level: (n) => `Poziom ${n}`,
    moves: 'Ruchy',
    best: 'Rekord',
    minMoves: 'Cel',
    undo: 'Cofnij',
    reset: 'Reset',
    levels: 'Poziomy',
    howToPlayTitle: 'Jak grać',
    howToPlayBody:
      'Przesuwaj poziome i pionowe klocki, aby zrobić przejście dla czerwonego klocka. Doprowadź czerwony klocek do wyjścia po prawej stronie planszy, aby ukończyć poziom.',
    confirmTitle: 'Zacząć od nowa?',
    confirmRestartDesc: 'Ten poziom jest w trakcie gry. Restart usunie Twoje obecne ruchy.',
    confirmBtn: 'Restart',
    cancelBtn: 'Anuluj',
    wonTitle: 'Ucieczka udana!',
    wonSub: 'Czerwony klocek dotarł do wyjścia.',
    nextLevel: 'Następny poziom',
    chooseLevel: 'Wybierz poziom',
    levelLocked: 'zablokowany',
    levelStars: (n) => `${n} gwiazdki`,
  },
}
