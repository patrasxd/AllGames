import { useRef, useState, useCallback, useEffect, memo } from 'react'
import type { Block, GameTheme } from '../types'
import { getBlockSlideBounds, GRID_SIZE, TARGET_ROW } from '../logic/engine'

interface BoardProps {
  blocks: Block[]
  onSlide: (blockId: string, newPos: number) => void
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  isEink?: boolean
  theme?: GameTheme
}

interface DragState {
  blockId: string
  startX: number
  startY: number
  initialCoord: number
  min: number
  max: number
  orientation: 'h' | 'v'
  currentOffsetPx: number
  stepPx: number
}

export const Board = memo(function Board({
  blocks,
  onSlide,
  selectedBlockId,
  onSelectBlock,
  isEink = false,
  theme,
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, block: Block) => {
      // Primary button only
      if (e.button !== 0) return

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }

      const bounds = getBlockSlideBounds(blocks, block.id)
      if (!bounds) return

      const boardEl = boardRef.current
      if (!boardEl) return

      // Measure exact grid step from adjacent rendered cells
      const cells = boardEl.querySelectorAll<HTMLElement>('.bo-cell')
      let stepPx = 0
      if (cells.length >= 7) {
        if (block.orientation === 'h') {
          stepPx = cells[1].getBoundingClientRect().left - cells[0].getBoundingClientRect().left
        } else {
          stepPx = cells[6].getBoundingClientRect().top - cells[0].getBoundingClientRect().top
        }
      }
      if (!stepPx || stepPx <= 0) {
        const boardRect = boardEl.getBoundingClientRect()
        stepPx = (boardRect.width - 42) / GRID_SIZE + 4
      }

      const initialCoord = block.orientation === 'h' ? block.col : block.row

      e.currentTarget.setPointerCapture(e.pointerId)
      onSelectBlock(block.id)

      setDragState({
        blockId: block.id,
        startX: e.clientX,
        startY: e.clientY,
        initialCoord,
        min: bounds.min,
        max: bounds.max,
        orientation: block.orientation,
        currentOffsetPx: 0,
        stepPx,
      })
    },
    [blocks, onSelectBlock],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragState) return

      const deltaPx = dragState.orientation === 'h' ? e.clientX - dragState.startX : e.clientY - dragState.startY

      const minPx = (dragState.min - dragState.initialCoord) * dragState.stepPx
      const maxPx = (dragState.max - dragState.initialCoord) * dragState.stepPx
      const clampedOffsetPx = Math.max(minPx, Math.min(maxPx, deltaPx))

      setDragState((prev) => (prev ? { ...prev, currentOffsetPx: clampedOffsetPx } : null))
    },
    [dragState],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragState) return

      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }

      const { blockId, currentOffsetPx, initialCoord, min, max, stepPx } = dragState
      const deltaSteps = Math.round(currentOffsetPx / stepPx)
      const targetPos = Math.max(min, Math.min(max, initialCoord + deltaSteps))
      const targetOffsetPx = (targetPos - initialCoord) * stepPx

      // Direct instant lock for E-Ink or if already on spot
      if (isEink || Math.abs(currentOffsetPx - targetOffsetPx) < 1) {
        if (targetPos !== initialCoord) {
          onSlide(blockId, targetPos)
        }
        setDragState(null)
        return
      }

      // Smooth ease-out glide to target cell
      const startOffset = currentOffsetPx
      const startTime = performance.now()
      const duration = 110 // ms

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }

      const animateSnap = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(1, elapsed / duration)
        // Cubic ease-out
        const ease = 1 - Math.pow(1 - progress, 3)
        const current = startOffset + (targetOffsetPx - startOffset) * ease

        if (progress < 1) {
          setDragState((prev) => (prev ? { ...prev, currentOffsetPx: current } : null))
          animFrameRef.current = requestAnimationFrame(animateSnap)
        } else {
          animFrameRef.current = null
          if (targetPos !== initialCoord) {
            onSlide(blockId, targetPos)
          }
          setDragState(null)
        }
      }

      animFrameRef.current = requestAnimationFrame(animateSnap)
    },
    [dragState, isEink, onSlide],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, block: Block) => {
      const bounds = getBlockSlideBounds(blocks, block.id)
      if (!bounds) return

      let targetPos: number | null = null

      if (block.orientation === 'h') {
        if (e.key === 'ArrowLeft' && block.col > bounds.min) {
          targetPos = block.col - 1
        } else if (e.key === 'ArrowRight' && block.col < bounds.max) {
          targetPos = block.col + 1
        }
      } else {
        if (e.key === 'ArrowUp' && block.row > bounds.min) {
          targetPos = block.row - 1
        } else if (e.key === 'ArrowDown' && block.row < bounds.max) {
          targetPos = block.row + 1
        }
      }

      if (targetPos !== null) {
        e.preventDefault()
        onSlide(block.id, targetPos)
      }
    },
    [blocks, onSlide],
  )

  return (
    <div className="bo-board-container" data-eink={isEink ? 'true' : undefined} data-theme={theme}>
      <div ref={boardRef} className="bo-board" role="grid" aria-label="Block Out 6x6 board">
        {/* Background 6x6 cells for sketchbook pegboard feel */}
        <div className="bo-board-grid-cells" aria-hidden="true">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="bo-cell" />
          ))}
        </div>

        {/* Exit Hole in the right wall at Row 2 (target row) */}
        <div
          className="bo-exit-hole"
          style={{ gridRow: TARGET_ROW + 1, gridColumn: GRID_SIZE }}
          aria-label="Exit opening"
        >
          <div className="bo-exit-gap" />
        </div>

        {/* Puzzle Blocks */}
        {blocks.map((b) => {
          const isDragging =
            dragState?.blockId === b.id &&
            (dragState.orientation === 'h' ? b.col === dragState.initialCoord : b.row === dragState.initialCoord)
          const isSelected = selectedBlockId === b.id

          const transformStyle =
            isDragging && dragState
              ? {
                  transform:
                    dragState.orientation === 'h'
                      ? `translateX(${dragState.currentOffsetPx}px)`
                      : `translateY(${dragState.currentOffsetPx}px)`,
                  zIndex: 10,
                  transition: 'none',
                }
              : undefined

          return (
            <button
              key={b.id}
              type="button"
              className={`bo-block ${b.isTarget ? 'bo-block--target' : `bo-block--length-${b.length}`} ${
                b.orientation === 'h' ? 'bo-block--h' : 'bo-block--v'
              } ${isSelected ? 'bo-block--selected' : ''} ${isDragging ? 'bo-block--dragging' : ''}`}
              style={{
                gridRow: `${b.row + 1} / span ${b.orientation === 'v' ? b.length : 1}`,
                gridColumn: `${b.col + 1} / span ${b.orientation === 'h' ? b.length : 1}`,
                ...transformStyle,
              }}
              onPointerDown={(e) => handlePointerDown(e, b)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={(e) => handleKeyDown(e, b)}
              onClick={() => onSelectBlock(b.id)}
              aria-label={`${b.isTarget ? 'Primary target block' : `Block ${b.id}`}, ${
                b.orientation === 'h' ? 'horizontal' : 'vertical'
              } size ${b.length} at row ${b.row + 1}, column ${b.col + 1}`}
            >
              <span className="bo-block-grip" aria-hidden="true">
                {b.isTarget ? (
                  <span className="bo-target-chevron" aria-hidden="true">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                ) : (
                  <span className="bo-grip-dots" />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
})
