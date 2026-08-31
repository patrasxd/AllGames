import { memo } from 'react'
import type { CellState, PlacedShip } from '../types'

interface Grid10x10Props {
  grid: CellState[][]
  ships: PlacedShip[]
  isEnemy: boolean
  isInteractive: boolean
  title: string
  isEink: boolean
  onCellClick?: (row: number, col: number) => void
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export const Grid10x10 = memo(function Grid10x10({
  grid,
  isEnemy,
  isInteractive,
  title,
  onCellClick,
}: Grid10x10Props) {
  return (
    <div className="bs-grid-panel">
      <div className="bs-grid-title">{title}</div>
      <div className="bs-grid-wrapper">
        {/* Header Letters A-J */}
        <div className="bs-header-row">
          <div className="bs-header-corner" />
          {LETTERS.map(letter => (
            <div key={letter} className="bs-header-letter">
              {letter}
            </div>
          ))}
        </div>

        {/* 10x10 Matrix with Number Column */}
        <div className="bs-matrix-container">
          {grid.map((row, r) => (
            <div key={`row-${r}`} className="bs-matrix-row">
              <div className="bs-header-num">{r + 1}</div>

              {row.map((cell, c) => {
                const isHit = cell === 'hit'
                const isMiss = cell === 'miss'
                const isSunk = cell === 'sunk'
                const isShip = !isEnemy && cell === 'ship'

                let cellClass = 'bs-cell'
                if (isInteractive) cellClass += ' bs-cell--interactive'
                if (isShip) cellClass += ' bs-cell--ship'
                if (isHit) cellClass += ' bs-cell--hit'
                if (isMiss) cellClass += ' bs-cell--miss'
                if (isSunk) cellClass += ' bs-cell--sunk'

                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className={cellClass}
                    onClick={() => isInteractive && onCellClick?.(r, c)}
                    role={isInteractive ? 'button' : 'gridcell'}
                    tabIndex={isInteractive ? 0 : -1}
                    aria-label={`${LETTERS[c]}${r + 1}: ${cell}`}
                    onKeyDown={e => {
                      if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        onCellClick?.(r, c)
                      }
                    }}
                  >
                    {isHit && (
                      <span className="bs-marker bs-marker--hit" aria-hidden="true">
                        ✕
                      </span>
                    )}
                    {isSunk && (
                      <span className="bs-marker bs-marker--sunk" aria-hidden="true">
                        ✕
                      </span>
                    )}
                    {isMiss && (
                      <span className="bs-marker bs-marker--miss" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
