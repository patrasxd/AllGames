import type { Locale } from './types'

export interface AlchemyTranslations {
  gameTitle: string
  found: string
  mixes: string
  hint: string
  clear: string
  reset: string
  confirmTitle: string
  confirmDesc: string
  confirmBtn: string
  cancelBtn: string
  howToPlayTitle: string
  howToPlayBody: string
  startGame: string
  newElement: string
  tryHint: (a: string, b: string) => string
  noHint: string
  emptyTable: string
  trashHint: string
  inventoryLabel: string
  workspaceLabel: string
  wonTitle: string
  wonSub: (n: number) => string
  keepPlaying: string
  resetProgress: string
  tabElements: string
  tabCollection: string
  searchPlaceholder: string
  allCategories: string
  nothingFound: string
  locked: string
  categoriesLabel: string
}

export const alchemyTranslations: Record<Locale, AlchemyTranslations> = {
  en: {
    gameTitle: 'Alchemy',
    found: 'Found',
    mixes: 'Mixes',
    hint: 'Hint',
    clear: 'Clear',
    reset: 'Reset',
    confirmTitle: 'Reset progress?',
    confirmDesc: 'Every discovered element will be lost and you will start over with the four basics.',
    confirmBtn: 'Reset',
    cancelBtn: 'Cancel',
    howToPlayTitle: 'How to play',
    howToPlayBody:
      'Drag an element from the list onto the table (or just tap it). Drag one element onto another to combine them, or tap one and then the other. Start with water, fire, earth and air and discover everything. Drop an element onto the list to throw it away. The Collection tab shows everything there is to find.',
    startGame: 'Start',
    newElement: 'New element!',
    tryHint: (a, b) => `Try: ${a} + ${b}`,
    noHint: 'Nothing left to hint at',
    emptyTable: 'Tap an element below to put it here',
    trashHint: 'Drop here to remove',
    inventoryLabel: 'Elements',
    workspaceLabel: 'Table',
    wonTitle: 'Master Alchemist!',
    wonSub: (n) => `You discovered all ${n} elements.`,
    keepPlaying: 'Keep playing',
    resetProgress: 'Reset progress',
    tabElements: 'Elements',
    tabCollection: 'Collection',
    searchPlaceholder: 'Search…',
    allCategories: 'All',
    nothingFound: 'Nothing found',
    locked: 'Not discovered yet',
    categoriesLabel: 'Categories',
  },
  pl: {
    gameTitle: 'Alchemia',
    found: 'Odkryto',
    mixes: 'Mieszanki',
    hint: 'Podpowiedź',
    clear: 'Wyczyść',
    reset: 'Reset',
    confirmTitle: 'Zresetować postęp?',
    confirmDesc: 'Wszystkie odkryte elementy zostaną utracone i zaczniesz od czterech podstawowych.',
    confirmBtn: 'Resetuj',
    cancelBtn: 'Anuluj',
    howToPlayTitle: 'Jak grać',
    howToPlayBody:
      'Przeciągnij element z listy na stół (albo po prostu go dotknij). Przeciągnij jeden element na drugi, aby je połączyć, albo dotknij jednego, a potem drugiego. Zacznij od wody, ognia, ziemi i powietrza i odkryj wszystko. Upuść element na listę, aby go wyrzucić. Zakładka Kolekcja pokazuje wszystko, co jest do odkrycia.',
    startGame: 'Start',
    newElement: 'Nowy element!',
    tryHint: (a, b) => `Spróbuj: ${a} + ${b}`,
    noHint: 'Nie ma już podpowiedzi',
    emptyTable: 'Dotknij elementu poniżej, aby położyć go tutaj',
    trashHint: 'Upuść tutaj, aby usunąć',
    inventoryLabel: 'Elementy',
    workspaceLabel: 'Stół',
    wonTitle: 'Mistrz alchemii!',
    wonSub: (n) => `Odkryłeś wszystkie elementy (${n}).`,
    keepPlaying: 'Graj dalej',
    resetProgress: 'Resetuj postęp',
    tabElements: 'Elementy',
    tabCollection: 'Kolekcja',
    searchPlaceholder: 'Szukaj…',
    allCategories: 'Wszystkie',
    nothingFound: 'Brak wyników',
    locked: 'Jeszcze nie odkryto',
    categoriesLabel: 'Kategorie',
  },
}
