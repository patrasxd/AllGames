import { memo, useRef, useCallback, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { MinesweeperBoardState } from '../types'
import { Cell } from './Cell'

interface MinesweeperBoardProps {
  board: MinesweeperBoardState
  zoom: number
  setZoom: Dispatch<SetStateAction<number>>
  isEink: boolean
  onCellClick: (row: number, col: number) => void
  onCellContextMenu: (e: React.MouseEvent, row: number, col: number) => void
  onToggleFlag?: (row: number, col: number) => void
  onCellMouseDown: () => void
  onCellMouseUp: () => void
}

export const MinesweeperBoard = memo(function MinesweeperBoard({
  board,
  zoom,
  setZoom,
  isEink,
  onCellClick,
  onCellContextMenu,
  onToggleFlag,
  onCellMouseDown,
  onCellMouseUp,
}: MinesweeperBoardProps) {
  const rows = board.length
  const cols = board[0].length

  const wrapperRef = useRef<HTMLDivElement>(null)
  const prevZoomRef = useRef(1.0)

  const initialDistanceRef = useRef<number | null>(null)
  const initialZoomRef = useRef<number>(1.0)
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null)

  // Track dragging / scrolling timestamps to prevent accidental cell clicks during map pan/scroll
  const lastScrollOrDragTimeRef = useRef(0)
  const isPinchingRef = useRef(false)

  // Reset zoom on difficulty/size change
  useEffect(() => {
    setZoom(1.0)
    prevZoomRef.current = 1.0
  }, [rows, cols, setZoom])

  // Center preservation on zoom change
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const prev = prevZoomRef.current
    prevZoomRef.current = zoom

    if (prev === zoom) return

    const scrollCenterX = el.scrollLeft + el.clientWidth / 2
    const scrollCenterY = el.scrollTop + el.clientHeight / 2
    const scale = zoom / prev

    const targetScrollX = scrollCenterX * scale - el.clientWidth / 2
    const targetScrollY = scrollCenterY * scale - el.clientHeight / 2

    requestAnimationFrame(() => {
      if (!el) return
      el.scrollLeft = Math.max(0, targetScrollX)
      el.scrollTop = Math.max(0, targetScrollY)
    })
  }, [zoom])

  // Prevent browser window pinch-zoom so board-level pinch-zoom works smoothly
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const onNativeTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault()
      }
    }
    el.addEventListener('touchmove', onNativeTouchMove, { passive: false })
    return () => {
      el.removeEventListener('touchmove', onNativeTouchMove)
    }
  }, [])

  const handleScroll = useCallback(() => {
    lastScrollOrDragTimeRef.current = Date.now()
  }, [])

  // Pinch-to-zoom gesture on touch devices
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        isPinchingRef.current = true
        lastScrollOrDragTimeRef.current = Date.now()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        initialDistanceRef.current = Math.hypot(dx, dy)
        initialZoomRef.current = zoom
      } else if (e.touches.length === 1) {
        touchStartPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    },
    [zoom],
  )

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current !== null) {
      isPinchingRef.current = true
      lastScrollOrDragTimeRef.current = Date.now()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const currentDist = Math.hypot(dx, dy)
      const scaleFactor = currentDist / initialDistanceRef.current
      const newZoom = Math.min(2.2, Math.max(0.7, initialZoomRef.current * scaleFactor))
      setZoom(Math.round(newZoom * 100) / 100)
    } else if (e.touches.length === 1 && touchStartPosRef.current) {
      const dx = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x)
      const dy = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y)
      if (dx > 10 || dy > 10) {
        lastScrollOrDragTimeRef.current = Date.now()
      }
    }
  }, [setZoom])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialDistanceRef.current = null
      if (isPinchingRef.current) {
        lastScrollOrDragTimeRef.current = Date.now()
        setTimeout(() => {
          isPinchingRef.current = false
        }, 300)
      }
    }
    if (e.touches.length === 0) {
      touchStartPosRef.current = null
    }
  }, [])

  // Wheel zoom (Ctrl + wheel)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.15 : -0.15
      setZoom((z) => Math.min(2.2, Math.max(0.7, Math.round((z + delta) * 100) / 100)))
    }
  }, [setZoom])

  const handleSafeCellClick = useCallback(
    (row: number, col: number) => {
      // Discard clicks that occur during or immediately after dragging/scrolling or pinching
      if (isPinchingRef.current || Date.now() - lastScrollOrDragTimeRef.current < 350) {
        return
      }
      onCellClick(row, col)
    },
    [onCellClick],
  )

  return (
    <div className="ms-board-container">
      <div
        ref={wrapperRef}
        className="ms-board-wrapper"
        data-rows={rows}
        data-cols={cols}
        style={{ '--ms-zoom': zoom } as React.CSSProperties}
        onScroll={handleScroll}
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
                onClick={() => handleSafeCellClick(r, c)}
                onContextMenu={(e) => onCellContextMenu(e, r, c)}
                onToggleFlag={onToggleFlag ? () => onToggleFlag(r, c) : undefined}
                onMouseDown={onCellMouseDown}
                onMouseUp={onCellMouseUp}
              />
            )),
          )}
        </div>
      </div>
    </div>
  )
})
