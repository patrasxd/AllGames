import type { Locale, Difficulty } from './types'

export interface FlappyBirdTranslations {
  gameTitle: string
  score: string
  bestScore: string
  difficulty: string
  difficultyLabels: Record<Difficulty, string>
  readyPrompt: string
  readySubPrompt: string
  gameOverTitle: string
  gameOverSub: string
  newBest: string
  restart: string
  tapToFlap: string
  howToPlay: string
  rulesTitle: string
  rule1: string
  rule2: string
  rule3: string
}

export const flappyBirdTranslations: Record<Locale, FlappyBirdTranslations> = {
  en: {
    gameTitle: 'Wing Rush',
    score: 'Score',
    bestScore: 'Best',
    difficulty: 'Difficulty',
    difficultyLabels: {
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
    },
    readyPrompt: 'Tap or Space to Flap',
    readySubPrompt: 'Guide your bird through the gates without touching them',
    gameOverTitle: 'Game Over',
    gameOverSub: 'Good run! Try again to beat your personal best.',
    newBest: 'New Best Score!',
    restart: 'Restart',
    tapToFlap: 'Tap / Click anywhere or press Space',
    howToPlay: 'How to Play',
    rulesTitle: 'How to Play Wing Rush',
    rule1: 'Tap screen, click, or press Spacebar / Arrow Up to flap your wings.',
    rule2: 'Fly through the gaps between pillars to score points.',
    rule3: 'Avoid hitting the floor, ceiling, or any obstacles.',
  },
  pl: {
    gameTitle: 'Wing Rush',
    score: 'Wynik',
    bestScore: 'Rekord',
    difficulty: 'Trudność',
    difficultyLabels: {
      easy: 'Łatwy',
      normal: 'Normalny',
      hard: 'Trudny',
    },
    readyPrompt: 'Dotknij lub Spacja, aby lecieć',
    readySubPrompt: 'Prowadź ptaka przez bramki, unikając zderzeń',
    gameOverTitle: 'Koniec Gry',
    gameOverSub: 'Dobra próba! Spróbuj pobić swój najlepszy wynik.',
    newBest: 'Nowy Rekord!',
    restart: 'Zagraj ponownie',
    tapToFlap: 'Kliknij / dotknij lub wciśnij Spację',
    howToPlay: 'Zasady',
    rulesTitle: 'Zasady gry Wing Rush',
    rule1: 'Dotknij ekranu, kliknij myszą lub wciśnij Spację / Strzałkę w górę, aby wzbić się w powietrze.',
    rule2: 'Przelatuj przez luki między filarami, aby zdobywać punkty.',
    rule3: 'Unikaj uderzenia w sufit, podłoże oraz przeszkody.',
  },
}
