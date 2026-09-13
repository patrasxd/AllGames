import React from 'react'
import './DPad.css'

export type DPadDirection = 'up' | 'down' | 'left' | 'right'

export interface DPadProps {
  onDirection: (direction: DPadDirection) => void
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function DPad({
  onDirection,
  disabled = false,
  className = '',
  ariaLabel = 'Directional Pad',
}: DPadProps) {
  const handlePress = (e: React.MouseEvent | React.TouchEvent, dir: DPadDirection) => {
    e.preventDefault()
    if (!disabled) {
      onDirection(dir)
    }
  }

  return (
    <nav
      className={`game-dpad ${className}`.trim()}
      aria-label={ariaLabel}
      role="group"
    >
      <button
        type="button"
        className="game-dpad-btn game-dpad-btn--up"
        onClick={(e) => handlePress(e, 'up')}
        disabled={disabled}
        aria-label="Up"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      <button
        type="button"
        className="game-dpad-btn game-dpad-btn--left"
        onClick={(e) => handlePress(e, 'left')}
        disabled={disabled}
        aria-label="Left"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="game-dpad-btn game-dpad-btn--center" aria-hidden="true" />

      <button
        type="button"
        className="game-dpad-btn game-dpad-btn--right"
        onClick={(e) => handlePress(e, 'right')}
        disabled={disabled}
        aria-label="Right"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <button
        type="button"
        className="game-dpad-btn game-dpad-btn--down"
        onClick={(e) => handlePress(e, 'down')}
        disabled={disabled}
        aria-label="Down"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </nav>
  )
}
