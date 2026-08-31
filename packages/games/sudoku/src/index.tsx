import React from 'react'
import type { GameMetadata } from './types'
import { Sudoku } from './Sudoku'

function SudokuIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block' }}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" strokeWidth="1.5" />
      <line x1="15" y1="3" x2="15" y2="21" strokeWidth="1.5" />
      <line x1="3" y1="9" x2="21" y2="9" strokeWidth="1.5" />
      <line x1="3" y1="15" x2="21" y2="15" strokeWidth="1.5" />
      <text
        x="6"
        y="7.5"
        fontSize="4.5"
        fontWeight="bold"
        fontFamily="monospace"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
      >
        5
      </text>
      <text
        x="12"
        y="13.5"
        fontSize="4.5"
        fontWeight="bold"
        fontFamily="monospace"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
      >
        3
      </text>
      <text
        x="18"
        y="19.5"
        fontSize="4.5"
        fontWeight="bold"
        fontFamily="monospace"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
      >
        9
      </text>
    </svg>
  )
}

export const metadata: GameMetadata = {
  slug: 'sudoku',
  name: 'Sudoku',
  description: {
    en: 'Fill the 9x9 grid with numbers 1 to 9 without repeating.',
    pl: 'Wypełnij siatkę 9x9 cyframi od 1 do 9 bez powtórzeń.',
  },
  icon: <SudokuIcon />,
  tags: {
    en: ['1 player', 'logic', 'numbers', 'classic'],
    pl: ['1 gracz', 'logiczna', 'liczby', 'klasyczna'],
  },
  minPlayers: 1,
  maxPlayers: 1,
}

export { Sudoku, Sudoku as GameComponent }
export default Sudoku
