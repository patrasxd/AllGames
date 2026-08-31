import { memo } from 'react'
import type { SudokuBoard as SudokuBoardType } from '../types'
import { SudokuCell } from './SudokuCell'

interface SudokuBoardProps {
  board: SudokuBoardType
  selectedCell: [number, number] | null
  isEink: boolean
  onSelectCell: (row: number, col: number) => void
}

export const SudokuBoard = memo(function SudokuBoard({
  board,
  selectedCell,
  isEink,
  onSelectCell,
}: SudokuBoardProps) {
  const selectedValue =
    selectedCell !== null ? board[selectedCell[0]][selectedCell[1]].value : null

  return (
    <div className="sdk-board-wrapper">
      <div className="sdk-board" role="grid" aria-label="Sudoku Board">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c

            const isHighlighted =
              selectedCell !== null &&
              !isSelected &&
              (selectedCell[0] === r ||
                selectedCell[1] === c ||
                (Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
                  Math.floor(selectedCell[1] / 3) === Math.floor(c / 3)))

            const isSameNumber =
              selectedValue !== null &&
              !isSelected &&
              cell.value === selectedValue

            return (
              <SudokuCell
                key={`${r}-${c}`}
                cell={cell}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isSameNumber={isSameNumber}
                isEink={isEink}
                onClick={() => onSelectCell(r, c)}
              />
            )
          })
        )}
      </div>
    </div>
  )
})
