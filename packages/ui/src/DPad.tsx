import React, { useRef } from 'react'
import './DPad.css'

export type DPadDirection = 'up' | 'down' | 'left' | 'right'

export interface DPadLabels {
  up?: string
  down?: string
  left?: string
  right?: string
}

export interface DPadProps {
  onDirection: (direction: DPadDirection) => void
  disabled?: boolean
  className?: string
  ariaLabel?: string
  variant?: 'compact' | 'cross'
  labels?: DPadLabels
}

const DEFAULT_LABELS: Required<DPadLabels> = {
  up: 'Move Up',
  down: 'Move Down',
  left: 'Move Left',
  right: 'Move Right',
}

export function DPad({
  onDirection,
  disabled = false,
  className = '',
  ariaLabel = 'Directional Pad',
  variant = 'compact',
  labels = {},
}: DPadProps) {
  const lastTouchRef = useRef(0)

  const resolvedLabels = {
    up: labels.up || DEFAULT_LABELS.up,
    down: labels.down || DEFAULT_LABELS.down,
    left: labels.left || DEFAULT_LABELS.left,
    right: labels.right || DEFAULT_LABELS.right,
  }

  const makeHandlers = (dir: DPadDirection) => ({
    onTouchStart: (e: React.TouchEvent) => {
      lastTouchRef.current = Date.now()
      if (!disabled) {
        onDirection(dir)
      }
    },
    onClick: (e: React.MouseEvent) => {
      // Prevent double-firing on touch screens while responding instantly to mouse clicks
      if (Date.now() - lastTouchRef.current < 450) return
      if (!disabled) {
        onDirection(dir)
      }
    },
  })

  if (variant === 'cross') {
    return (
      <nav
        className={`game-dpad game-dpad--cross ${className}`.trim()}
        aria-label={ariaLabel}
        role="group"
      >
        <button
          type="button"
          id="dpad-up"
          className="game-dpad-btn game-dpad-btn--up"
          {...makeHandlers('up')}
          disabled={disabled}
          aria-label={resolvedLabels.up}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        <button
          type="button"
          id="dpad-left"
          className="game-dpad-btn game-dpad-btn--left"
          {...makeHandlers('left')}
          disabled={disabled}
          aria-label={resolvedLabels.left}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="game-dpad-btn game-dpad-btn--center" aria-hidden="true" />

        <button
          type="button"
          id="dpad-right"
          className="game-dpad-btn game-dpad-btn--right"
          {...makeHandlers('right')}
          disabled={disabled}
          aria-label={resolvedLabels.right}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          type="button"
          id="dpad-down"
          className="game-dpad-btn game-dpad-btn--down"
          {...makeHandlers('down')}
          disabled={disabled}
          aria-label={resolvedLabels.down}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </nav>
    )
  }

  // Compact inverted-T layout (Default)
  return (
    <nav
      className={`game-dpad game-dpad--compact ${className}`.trim()}
      aria-label={ariaLabel}
      role="group"
    >
      <div className="game-dpad-row game-dpad-row--top">
        <button
          type="button"
          id="dpad-up"
          className="game-dpad-btn game-dpad-btn--up"
          {...makeHandlers('up')}
          disabled={disabled}
          aria-label={resolvedLabels.up}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>

      <div className="game-dpad-row game-dpad-row--bottom">
        <button
          type="button"
          id="dpad-left"
          className="game-dpad-btn game-dpad-btn--left"
          {...makeHandlers('left')}
          disabled={disabled}
          aria-label={resolvedLabels.left}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          id="dpad-down"
          className="game-dpad-btn game-dpad-btn--down"
          {...makeHandlers('down')}
          disabled={disabled}
          aria-label={resolvedLabels.down}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <button
          type="button"
          id="dpad-right"
          className="game-dpad-btn game-dpad-btn--right"
          {...makeHandlers('right')}
          disabled={disabled}
          aria-label={resolvedLabels.right}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
export default DPad
