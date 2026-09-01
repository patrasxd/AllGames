import { memo, useState, useRef, useCallback } from 'react'
import type { Tile, Particle, ComboPopup, SwapAnimation } from '../types'
import { GemIcon } from './GemIcon'

function StoneIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="6" fill="var(--surface-3, #475569)" stroke="var(--border-2, #64748b)" strokeWidth="2" />
      <line x1="10" y1="16" x2="38" y2="16" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="8" y1="32" x2="40" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="24" y1="16" x2="24" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      <line x1="16" y1="4" x2="16" y2="16" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      <line x1="32" y1="32" x2="32" y2="44" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
    </svg>
  )
}

interface CrystalBoardProps {
  board: Tile[][]
  isEink: boolean
  isAnimating: boolean
  particles: Particle[]
  comboPopups: ComboPopup[]
  swapAnimation: SwapAnimation | null
  hintCoords: { r1: number; c1: number; r2: number; c2: number } | null
  onSwap: (r1: number, c1: number, r2: number, c2: number) => void
}

export const CrystalBoard = memo(function CrystalBoard({
  board,
  isEink,
  isAnimating,
  particles,
  comboPopups,
  swapAnimation,
  hintCoords,
  onSwap,
}: CrystalBoardProps) {
  const [selectedCoord, setSelectedCoord] = useState<{ row: number; col: number } | null>(null)
  const touchStartRef = useRef<{ row: number; col: number; x: number; y: number } | null>(null)
  const hasSwipedRef = useRef(false)

  const rows = board.length
  const cols = board[0]?.length || 8

  const handleTileClick = useCallback(
    (r: number, c: number) => {
      if (isAnimating) return
      const tile = board[r][c]
      if (tile.obstacle === 'empty' || tile.obstacle === 'stone') return
      if (!tile.gem && tile.special === 'none') return

      if (!selectedCoord) {
        setSelectedCoord({ row: r, col: c })
        return
      }

      const { row: r1, col: c1 } = selectedCoord
      const isAdjacent = Math.abs(r1 - r) + Math.abs(c1 - c) === 1

      if (isAdjacent) {
        setSelectedCoord(null)
        onSwap(r1, c1, r, c)
      } else {
        setSelectedCoord({ row: r, col: c })
      }
    },
    [isAnimating, board, selectedCoord, onSwap]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, r: number, c: number) => {
      if (isAnimating) return
      const tile = board[r][c]
      if (tile.obstacle === 'empty' || tile.obstacle === 'stone') return

      hasSwipedRef.current = false
      if (e.touches.length === 1) {
        touchStartRef.current = {
          row: r,
          col: c,
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    },
    [isAnimating, board]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || hasSwipedRef.current || isAnimating) return
      if (e.touches.length !== 1) return

      const dx = e.touches[0].clientX - touchStartRef.current.x
      const dy = e.touches[0].clientY - touchStartRef.current.y
      const minSwipe = 22

      let targetR = touchStartRef.current.row
      let targetC = touchStartRef.current.col

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
        targetC += dx > 0 ? 1 : -1
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipe) {
        targetR += dy > 0 ? 1 : -1
      } else {
        return
      }

      if (targetR >= 0 && targetR < rows && targetC >= 0 && targetC < cols) {
        if (board[targetR][targetC].obstacle !== 'empty' && board[targetR][targetC].obstacle !== 'stone') {
          hasSwipedRef.current = true
          setSelectedCoord(null)
          onSwap(touchStartRef.current.row, touchStartRef.current.col, targetR, targetC)
          touchStartRef.current = null
        }
      }
    },
    [isAnimating, rows, cols, board, onSwap]
  )

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null
  }, [])

  return (
    <div className="cm-board-wrapper">
      <div
        className="cm-board-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {board.map((rowArr, r) =>
          rowArr.map((tile, c) => {
            const isSelected = selectedCoord?.row === r && selectedCoord?.col === c
            const isHint =
              hintCoords &&
              ((hintCoords.r1 === r && hintCoords.c1 === c) ||
                (hintCoords.r2 === r && hintCoords.c2 === c))

            // Compute smooth swap animation transform
            let transformStyle = ''
            let animationClass = ''
            if (swapAnimation) {
              const { r1, c1, r2, c2, phase } = swapAnimation
              if (r === r1 && c === c1) {
                animationClass = phase === 'sliding' ? 'cm-tile--sliding' : 'cm-tile--reverting'
                const offsetX = phase === 'sliding' ? (c2 - c1) * 100 : 0
                const offsetY = phase === 'sliding' ? (r2 - r1) * 100 : 0
                transformStyle = `translate(${offsetX}%, ${offsetY}%)`
              } else if (r === r2 && c === c2) {
                animationClass = phase === 'sliding' ? 'cm-tile--sliding' : 'cm-tile--reverting'
                const offsetX = phase === 'sliding' ? (c1 - c2) * 100 : 0
                const offsetY = phase === 'sliding' ? (r1 - r2) * 100 : 0
                transformStyle = `translate(${offsetX}%, ${offsetY}%)`
              }
            }

            if (tile.obstacle === 'empty') {
              return <div key={tile.id} className="cm-tile cm-tile--empty" aria-hidden="true" />
            }

            return (
              <button
                key={tile.id}
                type="button"
                className={`cm-tile ${isSelected ? 'cm-tile--selected' : ''} ${
                  isHint ? 'cm-tile--hint' : ''
                } ${tile.obstacle !== 'none' ? `cm-tile--${tile.obstacle}` : ''} ${
                  tile.isMatched ? 'cm-tile--matched' : ''
                } ${animationClass}`}
                style={transformStyle ? { transform: transformStyle } : undefined}
                onClick={() => handleTileClick(r, c)}
                onTouchStart={e => handleTouchStart(e, r, c)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                aria-label={`Row ${r + 1}, Col ${c + 1}${tile.gem ? ` ${tile.gem}` : ' empty'}${
                  tile.special !== 'none' ? ` ${tile.special}` : ''
                }${tile.obstacle !== 'none' ? ` ${tile.obstacle}` : ''}`}
                disabled={isAnimating || tile.obstacle === 'stone'}
              >
                {/* Stone Layer */}
                {tile.obstacle === 'stone' && (
                  <div className="cm-obstacle cm-obstacle--stone">
                    <StoneIcon />
                  </div>
                )}

                {/* Ice Layer */}
                {tile.obstacle === 'ice' && <div className="cm-obstacle cm-obstacle--ice" />}
                {tile.obstacle === 'double-ice' && (
                  <div className="cm-obstacle cm-obstacle--double-ice" />
                )}

                {/* Gem Layer */}
                {tile.gem && (
                  <div className="cm-gem-container">
                    <GemIcon
                      gem={tile.gem}
                      special={tile.special}
                      isEink={isEink}
                    />
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Floating Subtle Particles Overlay */}
      {particles.map(p => (
        <div
          key={p.id}
          className="cm-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.alpha,
          }}
        />
      ))}

      {/* Floating Combo Banners */}
      {comboPopups.map(cp => (
        <div
          key={cp.id}
          className="cm-combo-popup"
          style={{ left: `${cp.x}%`, top: `${cp.y}%` }}
        >
          {cp.text}
        </div>
      ))}
    </div>
  )
})
