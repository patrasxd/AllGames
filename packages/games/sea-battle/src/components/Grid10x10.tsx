import { memo, useState } from 'react'
import type { CellState, Orientation, PlacedShip } from '../types'
import { canPlaceShip } from '../logic'

interface Grid10x10Props {
  grid: CellState[][]
  ships: PlacedShip[]
  isEnemy: boolean
  isInteractive: boolean
  title: string
  isEink: boolean
  showShips?: boolean
  placementPreview?: { size: number; orientation: Orientation }
  onCellClick?: (row: number, col: number) => void
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export const Grid10x10 = memo(function Grid10x10({
  grid,
  isEnemy,
  isInteractive,
  title,
  showShips = !isEnemy,
  placementPreview,
  onCellClick,
}: Grid10x10Props) {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null)

  return (
    <div className="bs-grid-panel">
      <div className="bs-grid-title">{title}</div>
      <div className="bs-grid-wrapper">
        {/* Header Letters A-J */}
        <div className="bs-header-row">
          <div className="bs-header-corner" />
          {LETTERS.map((letter) => (
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
                const visibleCell = showShips || cell === 'hit' || cell === 'miss' || cell === 'sunk' ? cell : 'empty'
                const isHit = visibleCell === 'hit'
                const isMiss = visibleCell === 'miss'
                const isSunk = visibleCell === 'sunk'
                const isShip = showShips && cell === 'ship'
                const previewOffset =
                  hoveredCell && placementPreview
                    ? placementPreview.orientation === 'horizontal'
                      ? r === hoveredCell[0] && c >= hoveredCell[1] && c < hoveredCell[1] + placementPreview.size
                        ? c - hoveredCell[1]
                        : -1
                      : c === hoveredCell[1] && r >= hoveredCell[0] && r < hoveredCell[0] + placementPreview.size
                        ? r - hoveredCell[0]
                        : -1
                    : -1
                const isPreviewCell = isInteractive && previewOffset >= 0
                const isPreviewValid =
                  !hoveredCell ||
                  !placementPreview ||
                  canPlaceShip(
                    grid,
                    hoveredCell[0],
                    hoveredCell[1],
                    placementPreview.size,
                    placementPreview.orientation,
                  )

                let cellClass = 'bs-cell'
                if (isInteractive) cellClass += ' bs-cell--interactive'
                if (isShip) cellClass += ' bs-cell--ship'
                if (isPreviewCell)
                  cellClass += ` bs-cell--placement-preview${isPreviewValid ? '' : ' bs-cell--placement-invalid'}`
                if (isHit) cellClass += ' bs-cell--hit'
                if (isMiss) cellClass += ' bs-cell--miss'
                if (isSunk) cellClass += ' bs-cell--sunk'

                const contents = (
                  <>
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
                  </>
                )

                const cellLabel = `${LETTERS[c]}${r + 1}: ${visibleCell}`
                if (isInteractive) {
                  return (
                    <button
                      key={`cell-${r}-${c}`}
                      type="button"
                      className={cellClass}
                      onMouseEnter={() => placementPreview && setHoveredCell([r, c])}
                      onMouseLeave={() => placementPreview && setHoveredCell(null)}
                      onFocus={() => placementPreview && setHoveredCell([r, c])}
                      onBlur={() => placementPreview && setHoveredCell(null)}
                      onClick={() => {
                        setHoveredCell(null)
                        onCellClick?.(r, c)
                      }}
                      aria-label={cellLabel}
                    >
                      {contents}
                    </button>
                  )
                }

                return (
                  <div key={`cell-${r}-${c}`} className={cellClass} role="gridcell" aria-label={cellLabel}>
                    {contents}
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
