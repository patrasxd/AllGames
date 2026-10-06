import type { Locale } from './types'

export interface BallSortTranslations {
  gameTitle: string
  level: (n: number) => string
  moves: string
  best: string
  newGame: string
  undo: string
  reset: string
  levels: string
  confirmTitle: string
  confirmNewGameDesc: string
  confirmBtn: string
  cancelBtn: string
  wonTitle: string
  wonSub: string
  nextLevel: string
  chooseLevel: string
  levelLocked: string
  levelStars: (n: number) => string
  howToPlayTitle: string
  howToPlayBody: string
  startLevel: string
  hiddenNote: string
}

export const ballSortTranslations: Record<Locale, BallSortTranslations> = {
  en: {
    gameTitle: 'Ball Sort',
    level: (n) => `Level ${n}`,
    moves: 'Moves',
    best: 'Best',
    newGame: 'New game',
    undo: 'Undo',
    reset: 'Reset',
    levels: 'Levels',
    confirmTitle: 'Start over?',
    confirmNewGameDesc: 'This level is in progress. Restarting will discard your moves.',
    confirmBtn: 'Restart',
    cancelBtn: 'Cancel',
    wonTitle: 'Sorted!',
    wonSub: 'Every tube is a single color.',
    nextLevel: 'Next level',
    chooseLevel: 'Choose level',
    levelLocked: 'locked',
    levelStars: (n) => `${n} stars`,
    howToPlayTitle: 'How to play',
    howToPlayBody:
      'Tap a tube to pick up its top color, then tap another tube to pour it there. You can only pour onto an empty tube or one topped with the same color. Sort every color into its own tube to win. From level 150, some colors are hidden ("?") until you uncover them.',
    startLevel: 'Start',
    hiddenNote: 'Hidden colors: only the top of each tube is revealed.',
  },
  pl: {
    gameTitle: 'Ball Sort',
    level: (n) => `Poziom ${n}`,
    moves: 'Ruchy',
    best: 'Rekord',
    newGame: 'Nowa gra',
    undo: 'Cofnij',
    reset: 'Reset',
    levels: 'Poziomy',
    confirmTitle: 'Zacząć od nowa?',
    confirmNewGameDesc: 'Ten poziom jest w trakcie rozgrywki. Restart usunie Twoje ruchy.',
    confirmBtn: 'Restart',
    cancelBtn: 'Anuluj',
    wonTitle: 'Posortowane!',
    wonSub: 'Każda probówka ma jeden kolor.',
    nextLevel: 'Następny poziom',
    chooseLevel: 'Wybierz poziom',
    levelLocked: 'zablokowany',
    levelStars: (n) => `${n} gwiazdki`,
    howToPlayTitle: 'Jak grać',
    howToPlayBody:
      'Dotknij probówki, aby podnieść jej górny kolor, a potem dotknij innej, aby go tam przelać. Możesz przelewać tylko do pustej probówki albo takiej, na której wierzchu jest ten sam kolor. Posortuj każdy kolor do osobnej probówki, aby wygrać. Od poziomu 150 część kolorów jest ukryta („?”), dopóki jej nie odkryjesz.',
    startLevel: 'Start',
    hiddenNote: 'Ukryte kolory: widać tylko wierzch każdej probówki.',
  },
}
