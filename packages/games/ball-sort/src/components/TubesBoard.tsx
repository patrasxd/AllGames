import { useLayoutEffect, useRef } from 'react'
import type { Move, Tube } from '../types'
import { ballVisibility } from '../logic/engine'
import { BALL_HEX, BallGlyph } from './Icons'

interface TubesBoardProps {
  tubes: Tube[]
  capacity: number
  selected: number | null
  onSelect: (index: number) => void
  isEink?: boolean
  /** The pour that just happened; drives the ball flight animation. */
  lastMove?: Move | null
  /** Hidden-colors mode, see LevelConfig.visibleBelowTop. */
  visibleBelowTop?: number
}

const FLIGHT_MS = 520
const STAGGER_MS = 70

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

export function TubesBoard({ tubes, capacity, selected, onSelect, isEink = false, lastMove = null, visibleBelowTop }: TubesBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)

  // Fly the poured balls from their old slot in the source tube, up and over, then drop them
  // into their final slot. The balls are already rendered in their final place, so the
  // animation only adds a transform: if it never runs (e-ink, reduced motion) the game is still correct.
  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board || !lastMove || isEink || prefersReducedMotion()) return

    const tubeEls = board.querySelectorAll<HTMLElement>('.bs-tube-glass')
    const srcGlass = tubeEls[lastMove.from]
    const dstGlass = tubeEls[lastMove.to]
    const dstTube = tubes[lastMove.to]
    const srcTube = tubes[lastMove.from]
    if (!srcGlass || !dstGlass || !dstTube || !srcTube) return

    const oldSrcLen = srcTube.length + lastMove.count
    const srcRect = srcGlass.getBoundingClientRect()
    const dstRect = dstGlass.getBoundingClientRect()
    const animations: Animation[] = []

    for (let i = 0; i < lastMove.count; i++) {
      // i = 0 is the topmost moved ball. Slots are listed top to bottom and there are always `capacity` of them.
      const dstSlot = dstGlass.children[capacity - dstTube.length + i] as HTMLElement | undefined
      const srcSlot = srcGlass.children[capacity - oldSrcLen + i] as HTMLElement | undefined
      const ball = dstSlot?.firstElementChild as HTMLElement | null | undefined
      if (!dstSlot || !srcSlot || !ball || typeof ball.animate !== 'function') continue

      const to = dstSlot.getBoundingClientRect()
      const from = srcSlot.getBoundingClientRect()
      const size = to.height
      const dx = from.left - to.left
      const dy = from.top - to.top
      // Height to travel at: clear of both tube openings, with a little room for the stacked balls.
      const apexY = Math.min(srcRect.top, dstRect.top) - size * (1.1 + i * 0.15) - to.top

      ball.style.position = 'relative'
      ball.style.zIndex = '20'
      const anim = ball.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(1)`, offset: 0, easing: 'cubic-bezier(0.3, 0, 0.6, 1)' },
          {
            transform: `translate(${dx}px, ${apexY}px) scale(1.06)`,
            offset: 0.32,
            easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
          },
          {
            transform: `translate(0px, ${apexY}px) scale(1.06)`,
            offset: 0.66,
            easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)',
          },
          { transform: 'translate(0px, 0px) scale(0.94, 1.06)', offset: 0.92, easing: 'ease-out' },
          { transform: 'translate(0px, 0px) scale(1)', offset: 1 },
        ],
        { duration: FLIGHT_MS, delay: i * STAGGER_MS, fill: 'backwards' },
      )
      const reset = () => {
        ball.style.position = ''
        ball.style.zIndex = ''
      }
      anim.onfinish = reset
      anim.oncancel = reset
      animations.push(anim)
    }

    // A newer move, undo or level change replaces lastMove: snap any unfinished flight to rest.
    return () => animations.forEach((a) => a.cancel())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMove])

  // Split tubes into two balanced rows from 8 tubes upwards (e.g. 8 -> 4 & 4, 9 -> 5 & 4, 10 -> 5 & 5)
  const splitIndex = tubes.length >= 8 ? Math.ceil(tubes.length / 2) : tubes.length
  const topRow = tubes.slice(0, splitIndex).map((tube, i) => ({ tube, index: i }))
  const bottomRow =
    splitIndex < tubes.length ? tubes.slice(splitIndex).map((tube, i) => ({ tube, index: splitIndex + i })) : []

  const renderTube = (tube: Tube, i: number) => {
    const isSelected = selected === i
    const canReceiveSelection = selected !== null && selected !== i
    const visibility = ballVisibility(tube, visibleBelowTop)
    const hiddenCount = visibility.filter((v) => !v).length
    return (
      <button
        key={i}
        type="button"
        className={`bs-tube ${isSelected ? 'bs-tube--selected' : ''} ${canReceiveSelection ? 'bs-tube--target' : ''}`}
        style={{ ['--bs-capacity' as string]: capacity }}
        onClick={() => onSelect(i)}
        aria-label={`Tube ${i + 1}${tube.length > 0 ? `, top color ${tube[tube.length - 1]}` : ', empty'}${hiddenCount > 0 ? `, ${hiddenCount} hidden` : ''}`}
      >
        {/* Top bounce indicator when selected (absolutely positioned so it never shifts the layout) */}
        {isSelected && <div className="bs-tube-bounce-indicator" />}
        <div className="bs-tube-glass">
          {/* Empty slots at top */}
          {Array.from({ length: capacity - tube.length }).map((_, slotIdx) => (
            <div key={`empty-${slotIdx}`} className="bs-ball-slot bs-ball-slot--empty" />
          ))}
          {/* Balls from top to bottom (reversed so top of array = top of tube visually) */}
          {[...tube].reverse().map((color, ballIdx) => {
            if (!visibility[tube.length - 1 - ballIdx]) {
              return (
                <div key={ballIdx} className="bs-ball-slot">
                  <div className="bs-ball bs-ball--hidden" data-hidden="true">
                    ?
                  </div>
                </div>
              )
            }
            return (
              <div key={ballIdx} className="bs-ball-slot">
                <div
                  className="bs-ball"
                  style={
                    isEink
                      ? { background: 'var(--all-surface)', border: '2px solid var(--all-text)' }
                      : {
                          background: `radial-gradient(circle at 32% 28%, ${lighten(BALL_HEX[color])}, ${BALL_HEX[color]})`,
                        }
                  }
                >
                  <BallGlyph
                    color={color}
                    size={16}
                    ink={isEink ? 'var(--all-text)' : '#ffffff'}
                    outline={isEink ? 'var(--all-text)' : 'rgba(0,0,0,0.55)'}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </button>
    )
  }

  return (
    <div
      ref={boardRef}
      className="bs-tubes-board"
      role="group"
      aria-label="Tubes"
      style={{ ['--bs-tube-count' as string]: tubes.length }}
    >
      <div className="bs-tubes-row">{topRow.map(({ tube, index }) => renderTube(tube, index))}</div>
      {bottomRow.length > 0 && (
        <div className="bs-tubes-row">{bottomRow.map(({ tube, index }) => renderTube(tube, index))}</div>
      )}
    </div>
  )
}

function lighten(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, ((n >> 16) & 0xff) + 60)
  const g = Math.min(255, ((n >> 8) & 0xff) + 60)
  const b = Math.min(255, (n & 0xff) + 60)
  return `rgb(${r}, ${g}, ${b})`
}
