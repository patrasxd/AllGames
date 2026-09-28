import type { Locale, Difficulty } from './types'

export interface BubbleShooterTranslations {
  gameTitle: string
  score: string
  bestScore: string
  next: string
  difficulty: string
  difficultyLabels: Record<Difficulty, string>
  readySubPrompt: string
  wonTitle: string
  wonSub: string
  lostTitle: string
  lostSub: string
  newBest: string
  restart: string
  startBtn: string
  newGame: string
  fire: string
  confirmTitle: string
  confirmNewGameDesc: string
  confirmDifficultyDesc: string
  confirmBtn: string
  cancelBtn: string
  aimLeft: string
  aimRight: string
}

export const bubbleShooterTranslations: Record<Locale, BubbleShooterTranslations> = {
  en: {
    gameTitle: 'Bubble Shooter',
    score: 'Score',
    bestScore: 'Best',
    next: 'Next',
    difficulty: 'Difficulty',
    difficultyLabels: {
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
    },
    readySubPrompt: 'Aim and fire to match 3 or more bubbles of the same color',
    wonTitle: 'Board Cleared!',
    wonSub: 'Every bubble is gone. Great shooting.',
    lostTitle: 'Game Over',
    lostSub: 'The bubbles reached the bottom. Give it another go.',
    newBest: 'New Best Score!',
    restart: 'Play Again',
    startBtn: 'Start',
    newGame: 'New game',
    fire: 'Fire',
    confirmTitle: 'Start a new game?',
    confirmNewGameDesc: 'A game is in progress. Starting a new one will discard the current board and score.',
    confirmDifficultyDesc:
      'A game is in progress. Changing the difficulty will start a new game and discard the current board and score.',
    confirmBtn: 'New game',
    cancelBtn: 'Cancel',
    aimLeft: 'Aim left',
    aimRight: 'Aim right',
  },
  pl: {
    gameTitle: 'Bubble Shooter',
    score: 'Wynik',
    bestScore: 'Rekord',
    next: 'Kolejna',
    difficulty: 'Trudność',
    difficultyLabels: {
      easy: 'Łatwy',
      normal: 'Normalny',
      hard: 'Trudny',
    },
    readySubPrompt: 'Celuj i strzelaj, aby połączyć 3 lub więcej baniek w tym samym kolorze',
    wonTitle: 'Plansza wyczyszczona!',
    wonSub: 'Wszystkie bańki zniknęły. Świetne strzały!',
    lostTitle: 'Koniec Gry',
    lostSub: 'Bańki dotarły do dołu planszy. Spróbuj jeszcze raz.',
    newBest: 'Nowy Rekord!',
    restart: 'Zagraj ponownie',
    startBtn: 'Start',
    newGame: 'Nowa gra',
    fire: 'Strzel',
    confirmTitle: 'Rozpocząć nową grę?',
    confirmNewGameDesc: 'Trwa rozgrywka. Rozpoczęcie nowej gry usunie obecną planszę i wynik.',
    confirmDifficultyDesc:
      'Trwa rozgrywka. Zmiana poziomu trudności rozpocznie nową grę i usunie obecną planszę i wynik.',
    confirmBtn: 'Nowa gra',
    cancelBtn: 'Anuluj',
    aimLeft: 'Celuj w lewo',
    aimRight: 'Celuj w prawo',
  },
}
