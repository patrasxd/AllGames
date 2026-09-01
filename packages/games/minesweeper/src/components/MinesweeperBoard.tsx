import { memo, useState, useRef, useCallback, useEffect } from 'react'
import type { MinesweeperBoardState } from '../types'
import { Cell } from './Cell'

interface MinesweeperBoardProps {
  board: MinesweeperBoardState
  isEink: boolean
  onCellClick: (row: number, col: number) => void
  onCellContextMenu: (e: React.MouseEvent, row: number, col: number) => void
  onToggleFlag?: (row: number, col: number) => void
  onCellMouseDown: () => void
  onCellMouseUp: () => void
}

export const MinesweeperBoard = memo(function MinesweeperBoard({
  board,
  isEink,
  onCellClick,
  onCellContextMenu,
  onToggleFlag,
  onCellMouseDown,
  onCellMouseUp,
}: MinesweeperBoardProps) {
  const rows = board.length
  const cols = board[0].length

  const [zoom, setZoom] = useState(1.0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const initialDistanceRef = useRef<number | null>(null)
  const initialZoomRef = useRef<number>(1.0)

  // Reset zoom on difficulty/size change
  useEffect(() => {
    setZoom(1.0)
  }, [rows, cols])

  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(2.2, Math.round((z + 0.2) * 10) / 10))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(0.7, Math.round((z - 0.2) * 10) / 10))
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoom(1.0)
  }, [])

  // Pinch-to-zoom gesture on touch devices
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        initialDistanceRef.current = Math.hypot(dx, dy)
        initialZoomRef.current = zoom
      }
    },
    [zoom]
  )

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const currentDist = Math.hypot(dx, dy)
      const scaleFactor = currentDist / initialDistanceRef.current
      const newZoom = Math.min(2.2, Math.max(0.7, initialZoomRef.current * scaleFactor))
      setZoom(Math.round(newZoom * 100) / 100)
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialDistanceRef.current = null
    }
  }, [])

  // Wheel zoom (Ctrl + wheel)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.15 : -0.15
      setZoom(z => Math.min(2.2, Math.max(0.7, Math.round((z + delta) * 100) / 100)))
    }
  }, [])

  return (
    <div className="ms-board-container">
      {/* Interactive Board Zoom Toolbar */}
      <div className="ms-zoom-bar" role="toolbar" aria-label="Board Zoom Controls">
        <button
          type="button"
          className="ms-zoom-btn"
          onClick={handleZoomOut}
          disabled={zoom <= 0.7}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button
          type="button"
          className="ms-zoom-level-btn"
          onClick={handleResetZoom}
          title="Reset zoom"
          aria-label={`Current zoom ${Math.round(zoom * 100)}%. Click to reset.`}
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          className="ms-zoom-btn"
          onClick={handleZoomIn}
          disabled={zoom >= 2.2}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div
        ref={wrapperRef}
        className="ms-board-wrapper"
        data-rows={rows}
        data-cols={cols}
        style={{ '--ms-zoom': zoom } as React.CSSProperties}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div
          className="ms-board-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {board.map((rowArr, r) =>
            rowArr.map((cell, c) => (
              <Cell
                key={`${r}-${c}`}
                cell={cell}
                isEink={isEink}
                onClick={() => onCellClick(r, c)}
                onContextMenu={e => onCellContextMenu(e, r, c)}
                onToggleFlag={onToggleFlag ? () => onToggleFlag(r, c) : undefined}
                onMouseDown={onCellMouseDown}
                onMouseUp={onCellMouseUp}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
})
