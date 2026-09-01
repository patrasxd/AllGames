import type { Locale } from './types'

export interface CrystalMatchTranslations {
  gameTitle: string
  level: (lvl: number) => string
  moves: string
  score: string
  target: string
  goals: string
  levelSelect: string
  howToPlay: string
  restart: string
  nextLevel: string
  tryAgain: string
  startLevel: string
  levelTargetTitle: string
  victoryTitle: string
  victorySub: string
  defeatTitle: string
  defeatSub: string
  outOfMoves: string
  scoreGoal: (target: number) => string
  iceGoal: (current: number, target: number) => string
  stoneGoal: (current: number, target: number) => string
  gemGoal: (current: number, target: number, gem: string) => string
  stars: string
  resetProgress: string
  confirmResetProgress: string
  confirmResetDesc: string
  cancelBtn: string
  confirmBtn: string
  rulesTitle: string
  rule1: string
  rule2: string
  rule3: string
  rule4: string
}

export const crystalMatchTranslations: Record<Locale, CrystalMatchTranslations> = {
  en: {
    gameTitle: 'Crystal Match',
    level: lvl => `Level ${lvl}`,
    moves: 'Moves',
    score: 'Score',
    target: 'Target',
    goals: 'Goals',
    levelSelect: 'Levels',
    howToPlay: 'How to Play',
    restart: 'Restart',
    nextLevel: 'Next Level',
    tryAgain: 'Try Again',
    startLevel: 'Play Level',
    levelTargetTitle: 'Level Goals',
    victoryTitle: 'Level Cleared!',
    victorySub: 'Brilliant matching! You unlocked the next level.',
    defeatTitle: 'Out of Moves',
    defeatSub: 'Keep trying to clear all goals in time.',
    outOfMoves: 'No moves left',
    scoreGoal: target => `Reach ${target} pts`,
    iceGoal: (curr, target) => `Break Ice: ${curr}/${target}`,
    stoneGoal: (curr, target) => `Break Stones: ${curr}/${target}`,
    gemGoal: (curr, target, gem) => `Collect ${gem}: ${curr}/${target}`,
    stars: 'Stars',
    resetProgress: 'Reset Progress',
    confirmResetProgress: 'Reset All Levels?',
    confirmResetDesc: 'This will reset your unlocked levels and star ratings back to Level 1.',
    cancelBtn: 'Cancel',
    confirmBtn: 'Reset',
    rulesTitle: 'How to Play Crystal Match',
    rule1: 'Match 3 in a line: Swap adjacent crystals to match 3 of the same color.',
    rule2: 'Match 4: Creates a Line Blaster that clears a whole row or column.',
    rule3: 'Match 5 (T/L shape): Creates a Crystal Bomb with a 3x3 blast.',
    rule4: 'Match 5 in a line: Creates a Rainbow Prism that clears all crystals of one color.',
  },
  pl: {
    gameTitle: 'Crystal Match',
    level: lvl => `Poziom ${lvl}`,
    moves: 'Ruchy',
    score: 'Wynik',
    target: 'Cel',
    goals: 'Cele',
    levelSelect: 'Poziomy',
    howToPlay: 'Zasady',
    restart: 'Restart',
    nextLevel: 'Następny Poziom',
    tryAgain: 'Spróbuj Ponownie',
    startLevel: 'Graj',
    levelTargetTitle: 'Cele Poziomu',
    victoryTitle: 'Poziom Ukończony!',
    victorySub: 'Wspaniałe dopasowania! Odblokowano kolejny poziom.',
    defeatTitle: 'Koniec Ruchów',
    defeatSub: 'Spróbuj ponownie, aby zrealizować wszystkie cele.',
    outOfMoves: 'Brak ruchów',
    scoreGoal: target => `Zdobądź ${target} pkt`,
    iceGoal: (curr, target) => `Rozbij Lód: ${curr}/${target}`,
    stoneGoal: (curr, target) => `Zniszcz Skały: ${curr}/${target}`,
    gemGoal: (curr, target, gem) => `Zbierz ${gem}: ${curr}/${target}`,
    stars: 'Gwiazdki',
    resetProgress: 'Reset Postępu',
    confirmResetProgress: 'Zresetować Poziomy?',
    confirmResetDesc: 'Spowoduje to wyzerowanie odblokowanych poziomów i powrót do Poziomu 1.',
    cancelBtn: 'Anuluj',
    confirmBtn: 'Resetuj',
    rulesTitle: 'Zasady gry Crystal Match',
    rule1: 'Połącz 3 w linii: Zamieniaj sąsiadujące kryształy, tworząc linie tego samego koloru.',
    rule2: 'Połącz 4: Tworzy kryształ laserowy, który czyści cały wiersz lub kolumnę.',
    rule3: 'Połącz 5 (w kształcie T lub L): Tworzy bombę wybuchającą w promieniu 3x3.',
    rule4: 'Połącz 5 w linii: Tworzy tęczowy pryzmat niszczący wszystkie kryształy wybranego koloru.',
  },
}
