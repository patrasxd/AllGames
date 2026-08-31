import { useRef } from 'react'
import type { Point, Direction, GameStatus } from '../types'

interface SnakeCanvasProps {
  snake: Point[]
  food: Point
  obstacles: Point[]
  gridSize: number
  direction: Direction
  status: GameStatus
  isEink?: boolean
  onSwipe: (dir: Direction) => void
  onBoardClick?: () => void
}

export function SnakeCanvas({
  snake,
  food,
  obstacles,
  gridSize,
  direction,
  status,
  isEink = false,
  onSwipe,
  onBoardClick,
}: SnakeCanvasProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    touchStartRef.current = null

    const minSwipeDistance = 24
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) >= minSwipeDistance) {
        onSwipe(deltaX > 0 ? 'RIGHT' : 'LEFT')
      }
    } else {
      if (Math.abs(deltaY) >= minSwipeDistance) {
        onSwipe(deltaY > 0 ? 'DOWN' : 'UP')
      }
    }
  }

  const head = snake[0]

  return (
    <div
      className="snake-board-wrapper"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onBoardClick}
    >
      <svg
        className="snake-board-svg"
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Grid pattern */}
        <defs>
          <pattern id="snakeGrid" width="1" height="1" patternUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.04" fill="var(--border)" />
          </pattern>
        </defs>
        <rect width={gridSize} height={gridSize} fill="url(#snakeGrid)" />

        {/* Obstacles (Bricks / Hurdles) */}
        {obstacles.map((obs, i) => (
          <g key={`obs-${obs.x}-${obs.y}-${i}`}>
            <rect
              x={obs.x + 0.05}
              y={obs.y + 0.05}
              width={0.9}
              height={0.9}
              rx={0.12}
              fill="var(--surface-2)"
              stroke="var(--border-2)"
              strokeWidth={0.06}
            />
            {/* Inner diagonal cross for sketch texture */}
            <line
              x1={obs.x + 0.2}
              y1={obs.y + 0.2}
              x2={obs.x + 0.8}
              y2={obs.y + 0.8}
              stroke="var(--border-2)"
              strokeWidth={0.05}
              strokeLinecap="round"
            />
            <line
              x1={obs.x + 0.8}
              y1={obs.y + 0.2}
              x2={obs.x + 0.2}
              y2={obs.y + 0.8}
              stroke="var(--border-2)"
              strokeWidth={0.05}
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Food */}
        <g className="snake-food">
          <circle
            cx={food.x + 0.5}
            cy={food.y + 0.5}
            r={0.42}
            fill="var(--text)"
            stroke="var(--border-2)"
            strokeWidth={0.06}
          />
          <circle
            cx={food.x + 0.38}
            cy={food.y + 0.38}
            r={0.12}
            fill="var(--bg)"
          />
        </g>

        {/* Snake Body */}
        {snake.slice(1).map((segment, i) => {
          const ratio = 1 - (i / snake.length) * 0.3
          const size = Math.max(0.68, 0.84 * ratio)
          const offset = (1 - size) / 2

          return (
            <rect
              key={`${segment.x}-${segment.y}-${i}`}
              x={segment.x + offset}
              y={segment.y + offset}
              width={size}
              height={size}
              rx={0.2}
              fill="var(--text-dim)"
              stroke="var(--border-2)"
              strokeWidth={0.04}
            />
          )
        })}

        {/* Snake Head */}
        {head && (
          <g className="snake-head">
            <rect
              x={head.x + 0.06}
              y={head.y + 0.06}
              width={0.88}
              height={0.88}
              rx={0.28}
              fill="var(--text)"
              stroke="var(--border-2)"
              strokeWidth={0.06}
            />
            {/* Eyes */}
            {direction === 'RIGHT' && (
              <>
                <circle cx={head.x + 0.7} cy={head.y + 0.3} r={0.09} fill="var(--bg)" />
                <circle cx={head.x + 0.7} cy={head.y + 0.7} r={0.09} fill="var(--bg)" />
              </>
            )}
            {direction === 'LEFT' && (
              <>
                <circle cx={head.x + 0.3} cy={head.y + 0.3} r={0.09} fill="var(--bg)" />
                <circle cx={head.x + 0.3} cy={head.y + 0.7} r={0.09} fill="var(--bg)" />
              </>
            )}
            {direction === 'UP' && (
              <>
                <circle cx={head.x + 0.3} cy={head.y + 0.3} r={0.09} fill="var(--bg)" />
                <circle cx={head.x + 0.7} cy={head.y + 0.3} r={0.09} fill="var(--bg)" />
              </>
            )}
            {direction === 'DOWN' && (
              <>
                <circle cx={head.x + 0.3} cy={head.y + 0.7} r={0.09} fill="var(--bg)" />
                <circle cx={head.x + 0.7} cy={head.y + 0.7} r={0.09} fill="var(--bg)" />
              </>
            )}
          </g>
        )}
      </svg>
    </div>
  )
}
