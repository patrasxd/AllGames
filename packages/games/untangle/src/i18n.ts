import type { Locale } from './types'

export interface UntangleTranslations {
  gameTitle: string
  level: (n: number) => string
  moves: string
  tangles: string
  best: string
  target: string
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
  boardLabel: string
  pegLabel: (rope: number, selected: boolean, locked: boolean) => string
  holeLabel: (n: number) => string
}

export const untangleTranslations: Record<Locale, UntangleTranslations> = {
  en: {
    gameTitle: 'Untangle',
    level: (n) => `Level ${n}`,
    moves: 'Moves',
    tangles: 'Tangles',
    best: 'Best',
    target: 'Target',
    undo: 'Undo',
    reset: 'Reset',
    levels: 'Levels',
    howToPlayTitle: 'How to play',
    howToPlayBody:
      'Every rope joins two pegs. Drag a rope end to an empty hole, or tap the peg and then the hole, until no ropes cross or touch. Ropes can never run through a peg: the peg you hold stops before it would happen. Ropes lie in layers: an end buried under another rope (dimmed) cannot be lifted until that rope is moved away, so the order matters. Fewer moves earn more stars.',
    confirmTitle: 'Start over?',
    confirmRestartDesc: 'This level is in progress. Restarting will discard your current moves.',
    confirmBtn: 'Restart',
    cancelBtn: 'Cancel',
    wonTitle: 'Untangled!',
    wonSub: 'Not a single rope crosses another.',
    nextLevel: 'Next level',
    chooseLevel: 'Choose level',
    levelLocked: 'locked',
    levelStars: (n) => (n === 1 ? '1 star' : `${n} stars`),
    boardLabel: 'Rope board',
    pegLabel: (rope, selected, locked) =>
      `Rope ${rope} end${selected ? ', selected' : ''}${locked ? ', under another rope' : ''}`,
    holeLabel: (n) => `Empty hole ${n}`,
  },
  pl: {
    gameTitle: 'Rozplątaj',
    level: (n) => `Poziom ${n}`,
    moves: 'Ruchy',
    tangles: 'Splątania',
    best: 'Rekord',
    target: 'Cel',
    undo: 'Cofnij',
    reset: 'Reset',
    levels: 'Poziomy',
    howToPlayTitle: 'Jak grać',
    howToPlayBody:
      'Każda lina łączy dwa kołki. Przeciągnij koniec liny na puste miejsce albo dotknij kołka, a potem miejsca, aż żadne liny nie będą się krzyżować ani dotykać. Liny nie przechodzą przez kołki: trzymany kołek zatrzyma się, zanim lina trafiłaby w inny. Liny leżą warstwami: koniec przykryty inną liną (przyciemniony) nie da się podnieść, dopóki tej liny nie odsuniesz, więc kolejność ma znaczenie. Im mniej ruchów, tym więcej gwiazdek.',
    confirmTitle: 'Zacząć od nowa?',
    confirmRestartDesc: 'Ten poziom jest w trakcie gry. Restart usunie Twoje obecne ruchy.',
    confirmBtn: 'Restart',
    cancelBtn: 'Anuluj',
    wonTitle: 'Rozplątane!',
    wonSub: 'Żadna lina nie krzyżuje się z inną.',
    nextLevel: 'Następny poziom',
    chooseLevel: 'Wybierz poziom',
    levelLocked: 'zablokowany',
    levelStars: (n) => (n === 1 ? '1 gwiazdka' : `${n} gwiazdki`),
    boardLabel: 'Plansza z linami',
    pegLabel: (rope, selected, locked) =>
      `Koniec liny ${rope}${selected ? ', zaznaczony' : ''}${locked ? ', pod inną liną' : ''}`,
    holeLabel: (n) => `Puste miejsce ${n}`,
  },
}
