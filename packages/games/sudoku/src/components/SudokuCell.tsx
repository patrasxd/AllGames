import { memo } from 'react'
import type { SudokuCellData } from '../types'

interface SudokuCellProps {
  cell: SudokuCellData
  isSelected: boolean
  isHighlighted: boolean
  isSameNumber: boolean
  isEink: boolean
  onClick: () => void
}

export const SudokuCell = memo(function SudokuCell({
  cell,
  isSelected,
  isHighlighted,
  isSameNumber,
  isEink,
  onClick,
}: SudokuCellProps) {
  let cellClass = 'sdk-cell'
  if (isSelected) cellClass += ' sdk-cell--selected'
  else if (isSameNumber) cellClass += ' sdk-cell--same-num'
  else if (isHighlighted) cellClass += ' sdk-cell--highlighted'

  if (cell.isInitial) cellClass += ' sdk-cell--initial'
  if (cell.isError) cellClass += ' sdk-cell--error'

  // Block borders
  if (cell.col % 3 === 2 && cell.col !== 8) cellClass += ' sdk-cell--border-right'
  if (cell.row % 3 === 2 && cell.row !== 8) cellClass += ' sdk-cell--border-bottom'

  return (
    <div
      className={cellClass}
      onClick={onClick}
      role="gridcell"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`Row ${cell.row + 1}, Column ${cell.col + 1}${
        cell.value ? `, Value ${cell.value}` : ', Empty'
      }`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {cell.value !== null ? (
        <span className="sdk-cell-val">{cell.value}</span>
      ) : cell.notes.size > 0 ? (
        <div className="sdk-cell-notes">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <span key={n} className="sdk-cell-note">
              {cell.notes.has(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
})
