import type { Tube } from '../types'
import { BALL_HEX, BallGlyph } from './Icons'

interface TubesBoardProps {
  tubes: Tube[]
  capacity: number
  selected: number | null
  onSelect: (index: number) => void
  isEink?: boolean
}

export function TubesBoard({ tubes, capacity, selected, onSelect, isEink = false }: TubesBoardProps) {
  return (
    <div
      className="bs-tubes-board"
      role="group"
      aria-label="Tubes"
      style={{ ['--bs-tube-count' as string]: tubes.length }}
    >
      {tubes.map((tube, i) => {
        const isSelected = selected === i
        const canReceiveSelection = selected !== null && selected !== i
        return (
          <button
            key={i}
            type="button"
            className={`bs-tube ${isSelected ? 'bs-tube--selected' : ''} ${canReceiveSelection ? 'bs-tube--target' : ''}`}
            style={{ ['--bs-capacity' as string]: capacity }}
            onClick={() => onSelect(i)}
            aria-label={`Tube ${i + 1}${tube.length > 0 ? `, top color ${tube[tube.length - 1]}` : ', empty'}`}
          >
            {/* Top bounce indicator when selected */}
            {isSelected && <div className="bs-tube-bounce-indicator" />}
            <div className="bs-tube-glass">
              {/* Empty slots at top */}
              {Array.from({ length: capacity - tube.length }).map((_, slotIdx) => (
                <div key={`empty-${slotIdx}`} className="bs-ball-slot bs-ball-slot--empty" />
              ))}
              {/* Balls from top to bottom (reversed so top of array = top of tube visually) */}
              {[...tube].reverse().map((color, ballIdx) => (
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
              ))}
            </div>
          </button>
        )
      })}
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
