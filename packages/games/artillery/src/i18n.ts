import type { Locale, DifficultyLevel } from './types'

export interface ArtilleryTranslations {
  gameTitle: string
  subtitle: string
  chooseMode: string
  vsComputer: string
  vsComputerDesc: string
  vsComputerAria: string
  twoPlayers: string
  twoPlayersDesc: string
  twoPlayersAria: string
  difficultyLabel: string
  difficulties: Record<DifficultyLevel, string>
  yourTurn: string
  p1Turn: string
  p2Turn: string
  aiTurn: string
  aiThinking: string
  windLabel: string
  windCalm: string
  windLeft: (level: number) => string
  windRight: (level: number) => string
  windLevel: (level: number) => string
  holdToFire: string
  powerText: (pct: number) => string
  angleLabel: string
  newGame: string
  changeMode: string
  confirmResetTitle: string
  confirmResetDesc: string
  cancelBtn: string
  confirmBtn: string
  statsTitle: string
  you: string
  ai: string
  p1: string
  p2: string
  drawShort: string
  p1Victory: string
  p2Victory: string
  aiVictory: string
  drawResult: string
  gameOverTitle: string
  rematch: string
  round: string
  scoutEnemy: string
  scoutBanner: string
}

export const artilleryTranslations: Record<Locale, ArtilleryTranslations> = {
  en: {
    gameTitle: 'Artillery',
    subtitle: 'Turn-based ballistic duel',
    chooseMode: 'Choose game mode',
    vsComputer: 'vs Computer',
    vsComputerDesc: 'Play against the computer',
    vsComputerAria: 'Play against computer game mode',
    twoPlayers: '2 Players',
    twoPlayersDesc: 'Play with a friend on one screen',
    twoPlayersAria: 'Two players game mode',
    difficultyLabel: 'Difficulty',
    difficulties: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },
    yourTurn: 'Your turn',
    p1Turn: "Player 1's turn",
    p2Turn: "Player 2's turn",
    aiTurn: "Computer's turn",
    aiThinking: 'Computer calculating...',
    windLabel: 'Wind',
    windCalm: 'Wind: Calm',
    windLeft: (level: number) => `◀ Wind: Lvl ${level}`,
    windRight: (level: number) => `Wind: Lvl ${level} ▶`,
    windLevel: (level: number) => `Lvl ${level}`,
    holdToFire: 'HOLD TO FIRE',
    powerText: (pct: number) => `Power: ${pct}%`,
    angleLabel: 'Angle',
    newGame: 'New game',
    changeMode: 'Change mode',
    confirmResetTitle: 'Leave Active Battle?',
    confirmResetDesc: 'An active artillery match is in progress. Starting new game will reset current duel.',
    cancelBtn: 'Resume',
    confirmBtn: 'Start New Game',
    statsTitle: 'Scoreboard',
    you: 'YOU',
    ai: 'Computer',
    p1: 'P1',
    p2: 'P2',
    drawShort: 'D',
    p1Victory: 'You won the duel!',
    p2Victory: 'Player 2 won the duel!',
    aiVictory: 'The Computer destroyed your artillery!',
    drawResult: 'Mutual destruction! Draw!',
    gameOverTitle: 'Battle Concluded',
    rematch: 'Play again',
    round: 'Round',
    scoutEnemy: 'Check enemy position',
    scoutBanner: 'Enemy reconnaissance · Click to return',
  },
  pl: {
    gameTitle: 'Artillery',
    subtitle: 'Turowy pojedynek balistyczny',
    chooseMode: 'Wybierz tryb gry',
    vsComputer: 'vs Komputer',
    vsComputerDesc: 'Graj przeciwko komputerowi',
    vsComputerAria: 'Tryb gry przeciwko komputerowi',
    twoPlayers: '2 graczy',
    twoPlayersDesc: 'Graj z przyjacielem na jednym ekranie',
    twoPlayersAria: 'Tryb dla dwóch graczy',
    difficultyLabel: 'Poziom trudności',
    difficulties: {
      easy: 'Łatwy',
      medium: 'Średni',
      hard: 'Trudny',
    },
    yourTurn: 'Twoja tura',
    p1Turn: 'Tura Gracza 1',
    p2Turn: 'Tura Gracza 2',
    aiTurn: 'Tura Komputera',
    aiThinking: 'Komputer celuje...',
    windLabel: 'Wiatr',
    windCalm: 'Wiatr: Spokojny',
    windLeft: (level: number) => `◀ Wiatr: Poz. ${level}`,
    windRight: (level: number) => `Wiatr: Poz. ${level} ▶`,
    windLevel: (level: number) => `Poz. ${level}`,
    holdToFire: 'PRZYTRZYMAJ ABY STRZELIĆ',
    powerText: (pct: number) => `Moc: ${pct}%`,
    angleLabel: 'Kąt',
    newGame: 'Nowa gra',
    changeMode: 'Zmień tryb',
    confirmResetTitle: 'Przerwać grę?',
    confirmResetDesc: 'Trwa zacięty pojedynek. Rozpoczęcie nowej gry zresetuje aktualny pojedynek.',
    cancelBtn: 'Wróć do gry',
    confirmBtn: 'Nowa gra',
    statsTitle: 'Tabela wyników',
    you: 'TY',
    ai: 'Komputer',
    p1: 'G1',
    p2: 'G2',
    drawShort: 'R',
    p1Victory: 'Wygrałeś pojedynek!',
    p2Victory: 'Gracz 2 wygrał pojedynek!',
    aiVictory: 'Komputer zniszczył twoją artylerię!',
    drawResult: 'Wzajemne zniszczenie! Remis!',
    gameOverTitle: 'Koniec gry',
    rematch: 'Zagraj ponownie',
    round: 'Runda',
    scoutEnemy: 'Sprawdź pozycję przeciwnika',
    scoutBanner: 'Rozpoznanie pozycji przeciwnika · Kliknij, aby wrócić',
  },
}
