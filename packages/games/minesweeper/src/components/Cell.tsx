import { memo, useRef, useCallback } from 'react'
import type { CellState } from '../types'

interface CellProps {
  cell: CellState
  isEink: boolean
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onToggleFlag?: () => void
  onMouseDown: () => void
  onMouseUp: () => void
}

function FlagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M4 2v20h2V14h14l-3-5 3-5H6V2H4z" />
    </svg>
  )
}

function MineIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="12" r="7" />
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2.5" />
      <line x1="1" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2.5" />
      <line x1="4.2" y1="4.2" x2="19.8" y2="19.8" stroke="currentColor" strokeWidth="2" />
      <line x1="4.2" y1="19.8" x2="19.8" y2="4.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="9.5" cy="9.5" r="1.5" fill="var(--bg)" />
    </svg>
  )
}

const NUMBER_COLORS: Record<number, string> = {
  1: '#3b82f6', // Blue
  2: '#10b981', // Green
  3: '#ef4444', // Red
  4: '#8b5cf6', // Purple
  5: '#b91c1c', // Maroon
  6: '#06b6d4', // Cyan
  7: '#111827', // Black
  8: '#6b7280', // Gray
}

export const Cell = memo(function Cell({
  cell,
  isEink,
  onClick,
  onContextMenu,
  onToggleFlag,
  onMouseDown,
  onMouseUp,
}: CellProps) {
  const longPressTimerRef = useRef<number | null>(null)
  const isLongPressRef = useRef(false)
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null)

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      clearLongPress()
      isLongPressRef.current = false
      if (e.touches.length === 1) {
        touchStartPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
        longPressTimerRef.current = window.setTimeout(() => {
          if (!cell.isRevealed) {
            isLongPressRef.current = true
            if (onToggleFlag) {
              onToggleFlag()
            } else {
              onContextMenu(e as unknown as React.MouseEvent)
            }
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(40)
            }
          }
        }, 360)
      }
    },
    [cell.isRevealed, clearLongPress, onToggleFlag, onContextMenu]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartPosRef.current && e.touches.length === 1) {
        const dx = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x)
        const dy = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y)
        if (dx > 8 || dy > 8) {
          clearLongPress()
        }
      }
    },
    [clearLongPress]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clearLongPress()
      if (isLongPressRef.current) {
        e.preventDefault()
      }
    },
    [clearLongPress]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isLongPressRef.current) {
        isLongPressRef.current = false
        e.preventDefault()
        e.stopPropagation()
        return
      }
      onClick()
    },
    [onClick]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        onMouseDown()
      }
    },
    [onMouseDown]
  )

  let content = null
  let cellClass = 'ms-cell'

  if (cell.isRevealed) {
    cellClass += ' ms-cell--revealed'
    if (cell.hasMine) {
      cellClass += cell.isExploded ? ' ms-cell--exploded' : ' ms-cell--mine'
      content = <MineIcon />
    } else if (cell.neighborMines > 0) {
      const color = isEink ? 'var(--text)' : NUMBER_COLORS[cell.neighborMines]
      content = (
        <span className="ms-cell-number" style={{ color }}>
          {cell.neighborMines}
        </span>
      )
    }
  } else {
    cellClass += ' ms-cell--hidden'
    if (cell.isFlagged) {
      content = (
        <span className="ms-cell-flag">
          <FlagIcon />
        </span>
      )
    }
  }

  return (
    <button
      type="button"
      className={cellClass}
      onClick={handleClick}
      onContextMenu={onContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={clearLongPress}
      aria-label={`Row ${cell.row + 1}, Col ${cell.col + 1}${
        cell.isRevealed
          ? cell.hasMine
            ? ' mine'
            : cell.neighborMines > 0
            ? ` ${cell.neighborMines} mines nearby`
            : ' empty'
          : cell.isFlagged
          ? ' flagged'
          : ' covered'
      }`}
    >
      {content}
    </button>
  )
})
