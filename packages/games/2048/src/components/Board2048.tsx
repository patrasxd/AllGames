import { memo, useRef } from 'react'
import type { TileData, GridSize, Direction } from '../types'
import { Tile } from './Tile'

interface Board2048Props {
  tiles: TileData[]
  size: GridSize
  isEink: boolean
  onMove: (dir: Direction) => void
}

export const Board2048 = memo(function Board2048({
  tiles,
  size,
  isEink,
  onMove,
}: Board2048Props) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    const minSwipeDistance = 30
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (Math.max(absX, absY) < minSwipeDistance) return

    if (absX > absY) {
      onMove(deltaX > 0 ? 'right' : 'left')
    } else {
      onMove(deltaY > 0 ? 'down' : 'up')
    }
  }

  // Generate background cell placeholders
  const backgroundCells = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      backgroundCells.push(<div key={`bg-${r}-${c}`} className="board-2048-bg-cell" />)
    }
  }

  return (
    <div
      className="board-2048-wrapper"
      data-size={size}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background grid */}
      <div
        className="board-2048-bg"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
        }}
      >
        {backgroundCells}
      </div>

      {/* Foreground tiles container */}
      <div className="board-2048-tiles">
        {tiles.map(tile => (
          <Tile key={tile.id} tile={tile} size={size} isEink={isEink} />
        ))}
      </div>
    </div>
  )
})
