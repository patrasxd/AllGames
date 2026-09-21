import { memo, useState, useRef, useCallback, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Tile, Burst, ComboPopup, GemType, SpecialType } from '../types'
import { isIceLocked } from '../logic/engine'
import { GemIcon } from './GemIcon'

/**
 * Board rendering is split into layers that never share a transform:
 *
 *   1. cells   static grid of buttons (input, selection ring, hint ring, holes)
 *   2. ice     the ice that sits UNDER the gems
 *   3. gems    absolutely positioned, keyed by gem id. Moving a gem is just a new
 *              (row, col): swaps, falls and refills all animate from that alone
 *   4. cover   frost over ice and stones. Stones are drawn ABOVE the gem layer,
 *              so gems that fall past a stone visibly pass behind it
 *
 * Ice therefore stays where it is while gems slide over it.
 */

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

const MOVE_SPRING = { type: 'spring', stiffness: 300, damping: 28, mass: 0.8 } as const
const INSTANT = { duration: 0 } as const

interface BoardGem {
  id: string
  gem: GemType
  special: SpecialType
  row: number
  col: number
  drop: number
  pop: boolean
}

interface GemSpriteProps extends BoardGem {
  selected: boolean
  hinted: boolean
  isEink: boolean
  still: boolean
}

const GemSprite = memo(function GemSprite({ gem, special, row, col, drop, pop, selected, hinted, isEink, still }: GemSpriteProps) {
  const x = `${col * 100}%`
  const y = `${row * 100}%`
  const pulsing = hinted && !selected

  return (
    <motion.div
      className="cm-gem"
      // Where the gem first appears: refills start above the board, specials pop in
      // place, everything else (a new level) fades in.
      initial={
        still
          ? false
          : { x, y: `${(row - drop) * 100}%`, scale: pop || drop === 0 ? 0.4 : 1, opacity: pop || drop === 0 ? 0 : 1 }
      }
      animate={{
        x,
        y,
        opacity: 1,
        scale: pulsing ? [1, 1.14, 1] : selected ? 1.12 : 1,
      }}
      exit={still ? { opacity: 0, transition: INSTANT } : { scale: 1.18, opacity: 0, transition: { duration: 0.18, ease: 'easeOut' } }}
      transition={
        still
          ? INSTANT
          : {
              default: MOVE_SPRING,
              scale: pulsing ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', stiffness: 500, damping: 30 },
              opacity: { duration: 0.12 },
            }
      }
    >
      <GemIcon gem={gem} special={special} isEink={isEink} />
    </motion.div>
  )
})

/** Sparkle at a cleared cell. Drives itself with framer-motion, so no per-frame React state. */
const BurstFx = memo(function BurstFx({ burst, rows, cols }: { burst: Burst; rows: number; cols: number }) {
  const dots = [0, 1, 2, 3, 4]
  return (
    <div
      className="cm-burst"
      style={{ left: `${((burst.col + 0.5) / cols) * 100}%`, top: `${((burst.row + 0.5) / rows) * 100}%` }}
    >
      {dots.map(i => {
        const angle = (i / dots.length) * Math.PI * 2 + burst.row + burst.col
        return (
          <motion.span
            key={i}
            className="cm-burst-dot"
            style={{ backgroundColor: burst.color }}
            initial={{ x: 0, y: 0, opacity: 0.95, scale: 1 }}
            animate={{ x: Math.cos(angle) * 20, y: Math.sin(angle) * 20, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
})

interface CrystalBoardProps {
  board: Tile[][]
  isEink: boolean
  isAnimating: boolean
  bursts: Burst[]
  comboPopups: ComboPopup[]
  hintCoords: { r1: number; c1: number; r2: number; c2: number } | null
  onSwap: (r1: number, c1: number, r2: number, c2: number) => void
}

const isBlockedTile = (tile: Tile) => tile.obstacle === 'empty' || tile.obstacle === 'stone'

export const CrystalBoard = memo(function CrystalBoard({
  board,
  isEink,
  isAnimating,
  bursts,
  comboPopups,
  hintCoords,
  onSwap,
}: CrystalBoardProps) {
  const [selectedCoord, setSelectedCoord] = useState<{ row: number; col: number } | null>(null)
  // Feedback when the player tries to move a frozen gem: the ice on that cell shakes
  const [nudged, setNudged] = useState<{ row: number; col: number } | null>(null)
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartRef = useRef<{ row: number; col: number; x: number; y: number } | null>(null)
  const hasSwipedRef = useRef(false)
  const reducedMotion = useReducedMotion()
  const still = isEink || !!reducedMotion

  const rows = board.length
  const cols = board[0]?.length || 8

  const gems = useMemo<BoardGem[]>(() => {
    const out: BoardGem[] = []
    board.forEach((rowArr, r) =>
      rowArr.forEach((tile, c) => {
        if (tile.gem) {
          out.push({
            id: tile.id,
            gem: tile.gem,
            special: tile.special,
            row: r,
            col: c,
            drop: tile.spawnDrop ?? 0,
            pop: !!tile.spawnPop,
          })
        }
      })
    )
    return out
  }, [board])

  const cover = useMemo(() => {
    const out: { r: number; c: number; kind: 'stone' | 'ice' | 'double-ice' }[] = []
    board.forEach((rowArr, r) =>
      rowArr.forEach((tile, c) => {
        if (tile.obstacle === 'stone' || tile.obstacle === 'ice' || tile.obstacle === 'double-ice') {
          out.push({ r, c, kind: tile.obstacle })
        }
      })
    )
    return out
  }, [board])

  const ice = useMemo(() => cover.filter(o => o.kind !== 'stone'), [cover])

  const nudge = useCallback((row: number, col: number) => {
    setNudged({ row, col })
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current)
    nudgeTimerRef.current = setTimeout(() => setNudged(null), 320)
  }, [])

  const handleTileClick = useCallback(
    (r: number, c: number) => {
      if (isAnimating) return
      const tile = board[r][c]
      if (isBlockedTile(tile) || !tile.gem) return
      if (isIceLocked(tile)) {
        nudge(r, c) // frozen: cannot be picked up or swapped into
        return
      }

      if (!selectedCoord) {
        setSelectedCoord({ row: r, col: c })
        return
      }

      const { row: r1, col: c1 } = selectedCoord
      if (r1 === r && c1 === c) {
        setSelectedCoord(null)
        return
      }
      if (Math.abs(r1 - r) + Math.abs(c1 - c) === 1) {
        setSelectedCoord(null)
        onSwap(r1, c1, r, c)
      } else {
        setSelectedCoord({ row: r, col: c })
      }
    },
    [isAnimating, board, selectedCoord, onSwap, nudge]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, r: number, c: number) => {
      if (isAnimating) return
      if (isBlockedTile(board[r][c])) return
      if (isIceLocked(board[r][c])) return // the click that follows shows the nudge
      hasSwipedRef.current = false
      if (e.touches.length === 1) {
        touchStartRef.current = { row: r, col: c, x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    },
    [isAnimating, board]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current
      if (!start || hasSwipedRef.current || isAnimating) return
      if (e.touches.length !== 1) return

      const dx = e.touches[0].clientX - start.x
      const dy = e.touches[0].clientY - start.y
      const minSwipe = 22

      let targetR = start.row
      let targetC = start.col

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
        targetC += dx > 0 ? 1 : -1
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipe) {
        targetR += dy > 0 ? 1 : -1
      } else {
        return
      }

      if (targetR >= 0 && targetR < rows && targetC >= 0 && targetC < cols && !isBlockedTile(board[targetR][targetC])) {
        hasSwipedRef.current = true
        touchStartRef.current = null
        if (isIceLocked(board[targetR][targetC])) {
          nudge(targetR, targetC) // swiping into a frozen gem does nothing
          return
        }
        setSelectedCoord(null)
        onSwap(start.row, start.col, targetR, targetC)
      }
    },
    [isAnimating, rows, cols, board, onSwap, nudge]
  )

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null
  }, [])

  const isHint = (r: number, c: number) =>
    !!hintCoords &&
    ((hintCoords.r1 === r && hintCoords.c1 === c) || (hintCoords.r2 === r && hintCoords.c2 === c))

  const stageStyle = { '--cm-cols': cols, '--cm-rows': rows } as React.CSSProperties
  const gridStyle = { gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }

  return (
    <div className="cm-board-wrapper">
      <div className="cm-board-stage" style={stageStyle}>
        {/* 1. Cells: input and static backgrounds */}
        <div className="cm-board-grid" style={gridStyle}>
          {board.map((rowArr, r) =>
            rowArr.map((tile, c) => {
              if (tile.obstacle === 'empty') {
                return <div key={`cell-${r}-${c}`} className="cm-tile cm-tile--empty" aria-hidden="true" />
              }
              const selected = selectedCoord?.row === r && selectedCoord?.col === c
              return (
                <button
                  key={`cell-${r}-${c}`}
                  type="button"
                  className={`cm-tile${selected ? ' cm-tile--selected' : ''}${isHint(r, c) ? ' cm-tile--hint' : ''}${
                    tile.obstacle === 'stone' ? ' cm-tile--stone' : ''
                  }${isIceLocked(tile) ? ' cm-tile--locked' : ''}`}
                  onClick={() => handleTileClick(r, c)}
                  onTouchStart={e => handleTouchStart(e, r, c)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  aria-label={`Row ${r + 1}, Col ${c + 1}${tile.gem ? ` ${tile.gem}` : ''}${
                    tile.special !== 'none' ? ` ${tile.special}` : ''
                  }${tile.obstacle !== 'none' ? ` ${tile.obstacle}` : ''}`}
                  aria-disabled={isAnimating || undefined}
                  disabled={tile.obstacle === 'stone'}
                />
              )
            })
          )}
        </div>

        {/* 2. Ice under the gems */}
        <div className="cm-layer cm-layer--grid" style={gridStyle} aria-hidden="true">
          <AnimatePresence initial={false}>
            {ice.map(o => (
              <motion.div
                key={`ice-${o.r}-${o.c}-${o.kind}`}
                className={`cm-ice cm-ice--${o.kind}`}
                style={{ gridRow: o.r + 1, gridColumn: o.c + 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={still ? { opacity: 0, transition: INSTANT } : { opacity: 0, scale: 1.1, transition: { duration: 0.28 } }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 3. Gems */}
        <div className="cm-layer cm-layer--gems" aria-hidden="true">
          <AnimatePresence initial={false}>
            {gems.map(g => (
              <GemSprite
                key={g.id}
                {...g}
                selected={selectedCoord?.row === g.row && selectedCoord?.col === g.col}
                hinted={isHint(g.row, g.col)}
                isEink={isEink}
                still={still}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 4. Cover: frost over ice, stones over gems */}
        <div className="cm-layer cm-layer--grid" style={gridStyle} aria-hidden="true">
          <AnimatePresence initial={false}>
            {cover.map(o => (
              <motion.div
                key={`cover-${o.r}-${o.c}-${o.kind}`}
                className={`cm-cover cm-cover--${o.kind}`}
                style={{ gridRow: o.r + 1, gridColumn: o.c + 1 }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: !still && nudged?.row === o.r && nudged?.col === o.c ? [0, -3, 3, -2, 2, 0] : 0,
                }}
                transition={{ x: { duration: 0.3 } }}
                exit={still ? { opacity: 0, transition: INSTANT } : { opacity: 0, scale: o.kind === 'stone' ? 0.6 : 1.1, transition: { duration: 0.26 } }}
              >
                {o.kind === 'stone' && <StoneIcon />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sparkles */}
        {!still && (
          <div className="cm-layer cm-layer--fx" aria-hidden="true">
            {bursts.map(b => (
              <BurstFx key={b.id} burst={b} rows={rows} cols={cols} />
            ))}
          </div>
        )}

        {/* Combo banners */}
        {comboPopups.map(cp => (
          <div key={cp.id} className="cm-combo-popup" style={{ left: `${cp.x}%`, top: `${cp.y}%` }}>
            {cp.text}
          </div>
        ))}
      </div>
    </div>
  )
})
